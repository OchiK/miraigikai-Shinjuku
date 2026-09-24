/**
 * ルビ（Rubyful）を起動・維持すべきかどうかを判定する純粋関数。
 *
 * 以下の場合はルビを無効（false）にする：
 * 1. ユーザー設定（LocalStorage）でルビがOFFの場合
 * 2. 多言語案内ページ（/guide/*）を表示中の場合（中国語等の漢字に日本語ルビが付くのを防ぐ）
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

  if (params.pathname?.startsWith("/guide")) {
    return false;
  }

  if (params.locale && params.locale !== "ja") {
    return false;
  }

  return true;
}
