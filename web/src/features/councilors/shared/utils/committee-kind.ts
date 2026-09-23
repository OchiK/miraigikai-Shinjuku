import type {
  CommitteeKind,
  CommitteeRole,
  CouncilorCommittee,
} from "../types";

/**
 * 委員会名から種別を判定する。区議会の正式名称の付け方に従う:
 * 「議会運営委員会」、「〜特別委員会」、それ以外は常任委員会。
 */
export function getCommitteeKind(name: string): CommitteeKind {
  if (name === "議会運営委員会") return "steering";
  if (name.endsWith("特別委員会")) return "special";
  return "standing";
}

export const COMMITTEE_KIND_LABELS: Record<CommitteeKind, string> = {
  standing: "常任委員会",
  steering: "議会運営委員会",
  special: "特別委員会",
};

const KIND_ORDER: CommitteeKind[] = ["standing", "steering", "special"];

export function isCommitteeRole(value: string): value is CommitteeRole {
  return value === "委員長" || value === "副委員長" || value === "委員";
}

/** 常任 → 議会運営 → 特別の順、同じ種別の中は委員会の表示順 */
export function sortCommittees(
  committees: CouncilorCommittee[]
): CouncilorCommittee[] {
  return [...committees].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      a.sortOrder - b.sortOrder
  );
}

/** 種別ごとにまとめる。所属の無い種別は含めない */
export function groupCommitteesByKind(
  committees: CouncilorCommittee[]
): { kind: CommitteeKind; label: string; committees: CouncilorCommittee[] }[] {
  const sorted = sortCommittees(committees);
  return KIND_ORDER.map((kind) => ({
    kind,
    label: COMMITTEE_KIND_LABELS[kind],
    committees: sorted.filter((c) => c.kind === kind),
  })).filter((group) => group.committees.length > 0);
}
