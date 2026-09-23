import "server-only";

import { siteConfig } from "@/config/site.config";
import { CouncilorListView } from "../../client/components/councilor-list-view";
import { COUNCIL_SEATS, COUNCILOR_SOURCES } from "../../shared/constants";
import type { Councilor } from "../../shared/types";
import { CouncilorSources } from "./councilor-sources";

type Props = {
  councilors: Councilor[];
};

export function CouncilorListSection({ councilors }: Props) {
  const factionCount = new Set(
    councilors.flatMap((c) => (c.faction ? [c.faction.id] : []))
  ).size;

  const stats = [
    { label: "掲載議員", value: `${councilors.length}人` },
    { label: "定数", value: `${COUNCIL_SEATS}人` },
    { label: "会派", value: `${factionCount}会派` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-display text-mirai-accent-text text-xs tracking-[0.1em]">
          COUNCILORS
        </p>
        <h1 className="font-heading font-bold text-3xl text-mirai-text leading-[1.28] md:text-[42px]">
          {siteConfig.councilName}議員
        </h1>
        <p className="text-base text-mirai-text leading-[1.9]">
          {siteConfig.councilName}
          の議員の所属会派と所属委員会をまとめています。
        </p>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 rounded-xl bg-card p-4 shadow-mirai-sm"
            >
              <dt className="text-mirai-text-muted text-xs">{stat.label}</dt>
              <dd className="font-bold text-2xl text-mirai-text">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-mirai-text-muted text-xs">
          {COUNCILOR_SOURCES.asOf}時点の公式名簿にもとづきます
        </p>
      </header>

      {councilors.length === 0 ? (
        <p className="py-12 text-center text-mirai-text-muted">
          議員情報はまだ掲載されていません
        </p>
      ) : (
        <CouncilorListView councilors={councilors} />
      )}

      <CouncilorSources />
    </div>
  );
}
