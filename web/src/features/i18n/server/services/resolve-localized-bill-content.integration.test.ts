import {
  SUPPORTED_LOCALES,
  type TranslationLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import {
  adminClient,
  cleanupTestBill,
  createTestBill,
  createTestBillContent,
  createTestBillContentTranslation,
} from "@test-utils/utils";
import { afterEach, describe, expect, it } from "vitest";
import { resolveLocalizedBillContent } from "./resolve-localized-bill-content";

describe("resolveLocalizedBillContent 統合テスト", () => {
  const billIds: string[] = [];

  afterEach(async () => {
    for (const id of billIds) {
      await cleanupTestBill(id);
    }
    billIds.length = 0;
  });

  async function setupBill() {
    const bill = await createTestBill({ publish_status: "published" });
    billIds.push(bill.id);
    const normal = await createTestBillContent(bill.id, {
      difficulty_level: "normal",
    });
    const hard = await createTestBillContent(bill.id, {
      difficulty_level: "hard",
    });
    return { bill, normal, hard };
  }

  function reviewed(source: Parameters<typeof calculateSourceHash>[0]) {
    return {
      status: "reviewed" as const,
      reviewed_at: new Date().toISOString(),
      source_hash: calculateSourceHash(source),
    };
  }

  it("確認済みで日本語と一致する翻訳を返す", async () => {
    const { bill, normal } = await setupBill();
    await createTestBillContentTranslation(normal.id, {
      ...reviewed(normal),
      title: "Reviewed title",
    });

    const result = await resolveLocalizedBillContent(bill.id, "en", "normal");

    expect(result.kind).toBe("translated");
    if (result.kind !== "translated") return;
    expect(result.source.id).toBe(normal.id);
    expect(result.translation.title).toBe("Reviewed title");
  });

  const translationLocales = SUPPORTED_LOCALES.filter(
    (locale): locale is TranslationLocale => locale !== "ja"
  );

  it.each(
    translationLocales
  )("%s: 確認済みの翻訳だけを返し、未確認の翻訳は日本語に落とす", async (locale) => {
    const { bill, normal, hard } = await setupBill();
    await createTestBillContentTranslation(normal.id, {
      ...reviewed(normal),
      locale,
      title: `Reviewed ${locale}`,
    });
    await createTestBillContentTranslation(hard.id, {
      locale,
      source_hash: calculateSourceHash(hard),
      status: "generated",
    });

    const reviewedResult = await resolveLocalizedBillContent(
      bill.id,
      locale,
      "normal"
    );
    expect(reviewedResult.kind).toBe("translated");
    if (reviewedResult.kind !== "translated") return;
    expect(reviewedResult.translation.title).toBe(`Reviewed ${locale}`);

    // 「くわしく」の翻訳は generated なので使わず、確認済みの「ふつう」に落とす
    const fallbackResult = await resolveLocalizedBillContent(
      bill.id,
      locale,
      "hard"
    );
    expect(fallbackResult.kind).toBe("translated");
    if (fallbackResult.kind !== "translated") return;
    expect(fallbackResult.source.id).toBe(normal.id);
  });

  it("「くわしく」を選んでいて翻訳が「ふつう」にしか無ければ「ふつう」の翻訳", async () => {
    const { bill, normal } = await setupBill();
    await createTestBillContentTranslation(normal.id, reviewed(normal));

    const result = await resolveLocalizedBillContent(bill.id, "en", "hard");

    expect(result.kind).toBe("translated");
    if (result.kind !== "translated") return;
    expect(result.source.difficulty_level).toBe("normal");
  });

  it("generated の翻訳は出さず日本語「ふつう」に落とす", async () => {
    const { bill, normal } = await setupBill();
    await createTestBillContentTranslation(normal.id, {
      source_hash: calculateSourceHash(normal),
      status: "generated",
    });

    const result = await resolveLocalizedBillContent(bill.id, "en", "hard");

    expect(result.kind).toBe("unavailable");
    if (result.kind !== "unavailable") return;
    expect(result.fallback?.id).toBe(normal.id);
  });

  it("翻訳後に日本語が直されたら、reviewed のままでも出さない", async () => {
    const { bill, normal } = await setupBill();
    await createTestBillContentTranslation(normal.id, reviewed(normal));

    await adminClient
      .from("bill_contents")
      .update({ summary: "改定後の要約" })
      .eq("id", normal.id);

    const result = await resolveLocalizedBillContent(bill.id, "en", "normal");

    expect(result.kind).toBe("unavailable");
    if (result.kind !== "unavailable") return;
    expect(result.fallback?.summary).toBe("改定後の要約");
  });

  it("別のロケールの翻訳は使わない", async () => {
    const { bill, normal } = await setupBill();
    await createTestBillContentTranslation(normal.id, {
      ...reviewed(normal),
      locale: "ko",
    });

    const result = await resolveLocalizedBillContent(bill.id, "en", "normal");

    expect(result.kind).toBe("unavailable");
  });

  it("別の議案の翻訳は使わない", async () => {
    const { bill } = await setupBill();
    const other = await setupBill();
    await createTestBillContentTranslation(
      other.normal.id,
      reviewed(other.normal)
    );

    const result = await resolveLocalizedBillContent(bill.id, "en", "normal");

    expect(result.kind).toBe("unavailable");
  });
});
