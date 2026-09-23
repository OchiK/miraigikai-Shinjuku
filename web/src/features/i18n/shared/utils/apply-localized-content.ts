import type { LocalizedContentResult } from "@mirai-gikai/shared/i18n/translation-fallback";
import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import type { BillContent } from "@/features/bills/shared/types";
import type { BillLocalization } from "../types";

/**
 * 翻訳の選択結果を議案の bill_content に反映する純粋関数。
 * 翻訳があれば題名・要約・本文だけを差し替え、無ければ日本語「ふつう」に差し替える。
 * 日本語「ふつう」も無い議案では、取得済みの日本語（選んだ難易度）をそのまま残す。
 * 日本語なら読める内容を、言語を切り替えたせいで消さないため。
 */
export function applyLocalizedContent<T extends { bill_content?: BillContent }>(
  bill: T,
  locale: TranslationLocale,
  result: LocalizedContentResult<BillContent>
): { bill: T; localization: BillLocalization } {
  if (result.kind === "translated") {
    const { source, translation } = result;
    return {
      bill: {
        ...bill,
        bill_content: {
          ...source,
          title: translation.title,
          summary: translation.summary,
          content: translation.content,
        },
      },
      localization: {
        kind: "translated",
        requestedLocale: locale,
        sourceDifficulty: source.difficulty_level,
      },
    };
  }

  const japanese = result.fallback ?? bill.bill_content;
  return {
    bill: { ...bill, bill_content: japanese },
    localization: {
      kind: "unavailable",
      requestedLocale: locale,
      displayedDifficulty: japanese?.difficulty_level ?? null,
    },
  };
}

/**
 * 翻訳の取得に失敗したとき用。取得済みの日本語をそのまま出し、
 * 翻訳が無いときと同じ案内を付ける（ページごと落とさない）。
 */
export function keepJapaneseContent<T extends { bill_content?: BillContent }>(
  bill: T,
  locale: TranslationLocale
): { bill: T; localization: BillLocalization } {
  return {
    bill,
    localization: {
      kind: "unavailable",
      requestedLocale: locale,
      displayedDifficulty: bill.bill_content?.difficulty_level ?? null,
    },
  };
}
