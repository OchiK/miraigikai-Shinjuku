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

/**
 * ステータスからステップ番号を取得する。
 *
 * 審議の経過（bill-timeline.ts）が、どこまで進んだかを判定するために使う。
 */
export function getCurrentStep(status: BillStatusEnum): number {
  return STATUS_TO_STEP[status] ?? 0;
}
