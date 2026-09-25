import type { FactionStanceSource } from "@mirai-gikai/shared/bills/faction-stance-sources";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getFactionCouncilorsHref } from "@/features/councilors/shared/utils/faction-anchor";
import {
  getUiMessages,
  type UiMessages,
} from "@/features/i18n/shared/ui-messages";
import { cn } from "@/lib/utils";
import type {
  BillStatusEnum,
  FactionStance,
  StanceTypeEnum,
} from "../../../shared/types";
import { hasFinalVoteResult } from "../../../shared/utils/bill-vote-status";
import {
  getRenamedFactionNameAtVote,
  hasSourcedStance,
} from "../../../shared/utils/faction-name-at-vote";
import {
  describeVoteSplit,
  summarizeFactionVotes,
} from "../../../shared/utils/summarize-faction-votes";

/**
 * 会派別の賛否バッジの配色。
 *
 * 反対に赤を使わない（デザインシステム定義 §9）。反対は異常ではない。
 * 赤の `--color-status-rejected` は議案そのものが否決されたステータスにのみ使う。
 * 色だけで判別させないため、必ず賛否の文字列（ui-messages の stanceLabels）と併記する。
 */
function getStanceBadgeStyle(type: StanceTypeEnum) {
  switch (type) {
    case "for":
    case "conditional_for":
      return {
        bg: "bg-mirai-vote-for-bg",
        textColor: "text-mirai-vote-for-text",
      };
    case "against":
    case "conditional_against":
      return {
        bg: "bg-mirai-vote-against-bg",
        textColor: "text-mirai-vote-against-text",
      };
    default:
      return {
        bg: "bg-mirai-tag",
        textColor: "text-mirai-tag-text",
      };
  }
}

/**
 * 議決結果の賛否バー（デザインシステム定義 §9-6）。
 *
 * 賛成は sage-500、反対は neutral-300。反対は異常ではないので赤を使わない。
 * 色だけで判別させないため、バーの下に「賛成◯会派・反対◯会派」（全会一致なら
 * 「全会派が賛成（◯会派）」）を必ず併記する。分かれたときは少ない側の会派名も添える。
 */
type Messages = UiMessages["factionStances"];

