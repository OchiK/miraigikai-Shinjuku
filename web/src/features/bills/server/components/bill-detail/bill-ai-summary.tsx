import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Info } from "lucide-react";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

interface BillAiSummaryProps {
  /** AIが付けた読みやすい題名。正式名称は表題として別に出す */
  title?: string | null;
  summary?: string | null;
  isReviewCompleted: boolean;
  /** 題名と要約の言語。翻訳を表示しているときだけ渡す */
  lang?: string;
  /** UI 文言の言語 */
  locale?: PublicLocale;
}

function ReviewInProgressNotice({
  locale,
  className = "",
}: {
  locale: PublicLocale;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl bg-terracotta-200 px-4 py-3 text-mirai-ai-text ${className}`}
      role="status"
    >
      <Info
        aria-hidden="true"
        className="mt-1 size-4 shrink-0"
        strokeWidth={2.75}
      />
      <p lang={locale} className="text-sm leading-[1.9]">
        {getUiMessages(locale).billDetail.reviewInProgress}
      </p>
    </div>
  );
}

/**
 * かんたん要約（デザインシステム定義 §9-5）。
 *
 * AIが書いた文章は一次資料と同じ地色に置かない。地色を `--color-mirai-ai-bg` にし、
 * `AI` ラベルと注意書きを必ず併記して、原文と見分けられるようにする。
 * 読みやすい題名もAI生成のため、正式名称の表題とは分けてこの地色の上に置く。
 */
export function BillAiSummary({
  title,
  summary,
  isReviewCompleted,
  lang,
  locale = "ja",
}: BillAiSummaryProps) {
  const { billDetail } = getUiMessages(locale);
  const readableTitle = title?.trim();
  const text = summary?.trim();

  if (!readableTitle && !text) {
    return isReviewCompleted ? null : (
      <ReviewInProgressNotice locale={locale} />
    );
  }

  return (
    <section
      aria-labelledby="bill-ai-summary-heading"
      className="rounded-xl bg-mirai-ai-bg p-6 text-mirai-ai-text shadow-mirai-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-mirai-accent-text px-3 py-1 font-display text-mirai-ground text-xs">
          AI
        </span>
        <h2
          className="font-bold font-heading text-lg"
          id="bill-ai-summary-heading"
          lang={locale}
        >
          {billDetail.summaryHeading}
        </h2>
      </div>

      {readableTitle && (
        <p
          className="mb-3 font-bold font-heading text-xl leading-[1.9]"
          lang={lang}
        >
          {readableTitle}
        </p>
      )}

      {text && (
        <p className="whitespace-pre-wrap text-base leading-[1.9]" lang={lang}>
          {text}
        </p>
      )}

      <p className="mt-4 text-sm leading-[1.9]" lang={locale}>
        {billDetail.summaryNote}
      </p>

      {!isReviewCompleted && (
        <ReviewInProgressNotice locale={locale} className="mt-4" />
      )}
    </section>
  );
}
