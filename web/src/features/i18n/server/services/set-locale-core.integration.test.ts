import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALE_COOKIE_OPTIONS } from "../../shared/types";
import { type CookieStore, setLocaleCore } from "./set-locale-core";

describe("setLocale 統合テスト", () => {
  let mockSet: ReturnType<typeof vi.fn>;
  let deps: { getCookies: () => Promise<CookieStore> };

  beforeEach(() => {
    mockSet = vi.fn();
    const store: CookieStore = { set: mockSet };
    deps = { getCookies: async () => store };
  });

  it.each(["ja", "en"])("'%s' をCookieに保存する", async (locale) => {
    await setLocaleCore(locale, deps);

    expect(mockSet).toHaveBeenCalledWith(
      "locale",
      locale,
      LOCALE_COOKIE_OPTIONS
    );
  });

  it.each([
    ["未対応の言語", "fr"],
    ["翻訳を公開していない言語", "vi"],
    ["翻訳を公開していない言語（ハイフン付き）", "zh-Hans"],
    ["大文字小文字の揺れ", "zh-hans"],
    ["文字列以外", 1],
    ["undefined", undefined],
  ])("%s は拒否しCookieを変えない", async (_label, locale) => {
    await expect(setLocaleCore(locale, deps)).rejects.toThrow(
      "Unsupported locale"
    );
    expect(mockSet).not.toHaveBeenCalled();
  });
});
