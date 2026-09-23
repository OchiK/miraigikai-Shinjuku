"use server";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { setLocaleCore } from "../services/set-locale-core";

/**
 * 表示言語をCookieに保存
 * Client Componentsから呼び出されるServer Action
 */
export async function setLocale(locale: PublicLocale) {
  return setLocaleCore(locale);
}
