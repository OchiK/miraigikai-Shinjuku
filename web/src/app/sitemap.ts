import type { MetadataRoute } from "next";
import { getBills } from "@/features/bills/server/loaders/get-bills";
import { getCouncilors } from "@/features/councilors/server/loaders/get-councilors";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : env.webUrl;

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
  ];
}
