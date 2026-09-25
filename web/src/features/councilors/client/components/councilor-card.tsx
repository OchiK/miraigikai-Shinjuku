import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { Councilor } from "../../shared/types";
import { CouncilorAvatar } from "./councilor-avatar";

type Props = {
  councilor: Councilor;
};

/**
 * 議員カード。カード全体が詳細へのリンクで、中にボタンは置かない。
 */
export function CouncilorCard({ councilor }: Props) {
  const standing = councilor.committees.filter((c) => c.kind === "standing");

  return (
    <Link
      href={routes.councilorDetail(councilor.id)}
      className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-mirai-sm transition-colors hover:bg-neutral-300"
    >
      <CouncilorAvatar id={councilor.id} name={councilor.name} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-heading font-bold text-mirai-text text-xl leading-[1.5]">
          {councilor.name}
        </p>
        <p className="text-mirai-text-muted text-xs">{councilor.nameKana}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {councilor.faction && (
            <span className="rounded-full bg-mirai-tag px-3 py-0.5 text-mirai-tag-text text-xs">
              {councilor.faction.displayName}
            </span>
          )}
          {councilor.terms && (
            <span className="text-mirai-text-muted text-xs">
              {councilor.terms}期
            </span>
          )}
          {councilor.questionsCount > 0 && (
            <span className="rounded-full bg-background px-3 py-0.5 font-bold text-mirai-text text-xs">
              質問 {councilor.questionsCount}件
            </span>
          )}
        </div>
        {standing.length > 0 && (
          <p className="text-mirai-text-muted text-xs leading-[1.75]">
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
