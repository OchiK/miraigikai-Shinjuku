import "server-only";

import { Languages } from "lucide-react";
import { DIFFICULTY_LABELS } from "@/features/bill-difficulty/shared/types";
import {
  JA_TRANSLATED_NOTICE,
  jaUnavailableNotice,
  LOCALE_JA_NAMES,
  TRANSLATION_MESSAGES,
} from "../../shared/messages";
import type { BillLocalization } from "../../shared/types";

interface TranslationNoticeProps {
  localization: BillLocalization;
}

/**
 * 表示言語の案内（docs/I18N_AND_EASY_JAPANESE.md「翻訳原則」「言語fallback」）。
 *
 * 翻訳を出すときは「日本語の公式資料が正」という注意書きを、翻訳が無いときは
 * 日本語で表示している旨を、選んだ言語と日本語の両方で出す。
 * 実際に表示している言語と難易度も書く。
 */
export function TranslationNotice({ localization }: TranslationNoticeProps) {
  const locale = localization.requestedLocale;
  const messages = TRANSLATION_MESSAGES[locale];
  const languageName = LOCALE_JA_NAMES[locale];

  const isTranslated = localization.kind === "translated";
  const localMessage = isTranslated
    ? messages.translatedNotice
    : messages.unavailableNotice;
  const jaMessage = isTranslated
    ? JA_TRANSLATED_NOTICE
    : jaUnavailableNotice(languageName);

  const displayed = isTranslated
    ? `表示中: ${languageName}（日本語「${DIFFICULTY_LABELS[localization.sourceDifficulty]}」からの翻訳）`
    : localization.displayedDifficulty
      ? `表示中: 日本語「${DIFFICULTY_LABELS[localization.displayedDifficulty]}」`
      : null;

  return (
    <aside
      aria-label="表示言語について"
      className="flex items-start gap-3 rounded-xl bg-terracotta-200 px-5 py-4 text-mirai-ai-text"
    >
      <Languages
        aria-hidden="true"
        className="mt-1 size-5 shrink-0"
        strokeWidth={2.75}
      />
      <div className="flex flex-col gap-2 text-sm leading-[1.9]">
        <p lang={locale}>{localMessage}</p>
        <p>{jaMessage}</p>
        {displayed && <p className="font-bold">{displayed}</p>}
      </div>
    </aside>
  );
}
