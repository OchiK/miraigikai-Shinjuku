import { describe, expect, it } from "vitest";
import { type CouncilorRow, toCouncilor } from "./to-councilor";

const row: CouncilorRow = {
  id: "member-1",
  name: "木もと ひろゆき",
  name_kana: "きもと ひろゆき",
  faction_role: "会計",
  terms: 3,
  official_url: "https://example.jp/roster",
  website_url: null,
  sort_order: 1,
  factions: {
    id: "faction-1",
    display_name: "新宿区議会公明党",
    sort_order: 2,
  },
  council_member_committees: [
    {
      role: "委員",
      committees: {
        id: "c-6",
        name: "防災等安全対策特別委員会",
        sort_order: 6,
      },
    },
    {
      role: "委員長",
      committees: { id: "c-3", name: "文教子ども家庭委員会", sort_order: 3 },
    },
  ],
};

describe("toCouncilor", () => {
  it("列名を画面用の形に変換し、委員会を常任→特別の順に並べる", () => {
    const councilor = toCouncilor(row);

    expect(councilor).toMatchObject({
      id: "member-1",
      nameKana: "きもと ひろゆき",
      factionRole: "会計",
      faction: { id: "faction-1", displayName: "新宿区議会公明党" },
    });
    expect(councilor.committees).toEqual([
      {
        id: "c-3",
        name: "文教子ども家庭委員会",
        role: "委員長",
        kind: "standing",
        sortOrder: 3,
      },
      {
        id: "c-6",
        name: "防災等安全対策特別委員会",
        role: "委員",
        kind: "special",
        sortOrder: 6,
      },
    ]);
  });

  it("会派が無い議員は faction を null にする", () => {
    expect(toCouncilor({ ...row, factions: null }).faction).toBeNull();
  });

  it("委員会が削除された所属や未知の役職は落とす", () => {
    const councilor = toCouncilor({
      ...row,
      council_member_committees: [
        { role: "委員", committees: null },
        {
          role: "顧問",
          committees: { id: "c-1", name: "総務区民委員会", sort_order: 1 },
        },
      ],
    });
    expect(councilor.committees).toEqual([]);
  });
});
