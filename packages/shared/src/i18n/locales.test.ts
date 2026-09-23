import { describe, expect, it } from "vitest";
import {
  isSupportedLocale,
  LOCALE_NATIVE_NAMES,
  parseLocale,
  SUPPORTED_LOCALES,
} from "./locales";

describe("parseLocale", () => {
  it.each(SUPPORTED_LOCALES)("%s はそのまま返す", (locale) => {
    expect(parseLocale(locale)).toBe(locale);
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
