import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ReviewCompleteBadge } from "../../../client/components/bill-detail/review-status-banner";
import { BillStatusBadge } from "../../../client/components/bill-list/bill-status-badge";
import { BillTag } from "../../../client/components/bill-list/bill-tag";
import type { BillWithContent } from "../../../shared/types";

interface BillDetailHeaderProps {
  bill: BillWithContent;
  locale?: PublicLocale;
}

/**
 * 議案詳細の見出し（デザインシステム定義 §9-2〜4）。
 *
 * 順序は固定で、議決ステータス＋議案番号 → 表題（正式名称）→ 分野タグ。
 * 読みやすい題名と要約はAI生成なので、この下の BillAiSummary に分けて置く。
 */
export function BillDetailHeader({
  bill,
  locale = "ja",
}: BillDetailHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      {/* 2. 議決ステータス + 議案番号・種別 */}
      <div className="flex flex-wrap items-center gap-3">
        <BillStatusBadge
          className="w-fit"
          status={bill.status}
          statusNote={bill.status_note}
          locale={locale}
        />
        {bill.bill_number && (
          <span className="inline-flex items-baseline gap-2 text-mirai-text-muted text-sm">
            <span className="font-display tracking-wider" lang="en">
              BILL
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-heading font-bold">{bill.bill_number}</span>
          </span>
        )}
      </div>

      {/* 3. 表題（正式名称をそのまま） */}
      <h1 className="font-bold font-heading text-2xl text-mirai-text leading-[1.5] md:text-3xl">
        {bill.name}
        {bill.is_review_completed && (
          <>
            {" "}
            <ReviewCompleteBadge showTooltip />
          </>
        )}
      </h1>

      {/* 4. 分野タグ */}
      {bill.tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {bill.tags.map((tag) => (
            <BillTag key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </header>
  );
}
