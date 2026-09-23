import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";

// Cookie設定オプション（難易度の Cookie と同じ扱い）
export const LOCALE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1年間
  path: "/",
};

/**
 * 議案詳細で実際に何を表示しているか。
 * 選んだ言語・難易度と、表示している言語・難易度がずれるときに案内を出すために使う。
 */
export type BillLocalization =
  | {
      kind: "translated";
      requestedLocale: TranslationLocale;
      /** 翻訳元の日本語の難易度 */
      sourceDifficulty: DifficultyLevelEnum;
    }
  | {
      kind: "unavailable";
      requestedLocale: TranslationLocale;
      /** 代わりに表示している日本語の難易度。内容が無ければ null */
      displayedDifficulty: DifficultyLevelEnum | null;
    };
