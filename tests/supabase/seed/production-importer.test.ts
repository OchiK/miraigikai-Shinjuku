import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  billContentsWithBillSlug,
  createBillContents,
} from "../../../packages/seed/main/bill-contents-data";
import type { SeededBillRef } from "../../../packages/seed/main/bill-ref";
import {
  committees,
  createBillsTags,
  factions,
  tags,
} from "../../../packages/seed/main/data";
import { councilMembers } from "../../../packages/seed/main/shinjuku-council-members";
import {
  councilMemberQuestions,
  toCouncilMemberQuestionImportRows,
} from "../../../packages/seed/main/shinjuku-council-questions";
import {
  r8_2BillVotes,
  toFactionStanceImportRows,
} from "../../../packages/seed/main/shinjuku-faction-stances";
import {
  R8_2_SESSION,
  r8SecondSessionItems,
  toBillInserts,
} from "../../../packages/seed/main/shinjuku-r8-2-inventory";
import type { ImportDataset } from "../../../packages/seed/production/importer";
import { importInventory } from "../../../packages/seed/production/importer";
import { adminClient, cleanupTestUser, createTestUser } from "../utils";

/**
 * 本番用インポーターを、実際のローカル Supabase に対して検証する。
 *
 * 押さえる点:
 *   1. 初回インポートで全27案件（区長提出23件＋議員提出4件）・81変種（27件×3段）が投入されること
 *   2. 2回目以降も bills.id が変わらないこと（詳細ページURLと
 *      interview_configs の CASCADE を守るため、ここが最重要）
 *   3. 利用者データ（interview_sessions / interview_report）が消えないこと
 *   4. 解説の更新が同一の (bill_id, difficulty_level) に当たること
 *   5. インベントリ外の議案を削除せず、報告だけ行うこと
 *   6. 議員の質問要約が投入され、再インポートでも id が変わらず削除もされないこと
 *   7. 会派の賛否が投入され、再インポートで comment を消さず、削除もしないこと
 *
 * seed 済みのデータや他テストと衝突しないよう、実行ごとに一意な接頭辞を
 * 付けた複製インベントリ（ImportDataset）を流し込む。変換ロジックそのものは
 * 本番と同じ関数を通す。
 */

