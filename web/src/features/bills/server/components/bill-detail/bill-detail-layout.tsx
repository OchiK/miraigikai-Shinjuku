import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { getQuestionsByBillId } from "@/features/councilors/server/loaders/get-questions-by-bill-id";
import { TranslationNotice } from "@/features/i18n/server/components/translation-notice";
import type { BillLocalization } from "@/features/i18n/shared/types";
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
import { BillCouncilorsSection } from "./bill-councilors-section";
import { BillDetailHeader } from "./bill-detail-header";
import { BillSourceLinks } from "./bill-source-links";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
  /** 日本語以外を選んでいるときの表示状態。ja なら null */
  localization?: BillLocalization | null;
  /** UI 文言の言語。翻訳が無く日本語を出しているときも、選んだ言語に合わせる */
  locale?: PublicLocale;
}

/**
 * 議案詳細ページ（デザインシステム定義 §9）。
 *
 * 順序は固定で、原文より要約を上に置く。
 * 1. 上部ナビ / 2. 議決ステータス+議案番号 / 3. 表題 / 4. 分野タグ /
 * 5. かんたん要約 / 6. 議決結果 / 7. 審議の経過 / 7-2. この議案と議員 / 8. 議案の原文 /
 * 9. 区議会の公式ページ / 10. 質問する / 11. 免責
 *
 * テキスト選択とチャットの状態は BillDetailClient が持つ。中身は Server Component の
 * まま children として渡し、SSRによる初期レンダリングを保つ。
 */
export async function BillDetailLayout({
  bill,
  currentDifficulty,
  localization,
  locale = "ja",
}: BillDetailLayoutProps) {
  const showStances =
    bill.status === "preparing" ||
    (bill.faction_stances && bill.faction_stances.length > 0);

  // 翻訳を表示しているときだけ、要約と本文に言語を明示する
  const contentLang =
    localization?.kind === "translated"
      ? localization.requestedLocale
      : undefined;

  const [interviewConfig, publicReportsResult, relatedQuestions] =
    await Promise.all([
      getInterviewConfig(bill.id),
      getPublicReportsByBillId(bill.id),
      getQuestionsByBillId(bill.id),
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
            <BillDetailHeader bill={bill} locale={locale} />

            {/* 表示言語の案内（日本語以外を選んだときのみ） */}
            {localization && <TranslationNotice localization={localization} />}

            {/* 5. かんたん要約 */}
            <BillAiSummary
              summary={bill.bill_content?.summary}
              title={bill.bill_content?.title}
              isReviewCompleted={bill.is_review_completed}
              lang={contentLang}
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

            {/* 7-2. この議案と議員（議員一覧・議案に紐づく質問） */}
            <BillCouncilorsSection
              questions={relatedQuestions}
              locale={locale}
            />

            {/* 8. 議案の原文（既定では開かない） */}
            {bill.bill_content?.content && (
              <BillOriginalAccordion>
                <div lang={contentLang}>
                  <BillContent bill={bill} />
                </div>
              </BillOriginalAccordion>
            )}

            {/* 9. 区議会の公式ページ（PDF） */}
            <BillSourceLinks bill={bill} />

            {/* 10. 質問・参加・共有（追尾するボタンは置かない） */}
            <BillChatCtaBanner />

            <div
              aria-label="この議案への参加と共有"
              className="flex flex-col gap-8"
              role="group"
            >
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

              <BillShareButtons bill={bill} />
            </div>

            {/* 11. 免責 */}
            <BillDisclaimer locale={locale} />
          </div>
        </Container>
      </BillDetailClient>
    </div>
  );
}
