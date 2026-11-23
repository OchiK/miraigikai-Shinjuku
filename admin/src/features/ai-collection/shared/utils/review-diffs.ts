import type {
  DraftBill,
  DraftFactionStance,
  ExistingBillDetail,
  FactionMatchStatus,
} from "../types";
import { findExistingStance } from "./existing-stance";

export const STATUS_LABELS: Record<string, string> = {
  submitted: "提出",
  in_committee: "委員会審査",
  plenary_session: "本会議",
  approved: "可決",
  rejected: "否決",
  adopted: "採択",
  partially_adopted: "趣旨採択",
  preparing: "準備中",
};

export const STANCE_LABELS: Record<string, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
  absent: "欠席",
  conditional_for: "条件付き賛成",
  conditional_against: "条件付き反対",
  considering: "検討中",
  continued_deliberation: "継続審査",
};

export type OverrideState = {
  updateStatus: boolean;
  updateContents: boolean;
  stances: Record<string, boolean>;
};

export type DiffItem =
  | { key: "status"; label: string; from: string; to: string }
  | { key: "contents"; label: string; from: string; to: string }
  | {
      key: `stance_${string}`;
      factionName: string;
      label: string;
      from: string;
      to: string;
    };

export function computeDiffs(
  draft: DraftBill,
  detail: ExistingBillDetail,
  runStances: DraftFactionStance[],
  matches: Map<string, FactionMatchStatus>
): DiffItem[] {
  const diffs: DiffItem[] = [];

  if (draft.status !== detail.status) {
    diffs.push({
      key: "status",
      label: "ステータス",
      from: STATUS_LABELS[detail.status] ?? detail.status,
      to: STATUS_LABELS[draft.status] ?? draft.status,
    });
  }

  const currentSummary = detail.contents?.summary ?? "";
  const newSummary = draft.summary.slice(0, 500);
  if (currentSummary !== newSummary) {
    diffs.push({
      key: "contents",
      label: "概要・本文",
      from: currentSummary || "（なし）",
      to: newSummary,
    });
  }

  for (const draftStance of runStances) {
    const existing = findExistingStance(
      detail.factionStances,
      draftStance.factionName,
      matches
    );
    const fromType = existing?.type ?? "";
    const toType =
      draftStance.stanceType === "absent" ? "" : draftStance.stanceType;
    const fromComment = existing?.comment ?? "";
    const toComment = draftStance.comment ?? "";

    if (fromType !== toType || fromComment !== toComment) {
      diffs.push({
        key: `stance_${draftStance.factionName}`,
        factionName: draftStance.factionName,
        label: `会派「${draftStance.factionName}」の賛否`,
        from: fromType ? (STANCE_LABELS[fromType] ?? fromType) : "（なし）",
        to:
          draftStance.stanceType === "absent"
            ? "欠席（適用不可）"
            : (STANCE_LABELS[draftStance.stanceType] ?? draftStance.stanceType),
      });
    }
  }

  return diffs;
}

export function buildInitialOverride(diffs: DiffItem[]): OverrideState {
  const stances: Record<string, boolean> = {};
  for (const diff of diffs) {
    if (diff.key.startsWith("stance_") && "factionName" in diff) {
      stances[diff.factionName] = true;
    }
  }
  return {
    updateStatus: diffs.some((d) => d.key === "status"),
    updateContents: diffs.some((d) => d.key === "contents"),
    stances,
  };
}

export function refreshOverride(
  diffs: DiffItem[],
  previous?: OverrideState
): OverrideState {
  const initial = buildInitialOverride(diffs);
  if (!previous) return initial;
  return {
    updateStatus: previous.updateStatus,
    updateContents: previous.updateContents,
    stances: Object.fromEntries(
      Object.keys(initial.stances).map((name) => [
        name,
        previous.stances[name] ?? true,
      ])
    ),
  };
}

export function buildReviewDiffs(
  bills: DraftBill[],
  details: ExistingBillDetail[],
  stances: DraftFactionStance[],
  matches: Map<string, FactionMatchStatus>
): Map<string, DiffItem[]> {
  const detailMap = new Map(details.map((detail) => [detail.name, detail]));
  const diffs = new Map<string, DiffItem[]>();
  for (const bill of bills) {
    const detail = detailMap.get(bill.title);
    if (!detail) continue;
    diffs.set(
      bill.id,
      computeDiffs(
        bill,
        detail,
        stances.filter((stance) => stance.billTitle === bill.title),
        matches
      )
    );
  }
  return diffs;
}

export function refreshOverrides(
  diffs: Map<string, DiffItem[]>,
  previous: Map<string, OverrideState>
): Map<string, OverrideState> {
  return new Map(
    [...diffs].map(([id, items]) => [
      id,
      refreshOverride(items, previous.get(id)),
    ])
  );
}
