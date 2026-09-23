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

export const DEFAULT_LOCALE: Locale = "ja";

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

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Cookie やクエリの値からロケールを決める。
 * 大文字小文字の揺れ（zh-hans 等）は受け付けず、不正な値は既定の ja に倒す。
 */
export function parseLocale(value: string | null | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
