"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import type { Councilor } from "../../shared/types";
import { getFactionAnchorId } from "../../shared/utils/faction-anchor";
import {
  filterCouncilors,
  groupCouncilorsByFaction,
} from "../../shared/utils/filter-councilors";
import { CouncilorCard } from "./councilor-card";

type Props = {
  councilors: Councilor[];
  locale?: PublicLocale;
};

const chipClass = (active: boolean) =>
  `h-11 rounded-full px-4 py-1.5 font-bold text-xs transition-colors ${
    active
      ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
      : "bg-neutral-200 text-mirai-text-muted hover:bg-neutral-300 hover:text-mirai-text-muted"
  }`;

/**
 * 議員一覧。会派の絞り込みと氏名・ふりがな検索ができる。
 * 会派ごとに面を分けて見出しを立て、会派内は議席番号順に並べる。
 */
export function CouncilorListView({ councilors, locale = "ja" }: Props) {
  const { councilors: messages } = getUiMessages(locale);
  const searchId = useId();
  const [factionId, setFactionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const factionGroups = useMemo(
    () => groupCouncilorsByFaction(councilors),
    [councilors]
  );
  const visibleGroups = useMemo(
    () =>
      groupCouncilorsByFaction(
        filterCouncilors(councilors, { factionId, query })
      ),
    [councilors, factionId, query]
  );
  const visibleCount = visibleGroups.reduce(
    (sum, g) => sum + g.councilors.length,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {messages.searchLabel}
        </label>
        <Search
          aria-hidden="true"
          className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 size-4 text-mirai-text-muted"
          strokeWidth={2.75}
        />
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={messages.searchLabel}
          className="h-11 rounded-full border-0 bg-card pl-11 text-base shadow-mirai-sm md:text-base"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold text-mirai-text text-sm">
          {messages.filterLegend}
        </legend>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            aria-pressed={factionId === null}
            onClick={() => setFactionId(null)}
            className={chipClass(factionId === null)}
          >
            {messages.filterAll(councilors.length)}
          </Button>
          {factionGroups.map(
            ({ faction, councilors: members }) =>
              faction && (
                <Button
                  key={faction.id}
                  variant="ghost"
                  aria-pressed={factionId === faction.id}
                  onClick={() => setFactionId(faction.id)}
                  className={chipClass(factionId === faction.id)}
                >
                  <span lang="ja">{faction.displayName}</span> {members.length}
                </Button>
              )
          )}
        </div>
      </fieldset>

      <p aria-live="polite" className="text-mirai-text-muted text-sm">
        {messages.showing(visibleCount)}
      </p>

      {visibleCount === 0 ? (
        <p className="py-12 text-center text-mirai-text-muted">
          {messages.noResults}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {visibleGroups.map(({ faction, councilors: members }) => (
            <section
              key={faction?.id ?? "unaffiliated"}
              // 議案詳細の会派賛否から #faction-{slug} で着地する。固定ヘッダーに潜らないよう余白を取る
              id={getFactionAnchorId(faction?.slug ?? null)}
              className="flex scroll-mt-28 flex-col gap-4 rounded-xl bg-mirai-surface-sunken p-5 shadow-mirai-sm md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading font-bold text-mirai-text text-xl leading-[1.3] md:text-2xl">
                  {faction ? (
                    <span lang="ja">{faction.displayName}</span>
                  ) : (
                    messages.unaffiliated
                  )}
                </h2>
                <span className="rounded-full bg-card px-3 py-1 font-bold text-mirai-text text-xs shadow-mirai-sm">
                  {messages.memberCount(members.length)}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {members.map((councilor) => (
                  <li key={councilor.id} className="h-full">
                    <CouncilorCard councilor={councilor} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
