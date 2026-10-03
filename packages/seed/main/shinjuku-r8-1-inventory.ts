import type { Database } from "@mirai-gikai/supabase";
import {
  type ShinjukuDecision,
  toBillStatus,
} from "./shinjuku-r8-2-inventory";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];

type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];

/**
 * 令和8年 第1回新宿区議会定例会（会期: 2026-02-17〜2026-03-24）の
 * 区長提出議案42件のインベントリ（P5-5 Phase 1: 先行タイトル登録）。
 *
 * 識別番号・件名・全文PDF URL・概要PDF URL は提出議案一覧ページ、議決結果は
 * 議決結果ページ（最終更新日 2026-03-24）の実物と突合して確認した（2026-10-03 取得、
 * 提出議案42件の識別名・件名・PDF ID が一致、議決結果は原案可決41件・承認1件）。
 * 推測・補完・要約は含まない。
 *
 * 解説（bill_contents）は未作成のため全件 coming_soon・レビュー未完了で登録する。
 * 解説を作成して公開するときは Phase 2 で hasPublishableContent / reviewCompleted を
 * 件ごとに true にする。
 *
 * 議員提出議案は議会公式ページ側にしか載らず、本インベントリの対象外（未収録）。
 */

/** 提出議案一覧ページ（会期・件名・全文PDF・概要PDFの出典） */
export const R8_1_SUBMISSIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_01.html";

/** 議決結果ページ（議決結果の出典） */
export const R8_1_DECISIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00015.html";

/** 「予算案（概要）」令和7年度2月補正（一般会計 補正第12号） */
const OVERVIEW_BUDGET_R7_12 =
  "https://www.city.shinjuku.lg.jp/content/000447772.pdf";

/** 「予算案（概要）」令和7年度2月補正（一般会計第13号・国保第3号・介護第3号・後期高齢第3号） */
const OVERVIEW_BUDGET_R7_13 =
  "https://www.city.shinjuku.lg.jp/content/000447773.pdf";

/** 「予算案（概要）」令和7年度3月補正（一般会計 補正第14号） */
const OVERVIEW_BUDGET_R7_14 =
  "https://www.city.shinjuku.lg.jp/content/000450968.pdf";

/** 「予算案（概要）」令和8年度3月補正（一般会計・国保・介護 補正第1号） */
const OVERVIEW_BUDGET_R8_1 =
  "https://www.city.shinjuku.lg.jp/content/000451608.pdf";

/** 「条例案等（概要）」令和8年第1回区議会定例会提出案件概要（第10〜36号議案を収録） */
const OVERVIEW_JOREI = "https://www.city.shinjuku.lg.jp/content/000447774.pdf";

/** 「予算案（概要）」令和7年度補正予算概要（承認第1号） */
const OVERVIEW_SHONIN_1 =
  "https://www.city.shinjuku.lg.jp/content/000448541.pdf";

/** 「条例案等（概要）」提出案件概要（追加分）（第41号議案を収録） */
const OVERVIEW_JOREI_ADDITIONAL =
  "https://www.city.shinjuku.lg.jp/content/000450970.pdf";

/**
 * 案件の種別。
 * - `gian`: 第N号議案
 * - `shonin`: 承認第N号（専決処分の承認）
 *
 * 承認案件は件名が「専決処分の承認について」で他会期と重複するため、
 * 種別と番号を含む識別子でのみ一意に特定できる。
 */
export type R8_1ItemType = "gian" | "shonin";

