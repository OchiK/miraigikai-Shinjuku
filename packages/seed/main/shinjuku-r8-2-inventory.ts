import { COMMITTEE_REFERRAL_OMITTED_NOTE } from "@mirai-gikai/shared/bills/decision-label";
import type { Database } from "@mirai-gikai/supabase";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];

/**
 * 令和8年 第2回新宿区議会定例会（会期: 2026-06-10〜2026-06-19）の
 * 公式提出案件インベントリ。
 *
 * ここに含まれる識別番号・件名・PDF URL・議決結果は、すべて下記の
 * 新宿区公式ページおよびリンク先PDFの実物と突合して確認したものであり、
 * 推測・補完・要約は一切含まない。
 *
 * 突合記録: docs/20260916_1400_令和8年第2回定例会_公式突合記録.md
 */

/** 提出議案一覧ページ（会期・件名・全文PDF・概要PDFの出典） */
export const R8_2_SUBMISSIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_02.html";

/** 議決結果ページ（議決結果の出典） */
export const R8_2_DECISIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00016.html";

/**
 * 議会公式ページ（議会事務局）の会期ページ。議員提出議案の識別名・件名の出典。
 * 区長提出議案の提出議案一覧ページには議員提出議案が載らないため、別に持つ。
 */
export const R8_2_COUNCIL_SESSION_URL =
  "https://www.city.shinjuku.lg.jp/kusei/file08_05_0003820210204_00014.html";

/**
 * 議会公式の「議案の概要と審議結果」PDF。議員提出議案の概要と議決結果の出典
 * （会派ごとの賛否の出典でもある）。
 */
export const R8_2_COUNCIL_RESULTS_PDF =
  "https://www.city.shinjuku.lg.jp/content/000459252.pdf";

/**
 * 議会公式の「決議・意見書」ページ（令和8年）。可決した意見書の全文PDFを載せている。
 */
export const R8_2_COUNCIL_RESOLUTIONS_URL =
  "https://www.city.shinjuku.lg.jp/kusei/file08_05_0004020210118_00006.html";

/** 公式ページの「条例案等（概要）」概要PDF（承認第2号・第3号および第44〜60号議案を収録） */
const OVERVIEW_JOREI = "https://www.city.shinjuku.lg.jp/content/000456353.pdf";

/** 公式ページの「条例案等（概要）」追加分（第61・62号議案を収録） */
const OVERVIEW_JOREI_ADDITIONAL =
  "https://www.city.shinjuku.lg.jp/content/000458106.pdf";

/** 「予算案（概要）」一般会計（補正第2号） */
const OVERVIEW_BUDGET_2 =
  "https://www.city.shinjuku.lg.jp/content/000456354.pdf";

/** 「予算案（概要）」一般会計（補正第3号） */
const OVERVIEW_BUDGET_3 =
  "https://www.city.shinjuku.lg.jp/content/000456355.pdf";

/**
 * 案件の種別。
 * - `gian`: 第N号議案（区長提出議案）
 * - `shonin`: 承認第N号（専決処分の承認）
 * - `giin`: 議員提出議案第N号（議員が提出した条例案・意見書）
 *
 * 承認案件は件名が「専決処分の承認について」で重複するため、
 * 種別と番号を含む識別子でのみ一意に特定できる。
 */
export type ShinjukuItemType = "gian" | "shonin" | "giin";

/**
 * 公式の議決結果の文言。議案は「原案可決」または「否決」、承認案件は「承認」であり、
 * 用語を混同して表示しないこと。
 */
export type ShinjukuDecision = "原案可決" | "否決" | "承認";

