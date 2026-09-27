import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getFaqItems } from "./faq-data";

const japaneseCharacters = /[぀-ヿ一-鿿]/;

describe("getFaqItems", () => {
  it.each(["ja", "en"] as const)("%s の質問と回答を9件返す", (locale) => {
    const items = getFaqItems(locale);

    expect(items).toHaveLength(9);
    for (const item of items) {
      expect(item.question.trim()).not.toBe("");
      expect(renderToStaticMarkup(<>{item.answer}</>).trim()).not.toBe("");
    }
  });

  it("英語の質問と回答に日本語が混ざっていない", () => {
    for (const item of getFaqItems("en")) {
      const answer = renderToStaticMarkup(<>{item.answer}</>);
      expect(item.question).not.toMatch(japaneseCharacters);
      expect(answer).not.toMatch(japaneseCharacters);
    }
  });
});
