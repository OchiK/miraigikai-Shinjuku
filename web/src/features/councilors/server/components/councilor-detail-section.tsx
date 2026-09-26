import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ArrowLeft, ChevronRight, Info, Languages } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AroundJapanese } from "@/features/i18n/client/components/around-japanese";
import {
  getUiMessages,
  type UiMessages,
} from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { COUNCILOR_SOURCES, QUESTION_SOURCES } from "../../shared/constants";
import type {
  CouncilorCommittee,
  CouncilorDetail,
  CouncilorQuestion,
  QuestionVenueCounts,
} from "../../shared/types";
import { groupCommitteesByKind } from "../../shared/utils/committee-kind";
import {
  getEarlierSessionNoticeName,
  VENUE_TYPES,
} from "../../shared/utils/councilor-questions";
import {
  buildTopicSummaryText,
  summarizeCouncilorTopics,
} from "../../shared/utils/summarize-councilor-topics";
import { CouncilorQuestionCard } from "./councilor-question-card";
import { CouncilorSources, ExternalSourceLink } from "./councilor-sources";

type Props = {
  councilor: CouncilorDetail;
  /** 開催中（最新）の定例会。議案一覧ページを持つときだけ渡す */
  activeSession?: { name: string; slug: string } | null;
  locale?: PublicLocale;
};

type DetailMessages = UiMessages["councilorDetail"];

