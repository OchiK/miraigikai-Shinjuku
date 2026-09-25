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

/**
 * 議決結果のバーの下に出す説明の中身。
 *
 * - 全会派が同じ区分なら「全会派が賛成」のように一文で示す。条件付き賛成も
 *   バーの集計と同じく賛成に数える（行の一覧には「条件付き賛成」と出る）。
 * - 賛成と反対に分かれたら、少ない側の会派名を件数に添える（誰が反対したかが
 *   いちばん知りたい情報で、8行の一覧を読まずにわかるようにする）。
 * - 同数や、賛成・反対のどちらかしかない（残りが中立など）場合は名前を添えない。
 */
export type VoteSplit =
  | { kind: "unanimous"; bucket: VoteBucket; count: number }
  | {
      kind: "split";
      /** 少ない側の区分と会派名。同数などで決まらなければ null */
      minority: { bucket: "for" | "against"; factionNames: string[] } | null;
    };

export function describeVoteSplit(
  stances: readonly { stance: StanceTypeEnum; factionName: string }[]
): VoteSplit {
  const summary = summarizeFactionVotes(stances);
  const buckets: VoteBucket[] = ["for", "against", "other"];
  const sole = buckets.find(
    (bucket) => summary.total > 0 && summary[bucket] === summary.total
  );
  if (sole) {
    return { kind: "unanimous", bucket: sole, count: summary.total };
  }

  if (
    summary.for === 0 ||
    summary.against === 0 ||
    summary.for === summary.against
  ) {
    return { kind: "split", minority: null };
  }

  const bucket = summary.for < summary.against ? "for" : "against";
  return {
    kind: "split",
    minority: {
      bucket,
      factionNames: stances
        .filter(({ stance }) => toVoteBucket(stance) === bucket)
        .map(({ factionName }) => factionName),
    },
  };
}
