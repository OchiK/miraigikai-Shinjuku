import { describe, expect, it } from "vitest";
import {
  checkTranslation,
  checkTranslationNumbers,
  checkTranslationQuotations,
  checkTranslationStructure,
  checkTranslationTerminology,
} from "./translation-checks";
import { billContentsWithBillSlug } from "./bill-contents-data";
import { r8_3BillTranslationsWithBillSlug } from "./bill-translations-r8-3-data";
import { r8_3GianKey, r8_3NinteiKey } from "./shinjuku-r8-3-inventory";
import { TRANSLATION_PARLIAMENTARY_GROUPS } from "./translation-terms";

function realPair(slug: string) {
  const source = billContentsWithBillSlug.find(
    (row) => row.bill_slug === slug && row.difficulty_level === "normal"
  );
  const translated = r8_3BillTranslationsWithBillSlug.find(
    (row) => row.bill_slug === slug
  );
  if (!source || !translated)
    throw new Error(`Missing real translation: ${slug}`);
  return { source, translated };
}

describe("quotation attribution rules", () => {
  const first = '"the design work spans two fiscal years"';
  const second = '"it cannot be split into separate contracts"';
  const long = "(our translation; the same applies to the quotations below)";
  it("accepts one short marker for a single quotation", () => {
    expect(checkTranslationQuotations(`${first} (our translation)`)).toEqual(
      []
    );
  });
  it("accepts one long marker after the first of several quotations", () => {
    expect(checkTranslationQuotations(`${first} ${long}; ${second}`)).toEqual(
      []
    );
  });
  it("accepts a semantic quotation shorter than the mechanical threshold", () => {
    expect(
      checkTranslationQuotations('"designated housing" (our translation)')
    ).toEqual([]);
  });
  it.each([
    ["missing marker", `${first}; ${second}`],
    ["marker after the second quotation", `${first}; ${second} ${long}`],
    ["repeated marker", `${first} ${long}; ${second} ${long}`],
    [
      "short marker before later quotations",
      `${first} (our translation); ${second}`,
    ],
    [
      "missing block marker",
      `${first} ${long}\n> A translated block without attribution.\n`,
    ],
    [
      "short marker before a later block",
      `${first} (our translation)\n> A block (our translation)\n`,
    ],
  ])("rejects %s", (_name, target) => {
    expect(checkTranslationQuotations(target)).not.toEqual([]);
  });
  it("引用がない本文のインライン注記を検出する", () => {
    expect(checkTranslationQuotations("Text (our translation)")).toContain(
      "Unexpected inline quotation marker"
    );
  });
  it("does not count an earlier block as a quotation below", () => {
    expect(
      checkTranslationQuotations(
        `> Earlier block (our translation)\n\n${first} (our translation)`
      )
    ).toEqual([]);
  });
  it("exempts only the explicit document title and UI label", () => {
    expect(
      checkTranslationQuotations(
        '"Bill Summaries and Deliberation Results," and "Detailed"'
      )
    ).toEqual([]);
    expect(
      checkTranslationQuotations('"Another document with five words"')
    ).not.toEqual([]);
  });
  it("checks a summary independently from the content marker", () => {
    const source = { title: "題", summary: "引用文", content: "# 題" };
    const translated = { title: "Title", summary: first, content: "# Title" };
    expect(
      checkTranslation(source, translated).some((p) =>
        p.startsWith("summary: First inline")
      )
    ).toBe(true);
  });
});

