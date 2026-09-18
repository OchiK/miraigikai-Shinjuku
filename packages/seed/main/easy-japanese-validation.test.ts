import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import {
  splitIntoSentences,
  stripAnchorGloss,
} from "./easy-japanese-text";
import { gianKey } from "./shinjuku-r8-2-inventory";

/**
 * やさしい日本語版（difficulty_level: "easy"）の機械的な検証。
 *
 * 根拠は docs/I18N_AND_EASY_JAPANESE.md、
 * docs/20260918_1200_やさしい日本語_再設計方針.md、
 * docs/20260917_1800_デザインシステム定義.md §3「難易度とルビ」。
 * easy 段の規約は「1文40字以内」「1文1情報」
 * 「行政用語はアンカー保持プロトコルで残す」「日付は西暦（＋曜日）」。
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
    // summary / content と同じ数えかたにそろえる。
    // タイトルだけアンカーを字数に入れると、
    // タイトルに公式名称を残すほど不利になってしまう。
    expect(stripAnchorGloss(content.title).length).toBeLessThanOrEqual(
      EASY_MAX_SENTENCE_LENGTH
    );
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
      "2027年（令和9年）1月",
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

describe("やさしい日本語版が日付を西暦で示している", () => {
  /**
   * 元号だけの日付は、外国人住民が手元のカレンダーと照合できない。
   * 提出日・会期・年度のように読み手が日付として読む箇所は、
   * `2026年（令和8年）6月10日（水）` のように西暦に換算して併記する。
   *
   * 法令番号・条例番号（例「平成19年 新宿区条例 第61号」
   * 「昭和43年法律第100号」）は日付ではなく識別子なので対象外とする。
   * 西暦に直すと公式の表記と一致しなくなり、照合できなくなる。
   */
  const ERA_DATE = /(?:令和|平成|昭和)[\d０-９]+年(?:度|[\d０-９]+月(?:[\d０-９]+日)?)?/g;

  /** 直前が `2026年（` `2026年度（` になっているか。 */
  const PAIRED_WITH_GREGORIAN = /20\d{2}年度?（$/;

  /** 法令番号・条例番号の一部か。 */
  function isStatuteNumber(haystack: string, end: number): boolean {
    return /^\s*(?:新宿区条例|東京都条例|条例|法律|政令|省令)/.test(
      haystack.slice(end)
    );
  }

  /**
   * 西暦との併記（`2026年（令和8年）`）になっていない元号表記を拾う。
   *
   * 本文全体の includes で免責すると、1か所でも併記があれば
   * 別の場所に裸の元号が残っていても通ってしまう。
   * 出現位置ごとに直前の文字を見る。
   */
  function bareEraDates(haystack: string): string[] {
    return [...haystack.matchAll(ERA_DATE)]
      .filter((match) => {
        const start = match.index ?? 0;
        // 「（令和8年）」で免責すると、西暦の無い括弧書きが素通りする。
        // 直前が西暦であることまで見る。
        const isPaired = PAIRED_WITH_GREGORIAN.test(haystack.slice(0, start));

        return !isPaired && !isStatuteNumber(haystack, start + match[0].length);
      })
      .map((match) => match[0]);
  }

  it.each(easyContents)("$bill_slug に元号だけの日付が残っていない", (content) => {
    const haystack = `${content.title}\n${content.summary}\n${content.content}`;

    expect(bareEraDates(haystack)).toEqual([]);
  });

  it("裸の元号と法令番号を見分けられる", () => {
    // 検査そのものの回帰テスト。
    // 免責が広すぎると、この describe 全体が意味を失う。
    expect(bareEraDates("2026年（令和8年）6月10日（水）に 出しました")).toEqual([]);
    expect(bareEraDates("平成19年 新宿区条例 第61号です")).toEqual([]);
    expect(bareEraDates("都市計画法（昭和43年法律第100号）")).toEqual([]);
    expect(bareEraDates("令和8年6月10日に 出しました")).toEqual(["令和8年6月10日"]);
    expect(bareEraDates("2026年（令和8年）と 令和9年度")).toEqual(["令和9年度"]);
    expect(bareEraDates("2026年度（令和8年度）の 終わり")).toEqual([]);
    // 西暦を伴わない括弧書きは免責しない。
    expect(bareEraDates("区の 予算（令和8年度）です")).toEqual(["令和8年度"]);
    // 全角数字の元号も拾う。
    expect(bareEraDates("令和８年６月１０日に 出しました")).toEqual([
      "令和８年６月１０日",
    ]);
  });

  it.each(easyContents)("$bill_slug に西暦の日付がある", (content) => {
    expect(content.content).toMatch(/20\d{2}年/);
  });

  it.each(easyContents)("$bill_slug の会期が西暦と曜日で書かれている", (content) => {
    // 会期の日付そのものは議案ごとに違う。
    // 別の定例会の easy 版を足したときに落ちないよう、形式だけを見る。
    const session = content.content.match(/^会期は .+$/m)?.[0];

    expect(session).toMatch(
      /^会期は 20\d{2}年\d{1,2}月\d{1,2}日（[日月火水木金土]）から .*\d{1,2}月\d{1,2}日（[日月火水木金土]）まででした。$/
    );
  });
});

