import { Languages } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layouts/container";
import { GuideLanguageLinks } from "@/features/guide/client/components/guide-language-links";
import {
  GUIDE_LINKS_LABEL,
  GUIDE_LINKS_NAV_LABEL_TOP,
} from "@/features/guide/shared/guide-content";

/**
 * トップページの多言語案内。
 * 議案の翻訳が無い5言語の話者を、自言語の案内ページ
 * （ブラウザ翻訳・やさしい日本語・AIチャットの使い方）へ送る。
 * 英語への切替はヘッダー（狭い画面ではメニュー）に一本化している（P8-15）。
 */
export function MultilingualGuideBanner() {
  return (
    <Container className="pt-8">
      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-mirai-sm">
        <nav
          aria-label={GUIDE_LINKS_NAV_LABEL_TOP}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <BannerLabel>{GUIDE_LINKS_LABEL}</BannerLabel>
          <GuideLanguageLinks />
        </nav>
      </div>
    </Container>
  );
}

function BannerLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex shrink-0 items-center gap-2 text-sm font-semibold text-mirai-text">
      <Languages aria-hidden="true" className="size-5" strokeWidth={2.75} />
      <span>{children}</span>
    </p>
  );
}
