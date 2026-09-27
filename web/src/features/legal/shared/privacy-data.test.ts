import { describe, expect, it } from "vitest";
import { getPrivacyContent } from "./privacy-data";

const japaneseCharacters = /[぀-ヿ一-鿿]/;

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("getPrivacyContent", () => {
  it.each(["ja", "en"] as const)("%s の全8節を返す", (locale) => {
    const document = getPrivacyContent(locale);

    expect(document.sections).toHaveLength(8);
    for (const text of collectStrings(document)) {
      expect(text.trim()).not.toBe("");
    }
  });

  it("英語版に日本語が混ざっていない", () => {
    for (const text of collectStrings(getPrivacyContent("en"))) {
      expect(text).not.toMatch(japaneseCharacters);
    }
  });
});
