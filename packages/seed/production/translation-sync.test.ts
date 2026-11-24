import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import {
  classifyTranslations,
  reconcileTranslationWrites,
  translationKey,
  translationText,
  validateTranslations,
  type CurrentTranslation,
  type TranslationPayload,
} from "./translation-sync";

const source = {
  bill_slug: "bill",
  difficulty_level: "normal",
  title: "題名",
  summary: "要約",
  content: "本文",
};
const desired: TranslationPayload = {
  bill_slug: "bill",
  difficulty_level: "normal",
  locale: "en",
  title: "Title",
  summary: "Summary",
  content: "Content",
  source_hash: calculateSourceHash({ ...source, difficulty_level: "normal" }),
  source_snapshot: translationText(source),
  model: "test",
  prompt_version: "v1",
};
const current: CurrentTranslation = {
  ...desired,
  status: "generated",
  imported_snapshot: translationText(desired),
};
const key = translationKey(desired);
const classify = (changes: Partial<CurrentTranslation>) =>
  classifyTranslations([{ ...current, ...changes }], [desired]);

describe("translation state table", () => {
  it("inserts missing rows and ignores non-English rows", () => {
    expect(classifyTranslations([], [desired]).created).toEqual([key]);
    expect(
      classifyTranslations([{ ...current, locale: "ko" }], []).extraneous
    ).toEqual([]);
  });
  it("leaves equal reviewed text alone regardless of metadata", () => {
    expect(classify({ status: "reviewed", model: "Admin" }).unchanged).toEqual([
      key,
    ]);
  });
  it("protects reviewed source changes before text changes", () => {
    expect(
      classify({ status: "reviewed", source_hash: "changed", title: "edit" })
        .protected[0].reason
    ).toContain("日本語");
    expect(
      classify({ status: "reviewed", title: "edit" }).protected[0].reason
    ).toContain("Git");
  });
  it.each([
    "generated",
    "stale",
  ])("handles legacy, edited and importer-owned %s", (status) => {
    for (const imported_snapshot of [
      null,
      { ...translationText(current), title: "previous" },
    ]) {
      expect(classify({ status, imported_snapshot }).unchanged).toEqual([key]);
      expect(
        classify({ status, imported_snapshot, title: "Admin" }).protected
      ).toHaveLength(1);
      expect(
        classify({ status, imported_snapshot, source_hash: "changed" })
          .protected
      ).toHaveLength(1);
    }
    expect(classify({ status }).unchanged).toEqual([key]);
    for (const field of [
      "model",
      "prompt_version",
      "source_hash",
      "source_snapshot",
    ] as const) {
      expect(
        classify({
          status,
          [field]: field === "source_snapshot" ? null : "old",
        }).updated
      ).toHaveLength(1);
    }
    expect(
      classify({
        status,
        title: "Old",
        imported_snapshot: { ...translationText(current), title: "Old" },
      }).updated
    ).toHaveLength(1);
  });
  it("compares snapshots like jsonb and retains extraneous rows", () => {
    expect(
      classify({
        imported_snapshot: {
          content: desired.content,
          summary: desired.summary,
          title: desired.title,
        },
      }).unchanged
    ).toEqual([key]);
    expect(classifyTranslations([current], []).extraneous).toEqual([key]);
  });
  it.each([
    "approval",
    "edit",
  ])("reports a skipped concurrent %s from authoritative outcomes", () => {
    const prediction = classify({ model: "old" });
    const result = reconcileTranslationWrites(prediction, {
      created: [],
      updated: [],
    });
    expect(result.updated).toEqual([]);
    expect(result.protected[0].reason).toContain("反映の直前");
    expect(
      reconcileTranslationWrites(prediction, {
        created: [],
        updated: [desired],
      })
    ).toEqual(prediction);
  });
  it("uses actual insert/update outcomes even if the row appeared after prediction", () => {
    const prediction = classifyTranslations([], [desired]);
    expect(
      reconcileTranslationWrites(prediction, {
        created: [],
        updated: [desired],
      }).updated.map((row) => row.key)
    ).toEqual([key]);
  });
});

describe("translation input validation", () => {
  const validate = (rows: TranslationPayload[]) =>
    validateTranslations(rows, ["bill"], [source]);
  it("accepts the matching inventory", () =>
    expect(() => validate([desired])).not.toThrow());
  it("rejects duplicate keys", () =>
    expect(() => validate([desired, desired])).toThrow("重複"));
  it.each([
    { bill_slug: "unknown" },
    { difficulty_level: "hard" },
    { locale: "ko" },
    { title: " " },
    { summary: "" },
    { content: "\n" },
    { source_hash: "invalid" },
    { source_hash: `v1:${"f".repeat(64)}` },
    { source_snapshot: { ...desired.source_snapshot, content: "old" } },
  ])("rejects invalid payload %j", (change) => {
    expect(() => validate([{ ...desired, ...change }])).toThrow();
  });
});
