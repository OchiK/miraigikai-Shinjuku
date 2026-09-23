import "server-only";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { CouncilorAvatar } from "../../client/components/councilor-avatar";
import { COUNCILOR_SOURCES } from "../../shared/constants";
import type { Councilor, CouncilorCommittee } from "../../shared/types";
import { groupCommitteesByKind } from "../../shared/utils/committee-kind";
import { CouncilorSources, ExternalSourceLink } from "./councilor-sources";

type Props = {
  councilor: Councilor;
};

function RoleTag({ role }: { role: string }) {
  return (
    <span className="rounded-full bg-mirai-featured px-3 py-0.5 font-bold text-mirai-featured-text text-xs">
      {role}
    </span>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-mirai-sm">
      <dt className="font-bold text-mirai-text-muted text-sm">{label}</dt>
      <dd className="flex flex-col gap-1">{children}</dd>
    </div>
  );
}

function CommitteeGroups({ committees }: { committees: CouncilorCommittee[] }) {
  const groups = groupCommitteesByKind(committees);

  if (groups.length === 0) {
    return <p className="text-base text-mirai-text">所属なし</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.kind} className="flex flex-col gap-1">
          <p className="text-mirai-text-muted text-xs">{group.label}</p>
          <ul className="flex flex-col gap-1">
            {group.committees.map((committee) => (
              <li
                key={committee.id}
                className="flex flex-wrap items-center gap-2 text-base text-mirai-text"
              >
                {committee.name}
                {committee.role !== "委員" && <RoleTag role={committee.role} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CouncilorDetailSection({ councilor }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href={routes.councilors()}
        className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-mirai-accent-text text-sm"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2.75} />
        議員一覧へ
      </Link>

      <header className="flex items-center gap-5 rounded-xl bg-card p-6 shadow-mirai-sm">
        <CouncilorAvatar id={councilor.id} name={councilor.name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-mirai-text-muted text-sm">
            {siteConfig.councilName}議員
          </p>
          <h1 className="font-heading font-bold text-3xl text-mirai-text leading-[1.28] md:text-[42px]">
            {councilor.name}
          </h1>
          <p className="text-mirai-text-muted text-sm">{councilor.nameKana}</p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-bold text-2xl text-mirai-text leading-[1.3] md:text-[32px]">
          この議員について
        </h2>
        <dl className="flex flex-col gap-3">
          <DetailItem label="会派等">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base text-mirai-text">
                {councilor.faction?.displayName ?? "会派なし"}
              </span>
              {councilor.factionRole && (
                <RoleTag role={councilor.factionRole} />
              )}
            </div>
            <ExternalSourceLink href={COUNCILOR_SOURCES.factions.url}>
              公式の{COUNCILOR_SOURCES.factions.label}
            </ExternalSourceLink>
          </DetailItem>

          <DetailItem label="所属委員会">
            <CommitteeGroups committees={councilor.committees} />
            <ExternalSourceLink href={COUNCILOR_SOURCES.committees.url}>
              公式の{COUNCILOR_SOURCES.committees.label}
            </ExternalSourceLink>
          </DetailItem>

          {councilor.terms && (
            <DetailItem label="当選回数">
              <p className="text-base text-mirai-text">{councilor.terms}期</p>
            </DetailItem>
          )}

          <DetailItem label="公式の情報">
            <ExternalSourceLink
              href={councilor.officialUrl ?? COUNCILOR_SOURCES.roster.url}
            >
              {siteConfig.councilName} {COUNCILOR_SOURCES.roster.label}
            </ExternalSourceLink>
            {councilor.websiteUrl && (
              <>
                <ExternalSourceLink href={councilor.websiteUrl}>
                  議員本人のウェブサイト
                </ExternalSourceLink>
                <p className="text-mirai-text-muted text-xs">
                  公式名簿に掲載されているURLです
                </p>
              </>
            )}
          </DetailItem>
        </dl>
      </section>

      <CouncilorSources />
    </div>
  );
}