const runId = `itest-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const sessionSlug = `${runId}-${R8_2_SESSION.slug}`;

/**
 * 接頭辞を付けた複製インベントリを組み立てる。
 * 変換ロジックは本番と同じ関数を通し、識別子だけを名前空間で隔離する。
 */
function buildDataset(idPrefix: string): ImportDataset {
  const prefixed = (value: string) => `${idPrefix}-${value}`;
  const stripped = (value: string) => value.replace(`${idPrefix}-`, "");

  /** 接頭辞付きの slug を元に戻し、本番の生成関数へそのまま渡せるようにする */
  const toInventoryRefs = (bills: SeededBillRef[]): SeededBillRef[] =>
    bills.map((bill) => ({
      ...bill,
      slug: bill.slug ? stripped(bill.slug) : null,
    }));

  const prefixedCommittees = committees.map((committee) => ({
    ...committee,
    name: prefixed(committee.name),
  }));
  const prefixedFactions = factions.map((faction) => ({
    ...faction,
    name: prefixed(faction.name),
    display_name: prefixed(faction.display_name),
  }));
  const prefixedCouncilMembers = councilMembers.map((member) => ({
    ...member,
    name: prefixed(member.name),
    faction: prefixed(member.faction),
    committees: Object.fromEntries(
      Object.entries(member.committees).map(([name, role]) => [
        prefixed(name),
        role,
      ])
    ),
  }));

  return {
    councilSessions: [
      {
        ...R8_2_SESSION,
        name: `テスト ${R8_2_SESSION.name} ${idPrefix}`,
        slug: prefixed(R8_2_SESSION.slug as string),
        // seed 済みの会期と「現在の会期」を取り合わないようにする
        is_active: false,
      },
    ],
    billSessionSlug: prefixed(R8_2_SESSION.slug as string),
    tags: tags.map((tag) => ({ ...tag, label: prefixed(tag.label) })),
    factions: prefixedFactions,
    committees: prefixedCommittees,
    councilRosterKey: idPrefix,
    councilRosterUrl: `https://example.com/council-roster/${idPrefix}`,
    councilMembers: prefixedCouncilMembers,
    // 複製インベントリの会期は R8-2 だけなので、それ以外の会期の質問は
    // 会期ページに紐づけない（本番の以前の定例会と同じ扱い）
    councilMemberQuestions: toCouncilMemberQuestionImportRows(
      councilMemberQuestions,
      councilMembers
    ).map((row) => ({
      ...row,
      member_name: prefixed(row.member_name),
      session_slug:
        row.session_slug === R8_2_SESSION.slug
          ? prefixed(row.session_slug)
          : null,
    })),
    // 採決時の会派名は本番の会派で解決してから、自然キーだけ名前空間に入れる
    factionStances: toFactionStanceImportRows(r8_2BillVotes, factions).map(
      (row) => ({
        ...row,
        bill_slug: prefixed(row.bill_slug),
        faction_name: prefixed(row.faction_name),
      })
    ),
    // bill_number は会期単位で一意なため、テスト会期の中では接頭辞が要らない
    bills: toBillInserts().map((bill) => ({
      ...bill,
      slug: prefixed(bill.slug as string),
    })),
    createBillContents: (bills) => createBillContents(toInventoryRefs(bills)),
    createBillsTags: (bills, tagRefs) =>
      createBillsTags(
        toInventoryRefs(bills),
        tagRefs.map((tag) => ({ ...tag, label: stripped(tag.label) }))
      ),
  };
}

const dataset = buildDataset(runId);

const runImport = (dryRun = false) =>
  importInventory(adminClient, { dryRun, dataset });

