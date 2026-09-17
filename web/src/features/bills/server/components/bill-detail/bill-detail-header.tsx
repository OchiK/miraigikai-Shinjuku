import { MessageSquare } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { getInterviewLPLink } from "@/features/interview-config/shared/utils/interview-links";
import { routes } from "@/lib/routes";
import { BillDetailShareButton } from "../../../client/components/bill-detail/bill-detail-share-button";
import {
  ReviewCompleteBadge,
  ReviewInProgressBanner,
} from "../../../client/components/bill-detail/review-status-banner";
import { BillStatusBadge } from "../../../client/components/bill-list/bill-status-badge";
import { BillTag } from "../../../client/components/bill-list/bill-tag";
import { getBillShareData } from "../../../client/utils/share";
import type { BillWithContent } from "../../../shared/types";

interface BillDetailHeaderProps {
  bill: BillWithContent;
  hasInterviewConfig?: boolean;
  opinionCount?: number;
}

/**
 * 議案詳細の見出し（デザインシステム定義 §9-2〜4）。
 *
 * 順序は固定で、議決ステータス＋議案番号 → 表題（正式名称）→ 分野タグ。
 * 読みやすい題名と要約はAI生成なので、この下の BillAiSummary に分けて置く。
 */
export async function BillDetailHeader({
  bill,
  hasInterviewConfig,
  opinionCount,
}: BillDetailHeaderProps) {
  const { shareUrl, shareMessage, thumbnailUrl } = await getBillShareData(bill);

  return (
    <header className="flex flex-col gap-4">
      {bill.thumbnail_url && (
        <div className="relative h-56 w-full overflow-hidden rounded-xl md:h-72">
          <Image
            alt={bill.name}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            src={bill.thumbnail_url}
          />
        </div>
      )}

      {/* 2. 議決ステータス + 議案番号・種別 */}
      <div className="flex flex-wrap items-center gap-3">
        <BillStatusBadge
          className="w-fit"
          status={bill.status}
          statusNote={bill.status_note}
        />
        {bill.bill_number && (
          <span className="font-display text-mirai-text-muted text-sm tracking-wider">
            {bill.bill_number}
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

      {!bill.is_review_completed && <ReviewInProgressBanner />}

      {opinionCount != null && opinionCount > 0 && (
        <Link
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-mirai-accent-text hover:opacity-80"
          href={routes.billOpinions(bill.id) as Route}
        >
          <MessageSquare aria-hidden="true" className="size-4" />
          <span className="font-bold text-sm">{opinionCount}件のご意見</span>
        </Link>
      )}

      {/* 1画面の primary は「質問する」バナーの1つだけ（設計書 §6）。
          ここのボタンは面の色のセカンダリに留める。 */}
      <div className="flex flex-wrap items-center gap-3">
        {siteConfig.features.aiInterview && hasInterviewConfig && (
          <Button
            asChild
            className="min-h-11 bg-card text-mirai-text shadow-mirai-sm hover:bg-neutral-300"
            variant="ghost"
          >
            <Link href={getInterviewLPLink(bill.id) as Route}>
              <Image
                alt=""
                height={23}
                src="/icons/interview-cooperation.svg"
                width={23}
              />
              AIインタビューに協力する
            </Link>
          </Button>
        )}
        <BillDetailShareButton
          shareMessage={shareMessage}
          shareUrl={shareUrl}
          thumbnailUrl={thumbnailUrl}
        />
      </div>
    </header>
  );
}
