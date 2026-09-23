import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import type { TranslationSource } from "@mirai-gikai/shared/i18n/source-hash";
import {
  TRANSLATION_LOCALES,
  type TranslationReviewStatus,
} from "../types/bill-translation";
import type {
  TranslationMatrix,
  TranslationMatrixRow,
  TranslationMatrixSummary,
} from "../types/translation-matrix";
import {
  getTranslationReviewStatus,
  isStoredTranslationStale,
} from "./translation-review";

type BillRow = {
  id: string;
  name: string;
  bill_number: string;
  bill_number_order: number | null;
  council_sessions: { name: string; start_date: string } | null;
};

type SourceRow = TranslationSource & { id: string; bill_id: string };

type TranslationStatusRow = {
  bill_content_id: string;
  locale: string;
  status: string;
  source_hash: string;
};

const EMPTY_COUNTS: Record<TranslationReviewStatus, number> = {
  reviewed: 0,
  generated: 0,
  stale: 0,
  missing: 0,
};

/**
 * 新しい会期が上。同じ会期の中は議案番号順（bill_number_order、なければ番号の文字列）。
 * 会期のない議案は最後に回す。
 */
function compareBills(a: BillRow, b: BillRow): number {
  const aStart = a.council_sessions?.start_date ?? "";
  const bStart = b.council_sessions?.start_date ?? "";
  if (aStart !== bStart) return bStart.localeCompare(aStart);

  const aOrder = a.bill_number_order ?? Number.POSITIVE_INFINITY;
  const bOrder = b.bill_number_order ?? Number.POSITIVE_INFINITY;
  if (aOrder !== bOrder) return aOrder - bOrder;

  return a.bill_number.localeCompare(b.bill_number, "ja");
}

/**
 * 議案 × ロケールの翻訳状態をまとめる。
 * 対象は「ふつう」の日本語に対する翻訳（公開画面が最後に頼る難易度）。
 * 状態は議案ごとの翻訳画面と同じ規則で決める（source_hash が現在の日本語と
 * 違えば、DB の status が reviewed でも stale）。
 * hashSource には calculateSourceHash を渡す（node:crypto を使うのでサーバー側で呼ぶ）。
 */
export function buildTranslationMatrix(params: {
  bills: BillRow[];
  sources: SourceRow[];
  translations: TranslationStatusRow[];
  hashSource: (source: TranslationSource) => string;
}): TranslationMatrix {
  const { bills, sources, translations, hashSource } = params;

  const summary = Object.fromEntries(
    TRANSLATION_LOCALES.map((locale) => [locale, { ...EMPTY_COUNTS }])
  ) as TranslationMatrixSummary;

  const rows = [...bills].sort(compareBills).map((bill) => {
    const source = sources.find((s) => s.bill_id === bill.id);
    const sourceHash = source ? hashSource(source) : null;

    const statuses = Object.fromEntries(
      TRANSLATION_LOCALES.map((locale) => {
        const translation =
          source &&
          translations.find(
            (t) => t.bill_content_id === source.id && t.locale === locale
          );
        const status = getTranslationReviewStatus(
          translation && sourceHash
            ? {
                status: translation.status,
                isStale: isStoredTranslationStale(translation, sourceHash),
              }
            : undefined
        );
        // 日本語の「ふつう」がない議案は翻訳できないので、件数に入れない
        if (source) summary[locale][status] += 1;
        return [locale, status];
      })
    ) as Record<TranslationLocale, TranslationReviewStatus>;

    const row: TranslationMatrixRow = {
      billId: bill.id,
      billNumber: bill.bill_number,
      billName: bill.name,
      sessionName: bill.council_sessions?.name ?? null,
      hasSource: source !== undefined,
      statuses,
    };
    return row;
  });

  return { rows, summary };
}
