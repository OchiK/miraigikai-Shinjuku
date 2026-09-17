import {
  DIFFICULTY_FALLBACK,
  DIFFICULTY_WITH_FALLBACK,
  type DifficultyLevelEnum,
} from "@/features/bill-difficulty/shared/types";

/**
 * 議案コンテンツを取得する難易度の一覧を返す。
 *
 * やさしい日本語版はこれから整備するため、easy を選んだときだけ
 * フォールバック（ふつう）も併せて取得し、表示時に1件へ絞る。
 * くわしく版は全議案に整備済みなので、フォールバックしない
 * （フォールバックすると未整備に気づけなくなる）。
 */
export function difficultyLevelsToFetch(
  difficultyLevel: DifficultyLevelEnum
): DifficultyLevelEnum[] {
  if (!DIFFICULTY_WITH_FALLBACK.includes(difficultyLevel)) {
    return [difficultyLevel];
  }
  return [difficultyLevel, DIFFICULTY_FALLBACK];
}
