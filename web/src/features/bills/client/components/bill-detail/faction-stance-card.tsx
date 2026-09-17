import type {
  BillStatusEnum,
  FactionStance,
  StanceTypeEnum,
} from "../../../shared/types";
import { STANCE_LABELS } from "../../../shared/types";
import { summarizeFactionVotes } from "../../../shared/utils/summarize-faction-votes";

/**
 * 会派別の賛否バッジの配色。
 *
 * 反対に赤を使わない（デザインシステム定義 §9）。反対は異常ではない。
 * 赤の `--color-status-rejected` は議案そのものが否決されたステータスにのみ使う。
 * 色だけで判別させないため、必ず STANCE_LABELS の文字列と併記する。
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
 * 色だけで判別させないため、バーの下に「賛成◯会派・反対◯会派」を必ず併記する。
 */
function FactionVoteBar({ stances }: { stances: FactionStance[] }) {
  const summary = summarizeFactionVotes(stances);

  if (summary.total === 0) {
    return null;
  }

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

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="font-bold text-mirai-vote-for-text">賛成</dt>
          <dd className="text-mirai-text">{summary.for}会派</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-bold text-mirai-vote-against-text">反対</dt>
          <dd className="text-mirai-text">{summary.against}会派</dd>
        </div>
        {summary.other > 0 && (
          <div className="flex items-center gap-2">
            <dt className="font-bold text-mirai-text-muted">その他</dt>
            <dd className="text-mirai-text">{summary.other}会派</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

type FactionStanceRowProps = {
  stance: FactionStance;
};

function FactionStanceRow({ stance }: FactionStanceRowProps) {
  const style = getStanceBadgeStyle(stance.stance);

  return (
    <div className="flex flex-col gap-2 border-mirai-border border-b py-4 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-base">
          {stance.faction.display_name}
        </span>
        <span
          className={`shrink-0 rounded-full px-4 py-1.5 font-bold text-sm ${style.bg} ${style.textColor}`}
        >
          {STANCE_LABELS[stance.stance]}
        </span>
      </div>
      {stance.comment && (
        <p className="whitespace-pre-wrap text-mirai-text-secondary text-sm leading-relaxed">
          {stance.comment}
        </p>
      )}
    </div>
  );
}

interface FactionStanceCardProps {
  stances: FactionStance[];
  billStatus?: BillStatusEnum;
}

export function FactionStanceCard({
  stances,
  billStatus,
}: FactionStanceCardProps) {
  const isPreparing = billStatus === "preparing";

  if (!isPreparing && stances.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="bill-vote-result-heading">
      <h2
        className="mb-4 font-bold font-heading text-mirai-text text-xl"
        id="bill-vote-result-heading"
      >
        議決結果
      </h2>

      <div className="flex flex-col gap-4">
        <FactionVoteBar stances={stances} />

        <div className="rounded-xl bg-card px-6 py-2 shadow-mirai-sm">
          {isPreparing && stances.length === 0 ? (
            <p className="py-6 text-center text-mirai-text-muted text-sm">
              議案上程後に各会派の賛否を表明します。
            </p>
          ) : (
            <div>
              {stances.map((stance) => (
                <FactionStanceRow key={stance.id} stance={stance} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
