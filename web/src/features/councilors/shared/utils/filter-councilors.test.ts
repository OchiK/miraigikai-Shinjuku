import { describe, expect, it } from "vitest";
import type {
  CommitteeRole,
  Councilor,
  CouncilorCommittee,
  CouncilorFaction,
} from "../types";
import { getCommitteeKind } from "./committee-kind";
import {
  countCommitteeView,
  filterCommitteeGroups,
  filterCouncilors,
  groupCouncilorsByCommittee,
  groupCouncilorsByFaction,
  normalizeSearchText,
} from "./filter-councilors";

const komei: CouncilorFaction = {
  id: "komei",
  slug: "komei",
  displayName: "新宿区議会公明党",
  sortOrder: 2,
};
const jimin: CouncilorFaction = {
  id: "jimin",
  slug: "jimin-sansei",
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
  xUrl: null,
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

describe("groupCouncilorsByCommittee", () => {
  const membership = (
    id: string,
    name: string,
    sortOrder: number,
    role: CommitteeRole = "委員"
  ): CouncilorCommittee => ({
    id,
    name,
    role,
    kind: getCommitteeKind(name),
    sortOrder,
  });
  const soumu = (role?: CommitteeRole) =>
    membership("soumu", "総務区民委員会", 1, role);
  const fukushi = (role?: CommitteeRole) =>
    membership("fukushi", "福祉健康委員会", 4, role);
  const giun = (role?: CommitteeRole) =>
    membership("giun", "議会運営委員会", 5, role);
  const bousai = (role?: CommitteeRole) =>
    membership("bousai", "防災等安全対策特別委員会", 6, role);

  const a = councilor({
    id: "a",
    name: "議員 A",
    nameKana: "ぎいん えー",
    sortOrder: 3,
    committees: [bousai("副委員長"), soumu(), giun()],
  });
  const b = councilor({
    id: "b",
    name: "議員 B",
    nameKana: "ぎいん びー",
    sortOrder: 1,
    committees: [soumu(), bousai()],
  });
  const c = councilor({
    id: "c",
    name: "議員 C",
    nameKana: "ぎいん しー",
    sortOrder: 2,
    committees: [soumu("委員長"), fukushi("副委員長"), bousai("委員長")],
  });
  const d = councilor({
    id: "d",
    name: "議員 D",
    nameKana: "ぎいん でぃー",
    sortOrder: 4,
    committees: [soumu("副委員長")],
  });
  const noCommittee = councilor({
    id: "e",
    name: "議員 E",
    nameKana: "ぎいん いー",
    sortOrder: 0,
  });
  const groups = groupCouncilorsByCommittee([a, b, c, d, noCommittee]);

  it("委員会は常任 → 議会運営 → 特別、同じ種別の中は表示順", () => {
    expect(groups.map((g) => g.committee.id)).toEqual([
      "soumu",
      "fukushi",
      "giun",
      "bousai",
    ]);
    expect(groups[0].committee).toEqual({
      id: "soumu",
      name: "総務区民委員会",
      kind: "standing",
      sortOrder: 1,
    });
  });

  it("委員会内は委員長 → 副委員長 → 委員、同じ役職の中は議席番号順", () => {
    expect(groups[0].members.map((m) => [m.councilor.id, m.role])).toEqual([
      ["c", "委員長"],
      ["d", "副委員長"],
      ["b", "委員"],
      ["a", "委員"],
    ]);
    expect(groups[3].members.map((m) => [m.councilor.id, m.role])).toEqual([
      ["c", "委員長"],
      ["a", "副委員長"],
      ["b", "委員"],
    ]);
  });

  it("同じ議員が複数の委員会に出て、所属のない議員はどこにも入らない", () => {
    const appearances = (id: string) =>
      groups.filter((g) => g.members.some((m) => m.councilor.id === id)).length;
    expect(appearances("a")).toBe(3);
    expect(appearances("c")).toBe(3);
    expect(appearances("e")).toBe(0);
  });

  it("議員がいなければ空配列", () => {
    expect(groupCouncilorsByCommittee([])).toEqual([]);
    expect(groupCouncilorsByCommittee([noCommittee])).toEqual([]);
  });

  describe("filterCommitteeGroups", () => {
    it("null なら全件を返す", () => {
      expect(filterCommitteeGroups(groups, null)).toEqual(groups);
    });

    it("指定した委員会だけを返す", () => {
      expect(
        filterCommitteeGroups(groups, "giun").map((g) => g.committee.id)
      ).toEqual(["giun"]);
    });

    it("存在しない委員会なら空", () => {
      expect(filterCommitteeGroups(groups, "missing")).toEqual([]);
    });
  });

  describe("countCommitteeView", () => {
    it("複数の委員会に出る議員を1人と数える", () => {
      // 延べ 4 + 1 + 1 + 3 = 9 だが、重複を除くと a〜d の4人
      expect(countCommitteeView(groups)).toEqual({ committees: 4, people: 4 });
    });

    it("空なら0", () => {
      expect(countCommitteeView([])).toEqual({ committees: 0, people: 0 });
    });
  });
});