/** 役職タグ。会派内の役職は DB のまま日本語なので lang を渡す */
function RoleTag({ role, lang }: { role: string; lang?: "ja" }) {
  return (
    <span
      lang={lang}
      className="rounded-full bg-mirai-featured px-3 py-0.5 font-bold text-mirai-featured-text text-xs"
    >
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

function CommitteeGroups({
  committees,
  messages,
  roles,
}: {
  committees: CouncilorCommittee[];
  messages: DetailMessages;
  roles: UiMessages["councilors"]["committeeRoles"];
}) {
  const groups = groupCommitteesByKind(committees);

  if (groups.length === 0) {
    return <p className="text-base text-mirai-text">{messages.noCommittees}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.kind} className="flex flex-col gap-1">
          <p className="text-mirai-text-muted text-xs">
            {messages.committeeKinds[group.kind]}
          </p>
          <ul className="flex flex-col gap-1">
            {group.committees.map((committee) => (
              <li
                key={committee.id}
                className="flex flex-wrap items-center gap-2 text-base text-mirai-text"
              >
                <span lang="ja">{committee.name}</span>
                {committee.role !== "委員" && (
                  <RoleTag role={roles[committee.role]} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function QuestionCountBadges({
  total,
  venueCounts,
  messages,
  questionsLabel,
}: {
  total: number;
  venueCounts: QuestionVenueCounts;
  messages: DetailMessages;
  questionsLabel: (count: number) => string;
}) {
  const venues = VENUE_TYPES.filter((venue) => venueCounts[venue] > 0).map(
    (venue) => ({
      label: messages.venueLabels[venue],
      count: venueCounts[venue],
    })
  );

  return (
    <ul
      className="flex flex-wrap gap-2 text-xs"
      aria-label={messages.questionCountsLabel}
    >
      <li className="rounded-full bg-background px-3 py-0.5 font-bold text-mirai-text">
        {questionsLabel(total)}
      </li>
      {venues.map((venue) => (
        <li
          key={venue.label}
          className="rounded-full bg-background px-3 py-0.5 text-mirai-text-muted"
        >
          {venue.label} {messages.venueCount(venue.count)}
        </li>
      ))}
    </ul>
  );
}

function TopicSummary({
  questions,
  earlierSessionName,
  messages,
  showSummaryText,
}: {
  questions: CouncilorQuestion[];
  /** 以前の定例会の質問を載せているとき、その会期名 */
  earlierSessionName: string | null;
  messages: DetailMessages;
  /**
   * タグ集計の1文を出すか。文中にタグ名（日本語）を埋め込むため日本語表示だけで出す。
   * 英語表示ではタグと件数の一覧が同じ情報を示す
   */
  showSummaryText: boolean;
}) {
  const summary = summarizeCouncilorTopics(questions);
  const text = buildTopicSummaryText(summary);

  // 質問0件のときは呼び出し側で項目ごと出さない。ここで null なのはタグが1つもない場合
  if (!text) {
    return <p className="text-base text-mirai-text">{messages.noTopicTags}</p>;
  }

  const note = messages.topicsNote(summary.questionCount);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2" aria-label={messages.topicTagsLabel}>
        {summary.topTags.map(({ tag, count }) => (
          <li
            key={tag}
            className="rounded-full bg-background px-3 py-1 text-mirai-text text-sm"
          >
            <span lang="ja">{tag}</span>
            <span className="ml-1 text-mirai-text-muted text-xs">
              {messages.topicTagCount(count)}
            </span>
          </li>
        ))}
      </ul>
      {showSummaryText && (
        <p className="text-base text-mirai-text leading-[1.9]">{text}</p>
      )}
      <p className="text-mirai-text-muted text-xs leading-[1.9]">
        {note.before}
        {earlierSessionName && (
          <AroundJapanese around={note.session}>
            {earlierSessionName}
          </AroundJapanese>
        )}
        {note.after}
      </p>
    </div>
  );
}

/**
 * 令和8年の質問がなく、以前の定例会の質問を載せている議員への注記
 */
function EarlierSessionsNotice({
  sessionName,
  messages,
}: {
  sessionName: string;
  messages: DetailMessages;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl bg-mirai-surface-sunken px-5 py-4 text-mirai-text"
      role="note"
    >
      <Info
        aria-hidden="true"
        className="mt-1 size-4 shrink-0"
        strokeWidth={2.75}
      />
      <p className="text-sm leading-[1.9]">
        <AroundJapanese around={messages.earlierNotice}>
          {sessionName}
        </AroundJapanese>
      </p>
    </div>
  );
}

export function CouncilorDetailSection({
  councilor,
  activeSession,
  locale = "ja",
}: Props) {
  const {
    councilorDetail: messages,
    councilors: listMessages,
    councilorSources,
  } = getUiMessages(locale);
  const factionName = councilor.faction ? (
    <span lang="ja">{councilor.faction.displayName}</span>
  ) : (
    listMessages.unaffiliated
  );
  const earlierNoticeSession = getEarlierSessionNoticeName(
    councilor.latestQuestionDate,
    councilor.questions,
    QUESTION_SOURCES.scopeStartDate
  );

  return (
    <div lang={locale} className="flex flex-col gap-8">
      <Link
        href={routes.councilors()}
        className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-mirai-accent-text text-sm"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2.75} />
        {messages.backToList}
      </Link>

      <header className="flex flex-col gap-1 rounded-xl bg-card p-6 shadow-mirai-sm">
        <p className="text-mirai-text-muted text-sm">{messages.memberTitle}</p>
        <h1
          lang="ja"
          className="font-heading font-bold text-3xl text-mirai-text leading-[1.28] md:text-[42px]"
        >
          {councilor.name}
        </h1>
        <p lang="ja" className="text-mirai-text-muted text-sm">
          {councilor.nameKana}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="rounded-full bg-mirai-tag px-3 py-0.5 text-mirai-tag-text text-xs">
            {factionName}
          </span>
          {councilor.questionsCount > 0 && (
            <QuestionCountBadges
              total={councilor.questionsCount}
              venueCounts={councilor.questionVenueCounts}
              messages={messages}
              questionsLabel={listMessages.questions}
            />
          )}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-bold text-2xl text-mirai-text leading-[1.3] md:text-[32px]">
          {messages.aboutHeading}
        </h2>
        <dl className="flex flex-col gap-3">
          <DetailItem label={messages.labels.faction}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base text-mirai-text">{factionName}</span>
              {councilor.factionRole && (
                <RoleTag role={councilor.factionRole} lang="ja" />
              )}
            </div>
            <ExternalSourceLink
              href={COUNCILOR_SOURCES.factions.url}
              locale={locale}
            >
              {messages.officialFactionsLink}
            </ExternalSourceLink>
          </DetailItem>

          {activeSession && (
            <DetailItem label={messages.labels.bills}>
              <p className="text-base text-mirai-text leading-[1.9]">
                {messages.billsLead}
              </p>
              <Link
                href={routes.sessionBills(activeSession.slug)}
                className="inline-flex min-h-11 w-fit items-center gap-1 font-bold text-mirai-accent-text text-sm underline-offset-4 hover:underline"
              >
                <span>
                  <AroundJapanese around={messages.viewSessionBills}>
                    {activeSession.name}
                  </AroundJapanese>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0"
                  strokeWidth={2.75}
                />
              </Link>
            </DetailItem>
          )}

          <DetailItem label={messages.labels.committees}>
            <CommitteeGroups
              committees={councilor.committees}
              messages={messages}
              roles={listMessages.committeeRoles}
            />
            <ExternalSourceLink
              href={COUNCILOR_SOURCES.committees.url}
              locale={locale}
            >
              {messages.officialCommitteesLink}
            </ExternalSourceLink>
          </DetailItem>

          {councilor.questions.length > 0 && (
            <DetailItem label={messages.labels.topics}>
              <TopicSummary
                questions={councilor.questions}
                earlierSessionName={earlierNoticeSession}
                messages={messages}
                showSummaryText={locale === "ja"}
              />
            </DetailItem>
          )}

          {councilor.terms && (
            <DetailItem label={messages.labels.terms}>
              <p className="text-base text-mirai-text">
                {listMessages.terms(councilor.terms)}
              </p>
            </DetailItem>
          )}

          <DetailItem label={messages.labels.officialInfo}>
            <ExternalSourceLink
              href={councilor.officialUrl ?? COUNCILOR_SOURCES.roster.url}
              locale={locale}
            >
              {councilorSources.linkLabels.roster}
            </ExternalSourceLink>
            {councilor.websiteUrl && (
              <>
                <ExternalSourceLink href={councilor.websiteUrl} locale={locale}>
                  {messages.websiteLink}
                </ExternalSourceLink>
                <p className="text-mirai-text-muted text-xs">
                  {messages.websiteNote}
                </p>
              </>
            )}
            {councilor.xUrl && (
              <>
                <ExternalSourceLink href={councilor.xUrl} locale={locale}>
                  {messages.xLink}
                </ExternalSourceLink>
                <p className="text-mirai-text-muted text-xs">
                  {messages.xNote}
                </p>
              </>
            )}
          </DetailItem>
        </dl>
      </section>

      <section
        aria-labelledby="councilor-questions-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="councilor-questions-heading"
          className="font-heading font-bold text-2xl text-mirai-text leading-[1.3] md:text-[32px]"
        >
          {messages.questionsHeading}
        </h2>
        <p className="text-mirai-text-muted text-sm leading-[1.9]">
          {messages.questionsLead}
          {!earlierNoticeSession && messages.earlierSessionsRule}
          {messages.questionsTail}
        </p>
        {earlierNoticeSession && (
          <EarlierSessionsNotice
            sessionName={earlierNoticeSession}
            messages={messages}
          />
        )}
        {councilor.questions.length > 0 &&
          messages.questionsInJapaneseNotice && (
            <p className="flex items-start gap-3 rounded-xl bg-terracotta-200 px-5 py-4 text-mirai-ai-text text-sm leading-[1.9]">
              <Languages
                aria-hidden="true"
                className="mt-1 size-5 shrink-0"
                strokeWidth={2.75}
              />
              <span>{messages.questionsInJapaneseNotice}</span>
            </p>
          )}
        {councilor.questions.length === 0 ? (
          <p className="rounded-xl bg-card p-5 text-base text-mirai-text shadow-mirai-sm">
            {messages.noQuestions}
          </p>
        ) : (
          // 質問の見出し・要約・カード内の表記は DB のまま日本語（議案詳細と同じ扱い）
          <ol lang="ja" className="flex flex-col gap-4">
            {councilor.questions.map((question) => (
              <li key={question.id}>
                <CouncilorQuestionCard question={question} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <CouncilorSources locale={locale} />
    </div>
  );
}
