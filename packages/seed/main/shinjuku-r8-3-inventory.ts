import type { Database } from "@mirai-gikai/supabase";
import {
  type ShinjukuDecision,
  toBillStatus,
} from "./shinjuku-r8-2-inventory";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];

type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];

/**
 * 令和8年 第3回新宿区議会定例会（会期: 2026-09-16〜2026-10-15）の
 * 区長提出議案インベントリ。
 *
 * 識別番号・件名・全文PDF URL・概要PDF URL は、提出議案一覧ページとリンク先PDFの
 * 実物（2026-09-26 取得、全25ファイルが HTTP 200・application/pdf）と突合して確認した。
 * 推測・補完・要約は含まない。
 *
 * 議決結果は未掲載（会期中）のため、全件 decision: null とする。
 * 解説（やさしい／ふつう／くわしく）は P5-2 で全22件を作成し、主張台帳
 * （docs/verification/20260930_0910_claim-ledger-r8-3.csv）で一次資料と突合した。
 * 公開レビュー（独立したファクトチェック）は完了済み。
 *
 * 議決結果が公式に掲載されたら decision だけを更新し、
 * 既存の解説は本番インポーターで上書き・削除しない。
 */

/** 提出議案一覧ページ（会期・件名・全文PDF・概要PDFの出典） */
export const R8_3_SUBMISSIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html";

/** 「予算案（概要）」一般会計（補正第4号） */
const OVERVIEW_BUDGET_4 =
  "https://www.city.shinjuku.lg.jp/content/000464781.pdf";

/** 「予算案（概要）」一般会計（補正第5号）・介護保険（補正第2号）・後期高齢者医療（補正第1号） */
const OVERVIEW_BUDGET_5 =
  "https://www.city.shinjuku.lg.jp/content/000464782.pdf";

/** 「条例案等（概要）」令和8年第3回区議会定例会提出案件概要（第67〜80号議案を収録） */
const OVERVIEW_JOREI = "https://www.city.shinjuku.lg.jp/content/000464786.pdf";

/**
 * 案件の種別。
 * - `gian`: 第N号議案（区長提出議案）
 * - `nintei`: 認定第N号（決算の認定）
 */
export type R8_3ItemType = "gian" | "nintei";

/** 公式の議決結果の文言。決算は「認定」で、議案の「原案可決」と混同しないこと */
export type R8_3Decision = ShinjukuDecision | "認定";

export interface R8_3SessionItem {
  /** 案件種別 */
  itemType: R8_3ItemType;
  /** 種別内での番号（議案番号 / 認定番号） */
  itemNumber: number;
  /** 公式ページ表記の識別名（例: 第63号議案 / 認定第1号） */
  officialLabel: string;
  /** 公式ページ表記の件名（原文どおり） */
  officialTitle: string;
  /** 全文PDF URL（実ファイルを取得し、当該案件の全文であることを確認済み） */
  fullTextPdfUrl: string;
  /**
   * 当該案件を収録した概要PDF URL。
   * 決算認定（認定第1〜4号）は提出議案一覧ページに概要PDFが無い
   * （「決算書・実績報告は会計室のページ」への案内だけ）ため null。
   */
  overviewPdfUrl: string | null;
  /** 公式議決結果。議決結果ページが未掲載のあいだは null */
  decision: R8_3Decision | null;
  /** 解説を公開表示してよいか。解説が未作成のあいだは false */
  hasPublishableContent: boolean;
  /** 公開レビュー（独立したファクトチェック）が済んだか。済むまでは false */
  reviewCompleted: boolean;
}

/**
 * 会期メタデータ（公式ページ記載: 「会期：9月16日～10月15日」）。
 *
 * 公開レビューが完了したため R8-3 をアクティブな会期とし、R8-2 は同時に
 * is_active: false へ切り替える。
 */
export const R8_3_SESSION: CouncilSessionInsert = {
  name: "令和8年 第3回定例会",
  slug: "r8-3",
  council_url: R8_3_SUBMISSIONS_URL,
  start_date: "2026-09-16",
  end_date: "2026-10-15",
  is_active: true,
};

/**
 * 公式PDFのURLを組み立てる。
 * コンテンツIDは9桁ゼロ埋め（例: 000466336）であり、
 * 数値としてそのまま埋め込むと先頭のゼロが落ちて404になる。
 */
const officialPdfUrl = (contentId: string) =>
  `https://www.city.shinjuku.lg.jp/content/${contentId}.pdf`;

