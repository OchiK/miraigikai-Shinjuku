import {
  isSupportedLocale,
  type TranslationLocale,
} from "@mirai-gikai/shared/i18n/locales";
import type { TranslationSource } from "@mirai-gikai/shared/i18n/source-hash";
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
} from "@/features/bills-edit/shared/types/bill-contents";
import type { BillTranslationGroup } from "../types/bill-translation";
import { isStoredTranslationStale } from "./translation-review";

const DIFFICULTY_ORDER = DIFFICULTY_LEVELS.map((level) => level.value);

function isDifficultyLevel(value: string): value is DifficultyLevel {
  return (DIFFICULTY_ORDER as string[]).includes(value);
}

type SourceRow = TranslationSource & { id: string };

type TranslationRow = {
  id: string;
  bill_content_id: string;
  locale: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  source_hash: string;
  model: string | null;
  translated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

/**
 * 日本語コンテンツ（難易度別）と翻訳の行を、画面用に難易度順のグループへまとめる。
 * 未知の難易度と、翻訳先ではないロケール（ja・未対応）は捨てる。
 * hashSource には calculateSourceHash を渡す（node:crypto を使うのでサーバー側で呼ぶ）。
 */
export function buildBillTranslationGroups(params: {
  contents: SourceRow[];
  translations: TranslationRow[];
  hashSource: (source: TranslationSource) => string;
}): BillTranslationGroup[] {
  const { contents, translations, hashSource } = params;

  return contents
    .flatMap((content) => {
      const difficultyLevel = content.difficulty_level;
      return isDifficultyLevel(difficultyLevel)
        ? [{ ...content, difficultyLevel }]
        : [];
    })
    .sort(
      (a, b) =>
        DIFFICULTY_ORDER.indexOf(a.difficultyLevel) -
        DIFFICULTY_ORDER.indexOf(b.difficultyLevel)
    )
    .map((content) => {
      const sourceHash = hashSource(content);
      const group: BillTranslationGroup = {
        source: {
          id: content.id,
          difficultyLevel: content.difficultyLevel,
          title: content.title,
          summary: content.summary,
          content: content.content,
          sourceHash,
        },
        translations: {},
      };

      for (const translation of translations) {
        if (translation.bill_content_id !== content.id) continue;
        if (
          !isSupportedLocale(translation.locale) ||
          translation.locale === "ja"
        ) {
          continue;
        }
        const locale: TranslationLocale = translation.locale;
        group.translations[locale] = {
          id: translation.id,
          locale,
          title: translation.title,
          summary: translation.summary,
          content: translation.content,
          status: translation.status,
          sourceHash: translation.source_hash,
          isStale: isStoredTranslationStale(translation, sourceHash),
          model: translation.model,
          translatedAt: translation.translated_at,
          reviewedAt: translation.reviewed_at,
          reviewedBy: translation.reviewed_by,
        };
      }

      return group;
    });
}
