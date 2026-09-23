import { adminClient } from "@test-utils/utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

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
  });

  afterAll(async () => {
    // council_member_committees は議員・委員会の削除で cascade される
    await adminClient
      .from("council_members")
      .delete()
      .in("id", [activeId, inactiveId]);
    await adminClient
      .from("committees")
      .delete()
      .in("id", [standingId, specialId]);
    await adminClient.from("factions").delete().eq("id", factionId);
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
