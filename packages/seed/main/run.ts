import {
  bills,
  tags,
  councilSessions,
  factions,
  committees,
  createFactionStances,
  createBillsTags,
  createInterviewConfig,
  createInterviewQuestions,
  createInterviewSessions,
  createInterviewMessages,
  createInterviewReports,
  createDemoSession,
  createDemoMessages,
  createDemoReport,
  createAdditionalDemoSessions,
  createAdditionalDemoMessages,
  createAdditionalDemoReports,
  DEMO_REPORT_ID,
  DEMO_REPORT_ID_WORK,
  DEMO_REPORT_ID_DAILY,
  DEMO_REPORT_ID_CITIZEN,
} from "./data";
import { createBillContents } from "./bill-contents-data";
import { createBillContentTranslations } from "./bill-translations-data";
import { R8_2_SESSION } from "./shinjuku-r8-2-inventory";
import {
  createShippingBillInterviewConfig,
  createShippingBillQuestions,
  createShippingBillSessions,
  createShippingBillMessages,
  createShippingBillReports,
  createRealisticShippingBillSession,
  createRealisticShippingBillMessages,
  createRealisticShippingBillReport,
  getRealisticShippingBillSourceMessageLinks,
} from "./shipping-bill-data";
import { createAdminClient, clearAllData } from "../shared/helper";

