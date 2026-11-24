import {
  TRANSLATION_PARLIAMENTARY_GROUPS,
  TRANSLATION_QUOTATION_EXEMPTIONS,
  TRANSLATION_HEADINGS,
  TRANSLATION_RESULTS,
} from "./translation-terms";

type TextFields = { title: string; summary: string; content: string };
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ERA_BASES: Record<string, number> = {
  令和: 2018,
  平成: 1988,
  昭和: 1925,
  大正: 1911,
  明治: 1867,
};
const MONEY = /(?:約\s*)?\d[\d,]*(?:[億万千](?:\d[\d,]*)?)*円/g;
const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

function digits(value: string): string {
  return value.replace(/,/g, "");
}

function japaneseYen(value: string): bigint {
  let total = 0n;
  let group = 0n;
  for (const part of value.matchAll(/([\d,]+)?(億|万|千)|([\d,]+)/g)) {
    const n = BigInt(digits(part[1] ?? part[3] ?? "0"));
    if (part[2] === "千") group += n * 1000n;
    else if (part[2] === "億" || part[2] === "万") {
      total += (group + n) * (part[2] === "億" ? 100000000n : 10000n);
      group = 0n;
    } else group += n;
  }
  return total + group;
}

type EnglishMoney = {
  text: string;
  coefficient: bigint;
  denominator: bigint;
  unit: bigint;
  scaled: boolean;
};

function englishMoney(text: string): EnglishMoney[] {
  const amounts: EnglishMoney[] = [];
  // A currency prefix or suffix is required; a bare number cannot stand in for yen.
  const pattern =
    /¥\s*([\d,]+(?:\.\d+)?)(?:\s*(thousand|million|billion)\b)?(?:\s+yen\b)?|([\d,]+(?:\.\d+)?)\s*(thousand|million|billion)?\s+yen\b/gi;
  for (const match of text.matchAll(pattern)) {
    const value = digits(match[1] ?? match[3]);
    const unitName = (match[2] ?? match[4] ?? "").toLowerCase();
    const places = value.split(".")[1]?.length ?? 0;
    amounts.push({
      text: match[0],
      coefficient: BigInt(value.replace(".", "")),
      denominator: 10n ** BigInt(places),
      unit:
        { thousand: 1000n, million: 1000000n, billion: 1000000000n }[
          unitName
        ] ?? 1n,
      scaled: unitName === "million" || unitName === "billion",
    });
  }
  return amounts;
}

function exactYen(amount: EnglishMoney, yen: bigint): boolean {
  return amount.coefficient * amount.unit === yen * amount.denominator;
}

function roundedYen(amount: EnglishMoney, yen: bigint): boolean {
  // Integer arithmetic makes half-up rounding independent of floating-point error.
  const rounded =
    (yen * amount.denominator * 2n + amount.unit) / (2n * amount.unit);
  return rounded === amount.coefficient;
}

