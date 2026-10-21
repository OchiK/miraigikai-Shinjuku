import { describe, expect, it } from "vitest";
import { factions } from "./data";
import {
  compareStanceTable,
  dropUnseededRows,
  parseVoteMarks,
  R8_1_VOTE_COLUMNS,
  r8_1BillVotes,
  R8_2_VOTE_COLUMNS,
  r8_2BillVotes,
  R8_3_UNSEEDED_ROWS,
  R8_3_VOTE_COLUMNS,
  r8_3BillVotes,
  resolveFactionAtVote,
  toFactionStanceImportRows,
} from "./shinjuku-faction-stances";
import {
  buildR8_1ItemKey,
  r8_1GianKey,
  r8_1GiinKey,
  r8_1ShoninKey,
  r8FirstSessionItems,
  toR8_1BillInserts,
} from "./shinjuku-r8-1-inventory";
import {
  buildItemKey,
  gianKey,
  giinKey,
  r8SecondSessionItems,
  toBillInserts,
} from "./shinjuku-r8-2-inventory";
import { r8_3GiinKey, toR8_3BillInserts } from "./shinjuku-r8-3-inventory";

const rows = toFactionStanceImportRows(r8_2BillVotes, factions);
/** 議員提出議案の slug（区長提出議案の反対と分けて数えるため） */
const councilorSlugs = new Set(
  r8SecondSessionItems.filter((i) => i.itemType === "giin").map(buildItemKey)
);


const r8_1Rows = toFactionStanceImportRows(r8_1BillVotes, factions, R8_1_VOTE_COLUMNS);
const r8_1CouncilorSlugs = new Set(
  r8FirstSessionItems.filter((i) => i.itemType === "giin").map(buildR8_1ItemKey)
);

describe("令和8年第1回定例会の会派賛否", () => {
  it("DB の議案48件すべてを1回ずつ持つ", () => {
    const billSlugs = new Set(toR8_1BillInserts().map((bill) => bill.slug));
    expect(r8_1BillVotes.map((bill) => bill.billKey)).toHaveLength(48);
    for (const bill of r8_1BillVotes) {
      expect(billSlugs.has(bill.billKey)).toBe(true);
    }
  });

  it("48議案×8会派＝384行になる", () => {
    expect(r8_1Rows).toHaveLength(384);
  });

  it("区長提出議案の反対は共産9件・れいわ6件", () => {
    const against = r8_1Rows
      .filter(
        (row) =>
          row.type === "against" &&
          !r8_1CouncilorSlugs.has(row.bill_slug)
      )
      .map((row) => [row.bill_slug, row.faction_name]);

    const kyosanAgainst = against.filter(([_, f]) => f === "kyosan").map(([slug]) => slug);
    expect(kyosanAgainst).toEqual([
      r8_1GianKey(1),
      r8_1GianKey(2),
      r8_1GianKey(38),
      r8_1GianKey(3),
      r8_1GianKey(4),
      r8_1GianKey(6),
      r8_1GianKey(9),
      r8_1GianKey(17),
      r8_1GianKey(41),
    ]);

    const inochiAgainst = against.filter(([_, f]) => f === "inochi").map(([slug]) => slug);
    expect(inochiAgainst).toEqual([
      r8_1GianKey(1),
      r8_1GianKey(2),
      r8_1GianKey(38),
      r8_1GianKey(3),
      r8_1GianKey(4),
      r8_1GianKey(41),
    ]);
  });

  it("否決された議員提出議案第1〜5号は、共産とれいわだけが賛成", () => {
    for (let i = 1; i <= 5; i++) {
      const key = r8_1GiinKey(i);
      const forFactions = r8_1Rows
        .filter((row) => row.bill_slug === key && row.type === "for")
        .map((row) => row.faction_name);
      expect(forFactions).toEqual(["kyosan", "inochi"]);
    }
  });

  it("意見書（議員提出議案第6号）は全8会派が賛成", () => {
    const key = r8_1GiinKey(6);
    expect(
      r8_1Rows.filter((row) => row.bill_slug === key).map((row) => row.type)
    ).toEqual(Array(8).fill("for"));
  });

  it("採決後に結成されたアップデート新宿の行は作らない", () => {
    expect(r8_1Rows.some((row) => row.faction_name === "update")).toBe(false);
  });
});

