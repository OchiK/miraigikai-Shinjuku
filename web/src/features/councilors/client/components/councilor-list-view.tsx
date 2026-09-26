"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import type { Councilor } from "../../shared/types";
import {
  countCommitteeView,
  filterCommitteeGroups,
  filterCouncilors,
  groupCouncilorsByCommittee,
  groupCouncilorsByFaction,
} from "../../shared/utils/filter-councilors";
import { CommitteeListSections } from "./committee-list-sections";
import { FactionListSections } from "./faction-list-sections";
import { FilterChipGroup } from "./filter-chip-group";

type ViewMode = "faction" | "committee";

type Props = {
  councilors: Councilor[];
  locale?: PublicLocale;
};

/**
 * 議員一覧。会派別と委員会別を切り替えられ、氏名・ふりがな検索は両方で共有する。
 * 絞り込みは表示ごとに持ち、会派別の会派フィルタは委員会別には効かせない。
 * 会派別は会派内を議席番号順、委員会別は委員長 → 副委員長 → 委員の順に並べる。
 */
export function CouncilorListView({ councilors, locale = "ja" }: Props) {
  const { councilors: messages } = getUiMessages(locale);
  const searchId = useId();
  const [viewMode, setViewMode] = useState<ViewMode>("faction");
  const [factionId, setFactionId] = useState<string | null>(null);
  const [committeeId, setCommitteeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const factionGroups = useMemo(
    () => groupCouncilorsByFaction(councilors),
    [councilors]
  );
  const visibleFactionGroups = useMemo(
    () =>
      groupCouncilorsByFaction(
        filterCouncilors(councilors, { factionId, query })
      ),
    [councilors, factionId, query]
  );
  const factionCount = visibleFactionGroups.reduce(
    (sum, g) => sum + g.councilors.length,
    0
  );

  const committeeGroups = useMemo(
    () => groupCouncilorsByCommittee(councilors),
    [councilors]
  );
  const visibleCommitteeGroups = useMemo(
    () =>
      filterCommitteeGroups(
        groupCouncilorsByCommittee(
          filterCouncilors(councilors, { factionId: null, query })
        ),
        committeeId
      ),
    [councilors, committeeId, query]
  );
  const committeeCount = countCommitteeView(visibleCommitteeGroups);

  const byCommittee = viewMode === "committee";
  const isEmpty = byCommittee
    ? committeeCount.people === 0
    : factionCount === 0;

  const renderResults = () => {
    if (isEmpty) {
      return (
        <p className="py-12 text-center text-mirai-text-muted">
          {messages.noResults}
        </p>
      );
    }
    return byCommittee ? (
      <CommitteeListSections groups={visibleCommitteeGroups} locale={locale} />
    ) : (
      <FactionListSections groups={visibleFactionGroups} locale={locale} />
    );
  };

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

      <FilterChipGroup<ViewMode>
        legend={messages.viewMode.legend}
        options={[
          { value: "faction", label: messages.viewMode.byFaction },
          { value: "committee", label: messages.viewMode.byCommittee },
        ]}
        selected={viewMode}
        onSelect={setViewMode}
      />

      {byCommittee ? (
        <FilterChipGroup
          legend={messages.committeeFilterLegend}
          options={[
            {
              value: null,
              // 延べ人数ではなく、委員会に所属する議員を重複なしで数える
              label: messages.filterAll(
                countCommitteeView(committeeGroups).people
              ),
            },
            ...committeeGroups.map(({ committee, members }) => ({
              value: committee.id,
              label: (
                <>
                  <span lang="ja">{committee.name}</span> {members.length}
                </>
              ),
            })),
          ]}
          selected={committeeId}
          onSelect={setCommitteeId}
        />
      ) : (
        <FilterChipGroup
          legend={messages.filterLegend}
          options={[
            { value: null, label: messages.filterAll(councilors.length) },
            ...factionGroups.flatMap(({ faction, councilors: members }) =>
              faction
                ? [
                    {
                      value: faction.id,
                      label: (
                        <>
                          <span lang="ja">{faction.displayName}</span>{" "}
                          {members.length}
                        </>
                      ),
                    },
                  ]
                : []
            ),
          ]}
          selected={factionId}
          onSelect={setFactionId}
        />
      )}

      <p aria-live="polite" className="text-mirai-text-muted text-sm">
        {byCommittee
          ? messages.showingByCommittee(
              committeeCount.committees,
              committeeCount.people
            )
          : messages.showing(factionCount)}
      </p>

      {renderResults()}
    </div>
  );
}
