import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

interface HeroProps {
  locale?: PublicLocale;
}

export function Hero({ locale = "ja" }: HeroProps) {
  const { home } = getUiMessages(locale);
  return (
    <div className="relative w-full h-[80vh] min-h-[400px] md:h-[70vh]">
      <Image
        src="/img/hero_background.png"
        alt={home.heroImageAlt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
      <div className="absolute bottom-[30vh] left-0 right-0 py-4">
        <Container>
          <h1
            lang={locale}
            className="font-bold text-xl md:text-2xl leading-relaxed"
          >
            {home.heroLines[0]} <br />
            {home.heroLines[1]}
          </h1>
          <p className="mt-2 font-display text-xs">
            {/* 表示したい場合は `powered by ${siteConfig.operator.name}` とかで*/}
            {siteConfig.features.showTeamMiraiSection
              ? "powered by Team Mirai & AI"
              : ""}
          </p>
        </Container>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-gentle">
        <div className="w-[1px] h-[34px] bg-black"></div>
        <p className="mt-2 font-display text-[10px] leading-[20px] text-black">
          Scroll
        </p>
      </div>
    </div>
  );
}
