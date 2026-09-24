import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { LinkButton } from "./link-button";

interface AboutProps {
  locale?: PublicLocale;
}

export function About({ locale = "ja" }: AboutProps) {
  const { about } = getUiMessages(locale);
  return (
    <div lang={locale} className="py-10">
      <div className="flex flex-col gap-4">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <h2>
            <Image
              src="/icons/about-typography.svg"
              alt="About"
              width={143}
              height={36}
              priority
            />
          </h2>
          <p className="text-sm font-bold text-mirai-accent-text">
            {about.lead}
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold leading-[43.2px]">
              {about.headingLines[0]}
              <br />
              {about.headingLines[1]}
            </h3>
            <p className="text-[15px] leading-[28px] text-black">
              {about.body}
            </p>
          </div>

          {/* もっと詳しく知るボタン */}
          {siteConfig.externalLinks.aboutNote && (
            <LinkButton
              href={siteConfig.externalLinks.aboutNote}
              icon={{
                src: "/icons/note-icon.png",
                alt: "note",
                width: 25,
                height: 25,
              }}
            >
              {about.lead}
            </LinkButton>
          )}

          {/* 非公式運営時: 帰属・免責表記 */}
          {!siteConfig.features.showTeamMiraiSection && (
            <div className="flex flex-col gap-4 pt-2 border-t border-gray-200">
              <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-mirai-text-secondary">
                <p>{about.basedOn}</p>
              </div>

              <div className="flex flex-col gap-1 text-[13px] leading-relaxed text-mirai-text-secondary">
                <p>
                  {about.unofficial}
                  <br />
                  {about.contactBefore}
                  <a
                    href={siteConfig.operator.contactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {about.operatorName}
                  </a>
                  {about.contactAfter}
                </p>
                <p className="pt-1">
                  {about.sourceBefore}
                  <a
                    href={siteConfig.operator.contactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    GitHub
                  </a>
                  {about.sourceAfter}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