describe("real-data regression mutations", () => {
  it.each([
    [
      r8_3GianKey(63),
      " It was passed as originally proposed (原案可決).",
      "summary: Unexpected result term: passed as originally proposed (原案可決)",
    ],
    [
      r8_3NinteiKey(1),
      " The council certified (認定) it.",
      "summary: Unexpected result term: certified (認定)",
    ],
  ])("原文の要約にない議決結果だけを検出する: %s", (slug, added, message) => {
    const { source, translated } = realPair(slug);
    expect(
      checkTranslation(source, {
        ...translated,
        summary: translated.summary + added,
      })
    ).toEqual([message]);
  });
  it("認定案件の題名から認定要求が消えたことだけを検出する", () => {
    const { source, translated } = realPair(r8_3NinteiKey(1));
    const title = translated.title.replace("Certification of", "").trim();
    expect(title).not.toBe(translated.title);
    expect(
      checkTranslation(source, {
        ...translated,
        title,
        content: translated.content.replace(`# ${translated.title}`, `# ${title}`),
      })
    ).toEqual(["title: Missing requested certification term"]);
  });
  it("認定結果の定型表記がない追加文だけを検出する", () => {
    const { source, translated } = realPair(r8_3NinteiKey(1));
    expect(
      checkTranslation(source, {
        ...translated,
        content: `${translated.content}\n\nIt has been certified by auditors.`,
      })
    ).toEqual([
      "content: Completed certification must use the canonical result label",
    ]);
  });
  it.each([
    73, 74, 75,
  ])("rejects wrong and reversed fiscal range endpoints for Bill %i", (number) => {
    const { source, translated } = realPair(r8_3GianKey(number));
    for (const changed of ["2027–2033", "2032–2027"]) {
      const target = translated.summary.replace("2027–2032", changed);
      expect(target).not.toBe(translated.summary);
      expect(checkTranslationNumbers(source.summary, target)).toContain(
        "Missing ordered era range: 2027–2032"
      );
    }
    const body = translated.content.replace(
      "2027 (Reiwa 9) through 2032 (Reiwa 14)",
      "2032 (Reiwa 14) through 2027 (Reiwa 9)"
    );
    expect(body).not.toBe(translated.content);
    expect(checkTranslationNumbers(source.content, body)).toContain(
      "Missing ordered era range: 2027–2032"
    );
    const wrongEra = translated.content.replace(
      "2032 (Reiwa 14)",
      "2033 (Reiwa 14)"
    );
    expect(checkTranslationNumbers(source.content, wrongEra)).toContain(
      "Mismatched era year: 2033 (Reiwa 14)"
    );
  });
  it("rejects reversed monetary range endpoints and current/revised columns", () => {
    const { source, translated } = realPair(r8_3GianKey(63));
    for (const [original, reversed] of [
      ["¥22,800–¥27,200", "¥27,200–¥22,800"],
      ["¥42,000 | ¥45,700", "¥45,700 | ¥42,000"],
    ]) {
      const target = translated.content.replace(original, reversed);
      expect(target).not.toBe(translated.content);
      expect(
        checkTranslationNumbers(source.content, target).some((p) =>
          p.includes("ordered table amounts")
        )
      ).toBe(true);
    }
  });
  it.each([
    [
      r8_3GianKey(63),
      "passed as originally proposed",
      "not passed as originally proposed",
    ],
    [r8_3NinteiKey(1), "was certified", "was not certified"],
  ])("rejects negated outcomes in %s", (slug, from, to) => {
    const { source, translated } = realPair(slug);
    const target = translated.content.replace(from, to);
    expect(target).not.toBe(translated.content);
    expect(checkTranslationTerminology(source.content, target)).toContain(
      "Negated result conflicts with the source result"
    );
  });
  it("rejects a granted certification substituted for the request in the summary", () => {
    const { source, translated } = realPair(r8_3NinteiKey(1));
    const target = translated.summary.replace(
      "This item seeks council certification of",
      "The council granted certification of"
    );
    expect(target).not.toBe(translated.summary);
    expect(checkTranslationTerminology(source.summary, target)).toContain(
      "Missing requested certification action: seeks certification / whether to certify"
    );
  });
  it("rejects a certified claim substituted for whether to certify in the body", () => {
    const { source, translated } = realPair(r8_3NinteiKey(1));
    const target = translated.content.replace(
      /The council votes on whether to certify this settlement\./,
      "The council has certified this settlement."
    );
    expect(target).not.toBe(translated.content);
    expect(checkTranslationTerminology(source.content, target)).toContain(
      "Missing requested certification action: seeks certification / whether to certify"
    );
  });
  it.each([
    "不認定",
    "否決",
    "修正可決",
  ])("fails loudly on unsupported result word %s", (result) => {
    const { source, translated } = realPair(r8_3GianKey(63));
    const changedSource = source.content.replace("原案可決", result);
    expect(changedSource).not.toBe(source.content);
    expect(
      checkTranslationTerminology(changedSource, translated.content)
    ).toContain(
      "Unsupported result word: add an explicit result mapping before translation"
    );
  });
  it("accepts 17時 as 5 p.m. and rejects a wrong hour in the real text", () => {
    const { source, translated } = realPair(r8_3GianKey(64));
    const target = translated.content;
    expect(source.content).toContain("17時〜翌7時");
    expect(checkTranslationNumbers(source.content, target)).toEqual([]);
    const wrong = target.replace("5 p.m.", "6 p.m.");
    expect(wrong).not.toBe(target);
    expect(checkTranslationNumbers(source.content, wrong)).toContain(
      "Missing translated time: 17時"
    );
  });
});

