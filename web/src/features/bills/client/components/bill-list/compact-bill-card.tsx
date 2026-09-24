import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { formatDateJST } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { ReviewCompleteBadge } from "../bill-detail/review-status-banner";
import { BillStatusBadge } from "./bill-status-badge";

interface CompactBillCardProps {
  bill: BillWithContent;
  className?: string;
  /** 表示言語。議案名は DB のまま出す */
  locale?: PublicLocale;
}

/**
 * コンパクトな水平レイアウトの議案カード
 * 過去定例会セクションや過去定例会議案一覧ページで使用
 */
export function CompactBillCard({
  bill,
  className,
  locale = "ja",
}: CompactBillCardProps) {
  const displayTitle = bill.bill_content?.title || bill.name;
  const { card } = getUiMessages(locale);

  return (
    <Card
      className={`border-0 bg-card shadow-(--shadow-mirai-sm) rounded-xl hover:bg-neutral-300 transition-colors overflow-hidden ${className ?? ""}`}
    >
      <div className="flex">
        {/* コンテンツエリア */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <h3 className="font-heading font-bold text-[15px] leading-[1.5] line-clamp-2 text-mirai-text">
            {displayTitle}
            {bill.is_review_completed && (
              <>
                {" "}
                <ReviewCompleteBadge size={14} top="1px" locale={locale} />
              </>
            )}
          </h3>
          <div className="flex items-center gap-3">
            <BillStatusBadge
              status={bill.status}
              statusNote={bill.status_note}
              locale={locale}
              className="w-fit"
            />
            {/* published_at はサイト掲載日時であり、議案の提出日ではない */}
            {bill.published_at && (
              <span lang={locale} className="text-xs text-mirai-text-muted">
                {card.published(formatDateJST(bill.published_at))}
              </span>
            )}
          </div>
        </div>

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-24 h-16 flex-shrink-0 self-center mr-4 rounded-lg overflow-hidden">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover washed"
              sizes="96px"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
