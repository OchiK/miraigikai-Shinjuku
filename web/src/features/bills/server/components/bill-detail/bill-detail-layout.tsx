import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewLandingSection } from "@/features/interview-config/client/components/interview-landing-section";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { BillInterviewOpinionsSection } from "@/features/interview-report/server/components/bill-interview-opinions-section";
import { getPublicReportsByBillId } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import { BillChatCtaBanner } from "../../../client/components/bill-detail/bill-chat-cta-banner";
import { BillDeliberationTimeline } from "../../../client/components/bill-detail/bill-deliberation-timeline";
import { BillDetailClient } from "../../../client/components/bill-detail/bill-detail-client";
import { BillDetailNav } from "../../../client/components/bill-detail/bill-detail-nav";
import { BillDisclaimer } from "../../../client/components/bill-detail/bill-disclaimer";
import { BillOriginalAccordion } from "../../../client/components/bill-detail/bill-original-accordion";
import { FactionStanceCard } from "../../../client/components/bill-detail/faction-stance-card";
import type { BillWithContent } from "../../../shared/types";
import { BillShareButtons } from "../share/bill-share-buttons";
import { BillAiSummary } from "./bill-ai-summary";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";
import { BillSourceLinks } from "./bill-source-links";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

/**
 * 議案詳細ページ（デザインシステム定義 §9）。
 *
 * 順序は固定で、原文より要約を上に置く。
 * 1. 上部ナビ / 2. 議決ステータス+議案番号 / 3. 表題 / 4. 分野タグ /
 * 5. かんたん要約 / 6. 議決結果 / 7. 審議の経過 / 8. 議案の原文 /
 * 9. 区議会の公式ページ / 10. 質問する / 11. 免責
 *
 * テキスト選択とチャットの状態は BillDetailClient が持つ。中身は Server Component の
 * まま children として渡し、SSRによる初期レンダリングを保つ。
 */
export async function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const showStances =
    bill.status === "preparing" ||
    (bill.faction_stances && bill.faction_stances.length > 0);

  const [interviewConfig, publicReportsResult] = await Promise.all([
    getInterviewConfig(bill.id),
    getPublicReportsByBillId(bill.id),
  ]);

  // サイトヘッダーは fixed top-4。md 未満では MainLayout の mt-24 が効かないため、
  // 上部ナビがヘッダーに潜らないようここで逃がす。
  return (
    <div className="bg-background pt-20 pb-12 md:pt-0">
      <BillDetailClient
        bill={bill}
        currentDifficulty={currentDifficulty}
        hasInterviewConfig={interviewConfig != null}
      >
        <Container>
          {/* 1. 上部ナビゲーション */}
          <BillDetailNav councilSession={bill.council_session} />

          <div className="flex flex-col gap-8">
            {/* 2〜4. 議決ステータス・議案番号 / 表題 / 分野タグ */}
            <BillDetailHeader
              bill={bill}
              hasInterviewConfig={interviewConfig != null}
              opinionCount={publicReportsResult.totalCount}
            />

            {/* 5. かんたん要約 */}
            <BillAiSummary
              summary={bill.bill_content?.summary}
              title={bill.bill_content?.title}
            />

            {/* 6. 議決結果 */}
            {showStances && (
              <FactionStanceCard
                billStatus={bill.status}
                stances={bill.faction_stances ?? []}
              />
            )}

            {/* 7. 審議の経過 */}
            <BillDeliberationTimeline
              status={bill.status}
              statusNote={bill.status_note}
            />

            {/* 8. 議案の原文（既定では開かない） */}
            {bill.bill_content?.content && (
              <BillOriginalAccordion>
                <BillContent bill={bill} />
              </BillOriginalAccordion>
            )}

            {publicReportsResult.totalCount > 0 && (
              <BillInterviewOpinionsSection
                billId={bill.id}
                reports={publicReportsResult.reports}
                totalCount={publicReportsResult.totalCount}
              />
            )}

            {siteConfig.features.aiInterview && interviewConfig != null && (
              <InterviewLandingSection billId={bill.id} />
            )}

            {/* 9. 区議会の公式ページ（PDF） */}
            <BillSourceLinks bill={bill} />

            {/* 10. この議案について質問する（追尾するボタンは置かない） */}
            <BillChatCtaBanner />

            <BillShareButtons bill={bill} />

            {/* 11. 免責 */}
            <BillDisclaimer />
          </div>
        </Container>
      </BillDetailClient>
    </div>
  );
}