describe("令和8年第2回定例会の会派賛否", () => {
  it("DB の議案27件すべてを、表の並び（区長提出→議員提出）で1回ずつ持つ", () => {
    const billSlugs = toBillInserts().map((bill) => bill.slug);
    expect(r8_2BillVotes.map((bill) => bill.billKey)).toEqual(billSlugs);
  });

  it("27議案×8会派＝216行になる", () => {
    expect(rows).toHaveLength(216);
  });

  it("区長提出議案の反対は4行だけ（第42号・現役、第45号・第49号・れいわ、第54号・共産）", () => {
    const against = rows
      .filter(
        (row) =>
          row.type === "against" &&
          !councilorSlugs.has(row.bill_slug)
      )
      .map((row) => [row.bill_slug, row.faction_name]);
    expect(against).toEqual([
      [gianKey(42), "genekisedai"],
      [gianKey(45), "inochi"],
      [gianKey(49), "inochi"],
      [gianKey(54), "kyosan"],
    ]);
  });

  it("否決された議員提出議案第7・8号は、共産とれいわだけが賛成", () => {
    for (const key of [giinKey(7), giinKey(8)]) {
      const forFactions = rows
        .filter((row) => row.bill_slug === key && row.type === "for")
        .map((row) => row.faction_name);
      expect(forFactions).toEqual(["kyosan", "inochi"]);
    }
  });

  it("意見書（第9・10号）は全会派が賛成", () => {
    for (const key of [giinKey(9), giinKey(10)]) {
      expect(
        rows.filter((row) => row.bill_slug === key).map((row) => row.type)
      ).toEqual(Array(8).fill("for"));
    }
  });

  it("採決後に結成されたアップデート新宿の行は作らない", () => {
    expect(rows.some((row) => row.faction_name === "update")).toBe(false);
  });

  it("れいわ新選組 新宿の列は、名称変更後の inochi に採決時の名前つきで入る", () => {
    const inochi = rows.filter((row) => row.faction_name === "inochi");
    expect(inochi).toHaveLength(27);
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

const r8_3Rows = toFactionStanceImportRows(
  r8_3BillVotes,
  factions,
  R8_3_VOTE_COLUMNS
);

describe("令和8年第3回定例会の会派賛否", () => {
  it("議員提出議案第11〜14号の4件だけを持ち、いずれも DB の議案にある", () => {
    const billSlugs = new Set(toR8_3BillInserts().map((bill) => bill.slug));
    expect(r8_3BillVotes.map((bill) => bill.billKey)).toEqual([
      r8_3GiinKey(11),
      r8_3GiinKey(12),
      r8_3GiinKey(13),
      r8_3GiinKey(14),
    ]);
    for (const bill of r8_3BillVotes) {
      expect(billSlugs.has(bill.billKey)).toBe(true);
    }
  });

  it("列は表の見出しどおりの9会派で、すべて DB の会派の表示名と一致する", () => {
    expect(R8_3_VOTE_COLUMNS.map((column) => column.heading)).toEqual([
      "自参ク",
      "公明",
      "共産",
      "新宿会",
      "民無ク",
      "維新",
      "現役",
      "いのち",
      "アプデ",
    ]);
    for (const column of R8_3_VOTE_COLUMNS) {
      expect(
        resolveFactionAtVote(column.nameAtVote, factions).display_name
      ).toBe(column.nameAtVote);
    }
  });

  it("4議案×9会派＝36行になり、アップデート新宿の行も作る", () => {
    expect(r8_3Rows).toHaveLength(36);
    expect(r8_3Rows.filter((row) => row.faction_name === "update")).toHaveLength(
      4
    );
  });

  it("否決された第11・12号は、共産といのちだけが賛成", () => {
    for (const itemNumber of [11, 12]) {
      const forFactions = r8_3Rows
        .filter(
          (row) =>
            row.bill_slug === r8_3GiinKey(itemNumber) && row.type === "for"
        )
        .map((row) => row.faction_name);
      expect(forFactions).toEqual(["kyosan", "inochi"]);
    }
    expect(
      r8_3BillVotes.slice(0, 2).map((bill) => bill.marks)
    ).toEqual(["××○××××○×", "××○××××○×"]);
  });

  it("意見書（第13・14号）は全9会派が賛成", () => {
    for (const itemNumber of [13, 14]) {
      const votes = r8_3Rows.filter(
        (row) => row.bill_slug === r8_3GiinKey(itemNumber)
      );
      expect(votes).toHaveLength(9);
      expect(votes.every((row) => row.type === "for")).toBe(true);
    }
  });
});

describe("R8_3_UNSEEDED_ROWS", () => {
  it("区長提出22件・同意1件・諮問1行の24件名で、議員提出議案4件と合わせて表の28行になる", () => {
    expect(R8_3_UNSEEDED_ROWS.titles).toHaveLength(24);
    expect(new Set(R8_3_UNSEEDED_ROWS.titles).size).toBe(24);
    expect(R8_3_UNSEEDED_ROWS.titles.length + r8_3BillVotes.length).toBe(
      R8_3_UNSEEDED_ROWS.tableRows
    );
    expect(R8_3_UNSEEDED_ROWS.tableRows).toBe(28);
  });

  it("第76号議案は表の表記（第Ⅱ期）で除き、seed の件名は除外リストに入らない", () => {
    expect(R8_3_UNSEEDED_ROWS.titles).toContain(
      "道路改良工事（江戸川橋通り第Ⅱ期）請負契約"
    );
    expect(R8_3_UNSEEDED_ROWS.titles).not.toContain(
      "道路改良工事（江戸川橋通り第2)期）請負契約"
    );
    for (const bill of r8_3BillVotes) {
      expect(R8_3_UNSEEDED_ROWS.titles).not.toContain(bill.titleInSource);
    }
  });
});

describe("dropUnseededRows", () => {
  const table = {
    headings: ["甲"],
    rows: [
      { title: "区長提出", marks: "○", result: "可決" },
      { title: "諮問", marks: "○", result: "決定" },
      { title: "議員提出", marks: "×", result: "否決" },
    ],
  };
  const unseeded = { titles: ["区長提出", "諮問"], tableRows: 3 };

  it("除外リストの件名の行を除き、ほかの行の並びは保つ", () => {
    expect(dropUnseededRows(table, unseeded, 1)).toEqual({
      table: {
        headings: ["甲"],
        rows: [{ title: "議員提出", marks: "×", result: "否決" }],
      },
      problems: [],
    });
  });

  it("除外リストにあるのに表に無い件名を報告する", () => {
    expect(
      dropUnseededRows(
        table,
        { titles: ["区長提出", "存在しない"], tableRows: 3 },
        2
      ).problems
    ).toEqual(["除外リストの件名がPDFに無い: 存在しない"]);
  });

  it("表の行数と、除いたあとの行数が seed の件数と違えば報告する", () => {
    const problems = dropUnseededRows(
      table,
      { titles: ["区長提出"], tableRows: 4 },
      1
    ).problems;
    expect(problems).toHaveLength(2);
    expect(problems[0]).toBe("PDFの表が3行ある（4行のはず）");
    expect(problems[1]).toContain("除いたあとのPDFの行が2行ある（seed は1件）");
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
