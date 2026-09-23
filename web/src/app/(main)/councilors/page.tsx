import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { getCouncilors } from "@/features/councilors/server/loaders/get-councilors";
import { CouncilorListSection } from "@/features/councilors/server/components/councilor-list-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: `${siteConfig.councilName}議員一覧 | ${siteConfig.siteName}`,
  description: `${siteConfig.councilName}議員の所属会派と所属委員会の一覧です。`,
  alternates: {
    canonical: routes.councilors(),
  },
};

export default async function CouncilorsPage() {
  const councilors = await getCouncilors();

  return (
    <Container className="pt-24 pb-8 md:pt-8">
      <CouncilorListSection councilors={councilors} />
    </Container>
  );
}
