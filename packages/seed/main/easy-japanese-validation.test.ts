import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import { splitIntoSentences } from "./easy-japanese-text";
import { gianKey } from "./shinjuku-r8-2-inventory";

/**
 * やさしい日本語版（difficulty_level: "easy"）の機械的な検証。
 *
 * 根拠は docs/I18N_AND_EASY_JAPANESE.md と
 * docs/20260917_1800_デザインシステム定義.md §3「難易度とルビ」。
 * easy 段の規約は「1文40字以内」「1文1情報」「行政用語には短い言い換え」。
 *
 * 数字・日付・金額は勝手に丸めないという原則があるため、
 * 一次資料由来の主要な数値が本文に残っているかも併せて検証する。
 */

/** easy 段の1文の上限（デザインシステム定義 §3）。 */
const EASY_MAX_SENTENCE_LENGTH = 40;

/** Phase 2 で先行整備するパイロット3議案。 */
const PILOT_BILL_SLUGS = [gianKey(42), gianKey(43), gianKey(44)];

const easyContents = billContentsWithBillSlug.filter(
  (content) => content.difficulty_level === "easy"
);

describe("やさしい日本語版の整備状況", () => {
  it("パイロット3議案すべてに easy 版がある", () => {
    const slugs = easyContents.map((content) => content.bill_slug);

    expect(slugs.sort()).toEqual([...PILOT_BILL_SLUGS].sort());
  });

  it("同じ議案に easy 版が重複しない", () => {
    const slugs = easyContents.map((content) => content.bill_slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(PILOT_BILL_SLUGS)("%s には normal 版も残っている", (slug) => {
    const normal = billContentsWithBillSlug.find(
      (content) =>
        content.bill_slug === slug && content.difficulty_level === "normal"
    );

    expect(normal).toBeDefined();
  });
});

describe("やさしい日本語版の必須フィールド", () => {
  it.each(easyContents)(
    "$bill_slug は title/summary/content が空でない",
    (content) => {
      expect(content.title.trim()).not.toBe("");
      expect(content.summary.trim()).not.toBe("");
      expect(content.content.trim()).not.toBe("");
    }
  );
});

describe("やさしい日本語版の1文の長さ", () => {
  it.each(easyContents)("$bill_slug の title は40字以内", (content) => {
    expect(content.title.length).toBeLessThanOrEqual(EASY_MAX_SENTENCE_LENGTH);
  });

  it.each(easyContents)("$bill_slug の summary は各文40字以内", (content) => {
    const tooLong = splitIntoSentences(content.summary).filter(
      (sentence) => sentence.length > EASY_MAX_SENTENCE_LENGTH
    );

    expect(tooLong).toEqual([]);
  });

  it.each(easyContents)("$bill_slug の content は各文40字以内", (content) => {
    const tooLong = splitIntoSentences(content.content).filter(
      (sentence) => sentence.length > EASY_MAX_SENTENCE_LENGTH
    );

    expect(tooLong).toEqual([]);
  });
});

describe("やさしい日本語版が一次資料の数値を保っている", () => {
  /**
   * 出典に書かれた数値・日付・条件のうち、言い換えの過程で
   * 丸められたり落ちたりしやすいものを抜き取って検証する。
   */
  const requiredFacts: Record<string, string[]> = {
    [gianKey(42)]: [
      "2億9,256万4千円",
      "1,892億9,334万1千円",
      "20% → 30%",
      "150,000冊",
      "1万円で 1万3千円分",
      "1億6,022万4千円",
      "928万4千円",
      "1億2,305万6千円",
      "原案可決",
    ],
    [gianKey(43)]: [
      "2億8,965万7千円",
      "1,895億8,299万8千円",
      "75歳以上",
      "高用量",
      "無料",
      "15校",
      "985万3千円",
      "令和9年1月",
      "原案可決",
    ],
    [gianKey(44)]: [
      "新宿区基本構想",
      "第3条第1項",
      "平成19年 新宿区条例 第61号",
      "第96条 第2項",
      "公布の日",
      "原案可決",
    ],
  };

  it.each(Object.entries(requiredFacts))(
    "%s の主要な事実が本文に残っている",
    (slug, facts) => {
      const content = easyContents.find((item) => item.bill_slug === slug);
      if (content == null) {
        throw new Error(`easy 版が見つからない: ${slug}`);
      }

      const haystack = `${content.title}\n${content.summary}\n${content.content}`;
      const missing = facts.filter((fact) => !haystack.includes(fact));

      expect(missing).toEqual([]);
    }
  );
});

describe("やさしい日本語版が行政用語を言い換えている", () => {
  /** 用語 → 併記すべき短い言い換え。 */
  const glossedTerms: { slug: string; term: string; gloss: string }[] = [
    {
      slug: gianKey(42),
      term: "補正予算",
      gloss: "あとから 足す お金（補正予算）",
    },
    {
      slug: gianKey(43),
      term: "補正予算",
      gloss: "あとから 足す お金（補正予算）",
    },
    { slug: gianKey(42), term: "繰入金", gloss: "貯金を くずす（繰入金）" },
    { slug: gianKey(43), term: "繰入金", gloss: "貯金を くずす（繰入金）" },
    { slug: gianKey(42), term: "特別区債", gloss: "区の 借金（特別区債）" },
    {
      slug: gianKey(43),
      term: "都支出金",
      gloss: "東京都からの お金（都支出金）",
    },
    { slug: gianKey(42), term: "原案可決", gloss: "決まりました（原案可決）" },
    { slug: gianKey(43), term: "原案可決", gloss: "決まりました（原案可決）" },
    { slug: gianKey(44), term: "原案可決", gloss: "決まりました（原案可決）" },
  ];

  function countOccurrences(haystack: string, needle: string): number {
    return haystack.split(needle).length - 1;
  }

  it.each(glossedTerms)(
    "$slug の $term は必ず言い換えを伴って出てくる",
    ({ slug, term, gloss }) => {
      const content = easyContents.find((item) => item.bill_slug === slug);
      if (content == null) {
        throw new Error(`easy 版が見つからない: ${slug}`);
      }

      // 出現回数まで見ないと、別の場所に素の行政用語が
      // 言い換え無しで混ざっても通ってしまう。
      expect(countOccurrences(content.content, gloss)).toBeGreaterThan(0);
      expect(countOccurrences(content.content, term)).toBe(
        countOccurrences(content.content, gloss)
      );
    }
  );
});
