import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { CouncilorListSection } from "@/features/councilors/server/components/councilor-list-section";
import { getCouncilors } from "@/features/councilors/server/loaders/get-councilors";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title:
      locale === "en"
        ? `${siteConfig.english.councilName} Councilors | ${siteConfig.english.siteName}`
        : `${siteConfig.councilName}議員一覧 | ${siteConfig.siteName}`,
    description:
      locale === "en"
        ? `List of ${siteConfig.english.councilName} councilors, their parliamentary groups, and committee assignments.`
        : `${siteConfig.councilName}議員の所属会派と所属委員会の一覧です。`,
    alternates: {
      canonical: routes.councilors(),
    },
  };
}

export default async function CouncilorsPage() {
  const [councilors, locale] = await Promise.all([
    getCouncilors(),
    getLocale(),
  ]);

  return (
    <Container className="pt-24 pb-8 md:pt-8">
      <CouncilorListSection councilors={councilors} locale={locale} />
    </Container>
  );
}