export interface R8_1SessionItem {
  /** 案件種別 */
  itemType: R8_1ItemType;
  /** 種別内での番号（議案番号 / 承認番号） */
  itemNumber: number;
  /** 公式ページ表記の識別名（例: 第37号議案 / 承認第1号） */
  officialLabel: string;
  /** 公式ページ表記の件名（原文どおり） */
  officialTitle: string;
  /** 全文PDF URL（提出議案一覧ページのリンクと一致を確認済み） */
  fullTextPdfUrl: string;
  /**
   * 当該案件を収録した概要PDF URL。
   * 当初予算（第1〜4号議案）は提出議案一覧ページに概要PDFが無い
   * （財政課ページへの案内だけ）ため null。
   */
  overviewPdfUrl: string | null;
  /** 公式議決結果（議決結果ページの表のとおり） */
  decision: ShinjukuDecision;
  /** 解説を公開表示してよいか。解説が未作成のあいだは false */
  hasPublishableContent: boolean;
  /** 公開レビューが済んだか。解説が未作成のあいだは false */
  reviewCompleted: boolean;
}

/** 会期メタデータ（公式ページ記載: 「会期：2月17日～3月24日」） */
export const R8_1_SESSION: CouncilSessionInsert = {
  name: "令和8年 第1回定例会",
  slug: "r8-1",
  council_url: R8_1_SUBMISSIONS_URL,
  start_date: "2026-02-17",
  end_date: "2026-03-24",
  is_active: false,
};

/**
 * 公式PDFのURLを組み立てる。
 * コンテンツIDは9桁ゼロ埋め（例: 000448420）であり、
 * 数値としてそのまま埋め込むと先頭のゼロが落ちて404になる。
 */
const officialPdfUrl = (contentId: string) =>
  `https://www.city.shinjuku.lg.jp/content/${contentId}.pdf`;

/** 解説未作成の案件に共通する公開状態（Phase 1） */
const PENDING = {
  hasPublishableContent: false,
  reviewCompleted: false,
} as const;

/**
 * 並びは議案番号順。承認第1号は第36号議案と、追加提出分の第37号議案の間に置く
 * （提出議案一覧ページの掲載順とは異なる。照合は識別名で行い、並びには依存しない）。
 */
