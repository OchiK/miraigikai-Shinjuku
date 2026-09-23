import { describe, expect, it } from "vitest";
import { calculateSourceHash } from "./source-hash";
import {
  resolveLocalizedContent,
  type SourceContent,
  type TranslationRecord,
} from "./translation-fallback";

function makeSource(id: string, difficulty_level: string): SourceContent {
  return {
    id,
    difficulty_level,
    title: `${difficulty_level}の題名`,
    summary: `${difficulty_level}の要約`,
    content: `${difficulty_level}の本文`,
  };
}

const easy = makeSource("c-easy", "easy");
const normal = makeSource("c-normal", "normal");
const hard = makeSource("c-hard", "hard");
const sources = [easy, normal, hard];

function makeTranslation(
  source: SourceContent,
  overrides: Partial<TranslationRecord> = {}
): TranslationRecord {
  return {
    bill_content_id: source.id,
    locale: "en",
    title: `EN ${source.difficulty_level} title`,
    summary: `EN ${source.difficulty_level} summary`,
    content: `EN ${source.difficulty_level} content`,
    source_hash: calculateSourceHash(source),
    status: "reviewed",
    ...overrides,
  };
}

describe("resolveLocalizedContent", () => {
  it("選んだ難易度の翻訳があればそれを使う", () => {
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "hard",
      sources,
      translations: [makeTranslation(hard), makeTranslation(normal)],
    });
    expect(result.kind).toBe("translated");
    if (result.kind !== "translated") return;
    expect(result.source.id).toBe("c-hard");
    expect(result.translation.title).toBe("EN hard title");
  });

  it("選んだ難易度の翻訳が無ければ「ふつう」の翻訳に落とす", () => {
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "easy",
      sources,
      translations: [makeTranslation(normal)],
    });
    expect(result.kind).toBe("translated");
    if (result.kind !== "translated") return;
    expect(result.source.difficulty_level).toBe("normal");
  });

  it("翻訳が無ければ日本語「ふつう」を返す", () => {
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "hard",
      sources,
      translations: [],
    });
    expect(result).toEqual({ kind: "unavailable", fallback: normal });
  });

  it("日本語「ふつう」も無ければ fallback は null", () => {
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "hard",
      sources: [hard],
      translations: [],
    });
    expect(result).toEqual({ kind: "unavailable", fallback: null });
  });

  it.each(["generated", "stale"])("status=%s の翻訳は公開しない", (status) => {
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "normal",
      sources,
      translations: [makeTranslation(normal, { status })],
    });
    expect(result.kind).toBe("unavailable");
  });

  it("reviewed でも日本語が変わっていたら公開しない（読み出し時の照合）", () => {
    const edited = { ...normal, content: "改定後の本文" };
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "normal",
      sources: [easy, edited, hard],
      translations: [makeTranslation(normal)],
    });
    expect(result).toEqual({ kind: "unavailable", fallback: edited });
  });

  it("別のロケールの翻訳は使わない", () => {
    const result = resolveLocalizedContent({
      locale: "ko",
      requestedDifficulty: "normal",
      sources,
      translations: [makeTranslation(normal)],
    });
    expect(result.kind).toBe("unavailable");
  });

  it("sources に無い bill_content の翻訳（別議案）は使わない", () => {
    const otherBill = makeSource("other-bill-normal", "normal");
    const result = resolveLocalizedContent({
      locale: "en",
      requestedDifficulty: "normal",
      sources,
      translations: [
        {
          ...makeTranslation(otherBill),
          // 本文が一致していても id が違えば別議案
          source_hash: calculateSourceHash(normal),
        },
      ],
    });
    expect(result.kind).toBe("unavailable");
  });
});
