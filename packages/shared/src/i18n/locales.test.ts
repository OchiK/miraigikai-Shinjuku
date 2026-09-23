import { describe, expect, it } from "vitest";
import {
  GUIDE_LOCALES,
  isGuideLocale,
  isPublicLocale,
  isPublicTranslationLocale,
  isSupportedLocale,
  LOCALE_NATIVE_NAMES,
  PUBLIC_LOCALES,
  PUBLIC_TRANSLATION_LOCALES,
  parseLocale,
  SUPPORTED_LOCALES,
} from "./locales";

describe("公開する言語の一覧", () => {
  // 英語以外を公開に加えるときは確認の体制を記録してから（多言語方針の見直し §6）
  it("議案の翻訳を公開するのは英語だけ", () => {
    expect(PUBLIC_TRANSLATION_LOCALES).toEqual(["en"]);
  });

  it("公開画面で選べる表示言語は日本語と英語だけ", () => {
    expect(PUBLIC_LOCALES).toEqual(["ja", "en"]);
  });

  it("案内ページを置くのは翻訳を公開しない5言語", () => {
    expect(GUIDE_LOCALES).toEqual(["zh-Hans", "ko", "ne", "my", "vi"]);
  });

  it("対応ロケールは、公開する言語と案内ページの言語にちょうど分かれる", () => {
    expect([...PUBLIC_LOCALES, ...GUIDE_LOCALES].sort()).toEqual(
      [...SUPPORTED_LOCALES].sort()
    );
  });

  it.each(GUIDE_LOCALES)("%s は翻訳の公開も表示言語の選択もできない", (locale) => {
    expect(isPublicTranslationLocale(locale)).toBe(false);
    expect(isPublicLocale(locale)).toBe(false);
    expect(isGuideLocale(locale)).toBe(true);
  });

  it("ja は正本なので翻訳を公開する言語には含まない", () => {
    expect(isPublicTranslationLocale("ja")).toBe(false);
    expect(isPublicLocale("ja")).toBe(true);
    expect(isGuideLocale("ja")).toBe(false);
  });

  it("文字列以外や未対応の値は false", () => {
    for (const value of [1, null, undefined, "fr", "zh-hans", "EN"]) {
      expect(isPublicTranslationLocale(value)).toBe(false);
      expect(isPublicLocale(value)).toBe(false);
      expect(isGuideLocale(value)).toBe(false);
    }
  });
});

describe("parseLocale", () => {
  it.each(PUBLIC_LOCALES)("%s はそのまま返す", (locale) => {
    expect(parseLocale(locale)).toBe(locale);
  });

  it.each(GUIDE_LOCALES)("公開していない %s は ja に倒す", (locale) => {
    expect(parseLocale(locale)).toBe("ja");
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["空文字", ""],
    ["未対応の言語", "fr"],
    ["大文字小文字の揺れ", "zh-hans"],
    ["やさしい日本語を locale として渡した", "ja-easy"],
  ])("%s は ja に倒す", (_label, value) => {
    expect(parseLocale(value)).toBe("ja");
  });
});

describe("isSupportedLocale", () => {
  it("文字列以外は false", () => {
    expect(isSupportedLocale(1)).toBe(false);
    expect(isSupportedLocale({})).toBe(false);
  });
});

describe("LOCALE_NATIVE_NAMES", () => {
  it("全ロケールに表示名がある", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_NATIVE_NAMES[locale]).toBeTruthy();
    }
  });
});
