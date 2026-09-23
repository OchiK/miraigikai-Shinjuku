import "server-only";

import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import {
  findBillContentByDifficulty,
  findPublishedBillById,
} from "@/features/bills/server/repositories/bill-repository";
import type { BillWithContent } from "@/features/bills/shared/types";

/**
 * チャットのプロンプトに使う公開済み議案をDBから取得する。
 * 未公開・存在しない議案は null を返す。
 *
 * getBillById は cookie と unstable_cache に依存するため使わず、
 * リクエストの難易度で本文を直接引く。
 */
export async function loadPublishedBillForChat(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
): Promise<BillWithContent | null> {
  if (typeof billId !== "string" || billId.length === 0) {
    return null;
  }

  // 未公開・不正なIDで本文クエリを走らせないよう、公開確認を先に行う
  const bill = await findPublishedBillById(billId);
  if (!bill) {
    return null;
  }

  const billContent = await findBillContentByDifficulty(
    billId,
    difficultyLevel
  );

  const { council_sessions, ...billColumns } = bill;

  return {
    ...billColumns,
    council_session: council_sessions ?? null,
    bill_content: billContent ?? undefined,
    tags: [],
  };
}
