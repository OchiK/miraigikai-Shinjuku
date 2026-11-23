import { describe, expect, it } from "vitest";
import { type FactionRecord, matchFaction } from "./faction-matching";

// packages/seed/main/data.ts の全10会派（2026-11-23）。id は識別しやすい seed name。
const factions = [
  {
    id: "jimin-sansei",
    display_name: "自民・参政クラブ",
    alternative_names: ["自参ク"],
    is_active: true,
  },
  {
    id: "komei",
    display_name: "新宿区議会公明党",
    alternative_names: ["公明"],
    is_active: true,
  },
  {
    id: "kyosan",
    display_name: "日本共産党新宿区議会議員団",
    alternative_names: ["共産"],
    is_active: true,
  },
  {
    id: "shinjuku-mirai",
    display_name: "新宿未来の会",
    alternative_names: ["新宿会"],
    is_active: true,
  },
  {
    id: "rikken",
    display_name: "立憲民主党・無所属クラブ",
    alternative_names: ["民無ク"],
    is_active: true,
  },
  {
    id: "ishin",
    display_name: "日本維新の会・新宿区議団",
    alternative_names: ["維新"],
    is_active: true,
  },
  {
    id: "genekisedai",
    display_name: "現役世代に優しい新宿",
    alternative_names: ["現役", "現役世代に優しい新宿・減税の会"],
    is_active: true,
  },
  {
    id: "inochi",
    display_name: "いのちの党 新宿",
    alternative_names: ["いのち", "れいわ新選組 新宿"],
    is_active: true,
  },
  {
    id: "rikken-forum",
    display_name: "新宿区議会立憲フォーラム",
    alternative_names: ["新立憲"],
    is_active: true,
  },
  {
    id: "update",
    display_name: "アップデート新宿",
    alternative_names: ["アプデ"],
    is_active: false,
  },
] satisfies FactionRecordWithActivity[];
type FactionRecordWithActivity = FactionRecord & { is_active: boolean };

describe("matchFaction", () => {
  it.each([
    "立憲",
    "",
    "　 ",
    "新宿",
    "自由民主党新宿区議会議員団",
  ])("%s を部分一致させない", (name) => {
    expect(matchFaction(factions, name)).toEqual({ kind: "unmatched" });
  });
  it.each(
    factions.flatMap((faction) => [
      [faction.display_name, faction.id, "display_name"] as const,
      ...faction.alternative_names.map(
        (name) => [name, faction.id, "alternative_name"] as const
      ),
    ])
  )("%s → %s (%s)", (name, id, matchedBy) => {
    expect(matchFaction(factions, name)).toMatchObject({
      kind: "matched",
      faction: { id },
      matchedBy,
    });
  });
  it("前後の空白と大文字小文字を正規化する", () => {
    const records = [
      { id: "a", display_name: " Example ", alternative_names: [" Alias "] },
    ];
    expect(matchFaction(records, " EXAMPLE　")).toMatchObject({
      kind: "matched",
      matchedBy: "display_name",
    });
    expect(matchFaction(records, " alias ")).toMatchObject({
      kind: "matched",
      matchedBy: "alternative_name",
    });
  });
  it("別会派の別名より正式名を優先する", () => {
    const records = [
      ...factions,
      {
        id: "other",
        display_name: "other",
        alternative_names: [factions[4].display_name],
      },
    ];
    expect(matchFaction(records, factions[4].display_name)).toMatchObject({
      kind: "matched",
      faction: { id: "rikken" },
      matchedBy: "display_name",
    });
  });
  it("複数会派の同じ別名は先頭を選ばない", () => {
    const records = factions.map((faction) =>
      faction.id.startsWith("rikken")
        ? {
            ...faction,
            alternative_names: [...faction.alternative_names, "立憲"],
          }
        : faction
    );
    const result = matchFaction(records, "立憲");
    expect(result.kind).toBe("ambiguous");
    if (result.kind === "ambiguous")
      expect(result.candidates.map((faction) => faction.id)).toEqual([
        "rikken",
        "rikken-forum",
      ]);
    expect(matchFaction([...records].reverse(), "立憲").kind).toBe("ambiguous");
  });
  it("複数会派の同じ正式名は別名へフォールバックせず曖昧にする", () => {
    const records = [factions[4], { ...factions[4], id: "duplicate" }];
    expect(matchFaction(records, factions[4].display_name)).toEqual({
      kind: "ambiguous",
      candidates: records,
    });
  });
  it("同じ会派内の別名重複は曖昧ではない", () => {
    expect(
      matchFaction(
        [{ ...factions[4], alternative_names: ["民無ク", "民無ク"] }],
        "民無ク"
      ).kind
    ).toBe("matched");
  });
});
