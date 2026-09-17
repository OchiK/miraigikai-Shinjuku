import {
  getBillStatusLabel,
  getDecisionStepLabel,
} from "@mirai-gikai/shared/bills/decision-label";
import type { BillStatusEnum } from "../types";
import { getCurrentStep } from "./bill-progress";

export interface BillTimelineInput {
  status: BillStatusEnum;
  /** bills.status_note。公式の議決用語を含む想定 */
  statusNote?: string | null;
}

/**
 * 審議の経過（縦並びタイムライン）の1件分。
 *
 * デザインシステム定義 §9-7 の「日付＋出来事の縦並び」に対応する。
 * ただし bills テーブルは上程日・付託日といった出来事ごとの日付を持たないため、
 * 日付を推測して置かず、出来事と到達状況だけを返す。
 */
export type BillTimelineEventState = "done" | "current" | "upcoming";

export interface BillTimelineEvent {
  /** レンダリング時の key。ステップ順に固定の識別子を振る */
  key: "submitted" | "in_committee" | "plenary_session" | "decision";
  label: string;
  /** 補足（議決済みの場合の status_note など）。無ければ undefined */
  detail?: string;
  state: BillTimelineEventState;
}

const PRE_DECISION_EVENTS: {
  key: Exclude<BillTimelineEvent["key"], "decision">;
  label: string;
}[] = [
  { key: "submitted", label: "議案の上程" },
  { key: "in_committee", label: "委員会での審査" },
  { key: "plenary_session", label: "本会議での採決" },
];

function resolveState(
  stepNumber: number,
  currentStep: number
): BillTimelineEventState {
  if (stepNumber < currentStep) return "done";
  if (stepNumber === currentStep) return "current";
  return "upcoming";
}

/**
 * 議案のステータスから審議の経過を組み立てる。
 *
 * 最終ステップの見出しは議決用語によって変わる。専決処分の承認（status = approved）を
 * 「可決」と書くと存在しない議決を示すことになるため、用語は status_note から取る。
 */
export function buildBillTimeline(
  input: BillTimelineInput
): BillTimelineEvent[] {
  const currentStep = getCurrentStep(input.status);
  const decision = getDecisionStepLabel(input);

  const events: BillTimelineEvent[] = PRE_DECISION_EVENTS.map(
    ({ key, label }, index) => ({
      key,
      label,
      state: resolveState(index + 1, currentStep),
    })
  );

  const decisionStep = PRE_DECISION_EVENTS.length + 1;
  const decisionState = resolveState(decisionStep, currentStep);
  const isDecided = decisionState === "done" || decisionState === "current";

  events.push({
    key: "decision",
    label: isDecided
      ? getBillStatusLabel(input)
      : `${decision.positive}／${decision.negative}`,
    detail: isDecided ? input.statusNote?.trim() || undefined : undefined,
    state: decisionState,
  });

  return events;
}
