import "server-only";

import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
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
  VENUE_LABELS,
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

function QuestionCountBadges({
  total,
  venueCounts,
}: {
  total: number;
  venueCounts: QuestionVenueCounts;
}) {
  const venues = VENUE_TYPES.filter((venue) => venueCounts[venue] > 0).map(
    (venue) => ({ label: VENUE_LABELS[venue], count: venueCounts[venue] })
  );

  return (
    <ul className="flex flex-wrap gap-2 text-xs" aria-label="掲載中の質問">
      <li className="rounded-full bg-background px-3 py-0.5 font-bold text-mirai-text">
        質問 {total}件
      </li>
      {venues.map((venue) => (
        <li
          key={venue.label}
          className="rounded-full bg-background px-3 py-0.5 text-mirai-text-muted"
        >
          {venue.label} {venue.count}件
        </li>
      ))}
    </ul>
  );
}

function TopicSummary({
  questions,
  earlierSessionName,
}: {
  questions: CouncilorQuestion[];
  /** 以前の定例会の質問を載せているとき、その会期名 */
  earlierSessionName: string | null;
}) {
  const summary = summarizeCouncilorTopics(questions);
  const text = buildTopicSummaryText(summary);

  // 質問0件のときは呼び出し側で項目ごと出さない。ここで null なのはタグが1つもない場合
  if (!text) {
    return (
      <p className="text-base text-mirai-text">テーマタグはまだありません</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2" aria-label="主なテーマ">
        {summary.topTags.map(({ tag, count }) => (
          <li
            key={tag}
            className="rounded-full bg-background px-3 py-1 text-mirai-text text-sm"
          >
            {tag}
            <span className="ml-1 text-mirai-text-muted text-xs">
              {count}件
            </span>
          </li>
        ))}
      </ul>
      <p className="text-base text-mirai-text leading-[1.9]">{text}</p>
      <p className="text-mirai-text-muted text-xs leading-[1.9]">
        このサイトで公開中の質問{summary.questionCount}件
        {earlierSessionName && `（${earlierSessionName}の質問）`}
        に付けたテーマタグを数えたものです（{QUESTION_SOURCES.asOf}
        時点）。タグはAIが付けたもので、議員の関心のすべてを表すものではありません。
      </p>
    </div>
  );
}

/**
 * 令和8年の質問がなく、以前の定例会の質問を載せている議員への注記
 */
function EarlierSessionsNotice({ sessionName }: { sessionName: string }) {
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
        {QUESTION_SOURCES.scopeSessionsLabel}
        の本会議では、この議員の代表質問・一般質問はありません。それ以前で最も新しい
        {sessionName}
        の質問を掲載しています。
      </p>
    </div>
  );
}

export function CouncilorDetailSection({ councilor, activeSession }: Props) {
  const earlierNoticeSession = getEarlierSessionNoticeName(
    councilor.latestQuestionDate,
    councilor.questions,
    QUESTION_SOURCES.scopeStartDate
  );

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={routes.councilors()}
        className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-mirai-accent-text text-sm"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2.75} />
        議員一覧へ
      </Link>

      <header className="flex flex-col gap-1 rounded-xl bg-card p-6 shadow-mirai-sm">
        <p className="text-mirai-text-muted text-sm">
          {siteConfig.councilName}議員
        </p>
        <h1 className="font-heading font-bold text-3xl text-mirai-text leading-[1.28] md:text-[42px]">
          {councilor.name}
        </h1>
        <p className="text-mirai-text-muted text-sm">{councilor.nameKana}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="rounded-full bg-mirai-tag px-3 py-0.5 text-mirai-tag-text text-xs">
            {councilor.faction?.displayName ?? "会派なし"}
          </span>
          {councilor.questionsCount > 0 && (
            <QuestionCountBadges
              total={councilor.questionsCount}
              venueCounts={councilor.questionVenueCounts}
            />
          )}
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

          {activeSession && (
            <DetailItem label="審議している議案">
              <p className="text-base text-mirai-text leading-[1.9]">
                議案は本会議で採決され、各会派が賛否を示します。
              </p>
              <Link
                href={routes.sessionBills(activeSession.slug)}
                className="inline-flex min-h-11 w-fit items-center gap-1 font-bold text-mirai-accent-text text-sm underline-offset-4 hover:underline"
              >
                {activeSession.name}の議案一覧を見る
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0"
                  strokeWidth={2.75}
                />
              </Link>
            </DetailItem>
          )}

          <DetailItem label="所属委員会">
            <CommitteeGroups committees={councilor.committees} />
            <ExternalSourceLink href={COUNCILOR_SOURCES.committees.url}>
              公式の{COUNCILOR_SOURCES.committees.label}
            </ExternalSourceLink>
          </DetailItem>

          {councilor.questions.length > 0 && (
            <DetailItem label="掲載中の質問からの傾向">
              <TopicSummary
                questions={councilor.questions}
                earlierSessionName={earlierNoticeSession}
              />
            </DetailItem>
          )}

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
            {councilor.xUrl && (
              <>
                <ExternalSourceLink href={councilor.xUrl}>
                  議員本人のX（旧Twitter）
                </ExternalSourceLink>
                <p className="text-mirai-text-muted text-xs">
                  {COUNCILOR_SOURCES.xAccounts.rule}です
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
          掲載中の質問
        </h2>
        <p className="text-mirai-text-muted text-sm leading-[1.9]">
          {QUESTION_SOURCES.scope}
          での質問を、論点ごとに新しい順で掲載しています。
          {!earlierNoticeSession && QUESTION_SOURCES.earlierSessionsRule}
          要約はAIが会議録の質問部分をもとに作成したもので、答弁の内容は含みません。正確な内容は会議録をご確認ください。
        </p>
        {earlierNoticeSession && (
          <EarlierSessionsNotice sessionName={earlierNoticeSession} />
        )}
        {councilor.questions.length === 0 ? (
          <p className="rounded-xl bg-card p-5 text-base text-mirai-text shadow-mirai-sm">
            質問はまだ登録されていません
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {councilor.questions.map((question) => (
              <li key={question.id}>
                <CouncilorQuestionCard question={question} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <CouncilorSources />
    </div>
  );
}
