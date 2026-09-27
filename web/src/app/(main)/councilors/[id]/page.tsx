import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { getActiveCouncilSession } from "@/features/council-sessions/server/loaders/get-active-council-session";
import { CouncilorDetailSection } from "@/features/councilors/server/components/councilor-detail-section";
import { getCouncilorById } from "@/features/councilors/server/loaders/get-councilor-by-id";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [councilor, locale] = await Promise.all([
    getCouncilorById(id),
    getLocale(),
  ]);

  if (!councilor) {
    return {
      title: locale === "en" ? "Councilor not found" : "議員が見つかりません",
    };
  }

  const faction = councilor.faction?.displayName;
  return {
    title:
      locale === "en"
        ? `${councilor.name}${faction ? ` (${faction})` : ""} | ${siteConfig.english.siteName}`
        : `${councilor.name}${faction ? `（${faction}）` : ""} | ${siteConfig.siteName}`,
    description:
      locale === "en"
        ? `Summary of ${siteConfig.english.councilName} Councilor ${councilor.name}'s parliamentary group, committee assignments, and questions in the council.`
        : `${siteConfig.councilName}議員 ${councilor.name}の所属会派・所属委員会と、議会での質問の要約です。`,
    alternates: {
      canonical: routes.councilorDetail(councilor.id),
    },
  };
}

export default async function CouncilorDetailPage({ params }: Props) {
  const { id } = await params;
  const [councilor, activeSession, locale] = await Promise.all([
    getCouncilorById(id),
    getActiveCouncilSession(),
    getLocale(),
  ]);

  if (!councilor) {
    notFound();
  }

  return (
    <Container className="pt-24 pb-8 md:pt-8">
      <CouncilorDetailSection
        councilor={councilor}
        activeSession={
          activeSession?.slug
            ? { name: activeSession.name, slug: activeSession.slug }
            : null
        }
        locale={locale}
      />
    </Container>
  );
}
