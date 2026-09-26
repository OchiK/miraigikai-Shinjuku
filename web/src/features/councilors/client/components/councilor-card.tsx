import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { QUESTION_SOURCES } from "../../shared/constants";
import type { CommitteeRole, Councilor } from "../../shared/types";
import { hasOnlyEarlierQuestions } from "../../shared/utils/councilor-questions";

type Props = {
  councilor: Councilor;
  locale?: PublicLocale;
  /** 委員会別表示のときに、その委員会での役職を渡す */
  committeeRole?: CommitteeRole;
};

/**
 * 議員カード。カード全体が詳細へのリンクで、中にボタンは置かない。
 * 会派別表示では会派ごとの枠に入るので、会派名は出さず会派内の役職と常任委員会を出す。
 * 委員会別表示（committeeRole あり）では枠に複数会派の議員が混ざるので会派名を出し、
 * 委員長・副委員長のときだけ役職バッジを出す。会派内役職と常任委員会の行は出さない。
 */
export function CouncilorCard({
  councilor,
  locale = "ja",
  committeeRole,
}: Props) {
  const { councilors: messages } = getUiMessages(locale);
  const byCommittee = committeeRole !== undefined;
  const standing = byCommittee
    ? []
    : councilor.committees.filter((c) => c.kind === "standing");
  const onlyEarlier = hasOnlyEarlierQuestions(
    councilor.latestQuestionDate,
    QUESTION_SOURCES.scopeStartDate
  );

  return (
    <Link
      href={routes.councilorDetail(councilor.id)}
      className="flex h-full min-h-11 items-center gap-3 rounded-xl bg-card p-4 shadow-mirai-sm transition-colors hover:bg-neutral-300"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          lang="ja"
          className="font-heading font-bold text-lg text-mirai-text leading-[1.4]"
        >
          {councilor.name}
        </p>
        <p lang="ja" className="text-mirai-text-muted text-xs">
          {councilor.nameKana}
        </p>
        {byCommittee && (
          <p className="text-mirai-text-secondary text-xs">
            {councilor.faction ? (
              <span lang="ja">{councilor.faction.displayName}</span>
            ) : (
              messages.unaffiliated
            )}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {byCommittee && committeeRole !== "委員" && (
            <span className="rounded-full bg-mirai-committee-role px-2.5 py-0.5 font-bold text-mirai-committee-role-text text-xs">
              {messages.committeeRoles[committeeRole]}
            </span>
          )}
          {!byCommittee && councilor.factionRole && (
            <span
              lang="ja"
              className="rounded-full bg-mirai-featured px-2.5 py-0.5 font-bold text-mirai-featured-text text-xs"
            >
              {councilor.factionRole}
            </span>
          )}
          {councilor.terms && (
            <span className="text-mirai-text-muted text-xs">
              {messages.terms(councilor.terms)}
            </span>
          )}
          {councilor.questionsCount > 0 && (
            <span className="rounded-full bg-background px-2.5 py-0.5 font-bold text-mirai-text text-xs">
              {messages.questions(councilor.questionsCount)}
            </span>
          )}
        </div>
        {onlyEarlier && (
          <p className="text-mirai-text-muted text-xs leading-relaxed">
            {messages.onlyEarlierNotice}
          </p>
        )}
        {standing.length > 0 && (
          <p className="text-mirai-text-muted text-xs leading-relaxed">
            {standing.map((c, index) => (
              <Fragment key={c.id}>
                {index > 0 && messages.listSeparator}
                <span lang="ja">{c.name}</span>
                {c.role !== "委員" &&
                  `${messages.roleParen.before}${messages.committeeRoles[c.role]}${messages.roleParen.after}`}
              </Fragment>
            ))}
          </p>
        )}
      </div>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-mirai-text-muted"
        strokeWidth={2.75}
      />
    </Link>
  );
}
