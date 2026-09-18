import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import {
  splitIntoSentences,
  stripAnchorGloss,
} from "./easy-japanese-text";
import {
  buildItemKey,
  gianKey,
  r8SecondSessionItems,
  shoninKey,
} from "./shinjuku-r8-2-inventory";

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

/**
 * 令和8年第2回定例会の全23案件。
 * Phase 2 のパイロット3議案（第42・43・44号議案）に続き、
 * 承認第2・3号と第45〜62号議案の easy 版を整備して全件を満たした。
 */
const ALL_BILL_SLUGS = r8SecondSessionItems.map(buildItemKey);

const easyContents = billContentsWithBillSlug.filter(
  (content) => content.difficulty_level === "easy"
);

describe("やさしい日本語版の整備状況", () => {
  it("全23案件に easy 版がある", () => {
    const slugs = easyContents.map((content) => content.bill_slug);

    expect(slugs.sort()).toEqual([...ALL_BILL_SLUGS].sort());
  });

  it("同じ議案に easy 版が重複しない", () => {
    const slugs = easyContents.map((content) => content.bill_slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(ALL_BILL_SLUGS)("%s には normal 版も残っている", (slug) => {
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
    [shoninKey(2)]: [
      "昭和39年 新宿区条例 第57号",
      "2026年（令和8年）3月31日（火）",
      "新宿区告示 第202号",
      "2028年度（令和10年度）",
      "2030年（令和12年）12月31日（火）",
      "2029年度（令和11年度）",
      "承認しました",
    ],
    [shoninKey(3)]: [
      "昭和28年 新宿区条例 第8号",
      "新宿区告示 第203号",
      "2026年4月1日（水）",
      "承認しました",
    ],
    [gianKey(45)]: [
      "平成27年 新宿区条例 第47号",
      "1年10か月",
      "原案可決",
    ],
    [gianKey(46)]: [
      "平成10年 新宿区条例 第11号",
      "第9条の6",
      "2026年（令和8年）10月1日（木）",
      "原案可決",
    ],
    [gianKey(47)]: [
      "昭和39年 新宿区条例 第57号",
      "2027年（令和9年）1月1日（金）",
      "900万円以下",
      "95万円以下",
      "第24条の3",
      "原案可決",
    ],
    [gianKey(48)]: [
      "9,700円",
      "10,000円",
      "14,500円",
      "15,000円",
      "383円",
      "433円",
      "31万5,000円",
      "33万円",
      "2026年6月1日（月）",
      "原案可決",
    ],
    [gianKey(49)]: [
      "昭和50年 新宿区条例 第17号",
      "平成12年 新宿区条例 第5号",
      "平成14年 新宿区条例 第48号",
      "51,870人",
      "原案可決",
    ],
    [gianKey(50)]: [
      "平成26年 新宿区条例 第28号",
      "平成26年 厚生労働省令 第61号",
      "第6条の3 第10項 第3号",
      "第1号と 第2号に 限ります",
      "第2号の 次に 第3号を 足します",
      "原案可決",
    ],
    [gianKey(51)]: [
      "第37条 第3項",
      "第39条 第3項",
      "第42条 第8項",
      "第51条の2",
      "原案可決",
    ],
    [gianKey(52)]: [
      "平成14年 新宿区条例 第43号",
      "厚生労働省令 第69号",
      "原案可決",
    ],
    [gianKey(53)]: [
      "平成8年 新宿区条例 第43号",
      "2026年（令和8年）10月1日（木）",
      "原案可決",
    ],
    [gianKey(54)]: [
      "平成19年 新宿区条例 第57号",
      "新宿区告示 第275号",
      "新宿区告示 第262号",
      "原案可決",
    ],
    [gianKey(55)]: [
      "平成12年 新宿区条例 第58号",
      "第11条の5",
      "2026年（令和8年）10月1日（木）",
      "原案可決",
    ],
    [gianKey(56)]: [
      "14,175円",
      "14,397円",
      "15,198円",
      "16,467円",
      "17,259円",
      "17,496円",
      "17,937円",
      "2026年6月1日（月）",
      "原案可決",
    ],
    [gianKey(57)]: [
      "2億5,850万円",
      "長永スポーツ工業株式会社",
      "8,000万円",
      "2027年（令和9年）3月15日（月）",
      "原案可決",
    ],
    [gianKey(58)]: [
      "3億8,489万円",
      "株式会社五藤光学研究所",
      "5,000万円",
      "2027年（令和9年）6月30日（水）",
      "原案可決",
    ],
    [gianKey(59)]: [
      "7,513万3,509円",
      "160,000食",
      "51,000枚",
      "2,000缶",
      "5,100パック",
      "3億91万5,000円",
      "原案可決",
    ],
    [gianKey(60)]: [
      "7,930万7,800円",
      "737基",
      "30基",
      "767基",
      "1,000万円",
      "原案可決",
    ],
    [gianKey(61)]: [
      "2億4,685万9,800円",
      "常盤工業株式会社",
      "1億円",
      "2027年（令和9年）3月29日（月）",
      "原案可決",
    ],
    [gianKey(62)]: [
      "6億3,140万円",
      "6億4,068万4,000円",
      "928万4,000円",
      "4.5%",
      "2025年6月20日（金）",
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
    return /^\s*(?:新宿区条例|東京都条例|条例|法律|政令|[\p{Script=Han}]+省令)/u.test(
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
    expect(bareEraDates("平成26年 厚生労働省令 第61号です")).toEqual([]);
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
    {
      slug: shoninKey(2),
      term: "専決処分",
      yomi: "せんけつしょぶん",
      gloss: "区長が 先に 決めること",
    },
    {
      slug: shoninKey(2),
      term: "地方自治法",
      yomi: "ちほうじちほう",
      gloss: "自治体の 基本の 法律",
    },
    {
      slug: shoninKey(2),
      term: "軽自動車税",
      yomi: "けいじどうしゃぜい",
      gloss: "軽自動車に かかる 税金",
    },
    {
      slug: shoninKey(2),
      term: "環境性能割",
      yomi: "かんきょうせいのうわり",
      gloss: "買う ときに かかる 分",
    },
    {
      slug: shoninKey(2),
      term: "住宅ローン控除",
      yomi: "じゅうたくろーんこうじょ",
      gloss: "家を 買った 人の 税金を 安く する しくみ",
    },
    {
      slug: shoninKey(3),
      term: "専決処分",
      yomi: "せんけつしょぶん",
      gloss: "区長が 先に 決めること",
    },
    {
      slug: shoninKey(3),
      term: "地方自治法",
      yomi: "ちほうじちほう",
      gloss: "自治体の 基本の 法律",
    },
    {
      slug: shoninKey(3),
      term: "承認",
      yomi: "しょうにん",
      gloss: "区長の 決定を 議会が 認めること",
    },
    {
      slug: gianKey(45),
      term: "個人番号",
      yomi: "こじんばんごう",
      gloss: "一人ひとりの 番号",
    },
    {
      slug: gianKey(46),
      term: "早出遅出勤務",
      yomi: "はやででおそでできんむ",
      gloss: "朝 早く または 夕方 おそく 働く しくみ",
    },
    {
      slug: gianKey(46),
      term: "時差通勤制度",
      yomi: "じさつうきんせいど",
      gloss: "職員の 希望で 働く 時間を 決める しくみ",
    },
    {
      slug: gianKey(47),
      term: "スイッチOTC医薬品",
      yomi: "すいっちおーてぃーしーいやくひん",
      gloss: "病院の 薬から 市販薬に なった 薬",
    },
    {
      slug: gianKey(48),
      term: "補償基礎額",
      yomi: "ほしょうきそがく",
      gloss: "お金の もとに なる 額",
    },
    {
      slug: gianKey(49),
      term: "特定在留カード",
      yomi: "とくていざいりゅうかーど",
      gloss: "在留カードと 一体の カード",
    },
    {
      slug: gianKey(49),
      term: "出入国管理及び難民認定法",
      yomi: "しゅつにゅうこくかんりおよびなんみんにんていほう",
      gloss: "入国や 在留の 決まり",
    },
    {
      slug: gianKey(50),
      term: "満3歳以上限定小規模保育事業",
      yomi: "まんさんさいいじょうげんていしょうきぼほいくじぎょう",
      gloss: "3歳以上だけを あずかる 小さい 保育",
    },
    {
      slug: gianKey(50),
      term: "児童福祉法",
      yomi: "じどうふくしほう",
      gloss: "子どもの 福祉の 法律",
    },
    {
      slug: gianKey(50),
      term: "内閣府令",
      yomi: "ないかくふれい",
      gloss: "国が 決める 細かい ルール",
    },
    {
      slug: gianKey(50),
      term: "家庭的保育事業等の設備及び運営に関する基準",
      yomi: "かていてきほいくじぎょうとうのせつびおよびうんえいにかんするきじゅん",
      gloss: "国の 保育事業の 基準",
    },
    {
      slug: gianKey(51),
      term: "満3歳以上限定小規模保育事業",
      yomi: "まんさんさいいじょうげんていしょうきぼほいくじぎょう",
      gloss: "3歳以上だけを あずかる 小さい 保育",
    },
    {
      slug: gianKey(51),
      term: "内閣府令",
      yomi: "ないかくふれい",
      gloss: "国が 決める 細かい ルール",
    },
    {
      slug: gianKey(51),
      term: "児童福祉法",
      yomi: "じどうふくしほう",
      gloss: "子どもの 福祉の 法律",
    },
    {
      slug: gianKey(53),
      term: "責務",
      yomi: "せきむ",
      gloss: "しなければ ならない こと",
    },
    {
      slug: gianKey(54),
      term: "地区計画",
      yomi: "ちくけいかく",
      gloss: "まちづくりの 細かい 計画",
    },
    {
      slug: gianKey(55),
      term: "早出遅出勤務",
      yomi: "はやででおそでできんむ",
      gloss: "朝 早く または 夕方 おそく 働く しくみ",
    },
    {
      slug: gianKey(56),
      term: "補償基礎額",
      yomi: "ほしょうきそがく",
      gloss: "お金の もとに なる 額",
    },
    {
      slug: gianKey(57),
      term: "仮契約",
      yomi: "かりけいやく",
      gloss: "議決の 前に 結ぶ 約束",
    },
    {
      slug: gianKey(58),
      term: "随意契約",
      yomi: "ずいいけいやく",
      gloss: "入札を しないで 相手を 選ぶ 方法",
    },
    {
      slug: gianKey(59),
      term: "指名競争入札",
      yomi: "しめいきょうそうにゅうさつ",
      gloss: "区が 選んだ 会社だけの 入札",
    },
    {
      slug: gianKey(62),
      term: "公共工事設計労務単価",
      yomi: "こうきょうこうじせっけいろうむたんか",
      gloss: "工事で 働く人の 賃金の 基準",
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

  /**
   * h1 は title の再掲であり、本文の書き出しではない。
   * 表題に公式名称を出すと「初出」が必ず見出しになってしまい、
   * 見出しにアンカーを埋めるか表題から公式名称を消すかの二択になる。
   * どちらも読み手の役に立たないので、初出は h1 を除いた本文で数える。
   * h1 にアンカーを置く抜け道は「見出しに【】を使わない」で別に塞いでいる。
   */
  function bodyWithoutHeading(content: string): string {
    return content.replace(/^#[^\n]*\n/, "");
  }

  /** 本文に現れる【】で囲まれた用語を、重複なく拾う。 */
  function bracketedTerms(body: string): string[] {
    return [
      ...new Set([...body.matchAll(/【([^】]+)】/g)].map((match) => match[1])),
    ];
  }

  /** 初出のアンカー記法【正式名称】［ふりがな］（＝言いかえ）にあたる正規表現。 */
  function anchorPattern(term: string): RegExp {
    return new RegExp(`【${escapeForRegExp(term)}】［[^］]+］（＝[^）]+）`);
  }

  /**
   * 自分を部分文字列として含む長い用語を伏せた本文。
   *
   * ある用語が別の用語の一部になっていることがある
   * （第45号議案の「個人番号」と
   * 「新宿区における個人番号の利用及び特定個人情報の提供に関する条例」）。
   * 長いほうのアンカーの内側に現れた分まで初出と数えると、
   * 本文が正しくても段落の順番だけでテストが落ちる。
   * そこで、自分を含む長い用語を伏せてから探す。
   */
  function maskLongerTerms(body: string, term: string, terms: string[]): string {
    let masked = body;
    for (const other of terms) {
      if (other === term || !other.includes(term)) continue;
      masked = masked.split(other).join("\u0000".repeat(other.length));
    }

    return masked;
  }

  it.each(anchoredTerms)(
    "$slug の $term は初出が【正式名称】［ふりがな］（＝言いかえ）である",
    ({ slug, term, yomi, gloss }) => {
      const body = bodyWithoutHeading(findEasyContent(slug).content);
      const anchor = `【${term}】［${yomi}］（＝${gloss}）`;

      expect(countOccurrences(body, anchor)).toBe(1);
      // 正式名称の初出が、アンカーの中の1文字目（【の次）であることを見る。
      // 言いかえだけを先に出して正式名称を後回しにすると落ちる。
      expect(body.indexOf(term)).toBe(body.indexOf(anchor) + 1);
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
      const body = bodyWithoutHeading(content.content);
      const terms = bracketedTerms(body);

      expect(terms.length).toBeGreaterThan(0);
      expect(terms.filter((term) => !anchorPattern(term).test(body))).toEqual(
        []
      );
    }
  );

  it.each(easyContents)(
    "$bill_slug の【】で囲んだ用語は初出そのものがアンカーである",
    (content) => {
      // アンカーが本文のどこかにありさえすればよい、とすると
      // 言いかえを先に出して公式名称を後回しにする書き方が通ってしまう。
      // 窓口の看板と突合できるのは「最初に見た形」なので、
      // 初出の位置そのものを固定する。
      const body = bodyWithoutHeading(content.content);
      const terms = bracketedTerms(body);

      expect(terms.length).toBeGreaterThan(0);
      const notFirst = terms.filter((term) => {
        const anchor = anchorPattern(term).exec(body);
        if (anchor == null) return true;

        const masked = maskLongerTerms(body, term, terms);

        return masked.indexOf(term) !== anchor.index + 1;
      });

      expect(notFirst).toEqual([]);
    }
  );

  it.each(easyContents)(
    "$bill_slug の【】で囲んだ用語のふりがなと言いかえは1回だけ",
    (content) => {
      // 2回目以降は【正式名称】だけ、という規約の裏返し。
      // アンカーを繰り返すと本文が読めなくなり、
      // 「初出」という概念そのものが意味を失う。
      const body = bodyWithoutHeading(content.content);
      const terms = bracketedTerms(body);

      expect(terms.length).toBeGreaterThan(0);
      const repeated = terms.filter(
        (term) => countOccurrences(body, `【${term}】［`) !== 1
      );

      expect(repeated).toEqual([]);
    }
  );

  it.each(easyContents)(
    "$bill_slug の言いかえに丸かっこが入っていない",
    (content) => {
      // stripAnchorGloss は入れ子の丸かっこを畳めない。
      // 言いかえの中に（）が入ると、文長の検査が静かに壊れる。
      // これだけは h1 を含む本文全体を見る。
      // 壊れかたが「初出かどうか」と無関係で、どこにあっても効くため。
      const nested = [
        ...content.content.matchAll(/【[^】]+】［[^］]*］（＝([^）]*)）/g),
      ]
        .map((match) => match[1])
        .filter((gloss) => gloss.includes("（"));

      expect(nested).toEqual([]);
    }
  );

  it.each(easyContents)("$bill_slug の見出しに【】を使わない", (content) => {
    // 初出は h1 を除いた本文で数えている。
    // h1 にアンカーを置かれるとその用語だけ検査から外れるので、
    // 見出しに【】を持ち込ませない。
    const heading = content.content.match(/^#[^\n]*/)?.[0] ?? "";

    expect(heading).not.toContain("【");
  });

  it.each(anchoredTerms)(
    "$slug の $term のふりがなと言いかえは初出の1回だけ",
    ({ slug, term, yomi, gloss }) => {
      const { content } = findEasyContent(slug);

      expect(countOccurrences(content, `［${yomi}］`)).toBe(1);
      expect(countOccurrences(content, `（＝${gloss}）`)).toBe(1);
    }
  );
});