/** Same-field checks, including reverse provenance of numbers and optional approximations. */
export function checkTranslationNumbers(
  source: string,
  translated: string
): string[] {
  // Japanese can share 円 across a range: both endpoints are monetary amounts.
  source = source.replace(/([\d,]+)([〜～])(?=[\d,]+円)/g, "$1円$2");
  const problems: string[] = [];
  const sourceMoney = [...source.matchAll(MONEY)].map((match) => ({
    text: match[0],
    yen: japaneseYen(match[0]),
    approximate: match[0].startsWith("約"),
  }));
  const targetMoney = englishMoney(translated);
  for (const amount of sourceMoney.filter((amount) => !amount.approximate)) {
    if (!targetMoney.some((target) => exactYen(target, amount.yen))) {
      problems.push(`Missing exact amount: ${amount.text}`);
    }
  }
  for (const amount of targetMoney) {
    if (
      !sourceMoney.some(
        (sourceAmount) =>
          exactYen(amount, sourceAmount.yen) ||
          (amount.scaled && roundedYen(amount, sourceAmount.yen))
      )
    ) {
      problems.push(`Unmatched English amount: ${amount.text}`);
    }
  }

  const allowed = new Set<string>();
  for (const match of source.matchAll(
    /(令和|平成|昭和|大正|明治)(\d+)[〜～](\d+)年度?/g
  )) {
    allowed.add(String(ERA_BASES[match[1]] + Number(match[2])));
    allowed.add(String(ERA_BASES[match[1]] + Number(match[3])));
  }
  for (const amount of sourceMoney) {
    allowed.add(amount.yen.toString());
    // The untranslated coefficient in N thousand yen is also a valid source number.
    const thousand = amount.text.match(/^(?:約\s*)?([\d,]+)千円$/);
    if (thousand) allowed.add(digits(thousand[1]));
  }
  for (const match of source.matchAll(
    /(令和|平成|昭和|大正|明治)(元|\d+)年/g
  )) {
    allowed.add(
      String(ERA_BASES[match[1]] + (match[2] === "元" ? 1 : Number(match[2])))
    );
    if (match[2] !== "元") allowed.add(match[2]);
  }
  // A 24-hour Japanese time may use a narrowly matched 12-hour English time.
  const timeSource = source.replace(/(?<!\d)17時/g, (text) => {
    const expected = "5 p\\.m\\.";
    if (!new RegExp(`\\b${expected}`, "i").test(translated)) {
      problems.push(`Missing translated time: ${text}`);
      return text;
    }
    return "";
  });
  const nonMoneySource = timeSource.replace(MONEY, "");
  const required = [
    ...nonMoneySource
      .replace(/(?:令和|平成|昭和|大正|明治)(?:元|\d+)年(?:度)?/g, "")
      .replace(/\d+月/g, "")
      .matchAll(NUMBER),
  ]
    .map((match) => digits(match[0]))
    .filter((n) => n.replace(".", "").length >= 2);
  for (const match of nonMoneySource.matchAll(NUMBER))
    allowed.add(digits(match[0]));
  const nonMoneyTarget = targetMoney.reduce(
    (text, amount) => text.replace(amount.text, ""),
    translated
  );
  const targetNumbers = [...nonMoneyTarget.matchAll(NUMBER)].map((match) =>
    digits(match[0])
  );
  for (const n of required) {
    if (!targetNumbers.includes(n))
      problems.push(`Missing source number: ${n}`);
  }
  for (const n of targetNumbers.filter((n) => n.replace(".", "").length >= 2)) {
    if (!allowed.has(n)) problems.push(`Unmatched English number: ${n}`);
  }

  const minus = (text: string, pattern: RegExp) =>
    [...text.matchAll(pattern)].map((match) => digits(match[1])).sort();
  if (
    JSON.stringify(minus(source, /△([\d,]+)/g)) !==
    JSON.stringify(minus(translated, /(?<![\p{L}\d])-([\d,]+)/gu))
  ) {
    problems.push(
      "Negative numbers must preserve △N as -N (including multiplicity)"
    );
  }
  if (/[−▲△]\s*\d/.test(translated))
    problems.push("Use ASCII - for negative numbers");

  const dates =
    /(?:(令和|平成|昭和|大正|明治)(元|\d+)年|(\d{4})年（(?:令和|平成|昭和|大正|明治)(?:元|\d+)年）)(\d+)月(\d+)日/g;
  for (const match of source.matchAll(dates)) {
    const year = match[3]
      ? Number(match[3])
      : ERA_BASES[match[1]] + (match[2] === "元" ? 1 : Number(match[2]));
    const expected = `${MONTHS[Number(match[4]) - 1]} ${Number(match[5])}, ${year}`;
    if (!translated.includes(expected))
      problems.push(`Missing translated date: ${expected}`);
  }
  for (const match of source.matchAll(/(\d+)月(\d+)日[〜～](\d+)月(\d+)日/g)) {
    const expected = `${MONTHS[Number(match[1]) - 1]} ${Number(match[2])} to ${MONTHS[Number(match[3]) - 1]} ${Number(match[4])}`;
    if (!translated.includes(expected))
      problems.push(`Missing translated period: ${expected}`);
  }
  // Range endpoints form a pair: an unrelated year elsewhere cannot validate one.
  for (const match of source.matchAll(
    /(令和|平成|昭和|大正|明治)(\d+)年度?(?:[〜～]|から)(?:(令和|平成|昭和|大正|明治))?(\d+)年度?/g
  )) {
    const first = ERA_BASES[match[1]] + Number(match[2]);
    const last = ERA_BASES[match[3] ?? match[1]] + Number(match[4]);
    const pair = new RegExp(
      `${first}(?: \\(Reiwa ${match[2]}\\))?\\s*(?:[–—〜～-]|through|to)\\s*${last}\\b`,
      "i"
    );
    if (!pair.test(translated))
      problems.push(`Missing ordered era range: ${first}–${last}`);
  }
  // Compact source notation omits 年/年度 after its first endpoint.
  for (const match of source.matchAll(
    /(令和|平成|昭和|大正|明治)(\d+)[〜～](\d+)年度?/g
  )) {
    const first = ERA_BASES[match[1]] + Number(match[2]);
    const last = ERA_BASES[match[1]] + Number(match[3]);
    const pair = new RegExp(
      `${first}(?: \\(Reiwa ${match[2]}\\))?\\s*(?:[–—〜～-]|through|to)\\s*${last}\\b`,
      "i"
    );
    if (!pair.test(translated))
      problems.push(`Missing ordered era range: ${first}–${last}`);
  }
  for (const match of translated.matchAll(
    /(\d{4}) \((Reiwa|Heisei|Showa|Taisho|Meiji) (\d+)\)/g
  )) {
    const base = {
      Reiwa: 2018,
      Heisei: 1988,
      Showa: 1925,
      Taisho: 1911,
      Meiji: 1867,
    }[match[2]];
    if (Number(match[1]) !== (base ?? 0) + Number(match[3]))
      problems.push(`Mismatched era year: ${match[0]}`);
  }
  // Preserve current → revised amounts and range endpoints in each table cell.
  const sourceRows = source.match(/^\s*\|.*\|\s*$/gm) ?? [];
  const targetRows = translated.match(/^\s*\|.*\|\s*$/gm) ?? [];
  for (let row = 0; row < sourceRows.length; row++) {
    const original = sourceRows[row].split("|");
    const target = (targetRows[row] ?? "").split("|");
    for (let cell = 0; cell < original.length; cell++) {
      const amounts = [...original[cell].matchAll(MONEY)]
        .filter((m) => !m[0].startsWith("約"))
        .map((m) => japaneseYen(m[0]));
      const translatedAmounts = englishMoney(target[cell] ?? "");
      const ordered = /[〜～→]/.test(original[cell]);
      let position = 0;
      for (const amount of amounts) {
        const next = translatedAmounts.findIndex(
          (candidate, index) =>
            (!ordered || index >= position) && exactYen(candidate, amount)
        );
        if (next < 0) {
          problems.push(
            `Changed ordered table amounts: row ${row + 1}, cell ${cell}`
          );
          break;
        }
        position = next + 1;
      }
    }
  }
  return problems;
}

