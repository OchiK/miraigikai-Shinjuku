import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { cn } from "@/lib/utils";
import { formatDateJST } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { ReviewCompleteBadge } from "../bill-detail/review-status-banner";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";

interface BillCardProps {
  bill: BillWithContent;
  /** 表示言語。議案名・要約・タグは DB のまま出す */
  locale?: PublicLocale;
  /** "lead" は「注目の議案」の主役カード。見出しと要約を大きく取る */
  variant?: "default" | "lead";
  /** グリッドの1行を占めるカード。md 以上ではサムネイルを本文の横に置く */
  wide?: boolean;
  className?: string;
}

export function BillCard({
  bill,
  locale = "ja",
  variant = "default",
  wide = false,
  className,
}: BillCardProps) {
  const isLead = variant === "lead";
  const isHorizontal = wide && bill.thumbnail_url != null;
  const { card } = getUiMessages(locale);
  const showInterview =
    siteConfig.features.aiInterview && bill.hasPublicInterview;
  const displayTitle = bill.bill_content?.title;
  const summary = bill.bill_content?.summary;

  return (
    <Card
      className={cn(
        "border-0 bg-card shadow-(--shadow-mirai-sm) rounded-xl hover:bg-neutral-300 transition-colors relative overflow-hidden max-w-[634px]",
        className
      )}
    >
      <div
        className={cn("flex flex-col h-full", isHorizontal && "md:flex-row")}
      >
        {/* 注目バッジエリア */}
        {bill.is_featured && (
          <div
            className={`${bill.thumbnail_url != null ? "absolute" : "relative"} top-3 left-3 z-1`}
          >
            <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium bg-mirai-featured text-mirai-featured-text rounded-full">
              <span lang={locale}>{card.featured}</span>
            </span>
          </div>
        )}

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div
            className={cn(
              "relative w-full aspect-video",
              isHorizontal && "md:w-1/2 md:shrink-0"
            )}
          >
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover washed"
              sizes="100vw"
            />
          </div>
        )}

        {/* コンテンツエリア */}
        <div className="flex-1">
          <CardHeader className={cn(isLead && "md:p-8")}>
            <div className="flex flex-col gap-3">
              <CardTitle
                className={cn(
                  "font-heading font-bold text-xl leading-[1.5] tracking-normal text-mirai-text",
                  isLead && "md:text-2xl"
                )}
              >
                {displayTitle}
                {bill.is_review_completed && (
                  <>
                    {" "}
                    <ReviewCompleteBadge locale={locale} />
                  </>
                )}
              </CardTitle>
              <div className="flex flex-row gap-4">
                <BillStatusBadge
                  status={bill.status}
                  statusNote={bill.status_note}
                  locale={locale}
                  className="w-fit"
                />
                {/* published_at はサイト掲載日時であり、議案の提出日ではない */}
                <div className="flex items-center gap-2 text-xs font-medium text-mirai-text-muted">
                  {bill.published_at && (
                    <time lang={locale}>
                      {card.published(formatDateJST(bill.published_at))}
                    </time>
                  )}
                </div>
              </div>
              <RubySafeLineClamp
                text={summary}
                maxLength={132}
                lineClamp={4}
                className="text-base leading-[1.9] text-mirai-text"
              />
              {/* タグ表示 */}
              {(bill.tags.length > 0 || showInterview) && (
                <div className="flex flex-wrap gap-3">
                  {bill.tags.map((tag) => (
                    <BillTag key={tag.id} tag={tag} />
                  ))}
                  {showInterview && (
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium bg-mirai-tag text-mirai-tag-text rounded-full">
                      <span lang={locale}>{card.interviewOpen}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}
