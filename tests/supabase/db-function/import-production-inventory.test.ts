import { afterAll, describe, expect, it } from "vitest";
import { adminClient } from "../utils";

const runId = `itest-production-rpc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const sessionSlug = `${runId}-session`;
const billSlug = `${runId}-bill`;
const factionName = `${runId}-faction`;
const committeeName = `${runId}-committee`;
const memberName = `${runId}-member`;
const rosterKey = `${runId}-roster`;
const rosterUrl = `https://example.com/council-roster/${runId}`;

describe("import_production_inventory", () => {
  afterAll(async () => {
    await adminClient.from("bills").delete().eq("slug", billSlug);
    await adminClient.from("council_sessions").delete().eq("slug", sessionSlug);
  });

  it("後続データが不正な場合、先に行った upsert もロールバックする", async () => {
    const { error } = await adminClient.rpc("import_production_inventory", {
      p_council_sessions: [
        {
          name: `トランザクションテスト ${runId}`,
          slug: sessionSlug,
          council_url: null,
          start_date: "2026-09-19",
          end_date: null,
          is_active: false,
        },
      ],
      p_tags: [],
      p_bills: [
        {
          name: `トランザクションテスト議案 ${runId}`,
          bill_number: `${runId}-1`,
          slug: billSlug,
          status: "submitted",
          status_note: null,
          publish_status: "draft",
          published_at: null,
          is_featured: false,
          is_review_completed: false,
          thumbnail_url: null,
          pdf_url: null,
          overview_pdf_url: null,
          source_page_url: null,
          decision_source_url: null,
        },
      ],
      p_bill_contents: [
        {
          bill_slug: billSlug,
          difficulty_level: "normal",
          title: "ロールバックテスト",
          summary: "ロールバックテスト",
          content: "ロールバックテスト",
        },
      ],
      p_bills_tags: [],
      p_bill_session_slug: sessionSlug,
      p_factions: [
        {
          name: factionName,
          display_name: `テスト会派 ${runId}`,
          alternative_names: [],
          logo_url: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_committees: [
        {
          name: committeeName,
          description: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_members: [
        {
          name: memberName,
          name_kana: `${runId}-member-kana`,
          faction_name: factionName,
          faction_role: null,
          roster_key: rosterKey,
          official_url: rosterUrl,
          website_url: null,
          terms: 1,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_member_committees: [
        {
          member_name: memberName,
          committee_name: `${runId}-unknown-committee`,
          role: "委員",
        },
      ],
      p_council_roster_key: rosterKey,
    });

    expect(error?.message).toContain(
      "one or more council-member committee links reference an unknown natural key"
    );

    const { data: session, error: sessionError } = await adminClient
      .from("council_sessions")
      .select("id")
      .eq("slug", sessionSlug)
      .maybeSingle();
    if (sessionError) throw new Error(sessionError.message);

    const { data: bill, error: billError } = await adminClient
      .from("bills")
      .select("id")
      .eq("slug", billSlug)
      .maybeSingle();
    if (billError) throw new Error(billError.message);

    const { data: faction, error: factionError } = await adminClient
      .from("factions")
      .select("id")
      .eq("name", factionName)
      .maybeSingle();
    if (factionError) throw new Error(factionError.message);

    const { data: member, error: memberError } = await adminClient
      .from("council_members")
      .select("id")
      .eq("name", memberName)
      .maybeSingle();
    if (memberError) throw new Error(memberError.message);

    expect(session).toBeNull();
    expect(bill).toBeNull();
    expect(faction).toBeNull();
    expect(member).toBeNull();
  });

  describe("議員の質問要約（12引数版）", () => {
    const questionRunId = `${runId}-questions`;
    const qFaction = `${questionRunId}-faction`;
    const qMember = `${questionRunId}-member`;
    const qRosterKey = `${questionRunId}-roster`;

    const qSessionSlug = `${questionRunId}-session`;

    // seed 済みの会期に頼らず、テスト専用の会期を毎回 upsert する（CI は空のDB）
    const baseArgs = () => ({
      p_council_sessions: [
        {
          name: `質問テスト会期 ${questionRunId}`,
          slug: qSessionSlug,
          council_url: null,
          start_date: "2025-11-20",
          end_date: null,
          is_active: false,
        },
      ],
      p_tags: [],
      p_bills: [],
      p_bill_contents: [],
      p_bills_tags: [],
      p_bill_session_slug: qSessionSlug,
      p_factions: [
        {
          name: qFaction,
          display_name: `テスト会派 ${questionRunId}`,
          alternative_names: [],
          logo_url: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_committees: [],
      p_council_members: [
        {
          name: qMember,
          name_kana: `${questionRunId}-kana`,
          faction_name: qFaction,
          faction_role: null,
          roster_key: qRosterKey,
          official_url: null,
          website_url: null,
          terms: 1,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_member_committees: [],
      p_council_roster_key: qRosterKey,
    });

    const question = (overrides: Record<string, unknown> = {}) => ({
      member_name: qMember,
      session_slug: null,
      session_name: "令和7年 第4回定例会",
      venue_type: "plenary",
      question_kind: "general",
      title: "テストの論点",
      summary: "テストの要約",
      topic_tags: ["防災"],
      speech_date: "2025-11-27",
      source_url: `https://example.com/minutes/${questionRunId}`,
      ...overrides,
    });

    const fetchMember = async () => {
      const { data, error } = await adminClient
        .from("council_members")
        .select("id")
        .eq("name", qMember)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    };

    afterAll(async () => {
      // 質問は議員の削除で cascade される
      await adminClient.from("council_members").delete().eq("name", qMember);
      await adminClient.from("factions").delete().eq("name", qFaction);
      await adminClient
        .from("council_sessions")
        .delete()
        .eq("slug", qSessionSlug);
    });

    it("未知の議員を指す質問があれば、議員の upsert ごとロールバックする", async () => {
      const { error } = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_council_member_questions: [
          question({ member_name: `${questionRunId}-unknown` }),
        ],
      });

      expect(error?.message).toContain(
        "one or more council member questions reference an unknown council member name"
      );
      expect(await fetchMember()).toBeNull();
    });

    it("未知の会期 slug を指す質問があれば例外にする", async () => {
      const { error } = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_council_member_questions: [
          question({ session_slug: `${questionRunId}-unknown-session` }),
        ],
      });

      expect(error?.message).toContain(
        "one or more council member questions reference an unknown council session slug"
      );
      expect(await fetchMember()).toBeNull();
    });

    it("出典URLが空の質問は例外にする", async () => {
      const { error } = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_council_member_questions: [question({ source_url: "" })],
      });

      expect(error?.message).toContain("must not be empty");
      expect(await fetchMember()).toBeNull();
    });

    it("同じ内容で再実行しても質問の行は書き換えない（updated_at が変わらない）", async () => {
      const args = { ...baseArgs(), p_council_member_questions: [question()] };
      const first = await adminClient.rpc("import_production_inventory", args);
      if (first.error) throw new Error(first.error.message);

      const member = await fetchMember();
      const fetchRow = async () => {
        const { data, error } = await adminClient
          .from("council_member_questions")
          .select("id, updated_at")
          .eq("council_member_id", member?.id ?? "")
          .single();
        if (error) throw new Error(error.message);
        return data;
      };
      const before = await fetchRow();

      const second = await adminClient.rpc("import_production_inventory", args);
      if (second.error) throw new Error(second.error.message);
      expect(await fetchRow()).toEqual(before);
    });

    it("同じ（議員・出典URL）の質問は更新として同じ行に当たる", async () => {
      const first = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_council_member_questions: [question()],
      });
      if (first.error) throw new Error(first.error.message);

      const second = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_council_member_questions: [question({ summary: "更新後の要約" })],
      });
      if (second.error) throw new Error(second.error.message);

      const member = await fetchMember();
      const { data, error } = await adminClient
        .from("council_member_questions")
        .select("summary, council_session_id")
        .eq("council_member_id", member?.id ?? "");
      if (error) throw new Error(error.message);
      expect(data).toEqual([
        { summary: "更新後の要約", council_session_id: null },
      ]);
    });
  });

  describe("会派の賛否（13引数版）", () => {
    const stanceRunId = `${runId}-stances`;
    const sFaction = `${stanceRunId}-faction`;
    const sSessionSlug = `${stanceRunId}-session`;
    const sBillSlug = `${stanceRunId}-bill`;
    const sRosterKey = `${stanceRunId}-roster`;

    // seed 済みの会期・議案に頼らず、テスト専用のものを毎回 upsert する（CI は空のDB）
    const baseArgs = () => ({
      p_council_sessions: [
        {
          name: `賛否テスト会期 ${stanceRunId}`,
          slug: sSessionSlug,
          council_url: null,
          start_date: "2026-06-10",
          end_date: null,
          is_active: false,
        },
      ],
      p_tags: [],
      p_bills: [
        {
          name: `賛否テスト議案 ${stanceRunId}`,
          bill_number: `${stanceRunId}-1`,
          slug: sBillSlug,
          status: "approved",
          status_note: null,
          publish_status: "draft",
          published_at: null,
          is_featured: false,
          is_review_completed: false,
          thumbnail_url: null,
          pdf_url: null,
          overview_pdf_url: null,
          source_page_url: null,
          decision_source_url: null,
        },
      ],
      p_bill_contents: [],
      p_bills_tags: [],
      p_bill_session_slug: sSessionSlug,
      p_factions: [
        {
          name: sFaction,
          display_name: `テスト会派 ${stanceRunId}`,
          alternative_names: [],
          logo_url: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_committees: [],
      p_council_members: [],
      p_council_member_committees: [],
      p_council_roster_key: sRosterKey,
      p_council_member_questions: [],
    });

    const stance = (overrides: Record<string, unknown> = {}) => ({
      bill_slug: sBillSlug,
      faction_name: sFaction,
      type: "for",
      faction_name_at_vote: "採決時の会派名",
      ...overrides,
    });

    const fetchBill = async () => {
      const { data, error } = await adminClient
        .from("bills")
        .select("id")
        .eq("slug", sBillSlug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    };

    const fetchStance = async () => {
      const bill = await fetchBill();
      const { data, error } = await adminClient
        .from("faction_stances")
        .select("id, type, comment, faction_name_at_vote, updated_at")
        .eq("bill_id", bill?.id ?? "")
        .single();
      if (error) throw new Error(error.message);
      return data;
    };

    afterAll(async () => {
      // 賛否は議案の削除で cascade される
      await adminClient.from("bills").delete().eq("slug", sBillSlug);
      await adminClient.from("factions").delete().eq("name", sFaction);
      await adminClient
        .from("council_sessions")
        .delete()
        .eq("slug", sSessionSlug);
    });

    it("未知の会派を指す賛否があれば、議案の upsert ごとロールバックする", async () => {
      const { error } = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_faction_stances: [stance({ faction_name: `${stanceRunId}-unknown` })],
      });

      expect(error?.message).toContain(
        "one or more faction stances reference an unknown bill slug or faction name"
      );
      expect(await fetchBill()).toBeNull();
    });

    it("採決時の会派名が空の賛否は例外にする", async () => {
      const { error } = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_faction_stances: [stance({ faction_name_at_vote: "" })],
      });

      expect(error?.message).toContain("must not be empty");
      expect(await fetchBill()).toBeNull();
    });

    it("同じ内容で再実行しても賛否の行は書き換えない（updated_at が変わらない）", async () => {
      const args = { ...baseArgs(), p_faction_stances: [stance()] };
      const first = await adminClient.rpc("import_production_inventory", args);
      if (first.error) throw new Error(first.error.message);
      const before = await fetchStance();

      const second = await adminClient.rpc("import_production_inventory", args);
      if (second.error) throw new Error(second.error.message);
      expect(await fetchStance()).toEqual(before);
    });

    it("賛否の更新は同じ行に当たり、管理画面の comment は消さない", async () => {
      const first = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_faction_stances: [stance()],
      });
      if (first.error) throw new Error(first.error.message);
      const before = await fetchStance();
      const { error: updateError } = await adminClient
        .from("faction_stances")
        .update({ comment: "管理画面で書いた見解" })
        .eq("id", before.id);
      if (updateError) throw new Error(updateError.message);

      const second = await adminClient.rpc("import_production_inventory", {
        ...baseArgs(),
        p_faction_stances: [stance({ type: "against" })],
      });
      if (second.error) throw new Error(second.error.message);

      const after = await fetchStance();
      expect(after.id).toBe(before.id);
      expect(after.type).toBe("against");
      expect(after.comment).toBe("管理画面で書いた見解");
    });
  });

  describe("議員のXアカウント（x_url）", () => {
    const xRunId = `${runId}-x-url`;
    const xFaction = `${xRunId}-faction`;
    const xMember = `${xRunId}-member`;
    const xRosterKey = `${xRunId}-roster`;
    const xSessionSlug = `${xRunId}-session`;

    // CLI と同じ13引数版から呼び、11引数版まで x_url が届くことを確かめる
    const args = (xUrl: string | null) => ({
      p_council_sessions: [
        {
          name: `Xテスト会期 ${xRunId}`,
          slug: xSessionSlug,
          council_url: null,
          start_date: "2026-09-26",
          end_date: null,
          is_active: false,
        },
      ],
      p_tags: [],
      p_bills: [],
      p_bill_contents: [],
      p_bills_tags: [],
      p_bill_session_slug: xSessionSlug,
      p_factions: [
        {
          name: xFaction,
          display_name: `テスト会派 ${xRunId}`,
          alternative_names: [],
          logo_url: null,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_committees: [],
      p_council_members: [
        {
          name: xMember,
          name_kana: `${xRunId}-kana`,
          faction_name: xFaction,
          faction_role: null,
          roster_key: xRosterKey,
          official_url: null,
          website_url: null,
          x_url: xUrl,
          terms: 1,
          sort_order: 1,
          is_active: true,
        },
      ],
      p_council_member_committees: [],
      p_council_roster_key: xRosterKey,
      p_council_member_questions: [],
      p_faction_stances: [],
    });

    const fetchRow = async () => {
      const { data, error } = await adminClient
        .from("council_members")
        .select("id, x_url, updated_at")
        .eq("name", xMember)
        .single();
      if (error) throw new Error(error.message);
      return data;
    };

    afterAll(async () => {
      await adminClient.from("council_members").delete().eq("name", xMember);
      await adminClient.from("factions").delete().eq("name", xFaction);
      await adminClient
        .from("council_sessions")
        .delete()
        .eq("slug", xSessionSlug);
    });

    it("x_url を保存し、同じ内容の再実行では行を書き換えない", async () => {
      const first = await adminClient.rpc(
        "import_production_inventory",
        args("https://x.com/example_first")
      );
      if (first.error) throw new Error(first.error.message);
      const before = await fetchRow();
      expect(before.x_url).toBe("https://x.com/example_first");

      const second = await adminClient.rpc(
        "import_production_inventory",
        args("https://x.com/example_first")
      );
      if (second.error) throw new Error(second.error.message);
      expect(await fetchRow()).toEqual(before);
    });

    it("x_url だけが変わっても同じ行を更新し、null で消せる", async () => {
      const first = await adminClient.rpc(
        "import_production_inventory",
        args("https://x.com/example_first")
      );
      if (first.error) throw new Error(first.error.message);
      const before = await fetchRow();

      const changed = await adminClient.rpc(
        "import_production_inventory",
        args("https://x.com/example_second")
      );
      if (changed.error) throw new Error(changed.error.message);
      const after = await fetchRow();
      expect(after.id).toBe(before.id);
      expect(after.x_url).toBe("https://x.com/example_second");

      const cleared = await adminClient.rpc(
        "import_production_inventory",
        args(null)
      );
      if (cleared.error) throw new Error(cleared.error.message);
      expect((await fetchRow()).x_url).toBeNull();
    });
  });
});
