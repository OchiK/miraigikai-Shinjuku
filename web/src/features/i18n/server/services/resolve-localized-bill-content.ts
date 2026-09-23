import "server-only";
import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import {
  type LocalizedContentResult,
  resolveLocalizedContent,
} from "@mirai-gikai/shared/i18n/translation-fallback";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { BillContent } from "@/features/bills/shared/types";
import { findAllBillContentsByBillId } from "@/features/bills/server/repositories/bill-repository";
import { findReviewedTranslationsByContentIds } from "../repositories/translation-repository";

/**
 * 議案1件分の表示コンテンツを、指定ロケールの公開可能な翻訳から選ぶ。
 * 翻訳が無い・古い・未確認のときは日本語「ふつう」を返す。
 */
export async function resolveLocalizedBillContent(
  billId: string,
  locale: TranslationLocale,
  requestedDifficulty: DifficultyLevelEnum
): Promise<LocalizedContentResult<BillContent>> {
  const sources = await findAllBillContentsByBillId(billId);
  const translations = await findReviewedTranslationsByContentIds(
    sources.map((s) => s.id),
    locale
  );

  return resolveLocalizedContent({
    locale,
    requestedDifficulty,
    sources,
    translations,
  });
}
