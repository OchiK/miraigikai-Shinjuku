import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Languages } from "lucide-react";
import { getUiMessages } from "../../shared/ui-messages";

interface BillsInJapaneseNoticeProps {
  locale: PublicLocale;
  /** 案内文。省略時は議案一覧向けの文言。null なら出さない */
  message?: string | null;
}

/**
 * 一覧の議案名・要約・タグは翻訳しないため、日本語以外の表示ではその旨を出す
 * （docs/BACKLOG.md P8-12「フォールバック（日本語表示＋注記）」）。
 * 日本語表示では何も出さない。
 */
export function BillsInJapaneseNotice({
  locale,
  message,
}: BillsInJapaneseNoticeProps) {
  const notice =
    message === undefined
      ? getUiMessages(locale).home.billsInJapaneseNotice
      : message;
  if (!notice) {
    return null;
  }

  return (
    <p
      lang={locale}
      className="flex items-start gap-3 rounded-xl bg-terracotta-200 px-5 py-4 text-sm leading-[1.9] text-mirai-ai-text"
    >
      <Languages
        aria-hidden="true"
        className="mt-1 size-5 shrink-0"
        strokeWidth={2.75}
      />
      <span>{notice}</span>
    </p>
  );
}
