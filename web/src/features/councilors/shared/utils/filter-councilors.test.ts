import { describe, expect, it } from "vitest";
import type { Councilor, CouncilorFaction } from "../types";
import {
  filterCouncilors,
  groupCouncilorsByFaction,
  normalizeSearchText,
} from "./filter-councilors";

const komei: CouncilorFaction = {
  id: "komei",
  displayName: "新宿区議会公明党",
  sortOrder: 2,
};
const jimin: CouncilorFaction = {
  id: "jimin",
  displayName: "自民・参政クラブ",
  sortOrder: 1,
};

const councilor = (
  overrides: Partial<Councilor> & Pick<Councilor, "id" | "name" | "nameKana">
): Councilor => ({
  factionRole: null,
  terms: 1,
  officialUrl: null,
  websiteUrl: null,
  sortOrder: 0,
  faction: null,
  committees: [],
  questionsCount: 0,
  questionVenueCounts: { plenary: 0, budget: 0, committee: 0 },
  latestQuestionDate: null,
  ...overrides,
});

const nozu = councilor({
  id: "29",
  name: "のづ ケン",
  nameKana: "のづ けん",
  sortOrder: 29,
  faction: komei,
});
const kimoto = councilor({
  id: "1",
  name: "木もと ひろゆき",
  nameKana: "きもと ひろゆき",
  sortOrder: 1,
  faction: komei,
});
const hiyama = councilor({
  id: "35",
  name: "ひやま 真一",
  nameKana: "ひやま しんいち",
  sortOrder: 35,
  faction: jimin,
});
const unaffiliated = councilor({
  id: "40",
  name: "無所属 太郎",
  nameKana: "むしょぞく たろう",
  sortOrder: 40,
});
const all = [nozu, kimoto, hiyama, unaffiliated];

describe("normalizeSearchText", () => {
  it("空白を除きカタカナをひらがなにする", () => {
    expect(normalizeSearchText("のづ　ケン")).toBe("のづけん");
  });
});

describe("filterCouncilors", () => {
  it("条件が無ければ全員を返す", () => {
    expect(filterCouncilors(all, { factionId: null, query: "" })).toEqual(all);
  });

  it("会派で絞り込む", () => {
    expect(
      filterCouncilors(all, { factionId: "jimin", query: "" }).map((c) => c.id)
    ).toEqual(["35"]);
  });

  it("漢字の氏名・ふりがなのどちらでも、空白やカタカナを無視して一致する", () => {
    const ids = (query: string) =>
      filterCouncilors(all, { factionId: null, query }).map((c) => c.id);
    expect(ids("真一")).toEqual(["35"]);
    expect(ids("きもと")).toEqual(["1"]);
    expect(ids("ノヅケン")).toEqual(["29"]);
    expect(ids("  ")).toEqual(["29", "1", "35", "40"]);
  });

  it("会派と検索語を同時に満たす議員だけを返す", () => {
    expect(
      filterCouncilors(all, { factionId: "jimin", query: "きもと" })
    ).toEqual([]);
  });
});

describe("groupCouncilorsByFaction", () => {
  it("会派の表示順でまとめ、会派内は議席番号順、会派なしは最後", () => {
    const groups = groupCouncilorsByFaction(all);
    expect(groups.map((g) => g.faction?.id ?? null)).toEqual([
      "jimin",
      "komei",
      null,
    ]);
    expect(groups[1].councilors.map((c) => c.id)).toEqual(["1", "29"]);
  });
});
