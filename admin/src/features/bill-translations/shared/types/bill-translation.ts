import {
  SUPPORTED_LOCALES,
  type TranslationLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { z } from "zod";
import type { DifficultyLevel } from "@/features/bills-edit/shared/types/bill-contents";

/** 翻訳先ロケール（ja は正本なので除く）。並び順はタブの表示順 */
export const TRANSLATION_LOCALES = SUPPORTED_LOCALES.filter(
  (locale): locale is TranslationLocale => locale !== "ja"
);

/** レビュアー向けの言語名（管理画面は日本語で表示する） */
export const TRANSLATION_LOCALE_LABELS: Record<TranslationLocale, string> = {
  en: "英語",
  "zh-Hans": "中国語（簡体字）",
  ko: "韓国語",
  ne: "ネパール語",
  my: "ミャンマー語",
  vi: "ベトナム語",
};

/**
 * 画面に出す翻訳の状態。
 * - missing: 翻訳がまだない
 * - generated: 下書き（非公開）
 * - reviewed: 確認済み（公開中）
 * - stale: 翻訳した時から日本語が変わった（非公開）
 */
export type TranslationReviewStatus =
  | "missing"
  | "generated"
  | "reviewed"
  | "stale";

/** 日本語の原文（bill_contents 1行） */
export type TranslationSourceItem = {
  id: string;
  difficultyLevel: DifficultyLevel;
  title: string;
  summary: string;
  content: string;
  /** 現在の日本語から計算した source_hash */
  sourceHash: string;
};

/** 保存済みの翻訳 1件。isStale は現在の日本語と source_hash を照合した結果 */
export type TranslationReviewItem = {
  id: string;
  locale: TranslationLocale;
  title: string;
  summary: string;
  content: string;
  status: string;
  sourceHash: string;
  isStale: boolean;
  model: string | null;
  translatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

/** 難易度 1つ分の原文と、ロケールごとの翻訳 */
export type BillTranslationGroup = {
  source: TranslationSourceItem;
  translations: Partial<Record<TranslationLocale, TranslationReviewItem>>;
};

export const translationLocaleSchema = z.enum(
  TRANSLATION_LOCALES as [TranslationLocale, ...TranslationLocale[]]
);

/** 翻訳エディタの入力。上限は日本語側（200/500/50000字）より長い言語を見込んで広めに取る */
export const billTranslationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(500, "タイトルは500文字以内で入力してください"),
  summary: z.string().trim().max(2000, "要約は2000文字以内で入力してください"),
  content: z
    .string()
    .trim()
    .min(1, "本文を入力してください")
    .max(100000, "本文は100000文字以内で入力してください"),
});

export type BillTranslationFormData = z.infer<typeof billTranslationFormSchema>;

export const saveBillTranslationSchema = billTranslationFormSchema.extend({
  billContentId: z.guid(),
  locale: translationLocaleSchema,
  intent: z.enum(["draft", "approve"]),
  /** レビュアーが画面で見ていた日本語の source_hash。保存時の日本語と違えば受け付けない */
  reviewedSourceHash: z.string().regex(/^v[0-9]+:[0-9a-f]{64}$/),
  /** 日本語が変わった翻訳を承認するときに、反映済みであることを明示する */
  confirmStale: z.boolean().default(false),
});

export type SaveBillTranslationInput = z.input<
  typeof saveBillTranslationSchema
>;

export const revokeBillTranslationSchema = z.object({
  billContentId: z.guid(),
  locale: translationLocaleSchema,
});

export type RevokeBillTranslationInput = z.infer<
  typeof revokeBillTranslationSchema
>;
