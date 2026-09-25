import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { QUESTION_SOURCES } from "../../shared/constants";
import type { Councilor } from "../../shared/types";
import { hasOnlyEarlierQuestions } from "../../shared/utils/councilor-questions";

type Props = {
  councilor: Councilor;
};

/**
 * 議員カード。カード全体が詳細へのリンクで、中にボタンは置かない。
 * 一覧では会派ごとの枠に入るので、会派名はカードに出さず会派内の役職だけ出す。
 */
export function CouncilorCard({ councilor }: Props) {
  const standing = councilor.committees.filter((c) => c.kind === "standing");
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
        <p className="font-heading font-bold text-lg text-mirai-text leading-[1.4]">
          {councilor.name}
        </p>
        <p className="text-mirai-text-muted text-xs">{councilor.nameKana}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {councilor.factionRole && (
            <span className="rounded-full bg-mirai-featured px-2.5 py-0.5 font-bold text-mirai-featured-text text-xs">
              {councilor.factionRole}
            </span>
          )}
          {councilor.terms && (
            <span className="text-mirai-text-muted text-xs">
              {councilor.terms}期
            </span>
          )}
          {councilor.questionsCount > 0 && (
            <span className="rounded-full bg-background px-2.5 py-0.5 font-bold text-mirai-text text-xs">
              質問 {councilor.questionsCount}件
            </span>
          )}
        </div>
        {onlyEarlier && (
          <p className="text-mirai-text-muted text-xs leading-relaxed">
            {QUESTION_SOURCES.scopeSessionsLabel}
            の代表質問・一般質問はなく、以前の定例会の質問を掲載
          </p>
        )}
        {standing.length > 0 && (
          <p className="text-mirai-text-muted text-xs leading-relaxed">
            {standing
              .map((c) =>
                c.role === "委員" ? c.name : `${c.name}（${c.role}）`
              )
              .join("、")}
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
