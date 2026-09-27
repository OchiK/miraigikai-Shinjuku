import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { LegalPageLayout } from "@/components/layouts/legal-page-layout";
import { siteConfig } from "@/config/site.config";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { LegalDocumentContent } from "@/features/legal/server/components/legal-document-content";
import { getPrivacyContent } from "@/features/legal/shared/privacy-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return locale === "en"
    ? {
        title: `Privacy Policy | ${siteConfig.english.siteName}`,
        description: `Privacy Policy for ${siteConfig.english.siteName}.`,
      }
    : {
        title: `プライバシーポリシー | ${siteConfig.siteName}`,
        description: `${siteConfig.siteName}のプライバシーポリシー`,
      };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const document = getPrivacyContent(locale);

  return (
    <LegalPageLayout
      lang={locale}
      className="bg-transparent pt-24 md:pt-12"
      title={document.title}
      description={document.description}
    >
      <Container className="space-y-8">
        <LegalDocumentContent document={document} />
      </Container>
    </LegalPageLayout>
  );
}
