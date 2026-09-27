import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { LegalPageLayout } from "@/components/layouts/legal-page-layout";
import { siteConfig } from "@/config/site.config";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { LegalDocumentContent } from "@/features/legal/server/components/legal-document-content";
import { getTermsContent } from "@/features/legal/shared/terms-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return locale === "en"
    ? {
        title: `Terms of Service | ${siteConfig.english.siteName}`,
        description: `Terms of Service for ${siteConfig.english.siteName}.`,
      }
    : {
        title: `利用規約 | ${siteConfig.siteName}`,
        description: `${siteConfig.siteName}の利用規約`,
      };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const document = getTermsContent(locale);

  return (
    <LegalPageLayout
      lang={locale}
      title={document.title}
      description={document.description}
      className="pt-24 md:pt-12"
    >
      <Container className="space-y-10">
        <LegalDocumentContent document={document} />
      </Container>
    </LegalPageLayout>
  );
}
