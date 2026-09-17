import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site.config";
import { formatDateJST } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { ReviewCompleteBadge } from "../bill-detail/review-status-banner";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";

interface BillCardProps {
  bill: BillWithContent;
}

export function BillCard({ bill }: BillCardProps) {
  const showInterview =
    siteConfig.features.aiInterview && bill.hasPublicInterview;
  const displayTitle = bill.bill_content?.title;
  const summary = bill.bill_content?.summary;

  return (
    <Card className="border-0 bg-card shadow-(--shadow-mirai-sm) rounded-xl hover:bg-neutral-300 transition-colors relative overflow-hidden max-w-[634px]">
      <div className="flex flex-col">
        {/* 注目バッジエリア */}
        {bill.is_featured && (
          <div
            className={`${bill.thumbnail_url != null ? "absolute" : "relative"} top-3 left-3 z-1`}
          >
            <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium bg-mirai-featured text-mirai-featured-text rounded-full">
              注目
            </span>
          </div>
        )}

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-full aspect-video">
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
          <CardHeader>
            <div className="flex flex-col gap-3">
              <CardTitle className="font-heading font-bold text-xl leading-[1.5] tracking-normal text-mirai-text">
                {displayTitle}
                {bill.is_review_completed && (
                  <>
                    {" "}
                    <ReviewCompleteBadge />
                  </>
                )}
              </CardTitle>
              <div className="flex flex-row gap-4">
                <BillStatusBadge
                  status={bill.status}
                  statusNote={bill.status_note}
                  className="w-fit"
                />
                {/* published_at はサイト掲載日時であり、議案の提出日ではない */}
                <div className="flex items-center gap-2 text-xs font-medium text-mirai-text-muted">
                  {bill.published_at && (
                    <time>{formatDateJST(bill.published_at)} 掲載</time>
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
                      AIインタビュー受付中
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
