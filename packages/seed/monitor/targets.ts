import {
  R8_2_COUNCIL_RESOLUTIONS_URL,
  R8_2_COUNCIL_RESULTS_PDF,
  R8_2_DECISIONS_URL,
  R8_2_SUBMISSIONS_URL,
  r8SecondSessionItems,
} from "../main/shinjuku-r8-2-inventory";
import type { KnownSession } from "./types";

/**
 * 監視対象。
 *
 * 会期ごとのページURLは会期ごとに変わる（…_001109_02 → _03 → …）ため固定しない。
 * 区長提出議案は一覧ページから会期ページをたどり、インベントリに無い会期を新規として扱う。
 */

/** 区長提出議案の一覧（会期ごとの提出議案ページへのリンクが新しい順に並ぶ） */
export const SUBMISSIONS_INDEX_URL =
  "https://www.city.shinjuku.lg.jp/kusei/index_gian01.html";

/** 議決結果の一覧（会期ごとの議決結果ページへのリンクが新しい順に並ぶ） */
export const DECISIONS_INDEX_URL =
  "https://www.city.shinjuku.lg.jp/kusei/index_giketsu01.html";

/**
 * リンク集合の増減だけを見るページ。
 *
 * 議員提出議案は議会事務局側のページにしか載らず、会期ページのURLに規則性がない。
 * そのため案件単位の抽出はせず、新しい会期ページや意見書PDFの追加を検知して知らせる。
 */
export const LINK_WATCH_URLS: string[] = [
  // 定例会・臨時会の一覧（新しい会期の議会側ページがここに増える）
  "https://www.city.shinjuku.lg.jp/kusei/file08_00015.html",
  // 決議・意見書（令和8年）。可決した意見書の全文PDFが増える
  R8_2_COUNCIL_RESOLUTIONS_URL,
];

/** 内容の差し替えを sha256 で見るPDF（議員提出議案の議決結果・会派賛否の出典） */
export const PDF_WATCH_URLS: string[] = [R8_2_COUNCIL_RESULTS_PDF];

/**
 * インベントリに登録済みの会期。
 *
 * 新しい会期のインベントリ（例: shinjuku-r8-3-inventory.ts）を追加したら、ここにも足すこと。
 * 足さないと、その会期の案件が毎回ドラフトとして出続ける。
 */
export const KNOWN_SESSIONS: KnownSession[] = [
  {
    // R8_2_SESSION.slug と同じ値（テストで一致を確かめている）
    sessionId: "r8-2",
    submissionsUrl: R8_2_SUBMISSIONS_URL,
    decisionsUrl: R8_2_DECISIONS_URL,
    // 議員提出議案は区長提出議案のページに載らないため比較から外す
    items: r8SecondSessionItems
      .filter((item) => item.itemType !== "giin")
      .map((item) => ({
        officialLabel: item.officialLabel,
        officialTitle: item.officialTitle,
        fullTextPdfUrl: item.fullTextPdfUrl,
        decision: item.decision,
        // toBillInsert の is_review_completed と同じ既定値（省略時は公開可否に従う）
        reviewCompleted: item.reviewCompleted ?? item.hasPublishableContent,
      })),
  },
];

/** 公式サイトへのリクエストに付ける User-Agent（問い合わせ先がわかるようにする） */
export const MONITOR_USER_AGENT =
  "mirai-gikai-shinjuku-monitor/1.0 (+https://github.com/OchiK/miraigikai-Shinjuku)";
