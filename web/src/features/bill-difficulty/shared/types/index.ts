import type { Database } from "@mirai-gikai/supabase";

// 難易度レベルのEnum
export type DifficultyLevelEnum =
  Database["public"]["Enums"]["difficulty_level_enum"];

// 難易度のラベル
export const DIFFICULTY_LABELS: Record<DifficultyLevelEnum, string> = {
  easy: "やさしい",
  normal: "ふつう",
  hard: "くわしく",
};

// 難易度の説明
export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevelEnum, string> = {
  easy: "短い文と、やさしい言葉で書いた内容",
  normal: "中学生レベルの内容",
  hard: "専門用語を含む詳細な内容",
};

// Cookie名とデフォルト値
export const DIFFICULTY_COOKIE_NAME = "bill_difficulty_level";
export const DEFAULT_DIFFICULTY: DifficultyLevelEnum = "normal";

// 有効な難易度レベルの配列
export const VALID_DIFFICULTY_LEVELS: DifficultyLevelEnum[] = [
  "easy",
  "normal",
  "hard",
];

/**
 * コンテンツが未整備のときに代わりに表示する難易度。
 */
export const DIFFICULTY_FALLBACK: DifficultyLevelEnum = "normal";

/**
 * 未整備のときにフォールバックしてよい難易度。
 * やさしい日本語版はこれから整備するため、無い議案は「ふつう」を出して
 * 一覧から消えないようにする。「くわしく」は全議案に整備済みのため対象外。
 */
export const DIFFICULTY_WITH_FALLBACK: DifficultyLevelEnum[] = ["easy"];

// Cookie設定オプション
export const DIFFICULTY_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1年間
  path: "/",
};
