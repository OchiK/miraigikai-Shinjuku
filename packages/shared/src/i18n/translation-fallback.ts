import type { TranslationLocale } from "./locales";
import { isTranslationStale, type TranslationSource } from "./source-hash";

export type SourceContent = TranslationSource & {
  id: string;
};

export type TranslationStatus = "generated" | "reviewed" | "stale";

/**
 * locale と status は DB では text（CHECK 制約で値を固定）なので string で受ける。
 * 公開判定の比較には PUBLISHABLE_STATUS を使う。
 */
export type TranslationRecord = {
  bill_content_id: string;
  locale: string;
  title: string;
  summary: string;
  content: string;
  source_hash: string;
  status: string;
};

export type LocalizedContentResult<S extends SourceContent> =
  | {
      kind: "translated";
      /** 翻訳元の日本語。difficulty_level は実際に表示する難易度 */
      source: S;
      translation: TranslationRecord;
    }
  | {
      kind: "unavailable";
      /** 代わりに出す日本語「ふつう」。無ければ null（内容なしとして扱う） */
      fallback: S | null;
    };

/**
 * 翻訳を用意する基準の難易度。MVP では「ふつう」だけを翻訳する。
 * web の DIFFICULTY_FALLBACK（bill-difficulty/shared/types）と同じく「ふつう」を基準にしている。
 */
export const TRANSLATION_BASE_DIFFICULTY = "normal";

/** 公開画面に出してよい status */
export const PUBLISHABLE_STATUS: TranslationStatus = "reviewed";

/**
 * 公開してよい翻訳か。人の確認が済み（reviewed）、かつ翻訳した時の日本語から
 * 変わっていないものだけ。generated / stale は admin のプレビュー用。
 */
export function isPublishableTranslation(
  translation: TranslationRecord,
  locale: TranslationLocale,
  source: TranslationSource
): boolean {
  return (
    translation.locale === locale &&
    translation.status === PUBLISHABLE_STATUS &&
    !isTranslationStale(translation.source_hash, source)
  );
}

/**
 * 翻訳の選び方（docs/I18N_AND_EASY_JAPANESE.md「言語fallback」）。
 *
 * 1. 選んだ難易度の日本語に対する翻訳
 * 2. 「ふつう」の日本語に対する翻訳
 * 3. 日本語「ふつう」＋翻訳がない旨の案内
 *
 * sources には同じ議案の bill_contents だけを渡すこと。別の議案の翻訳で
 * 穴埋めしないよう、translations も sources の id に紐づくものしか使わない。
 */
export function resolveLocalizedContent<S extends SourceContent>(params: {
  locale: TranslationLocale;
  requestedDifficulty: string;
  sources: S[];
  translations: TranslationRecord[];
}): LocalizedContentResult<S> {
  const { locale, requestedDifficulty, sources, translations } = params;

  const candidates = [requestedDifficulty, TRANSLATION_BASE_DIFFICULTY];
  for (const difficulty of candidates) {
    const source = sources.find((s) => s.difficulty_level === difficulty);
    if (!source) continue;

    const translation = translations.find(
      (t) =>
        t.bill_content_id === source.id &&
        isPublishableTranslation(t, locale, source)
    );
    if (translation) {
      return { kind: "translated", source, translation };
    }
  }

  const fallback =
    sources.find((s) => s.difficulty_level === TRANSLATION_BASE_DIFFICULTY) ??
    null;
  return { kind: "unavailable", fallback };
}
