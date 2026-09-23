import { GUIDE_LOCALES } from "@mirai-gikai/shared/i18n/locales";
import { describe, expect, it } from "vitest";
import { buildGuideLanguageAlternates } from "./guide-alternates";

describe("buildGuideLanguageAlternates", () => {
  it("5言語すべての案内ページを含む", () => {
    expect(Object.keys(buildGuideLanguageAlternates())).toEqual([
      ...GUIDE_LOCALES,
    ]);
  });

  it("baseUrl を省略すると相対パス", () => {
    expect(buildGuideLanguageAlternates().vi).toBe("/guide/vi");
  });

  it("baseUrl を渡すと絶対 URL", () => {
    expect(buildGuideLanguageAlternates("https://example.com")).toEqual({
      "zh-Hans": "https://example.com/guide/zh-Hans",
      ko: "https://example.com/guide/ko",
      ne: "https://example.com/guide/ne",
      my: "https://example.com/guide/my",
      vi: "https://example.com/guide/vi",
    });
  });
});
