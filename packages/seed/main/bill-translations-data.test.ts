import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import { billTranslationsWithBillSlug } from "./bill-translations-data";

/**
 * シードの翻訳が、いまの日本語から作られたものであることを固定する。
 * 日本語を直したら翻訳も直す。ハッシュだけ書き換えてはならない。
 */
describe("bill-translations-data", () => {
  it.each(
    billTranslationsWithBillSlug.map((t) => [
      `${t.bill_slug} / ${t.difficulty_level} / ${t.locale}`,
      t,
    ])
  )("%s: source_hash が現在の日本語と一致する", (_label, translation) => {
    const source = billContentsWithBillSlug.find(
      (c) =>
        c.bill_slug === translation.bill_slug &&
        c.difficulty_level === translation.difficulty_level
    );
    expect(source).toBeDefined();
    if (!source) return;

    expect(translation.source_hash).toBe(calculateSourceHash(source));
  });

  it("人の確認前の翻訳を reviewed としてシードしない", () => {
    for (const translation of billTranslationsWithBillSlug) {
      expect(translation.status).not.toBe("reviewed");
    }
  });

  it("reviewed の翻訳には確認日時と確認者がある", () => {
    for (const translation of billTranslationsWithBillSlug) {
      if (translation.status !== "reviewed") continue;

      expect(translation.reviewed_at).toBeTruthy();
      expect(translation.reviewed_by).toBeTruthy();
    }
  });

  it("同じ本文・同じロケールの翻訳を重複させない", () => {
    const keys = billTranslationsWithBillSlug.map(
      (t) => `${t.bill_slug}/${t.difficulty_level}/${t.locale}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});
