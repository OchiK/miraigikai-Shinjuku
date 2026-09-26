import type { FactionStanceSource } from "@mirai-gikai/shared/bills/faction-stance-sources";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ExternalLink } from "lucide-react";
import {
  getUiMessages,
  type UiMessages,
} from "@/features/i18n/shared/ui-messages";
import { cn } from "@/lib/utils";
import type { BillStatusEnum, FactionStance } from "../../../shared/types";
import { hasFinalVoteResult } from "../../../shared/utils/bill-vote-status";
import {
  getFactionNameAtVote,
  hasSourcedStance,
} from "../../../shared/utils/faction-name-at-vote";
import {
  describeVoteSplit,
  summarizeFactionVotes,
} from "../../../shared/utils/summarize-faction-votes";

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
      factionName: getFactionNameAtVote(s),
    }))
  );

  if (summary.total === 0) {
    return null;
  }

  // 少ない側の件数に、その会派名を添える（一覧を読まずに誰が反対したかわかる）。
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
        {isPreparing && stances.length === 0 && (
          <div className="rounded-xl bg-card px-6 py-6 shadow-mirai-sm">
            <p className="text-center text-mirai-text-muted text-sm">
              {messages.preparing}
            </p>
          </div>
        )}

        {isVoteFinal && (
          <FactionVoteBar stances={stances} messages={messages} />
        )}

        {/* 議会公式の表から転記した賛否には出典を必ず添える（デザインシステム §9）。
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
