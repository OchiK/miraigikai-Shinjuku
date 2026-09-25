import { GUIDE_LOCALES } from "@mirai-gikai/shared/i18n/locales";
import type { MetadataRoute } from "next";
import { getBills } from "@/features/bills/server/loaders/get-bills";
import { getCouncilors } from "@/features/councilors/server/loaders/get-councilors";
import { buildGuideLanguageAlternates } from "@/features/guide/shared/utils/guide-alternates";
import { routes } from "@/lib/routes";
import { resolveSiteUrl } from "@/lib/utils/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveSiteUrl();

  const [bills, councilors] = await Promise.all([getBills(), getCouncilors()]);

  const billUrls = bills.map((bill) => ({
    url: `${baseUrl}${routes.billDetail(bill.id)}`,
    lastModified: new Date(bill.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const councilorUrls = councilors.map((councilor) => ({
    url: `${baseUrl}${routes.councilorDetail(councilor.id)}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // 5言語の案内ページは互いに hreflang で結ぶ
  const guideLanguages = buildGuideLanguageAlternates(baseUrl);
  const guideUrls = GUIDE_LOCALES.map((locale) => ({
    url: `${baseUrl}${routes.guide(locale)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: { languages: guideLanguages },
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...billUrls,
    {
      url: `${baseUrl}${routes.councilors()}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...councilorUrls,
    ...guideUrls,
  ];
}
