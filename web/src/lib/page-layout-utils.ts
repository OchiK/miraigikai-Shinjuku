/**
 * ページレイアウトに関するユーティリティ
 *
 * TOPページ・議案詳細ページ・定例会の議案一覧ページは「メインページ」として扱い、
 * DifficultySelectorを表示する。
 * チャットサイドバー用のオフセットは議案詳細ページのみ（デザインシステム定義 §5・§10）。
 */

/** メインページ（TOP、議案詳細、定例会の議案一覧）かどうかを判定 */
export function isMainPage(pathname: string): boolean {
  // トップページ
  if (pathname === "/") return true;
  // 議案詳細ページ（/bills/[id]）- サブパスは除外
  if (/\/bills\/[^/]+$/.test(pathname)) return true;
  // 定例会の議案一覧ページ（/sessions/[slug]/bills）
  if (/^\/sessions\/[^/]+\/bills$/.test(pathname)) return true;
  return false;
}

/** チャットサイドバーを持つページ（議案詳細）かどうかを判定 */
export function hasChatSidebar(pathname: string): boolean {
  // 議案詳細ページ（/bills/[id]）- サブパスは除外
  return /\/bills\/[^/]+$/.test(pathname);
}

/** インタビューチャットページかどうかを判定 */
export function isInterviewPage(pathname: string): boolean {
  // /bills/[id]/interview/chat
  return /\/bills\/[^/]+\/interview\/chat$/.test(pathname);
}

/** インタビューセクション（LP・チャット含む）かどうかを判定 */
export function isInterviewSection(pathname: string): boolean {
  // /bills/[id]/interview 以下すべて
  return /\/bills\/[^/]+\/interview(\/|$)/.test(pathname);
}

/** インタビューページからbillIdを抽出 */
export function extractBillIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/bills\/([^/]+)/);
  return match ? match[1] : null;
}
