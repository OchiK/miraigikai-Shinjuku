import { adminClient } from "@test-utils/utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { groupCouncilorsByCommittee } from "../../shared/utils/filter-councilors";

// unstable_cache はモジュール初期化時に評価されるため、
// テストファイル内で vi.mock → 動的インポートの順序を保証する。
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

const { getCouncilors } = await import("./get-councilors");
const { getCouncilorById } = await import("./get-councilor-by-id");

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe("議員ローダー 統合テスト", () => {
  let factionId: string;
  let standingId: string;
  let specialId: string;
  let activeId: string;
  let inactiveId: string;
  let sessionId: string;

  beforeAll(async () => {
    const { data: faction, error: factionError } = await adminClient
      .from("factions")
      .insert({ name: `test-${suffix}`, display_name: `テスト会派-${suffix}` })
      .select("id")
      .single();
    if (factionError) throw factionError;
    factionId = faction.id;

    const { data: committees, error: committeesError } = await adminClient
      .from("committees")
      .insert([
        { name: `テスト特別委員会-${suffix}特別委員会`, sort_order: 90 },
        { name: `テスト常任委員会-${suffix}`, sort_order: 91 },
      ])
      .select("id, name");
    if (committeesError) throw committeesError;
    specialId = committees[0].id;
    standingId = committees[1].id;

    const { data: members, error: membersError } = await adminClient
      .from("council_members")
      .insert([
        {
          name: `テスト 議員-${suffix}`,
          name_kana: "てすと ぎいん",
          faction_id: factionId,
          faction_role: "幹事長",
          terms: 2,
          sort_order: 1000,
          // 一括 insert では行ごとに欠けた列が null になるため両方に明示する
          is_active: true,
        },
        {
          name: `テスト 元議員-${suffix}`,
          name_kana: "てすと もとぎいん",
          faction_id: factionId,
          sort_order: 1001,
          is_active: false,
        },
      ])
      .select("id");
    if (membersError) throw membersError;
    activeId = members[0].id;
    inactiveId = members[1].id;

    const { error: membershipError } = await adminClient
      .from("council_member_committees")
      .insert([
        { council_member_id: activeId, committee_id: specialId, role: "委員" },
        {
          council_member_id: activeId,
          committee_id: standingId,
          role: "副委員長",
        },
      ]);
    if (membershipError) throw membershipError;

    const { data: session, error: sessionError } = await adminClient
      .from("council_sessions")
      .insert({
        name: `テスト定例会-${suffix}`,
        slug: `test-${suffix}`,
        start_date: "2026-06-01",
        is_active: false,
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;
    sessionId = session.id;

    const minuteUrl = (minuteId: number) =>
      `https://ssp.kaigiroku.net/tenant/shinjuku/MinuteView.html?council_id=1&schedule_id=1&minute_id=${minuteId}`;
    // 同じ日の2件は発言番号の大きい順に入れ、画面側で発言順に並ぶことを確かめる
    const { error: questionsError } = await adminClient
      .from("council_member_questions")
      .insert([
        {
          council_member_id: activeId,
          council_session_id: sessionId,
          session_name: `テスト定例会-${suffix}`,
          venue_type: "plenary",
          question_kind: "general",
          title: "後の論点",
          summary: "要約B",
          topic_tags: ["防災"],
          speech_date: "2026-06-11",
          source_url: minuteUrl(30),
        },
        {
          council_member_id: activeId,
          council_session_id: sessionId,
          session_name: `テスト定例会-${suffix}`,
          venue_type: "plenary",
          question_kind: "general",
          title: "先の論点",
          summary: "要約A",
          topic_tags: ["防災", "子育て"],
          speech_date: "2026-06-11",
          source_url: minuteUrl(10),
        },
        {
          council_member_id: activeId,
          committee_id: standingId,
          session_name: "令和7年 第4回定例会",
          venue_type: "committee",
          title: "委員会の質問",
          summary: "要約C",
          topic_tags: ["教育"],
          speech_date: "2026-02-10",
          source_url: null,
        },
      ]);
    if (questionsError) throw questionsError;
  });

  afterAll(async () => {
    // council_member_committees・council_member_questions は議員の削除で cascade される
    await adminClient
      .from("council_members")
      .delete()
      .in("id", [activeId, inactiveId]);
    await adminClient
      .from("committees")
      .delete()
      .in("id", [standingId, specialId]);
    await adminClient.from("factions").delete().eq("id", factionId);
    await adminClient.from("council_sessions").delete().eq("id", sessionId);
  });

  it("getCouncilors は現職だけを会派・委員会つきで返す", async () => {
    const councilors = await getCouncilors();
    const ids = councilors.map((c) => c.id);

    expect(ids).toContain(activeId);
    expect(ids).not.toContain(inactiveId);

    const sortOrders = councilors.map((c) => c.sortOrder);
    expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
  });

  it("getCouncilorById は会派と、常任→特別の順の委員会を返す", async () => {
    const councilor = await getCouncilorById(activeId);

    expect(councilor).toMatchObject({
      id: activeId,
      nameKana: "てすと ぎいん",
      factionRole: "幹事長",
      terms: 2,
      faction: { id: factionId, displayName: `テスト会派-${suffix}` },
    });
    expect(councilor?.committees.map((c) => [c.id, c.kind, c.role])).toEqual([
      [standingId, "standing", "副委員長"],
      [specialId, "special", "委員"],
    ]);
  });

  it("getCouncilors は掲載中の質問を総数と発言の場ごとに数える", async () => {
    const councilors = await getCouncilors();
    const active = councilors.find((c) => c.id === activeId);

    expect(active?.questionsCount).toBe(3);
    expect(active?.questionVenueCounts).toEqual({
      plenary: 2,
      budget: 0,
      committee: 1,
    });
    expect(active?.latestQuestionDate).toBe("2026-06-11");
  });

  it("getCouncilorById は質問を新しい順・同じ日は発言順で、会期名・委員会名つきで返す", async () => {
    const councilor = await getCouncilorById(activeId);

    expect(councilor?.questions.map((q) => q.title)).toEqual([
      "先の論点",
      "後の論点",
      "委員会の質問",
    ]);
    expect(councilor?.questions[0]).toMatchObject({
      venueType: "plenary",
      questionKind: "general",
      topicTags: ["防災", "子育て"],
      speechDate: "2026-06-11",
      sessionName: `テスト定例会-${suffix}`,
      committeeName: null,
    });
    expect(councilor?.questions[2]).toMatchObject({
      venueType: "committee",
      questionKind: null,
      committeeName: `テスト常任委員会-${suffix}`,
      sessionName: "令和7年 第4回定例会",
      sourceUrl: null,
    });
  });

  it("seed の実データを委員会別にまとめると、9委員会・延べ87件で各委員会に委員長と副委員長が1人ずつ", async () => {
    // このファイルや並行する統合テストが入れた「テスト」委員会は除く
    const groups = groupCouncilorsByCommittee(await getCouncilors()).filter(
      (g) => !g.committee.name.startsWith("テスト")
    );

    expect(groups.map((g) => g.committee.kind)).toEqual([
      "standing",
      "standing",
      "standing",
      "standing",
      "steering",
      "special",
      "special",
      "special",
      "special",
    ]);
    expect(groups.reduce((sum, g) => sum + g.members.length, 0)).toBe(87);
    for (const { members } of groups) {
      expect(members.filter((m) => m.role === "委員長")).toHaveLength(1);
      expect(members.filter((m) => m.role === "副委員長")).toHaveLength(1);
      expect(members[0].role).toBe("委員長");
      expect(members[1].role).toBe("副委員長");
    }
  });

  it("getCouncilorById は現職でない議員に null を返す", async () => {
    expect(await getCouncilorById(inactiveId)).toBeNull();
  });

  it("getCouncilorById は UUID でない id に DB を引かず null を返す", async () => {
    expect(await getCouncilorById("not-a-uuid")).toBeNull();
  });

  it("getCouncilorById は存在しない id に null を返す", async () => {
    expect(
      await getCouncilorById("00000000-0000-4000-8000-000000000000")
    ).toBeNull();
  });
});
