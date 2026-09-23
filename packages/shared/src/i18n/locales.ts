/**
 * 表示言語（locale）の定義。
 *
 * やさしい日本語は locale ではなく difficulty（easy）で表す。
 * docs/I18N_AND_EASY_JAPANESE.md「表示言語と内容難易度を分ける」を参照。
 * zh-Hant を足すときは、ここと DB の CHECK 制約の両方に追加する。
 */
export const SUPPORTED_LOCALES = [
  "ja",
  "en",
  "zh-Hans",
  "ko",
  "ne",
  "my",
  "vi",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** 翻訳先のロケール。ja は正本なので翻訳テーブルには持たない */
export type TranslationLocale = Exclude<Locale, "ja">;

export const DEFAULT_LOCALE = "ja" satisfies Locale;

export const LOCALE_COOKIE_NAME = "locale";

/** URL で言語を指定するクエリパラメータ（例: /bills/xxx?lang=en） */
export const LOCALE_QUERY_PARAM = "lang";

/** 言語切替メニューに出す名前。各言語の話者が自分の言語を見つけられるよう自言語表記 */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-Hans": "简体中文",
  ko: "한국어",
  ne: "नेपाली",
  my: "မြန်မာဘာသာ",
  vi: "Tiếng Việt",
};

/**
 * 議案の翻訳を公開する言語。運営が内容を確認できる英語だけ。
 * ここにない言語は reviewed でも公開画面に出さず、管理画面でも承認させない。
 * 言語を足すときは確認の体制を記録してから
 * （docs/20260924_0450_多言語方針の見直し_英語のみ翻訳と多言語案内ページ.md §6）。
 */
export const PUBLIC_TRANSLATION_LOCALES = ["en"] as const satisfies readonly TranslationLocale[];

export type PublicTranslationLocale =
  (typeof PUBLIC_TRANSLATION_LOCALES)[number];

/** 公開画面で表示言語として選べる言語（言語切替メニュー・Cookie・?lang=） */
export const PUBLIC_LOCALES = [
  DEFAULT_LOCALE,
  ...PUBLIC_TRANSLATION_LOCALES,
] as const satisfies readonly Locale[];

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

/** 議案の翻訳を出さず、案内ページ（/guide/[locale]）だけを置く言語 */
export const GUIDE_LOCALES = [
  "zh-Hans",
  "ko",
  "ne",
  "my",
  "vi",
] as const satisfies readonly TranslationLocale[];

export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function isPublicTranslationLocale(
  value: unknown
): value is PublicTranslationLocale {
  return (
    typeof value === "string" &&
    (PUBLIC_TRANSLATION_LOCALES as readonly string[]).includes(value)
  );
}

export function isPublicLocale(value: unknown): value is PublicLocale {
  return (
    typeof value === "string" &&
    (PUBLIC_LOCALES as readonly string[]).includes(value)
  );
}

export function isGuideLocale(value: unknown): value is GuideLocale {
  return (
    typeof value === "string" &&
    (GUIDE_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * 公開画面の Cookie やクエリの値から表示言語を決める。
 * 大文字小文字の揺れ（zh-hans 等）は受け付けず、不正な値と公開していない言語
 * （vi 等。以前の Cookie が残っている場合を含む）は既定の ja に倒す。
 */
export function parseLocale(value: string | null | undefined): PublicLocale {
  return isPublicLocale(value) ? value : DEFAULT_LOCALE;
}
