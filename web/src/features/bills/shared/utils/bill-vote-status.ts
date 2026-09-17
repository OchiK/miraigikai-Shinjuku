import type { BillStatusEnum } from "../types";

const FINAL_VOTE_STATUSES = new Set<BillStatusEnum>([
  "approved",
  "rejected",
  "adopted",
  "partially_adopted",
]);

/** 議決済みで、会派別の賛否を「議決結果」として表示できる状態か。 */
export function hasFinalVoteResult(
  status: BillStatusEnum | undefined
): boolean {
  return status !== undefined && FINAL_VOTE_STATUSES.has(status);
}