export const r8FirstSessionItems: R8_1SessionItem[] = [
  {
    itemType: "gian",
    itemNumber: 1,
    officialLabel: "第1号議案",
    officialTitle: "令和8年度新宿区一般会計予算",
    fullTextPdfUrl: officialPdfUrl("000448420"),
    overviewPdfUrl: null,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 2,
    officialLabel: "第2号議案",
    officialTitle: "令和8年度新宿区国民健康保険特別会計予算",
    fullTextPdfUrl: officialPdfUrl("000448412"),
    overviewPdfUrl: null,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 3,
    officialLabel: "第3号議案",
    officialTitle: "令和8年度新宿区介護保険特別会計予算",
    fullTextPdfUrl: officialPdfUrl("000448413"),
    overviewPdfUrl: null,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 4,
    officialLabel: "第4号議案",
    officialTitle: "令和8年度新宿区後期高齢者医療特別会計予算",
    fullTextPdfUrl: officialPdfUrl("000448488"),
    overviewPdfUrl: null,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 5,
    officialLabel: "第5号議案",
    officialTitle: "令和7年度新宿区一般会計補正予算（第12号）",
    fullTextPdfUrl: officialPdfUrl("000448415"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_12,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 6,
    officialLabel: "第6号議案",
    officialTitle: "令和7年度新宿区一般会計補正予算（第13号）",
    fullTextPdfUrl: officialPdfUrl("000448416"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_13,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 7,
    officialLabel: "第7号議案",
    officialTitle: "令和7年度新宿区国民健康保険特別会計補正予算（第3号）",
    fullTextPdfUrl: officialPdfUrl("000448417"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_13,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 8,
    officialLabel: "第8号議案",
    officialTitle: "令和7年度新宿区介護保険特別会計補正予算（第3号）",
    fullTextPdfUrl: officialPdfUrl("000448418"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_13,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 9,
    officialLabel: "第9号議案",
    officialTitle: "令和7年度新宿区後期高齢者医療特別会計補正予算（第3号）",
    fullTextPdfUrl: officialPdfUrl("000448419"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_13,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 10,
    officialLabel: "第10号議案",
    officialTitle: "新宿区行政手続条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448426"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 11,
    officialLabel: "第11号議案",
    officialTitle: "新宿区職員定数条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448427"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 12,
    officialLabel: "第12号議案",
    officialTitle: "新宿区職員の特殊勤務手当に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448428"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 13,
    officialLabel: "第13号議案",
    officialTitle: "公益的法人等への新宿区職員の派遣等に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448429"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 14,
    officialLabel: "第14号議案",
    officialTitle: "新宿区職員の給与に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448430"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 15,
    officialLabel: "第15号議案",
    officialTitle: "新宿区住民基本台帳制度の適正な運用に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448431"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 16,
    officialLabel: "第16号議案",
    officialTitle: "新宿区立産業振興施設条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448432"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 17,
    officialLabel: "第17号議案",
    officialTitle: "新宿区介護保険条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448433"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 18,
    officialLabel: "第18号議案",
    officialTitle: "新宿区子ども・子育て支援法に基づく過料に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448434"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 19,
    officialLabel: "第19号議案",
    officialTitle: "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448435"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 20,
    officialLabel: "第20号議案",
    officialTitle: "新宿区特定乳児等通園支援事業の運営に関する基準を定める条例",
    fullTextPdfUrl: officialPdfUrl("000448436"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 21,
    officialLabel: "第21号議案",
    officialTitle: "新宿区乳児等通園支援事業の実施に関する条例",
    fullTextPdfUrl: officialPdfUrl("000448437"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 22,
    officialLabel: "第22号議案",
    officialTitle: "新宿区後期高齢者医療に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448438"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 23,
    officialLabel: "第23号議案",
    officialTitle: "新宿区保健事業の利用に係る使用料等を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448439"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 24,
    officialLabel: "第24号議案",
    officialTitle: "新宿区保健衛生事務手数料条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448440"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 25,
    officialLabel: "第25号議案",
    officialTitle: "新宿区自転車等の適正利用の推進及び自転車等駐輪場の整備に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448441"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 26,
    officialLabel: "第26号議案",
    officialTitle: "新宿区リサイクル及び一般廃棄物の処理に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448442"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 27,
    officialLabel: "第27号議案",
    officialTitle: "新宿区環境土木・都市計画事務手数料条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448443"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 28,
    officialLabel: "第28号議案",
    officialTitle: "新宿区中高層階住環境保全地区の区域内における建築物の制限に関する条例",
    fullTextPdfUrl: officialPdfUrl("000448444"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 29,
    officialLabel: "第29号議案",
    officialTitle: "新宿区ワンルームマンション等の建築及び管理に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448445"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 30,
    officialLabel: "第30号議案",
    officialTitle: "新宿区中高層建築物の建築に係る紛争の予防と調整に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448446"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 31,
    officialLabel: "第31号議案",
    officialTitle: "新宿区大規模マンション及び開発事業に係る市街地環境の整備に関する条例",
    fullTextPdfUrl: officialPdfUrl("000448447"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 32,
    officialLabel: "第32号議案",
    officialTitle: "新宿区公共料金支払基金条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448448"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 33,
    officialLabel: "第33号議案",
    officialTitle: "新宿区幼稚園教育職員の給与に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448421"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 34,
    officialLabel: "第34号議案",
    officialTitle: "新宿区立の小学校、中学校及び特別支援学校の非常勤の学校医、学校歯科医及び学校薬剤師の公務災害補償に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448422"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 35,
    officialLabel: "第35号議案",
    officialTitle: "新宿区選挙長等の報酬及び費用弁償等に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000448423"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 36,
    officialLabel: "第36号議案",
    officialTitle: "東京都後期高齢者医療広域連合規約の一部を変更する規約について",
    fullTextPdfUrl: officialPdfUrl("000448424"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "shonin",
    itemNumber: 1,
    officialLabel: "承認第1号",
    officialTitle: "専決処分の承認について",
    fullTextPdfUrl: officialPdfUrl("000448425"),
    overviewPdfUrl: OVERVIEW_SHONIN_1,
    decision: "承認",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 37,
    officialLabel: "第37号議案",
    officialTitle: "令和8年度新宿区一般会計補正予算（第1号）",
    fullTextPdfUrl: officialPdfUrl("000451609"),
    overviewPdfUrl: OVERVIEW_BUDGET_R8_1,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 38,
    officialLabel: "第38号議案",
    officialTitle: "令和8年度新宿区国民健康保険特別会計補正予算（第1号）",
    fullTextPdfUrl: officialPdfUrl("000451610"),
    overviewPdfUrl: OVERVIEW_BUDGET_R8_1,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 39,
    officialLabel: "第39号議案",
    officialTitle: "令和8年度新宿区介護保険特別会計補正予算（第1号）",
    fullTextPdfUrl: officialPdfUrl("000451611"),
    overviewPdfUrl: OVERVIEW_BUDGET_R8_1,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 40,
    officialLabel: "第40号議案",
    officialTitle: "令和7年度新宿区一般会計補正予算（第14号）",
    fullTextPdfUrl: officialPdfUrl("000451612"),
    overviewPdfUrl: OVERVIEW_BUDGET_R7_14,
    decision: "原案可決",
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 41,
    officialLabel: "第41号議案",
    officialTitle: "新宿区国民健康保険条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000451614"),
    overviewPdfUrl: OVERVIEW_JOREI_ADDITIONAL,
    decision: "原案可決",
    ...PENDING,
  },
];

/** 識別子の名前空間（自治体-西暦-会期）。r8-2 の `shinjuku-2026-r2` と揃える */
export const R8_1_KEY_NAMESPACE = "shinjuku-2026-r1";

/** 案件の安定識別子（slug）。件名ではなく種別と番号で一意にする */
export function buildR8_1ItemKey(item: {
  itemType: R8_1ItemType;
  itemNumber: number;
}): string {
  return `${R8_1_KEY_NAMESPACE}-${item.itemType}-${item.itemNumber}`;
}

/** 第N号議案の安定識別子 */
export function r8_1GianKey(itemNumber: number): string {
  return buildR8_1ItemKey({ itemType: "gian", itemNumber });
}

/** 承認第N号の安定識別子 */
export function r8_1ShoninKey(itemNumber: number): string {
  return buildR8_1ItemKey({ itemType: "shonin", itemNumber });
}

/** インベントリ1件を bills テーブルの Insert に変換する */
export function toR8_1BillInsert(item: R8_1SessionItem): BillInsert {
  const { status, statusNote } = toBillStatus(item.decision);
  return {
    name: item.officialTitle,
    bill_number: item.officialLabel,
    slug: buildR8_1ItemKey(item),
    status,
    status_note: statusNote,
    publish_status: item.hasPublishableContent ? "published" : "coming_soon",
    // 議決日時ではなくサイト掲載日時。解説を公開する Phase 2 で決める。
    published_at: null,
    is_featured: false,
    is_review_completed: item.reviewCompleted,
    thumbnail_url: null,
    pdf_url: item.fullTextPdfUrl,
    overview_pdf_url: item.overviewPdfUrl,
    source_page_url: R8_1_SUBMISSIONS_URL,
    decision_source_url: R8_1_DECISIONS_URL,
  };
}

/** インベントリ全件を bills テーブルの Insert 配列に変換する */
export function toR8_1BillInserts(
  items: R8_1SessionItem[] = r8FirstSessionItems
): BillInsert[] {
  return items.map(toR8_1BillInsert);
}

/** 提出議案一覧ページに載っている識別名（第1〜41号議案の41件 + 承認第1号 = 42件） */
export const R8_1_OFFICIAL_LABELS: string[] = [
  ...Array.from({ length: 41 }, (_, i) => `第${1 + i}号議案`),
  "承認第1号",
];
