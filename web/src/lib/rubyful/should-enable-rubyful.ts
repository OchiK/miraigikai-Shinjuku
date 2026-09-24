/**
 * ルビを付けない領域を示すクラス名。この要素とその子孫は Rubyful の対象外になる。
 */
export const NO_RUBYFUL_CLASS = "no-rubyful";

const RUBYFUL_TARGET_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "td",
  "th",
  "span",
  "a",
] as const;

/**
 * Rubyful V2 に渡すセレクタ。
 * Rubyful は MutationObserver で追加されたノードを matches / querySelectorAll で
 * 拾うため、`.no-rubyful` 配下を除外しておけば、destroy() が間に合わない
 * クライアント遷移の直後でも非日本語の本文が解析 API に送られない。
 */
export const RUBYFUL_SELECTOR = `main :is(${RUBYFUL_TARGET_TAGS.join(
  ", "
)}):not(.${NO_RUBYFUL_CLASS}, .${NO_RUBYFUL_CLASS} *)`;

/**
 * ルビを付けないページ（多言語案内ページ /guide, /guide/*）かどうか。
 * `/guidelines` のような前方一致だけの別パスは対象外。
 */
export function isRubyfulExcludedPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/guide" || pathname.startsWith("/guide/");
}

/**
 * 表示言語が日本語かどうか。未設定（null・空文字）は既定の日本語とみなす。
 * `ja-JP` や `JA` のような表記ゆれも日本語として扱う。
 */
export function isJapaneseLocale(locale: string | null | undefined): boolean {
  const normalized = locale?.trim().toLowerCase();
  if (!normalized) return true;
  return normalized === "ja" || normalized.startsWith("ja-");
}

/**
 * ルビ（Rubyful）を起動・維持すべきかどうかを判定する純粋関数。
 *
 * 以下の場合はルビを無効（false）にする：
 * 1. ユーザー設定（LocalStorage）でルビがOFFの場合
 * 2. 多言語案内ページ（/guide・/guide/*）を表示中の場合（中国語等の漢字に日本語ルビが付くのを防ぐ）
 * 3. 表示言語（locale）が日本語（ja）以外の場合
 */
export function shouldEnableRubyful(params: {
  isEnabledInStorage: boolean;
  pathname: string | null;
  locale?: string | null;
}): boolean {
  if (!params.isEnabledInStorage) {
    return false;
  }

  if (isRubyfulExcludedPath(params.pathname)) {
    return false;
  }

  if (!isJapaneseLocale(params.locale)) {
    return false;
  }

  return true;
}