describe("translation numeric checks", () => {
  it.each([
    ["216万8,065円", "¥2,168,065"],
    ["5億1,473万4千円", "514,734,000 yen"],
    ["33万円", "¥330,000"],
    ["令和9〜14年度", "fiscal 2027–2032 (Reiwa 9–14)"],
    ["第14条の2、44番1号、△17", "Article 14-2, address 44-1, -17"],
    ["22,800〜27,200円", "¥22,800–¥27,200"],
    ["514,734千円", "514,734 thousand yen"],
    ["514,734千円", "¥514,734,000"],
    ["10億円", "¥1 billion"],
    ["1億2千万円", "¥120 million"],
    ["100,000円", "¥100,000 (about ¥0.10 million)"],
    ["1,235,000円", "¥1,235,000 (about ¥1.24 million)"],
    ["約2億9,256万円", "about ¥292.56 million"],
    ["約2億9,256万円", "an approximate amount"],
    [
      "第67号、平成18年度、9月、100件",
      "No. 67, fiscal 2006, September, 100 cases",
    ],
    ["昭和22年法律第67号", "昭和22年法律第67号"],
    ["令和8年10月15日", "October 15, 2026 (Reiwa 8)"],
    ["平成元年10月15日", "October 15, 1989"],
    ["2026年（令和8年）9月16日", "September 16, 2026 (Reiwa 8)"],
    ["9月16日〜10月15日", "September 16 to October 15"],
    ["△3,711千円、△231円、△17", "-3,711 thousand yen, -231 yen, -17"],
  ])("accepts %s → %s", (source, target) => {
    expect(checkTranslationNumbers(source, target)).toEqual([]);
  });

  it.each([
    ["216万8,065円", "¥216,806.5", "Missing exact amount"],
    ["33万円", "¥33,000", "Missing exact amount"],
    [
      "令和9〜14年度",
      "fiscal 2027–2033 (Reiwa 9–14)",
      "Unmatched English number",
    ],
    [
      "第14条の2、44番1号、△17",
      "Article 14-2, address 44-1, 17",
      "Negative numbers",
    ],
    ["22,800〜27,200円", "¥22,800–¥27,000", "Missing exact amount"],
    ["514,734千円", "514,734 yen", "Missing exact amount"],
    ["10億円", "¥1.1 billion", "Unmatched English amount"],
    ["100,000円", "¥100,000 (about ¥0.11 million)", "Unmatched English amount"],
    ["約2億9,256万円", "about ¥292.55 million", "Unmatched English amount"],
    ["100件", "10 cases", "Missing source number"],
    ["第67号", "No. 67 and 99", "Unmatched English number"],
    ["令和8年10月15日", "October 15, 2025", "Missing translated date"],
    [
      "9月16日〜10月15日",
      "September 16 to November 15",
      "Missing translated period",
    ],
    ["△3,711千円", "3,711 thousand yen", "Negative numbers"],
    ["△3,711千円", "−3,711 thousand yen", "Use ASCII"],
    ["△3,711千円", "(3,711 thousand yen)", "Negative numbers"],
    ["△17、△17", "-17", "Negative numbers"],
  ])("rejects %s → %s", (source, target, error) => {
    expect(
      checkTranslationNumbers(source, target).some((problem) =>
        problem.includes(error)
      )
    ).toBe(true);
  });

  it("does not borrow amounts or dates from another field", () => {
    const problems = checkTranslation(
      { title: "33万円", summary: "100件", content: "# 33万円" },
      { title: "100 cases", summary: "¥330,000", content: "# 100 cases" }
    );
    expect(problems).toContain("title: Missing exact amount: 33万円");
    expect(problems).toContain("summary: Unmatched English amount: ¥330,000");
  });
});

