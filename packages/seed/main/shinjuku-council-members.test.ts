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

describe("議員名簿 seed", () => {
  it("定数38名を重複なく持つ", () => {
    expect(councilMembers).toHaveLength(38);
    expect(new Set(councilMembers.map((m) => m.name)).size).toBe(38);
  });

  // 会派構成ページ（2026年8月7日更新）の人数表記
  it("会派ごとの人数が公式の会派構成と一致する", () => {
    const counts = Object.fromEntries(
      factions.map((f) => [
        f.name,
        councilMembers.filter((m) => m.faction === f.name).length,
      ])
    );
    expect(counts).toEqual({
      "jimin-sansei": 8,
      komei: 8,
      kyosan: 7,
      "shinjuku-mirai": 6,
      rikken: 3,
      ishin: 2,
      genekisedai: 2,
      inochi: 1,
      update: 1,
    });
  });

  // 委員会名簿ページ（2026年8月7日更新）の定数表記
  it("委員会ごとの人数が公式の定数と一致し、委員長・副委員長が1名ずつ", () => {
    const expectedSize: Record<string, number> = {
      総務区民委員会: 10,
      福祉健康委員会: 9,
      環境建設委員会: 10,
      文教子ども家庭委員会: 9,
      議会運営委員会: 12,
      防災等安全対策特別委員会: 10,
      "自治・議会・行財政改革等特別委員会": 9,
      文化観光産業等特別委員会: 9,
      本庁舎対策等特別委員会: 9,
    };

    for (const [name, size] of Object.entries(expectedSize)) {
      const roles = councilMembers.flatMap((m) =>
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

  it("全議員が常任委員会にちょうど1つ所属する", () => {
    const standing = [
      "総務区民委員会",
      "福祉健康委員会",
      "環境建設委員会",
      "文教子ども家庭委員会",
    ];
    for (const m of councilMembers) {
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
