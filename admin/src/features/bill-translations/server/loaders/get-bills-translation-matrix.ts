import "server-only";

import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import type { TranslationMatrix } from "../../shared/types/translation-matrix";
import { buildTranslationMatrix } from "../../shared/utils/build-translation-matrix";
import {
  findBillContentsByDifficulty,
  findBillsForTranslationMatrix,
  findTranslationStatusesByContentIds,
} from "../repositories/bill-translation-repository";

/**
 * 全議案 × 翻訳先ロケールの翻訳状態を返す。
 * 対象は「ふつう」の日本語に対する翻訳（公開画面は選んだ難易度の翻訳がなければ
 * 「ふつう」の翻訳に落とすため、公開可否はここで決まる）。
 */
export async function getBillsTranslationMatrix(): Promise<TranslationMatrix> {
  await requireAdmin();

  const [bills, sources] = await Promise.all([
    findBillsForTranslationMatrix(),
    findBillContentsByDifficulty("normal"),
  ]);
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
