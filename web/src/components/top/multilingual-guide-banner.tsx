import { Languages } from "lucide-react";
import { Container } from "@/components/layouts/container";
import { GuideLanguageLinks } from "@/features/guide/client/components/guide-language-links";
import { GUIDE_LINKS_LABEL } from "@/features/guide/shared/guide-content";

/**
 * トップページの多言語案内。議案の翻訳を公開していない5言語の話者を、
 * 自言語の案内ページ（ブラウザ翻訳・やさしい日本語・AIチャットの使い方）へ送る。
 * 英語は言語メニューから議案の英訳を読めるので、ここには出さない。
 */
export function MultilingualGuideBanner() {
  return (
    <Container className="pt-8">
      <nav
        aria-labelledby="multilingual-guide-banner-label"
        className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-mirai-sm md:flex-row md:items-center"
      >
        <p
          id="multilingual-guide-banner-label"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-mirai-text"
        >
          <Languages aria-hidden="true" className="size-5" strokeWidth={2.75} />
          <span>{GUIDE_LINKS_LABEL}</span>
        </p>
        <GuideLanguageLinks />
      </nav>
    </Container>
  );
}