describe("translation structure checks", () => {
  const source =
    "# 原題\n## 何が変わるのか\n### 細目\n| 項目 | 金額 |\n|---|---|\n| A | 1円 |\n- 項目\n> 引用\n## 分からないこと\n不明です。";
  const translated =
    "# Title\n## What changes\n### Details\n| Item | Amount |\n|---|---|\n| A | 1 yen |\n- Item\n> Quotation (our translation)\n## What the materials do not say\nUnknown.";
  it("accepts independent counts, mapped heading order and quoted attribution", () => {
    expect(checkTranslationStructure(source, translated, "Title")).toEqual([]);
  });
  it.each([
    ["| A | 1 yen |\n", "", "table rows"],
    ["### Details\n", "", "H3"],
    ["- Item\n", "", "list items"],
    ["> Quotation (our translation)\n", "", "quote lines"],
    [" (our translation)", "", "quotation"],
    ["## What changes", "## What the materials do not say", "H2 headings"],
    ["# Title", "# Another title", "Content H1"],
  ])("rejects missing or changed structure: %s", (from, to, problem) => {
    expect(
      checkTranslationStructure(
        source,
        translated.replace(from, to),
        "Title"
      ).some((value) => value.toLowerCase().includes(problem.toLowerCase()))
    ).toBe(true);
  });
  it("rejects an unmapped Japanese heading", () => {
    expect(
      checkTranslationStructure("# 題\n## 未知", "# Title\n## Unknown", "Title")
    ).toContain(
      "H2 headings must follow the canonical translations in source order"
    );
  });
  it("rejects exchanged H2 headings even when counts match", () => {
    const changed = translated
      .replace("## What changes", "## TEMP")
      .replace("## What the materials do not say", "## What changes")
      .replace("## TEMP", "## What the materials do not say");
    expect(checkTranslationStructure(source, changed, "Title")).not.toEqual([]);
  });
});