function headings(text: string, level: number): string[] {
  return [...text.matchAll(new RegExp(`^#{${level}} (.+)$`, "gm"))].map(
    (match) => match[1]
  );
}

/** Count each Markdown structure independently, then check mapped H2 order and H1/title. */
export function checkTranslationStructure(
  source: string,
  translated: string,
  translatedTitle: string
): string[] {
  const problems: string[] = [];
  for (const [name, pattern] of [
    ["H1", /^# /gm],
    ["H2", /^## /gm],
    ["H3", /^### /gm],
    ["table rows", /^\s*\|.*\|\s*$/gm],
    ["list items", /^\s*(?:[-*+] |\d+[.)] )/gm],
    ["quote lines", /^\s*>/gm],
  ] as const) {
    if (
      [...source.matchAll(pattern)].length !==
      [...translated.matchAll(pattern)].length
    ) {
      problems.push(`Changed count of ${name}`);
    }
  }
  const headingTerms: Readonly<Record<string, string | undefined>> =
    TRANSLATION_HEADINGS;
  const expected = headings(source, 2).map((heading) => headingTerms[heading]);
  if (
    expected.includes(undefined) ||
    JSON.stringify(expected) !== JSON.stringify(headings(translated, 2))
  ) {
    problems.push(
      "H2 headings must follow the canonical translations in source order"
    );
  }
  if (
    JSON.stringify(headings(translated, 1)) !==
    JSON.stringify([translatedTitle])
  ) {
    problems.push("Content H1 must equal the translated title");
  }
  problems.push(...checkTranslationQuotations(translated));
  return problems;
}

/** 資料名・ラベルは明示した例外だけを除き、5語以上の引用を機械検査する。 */
export function checkTranslationQuotations(text: string): string[] {
  const problems: string[] = [];
  const short = "(our translation)";
  const long = "(our translation; the same applies to the quotations below)";
  const blocks = [...text.matchAll(/(?:^>.*(?:\n|$))+/gm)];
  for (const block of blocks) {
    if ((block[0].match(/\(our translation\)/g) ?? []).length !== 1)
      problems.push("Each block quotation needs one (our translation)");
  }
  const inlineText = text.replace(/(?:^>.*(?:\n|$))+/gm, (block) =>
    " ".repeat(block.length)
  );
  const quotations = [
    ...inlineText.matchAll(/"([^"\n]+)"|“([^”\n]+)”/g),
  ].filter((match) => {
    const words = (match[1] ?? match[2]).trim().split(/\s+/);
    const span = (match[1] ?? match[2]).replace(/[.,;:]$/, "");
    const hasMarker = inlineText
      .slice(match.index + match[0].length)
      .startsWith(" (our translation");
    return (
      (words.length >= 5 || hasMarker) &&
      !TRANSLATION_QUOTATION_EXEMPTIONS.some((exempt) => exempt === span)
    );
  });
  const markers = [
    ...inlineText.matchAll(
      /\(our translation(?:; the same applies to the quotations below)?\)/g
    ),
  ];
  if (quotations.length) {
    const first = quotations[0];
    const end = first.index + first[0].length;
    const hasLaterBlock = blocks.some((block) => block.index > end);
    const expected = quotations.length === 1 && !hasLaterBlock ? short : long;
    if (!inlineText.slice(end).startsWith(` ${expected}`))
      problems.push(`First inline quotation must be followed by ${expected}`);
    if (markers.length !== 1)
      problems.push(
        "Inline quotation marker must occur exactly once per field"
      );
  } else if (markers.length)
    problems.push("Unexpected inline quotation marker");
  return problems;
}

function groupsInOrder(text: string): string[] {
  return Object.keys(TRANSLATION_PARLIAMENTARY_GROUPS)
    .flatMap((name) =>
      [...text.matchAll(new RegExp(name, "g"))].map((match) => ({
        name,
        index: match.index,
      }))
    )
    .sort((a, b) => a.index - b.index)
    .map(({ name }) => name);
}

/** Canonical result labels, bilingual parliamentary groups, stance membership, and forbidden institutions. */
export function checkTranslationTerminology(
  source: string,
  translated: string
): string[] {
  const problems: string[] = [];
  if (/ward assembly|ward council|ward office/i.test(translated))
    problems.push("Forbidden institution name");
  if (/不認定|否決|修正可決/.test(source)) {
    problems.push(
      "Unsupported result word: add an explicit result mapping before translation"
    );
  }
  const resultSource = source.replace(
    /決算の認定|認定を求める|認定するかどうか|要介護認定/g,
    ""
  );
  for (const [japanese, english] of Object.entries(TRANSLATION_RESULTS)) {
    if (resultSource.includes(japanese) && !translated.includes(english))
      problems.push(`Missing result term: ${english}`);
    if (!resultSource.includes(japanese) && translated.includes(english))
      problems.push(`Unexpected result term: ${english}`);
  }
  if (
    /\b(?:not|never)\s+(?:been\s+)?(?:passed|certified)\b|\b(?:passed|certified)\s+neither\b/i.test(
      translated
    )
  )
    problems.push("Negated result conflicts with the source result");
  const requests = [
    ...source.matchAll(
      /[^。\n]*(?:認定を求める|認定するかどうか)[^。\n]*[。]?/g
    ),
  ];
  if (
    /決算の認定|認定を求める|認定するかどうか/.test(source) &&
    !/certification|whether to certify/i.test(translated)
  )
    problems.push("Missing requested certification term");
  // Compare request sentences in order; a completed result later in the body is valid.
  const englishSentences = translated.split(/(?<=[.!?])\s+/);
  let requestPosition = 0;
  for (const request of requests) {
    const whether = request[0].includes("認定するかどうか");
    const pattern = whether
      ? /\bwhether to certify\b/i
      : /\bseeks?\b[^.!?]*\bcertification\b/i;
    const found = englishSentences.findIndex(
      (sentence, index) => index >= requestPosition && pattern.test(sentence)
    );
    if (found < 0)
      problems.push(
        "Missing requested certification action: seeks certification / whether to certify"
      );
    else requestPosition = found + 1;
  }
  // Without an actual certification in Japanese, unlabelled granted-result claims are forbidden too.
  if (
    !resultSource.includes("認定") &&
    /\b(?:was|has|is|were|had)\s+(?:been\s+)?certified\b|\b(?:granted|approved)\s+certification\b/i.test(
      translated
    )
  )
    problems.push("Unexpected completed certification claim");
  if (
    /\b(?:was|has|is|were|had)\s+(?:been\s+)?certified\b(?!\s*\(認定\))|\b(?:granted|approved)\s+certification\b/i.test(
      translated
    )
  )
    problems.push(
      "Completed certification must use the canonical result label"
    );
  for (const [japanese, english] of Object.entries(
    TRANSLATION_PARLIAMENTARY_GROUPS
  )) {
    if (
      source.includes(japanese) &&
      !translated.includes(`${english} (${japanese})`)
    ) {
      problems.push(`Missing bilingual parliamentary group: ${japanese}`);
    }
    if (!source.includes(japanese) && translated.includes(japanese))
      problems.push(`Unexpected parliamentary group: ${japanese}`);
  }
  for (const [japanese, english] of [
    ["賛成", "For"],
    ["反対", "Against"],
  ] as const) {
    const sourceRows = [
      ...source.matchAll(
        new RegExp(`^- ${japanese}（(\\d+)会派）: (.+)$`, "gm")
      ),
    ];
    const targetRows = [
      ...translated.matchAll(
        new RegExp(
          `^- ${english} \\((\\d+) parliamentary groups\\): (.+)$`,
          "gm"
        )
      ),
    ];
    if (sourceRows.length !== targetRows.length)
      problems.push(`Changed ${english} rows`);
    for (let i = 0; i < sourceRows.length; i++) {
      const original = sourceRows[i];
      const target = targetRows[i];
      if (
        !target ||
        original[1] !== target[1] ||
        Number(original[1]) !== groupsInOrder(original[2]).length ||
        JSON.stringify(groupsInOrder(original[2])) !==
          JSON.stringify(groupsInOrder(target[2]))
      ) {
        problems.push(
          `Changed ${english} parliamentary group count, membership, or order`
        );
      }
    }
  }
  if (
    source.includes("9会派すべてが賛成") &&
    !translated.includes("all 9 parliamentary groups voted for it")
  ) {
    problems.push("Missing unanimous parliamentary group result");
  }
  return problems;
}

export function checkTranslation(
  source: TextFields,
  translated: TextFields
): string[] {
  const problems: string[] = [];
  for (const field of ["title", "summary", "content"] as const) {
    problems.push(
      ...checkTranslationNumbers(source[field], translated[field]).map(
        (p) => `${field}: ${p}`
      )
    );
    if (field !== "content")
      problems.push(
        ...checkTranslationQuotations(translated[field]).map(
          (p) => `${field}: ${p}`
        )
      );
    problems.push(
      ...checkTranslationTerminology(source[field], translated[field]).map(
        (p) => `${field}: ${p}`
      )
    );
  }
  return [
    ...problems,
    ...checkTranslationStructure(
      source.content,
      translated.content,
      translated.title
    ),
  ];
}
