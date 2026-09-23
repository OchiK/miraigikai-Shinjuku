import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import {
  billTranslationsWithBillSlug,
  findTranslationSourceSnapshot,
} from "./bill-translations-data";

const TRANSLATION_LOCALES = ["en", "zh-Hans", "ko", "ne", "my", "vi"] as const;

/**
 * 本文中の 4 桁以上の数値（桁区切りを除いた値）。
 * 桁区切りは言語で違う（ベトナム語は 292.564）ので、, と . を取り除いて比べる。
 * 「約2億9,256万円」のような万・億単位の概数は、言語ごとに単位を換えて書き直すので対象外。
 */
function extractLargeNumbers(text: string): string[] {
  return (text.replace(/\d[\d,]*[万億]/g, "").match(/\d[\d,.]*\d/g) ?? [])
    .map((n) => n.replace(/[,.]/g, ""))
    .filter((n) => n.length >= 4);
}

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

  it("英語以外の未確認の翻訳を reviewed としてシードしない", () => {
    for (const translation of billTranslationsWithBillSlug) {
      if (translation.locale !== "en") {
        expect(translation.status).not.toBe("reviewed");
      }
    }
  });

  it("英語の翻訳は reviewed になっている", () => {
    const enTranslations = billTranslationsWithBillSlug.filter(
      (t) => t.locale === "en"
    );
    expect(enTranslations.length).toBeGreaterThan(0);
    for (const translation of enTranslations) {
      expect(translation.status).toBe("reviewed");
      expect(translation.reviewed_at).toBeTruthy();
      expect(translation.reviewed_by).toBeTruthy();
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

  it("翻訳がある本文には、全ロケールの翻訳がそろっている", () => {
    const groups = new Map<string, Set<string>>();
    for (const t of billTranslationsWithBillSlug) {
      const key = `${t.bill_slug}/${t.difficulty_level}`;
      groups.set(key, (groups.get(key) ?? new Set()).add(t.locale));
    }
    for (const [key, locales] of groups) {
      expect([...locales].sort(), key).toEqual([...TRANSLATION_LOCALES].sort());
    }
  });

  it.each(
    billTranslationsWithBillSlug.map((t) => [
      `${t.bill_slug} / ${t.difficulty_level} / ${t.locale}`,
      t,
    ])
  )(
    "%s: 日本語本文の金額・年などの数値が翻訳から抜けていない",
    (_label, translation) => {
      // 人の確認を受けていない言語もあるので、数値の写し間違いだけは機械的に防ぐ
      const source = findTranslationSourceSnapshot(
        translation.bill_slug,
        translation.difficulty_level
      );
      const translated = new Set(extractLargeNumbers(translation.content));
      const missing = extractLargeNumbers(source.content).filter(
        (n) => !translated.has(n)
      );
      expect(missing).toEqual([]);
    }
  );

  it.each(
    billTranslationsWithBillSlug.map((t) => [
      `${t.bill_slug} / ${t.difficulty_level} / ${t.locale}`,
      t,
    ])
  )(
    "%s: 原文差分用のスナップショットが source_hash と同じ日本語を指す",
    (_label, translation) => {
      const snapshot = findTranslationSourceSnapshot(
        translation.bill_slug,
        translation.difficulty_level
      );
      expect(
        calculateSourceHash({
          difficulty_level: translation.difficulty_level,
          ...snapshot,
        })
      ).toBe(translation.source_hash);
    }
  );
});
