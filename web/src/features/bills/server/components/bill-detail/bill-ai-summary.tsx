import "server-only";

import { Info } from "lucide-react";

interface BillAiSummaryProps {
  /** AIが付けた読みやすい題名。正式名称は表題として別に出す */
  title?: string | null;
  summary?: string | null;
  isReviewCompleted: boolean;
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
}: BillAiSummaryProps) {
  const readableTitle = title?.trim();
  const text = summary?.trim();

  if (!readableTitle && !text) {
    return null;
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
        >
          かんたん要約
        </h2>
      </div>

      {readableTitle && (
        <p className="mb-3 font-bold font-heading text-xl leading-[1.9]">
          {readableTitle}
        </p>
      )}

      {text && (
        <p className="whitespace-pre-wrap text-base leading-[1.9]">{text}</p>
      )}

      <p className="mt-4 text-sm leading-[1.9]">
        AIによる要約です。正確な内容は原文をご確認ください。
      </p>

      {!isReviewCompleted && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-terracotta-200 px-4 py-3">
          <Info
            aria-hidden="true"
            className="mt-1 size-4 shrink-0"
            strokeWidth={2.75}
          />
          <p className="text-sm leading-[1.9]">
            この記事はAI生成による下書きを含みます。公式一次資料との照合を進めているため、内容が変更されることがあります。
          </p>
        </div>
      )}
    </section>
  );
}
