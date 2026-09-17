import type { StanceTypeEnum } from "../types";

/**
 * 会派の賛否を、議決結果のバーに出す3つの区分に畳む純粋関数。
 *
 * 条件付き賛成・条件付き反対はそれぞれ賛成・反対に数える。中立と検討中は
 * どちらにも数えず「その他」に置く（デザインシステム定義 §9-6）。
 */
export type VoteBucket = "for" | "against" | "other";

export interface FactionVoteSummary {
  for: number;
  against: number;
  other: number;
  total: number;
  /** バーの幅(%)。合計が0のときは0 */
  forRatio: number;
  againstRatio: number;
  otherRatio: number;
}

export function toVoteBucket(stance: StanceTypeEnum): VoteBucket {
  switch (stance) {
    case "for":
    case "conditional_for":
      return "for";
    case "against":
    case "conditional_against":
      return "against";
    default:
      return "other";
  }
}

export function summarizeFactionVotes(
  stances: readonly { stance: StanceTypeEnum }[]
): FactionVoteSummary {
  const counts = { for: 0, against: 0, other: 0 };

  for (const { stance } of stances) {
    counts[toVoteBucket(stance)] += 1;
  }

  const total = counts.for + counts.against + counts.other;
  const ratio = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return {
    ...counts,
    total,
    forRatio: ratio(counts.for),
    againstRatio: ratio(counts.against),
    otherRatio: ratio(counts.other),
  };
}
