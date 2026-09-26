import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { CircleHelp, ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { COUNCILOR_SOURCES, QUESTION_SOURCES } from "../../shared/constants";

const SOURCE_LINKS = [
  { key: "roster", url: COUNCILOR_SOURCES.roster.url },
  { key: "factions", url: COUNCILOR_SOURCES.factions.url },
  { key: "committees", url: COUNCILOR_SOURCES.committees.url },
] as const;

export function ExternalSourceLink({
  href,
  children,
  locale = "ja",
}: {
  href: string;
  children: ReactNode;
  /** 「新しいタブで開きます」の読み上げの言語 */
  locale?: PublicLocale;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1 font-bold text-mirai-accent-text text-sm underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={2.75}
      />
      <span lang={locale} className="sr-only">
        {getUiMessages(locale).factionStances.opensInNewTab}
      </span>
    </a>
  );
}

/**
 * 出典と免責。議員情報は公式ページの転記であることと基準日を必ず示す。
 */
export function CouncilorSources({ locale = "ja" }: { locale?: PublicLocale }) {
  const messages = getUiMessages(locale).councilorSources;

  return (
    <section lang={locale} className="rounded-xl bg-mirai-surface-sunken p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            {messages.councilorsHeading}
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {messages.councilorsBody}
          </p>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {messages.xBody}
          </p>
          <ul className="flex flex-col">
            {SOURCE_LINKS.map((source) => (
              <li key={source.url}>
                <ExternalSourceLink href={source.url} locale={locale}>
                  {messages.linkLabels[source.key]}
                </ExternalSourceLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            {messages.questionsHeading}
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {messages.questionsBody}
          </p>
          <ExternalSourceLink
            href={QUESTION_SOURCES.minutes.url}
            locale={locale}
          >
            {messages.linkLabels.minutes}
          </ExternalSourceLink>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            {messages.disclaimerHeading}
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {messages.disclaimerBody}
          </p>
        </div>

        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-5 font-bold text-mirai-text text-sm shadow-mirai-sm transition-colors hover:bg-neutral-300"
          href={routes.faq() as Route}
        >
          <CircleHelp
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.75}
          />
          {messages.faq}
        </Link>
      </div>
    </section>
  );
}
