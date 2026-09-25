/**
 * 新宿区議会の更新検知（P5-1）で使う型。
 *
 * 検知ジョブはDBにもインベントリ（main/*.ts）にも書き込まない。
 * 出力はドラフトJSONとレポートだけで、人間がレビューしてから
 * インベントリへ転記する。
 */

/** 区長提出議案の提出議案ページ1行（例: 第63号議案　令和8年度…） */
export interface SubmissionEntry {
  /** 公式ページ表記の識別名（例: 第63号議案 / 承認第2号 / 認定第1号） */
  officialLabel: string;
  /** 公式ページ表記の件名 */
  officialTitle: string;
  /** 全文PDFの絶対URL。PDFへのリンクでなければ null */
  pdfUrl: string | null;
}

/** 議決結果ページの表1行 */
export interface DecisionEntry {
  officialLabel: string;
  officialTitle: string;
  /** 公式の議決結果（原案可決 / 否決 / 承認 / 認定 など） */
  decision: string;
}

/** 一覧ページ（提出議案一覧・議決結果一覧）の1リンク */
export interface IndexEntry {
  /** リンク文言（例: 令和8年第3回定例会提出議案） */
  title: string;
  /** 会期ページの絶対URL */
  url: string;
  /** 文言から読み取った会期ID（例: r8-3）。読み取れなければ null */
  sessionId: string | null;
}

/** 本文領域の1リンク（監視対象ページのリンク集合の比較に使う） */
export interface PageLink {
  text: string;
  href: string;
}

/** 公式サイトから取得した1会期分の内容 */
export interface SessionSnapshot {
  sessionId: string;
  /** 一覧ページのリンク文言 */
  sessionName: string;
  submissionsUrl: string | null;
  decisionsUrl: string | null;
  submissions: SubmissionEntry[];
  decisions: DecisionEntry[];
}

/** インベントリに登録済みの案件（比較に必要な項目だけ） */
export interface KnownItem {
  officialLabel: string;
  officialTitle: string;
  fullTextPdfUrl: string | null;
  /** 公式の議決結果。議決結果ページが未掲載の会期は null */
  decision: string | null;
  /** 公開レビュー済みか（bills.is_review_completed） */
  reviewCompleted: boolean;
}

/** インベントリに登録済みの会期 */
export interface KnownSession {
  sessionId: string;
  submissionsUrl: string;
  /**
   * 議決結果ページ。会期中で未掲載なら null。
   * null の会期は毎回、議決結果の一覧からその会期のページを探す。
   */
  decisionsUrl: string | null;
  /** 区長提出議案の提出議案ページ・議決結果ページに載る案件だけ */
  items: KnownItem[];
}

/**
 * リポジトリに保存する監視状態。
 *
 * 取得日時などの揮発する値は持たせない。毎回変わる値を入れると、
 * 公式サイトが変わっていなくてもドラフトPRが毎回更新されてしまう。
 */
export interface MonitorState {
  /** URL → 本文領域のリンク集合 */
  linkPages: Record<string, PageLink[]>;
  /** PDF URL → sha256（16進） */
  pdfs: Record<string, string>;
}

/**
 * 自動生成するドラフト案件。
 *
 * reviewCompleted / hasPublishableContent は型で false に固定する。
 * 人間が出典を突合してインベントリへ転記するまで、公開もレビュー済み扱いもしない。
 */
export interface DraftItem {
  sessionId: string;
  officialLabel: string;
  officialTitle: string;
  fullTextPdfUrl: string | null;
  /** 議決結果が未掲載なら null */
  decision: string | null;
  sourcePageUrl: string | null;
  decisionSourceUrl: string | null;
  reviewCompleted: false;
  hasPublishableContent: false;
}

/** 登録済み案件と公式サイトの食い違い。インベントリへは反映せず、レポートに載せるだけ */
export interface ProposedChange {
  sessionId: string;
  officialLabel: string;
  field:
    | "officialTitle"
    | "fullTextPdfUrl"
    | "decision"
    | "decisionsUrl"
    | "missingOnOfficialPage";
  /** インベントリの値 */
  current: string | null;
  /** 公式サイトの値 */
  official: string | null;
  /** 食い違いのある案件が公開レビュー済みか（レポートで強調する） */
  reviewCompleted: boolean;
}

export interface LinkPageChange {
  url: string;
  added: PageLink[];
  removed: PageLink[];
}

export interface PdfChange {
  url: string;
  /** 前回の sha256。初回は null */
  previous: string | null;
  current: string;
}

export interface DetectionResult {
  /** 公式一覧から新たに見つかった会期（例: r8-3） */
  newSessions: SessionSnapshot[];
  draftItems: DraftItem[];
  proposedChanges: ProposedChange[];
  linkPageChanges: LinkPageChange[];
  pdfChanges: PdfChange[];
}
