import {
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
} from "@mirai-gikai/shared/i18n/locales";
import { cookies } from "next/headers";
import { LOCALE_COOKIE_OPTIONS } from "../../shared/types";

export type CookieStore = {
  set: (name: string, value: string, options: object) => void;
};

export type SetLocaleDeps = {
  getCookies?: () => Promise<CookieStore>;
};

/**
 * 表示言語をCookieに保存するコアロジック
 * Server Action の引数はクライアントから任意の値が届くため、ここで検証する。
 * テストからはDIでcookiesを差し替え可能
 */
export async function setLocaleCore(locale: unknown, deps?: SetLocaleDeps) {
  if (!isSupportedLocale(locale)) {
    throw new Error("Unsupported locale");
  }
  const getCookies = deps?.getCookies ?? cookies;
  const cookieStore = await getCookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}
