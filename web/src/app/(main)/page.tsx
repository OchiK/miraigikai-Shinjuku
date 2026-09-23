import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";

import { Hero } from "@/components/top/hero";
import { TeamMirai } from "@/components/top/team-mirai";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { PreviousSessionSection } from "@/features/bills/server/components/previous-session-section";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import { getCurrentCouncilSession } from "@/features/council-sessions/server/loaders/get-current-council-session";
import { CurrentCouncilSession } from "@/features/council-sessions/client/components/current-council-session";
import { getJapanTime } from "@/lib/utils/date";

export default async function Home() {
  const { billsByTag, featuredBills, previousSessionData, activeSessionSlug } =
    await loadHomeData();

  const currentSession = await getCurrentCouncilSession(getJapanTime());

  const featuredBillIds = new Set(featuredBills.map((b) => b.id));

  return (
    <>
      <Hero />

      {/* 本日の定例会セクション */}
      <CurrentCouncilSession session={currentSession} />

      {/* 議案一覧セクション */}
      <Container className="">
        <div className="py-10">
          <div className="flex flex-col gap-16">
            {/* 注目の議案セクション */}
            <FeaturedBillSection bills={featuredBills} />

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection
              billsByTag={billsByTag}
              featuredBillIds={featuredBillIds}
              sessionSlug={activeSessionSlug}
            />
          </div>
        </div>
      </Container>
      {/* 前回の定例会セクション（Archive） */}
      {previousSessionData && (
        <div className="bg-neutral-200 py-10">
          <Container>
            <PreviousSessionSection
              session={previousSessionData.session}
              bills={previousSessionData.bills}
              totalBillCount={previousSessionData.totalBillCount}
            />
          </Container>
        </div>
      )}

      <Container>
        {/* みらい議会とは セクション */}
        <About />

        {/* チームみらいについて セクション */}
        <TeamMirai />

        {/* 免責事項 */}
        <BillDisclaimer />
      </Container>
    </>
  );
}
