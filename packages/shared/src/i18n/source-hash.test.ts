import { describe, expect, it } from "vitest";
import {
  calculateSourceHash,
  isTranslationStale,
  normalizeSourceText,
  SOURCE_HASH_VERSION,
} from "./source-hash";

const source = {
  difficulty_level: "normal",
  title: "区税条例の専決処分の承認",
  summary: "区長が議会を招集せずに区税条例を改正しました。",
  content: "# 見出し\n\n本文です。",
};

describe("normalizeSourceText", () => {
  it("CRLF と CR を LF にそろえる", () => {
    expect(normalizeSourceText("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("行末の半角・全角空白とタブを削る", () => {
    expect(normalizeSourceText("a \t　\nb")).toBe("a\nb");
  });

  it("先頭と末尾の空行を削る", () => {
    expect(normalizeSourceText("\n\n本文\n\n")).toBe("本文");
  });

  it("NFC に正規化する（結合文字の「が」と合成済みの「が」を同一視）", () => {
    expect(normalizeSourceText("が")).toBe("が");
  });

  it("全角・半角の違いは残す（意味が変わりうるため）", () => {
    expect(normalizeSourceText("１")).not.toBe(normalizeSourceText("1"));
  });
});

describe("calculateSourceHash", () => {
  it("バージョン付きの sha256 を返す", () => {
    expect(calculateSourceHash(source)).toMatch(
      new RegExp(`^${SOURCE_HASH_VERSION}:[0-9a-f]{64}$`)
    );
  });

  it("同じ入力なら同じ値", () => {
    expect(calculateSourceHash(source)).toBe(
      calculateSourceHash({ ...source })
    );
  });

  it("改行コードや行末空白だけの違いでは変わらない", () => {
    expect(
      calculateSourceHash({
        ...source,
        content: "# 見出し  \r\n\r\n本文です。\r\n",
      })
    ).toBe(calculateSourceHash(source));
  });

  it.each([
    ["title", { title: "別の題名" }],
    ["summary", { summary: "別の要約" }],
    ["content", { content: "# 見出し\n\n本文を直しました。" }],
    ["difficulty_level", { difficulty_level: "hard" }],
  ])("%s が変わると値が変わる", (_field, patch) => {
    expect(calculateSourceHash({ ...source, ...patch })).not.toBe(
      calculateSourceHash(source)
    );
  });

  it("フィールドの境界をずらしても衝突しない", () => {
    expect(
      calculateSourceHash({ ...source, title: "ab", summary: "c" })
    ).not.toBe(calculateSourceHash({ ...source, title: "a", summary: "bc" }));
  });
});

describe("isTranslationStale", () => {
  it("翻訳時と同じ日本語なら stale ではない", () => {
    expect(isTranslationStale(calculateSourceHash(source), source)).toBe(
      false
    );
  });

  it("日本語が改定されたら stale", () => {
    const storedHash = calculateSourceHash(source);
    expect(
      isTranslationStale(storedHash, { ...source, summary: "改定後の要約" })
    ).toBe(true);
  });

  it("旧バージョンのハッシュは stale 扱い", () => {
    const digest = calculateSourceHash(source).split(":")[1];
    expect(isTranslationStale(`v0:${digest}`, source)).toBe(true);
  });
});
