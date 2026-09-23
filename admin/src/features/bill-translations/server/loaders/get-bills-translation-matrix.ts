import "server-only";

import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import type { TranslationMatrix } from "../../shared/types/translation-matrix";
import { buildTranslationMatrix } from "../../shared/utils/build-translation-matrix";
import {
  findBillContentsByDifficulty,
  findBillsForTranslationMatrix,
  findCouncilSessionIdBySlug,
  findTranslationStatusesByContentIds,
} from "../repositories/bill-translation-repository";

const TRANSLATION_MATRIX_SESSION_SLUG = "r8-2";

/**
 * 令和8年第2回定例会の全議案 × 翻訳先ロケールの翻訳状態を返す。
 * 対象は「ふつう」の日本語に対する翻訳（公開画面は選んだ難易度の翻訳がなければ
 * 「ふつう」の翻訳に落とすため、公開可否はここで決まる）。
 */
export async function getBillsTranslationMatrix(): Promise<TranslationMatrix> {
  await requireAdmin();

  const councilSessionId = await findCouncilSessionIdBySlug(
    TRANSLATION_MATRIX_SESSION_SLUG
  );
  if (!councilSessionId) {
    throw new Error(
      `Council session not found: ${TRANSLATION_MATRIX_SESSION_SLUG}`
    );
  }

  const bills = await findBillsForTranslationMatrix(councilSessionId);
  const sources = await findBillContentsByDifficulty(
    "normal",
    bills.map((bill) => bill.id)
  );
  const translations = await findTranslationStatusesByContentIds(
    sources.map((source) => source.id)
  );

  return buildTranslationMatrix({
    bills,
    sources,
    translations,
    hashSource: calculateSourceHash,
  });
}