export interface ShinjukuSessionItem {
  /** 案件種別 */
  itemType: ShinjukuItemType;
  /** 種別内での番号（議案番号 / 承認番号） */
  itemNumber: number;
  /** 公式ページ表記の識別名（例: 第42号議案 / 承認第2号） */
  officialLabel: string;
  /** 公式ページ表記の件名（原文どおり） */
  officialTitle: string;
  /**
   * 全文PDF URL（実ファイルを取得し、当該案件の全文であることを確認済み）。
   * 議員提出議案のうち否決された条例案（第7・8号）は全文がオンラインで公開されていない
   * （会議録は「巻末議案の部参照」とだけ記す）ため null。推測で他のPDFを入れないこと。
   * 可決した意見書（第9・10号）は「決議・意見書」ページに全文PDFがある。
   */
  fullTextPdfUrl: string | null;
  /** 当該案件を収録した概要PDF URL */
  overviewPdfUrl: string;
  /** 公式議決結果 */
  decision: ShinjukuDecision;
  /** 識別名・件名の出典ページ。既定は区長提出議案の提出議案一覧ページ */
  sourcePageUrl?: string;
  /** 議決結果の出典。既定は区長提出議案の議決結果ページ */
  decisionSourceUrl?: string;
  /**
   * 委員会への付託を省略して本会議で議決した案件（会議録「説明及び委員会付託を省略して
   * 採決します」）。審議の経過で「委員会での審査」を済んだものとして出さないために使う。
   */
  committeeReferralOmitted?: boolean;
  /**
   * 解説を公開表示してよい案件かどうか。`published` / `coming_soon` に直結する。
   *
   * 「解説が存在すること」と「公開してよいこと」は別であり、解説が未整備・出典未突合の
   * 案件は false（coming_soon）に留める。区長提出議案23件は出典突合と公開レビューを
   * 経て true にした。
   *
   * 議員提出議案第7〜10号は、出典突合を終えたうえで、公開レビュー前に公開すると
   * 判断した（true）。レビューが済んでいないことは reviewCompleted: false で示し、
   * 詳細ページにレビュー中の案内を出す（docs/20260925_2000_議員提出議案4件_解説の作成記録.md §5）。
   */
  hasPublishableContent: boolean;
  /**
   * 公開レビューが済んだか。bills.is_review_completed に入る。false の議案には
   * 詳細ページで「レビュー中」バナーが出る（migration のカラムコメント参照）。
   * 省略時は hasPublishableContent と同じ。解説を公開するがレビューは未了、という
   * 議案（議員提出議案第7〜10号）だけ false を明示する。
   *
   * レビューを終えたら、ここの false を外して本番インポーターを流す。管理画面で
   * is_review_completed を切り替えても、次の import:production がこの値で上書きする。
   */
  reviewCompleted?: boolean;
  /** トップページ等での注目表示 */
  isFeatured: boolean;
}

/** 会期メタデータ（公式ページ記載: 「会期：6月10日～6月19日」） */
export const R8_2_SESSION: CouncilSessionInsert = {
  name: "令和8年 第2回定例会",
  slug: "r8-2",
  council_url: R8_2_SUBMISSIONS_URL,
  start_date: "2026-06-10",
  end_date: "2026-06-19",
  is_active: true,
};

/**
 * bills.published_at に入れるサイト掲載日時。
 *
 * 会期末日（2026-06-19）を用いる。議決結果ページには案件ごとの議決日・議決時刻の
 * 記載がなく、ページの最終更新日から個別の議決日時を推定することはできない。
 * この値は「サイトでの掲載時点」であり、議決日時ではない。
 */
export const R8_2_PUBLISHED_AT = "2026-06-19T00:00:00+09:00";

/**
 * 公式PDFのURLを組み立てる。
 * コンテンツIDは9桁ゼロ埋め（例: 000457641）であり、
 * 数値としてそのまま埋め込むと先頭のゼロが落ちて404になる。
 */
const officialPdfUrl = (contentId: string) =>
  `https://www.city.shinjuku.lg.jp/content/${contentId}.pdf`;

