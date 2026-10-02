import { describe, expect, it } from "vitest";
import { resolveChatLocale } from "./resolve-chat-locale";

describe("resolveChatLocale", () => {
  it("メッセージが無ければ ja", () => {
    expect(resolveChatLocale([])).toBe("ja");
  });

  it("最後のメッセージの locale を優先する（途中で言語を切り替えた場合）", () => {
    expect(
      resolveChatLocale([
        { metadata: { locale: "ja" } },
        { metadata: { locale: "en" } },
      ])
    ).toBe("en");
  });

  it("locale を持たない最後のメッセージは飛ばして前のものを使う", () => {
    expect(
      resolveChatLocale([{ metadata: { locale: "en" } }, { metadata: {} }])
    ).toBe("en");
  });

  it("不正な値は ja に倒す", () => {
    expect(resolveChatLocale([{ metadata: { locale: "xx" } }])).toBe("ja");
    expect(resolveChatLocale([{ metadata: { locale: 5 } }])).toBe("ja");
  });
});
