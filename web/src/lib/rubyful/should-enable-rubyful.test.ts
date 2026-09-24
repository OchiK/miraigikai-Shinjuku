import { describe, expect, it } from "vitest";
import { shouldEnableRubyful } from "./should-enable-rubyful";

describe("shouldEnableRubyful", () => {
  it("ストレージで無効化されている場合は false を返す", () => {
    expect(
      shouldEnableRubyful({
        isEnabledInStorage: false,
        pathname: "/",
        locale: "ja",
      })
    ).toBe(false);
  });

  it("日本語ページかつストレージが有効なら true を返す", () => {
    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/bills/shinjuku-2026-r2-shonin-3",
        locale: "ja",
      })
    ).toBe(true);

    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/",
      })
    ).toBe(true);
  });

  it("多言語案内ページ（/guide/*）では常に false を返す", () => {
    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/guide/zh-Hans",
        locale: "ja",
      })
    ).toBe(false);

    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/guide/en",
      })
    ).toBe(false);

    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/guide/ko",
      })
    ).toBe(false);
  });

  it("言語が日本語（ja）以外の場合は false を返す", () => {
    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/bills/shinjuku-2026-r2-gian-42",
        locale: "en",
      })
    ).toBe(false);

    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/",
        locale: "zh-Hans",
      })
    ).toBe(false);
  });
});
