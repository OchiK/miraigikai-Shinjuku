import { describe, expect, it } from "vitest";
import { factions } from "./data";
import {
  compareStanceTable,
  parseVoteMarks,
  R8_2_VOTE_COLUMNS,
  r8_2BillVotes,
  resolveFactionAtVote,
  toFactionStanceImportRows,
} from "./shinjuku-faction-stances";
import { gianKey, toBillInserts } from "./shinjuku-r8-2-inventory";

const rows = toFactionStanceImportRows(r8_2BillVotes, factions);

describe("令和8年第2回定例会の会派賛否", () => {
  it("DB の議案23件すべてを、表の並び（議案番号順）で1回ずつ持つ", () => {
    const billSlugs = toBillInserts().map((bill) => bill.slug);
    expect(r8_2BillVotes.map((bill) => bill.billKey)).toEqual(billSlugs);
  });

  it("23議案×8会派＝184行になる", () => {
    expect(rows).toHaveLength(184);
  });

  it("反対は4行だけ（第42号・現役、第45号・第49号・れいわ、第54号・共産）", () => {
    const against = rows
      .filter((row) => row.type === "against")
      .map((row) => [row.bill_slug, row.faction_name]);
    expect(against).toEqual([
      [gianKey(42), "genekisedai"],
      [gianKey(45), "inochi"],
      [gianKey(49), "inochi"],
      [gianKey(54), "kyosan"],
    ]);
  });

  it("採決後に結成されたアップデート新宿の行は作らない", () => {
    expect(rows.some((row) => row.faction_name === "update")).toBe(false);
  });

  it("れいわ新選組 新宿の列は、名称変更後の inochi に採決時の名前つきで入る", () => {
    const inochi = rows.filter((row) => row.faction_name === "inochi");
    expect(inochi).toHaveLength(23);
    expect(
      new Set(inochi.map((row) => row.faction_name_at_vote))
    ).toEqual(new Set(["れいわ新選組 新宿"]));
  });

  it("名称の変わっていない7会派は、採決時の名前が現在の表示名と同じ", () => {
    const renamed = R8_2_VOTE_COLUMNS.filter(
      (column) =>
        resolveFactionAtVote(column.nameAtVote, factions).display_name !==
        column.nameAtVote
    ).map((column) => column.heading);
    expect(renamed).toEqual(["れいわ"]);
  });
});

describe("resolveFactionAtVote", () => {
  const refs = [
    { name: "a", display_name: "A会", alternative_names: ["旧A会"] },
    { name: "b", display_name: "B会", alternative_names: [] },
  ];

  it("表示名か別名に一致する会派を返す", () => {
    expect(resolveFactionAtVote("A会", refs).name).toBe("a");
    expect(resolveFactionAtVote("旧A会", refs).name).toBe("a");
  });

  it("一致しない会派名は推測せず例外にする", () => {
    expect(() => resolveFactionAtVote("C会", refs)).toThrow("0件");
  });

  it("複数に一致する会派名は例外にする", () => {
    expect(() =>
      resolveFactionAtVote("A会", [
        ...refs,
        { name: "c", display_name: "C会", alternative_names: ["A会"] },
      ])
    ).toThrow("2件");
  });
});

describe("parseVoteMarks", () => {
  it("○を賛成、×を反対にする", () => {
    expect(parseVoteMarks("○×", 2)).toEqual(["for", "against"]);
  });

  it("列数が合わなければ例外にする", () => {
    expect(() => parseVoteMarks("○○○", 2)).toThrow("3個");
  });

  it("○×以外の記号（欠席・退席など）は推測で埋めず例外にする", () => {
    expect(() => parseVoteMarks("○−", 2)).toThrow("「−」");
  });
});

describe("toFactionStanceImportRows の会派の重複", () => {
  it("2列が同じ会派に当たる場合は、重複行を作らず例外にする", () => {
    const merged = [
      { name: "a", display_name: "A会", alternative_names: ["旧B会"] },
    ];
    expect(() =>
      toFactionStanceImportRows(
        [{ billKey: "bill", titleInSource: "議案", marks: "○○" }],
        merged,
        [{ nameAtVote: "A会" }, { nameAtVote: "旧B会" }]
      )
    ).toThrow("同じ会派");
  });
});

describe("compareStanceTable", () => {
  const columns = [{ heading: "甲" }, { heading: "乙" }];
  const votes = [
    { billKey: "bill-1", titleInSource: "第1号", marks: "○×" },
    { billKey: "bill-2", titleInSource: "第2号", marks: "○○" },
  ];
  const table = {
    headings: ["甲", "乙"],
    rows: [
      { title: "第1号", marks: "○×", result: "可決" },
      { title: "第2号", marks: "○○", result: "可決" },
      // 表の末尾にある議員提出議案は seed に無いので比べない
      { title: "議員提出議案", marks: "××", result: "否決" },
    ],
  };

  it("一致すれば空配列", () => {
    expect(compareStanceTable(table, votes, columns)).toEqual([]);
  });

  it("列ずれ（×の位置違い）を見つける", () => {
    const shifted = [{ ...votes[0], marks: "×○" }, votes[1]];
    expect(compareStanceTable(table, shifted, columns)).toEqual([
      "bill-1: 賛否が違う PDF=○× seed=×○（第1号）",
    ]);
  });

  it("列見出しの違い・議案名の違い・PDFに無い行を見つける", () => {
    const problems = compareStanceTable(
      { headings: ["甲", "丙"], rows: [{ ...table.rows[0], title: "別名" }] },
      votes,
      columns
    );
    expect(problems).toHaveLength(3);
    expect(problems[0]).toContain("列見出しが違う");
    expect(problems[1]).toContain("議案名が違う");
    expect(problems[2]).toContain("bill-2: PDFに2行目がない");
  });
});
