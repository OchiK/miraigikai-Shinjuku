import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";

import { Hero } from "@/components/top/hero";
import { MiraiMapBanner } from "@/components/top/mirai-map-banner";
import { MultilingualGuideBanner } from "@/components/top/multilingual-guide-banner";
import { TeamMirai } from "@/components/top/team-mirai";
import { siteConfig } from "@/config/site.config";
import { CurrentSessionHeader } from "@/features/council-sessions/client/components/current-session-header";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { PreviousSessionSection } from "@/features/bills/server/components/previous-session-section";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import { BillsInJapaneseNotice } from "@/features/i18n/client/components/bills-in-japanese-notice";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return locale === "en"
    ? {
        title: `${siteConfig.english.siteName} | ${siteConfig.english.cityName}`,
        description: siteConfig.english.siteDescription,
      }
    : {
        title: siteConfig.siteName,
        description: siteConfig.siteDescription,
      };
}

export default async function Home() {
  const {
    billsByTag,
    featuredBills,
    previousSessionData,
    activeSession,
    activeSessionSlug,
    isInSession,
  } = await loadHomeData();

  const locale = await getLocale();

  const featuredBillIds = new Set(featuredBills.map((b) => b.id));
  const { home } = getUiMessages(locale);

  return (
    <>
      <Hero locale={locale} />

      {/* 多言語案内（議案の翻訳を公開していない5言語） */}
      <MultilingualGuideBanner />

      {/* 現在の定例会と注目の議案（全幅の帯で、下の分野別と区切る） */}
      <div className="bg-mirai-surface-sunken py-12">
        <Container>
          <div className="flex flex-col gap-10">
            {activeSession && (
              <CurrentSessionHeader
                session={activeSession}
                isInSession={isInSession}
                locale={locale}
              />
            )}

            <BillsInJapaneseNotice locale={locale} />

            {/* 注目の議案セクション */}
            <FeaturedBillSection bills={featuredBills} locale={locale} />
          </div>
        </Container>
      </div>

      {/* 分野別の議案セクション */}
      {billsByTag.length > 0 && (
        <Container>
          <div className="flex flex-col gap-10 py-12">
            <h2
              lang={locale}
              className="text-2xl font-bold leading-[1.48] text-mirai-text"
            >
              {home.allBillsHeading}
            </h2>

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection
              billsByTag={billsByTag}
              featuredBillIds={featuredBillIds}
              sessionSlug={activeSessionSlug}
              locale={locale}
            />
          </div>
        </Container>
      )}
      {/* 前回の定例会セクション（Archive） */}
      {previousSessionData && (
        <div className="bg-neutral-200 py-10">
          <Container>
            <PreviousSessionSection
              session={previousSessionData.session}
              bills={previousSessionData.bills}
              totalBillCount={previousSessionData.totalBillCount}
              locale={locale}
            />
          </Container>
        </div>
      )}

      <Container className="pt-10">
        {/* 全国のみらい議会マップ バナー */}
        <MiraiMapBanner locale={locale} />

        {/* みらい議会とは セクション */}
        <About locale={locale} />

        {/* チームみらいについて セクション */}
        <TeamMirai />

        {/* 免責事項 */}
        <BillDisclaimer locale={locale} />
      </Container>
    </>
  );
}
