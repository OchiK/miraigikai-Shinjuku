import type {
  BillStatusEnum,
  FactionStance,
  StanceTypeEnum,
} from "../../../shared/types";
import { STANCE_LABELS } from "../../../shared/types";

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
    <>
      <h2 className="mb-4 font-bold text-[22px]">会派の賛否</h2>
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
    </>
  );
}
