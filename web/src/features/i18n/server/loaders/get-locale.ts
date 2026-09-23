import "server-only";
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  parseLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { cookies } from "next/headers";

/**
 * 現在の表示言語をCookieから取得
 *
 * Note: URLパラメータ ?lang=en がある場合はMiddlewareがCookieにセットする。
 * Accept-Language による自動切替はしない（決定記録を参照）。
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