describe("やさしい日本語版が行政用語のアンカーを保っている", () => {
  /**
   * アンカー保持プロトコル（docs/20260918_1200_やさしい日本語_再設計方針.md）。
   * 公式用語は平易語に置き換えて消さず、
   * 初出を【正式名称】［ふりがな］（＝やさしい言いかえ）で書き、
   * 2回目以降は【正式名称】だけにする。
   *
   * 窓口の看板・申請書の見出しと照合できることが目的なので、
   * 「言いかえに置き換わっていないこと」まで見る必要がある。
   */
  const anchoredTerms: {
    slug: string;
    term: string;
    yomi: string;
    gloss: string;
  }[] = [
    {
      slug: gianKey(42),
      term: "補正予算",
      yomi: "ほせいよさん",
      gloss: "あとから 足す お金",
    },
    {
      slug: gianKey(43),
      term: "補正予算",
      yomi: "ほせいよさん",
      gloss: "あとから 足す お金",
    },
    {
      slug: gianKey(42),
      term: "繰入金",
      yomi: "くりいれきん",
      gloss: "貯金を くずす お金",
    },
    {
      slug: gianKey(43),
      term: "繰入金",
      yomi: "くりいれきん",
      gloss: "貯金を くずす お金",
    },
    {
      slug: gianKey(42),
      term: "特別区債",
      yomi: "とくべつくさい",
      gloss: "区の 借金",
    },
    {
      slug: gianKey(43),
      term: "都支出金",
      yomi: "とししゅつきん",
      gloss: "東京都からの お金",
    },
    {
      slug: gianKey(42),
      term: "原案可決",
      yomi: "げんあんかけつ",
      gloss: "出した 通りの 内容で 決まること",
    },
    {
      slug: gianKey(43),
      term: "原案可決",
      yomi: "げんあんかけつ",
      gloss: "出した 通りの 内容で 決まること",
    },
    {
      slug: gianKey(44),
      term: "原案可決",
      yomi: "げんあんかけつ",
      gloss: "出した 通りの 内容で 決まること",
    },
    {
      slug: gianKey(44),
      term: "新宿区基本構想",
      yomi: "しんじゅくくきほんこうそう",
      gloss: "区の 大もとの 考え",
    },
    {
      slug: gianKey(44),
      term: "公布の日",
      yomi: "こうふのひ",
      gloss: "決まりを 区民に 知らせる 日",
    },
  ];

  function countOccurrences(haystack: string, needle: string): number {
    return haystack.split(needle).length - 1;
  }

  function escapeForRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findEasyContent(slug: string) {
    const content = easyContents.find((item) => item.bill_slug === slug);
    if (content == null) {
      throw new Error(`easy 版が見つからない: ${slug}`);
    }

    return content;
  }

  it.each(anchoredTerms)(
    "$slug の $term は初出が【正式名称】［ふりがな］（＝言いかえ）である",
    ({ slug, term, yomi, gloss }) => {
      const { content } = findEasyContent(slug);
      const anchor = `【${term}】［${yomi}］（＝${gloss}）`;

      expect(countOccurrences(content, anchor)).toBe(1);
      // 正式名称の初出が、アンカーの中の1文字目（【の次）であることを見る。
      // 言いかえだけを先に出して正式名称を後回しにすると落ちる。
      expect(content.indexOf(term)).toBe(content.indexOf(anchor) + 1);
    }
  );

  it.each(anchoredTerms)(
    "$slug の $term は言いかえだけに置き換わっていない",
    ({ slug, term }) => {
      const { content } = findEasyContent(slug);

      expect(countOccurrences(content, term)).toBeGreaterThan(0);
    }
  );

  it.each(easyContents)(
    "$bill_slug の【】で囲んだ用語はすべて初出にふりがなと言いかえがある",
    (content) => {
      // 上のリストは「この用語は必ずアンカーであること」を固定する。
      // こちらは逆向きに、本文に現れた【】を総当たりで見る。
      // 議案を足したときにリストの更新漏れがあっても規約が効く。
      const terms = [
        ...new Set(
          [...content.content.matchAll(/【([^】]+)】/g)].map(
            (match) => match[1]
          )
        ),
      ];
      const withoutAnchor = terms.filter(
        (term) =>
          !new RegExp(
            `【${escapeForRegExp(term)}】［[^］]+］（＝[^）]+）`
          ).test(content.content)
      );

      expect(withoutAnchor).toEqual([]);
    }
  );

  it.each(anchoredTerms)(
    "$slug の $term のふりがなと言いかえは初出の1回だけ",
    ({ slug, term, yomi, gloss }) => {
      const { content } = findEasyContent(slug);

      expect(countOccurrences(content, `［${yomi}］`)).toBe(1);
      expect(countOccurrences(content, `（＝${gloss}）`)).toBe(1);
    }
  );
});
