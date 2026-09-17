import {
  DIFFICULTY_FALLBACK,
  type DifficultyLevelEnum,
} from "@/features/bill-difficulty/shared/types";

type ContentWithDifficulty = {
  difficulty_level: DifficultyLevelEnum;
};

/**
 * 難易度ごとの議案コンテンツから、表示する1件を選ぶ。
 *
 * 希望する難易度の版が無い議案（やさしい日本語版が未整備など）は、
 * 議案そのものを消さずに DIFFICULTY_FALLBACK の版を表示する。
 */
export function pickBillContent<T extends ContentWithDifficulty>(
  contents: T[] | null | undefined,
  difficultyLevel: DifficultyLevelEnum
): T | null {
  if (contents == null || contents.length === 0) {
    return null;
  }

  const requested = contents.find(
    (content) => content.difficulty_level === difficultyLevel
  );
  if (requested != null) {
    return requested;
  }

  const fallback = contents.find(
    (content) => content.difficulty_level === DIFFICULTY_FALLBACK
  );
  return fallback ?? null;
}

/**
 * 議案一覧の各行について、表示するコンテンツを1件に絞り込む。
 * 希望難易度もフォールバックも無い議案は一覧から除外する。
 */
export function pickBillContentsForBills<
  C extends ContentWithDifficulty,
  B extends { bill_contents: C[] },
>(bills: B[], difficultyLevel: DifficultyLevelEnum): B[] {
  return bills.flatMap((bill) => {
    const content = pickBillContent(bill.bill_contents, difficultyLevel);
    if (content == null) {
      return [];
    }
    return [{ ...bill, bill_contents: [content] }];
  });
}
