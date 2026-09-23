import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import { buildTranslationMatrix } from "./build-translation-matrix";

const R8_2 = { name: "令和8年第2回定例会", start_date: "2026-06-10" };
const R8_1 = { name: "令和8年第1回定例会", start_date: "2026-02-18" };

const bill = (
  id: string,
  overrides: Partial<{
    bill_number: string;
    bill_number_order: number | null;
    council_sessions: { name: string; start_date: string } | null;
  }> = {}
) => ({
  id,
  name: `${id} name`,
  bill_number: id,
  bill_number_order: null,
  council_sessions: R8_2,
  ...overrides,
});

const source = (billId: string) => ({
  id: `${billId}-normal`,
  bill_id: billId,
  difficulty_level: "normal",
  title: `${billId} title`,
  summary: `${billId} summary`,
  content: `${billId} body`,
});

const translation = (
  billId: string,
  locale: string,
  overrides: Partial<{ status: string; source_hash: string }> = {}
) => ({
  bill_content_id: `${billId}-normal`,
  locale,
  status: "generated",
  source_hash: calculateSourceHash(source(billId)),
  ...overrides,
});

describe("buildTranslationMatrix", () => {
  it("新しい会期を上に、同じ会期の中は議案番号順に並べる", () => {
    const { rows } = buildTranslationMatrix({
      bills: [
        bill("old", { council_sessions: R8_1, bill_number_order: 1 }),
        bill("b", { bill_number_order: 2 }),
        bill("none", { council_sessions: null }),
        bill("a", { bill_number_order: 1 }),
        bill("no-order"),
      ],
      sources: [],
      translations: [],
      hashSource: calculateSourceHash,
    });
    expect(rows.map((r) => r.billId)).toEqual([
      "a",
      "b",
      "no-order",
      "old",
      "none",
    ]);
  });

  it("翻訳の状態を議案ごとの翻訳画面と同じ規則で決める", () => {
    const { rows } = buildTranslationMatrix({
      bills: [bill("x")],
      sources: [source("x")],
      translations: [
        translation("x", "en", { status: "reviewed" }),
        translation("x", "ko"),
        // reviewed でも日本語が変わっていれば stale
        translation("x", "vi", {
          status: "reviewed",
          source_hash: `v1:${"0".repeat(64)}`,
        }),
        translation("x", "ne", { status: "stale" }),
      ],
      hashSource: calculateSourceHash,
    });
    expect(rows[0].statuses).toEqual({
      en: "reviewed",
      "zh-Hans": "missing",
      ko: "generated",
      ne: "stale",
      my: "missing",
      vi: "stale",
    });
    expect(rows[0].hasSource).toBe(true);
  });

  it("別の議案の翻訳や翻訳先でないロケールは数えない", () => {
    const { rows } = buildTranslationMatrix({
      bills: [bill("x"), bill("y")],
      sources: [source("x"), source("y")],
      translations: [translation("y", "en"), translation("x", "ja")],
      hashSource: calculateSourceHash,
    });
    const x = rows.find((r) => r.billId === "x");
    expect(Object.values(x?.statuses ?? {})).toEqual(
      new Array(6).fill("missing")
    );
  });

  it("日本語の「ふつう」がない議案は全ロケール未翻訳で hasSource が false", () => {
    const { rows } = buildTranslationMatrix({
      bills: [bill("x")],
      sources: [],
      translations: [translation("x", "en")],
      hashSource: calculateSourceHash,
    });
    expect(rows[0].hasSource).toBe(false);
    expect(rows[0].statuses.en).toBe("missing");
  });

  it("日本語の「ふつう」がない議案は件数に入れない", () => {
    const { summary } = buildTranslationMatrix({
      bills: [bill("x"), bill("y")],
      sources: [source("x")],
      translations: [],
      hashSource: calculateSourceHash,
    });
    expect(summary.en.missing).toBe(1);
  });

  it("ロケールごとに状態の件数を数える", () => {
    const { summary } = buildTranslationMatrix({
      bills: [bill("x"), bill("y"), bill("z")],
      sources: [source("x"), source("y"), source("z")],
      translations: [
        translation("x", "en", { status: "reviewed" }),
        translation("y", "en"),
      ],
      hashSource: calculateSourceHash,
    });
    expect(summary.en).toEqual({
      reviewed: 1,
      generated: 1,
      stale: 0,
      missing: 1,
    });
    expect(summary.my.missing).toBe(3);
  });
});
