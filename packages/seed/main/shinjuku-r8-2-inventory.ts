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
 *
 * 承認案件は件名が「専決処分の承認について」で重複するため、
 * 種別と番号を含む識別子でのみ一意に特定できる。
 */
export type ShinjukuItemType = "gian" | "shonin";

/**
 * 公式の議決結果の文言。議案は「原案可決」、承認案件は「承認」であり、
 * 用語を混同して表示しないこと。
 */
export type ShinjukuDecision = "原案可決" | "承認";

export interface ShinjukuSessionItem {
  /** 案件種別 */
  itemType: ShinjukuItemType;
  /** 種別内での番号（議案番号 / 承認番号） */
  itemNumber: number;
  /** 公式ページ表記の識別名（例: 第42号議案 / 承認第2号） */
  officialLabel: string;
  /** 公式ページ表記の件名（原文どおり） */
  officialTitle: string;
  /** 全文PDF URL（実ファイルを取得し、当該案件の全文であることを確認済み） */
  fullTextPdfUrl: string;
  /** 当該案件を収録した概要PDF URL */
  overviewPdfUrl: string;
  /** 公式議決結果 */
  decision: ShinjukuDecision;
  /**
   * 公開表示してよい案件かどうか。`published` / `coming_soon` に直結する。
   *
   * 「解説が存在すること」と「公開してよいこと」は別である。
   * 解説が未整備の案件を coming_soon にするのは当然として、
   * 解説が出典突合済みでも、公開判断を行うレビューが済むまでは false に留める
   * （実装計画ステップ4「Keep an item coming_soon until the required content is
   * valid and reviewed for publication」）。
   *
   * 第43・44号議案と承認第2号は解説を保有するが、公開レビューの担当者が
   * 未確定のため false のままにしている。担当者が決まりレビューが済んだら、
   * 当該案件をここで true にし、bills.is_review_completed も併せて更新すること。
   */
  hasPublishableContent: boolean;
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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
    hasPublishableContent: false,
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

/** 公式の議決結果を DB の status / status_note に対応付ける */
export function toBillStatus(decision: ShinjukuDecision): {
  status: NonNullable<BillInsert["status"]>;
  statusNote: string;
} {
  switch (decision) {
    case "原案可決":
      return { status: "approved", statusNote: "本会議で原案可決" };
    case "承認":
      return { status: "approved", statusNote: "本会議で承認" };
  }
}

/** インベントリ1件を bills テーブルの Insert に変換する */
export function toBillInsert(item: ShinjukuSessionItem): BillInsert {
  const { status, statusNote } = toBillStatus(item.decision);

  return {
    name: item.officialTitle,
    bill_number: item.officialLabel,
    slug: buildItemKey(item),
    status,
    status_note: statusNote,
    // 解説が未整備の案件は公開せず、coming_soon として一覧にのみ載せる
    publish_status: item.hasPublishableContent ? "published" : "coming_soon",
    // 議決日時ではなくサイト掲載日時。詳細は R8_2_PUBLISHED_AT のコメントを参照。
    published_at: item.hasPublishableContent ? R8_2_PUBLISHED_AT : null,
    is_featured: item.isFeatured,
    // 解説は公式PDFと突合済みだが、公開判断を伴う人手のレビューは未了のため false のままとする
    is_review_completed: false,
    // 外部プレースホルダ画像（placehold.co）は公開ページのOGP画像にそのまま出てしまうため使わない。
    // 公式素材のサムネイルが用意できるまで null とする。
    thumbnail_url: null,
    pdf_url: item.fullTextPdfUrl,
    overview_pdf_url: item.overviewPdfUrl,
    source_page_url: R8_2_SUBMISSIONS_URL,
    decision_source_url: R8_2_DECISIONS_URL,
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

/** 公式一覧に載っている識別名の集合（承認2件 + 第42〜62号議案の21件 = 23件） */
export const R8_2_OFFICIAL_LABELS: string[] = [
  "承認第2号",
  "承認第3号",
  ...Array.from({ length: 21 }, (_, i) => `第${42 + i}号議案`),
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
  officialLabels: string[] = R8_2_OFFICIAL_LABELS
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
