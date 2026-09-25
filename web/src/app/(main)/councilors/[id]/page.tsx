import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { getActiveCouncilSession } from "@/features/council-sessions/server/loaders/get-active-council-session";
import { CouncilorDetailSection } from "@/features/councilors/server/components/councilor-detail-section";
import { getCouncilorById } from "@/features/councilors/server/loaders/get-councilor-by-id";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const councilor = await getCouncilorById(id);

  if (!councilor) {
    return { title: "議員が見つかりません" };
  }

  const faction = councilor.faction?.displayName;
  return {
    title: `${councilor.name}${faction ? `（${faction}）` : ""} | ${siteConfig.siteName}`,
    description: `${siteConfig.councilName}議員 ${councilor.name}の所属会派・所属委員会と、議会での質問の要約です。`,
    alternates: {
      canonical: routes.councilorDetail(councilor.id),
    },
  };
}

export default async function CouncilorDetailPage({ params }: Props) {
  const { id } = await params;
  const [councilor, activeSession] = await Promise.all([
    getCouncilorById(id),
    getActiveCouncilSession(),
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
      />
    </Container>
  );
}
