import { describe, expect, it } from "vitest";
import { committees, factions } from "./data";
import {
  councilMembers,
  createCouncilMemberCommitteeInserts,
  createCouncilMemberInserts,
} from "./shinjuku-council-members";

/** DB投入後に返ってくる { id, name } を再現する */
const insertedFactions = factions.map((f, i) => ({
  id: `faction-uuid-${i}`,
  name: f.name,
}));
const insertedCommittees = committees.map((c, i) => ({
  id: `committee-uuid-${i}`,
  name: c.name,
}));
const insertedMembers = councilMembers.map((m, i) => ({
  id: `member-uuid-${i}`,
  name: m.name,
}));

const activeMembers = councilMembers.filter((member) => member.isActive ?? true);

describe("議員名簿 seed", () => {
  it("定数38名を重複なく持つ", () => {
    expect(councilMembers).toHaveLength(38);
    expect(new Set(councilMembers.map((m) => m.name)).size).toBe(38);
  });

  it("欠員の議席13・27だけが非アクティブで、役職と委員会所属を持たない", () => {
    const inactive = councilMembers.flatMap((member, index) =>
      member.isActive === false ? [{ member, seat: index + 1 }] : []
    );
    expect(inactive.map(({ member, seat }) => [seat, member.name])).toEqual([
      [13, "大門 さちえ"],
      [27, "おやまだ 静香"],
    ]);
    expect(activeMembers).toHaveLength(36);
    for (const { member } of inactive) {
      expect(member.factionRole).toBeNull();
      expect(member.committees).toEqual({});
    }
  });

  it("会派の掲載順・活動状態と名称変更の別名を保持する", () => {
    expect(factions.map((f) => [f.name, f.sort_order, f.is_active])).toEqual([
      ["jimin-sansei", 1, true],
      ["komei", 2, true],
      ["kyosan", 3, true],
      ["shinjuku-mirai", 4, true],
      ["rikken", 5, true],
      ["ishin", 6, true],
      ["genekisedai", 7, true],
      ["inochi", 8, true],
      ["rikken-forum", 9, true],
      ["update", 10, false],
    ]);
    expect(factions.find((f) => f.name === "genekisedai")).toMatchObject({
      display_name: "現役世代に優しい新宿",
      alternative_names: ["現役", "現役世代に優しい新宿・減税の会"],
    });
    expect(factions.find((f) => f.name === "rikken-forum")).toMatchObject({
      display_name: "新宿区議会立憲フォーラム",
      alternative_names: ["新立憲"],
    });
    expect(factions.find((f) => f.name === "update")).toMatchObject({
      display_name: "アップデート新宿",
      alternative_names: ["アプデ"],
    });
  });

  it("古畑・渡辺やすし・田中の所属と会派役職を反映し、田中の委員会は維持する", () => {
    for (const [name, faction] of [
      ["古畑 まさのり", "ishin"],
      ["渡辺 やすし", "genekisedai"],
      ["田中 ゆきえ", "rikken-forum"],
    ]) {
      expect(councilMembers.find((m) => m.name === name)).toMatchObject({
        faction,
        factionRole: "幹事長・会計",
      });
    }
    expect(councilMembers[25].committees).toEqual({
      総務区民委員会: "委員",
      文化観光産業等特別委員会: "委員",
    });
  });

  // 会派構成ページ（2026年11月9日更新）の人数表記
  it("会派ごとの人数が公式の会派構成と一致する", () => {
    const counts = Object.fromEntries(
      factions.map((f) => [
        f.name,
        activeMembers.filter((m) => m.faction === f.name).length,
      ])
    );
    expect(counts).toEqual({
      "jimin-sansei": 8,
      komei: 8,
      kyosan: 7,
      "shinjuku-mirai": 6,
      rikken: 3,
      ishin: 1,
      genekisedai: 1,
      inochi: 1,
      "rikken-forum": 1,
      update: 0,
    });
  });

  // 委員会名簿ページ（2026年11月9日更新）の現員数
  it("委員会ごとの人数が公式の現員数と一致し、委員長・副委員長が1名ずつ", () => {
    const expectedSize: Record<string, number> = {
      総務区民委員会: 10,
      福祉健康委員会: 8,
      環境建設委員会: 10,
      文教子ども家庭委員会: 8,
      議会運営委員会: 12,
      防災等安全対策特別委員会: 10,
      "自治・議会・行財政改革等特別委員会": 9,
      文化観光産業等特別委員会: 8,
      本庁舎対策等特別委員会: 8,
    };

    for (const [name, size] of Object.entries(expectedSize)) {
      const roles = activeMembers.flatMap((m) =>
        m.committees[name] ? [m.committees[name]] : []
      );
      expect(roles, name).toHaveLength(size);
      expect(roles.filter((r) => r === "委員長"), name).toHaveLength(1);
      expect(roles.filter((r) => r === "副委員長"), name).toHaveLength(1);
    }
  });

  it("XのURLは x.com のプロフィールURLで、同じアカウントを2人に付けない（28名登録、10名未保有）", () => {
    const xUrls = councilMembers.flatMap((m) => (m.xUrl ? [m.xUrl] : []));
    expect(xUrls).toHaveLength(28);
    expect(councilMembers.filter((m) => m.xUrl === null)).toHaveLength(10);
    for (const url of xUrls) {
      expect(url).toMatch(/^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}$/);
    }
    expect(
      new Set(xUrls.map((url) => url.toLowerCase())).size,
      "重複あり"
    ).toBe(xUrls.length);
  });

  it("現職議員全員が常任委員会にちょうど1つ所属する", () => {
    const standing = [
      "総務区民委員会",
      "福祉健康委員会",
      "環境建設委員会",
      "文教子ども家庭委員会",
    ];
    for (const m of activeMembers) {
      const count = standing.filter((c) => m.committees[c]).length;
      expect(count, m.name).toBe(1);
    }
  });
});

