// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  isJapaneseLocale,
  isRubyfulExcludedPath,
  RUBYFUL_SELECTOR,
  shouldEnableRubyful,
} from "./should-enable-rubyful";

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

  it("/guide で始まるだけの別パスではルビを止めない", () => {
    expect(
      shouldEnableRubyful({
        isEnabledInStorage: true,
        pathname: "/guidelines",
        locale: "ja",
      })
    ).toBe(true);
  });

  it("locale の表記ゆれ（ja-JP・大文字・空文字）は日本語として扱う", () => {
    for (const locale of ["ja-JP", "JA", " ja ", "", null]) {
      expect(
        shouldEnableRubyful({
          isEnabledInStorage: true,
          pathname: "/",
          locale,
        })
      ).toBe(true);
    }
  });
});

describe("isRubyfulExcludedPath", () => {
  it("/guide と /guide/* は除外する", () => {
    expect(isRubyfulExcludedPath("/guide")).toBe(true);
    expect(isRubyfulExcludedPath("/guide/zh-Hans")).toBe(true);
    expect(isRubyfulExcludedPath("/guide/vi/")).toBe(true);
  });

  it("それ以外のパスと null は除外しない", () => {
    expect(isRubyfulExcludedPath("/")).toBe(false);
    expect(isRubyfulExcludedPath("/guidelines")).toBe(false);
    expect(isRubyfulExcludedPath("/bills/guide")).toBe(false);
    expect(isRubyfulExcludedPath(null)).toBe(false);
  });
});

describe("isJapaneseLocale", () => {
  it("ja 系と未設定は true", () => {
    expect(isJapaneseLocale("ja")).toBe(true);
    expect(isJapaneseLocale("ja-JP")).toBe(true);
    expect(isJapaneseLocale(undefined)).toBe(true);
  });

  it("ja 以外は false（ja で始まるだけの別言語も含む）", () => {
    expect(isJapaneseLocale("en")).toBe(false);
    expect(isJapaneseLocale("zh-Hans")).toBe(false);
    expect(isJapaneseLocale("jam")).toBe(false);
  });
});

describe("RUBYFUL_SELECTOR", () => {
  function render(html: string) {
    document.body.innerHTML = html;
    return Array.from(document.querySelectorAll(RUBYFUL_SELECTOR)).map(
      (element) => element.id
    );
  }

  it("main 内の本文要素にマッチする", () => {
    expect(
      render(
        '<main><h1 id="h">見出し</h1><p id="p">本文</p><ul><li id="li">項目</li></ul></main><p id="outside">外</p>'
      )
    ).toEqual(["h", "p", "li"]);
  });

  it(".no-rubyful 自身とその子孫にはマッチしない", () => {
    expect(
      render(
        '<main><p id="ja">日本語</p><article class="no-rubyful"><h1 id="zh">中文标题</h1><section><p id="deep">本网站由个人运营</p></section></article></main>'
      )
    ).toEqual(["ja"]);
  });

  it("追加ノード自身の判定（matches）でも .no-rubyful 配下を除外する", () => {
    document.body.innerHTML =
      '<main><div class="no-rubyful"><p id="zh">中文</p></div><p id="ja">日本語</p></main>';
    expect(document.getElementById("zh")?.matches(RUBYFUL_SELECTOR)).toBe(
      false
    );
    expect(document.getElementById("ja")?.matches(RUBYFUL_SELECTOR)).toBe(true);
  });
});
