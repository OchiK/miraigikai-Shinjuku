import type { BillDecisionInput } from "@mirai-gikai/shared/bills/decision-label";
import {
  getBillStatusLabel,
  getDecisionStepLabel,
} from "@mirai-gikai/shared/bills/decision-label";
import type { BillStatusEnum } from "../types";

// ステップ番号マッピング（地方議会: 一院制）
const STATUS_TO_STEP: Record<BillStatusEnum, number> = {
  preparing: 0,
  submitted: 1,
  in_committee: 2,
  plenary_session: 3,
  approved: 4,
  rejected: 4,
  adopted: 4,
  partially_adopted: 4,
  reported: 4,
} as const;

// プログレス比率
const PROGRESS_RATIOS = [0, 1 / 8, 3 / 8, 5 / 8, 1] as const;

/**
 * ステータスとステータスノートからメッセージを生成する
 */
export function getStatusMessage(
  status: BillStatusEnum,
  statusNote: string | null | undefined
): string {
  if (status === "preparing") return "議案上程前";
  return statusNote || "";
}

/**
 * ステップ番号と現在のステップからステップの状態を判定する
 */
export function getStepState(
  stepNumber: number,
  currentStep: number,
  isPreparing: boolean
): "active" | "inactive" {
  if (isPreparing) return "inactive";
  return stepNumber <= currentStep ? "active" : "inactive";
}

/**
 * ステップ一覧をそのまま返す（地方議会は一院制のため順序変更なし）
 */
export function getOrderedSteps(
  baseSteps: readonly { readonly label: string }[]
): { label: string }[] {
  return baseSteps.map((s) => ({ label: s.label }));
}

/**
 * 現在のステップからプログレスバーの幅(%)を計算する
 */
export function calculateProgressWidth(currentStep: number): number {
  const ratio = PROGRESS_RATIOS[currentStep] ?? 0;
  return ratio * 100;
}

/**
 * ステータスからステップ番号を取得する
 */
export function getCurrentStep(status: BillStatusEnum): number {
  return STATUS_TO_STEP[status] ?? 0;
}

/**
 * 議決前の3ステップ（地方議会: 一院制）。
 *
 * 最終ステップの見出しは議決用語によって変わるため、ここには含めない。
 */
const PRE_DECISION_STEP_LABELS = [
  "議案\n上程",
  "委員会\n審査",
  "本会議\n採決",
] as const;

/**
 * 進捗表示のステップ一覧を組み立てる。
 *
 * 最終ステップを「可決／否決」で固定すると、専決処分の承認（承認第2号・第3号）の
 * 詳細ページに、存在しない議決の選択肢が並ぶ。議決用語は status_note から取る。
 */
export function buildBillProgressSteps(
  input: BillDecisionInput
): { label: string }[] {
  const decision = getDecisionStepLabel(input);

  return [
    ...PRE_DECISION_STEP_LABELS.map((label) => ({ label })),
    { label: `${decision.positive}\n/${decision.negative}` },
  ];
}

/**
 * 進捗表示のバッジに出す文言。
 *
 * 上程前だけは、この進捗表示では共有ラベルの「準備中」ではなく
 * 「議案上程前」と呼んできたので、従来の文言を維持する。
 */
export function buildBillProgressStatusMessage(
  input: BillDecisionInput
): string {
  if (input.status === "preparing") return "議案上程前";
  return getBillStatusLabel(input);
}
