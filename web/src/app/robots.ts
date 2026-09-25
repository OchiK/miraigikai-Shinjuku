import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/utils/url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveSiteUrl();
  const isStaging = process.env.VERCEL_TARGET_ENV === "staging";

  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dev/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
