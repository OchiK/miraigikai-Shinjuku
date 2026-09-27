import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import {
  LegalPageLayout,
  LegalSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { siteConfig } from "@/config/site.config";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { getFaqItems } from "@/features/legal/shared/faq-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return locale === "en"
    ? {
        title: `Frequently Asked Questions | ${siteConfig.english.siteName}`,
        description: `Frequently asked questions about ${siteConfig.english.siteName}.`,
      }
    : {
        title: `よくあるご質問 | ${siteConfig.siteName}`,
        description: `${siteConfig.siteName}に関するよくあるご質問`,
      };
}

export default async function FaqPage() {
  const locale = await getLocale();
  const faqItems = getFaqItems(locale);

  return (
    <LegalPageLayout
      lang={locale}
      title={locale === "en" ? "Frequently Asked Questions" : "よくあるご質問"}
      description={
        locale === "en"
          ? `Answers to common questions about ${siteConfig.english.siteName}.`
          : `${siteConfig.siteName}に関するよくあるご質問をまとめています。`
      }
      className="pt-24 md:pt-12"
    >
      <Container className="space-y-10">
        {faqItems.map((faq) => (
          <section key={faq.question} className="space-y-3">
            <LegalSectionTitle>{faq.question}</LegalSectionTitle>
            <div className="text-sm leading-relaxed text-mirai-text-muted sm:text-base">
              {faq.answer}
            </div>
          </section>
        ))}
      </Container>
    </LegalPageLayout>
  );
}
