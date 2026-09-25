import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillRelatedQuestion } from "../../shared/types";
import { toBillRelatedQuestions } from "../../shared/utils/to-councilor";
import { findQuestionsByBillId } from "../repositories/councilor-repository";

/**
 * 議案に紐づく議員の質問（質問した議員つき、新しい順）
 *
 * 議案詳細の一部分にすぎないため、取得に失敗しても議案ページ全体は落とさず空にする。
 * 失敗はキャッシュの外で握りつぶし、空配列をキャッシュしないようにする。
 */
export async function getQuestionsByBillId(
  billId: string
): Promise<BillRelatedQuestion[]> {
  try {
    return await _getCachedQuestionsByBillId(billId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const _getCachedQuestionsByBillId = unstable_cache(
  async (billId: string): Promise<BillRelatedQuestion[]> =>
    toBillRelatedQuestions(await findQuestionsByBillId(billId)),
  ["questions-by-bill-id"],
  {
    revalidate: 3600, // 1時間
    // 議案の公開状態が変わったときにも作り直す
    tags: [CACHE_TAGS.COUNCILORS, CACHE_TAGS.BILLS],
  }
);