function FactionVoteBar({
  stances,
  messages,
}: {
  stances: FactionStance[];
  messages: Messages;
}) {
  const summary = summarizeFactionVotes(stances);
  const split = describeVoteSplit(
    stances.map((s) => ({
      stance: s.stance,
      factionName: s.faction.display_name,
    }))
  );

  if (summary.total === 0) {
    return null;
  }

  // 少ない側の件数に、その会派名を添える（8行の一覧を読まずに誰が反対したかわかる）。
  // 名前は下の一覧のリンクと同じ現在の会派名にする。採決時の名前は一覧の行に出る
  const minorityNames = (bucket: "for" | "against") =>
    split.kind === "split" && split.minority?.bucket === bucket ? (
      <span className="text-mirai-text-muted">
        {messages.minorityNames.before}
        <span lang="ja">
          {split.minority.factionNames.join(messages.minorityNames.separator)}
        </span>
        {messages.minorityNames.after}
      </span>
    ) : null;

  return (
    <div className="rounded-xl bg-card p-6 shadow-mirai-sm">
      {/* 3区分で幅を埋め切るので、空のトラックが反対と紛れることがない。
          数値は下の dl に出すため、バー自体は読み上げから外す。 */}
      <div
        aria-hidden="true"
        className="flex h-3 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-mirai-vote-for"
          style={{ width: `${summary.forRatio}%` }}
        />
        <div
          className="bg-mirai-vote-against"
          style={{ width: `${summary.againstRatio}%` }}
        />
        <div
          className="bg-neutral-500"
          style={{ width: `${summary.otherRatio}%` }}
        />
      </div>

      {split.kind === "unanimous" && split.bucket !== "other" ? (
        // 全会一致は「賛成8会派・反対0会派」より一文のほうが読み取りやすい
        <p
          className={cn(
            "mt-4 font-bold text-sm",
            split.bucket === "for"
              ? "text-mirai-vote-for-text"
              : "text-mirai-vote-against-text"
          )}
        >
          {split.bucket === "for"
            ? messages.unanimousFor(split.count)
            : messages.unanimousAgainst(split.count)}
        </p>
      ) : (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="shrink-0 font-bold text-mirai-vote-for-text">
              {messages.stanceLabels.for}
            </dt>
            <dd className="text-mirai-text">
              {messages.factionCount(summary.for)}
              {minorityNames("for")}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="shrink-0 font-bold text-mirai-vote-against-text">
              {messages.stanceLabels.against}
            </dt>
            <dd className="text-mirai-text">
              {messages.factionCount(summary.against)}
              {minorityNames("against")}
            </dd>
          </div>
          {summary.other > 0 && (
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 font-bold text-mirai-text-muted">
                {messages.otherLabel}
              </dt>
              <dd className="text-mirai-text">
                {messages.factionCount(summary.other)}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

type FactionStanceRowProps = {
  stance: FactionStance;
  messages: Messages;
};

function FactionStanceRow({ stance, messages }: FactionStanceRowProps) {
  const style = getStanceBadgeStyle(stance.stance);
  const nameAtVote = getRenamedFactionNameAtVote(stance);

  return (
    <div className="flex flex-col gap-2 border-mirai-border border-b py-4 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          {/* 会派名から、議員一覧のその会派のセクションへ移る */}
          <Link
            href={getFactionCouncilorsHref(stance.faction.name)}
            aria-label={messages.councilorsOf(stance.faction.display_name)}
            className="inline-flex min-h-11 items-center gap-1 rounded-full font-semibold text-base text-mirai-accent-text underline-offset-4 hover:underline focus-visible:underline"
          >
            {/* 会派名は DB のまま日本語。英語表示でも日本語として読ませる */}
            <span lang="ja">{stance.faction.display_name}</span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0"
              strokeWidth={2.75}
            />
          </Link>
          {nameAtVote && (
            <span className="text-mirai-text-muted text-xs">
              {messages.nameAtVote.before}
              <span lang="ja">{nameAtVote}</span>
              {messages.nameAtVote.after}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-4 py-1.5 font-bold text-sm ${style.bg} ${style.textColor}`}
        >
          {messages.stanceLabels[stance.stance]}
        </span>
      </div>
      {stance.comment && (
        <p
          lang="ja"
          className="whitespace-pre-wrap text-mirai-text-secondary text-sm leading-relaxed"
        >
          {stance.comment}
        </p>
      )}
    </div>
  );
}

interface FactionStanceCardProps {
  stances: FactionStance[];
  billStatus?: BillStatusEnum;
  /** 賛否の出典。出典の無い会期では出さない */
  source?: FactionStanceSource | null;
  /** UI 文言の言語。会派名は DB のまま日本語で出す */
  locale?: PublicLocale;
}

export function FactionStanceCard({
  stances,
  billStatus,
  source,
  locale = "ja",
}: FactionStanceCardProps) {
  const messages = getUiMessages(locale).factionStances;
  const isPreparing = billStatus === "preparing";
  const isVoteFinal = hasFinalVoteResult(billStatus);

  if (!isPreparing && stances.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="bill-vote-result-heading" lang={locale}>
      <h2
        className="mb-4 font-bold font-heading text-mirai-text text-xl"
        id="bill-vote-result-heading"
      >
        {isVoteFinal ? messages.headingFinal : messages.headingPending}
      </h2>

      <div className="flex flex-col gap-4">
        {isVoteFinal && (
          <FactionVoteBar stances={stances} messages={messages} />
        )}

        <div className="rounded-xl bg-card px-6 py-2 shadow-mirai-sm">
          {isPreparing && stances.length === 0 ? (
            <p className="py-6 text-center text-mirai-text-muted text-sm">
              {messages.preparing}
            </p>
          ) : (
            <div>
              {stances.map((stance) => (
                <FactionStanceRow
                  key={stance.id}
                  stance={stance}
                  messages={messages}
                />
              ))}
            </div>
          )}
        </div>

        {/* 区議会だよりから転記した賛否には出典を必ず添える（デザインシステム §9）。
            管理画面で入れただけの賛否には付けない */}
        {source && hasSourcedStance(stances) && (
          <p className="flex flex-wrap items-center gap-x-1 text-mirai-text-muted text-sm">
            {messages.source}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 font-bold text-mirai-accent-text underline-offset-4 hover:underline"
            >
              <span lang="ja">{source.label}</span>
              <ExternalLink
                aria-hidden="true"
                className="size-3.5 shrink-0"
                strokeWidth={2.75}
              />
              <span className="sr-only">{messages.opensInNewTab}</span>
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