// clearAllData() は shared/helper.ts 側のガードにより、
// ローカル以外への接続では実行前に停止する。
async function seedDatabase() {
  const supabase = createAdminClient();
  console.log("🌱 Starting database seeding...");

  try {
    await clearAllData(supabase);

    // Insert tags
    console.log("🏷️  Inserting tags...");
    const { data: insertedTags, error: tagsError } = await supabase
      .from("tags")
      .insert(tags)
      .select("id, label");

    if (tagsError) {
      throw new Error(`Failed to insert tags: ${tagsError.message}`);
    }

    if (!insertedTags) {
      throw new Error("No tags were inserted");
    }

    console.log(`✅ Inserted ${insertedTags.length} tags`);

    // Insert council sessions
    console.log("🏛️  Inserting council sessions...");
    const { data: insertedCouncilSessions, error: councilSessionsError } =
      await supabase
        .from("council_sessions")
        .insert(councilSessions)
        .select("id, slug");

    if (councilSessionsError) {
      throw new Error(
        `Failed to insert council sessions: ${councilSessionsError.message}`
      );
    }

    if (!insertedCouncilSessions) {
      throw new Error("No council sessions were inserted");
    }

    console.log(
      `✅ Inserted ${insertedCouncilSessions.length} council sessions`
    );

    // Insert committees
    console.log("🏢 Inserting committees...");
    const { data: insertedCommittees, error: committeesError } = await supabase
      .from("committees")
      .insert(committees)
      .select("id, name");

    if (committeesError) {
      throw new Error(
        `Failed to insert committees: ${committeesError.message}`
      );
    }

    if (!insertedCommittees) {
      throw new Error("No committees were inserted");
    }

    console.log(`✅ Inserted ${insertedCommittees.length} committees`);

    // Insert factions
    console.log("🏛️  Inserting factions...");
    const { data: insertedFactions, error: factionsError } = await supabase
      .from("factions")
      .insert(factions)
      .select("id, name");

    if (factionsError) {
      throw new Error(
        `Failed to insert factions: ${factionsError.message}`
      );
    }

    if (!insertedFactions) {
      throw new Error("No factions were inserted");
    }

    console.log(`✅ Inserted ${insertedFactions.length} factions`);

    // Insert bills
    console.log("📄 Inserting bills...");
    const { data: insertedBills, error: billsError } = await supabase
      .from("bills")
      .insert(bills)
      // 関連付けは件名ではなく slug（安定識別子）で突合するため slug を取得する
      .select("id, name, slug");

    if (billsError) {
      throw new Error(`Failed to insert bills: ${billsError.message}`);
    }

    if (!insertedBills) {
      throw new Error("No bills were inserted");
    }

    console.log(`✅ Inserted ${insertedBills.length} bills`);

    // Link all bills to the R8-2 council session.
    // 配列の並び順ではなく slug で会期を特定する。
    const currentSessionId = insertedCouncilSessions.find(
      (s) => s.slug === R8_2_SESSION.slug
    )?.id;
    if (!currentSessionId) {
      throw new Error(
        `Council session not found for slug: ${R8_2_SESSION.slug}`
      );
    }

    const { error: linkError } = await supabase
      .from("bills")
      .update({ council_session_id: currentSessionId })
      .in(
        "id",
        insertedBills.map((b) => b.id)
      );

    if (linkError) {
      throw new Error(
        `Failed to link bills to council session: ${linkError.message}`
      );
    }

    console.log(
      `🔗 Linked ${insertedBills.length} bills to ${R8_2_SESSION.name}`
    );

    // Insert bill_contents
    console.log("📚 Inserting bill contents...");
    const billContents = createBillContents(insertedBills);

    const { data: insertedContents, error: contentsError } = await supabase
      .from("bill_contents")
      .insert(billContents)
      .select("id, bill_id, difficulty_level");

    if (contentsError) {
      throw new Error(
        `Failed to insert bill contents: ${contentsError.message}`
      );
    }

    if (!insertedContents) {
      throw new Error("No bill contents were inserted");
    }

    console.log(`✅ Inserted ${insertedContents.length} bill contents`);

    // Insert bill_content_translations（status=generated のため公開画面には出ない）
    console.log("🌐 Inserting bill content translations...");
    const translations = createBillContentTranslations(
      insertedBills,
      insertedContents
    );

    const { error: translationsError } = await supabase
      .from("bill_content_translations")
      .insert(translations);

    if (translationsError) {
      throw new Error(
        `Failed to insert bill content translations: ${translationsError.message}`
      );
    }

    console.log(`✅ Inserted ${translations.length} bill content translations`);

    // Insert faction_stances
    console.log("🎯 Inserting faction stances...");
    const targetFaction = insertedFactions[0];
    let insertedStancesCount = 0;

    const factionStances = targetFaction
      ? createFactionStances(insertedBills, targetFaction.id)
      : [];

    // 出典のある会派見解が用意できるまで factionStances は空になる。
    // 空配列を insert すると不要なリクエストになるため、その場合は投入をスキップする。
    if (factionStances.length > 0) {
      const { data: insertedStances, error: stancesError } = await supabase
        .from("faction_stances")
        .insert(factionStances)
        .select("id");

      if (stancesError) {
        throw new Error(
          `Failed to insert faction stances: ${stancesError.message}`
        );
      }

      if (insertedStances) {
        insertedStancesCount = insertedStances.length;
      }
    }

    console.log(`✅ Inserted ${insertedStancesCount} faction stances`);

    // Insert bills_tags (関連付け)
    console.log("🔗 Inserting bills-tags relations...");
    const billsTags = createBillsTags(insertedBills, insertedTags);

    const { data: insertedBillsTags, error: billsTagsError } = await supabase
      .from("bills_tags")
      .insert(billsTags)
      .select();

    if (billsTagsError) {
      throw new Error(
        `Failed to insert bills-tags relations: ${billsTagsError.message}`
      );
    }

    if (!insertedBillsTags) {
      throw new Error("No bills-tags relations were inserted");
    }

    console.log(`✅ Inserted ${insertedBillsTags.length} bills-tags relations`);

    // Insert interview config (for first bill)
    console.log("💬 Inserting interview config...");
    const interviewConfigData = createInterviewConfig(insertedBills);
    let insertedQuestionsCount = 0;
    let insertedSessionsCount = 0;
    let insertedMessagesCount = 0;
    let insertedReportsCount = 0;

    if (interviewConfigData) {
      const { data: insertedConfig, error: configError } = await supabase
        .from("interview_configs")
        .insert(interviewConfigData)
        .select("id")
        .single();

      if (configError) {
        throw new Error(
          `Failed to insert interview config: ${configError.message}`
        );
      }

      if (insertedConfig) {
        console.log(`✅ Inserted interview config`);

        // Insert interview questions
        console.log("❓ Inserting interview questions...");
        const questionsData = createInterviewQuestions(insertedConfig.id);

        const { data: insertedQuestions, error: questionsError } =
          await supabase
            .from("interview_questions")
            .insert(questionsData)
            .select("id");

        if (questionsError) {
          throw new Error(
            `Failed to insert interview questions: ${questionsError.message}`
          );
        }

        if (insertedQuestions) {
          insertedQuestionsCount = insertedQuestions.length;
          console.log(
            `✅ Inserted ${insertedQuestionsCount} interview questions`
          );
        }

        // Insert interview sessions
        console.log("🗣️ Inserting interview sessions...");
        const sessionsData = createInterviewSessions(insertedConfig.id);

        const { data: insertedSessions, error: sessionsError } = await supabase
          .from("interview_sessions")
          .insert(sessionsData)
          .select("id");

        if (sessionsError) {
          throw new Error(
            `Failed to insert interview sessions: ${sessionsError.message}`
          );
        }

        if (insertedSessions && insertedSessions.length > 0) {
          insertedSessionsCount = insertedSessions.length;
          console.log(
            `✅ Inserted ${insertedSessionsCount} interview sessions`
          );

          // Insert interview messages
          console.log("💬 Inserting interview messages...");
          const sessionIds = insertedSessions.map((s) => s.id);
          const messagesData = createInterviewMessages(sessionIds);

          const { data: insertedMessages, error: messagesError } =
            await supabase
              .from("interview_messages")
              .insert(messagesData)
              .select("id");

          if (messagesError) {
            throw new Error(
              `Failed to insert interview messages: ${messagesError.message}`
            );
          }

          if (insertedMessages) {
            insertedMessagesCount = insertedMessages.length;
            console.log(
              `✅ Inserted ${insertedMessagesCount} interview messages`
            );
          }

          // Insert interview reports
          console.log("📊 Inserting interview reports...");
          const reportsData = createInterviewReports(sessionIds);

          const { data: insertedReports, error: reportsError } = await supabase
            .from("interview_report")
            .insert(reportsData)
            .select("id");

          if (reportsError) {
            throw new Error(
              `Failed to insert interview reports: ${reportsError.message}`
            );
          }

          if (insertedReports) {
            insertedReportsCount = insertedReports.length;
            console.log(
              `✅ Inserted ${insertedReportsCount} interview reports`
            );
          }

          // Insert demo session, messages, and report with fixed IDs
          console.log("🎯 Inserting demo data with fixed IDs...");

          const demoSession = createDemoSession(insertedConfig.id);
          const { error: demoSessionError } = await supabase
            .from("interview_sessions")
            .insert(demoSession);

          if (demoSessionError) {
            throw new Error(
              `Failed to insert demo session: ${demoSessionError.message}`
            );
          }

          const demoMessages = createDemoMessages();
          const { error: demoMessagesError } = await supabase
            .from("interview_messages")
            .insert(demoMessages);

          if (demoMessagesError) {
            throw new Error(
              `Failed to insert demo messages: ${demoMessagesError.message}`
            );
          }

          const demoReport = createDemoReport();
          const { error: demoReportError } = await supabase
            .from("interview_report")
            .insert(demoReport);

          if (demoReportError) {
            throw new Error(
              `Failed to insert demo report: ${demoReportError.message}`
            );
          }

          console.log(`✅ Inserted demo data`);
          console.log(
            `   Demo report URL: /report/${DEMO_REPORT_ID}/chat-log`
          );

          // Insert additional demo sessions, messages, and reports (for 4 role types)
          console.log(
            "🎭 Inserting additional demo data for all role types..."
          );

          const additionalDemoSessions = createAdditionalDemoSessions(
            insertedConfig.id
          );
          const { error: additionalSessionsError } = await supabase
            .from("interview_sessions")
            .insert(additionalDemoSessions);

          if (additionalSessionsError) {
            throw new Error(
              `Failed to insert additional demo sessions: ${additionalSessionsError.message}`
            );
          }

          const additionalDemoMessages = createAdditionalDemoMessages();
          const { error: additionalMessagesError } = await supabase
            .from("interview_messages")
            .insert(additionalDemoMessages);

          if (additionalMessagesError) {
            throw new Error(
              `Failed to insert additional demo messages: ${additionalMessagesError.message}`
            );
          }

          const additionalDemoReports = createAdditionalDemoReports();
          const { error: additionalReportsError } = await supabase
            .from("interview_report")
            .insert(additionalDemoReports);

          if (additionalReportsError) {
            throw new Error(
              `Failed to insert additional demo reports: ${additionalReportsError.message}`
            );
          }

          console.log(
            `✅ Inserted additional demo data for all 4 role types`
          );
          console.log(
            `   subject_expert: /report/${DEMO_REPORT_ID}/chat-log`
          );
          console.log(
            `   work_related: /report/${DEMO_REPORT_ID_WORK}/chat-log`
          );
          console.log(
            `   daily_life_affected: /report/${DEMO_REPORT_ID_DAILY}/chat-log`
          );
          console.log(
            `   general_citizen: /report/${DEMO_REPORT_ID_CITIZEN}/chat-log`
          );
        }
      }
    } else {
      console.log("⚠️ Skipped interview config (no bills found)");
    }

    // === 船荷証券法案のインタビューデータ（トピック解析テスト用）===
    console.log("🚢 Inserting shipping bill interview data...");
    const shippingConfig = createShippingBillInterviewConfig(insertedBills);
    let shippingSessionsCount = 0;
    let shippingReportsCount = 0;

    if (shippingConfig) {
      const { data: insertedShippingConfig, error: shippingConfigError } =
        await supabase
          .from("interview_configs")
          .insert(shippingConfig)
          .select("id")
          .single();

      if (shippingConfigError) {
        throw new Error(
          `Failed to insert shipping bill config: ${shippingConfigError.message}`
        );
      }

      if (insertedShippingConfig) {
        // Questions
        const shippingQuestions = createShippingBillQuestions(
          insertedShippingConfig.id
        );
        const { error: sqError } = await supabase
          .from("interview_questions")
          .insert(shippingQuestions);
        if (sqError) {
          throw new Error(
            `Failed to insert shipping questions: ${sqError.message}`
          );
        }

        // Sessions (100件)
        const shippingSessions = createShippingBillSessions(
          insertedShippingConfig.id
        );
        const { data: insertedShippingSessions, error: ssError } =
          await supabase
            .from("interview_sessions")
            .insert(shippingSessions)
            .select("id");
        if (ssError) {
          throw new Error(
            `Failed to insert shipping sessions: ${ssError.message}`
          );
        }

        if (insertedShippingSessions) {
          shippingSessionsCount = insertedShippingSessions.length;
          const shippingSessionIds = insertedShippingSessions.map(
            (s) => s.id
          );

          // Messages
          const shippingMessages =
            createShippingBillMessages(shippingSessionIds);
          const { error: smError } = await supabase
            .from("interview_messages")
            .insert(shippingMessages);
          if (smError) {
            throw new Error(
              `Failed to insert shipping messages: ${smError.message}`
            );
          }

          // ユーザーメッセージのIDを取得して source_message_id を紐付け
          const { data: userMessages, error: umError } = await supabase
            .from("interview_messages")
            .select("id, interview_session_id, content")
            .in("interview_session_id", shippingSessionIds)
            .eq("role", "user")
            .neq("content", "賛成です。")
            .neq("content", "反対です。")
            .neq("content", "条件付きで賛成です。")
            .neq("content", "判断が難しいです。")
            .order("created_at", { ascending: true })
            .order("id", { ascending: true });
          if (umError) {
            throw new Error(
              `Failed to fetch user messages: ${umError.message}`
            );
          }

          // セッションID → ユーザーメッセージIDリストのマップを構築
          const sessionMessageMap = new Map<
            string,
            Array<{ id: string; content: string }>
          >();
          for (const msg of userMessages || []) {
            const list = sessionMessageMap.get(msg.interview_session_id) || [];
            list.push({ id: msg.id, content: msg.content });
            sessionMessageMap.set(msg.interview_session_id, list);
          }

          // Reports (100件、各3 opinions) — source_message_id を含む
          const shippingReports = createShippingBillReports(shippingSessionIds);
          for (const report of shippingReports) {
            const msgs = sessionMessageMap.get(
              report.interview_session_id
            );
            if (msgs && Array.isArray(report.opinions)) {
              const opinions = (
                report.opinions as Array<{
                  title: string;
                  content: string;
                  source_message_content?: string;
                  source_message_id?: string;
                }>
              ).map((opinion) => ({ ...opinion }));
              report.opinions = opinions;
              for (let j = 0; j < opinions.length; j++) {
                if (msgs[j]) {
                  opinions[j].source_message_id = msgs[j].id;
                  opinions[j].source_message_content = msgs[j].content;
                }
              }
            }
          }

          const { data: insertedShippingReports, error: srError } =
            await supabase
              .from("interview_report")
              .insert(shippingReports)
              .select("id");
          if (srError) {
            throw new Error(
              `Failed to insert shipping reports: ${srError.message}`
            );
          }

          if (insertedShippingReports) {
            shippingReportsCount = insertedShippingReports.length;
          }
        }

        // --- リアル系インタビュー（back-and-forth が自然な 1 セッション） ---
        console.log("🎤 Inserting realistic shipping bill interview...");
        const realisticSession = createRealisticShippingBillSession(
          insertedShippingConfig.id
        );
        const { data: insertedRealisticSession, error: realisticSessionError } =
          await supabase
            .from("interview_sessions")
            .insert(realisticSession)
            .select("id")
            .single();
        if (realisticSessionError || !insertedRealisticSession) {
          throw new Error(
            `Failed to insert realistic session: ${realisticSessionError?.message}`
          );
        }

        const realisticMessages = createRealisticShippingBillMessages(
          insertedRealisticSession.id
        );
        // 1 回の bulk insert だと全行が同一 created_at になり、return 順も UUID 依存で不定
        // → id + content を返してもらい、後で content で対象を特定する
        const { data: insertedRealisticMessages, error: realisticMessagesError } =
          await supabase
            .from("interview_messages")
            .insert(realisticMessages)
            .select("id, content");
        if (realisticMessagesError || !insertedRealisticMessages) {
          throw new Error(
            `Failed to insert realistic messages: ${realisticMessagesError?.message}`
          );
        }

        // opinions の source_message_id を後付け。
        // content は会話ログ内で一意な前提（リアル seed データ用なので成り立つ）。
        // conversationIndex → 対象 content → inserted row.id という経路で特定する。
        // 未解決は seed データ不整合なので fail fast させる（silent に進むと
        // interview_report.opinions.source_message_id が欠落した状態で投入される）。
        const realisticReport = createRealisticShippingBillReport(
          insertedRealisticSession.id
        );
        const links = getRealisticShippingBillSourceMessageLinks();
        if (!Array.isArray(realisticReport.opinions)) {
          throw new Error(
            "Realistic report opinions must be an array to wire source_message_id"
          );
        }
        const opinions = realisticReport.opinions as Array<{
          title: string;
          content: string;
          source_message_id?: string;
          source_message_content?: string;
        }>;
        const contentToId = new Map(
          insertedRealisticMessages.map((m) => [m.content, m.id])
        );
        for (const { conversationIndex, opinionIndex } of links) {
          const msgContent = realisticMessages[conversationIndex]?.content;
          if (!msgContent) {
            throw new Error(
              `Realistic seed: conversationIndex ${conversationIndex} out of range`
            );
          }
          const msgId = contentToId.get(msgContent);
          if (!msgId) {
            throw new Error(
              `Realistic seed: failed to resolve inserted message for conversationIndex=${conversationIndex}`
            );
          }
          const opinion = opinions[opinionIndex];
          if (!opinion) {
            throw new Error(
              `Realistic seed: opinionIndex ${opinionIndex} out of range`
            );
          }
          opinion.source_message_id = msgId;
          opinion.source_message_content = msgContent;
        }
        const { error: realisticReportError } = await supabase
          .from("interview_report")
          .insert(realisticReport);
        if (realisticReportError) {
          throw new Error(
            `Failed to insert realistic report: ${realisticReportError.message}`
          );
        }

        console.log(
          `✅ Shipping bill: ${shippingSessionsCount} sessions (+1 realistic), ${shippingReportsCount} reports (each with 3 opinions) + 1 realistic report`
        );
      } else {
        console.log(
          `✅ Shipping bill: ${shippingSessionsCount} sessions, ${shippingReportsCount} reports (each with 3 opinions)`
        );
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  Council Sessions: ${insertedCouncilSessions.length}`);
    console.log(`  Committees: ${insertedCommittees.length}`);
    console.log(`  Factions: ${insertedFactions.length}`);
    console.log(`  Tags: ${insertedTags.length}`);
    console.log(`  Bills: ${insertedBills.length}`);
    console.log(`  Bill Contents: ${insertedContents.length}`);
    console.log(`  Faction Stances: ${insertedStancesCount}`);
    console.log(`  Bills-Tags Relations: ${insertedBillsTags.length}`);
    console.log(`  Interview Config: ${interviewConfigData ? 1 : 0}`);
    console.log(`  Interview Questions: ${insertedQuestionsCount}`);
    console.log(`  Interview Sessions: ${insertedSessionsCount}`);
    console.log(`  Interview Messages: ${insertedMessagesCount}`);
    console.log(`  Interview Reports: ${insertedReportsCount}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