const fetchBills = async () => {
  const { data, error } = await adminClient
    .from("bills")
    .select("id, slug, name, bill_number, publish_status, published_at")
    .eq("council_session_id", sessionId);
  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchContents = async (billIds: string[]) => {
  const { data, error } = await adminClient
    .from("bill_contents")
    .select("id, bill_id, difficulty_level, title, content")
    .in("bill_id", billIds);
  if (error) throw new Error(error.message);
  return data ?? [];
};

let sessionId: string;
/** 利用者データ層が消えないことを確かめるための、テスト専用の実データ */
let userData: {
  userId: string;
  billId: string;
  configId: string;
  interviewSessionId: string;
  reportId: string;
};

describe("本番用インポーター", () => {
  beforeAll(async () => {
    await runImport();

    const { data, error } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", sessionSlug)
      .single();
    if (error) throw new Error(`会期の取得に失敗: ${error.message}`);
    sessionId = data.id;

    // 議案にぶら下がる利用者データを作る。
    // bills を削除して作り直す実装だと、ここが CASCADE で消える。
    const bills = await fetchBills();
    const billId = bills[0]?.id;
    if (!billId) throw new Error("議案が投入されていない");

    const { data: config, error: configError } = await adminClient
      .from("interview_configs")
      .insert({
        bill_id: billId,
        status: "public",
        name: `テスト設定 ${runId}`,
      })
      .select("id")
      .single();
    if (configError) throw new Error(configError.message);

    const testUser = await createTestUser(`test-import-${runId}@example.com`);

    const { data: interviewSession, error: sessionError } = await adminClient
      .from("interview_sessions")
      .insert({
        interview_config_id: config.id,
        user_id: testUser.id,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (sessionError) throw new Error(sessionError.message);

    const { data: report, error: reportError } = await adminClient
      .from("interview_report")
      .insert({
        interview_session_id: interviewSession.id,
        summary: `テストレポート ${runId}`,
      })
      .select("id")
      .single();
    if (reportError) throw new Error(reportError.message);

    userData = {
      userId: testUser.id,
      billId,
      configId: config.id,
      interviewSessionId: interviewSession.id,
      reportId: report.id,
    };
  });

  afterAll(async () => {
    // beforeAll が途中で失敗した場合、sessionId は未設定のままになる。
    // undefined で削除条件を組むとテストデータがローカルDBに残るため、
    // slug（runId 付き）を起点に掃除する。
    if (sessionId) {
      // bills の削除で interview_configs 以下は CASCADE で落ちる
      await adminClient
        .from("bills")
        .delete()
        .eq("council_session_id", sessionId);
    }
    await adminClient.from("council_sessions").delete().eq("slug", sessionSlug);
    await adminClient
      .from("tags")
      .delete()
      .in(
        "label",
        dataset.tags.map((tag) => tag.label)
      );
    await adminClient
      .from("council_members")
      .delete()
      .in(
        "name",
        dataset.councilMembers.map((member) => member.name)
      );
    await adminClient
      .from("committees")
      .delete()
      .in(
        "name",
        dataset.committees.map((committee) => committee.name)
      );
    await adminClient
      .from("factions")
      .delete()
      .in(
        "name",
        dataset.factions.map((faction) => faction.name)
      );
    if (userData?.userId) await cleanupTestUser(userData.userId);
  });

  it("初回インポートで全27案件・81変種が投入される", async () => {
    const bills = await fetchBills();
    expect(bills).toHaveLength(r8SecondSessionItems.length);
    expect(bills).toHaveLength(27);

    const contents = await fetchContents(bills.map((b) => b.id));
    expect(contents).toHaveLength(billContentsWithBillSlug.length);
    expect(contents).toHaveLength(81);
  });

  it("初回インポートで議員38名と委員会所属87件を投入する", async () => {
    const memberNames = dataset.councilMembers.map((member) => member.name);
    const { data: members, error: membersError } = await adminClient
      .from("council_members")
      .select("id, name")
      .in("name", memberNames);
    if (membersError) throw new Error(membersError.message);
    expect(members).toHaveLength(38);

    const { count, error: linksError } = await adminClient
      .from("council_member_committees")
      .select("id, council_members!inner(name)", {
        count: "exact",
        head: true,
      })
      .in("council_members.name", memberNames);
    if (linksError) throw new Error(linksError.message);
    expect(count).toBe(87);
  });

  it("初回インポートで質問要約124件を投入し、会期ページがある会期だけ紐づける", async () => {
    const memberNames = dataset.councilMembers.map((member) => member.name);
    const { data, error } = await adminClient
      .from("council_member_questions")
      .select("council_session_id, session_name, council_members!inner(name)")
      .in("council_members.name", memberNames);
    if (error) throw new Error(error.message);

    expect(data).toHaveLength(124);
    const r8Second = (data ?? []).filter(
      (row) => row.session_name === "令和8年 第2回定例会"
    );
    expect(r8Second.length).toBeGreaterThan(0);
    expect(r8Second.every((row) => row.council_session_id === sessionId)).toBe(
      true
    );
    expect(
      (data ?? [])
        .filter((row) => row.session_name !== "令和8年 第2回定例会")
        .every((row) => row.council_session_id === null)
    ).toBe(true);
  });

  it("再インポートしても質問要約の id が変わらず、要約の更新は同じ行に当たる", async () => {
    const target = dataset.councilMemberQuestions[0];
    if (!target) throw new Error("質問データがない");
    const fetchTarget = async () => {
      const { data, error } = await adminClient
        .from("council_member_questions")
        .select("id, summary, council_members!inner(name)")
        .eq("council_members.name", target.member_name)
        .eq("source_url", target.source_url)
        .single();
      if (error) throw new Error(error.message);
      return data;
    };

    const before = await fetchTarget();
    const { error: updateError } = await adminClient
      .from("council_member_questions")
      .update({ summary: "手で書き換えた要約" })
      .eq("id", before.id);
    if (updateError) throw new Error(updateError.message);

    const report = await runImport();
    const questionsDiff = report.tables.find(
      (table) => table.table === "council_member_questions"
    );
    expect(questionsDiff?.updated.map((row) => row.key)).toEqual([
      `${target.member_name}::${target.source_url}`,
    ]);

    const after = await fetchTarget();
    expect(after.id).toBe(before.id);
    expect(after.summary).toBe(target.summary);
  });

  it("インベントリから外れた質問要約を削除せず、インベントリ外として報告する", async () => {
    const [removed, ...rest] = dataset.councilMemberQuestions;
    if (!removed) throw new Error("質問データがない");

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: { ...dataset, councilMemberQuestions: rest },
    });
    const questionsDiff = report.tables.find(
      (table) => table.table === "council_member_questions"
    );
    expect(questionsDiff?.extraneous).toEqual([
      `${removed.member_name}::${removed.source_url}`,
    ]);

    const { data: survived } = await adminClient
      .from("council_member_questions")
      .select("id, council_members!inner(name)")
      .eq("council_members.name", removed.member_name)
      .eq("source_url", removed.source_url)
      .maybeSingle();
    expect(survived?.id).toBeDefined();
  });

  const fetchStances = async () => {
    const bills = await fetchBills();
    const { data, error } = await adminClient
      .from("faction_stances")
      .select(
        "id, type, comment, faction_name_at_vote, bill_id, factions(name)"
      )
      .in(
        "bill_id",
        bills.map((bill) => bill.id)
      );
    if (error) throw new Error(error.message);
    return data ?? [];
  };

  it("初回インポートで会派の賛否216件を、採決時の会派名つきで投入する", async () => {
    const stances = await fetchStances();
    expect(stances).toHaveLength(216);
    expect(stances.filter((row) => row.type === "against")).toHaveLength(16);
    const inochi = stances.filter(
      (row) => row.factions?.name === `${runId}-inochi`
    );
    expect(inochi).toHaveLength(27);
    expect(
      inochi.every((row) => row.faction_name_at_vote === "れいわ新選組 新宿")
    ).toBe(true);
  });

  it("再インポートで賛否を戻しても同じ行に当たり、管理画面の comment は消さない", async () => {
    const target = dataset.factionStances[0];
    if (!target) throw new Error("賛否データがない");
    const [bill] = (await fetchBills()).filter(
      (row) => row.slug === target.bill_slug
    );
    const findTarget = async () =>
      (await fetchStances()).find(
        (row) =>
          row.bill_id === bill?.id && row.factions?.name === target.faction_name
      );

    const before = await findTarget();
    if (!before) throw new Error("投入済みの賛否がない");
    const { error: updateError } = await adminClient
      .from("faction_stances")
      .update({ type: "against", comment: "管理画面で書いた見解" })
      .eq("id", before.id);
    if (updateError) throw new Error(updateError.message);

    const report = await runImport();
    const stancesDiff = report.tables.find(
      (table) => table.table === "faction_stances"
    );
    expect(stancesDiff?.updated.map((row) => row.key)).toEqual([
      `${target.bill_slug}::${target.faction_name}`,
    ]);

    const after = await findTarget();
    expect(after?.id).toBe(before.id);
    expect(after?.type).toBe(target.type);
    expect(after?.comment).toBe("管理画面で書いた見解");
  });

  it("インベントリから外れた賛否を削除せず、インベントリ外として報告する", async () => {
    const [removed, ...rest] = dataset.factionStances;
    if (!removed) throw new Error("賛否データがない");

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: { ...dataset, factionStances: rest },
    });
    const stancesDiff = report.tables.find(
      (table) => table.table === "faction_stances"
    );
    expect(stancesDiff?.extraneous).toEqual([
      `${removed.bill_slug}::${removed.faction_name}`,
    ]);
    expect(await fetchStances()).toHaveLength(216);
  });

  it("管理画面で切り替えた注目設定を、再インポートで上書きしない", async () => {
    const bills = await fetchBills();
    const target = bills[0];
    if (!target) throw new Error("議案が投入されていない");
    const inventoryFeatured =
      dataset.bills.find((bill) => bill.slug === target.slug)?.is_featured ??
      false;

    const { error: updateError } = await adminClient
      .from("bills")
      .update({ is_featured: !inventoryFeatured })
      .eq("id", target.id);
    if (updateError) throw new Error(updateError.message);

    // 差分が無いと RPC 自体が呼ばれないため、質問要約を1件崩して書き込みを発生させる
    const question = dataset.councilMemberQuestions[0];
    if (!question) throw new Error("質問データがない");
    const { data: questionRow, error: questionError } = await adminClient
      .from("council_member_questions")
      .select("id, council_members!inner(name)")
      .eq("council_members.name", question.member_name)
      .eq("source_url", question.source_url)
      .single();
    if (questionError) throw new Error(questionError.message);
    const { error: touchError } = await adminClient
      .from("council_member_questions")
      .update({ summary: "書き込みを発生させるための変更" })
      .eq("id", questionRow.id);
    if (touchError) throw new Error(touchError.message);

    const report = await runImport();
    const billsDiff = report.tables.find((table) => table.table === "bills");
    expect(billsDiff?.updated).toEqual([]);
    const questionsDiff = report.tables.find(
      (table) => table.table === "council_member_questions"
    );
    expect(questionsDiff?.updated).toHaveLength(1);

    const { data, error } = await adminClient
      .from("bills")
      .select("is_featured")
      .eq("id", target.id)
      .single();
    if (error) throw new Error(error.message);
    expect(data.is_featured).toBe(!inventoryFeatured);

    // 後続テストのためにインベントリの値へ戻す
    const { error: restoreError } = await adminClient
      .from("bills")
      .update({ is_featured: inventoryFeatured })
      .eq("id", target.id);
    if (restoreError) throw new Error(restoreError.message);
  });

  it("再インポートしても council_members.id が変わらない", async () => {
    const memberNames = dataset.councilMembers.map((member) => member.name);
    const fetchMembers = async () => {
      const { data, error } = await adminClient
        .from("council_members")
        .select("id, name")
        .in("name", memberNames)
        .order("name");
      if (error) throw new Error(error.message);
      return data ?? [];
    };

    const before = await fetchMembers();
    await runImport();
    expect(await fetchMembers()).toEqual(before);
  });

  it("名簿から外れた議員を削除せず非現職にする", async () => {
    const removed = dataset.councilMembers[0];
    if (!removed) throw new Error("議員データがない");

    const { data: before, error: beforeError } = await adminClient
      .from("council_members")
      .select("id")
      .eq("name", removed.name)
      .single();
    if (beforeError) throw new Error(beforeError.message);

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: {
        ...dataset,
        councilRosterUrl: `${dataset.councilRosterUrl}/moved`,
        councilMembers: dataset.councilMembers.slice(1),
      },
    });

    const memberDiff = report.tables.find(
      (table) => table.table === "council_members"
    );
    expect(memberDiff?.updated).toContainEqual(
      expect.objectContaining({
        key: removed.name,
        changes: expect.arrayContaining([
          { field: "is_active", before: true, after: false },
        ]),
      })
    );

    const { data: after, error: afterError } = await adminClient
      .from("council_members")
      .select("id, is_active")
      .eq("name", removed.name)
      .single();
    if (afterError) throw new Error(afterError.message);
    expect(after).toEqual({ id: before.id, is_active: false });

    await runImport();
  });

  it("名簿から外れた委員会所属をトランザクション内で取り除く", async () => {
    const target = dataset.councilMembers.find(
      (member) => Object.keys(member.committees).length >= 2
    );
    if (!target) throw new Error("複数の委員会に所属する議員がいない");
    const [removedCommittee] = Object.keys(target.committees);
    if (!removedCommittee) throw new Error("委員会データがない");
    const remainingCommittees = Object.fromEntries(
      Object.entries(target.committees).filter(
        ([committee]) => committee !== removedCommittee
      )
    );

    const report = await importInventory(adminClient, {
      dryRun: false,
      dataset: {
        ...dataset,
        councilMembers: dataset.councilMembers.map((member) =>
          member.name === target.name
            ? { ...member, committees: remainingCommittees }
            : member
        ),
      },
    });

    const linksDiff = report.tables.find(
      (table) => table.table === "council_member_committees"
    );
    expect(linksDiff?.extraneous).toContain(
      `${target.name}::${removedCommittee}`
    );

    const { data: links, error } = await adminClient
      .from("council_member_committees")
      .select("committees!inner(name), council_members!inner(name)")
      .eq("council_members.name", target.name);
    if (error) throw new Error(error.message);
    expect((links ?? []).map((link) => link.committees.name).sort()).toEqual(
      Object.keys(remainingCommittees).sort()
    );

    await runImport();
  });

  it("再インポートしても bills.id が 1 件も変わらない", async () => {
    const before = await fetchBills();
    await runImport();
    const after = await fetchBills();

    expect(after).toHaveLength(27);

    const idBySlug = (rows: typeof before) =>
      Object.fromEntries(rows.map((b) => [b.slug, b.id]));
    expect(idBySlug(after)).toEqual(idBySlug(before));
  });

  it("再インポートしても利用者データが削除・変更されない", async () => {
    await runImport();

    const { data: config } = await adminClient
      .from("interview_configs")
      .select("id, bill_id")
      .eq("id", userData.configId)
      .maybeSingle();
    expect(config).toMatchObject({
      id: userData.configId,
      bill_id: userData.billId,
    });

    const { data: interviewSession } = await adminClient
      .from("interview_sessions")
      .select("id, interview_config_id")
      .eq("id", userData.interviewSessionId)
      .maybeSingle();
    expect(interviewSession).toMatchObject({
      id: userData.interviewSessionId,
      interview_config_id: userData.configId,
    });

    const { data: report } = await adminClient
      .from("interview_report")
      .select("id, summary")
      .eq("id", userData.reportId)
      .maybeSingle();
    expect(report).toMatchObject({
      id: userData.reportId,
      summary: `テストレポート ${runId}`,
    });
  });

  it("解説の更新は同一の (bill_id, difficulty_level) に当たる", async () => {
    const bills = await fetchBills();
    const before = await fetchContents(bills.map((b) => b.id));
    const target = before[0];
    if (!target) throw new Error("解説が投入されていない");

    await adminClient
      .from("bill_contents")
      .update({ title: `書き換え ${runId}` })
      .eq("id", target.id);

    await runImport();

    const { data: restored, error } = await adminClient
      .from("bill_contents")
      .select("id, title, content")
      .eq("bill_id", target.bill_id)
      .eq("difficulty_level", target.difficulty_level)
      .single();
    if (error) throw new Error(error.message);

    // 新しい行が増えるのではなく、同じ行が書き戻される
    expect(restored.id).toBe(target.id);
    expect(restored.title).toBe(target.title);

    const after = await fetchContents(bills.map((b) => b.id));
    expect(after).toHaveLength(before.length);
  });

  it("インベントリ外の議案を削除せず、インベントリ外として報告する", async () => {
    const { data: dummy, error } = await adminClient
      .from("bills")
      .insert({
        name: `インベントリ外のダミー議案 ${runId}`,
        bill_number: `${runId}-dummy`,
        slug: `${runId}-dummy-bill`,
        status: "submitted",
        publish_status: "draft",
        council_session_id: sessionId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const report = await runImport();
    const billsDiff = report.tables.find((t) => t.table === "bills");

    expect(billsDiff?.extraneous).toContain(`${runId}-dummy-bill`);

    const { data: survived } = await adminClient
      .from("bills")
      .select("id")
      .eq("id", dummy.id)
      .maybeSingle();
    expect(survived?.id).toBe(dummy.id);

    await adminClient.from("bills").delete().eq("id", dummy.id);
  });

  it("タグ紐付が過不足なく投入され、再インポートでも増減しない", async () => {
    const bills = await fetchBills();
    const billIds = bills.map((b) => b.id);

    const fetchBillsTags = async () => {
      const { data, error } = await adminClient
        .from("bills_tags")
        .select("bill_id, tag_id")
        .in("bill_id", billIds);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => `${row.bill_id}::${row.tag_id}`).sort();
    };

    const before = await fetchBillsTags();
    // インベントリは区長提出議案23件すべてに分類を付けている（議員提出議案4件はまだ付けていない）
    expect(before).toHaveLength(23);

    await runImport();
    expect(await fetchBillsTags()).toEqual(before);
  });

  it("運用側で足したタグ紐付を削除せず、インベントリ外として報告する", async () => {
    const bills = await fetchBills();
    const target = bills[0];
    if (!target) throw new Error("議案が投入されていない");

    const { data: extraTag, error: tagError } = await adminClient
      .from("tags")
      .insert({ label: `${runId}-運用で足したタグ` })
      .select("id, label")
      .single();
    if (tagError) throw new Error(tagError.message);

    await adminClient
      .from("bills_tags")
      .insert({ bill_id: target.id, tag_id: extraTag.id });

    const report = await runImport();
    const diff = report.tables.find((t) => t.table === "bills_tags");
    expect(diff?.extraneous).toContain(`${target.slug}::${extraTag.label}`);

    const { data: survived } = await adminClient
      .from("bills_tags")
      .select("tag_id")
      .eq("bill_id", target.id)
      .eq("tag_id", extraTag.id)
      .maybeSingle();
    expect(survived?.tag_id).toBe(extraTag.id);

    // タグ本体はインベントリの管理対象外なので報告に出さない
    const tagDiff = report.tables.find((t) => t.table === "tags");
    expect(tagDiff?.extraneous).toEqual([]);

    await adminClient
      .from("bills_tags")
      .delete()
      .eq("bill_id", target.id)
      .eq("tag_id", extraTag.id);
    await adminClient.from("tags").delete().eq("id", extraTag.id);
  });

  it("インベントリから外れた解説変種を削除せず、インベントリ外として報告する", async () => {
    // インベントリは全議案に easy/normal/hard の3変種を持つ。
    // 1変種を取り下げたインベントリを dry-run で流し、
    // DBに残った変種が「インベントリ外」として報告されることを確かめる。
    const bills = await fetchBills();
    const target = bills[0];
    if (!target?.slug) throw new Error("議案が投入されていない");

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: {
        ...dataset,
        createBillContents: (billRefs) =>
          dataset.createBillContents(billRefs).filter((content) => {
            // 差分計算では bill_id に slug が入り、書き込み時は id が入る
            const isTarget =
              content.bill_id === target.slug || content.bill_id === target.id;
            return !(isTarget && content.difficulty_level === "hard");
          }),
      },
    });

    const diff = report.tables.find((t) => t.table === "bill_contents");
    expect(diff?.extraneous).toContain(`${target.slug}::hard`);

    // 報告だけで、DBの変種は消えていない
    const { data: survived } = await adminClient
      .from("bill_contents")
      .select("id")
      .eq("bill_id", target.id)
      .eq("difficulty_level", "hard")
      .maybeSingle();
    expect(survived?.id).toBeDefined();
  });

  it("会期が未作成でも dry-run は例外なく全件を新規として報告する", async () => {
    // billSessionId が null になる経路（会期が未作成）を通す
    const unseen = buildDataset(`${runId}-alt`);

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: unseen,
    });

    const byTable = (table: string) =>
      report.tables.find((t) => t.table === table);
    expect(byTable("council_sessions")?.created).toEqual([
      unseen.billSessionSlug,
    ]);
    expect(byTable("factions")?.created).toHaveLength(9);
    expect(byTable("committees")?.created).toHaveLength(9);
    expect(byTable("council_members")?.created).toHaveLength(38);
    expect(byTable("council_member_committees")?.created).toHaveLength(87);
    expect(byTable("council_member_questions")?.created).toHaveLength(124);
    expect(byTable("bills")?.created).toHaveLength(27);
    expect(byTable("bill_contents")?.created).toHaveLength(81);
    expect(byTable("bills_tags")?.created).toHaveLength(23); // 議員提出議案4件にはまだ分類タグを付けていない

    // dry-run なので会期も議案も作られていない
    const { data: created } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", unseen.billSessionSlug)
      .maybeSingle();
    expect(created).toBeNull();
  });

  it("会期が未作成で既存議案が別会期にある場合、紐付け変更を dry-run で報告する", async () => {
    const unseenSession = buildDataset(`${runId}-move-session`);
    const reassignmentDataset: ImportDataset = {
      ...dataset,
      councilSessions: unseenSession.councilSessions,
      billSessionSlug: unseenSession.billSessionSlug,
      // 質問要約も新しい会期に寄せる（投入対象にない会期は dry-run でも拒否される）
      councilMemberQuestions: dataset.councilMemberQuestions.map((row) => ({
        ...row,
        session_slug: row.session_slug && unseenSession.billSessionSlug,
      })),
    };

    const report = await importInventory(adminClient, {
      dryRun: true,
      dataset: reassignmentDataset,
    });

    const billsDiff = report.tables.find((table) => table.table === "bills");
    expect(billsDiff?.updated).toHaveLength(27);
    for (const row of billsDiff?.updated ?? []) {
      expect(row.changes).toContainEqual({
        field: "council_session_id",
        before: sessionId,
        after: `slug:${unseenSession.billSessionSlug}`,
      });
    }

    const bills = await fetchBills();
    expect(bills).toHaveLength(27);
  });

  it("dry-run は DB へ書き込まず、差分だけを返す", async () => {
    const bills = await fetchBills();
    const target = bills[0];
    if (!target) throw new Error("議案が投入されていない");

    await adminClient
      .from("bills")
      .update({ publish_status: "draft" })
      .eq("id", target.id);

    const report = await runImport(true);
    expect(report.dryRun).toBe(true);

    const billsDiff = report.tables.find((t) => t.table === "bills");
    const change = billsDiff?.updated.find((row) => row.key === target.slug);
    expect(change?.changes).toContainEqual({
      field: "publish_status",
      before: "draft",
      after: target.publish_status,
    });

    // dry-run 後もDBは書き換わっていない
    const { data: untouched } = await adminClient
      .from("bills")
      .select("publish_status")
      .eq("id", target.id)
      .single();
    expect(untouched?.publish_status).toBe("draft");

    // 後続テストのために本来の状態へ戻す
    await runImport();
  });

  it("差分が無い状態で流すと新規も更新も 0 になる（冪等）", async () => {
    await runImport();
    const billsBefore = await fetchBills();
    const billIds = billsBefore.map((bill) => bill.id);
    const { data: timestampsBefore, error: beforeError } = await adminClient
      .from("bill_contents")
      .select("id, updated_at")
      .in("bill_id", billIds)
      .order("id");
    if (beforeError) throw new Error(beforeError.message);

    await runImport();

    const { data: timestampsAfter, error: afterError } = await adminClient
      .from("bill_contents")
      .select("id, updated_at")
      .in("bill_id", billIds)
      .order("id");
    if (afterError) throw new Error(afterError.message);
    expect(timestampsAfter).toEqual(timestampsBefore);

    const report = await runImport(true);

    for (const table of report.tables) {
      expect({
        table: table.table,
        created: table.created,
        updated: table.updated,
      }).toEqual({ table: table.table, created: [], updated: [] });
    }
  });
});
