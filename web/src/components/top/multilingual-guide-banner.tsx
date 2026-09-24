import { Languages } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layouts/container";
import { GuideLanguageLinks } from "@/features/guide/client/components/guide-language-links";
import { GUIDE_LINKS_LABEL } from "@/features/guide/shared/guide-content";
import { LanguageToggle } from "@/features/i18n/client/components/language-toggle";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { ENGLISH_BILLS_LABEL } from "@/features/i18n/shared/messages";

/**
 * トップページの多言語案内。
 * - 英語: 議案の英訳を公開しているので、その場で表示言語を切り替えられるようにする
 *   （スマートフォンの議案ページ等ではヘッダーに切替を出せないため、ここにも置く。P8-4）
 * - 残り5言語: 議案の翻訳は無いので、自言語の案内ページ
 *   （ブラウザ翻訳・やさしい日本語・AIチャットの使い方）へ送る
 */
export async function MultilingualGuideBanner() {
  const locale = await getLocale();

  return (
    <Container className="pt-8">
      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-mirai-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <BannerLabel lang="en">{ENGLISH_BILLS_LABEL}</BannerLabel>
          <LanguageToggle currentLocale={locale} className="self-start" />
        </div>
        <nav
          aria-labelledby="multilingual-guide-banner-label"
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <BannerLabel id="multilingual-guide-banner-label">
            {GUIDE_LINKS_LABEL}
          </BannerLabel>
          <GuideLanguageLinks />
        </nav>
      </div>
    </Container>
  );
}

function BannerLabel({
  id,
  lang,
  children,
}: {
  id?: string;
  lang?: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      className="flex shrink-0 items-center gap-2 text-sm font-semibold text-mirai-text"
    >
      <Languages aria-hidden="true" className="size-5" strokeWidth={2.75} />
      <span lang={lang}>{children}</span>
    </p>
  );
}