describe("translation terminology checks", () => {
  it.each([
    "title",
    "summary",
    "content",
  ] as const)("%s の用語違反を項目名付きで返す", (field) => {
    const source = { title: "題", summary: "概要", content: "# 題" };
    const translated = {
      title: "Title",
      summary: "Summary",
      content: "# Title",
    };
    source[field] = "新宿区議会";
    translated[field] = "Ward Assembly";
    expect(checkTranslation(source, translated)).toContain(
      `${field}: Forbidden institution name`
    );
  });

  it("distinguishes requested certification from a completed council result", () => {
    expect(
      checkTranslationTerminology(
        "決算の認定",
        "Certification of the settlement"
      )
    ).toEqual([]);
    expect(
      checkTranslationTerminology(
        "決算の認定",
        "The settlement was certified (認定)"
      )
    ).toContain("Unexpected completed certification claim");
    expect(
      checkTranslationTerminology(
        "認定を求める案件です。",
        "This item seeks certification."
      )
    ).toEqual([]);
    expect(
      checkTranslationTerminology(
        "認定されました。",
        "This item seeks certification."
      )
    ).toContain("Missing result term: certified (認定)");
    expect(
      checkTranslationTerminology(
        "要介護認定者数は不明。",
        "The number of people certified as needing care is unknown."
      )
    ).toEqual([]);
    expect(
      checkTranslationTerminology(
        "認定されました。",
        "It passed as originally proposed (原案可決)."
      )
    ).toContain("Missing result term: certified (認定)");
    expect(
      checkTranslationTerminology(
        "認定を求める案件です。",
        "This item seeks council certification."
      )
    ).toEqual([]);
    expect(
      checkTranslationTerminology(
        "決算の認定",
        "The settlement was certified (認定)."
      )
    ).toContain("Unexpected completed certification claim");
    expect(
      checkTranslationTerminology(
        "認定されました。",
        "This item seeks certification."
      )
    ).toContain("Missing result term: certified (認定)");
    expect(
      checkTranslationTerminology(
        "要介護認定者数は不明。",
        "The number of people certified as needing long-term care is unknown."
      )
    ).toEqual([]);
  });
  const names = Object.keys(TRANSLATION_PARLIAMENTARY_GROUPS);
  const bilingual = (name: string) =>
    `${TRANSLATION_PARLIAMENTARY_GROUPS[name as keyof typeof TRANSLATION_PARLIAMENTARY_GROUPS]} (${name})`;
  const source = `原案可決\n- 賛成（7会派）: ${names.slice(0, 7).join("、")}\n- 反対（2会派）: ${names.slice(7).join("、")}`;
  const translated = `passed as originally proposed (原案可決)\n- For (7 parliamentary groups): ${names.slice(0, 7).map(bilingual).join(", ")}\n- Against (2 parliamentary groups): ${names.slice(7).map(bilingual).join(", ")}`;
  it("原文にない会派を検出する", () => {
    expect(
      checkTranslationTerminology("会派の記載なし", bilingual(names[0]))
    ).toContain(`Unexpected parliamentary group: ${names[0]}`);
  });
  it.each(["For", "Against"])("%s 行の欠落を検出する", (stance) => {
    const target = translated.replace(`- ${stance} (`, `${stance} (`);
    expect(checkTranslationTerminology(source, target)).toContain(
      `Changed ${stance} rows`
    );
  });
  it("accepts the nine bilingual groups with original stance and order", () => {
    expect(checkTranslationTerminology(source, translated)).toEqual([]);
  });
  it("accepts certification and unanimous voting", () => {
    expect(
      checkTranslationTerminology(
        "認定。9会派すべてが賛成しました。",
        "certified (認定); all 9 parliamentary groups voted for it"
      )
    ).toEqual([]);
  });
  it.each([
    [
      "passed as originally proposed (原案可決)",
      "certified (認定)",
      "Missing result term: passed as originally proposed (原案可決)",
    ],
    [
      bilingual(names[0]),
      "a parliamentary group",
      `Missing bilingual parliamentary group: ${names[0]}`,
    ],
    [
      "For (7 parliamentary groups)",
      "For (6 parliamentary groups)",
      "Changed For parliamentary group count, membership, or order",
    ],
    [
      bilingual(names[0]),
      bilingual(names[7]),
      "Changed For parliamentary group count, membership, or order",
    ],
    [
      bilingual(names[0]),
      names[0],
      `Missing bilingual parliamentary group: ${names[0]}`,
    ],
  ])("結果・会派・賛否・会派数の変更を検出する: %s", (from, to, problem) => {
    expect(
      checkTranslationTerminology(source, translated.replace(from, to))
    ).toContain(problem);
  });
  it("rejects moving a group to the opposing stance while retaining every name", () => {
    const swapped = translated
      .replace(bilingual(names[0]), "TEMP")
      .replace(bilingual(names[7]), bilingual(names[0]))
      .replace("TEMP", bilingual(names[7]));
    expect(checkTranslationTerminology(source, swapped)).toContain(
      "Changed For parliamentary group count, membership, or order"
    );
  });
  it("rejects omission of the unanimous result", () => {
    expect(
      checkTranslationTerminology(
        "9会派すべてが賛成しました。",
        "The council voted for it."
      )
    ).toContain("Missing unanimous parliamentary group result");
  });
  it.each([
    "Ward Assembly",
    "WARD COUNCIL",
    "ward office",
  ])("rejects %s", (name) => {
    expect(checkTranslationTerminology("新宿区議会", name)).toContain(
      "Forbidden institution name"
    );
  });
});
