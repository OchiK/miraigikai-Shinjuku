import { LOCALE_QUERY_PARAM } from "@mirai-gikai/shared/i18n/locales";

/**
 * URL から ?lang を外した URL を返す。?lang が無ければ null。
 *
 * ?lang が残っていると Middleware が Cookie を上書きするため、
 * 言語を切り替えたあとの再読み込みでは外した URL へ移る。
 */
export function removeLocaleParam(href: string): string | null {
  const url = new URL(href);
  if (!url.searchParams.has(LOCALE_QUERY_PARAM)) {
    return null;
  }
  url.searchParams.delete(LOCALE_QUERY_PARAM);
  return url.toString();
}
