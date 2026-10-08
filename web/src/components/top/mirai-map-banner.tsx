import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ExternalLink, MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

interface MiraiMapBannerProps {
  locale?: PublicLocale;
  /** 遷移先。既定は siteConfig の設定値で、空文字列なら何も描画しない */
  href?: string;
}

/**
 * トップページの「全国のみらい議会マップ」への導線。
 * 他の自治体の みらい議会 を探せる外部サイトなので、新しいタブで開く。
 */
export function MiraiMapBanner({
  locale = "ja",
  href = siteConfig.externalLinks.miraiGikaiMap,
}: MiraiMapBannerProps) {
  if (!href) return null;

  const { miraiMap } = getUiMessages(locale).home;

  return (
    <section
      lang={locale}
      aria-labelledby="mirai-map-banner-title"
      className="rounded-xl bg-card p-6 shadow-mirai-sm md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-bold text-mirai-accent-text">
            <MapIcon
              className="size-3.5"
              strokeWidth={2.75}
              aria-hidden="true"
            />
            <span>{miraiMap.badge}</span>
          </p>
          <h2
            id="mirai-map-banner-title"
            className="text-xl font-bold text-mirai-text md:text-2xl"
          >
            {miraiMap.title}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-mirai-text-secondary">
            {miraiMap.description}
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="min-h-11 self-start px-6 has-[>svg]:px-6 md:self-center"
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={miraiMap.ariaLabel}
          >
            <span>{miraiMap.buttonLabel}</span>
            <ExternalLink strokeWidth={2.75} aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  );
}