export const r8SecondSessionItems: ShinjukuSessionItem[] = [
  {
    itemType: "shonin",
    itemNumber: 2,
    officialLabel: "承認第2号",
    officialTitle: "専決処分の承認について",
    fullTextPdfUrl: officialPdfUrl("000457641"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "承認",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "shonin",
    itemNumber: 3,
    officialLabel: "承認第3号",
    officialTitle: "専決処分の承認について",
    fullTextPdfUrl: officialPdfUrl("000457642"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "承認",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 42,
    officialLabel: "第42号議案",
    officialTitle: "令和8年度新宿区一般会計補正予算（第2号）",
    fullTextPdfUrl: officialPdfUrl("000457639"),
    overviewPdfUrl: OVERVIEW_BUDGET_2,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: true,
  },
  {
    itemType: "gian",
    itemNumber: 43,
    officialLabel: "第43号議案",
    officialTitle: "令和8年度新宿区一般会計補正予算（第3号）",
    fullTextPdfUrl: officialPdfUrl("000457640"),
    overviewPdfUrl: OVERVIEW_BUDGET_3,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 44,
    officialLabel: "第44号議案",
    officialTitle: "新宿区総合計画の議決に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457643"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 45,
    officialLabel: "第45号議案",
    officialTitle:
      "新宿区における個人番号の利用及び特定個人情報の提供に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457644"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 46,
    officialLabel: "第46号議案",
    officialTitle:
      "新宿区職員の勤務時間、休日、休暇等に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457645"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 47,
    officialLabel: "第47号議案",
    officialTitle: "新宿区特別区税条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457646"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 48,
    officialLabel: "第48号議案",
    officialTitle:
      "災害に際し応急措置の業務等に従事した者の損害補償に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457647"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 49,
    officialLabel: "第49号議案",
    officialTitle: "新宿区印鑑条例等の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457648"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: true,
  },
  {
    itemType: "gian",
    itemNumber: 50,
    officialLabel: "第50号議案",
    officialTitle:
      "新宿区家庭的保育事業等の設備及び運営に関する基準を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457649"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 51,
    officialLabel: "第51号議案",
    officialTitle:
      "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457650"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 52,
    officialLabel: "第52号議案",
    officialTitle:
      "新宿区保健事業の利用に係る使用料等を定める条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457651"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 53,
    officialLabel: "第53号議案",
    officialTitle:
      "新宿区空き缶等の散乱及び路上喫煙による被害の防止に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457652"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: true,
  },
  {
    itemType: "gian",
    itemNumber: 54,
    officialLabel: "第54号議案",
    officialTitle:
      "新宿区地区計画の区域内における建築物の制限に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457653"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 55,
    officialLabel: "第55号議案",
    officialTitle:
      "新宿区幼稚園教育職員の勤務時間、休日、休暇等に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457654"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 56,
    officialLabel: "第56号議案",
    officialTitle:
      "新宿区立の小学校、中学校及び特別支援学校の非常勤の学校医、学校歯科医及び学校薬剤師の公務災害補償に関する条例の一部を改正する条例",
    fullTextPdfUrl: officialPdfUrl("000457655"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 57,
    officialLabel: "第57号議案",
    officialTitle: "落合中央公園野球場人工芝等改修工事請負契約",
    fullTextPdfUrl: officialPdfUrl("000457656"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 58,
    officialLabel: "第58号議案",
    officialTitle: "新宿コズミックセンタープラネタリウム設備改修工事等委託契約",
    fullTextPdfUrl: officialPdfUrl("000457657"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 59,
    officialLabel: "第59号議案",
    officialTitle: "災害用備蓄物資の買入れについて",
    fullTextPdfUrl: officialPdfUrl("000457658"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 60,
    officialLabel: "第60号議案",
    officialTitle: "区設掲示板用マグネット画板等の買入れについて",
    fullTextPdfUrl: officialPdfUrl("000457659"),
    overviewPdfUrl: OVERVIEW_JOREI,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 61,
    officialLabel: "第61号議案",
    // 提出議案一覧ページ・議決結果ページはいずれも「第1期」表記。
    // 全文PDF本文のみ「第Ⅰ期」表記であり、ページ表記を採用している。
    officialTitle: "道路改良工事（江戸川橋通り第1期）（その2）請負契約",
    fullTextPdfUrl: officialPdfUrl("000458535"),
    overviewPdfUrl: OVERVIEW_JOREI_ADDITIONAL,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "gian",
    itemNumber: 62,
    officialLabel: "第62号議案",
    officialTitle:
      "新宿区立角筈区民ホール天井改修その他工事請負契約の変更について",
    fullTextPdfUrl: officialPdfUrl("000458536"),
    overviewPdfUrl: OVERVIEW_JOREI_ADDITIONAL,
    decision: "原案可決",
    hasPublishableContent: true,
    isFeatured: false,
  },
  // 議員提出議案。識別名・件名は議会公式の会期ページ、議決結果は会議録（6月19日）と
  // 「議案の概要と審議結果」で確認した。第7・8号は文教子ども家庭委員会に付託され、
  // 委員会・本会議とも起立少数で否決。第9・10号は説明と委員会付託を省略し、
  // 異議なく原案可決。解説は出典突合済みで公開レビュー完了（P8-18）。
  // 第9・10号の全文は議会公式の「決議・意見書」ページのPDF（2026-09-25 取得、HTTP 200・
  // application/pdf、sha256: 000459264 = dfe433d8…、000459265 = 12942087…）。
  {
    itemType: "giin",
    itemNumber: 7,
    officialLabel: "議員提出議案第7号",
    officialTitle: "新宿区立学校における学用品の給付に関する条例",
    fullTextPdfUrl: null,
    overviewPdfUrl: R8_2_COUNCIL_RESULTS_PDF,
    decision: "否決",
    sourcePageUrl: R8_2_COUNCIL_SESSION_URL,
    decisionSourceUrl: R8_2_COUNCIL_RESULTS_PDF,
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "giin",
    itemNumber: 8,
    officialLabel: "議員提出議案第8号",
    officialTitle: "新宿区立学校における修学旅行費の無償化に関する条例",
    fullTextPdfUrl: null,
    overviewPdfUrl: R8_2_COUNCIL_RESULTS_PDF,
    decision: "否決",
    sourcePageUrl: R8_2_COUNCIL_SESSION_URL,
    decisionSourceUrl: R8_2_COUNCIL_RESULTS_PDF,
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "giin",
    itemNumber: 9,
    officialLabel: "議員提出議案第9号",
    officialTitle: "ドナーミルクの利用拡大を求める意見書",
    fullTextPdfUrl: officialPdfUrl("000459264"),
    overviewPdfUrl: R8_2_COUNCIL_RESULTS_PDF,
    decision: "原案可決",
    sourcePageUrl: R8_2_COUNCIL_RESOLUTIONS_URL,
    decisionSourceUrl: R8_2_COUNCIL_RESULTS_PDF,
    committeeReferralOmitted: true,
    hasPublishableContent: true,
    isFeatured: false,
  },
  {
    itemType: "giin",
    itemNumber: 10,
    officialLabel: "議員提出議案第10号",
    officialTitle: "「不合理な税制改正」に反対する意見書",
    fullTextPdfUrl: officialPdfUrl("000459265"),
    overviewPdfUrl: R8_2_COUNCIL_RESULTS_PDF,
    decision: "原案可決",
    sourcePageUrl: R8_2_COUNCIL_RESOLUTIONS_URL,
    decisionSourceUrl: R8_2_COUNCIL_RESULTS_PDF,
    committeeReferralOmitted: true,
    hasPublishableContent: true,
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// 安定識別子
// ---------------------------------------------------------------------------

/** 識別子の名前空間（自治体-西暦-会期） */
export const R8_2_KEY_NAMESPACE = "shinjuku-2026-r2";

/**
 * 案件の安定識別子（slug）を生成する。
 *
 * 西暦・会期・案件種別・番号をすべて含めることで、
 * 件名が重複する承認第2号／承認第3号も一意に区別できる。
 * 件名のみを突合キーに使ってはならない。
 */
export function buildItemKey(item: {
  itemType: ShinjukuItemType;
  itemNumber: number;
}): string {
  return `${R8_2_KEY_NAMESPACE}-${item.itemType}-${item.itemNumber}`;
}

/** 第N号議案の安定識別子 */
export function gianKey(itemNumber: number): string {
  return buildItemKey({ itemType: "gian", itemNumber });
}

/** 承認第N号の安定識別子 */
export function shoninKey(itemNumber: number): string {
  return buildItemKey({ itemType: "shonin", itemNumber });
}

/** 議員提出議案第N号の安定識別子 */
export function giinKey(itemNumber: number): string {
  return buildItemKey({ itemType: "giin", itemNumber });
}

/** 公式の議決結果を DB の status / status_note に対応付ける */
export function toBillStatus(
  decision: ShinjukuDecision,
  options: { committeeReferralOmitted?: boolean } = {}
): {
  status: NonNullable<BillInsert["status"]>;
  statusNote: string;
} {
  const prefix = options.committeeReferralOmitted
    ? COMMITTEE_REFERRAL_OMITTED_NOTE
    : "";
  switch (decision) {
    case "原案可決":
      return { status: "approved", statusNote: `${prefix}本会議で原案可決` };
    case "否決":
      return { status: "rejected", statusNote: `${prefix}本会議で否決` };
    case "承認":
      return { status: "approved", statusNote: `${prefix}本会議で承認` };
  }
}

/** インベントリ1件を bills テーブルの Insert に変換する */
export function toBillInsert(item: ShinjukuSessionItem): BillInsert {
  const { status, statusNote } = toBillStatus(item.decision, {
    committeeReferralOmitted: item.committeeReferralOmitted,
  });

  return {
    name: item.officialTitle,
    bill_number: item.officialLabel,
    slug: buildItemKey(item),
    status,
    status_note: statusNote,
    // 公開レビュー済みの解説だけを published として公開する
    publish_status: item.hasPublishableContent ? "published" : "coming_soon",
    // 議決日時ではなくサイト掲載日時。詳細は R8_2_PUBLISHED_AT のコメントを参照。
    published_at: item.hasPublishableContent ? R8_2_PUBLISHED_AT : null,
    is_featured: item.isFeatured,
    is_review_completed: item.reviewCompleted ?? item.hasPublishableContent,
    // 外部プレースホルダ画像（placehold.co）は公開ページのOGP画像にそのまま出てしまうため使わない。
    // 公式素材のサムネイルが用意できるまで null とする。
    thumbnail_url: null,
    pdf_url: item.fullTextPdfUrl,
    overview_pdf_url: item.overviewPdfUrl,
    source_page_url: item.sourcePageUrl ?? R8_2_SUBMISSIONS_URL,
    decision_source_url: item.decisionSourceUrl ?? R8_2_DECISIONS_URL,
  };
}

/** インベントリ全件を bills テーブルの Insert 配列に変換する */
export function toBillInserts(
  items: ShinjukuSessionItem[] = r8SecondSessionItems
): BillInsert[] {
  return items.map(toBillInsert);
}

// ---------------------------------------------------------------------------
// 突合用ユーティリティ（公式一覧との照合・重複検出）
// ---------------------------------------------------------------------------

/** 区長提出議案の公式一覧に載っている識別名（承認2件 + 第42〜62号議案の21件 = 23件） */
export const R8_2_OFFICIAL_LABELS: string[] = [
  "承認第2号",
  "承認第3号",
  ...Array.from({ length: 21 }, (_, i) => `第${42 + i}号議案`),
];

/** 議会公式の会期ページに載っている議員提出議案の識別名（第7〜10号の4件） */
export const R8_2_COUNCILOR_BILL_LABELS: string[] = Array.from(
  { length: 4 },
  (_, i) => `議員提出議案第${7 + i}号`
);

/** 会期の全案件の識別名（区長提出23件 + 議員提出4件 = 27件） */
export const R8_2_ALL_LABELS: string[] = [
  ...R8_2_OFFICIAL_LABELS,
  ...R8_2_COUNCILOR_BILL_LABELS,
];

export interface InventoryReconciliation {
  /** 公式一覧にあるがインベントリに無い識別名 */
  missing: string[];
  /** インベントリにあるが公式一覧に無い識別名 */
  unexpected: string[];
  /** インベントリ内で重複している識別名 */
  duplicatedLabels: string[];
  /** インベントリ内で重複している安定識別子 */
  duplicatedKeys: string[];
}

/** インベントリを公式一覧と突合し、欠落・重複・想定外を洗い出す */
export function reconcileInventory(
  items: ShinjukuSessionItem[] = r8SecondSessionItems,
  officialLabels: string[] = R8_2_ALL_LABELS
): InventoryReconciliation {
  const labels = items.map((i) => i.officialLabel);
  const keys = items.map(buildItemKey);
  const officialSet = new Set(officialLabels);
  const labelSet = new Set(labels);

  return {
    missing: officialLabels.filter((l) => !labelSet.has(l)),
    unexpected: [...new Set(labels.filter((l) => !officialSet.has(l)))],
    duplicatedLabels: findDuplicates(labels),
    duplicatedKeys: findDuplicates(keys),
  };
}

/** 配列内で2回以上出現する値を、初出の順で返す */
export function findDuplicates<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const duplicated = new Set<T>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicated.add(value);
    }
    seen.add(value);
  }
  return [...duplicated];
}
