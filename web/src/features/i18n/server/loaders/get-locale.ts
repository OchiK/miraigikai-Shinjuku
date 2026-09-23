import "server-only";
import {
  LOCALE_COOKIE_NAME,
  type PublicLocale,
  parseLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { cookies } from "next/headers";

/**
 * 現在の表示言語をCookieから取得
 *
 * Note: URLパラメータ ?lang=en がある場合はMiddlewareがCookieにセットする。
 * Accept-Language による自動切替はしない（決定記録を参照）。
 * 議案の翻訳を公開していない言語（vi 等）の Cookie が残っていても ja を返す。
 */
export async function getLocale(): Promise<PublicLocale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