describe("createCouncilMemberInserts", () => {
  it("会派キーを faction_id に解決し、議席番号順に sort_order を振る", () => {
    const rows = createCouncilMemberInserts(councilMembers, insertedFactions);

    expect(rows).toHaveLength(38);
    expect(rows[0]).toMatchObject({
      name: "木もと ひろゆき",
      faction_id: "faction-uuid-1",
      sort_order: 1,
    });
    expect(rows[37].sort_order).toBe(38);
    expect(rows[12]).toMatchObject({ is_active: false, sort_order: 13 });
    expect(rows[26]).toMatchObject({ is_active: false, sort_order: 27 });
    expect(rows.filter((row) => row.is_active).map((row) => row.sort_order)).toEqual(
      Array.from({ length: 38 }, (_, index) => index + 1).filter(
        (seat) => seat !== 13 && seat !== 27
      )
    );
    expect(rows.map((r) => r.x_url)).toEqual(
      councilMembers.map((m) => m.xUrl)
    );
  });

  it("存在しない会派キーは投入前に止める", () => {
    expect(() =>
      createCouncilMemberInserts(
        [{ ...councilMembers[0], faction: "unknown" }],
        insertedFactions
      )
    ).toThrow("Faction not found for name: unknown");
  });
});

describe("createCouncilMemberCommitteeInserts", () => {
  it("議員と委員会を名前で解決する", () => {
    const rows = createCouncilMemberCommitteeInserts(
      councilMembers,
      insertedMembers,
      insertedCommittees
    );

    const total = councilMembers.reduce(
      (sum, m) => sum + Object.keys(m.committees).length,
      0
    );
    expect(total).toBe(83);
    expect(rows).toHaveLength(total);
    expect(rows.every((r) => r.committee_id.startsWith("committee-uuid-"))).toBe(
      true
    );
  });

  it("seed に無い委員会名は投入前に止める", () => {
    expect(() =>
      createCouncilMemberCommitteeInserts(
        [{ ...councilMembers[0], committees: { 存在しない委員会: "委員" } }],
        insertedMembers,
        insertedCommittees
      )
    ).toThrow("Committee not found for name: 存在しない委員会");
  });
});
