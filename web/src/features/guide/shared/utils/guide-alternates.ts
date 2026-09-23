import {
  GUIDE_LOCALES,
  type GuideLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { routes } from "@/lib/routes";

/**
 * 5言語の案内ページを互いに結ぶ hreflang の一覧（locale → URL）。
 * baseUrl を渡すと絶対 URL（sitemap 用）、省略すると相対パス（metadata 用）。
 */
export function buildGuideLanguageAlternates(
  baseUrl = ""
): Record<GuideLocale, string> {
  return Object.fromEntries(
    GUIDE_LOCALES.map((locale) => [locale, `${baseUrl}${routes.guide(locale)}`])
  ) as Record<GuideLocale, string>;
}
