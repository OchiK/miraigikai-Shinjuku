import "server-only";

import { CircleHelp, ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { COUNCILOR_SOURCES } from "../../shared/constants";

const SOURCE_LINKS = [
  COUNCILOR_SOURCES.roster,
  COUNCILOR_SOURCES.factions,
  COUNCILOR_SOURCES.committees,
];

export function ExternalSourceLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
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
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  );
}

/**
 * 出典と免責。議員情報は公式ページの転記であることと基準日を必ず示す。
 */
export function CouncilorSources() {
  return (
    <section className="rounded-xl bg-mirai-surface-sunken p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">議員情報の出典</h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            氏名・当選回数・所属会派・所属委員会は、{siteConfig.councilName}
            の公式ページ（{COUNCILOR_SOURCES.asOf}
            更新）を転記したものです。肖像権に配慮し、顔写真は掲載していません。
          </p>
          <ul className="flex flex-col">
            {SOURCE_LINKS.map((source) => (
              <li key={source.url}>
                <ExternalSourceLink href={source.url}>
                  {siteConfig.councilName} {source.label}
                </ExternalSourceLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">免責事項</h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            本サイトは{siteConfig.councilName}
            の公式サイトではありません。会派や委員会の構成は年度途中でも変わることがあります。正確な情報は、公式ページをご確認ください。
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
          よくある質問
        </Link>
      </div>
    </section>
  );
}
