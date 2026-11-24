import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import { productionDataset } from "../production/importer";
import { billContentsWithBillSlug } from "./bill-contents-data";
import {
  billTranslationsWithBillSlug,
  createBillContentTranslations,
  findTranslationSourceSnapshot,
  r8_2BillTranslationsWithBillSlug,
} from "./bill-translations-data";
import { r8_3BillTranslationsWithBillSlug } from "./bill-translations-r8-3-data";
import { gianKey, shoninKey } from "./shinjuku-r8-2-inventory";
import { r8_3GianKey, r8_3NinteiKey } from "./shinjuku-r8-3-inventory";
import { checkTranslation } from "./translation-checks";

const FROZEN_R8_2_SLUGS = [shoninKey(2), gianKey(42)];
const EXPECTED_R8_3_SLUGS = [
  ...Array.from({ length: 18 }, (_, index) => r8_3GianKey(index + 63)),
  ...Array.from({ length: 4 }, (_, index) => r8_3NinteiKey(index + 1)),
];
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

  it("reviewed は凍結した R8-2 試作2件の英語だけに許す", () => {
    const reviewed = billTranslationsWithBillSlug.filter(
      (t) => t.status === "reviewed"
    );
    expect(reviewed.map((t) => `${t.bill_slug}/${t.locale}`).sort()).toEqual(
      FROZEN_R8_2_SLUGS.map((slug) => `${slug}/en`).sort()
    );
  });

  it("R8-3 は区長提出22件の normal / en / generated と完全一致する", () => {
    expect(r8_3BillTranslationsWithBillSlug).toHaveLength(22);
    expect(
      r8_3BillTranslationsWithBillSlug.map((t) => t.bill_slug).sort()
    ).toEqual([...EXPECTED_R8_3_SLUGS].sort());
    for (const t of r8_3BillTranslationsWithBillSlug) {
      expect(t.difficulty_level).toBe("normal");
      expect(t.locale).toBe("en");
      expect(t.status).toBe("generated");
      expect(t).not.toHaveProperty("reviewed_at");
      expect(t).not.toHaveProperty("reviewed_by");
      expect(t.model.trim()).not.toBe("");
      expect(t.prompt_version).toBe("r8-3-en-2026-11-24");
    }
  });

  it("productionDataset は R8-3 の22行だけを同期し、R8-2 は含めない", () => {
    expect(productionDataset.billContentTranslations).toHaveLength(22);
    expect(productionDataset.billContentTranslations).toEqual(
      r8_3BillTranslationsWithBillSlug
    );
    expect(
      productionDataset.billContentTranslations.map((t) => t.bill_slug).sort()
    ).toEqual([...EXPECTED_R8_3_SLUGS].sort());
    expect(
      productionDataset.billContentTranslations.every(
        (t) =>
          !FROZEN_R8_2_SLUGS.includes(t.bill_slug) && t.status === "generated"
      )
    ).toBe(true);
  });

  it("R8-2 の試作12行は6ロケールのまま維持する", () => {
    expect(r8_2BillTranslationsWithBillSlug).toHaveLength(12);
    expect(
      new Set(r8_2BillTranslationsWithBillSlug.map((t) => t.bill_slug))
    ).toEqual(new Set(FROZEN_R8_2_SLUGS));
  });

  it.each(
    r8_3BillTranslationsWithBillSlug.map((t) => [t.bill_slug, t] as const)
  )("%s: R8-3 の数値・構造・用語と Admin 上限を検査する", (_slug, t) => {
    const source = findTranslationSourceSnapshot(
      t.bill_slug,
      t.difficulty_level
    );
    expect(checkTranslation(source, t)).toEqual([]);
    for (const [field, limit] of [
      ["title", 500],
      ["summary", 2000],
      ["content", 100000],
    ] as const) {
      expect(t[field]).toBe(t[field].trim());
      expect(t[field].length).toBeGreaterThan(0);
      expect(t[field].length).toBeLessThanOrEqual(limit);
    }
  });

  it("ローカルシードは R8-3 だけに imported_snapshot を設定する", () => {
    const slugs = [
      ...new Set(billTranslationsWithBillSlug.map((t) => t.bill_slug)),
    ];
    const bills = slugs.map((slug) => ({ id: slug, slug, name: slug }));
    const contents = billTranslationsWithBillSlug.map((t) => ({
      id: `${t.bill_slug}/${t.difficulty_level}`,
      bill_id: t.bill_slug,
      difficulty_level: t.difficulty_level,
    }));
    const rows = createBillContentTranslations(bills, contents);
    expect(rows).toHaveLength(billTranslationsWithBillSlug.length);
    rows.forEach((row, index) => {
      const seed = billTranslationsWithBillSlug[index];
      expect(row.source_snapshot).toEqual(
        findTranslationSourceSnapshot(seed.bill_slug, seed.difficulty_level)
      );
      if (r8_3BillTranslationsWithBillSlug.includes(seed)) {
        expect(row.imported_snapshot).toEqual({
          title: seed.title,
          summary: seed.summary,
          content: seed.content,
        });
      } else {
        expect(row).not.toHaveProperty("imported_snapshot");
      }
    });
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

  it("翻訳がある本文には英語があり、凍結した R8-2 以外は英語のみ", () => {
    const groups = new Map<string, Set<string>>();
    for (const t of billTranslationsWithBillSlug) {
      const key = `${t.bill_slug}/${t.difficulty_level}`;
      groups.set(key, (groups.get(key) ?? new Set()).add(t.locale));
    }
    for (const [key, locales] of groups) {
      expect(locales.has("en"), key).toBe(true);
      const frozen = FROZEN_R8_2_SLUGS.some((slug) => key === `${slug}/normal`);
      expect([...locales].sort(), key).toEqual(
        frozen ? [...TRANSLATION_LOCALES].sort() : ["en"]
      );
    }
  });

  it.each(
    r8_2BillTranslationsWithBillSlug.map((t) => [
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
