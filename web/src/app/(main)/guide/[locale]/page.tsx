import { GUIDE_LOCALES, isGuideLocale } from "@mirai-gikai/shared/i18n/locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { GuideView } from "@/features/guide/server/components/guide-view";
import { GUIDE_TEXTS } from "@/features/guide/shared/guide-content";
import { buildGuideLanguageAlternates } from "@/features/guide/shared/utils/guide-alternates";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * 案内ページは5言語だけ。それ以外の locale は存在しないページとして扱い、
 * ほかの存在しないページと同じく app/not-found.tsx でトップへリダイレクトする。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isGuideLocale(locale)) return {};

  const text = GUIDE_TEXTS[locale];
  const title = `${text.title} | ${siteConfig.siteName}`;
  return {
    title,
    description: text.description,
    alternates: {
      canonical: routes.guide(locale),
      // 5言語の案内ページを互いに結ぶ
      languages: buildGuideLanguageAlternates(),
    },
    // ページ側の openGraph は layout のものを丸ごと置き換えるので、画像とサイト名も指定する
    openGraph: {
      title,
      description: text.description,
      url: routes.guide(locale),
      type: "website",
      siteName: siteConfig.siteName,
      images: [
        {
          url: "/ogp.jpg",
          width: 1200,
          height: 630,
          alt: `${siteConfig.siteName}のOGPイメージ`,
        },
      ],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  if (!isGuideLocale(locale)) {
    notFound();
  }

  return <GuideView locale={locale} />;
}
