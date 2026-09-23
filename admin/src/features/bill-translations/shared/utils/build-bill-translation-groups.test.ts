import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import { buildBillTranslationGroups } from "./build-bill-translation-groups";

const content = (id: string, difficulty_level: string) => ({
  id,
  difficulty_level,
  title: `${id} title`,
  summary: `${id} summary`,
  content: `${id} body`,
});

const translation = (
  bill_content_id: string,
  locale: string,
  overrides: Partial<{ status: string; source_hash: string }> = {}
) => ({
  id: `${bill_content_id}-${locale}`,
  bill_content_id,
  locale,
  title: "T",
  summary: "S",
  content: "C",
  status: "generated",
  source_hash: `v1:${"0".repeat(64)}`,
  model: null,
  translated_at: "2026-09-23T00:00:00.000Z",
  reviewed_at: null,
  reviewed_by: null,
  ...overrides,
});

describe("buildBillTranslationGroups", () => {
  it("難易度を やさしい → ふつう → くわしく の順に並べ、未知の難易度は捨てる", () => {
    const groups = buildBillTranslationGroups({
      contents: [
        content("hard", "hard"),
        content("x", "legacy"),
        content("easy", "easy"),
        content("normal", "normal"),
      ],
      translations: [],
      hashSource: calculateSourceHash,
    });
    expect(groups.map((g) => g.source.difficultyLevel)).toEqual([
      "easy",
      "normal",
      "hard",
    ]);
  });

  it("原文のハッシュは現在の日本語から計算する", () => {
    const source = content("normal", "normal");
    const [group] = buildBillTranslationGroups({
      contents: [source],
      translations: [],
      hashSource: calculateSourceHash,
    });
    expect(group.source.sourceHash).toBe(calculateSourceHash(source));
  });

  it("翻訳をコンテンツごと・ロケールごとに振り分け、ja と未対応ロケールは捨てる", () => {
    const groups = buildBillTranslationGroups({
      contents: [content("normal", "normal"), content("hard", "hard")],
      translations: [
        translation("normal", "en"),
        translation("normal", "ja"),
        translation("normal", "fr"),
        translation("hard", "ko"),
        translation("other-bill", "en"),
      ],
      hashSource: calculateSourceHash,
    });
    expect(Object.keys(groups[0].translations)).toEqual(["en"]);
    expect(Object.keys(groups[1].translations)).toEqual(["ko"]);
  });

  it("source_hash が現在の日本語と一致すれば isStale は false、違えば true", () => {
    const source = content("normal", "normal");
    const currentHash = calculateSourceHash(source);
    const [group] = buildBillTranslationGroups({
      contents: [source],
      translations: [
        translation("normal", "en", { source_hash: currentHash }),
        translation("normal", "ko"),
      ],
      hashSource: calculateSourceHash,
    });
    expect(group.translations.en?.isStale).toBe(false);
    expect(group.translations.ko?.isStale).toBe(true);
  });

  it("DB の status が stale なら、ハッシュが一致していても isStale は true", () => {
    const source = content("normal", "normal");
    const [group] = buildBillTranslationGroups({
      contents: [source],
      translations: [
        translation("normal", "en", {
          status: "stale",
          source_hash: calculateSourceHash(source),
        }),
      ],
      hashSource: calculateSourceHash,
    });
    expect(group.translations.en?.isStale).toBe(true);
  });
});
