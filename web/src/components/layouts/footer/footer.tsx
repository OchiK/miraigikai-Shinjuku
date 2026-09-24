"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { GuideLanguageLinks } from "@/features/guide/client/components/guide-language-links";
import { GUIDE_LINKS_LABEL } from "@/features/guide/shared/guide-content";
import {
  getUiMessages,
  type UiMessages,
} from "@/features/i18n/shared/ui-messages";
import { isInterviewPage } from "@/lib/page-layout-utils";
import { routes } from "@/lib/routes";
import { getPolicyLinks, getPrimaryLinks } from "./footer.config";

type FooterMessages = UiMessages["footer"];

interface FooterProps {
  /** 表示言語。省略時は日本語 */
  locale?: PublicLocale;
}

export function Footer({ locale = "ja" }: FooterProps) {
  const pathname = usePathname();
  const { footer } = getUiMessages(locale);

  if (isInterviewPage(pathname)) {
    return null;
  }

  return (
    <footer lang={locale} className="bg-card text-mirai-text">
      <div className="mx-auto flex w-full max-w-[500px] flex-col items-center px-6 py-14 pb-20 text-center">
        {siteConfig.features.showTeamMiraiSection && (
          <FooterLogoSection messages={footer} />
        )}
        <FooterPrimaryLinks messages={footer} />
        <FooterGuideLinks />
        <FooterPolicies messages={footer} />
        <FooterCopyright messages={footer} />
      </div>
    </footer>
  );
}

function FooterLogoSection({ messages }: { messages: FooterMessages }) {
  return (
    <div className="flex flex-col items-center text-center mb-9">
      <Link href={routes.home()} aria-label={messages.homeLogoLabel}>
        <Image
          src="/img/logo.svg"
          alt={siteConfig.siteName}
          width={150}
          height={128}
          className="h-auto"
        />
      </Link>
    </div>
  );
}

function FooterPrimaryLinks({ messages }: { messages: FooterMessages }) {
  const primaryLinks = getPrimaryLinks(messages);
  return (
    <nav aria-label={messages.primaryLinksLabel} className="w-full mb-5">
      <ul
        className="
      flex flex-col items-center gap-3 text-[14px] font-semibold text-mirai-text
      md:flex-row md:justify-center md:gap-5
      "
      >
        {primaryLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href as Route}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="transition-colors hover:text-mirai-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mirai-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterGuideLinks() {
  return (
    <nav
      aria-label={GUIDE_LINKS_LABEL}
      className="mb-5 flex flex-col items-center gap-2"
    >
      <p className="text-xs font-semibold text-mirai-text-muted">
        {GUIDE_LINKS_LABEL}
      </p>
      <GuideLanguageLinks className="justify-center" />
    </nav>
  );
}

function FooterPolicies({ messages }: { messages: FooterMessages }) {
  const policyLinks = getPolicyLinks(messages);
  return (
    <div className="flex flex-col items-center text-[12px] font-semibold text-mirai-text mb-5">
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {policyLinks.map((policy, index) => (
          <li key={policy.label} className="flex items-center gap-2">
            <Link
              href={policy.href as Route}
              target={policy.external ? "_blank" : undefined}
              rel={policy.external ? "noreferrer" : undefined}
              className="transition-colors hover:text-mirai-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mirai-accent"
            >
              {policy.label}
            </Link>
            {index < policyLinks.length - 1 ? <span>｜</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterCopyright({ messages }: { messages: FooterMessages }) {
  if (siteConfig.features.showTeamMiraiSection) {
    return (
      <div className="text-center text-sm font-medium text-mirai-text">
        © 2025 Team Mirai All rights Reserved
      </div>
    );
  }

  return (
    <div className="space-y-1 text-center text-xs font-medium text-mirai-text-muted">
      <p>{messages.notTeamMirai}</p>
      <p>{messages.unofficialNotice}</p>
      <p>{messages.copyright}</p>
    </div>
  );
}
