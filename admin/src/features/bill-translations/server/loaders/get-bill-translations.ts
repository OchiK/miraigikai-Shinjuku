import "server-only";

import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import type { BillTranslationGroup } from "../../shared/types/bill-translation";
import { buildBillTranslationGroups } from "../../shared/utils/build-bill-translation-groups";
import {
  findBillContentsByBillId,
  findTranslationsByContentIds,
} from "../repositories/bill-translation-repository";

/**
 * 議案の日本語コンテンツ（難易度別）と、ロケールごとの翻訳をまとめて返す。
 * 翻訳の isStale は、現在の日本語から計算した source_hash との照合結果。
 */
export async function getBillTranslations(
  billId: string
): Promise<BillTranslationGroup[]> {
  await requireAdmin();

  const contents = await findBillContentsByBillId(billId);
  const translations = await findTranslationsByContentIds(
    contents.map((content) => content.id)
  );

  return buildBillTranslationGroups({
    contents,
    translations,
    hashSource: calculateSourceHash,
  });
}
