import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import {
  applyLocaleCookie,
  isHtmlAcceptHeader,
  isValidDifficultyLevel,
} from "./middleware";

describe("isValidDifficultyLevel", () => {
  it("should return true for 'normal'", () => {
    expect(isValidDifficultyLevel("normal")).toBe(true);
  });

  it("should return true for 'hard'", () => {
    expect(isValidDifficultyLevel("hard")).toBe(true);
  });

  it("should return true for 'easy'", () => {
    expect(isValidDifficultyLevel("easy")).toBe(true);
  });

  it("should return false for invalid value", () => {
    expect(isValidDifficultyLevel("very-hard")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidDifficultyLevel("")).toBe(false);
  });

  it("should return false for null", () => {
    expect(isValidDifficultyLevel(null)).toBe(false);
  });
});

describe("isHtmlAcceptHeader", () => {
  it("should return true for text/html", () => {
    expect(isHtmlAcceptHeader("text/html")).toBe(true);
  });

  it("should return true for accept header with text/html among others", () => {
    expect(
      isHtmlAcceptHeader(
        "text/html,application/xhtml+xml,application/xml;q=0.9"
      )
    ).toBe(true);
  });

  it("should return false for application/json", () => {
    expect(isHtmlAcceptHeader("application/json")).toBe(false);
  });

  it("should return false for image/png", () => {
    expect(isHtmlAcceptHeader("image/png")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isHtmlAcceptHeader("")).toBe(false);
  });
});

describe("applyLocaleCookie", () => {
  function run(url: string) {
    const request = new NextRequest(url);
    const response = NextResponse.next();
    applyLocaleCookie(request, response);
    return response.cookies.get("locale")?.value;
  }

  it("?lang=en なら locale Cookie を en にする", () => {
    expect(run("http://localhost/bills/1?lang=en")).toBe("en");
  });

  it("?lang=ja なら locale Cookie を ja に戻す", () => {
    expect(run("http://localhost/bills/1?lang=ja")).toBe("ja");
  });

  it.each([
    ["翻訳を公開していない言語", "http://localhost/bills/1?lang=vi"],
    [
      "翻訳を公開していない言語（ハイフン付き）",
      "http://localhost/bills/1?lang=zh-Hans",
    ],
    ["未対応の言語", "http://localhost/bills/1?lang=fr"],
    ["大文字小文字の揺れ", "http://localhost/bills/1?lang=zh-hans"],
    ["空文字", "http://localhost/bills/1?lang="],
    ["パラメータなし", "http://localhost/bills/1"],
  ])("%s では Cookie を書かない（既存の選択を ja で上書きしない）", (_label, url) => {
    expect(run(url)).toBeUndefined();
  });
});