/**
 * 審議中の案件の共通値。
 * 議決結果はまだ無い。解説は作成・出典突合・公開レビュー済みで公開する。
 */
const PENDING = {
  decision: null,
  hasPublishableContent: true,
  reviewCompleted: true,
} as const;

export const r8ThirdSessionItems: R8_3SessionItem[] = [
  {
    itemType: "gian",
    itemNumber: 63,
    officialLabel: "第63号議案",
    officialTitle: "令和8年度新宿区一般会計補正予算（第4号）",
    fullTextPdfUrl: officialPdfUrl("000466336"),
    overviewPdfUrl: OVERVIEW_BUDGET_4,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 64,
    officialLabel: "第64号議案",
    officialTitle: "令和8年度新宿区一般会計補正予算（第5号）",
    fullTextPdfUrl: officialPdfUrl("000466337"),
    overviewPdfUrl: OVERVIEW_BUDGET_5,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 65,
    officialLabel: "第65号議案",
    officialTitle: "令和8年度新宿区介護保険特別会計補正予算（第2号）",
    fullTextPdfUrl: officialPdfUrl("000466338"),
    overviewPdfUrl: OVERVIEW_BUDGET_5,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 66,
    officialLabel: "第66号議案",
    officialTitle: "令和8年度新宿区後期高齢者医療特別会計補正予算（第1号）",
    fullTextPdfUrl: officialPdfUrl("000466339"),
    overviewPdfUrl: OVERVIEW_BUDGET_5,
    ...PENDING,
  },
  {
    itemType: "nintei",
    itemNumber: 1,
    officialLabel: "認定第1号",
    officialTitle: "令和7年度新宿区一般会計歳入歳出決算",
    fullTextPdfUrl: officialPdfUrl("000466361"),
    overviewPdfUrl: null,
    ...PENDING,
  },
  {
    itemType: "nintei",
    itemNumber: 2,
    officialLabel: "認定第2号",
    officialTitle: "令和7年度新宿区国民健康保険特別会計歳入歳出決算",
    fullTextPdfUrl: officialPdfUrl("000466362"),
    overviewPdfUrl: null,
    ...PENDING,
  },
  {
    itemType: "nintei",
    itemNumber: 3,
    officialLabel: "認定第3号",
    officialTitle: "令和7年度新宿区介護保険特別会計歳入歳出決算",
    fullTextPdfUrl: officialPdfUrl("000466363"),
    overviewPdfUrl: null,
    ...PENDING,
  },
  {
    itemType: "nintei",
    itemNumber: 4,
    officialLabel: "認定第4号",
    officialTitle: "令和7年度新宿区後期高齢者医療特別会計歳入歳出決算",
    fullTextPdfUrl: officialPdfUrl("000466364"),
    overviewPdfUrl: null,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 67,
    officialLabel: "第67号議案",
    officialTitle: "新宿区公益保護のための通報に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466368"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 68,
    officialLabel: "第68号議案",
    officialTitle: "新宿区立しんじゅく多文化共生プラザ条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466369"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 69,
    officialLabel: "第69号議案",
    officialTitle:
      "新宿区乳児等通園支援事業の実施に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466370"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 70,
    officialLabel: "第70号議案",
    officialTitle:
      "新宿区家庭的保育事業等の設備及び運営に関する基準を定める条例及び新宿区乳児等通園支援事業の設備及び運営に関する基準を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466371"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 71,
    officialLabel: "第71号議案",
    officialTitle: "新宿区景観まちづくり条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466374"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 72,
    officialLabel: "第72号議案",
    officialTitle:
      "新宿区立の小学校、中学校及び特別支援学校の非常勤の学校医、学校歯科医及び学校薬剤師の公務災害補償に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000466375"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 73,
    officialLabel: "第73号議案",
    officialTitle:
      "ＥＳＣＯ事業による新宿区立防災センター外11施設照明ＬＥＤ化工事等委託契約",
    fullTextPdfUrl: officialPdfUrl("000466376"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 74,
    officialLabel: "第74号議案",
    officialTitle:
      "ＥＳＣＯ事業による新宿区四谷特別出張所外6施設照明ＬＥＤ化工事等委託契約",
    fullTextPdfUrl: officialPdfUrl("000466377"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 75,
    officialLabel: "第75号議案",
    officialTitle:
      "ＥＳＣＯ事業による新宿区大久保特別出張所外10施設照明ＬＥＤ化工事等委託契約",
    fullTextPdfUrl: officialPdfUrl("000466378"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 76,
    officialLabel: "第76号議案",
    // 提出議案一覧ページの表記は「第2)期」（原文どおり）。全文PDF・概要PDFの本文は
    // 「第Ⅱ期」。更新検知は一覧ページの表記と比べるため、ページ表記を採用している
    // （第61号議案の「第1期」と同じ扱い）。表示用に直す場合は出典を併記すること。
    officialTitle: "道路改良工事（江戸川橋通り第2)期）請負契約",
    fullTextPdfUrl: officialPdfUrl("000466379"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 77,
    officialLabel: "第77号議案",
    officialTitle:
      "イントラネットシステム及び情報システム統合基盤に係るマイクロソフト社ソフトウェアライセンスの買入れについて",
    fullTextPdfUrl: officialPdfUrl("000466380"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 78,
    officialLabel: "第78号議案",
    officialTitle: "権利の放棄について",
    fullTextPdfUrl: officialPdfUrl("000466381"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 79,
    officialLabel: "第79号議案",
    officialTitle: "損害賠償の額の決定について",
    fullTextPdfUrl: officialPdfUrl("000466382"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
  {
    itemType: "gian",
    itemNumber: 80,
    officialLabel: "第80号議案",
    officialTitle: "訴えの提起について",
    fullTextPdfUrl: officialPdfUrl("000466383"),
    overviewPdfUrl: OVERVIEW_JOREI,
    ...PENDING,
  },
];

/** 識別子の名前空間（自治体-西暦-会期）。r8-2 の `shinjuku-2026-r2` と揃える */
export const R8_3_KEY_NAMESPACE = "shinjuku-2026-r3";

/** 案件の安定識別子（slug）。件名ではなく種別と番号で一意にする */
export function buildR8_3ItemKey(item: {
  itemType: R8_3ItemType;
  itemNumber: number;
}): string {
  return `${R8_3_KEY_NAMESPACE}-${item.itemType}-${item.itemNumber}`;
}

/** 第N号議案の安定識別子 */
export function r8_3GianKey(itemNumber: number): string {
  return buildR8_3ItemKey({ itemType: "gian", itemNumber });
}

/** 認定第N号の安定識別子 */
export function r8_3NinteiKey(itemNumber: number): string {
  return buildR8_3ItemKey({ itemType: "nintei", itemNumber });
}

/** インベントリ1件を bills テーブルの Insert に変換する */
export function toR8_3BillInsert(item: R8_3SessionItem): BillInsert {
  const decision = item.decision;
  const result =
    decision === null
      ? { status: "submitted" as const, statusNote: null }
      : decision === "認定"
        ? { status: "approved" as const, statusNote: "本会議で認定" }
        : toBillStatus(decision);

  return {
    name: item.officialTitle,
    bill_number: item.officialLabel,
    slug: buildR8_3ItemKey(item),
    status: result.status,
    status_note: result.statusNote,
    publish_status: item.hasPublishableContent ? "published" : "coming_soon",
    // R8-2 は会期末日を掲載日時にしているが、会期中に公開する R8-3 の掲載日時の方針は
    // 決めていない。公開一覧は会期で絞り込み、会期をまたぐサイトマップは updated_at を
    // 使うため、null でも並びと表示には影響しない（詳細ページの publishedTime だけが出ない）。
    published_at: null,
    is_featured: false,
    is_review_completed: item.reviewCompleted,
    thumbnail_url: null,
    pdf_url: item.fullTextPdfUrl,
    overview_pdf_url: item.overviewPdfUrl,
    source_page_url: R8_3_SUBMISSIONS_URL,
    decision_source_url: null,
  };
}

/** インベントリ全件を bills テーブルの Insert 配列に変換する */
export function toR8_3BillInserts(
  items: R8_3SessionItem[] = r8ThirdSessionItems
): BillInsert[] {
  return items.map(toR8_3BillInsert);
}

/** 提出議案一覧ページに載っている識別名（第63〜80号議案の18件 + 認定第1〜4号 = 22件） */
export const R8_3_OFFICIAL_LABELS: string[] = [
  ...Array.from({ length: 18 }, (_, i) => `第${63 + i}号議案`),
  ...Array.from({ length: 4 }, (_, i) => `認定第${1 + i}号`),
];
