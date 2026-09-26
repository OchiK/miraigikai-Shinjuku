import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { CouncilorListView } from "../../client/components/councilor-list-view";
import { COUNCIL_SEATS } from "../../shared/constants";
import type { Councilor } from "../../shared/types";
import { CouncilorSources } from "./councilor-sources";

type Props = {
  councilors: Councilor[];
  locale?: PublicLocale;
};

export function CouncilorListSection({ councilors, locale = "ja" }: Props) {
  const { councilors: messages } = getUiMessages(locale);

  const factionCount = new Set(
    councilors.flatMap((c) => (c.faction ? [c.faction.id] : []))
  ).size;

  const questionCount = councilors.reduce(
    (sum, c) => sum + c.questionsCount,
    0
  );

  const stats = [
    {
      label: messages.stats.listed,
      value: messages.personCount(councilors.length),
    },
    { label: messages.stats.seats, value: messages.personCount(COUNCIL_SEATS) },
    { label: messages.stats.groups, value: messages.groupCount(factionCount) },
    {
      label: messages.stats.questions,
      value: messages.questionCount(questionCount),
    },
  ];

  return (
    <div lang={locale} className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-display text-mirai-accent-text text-xs tracking-[0.1em]">
          COUNCILORS
        </p>
        <h1 className="font-heading font-bold text-3xl text-mirai-text leading-[1.28] md:text-[42px]">
          {messages.heading}
        </h1>
        <p className="text-base text-mirai-text leading-[1.9]">
          {messages.lead}
        </p>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
        <p className="text-mirai-text-muted text-xs leading-[1.9]">
          {messages.sourceNotice}
        </p>
      </header>

      {councilors.length === 0 ? (
        <p className="py-12 text-center text-mirai-text-muted">
          {messages.emptyNotice}
        </p>
      ) : (
        <CouncilorListView councilors={councilors} locale={locale} />
      )}

      <CouncilorSources locale={locale} />
    </div>
  );
}
