import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import type { TranslationReviewStatus } from "./bill-translation";

/** 翻訳状況の一覧の1行（議案1件）。状態は「ふつう」の日本語に対する翻訳のもの */
export type TranslationMatrixRow = {
  billId: string;
  billNumber: string;
  billName: string;
  sessionName: string | null;
  /** 「ふつう」の日本語コンテンツがあるか。なければ翻訳もできない */
  hasSource: boolean;
  statuses: Record<TranslationLocale, TranslationReviewStatus>;
};

/** ロケールごとの件数。日本語の「ふつう」がない議案は数えない */
export type TranslationMatrixSummary = Record<
  TranslationLocale,
  Record<TranslationReviewStatus, number>
>;

export type TranslationMatrix = {
  rows: TranslationMatrixRow[];
  summary: TranslationMatrixSummary;
};
