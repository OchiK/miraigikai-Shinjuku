import { getBillStatusLabel as getSharedBillStatusLabel } from "@mirai-gikai/shared/bills/decision-label";
import type { Database } from "@mirai-gikai/supabase";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillStatus = Database["public"]["Enums"]["bill_status_enum"];
export type BillPublishStatus =
  Database["public"]["Enums"]["bill_publish_status"];

export type BillWithContent = Bill & {
  bill_content?: Database["public"]["Tables"]["bill_contents"]["Row"];
};

export type BillWithCouncilSession = Bill & {
  council_sessions: { name: string } | null;
};

import type { SortConfig } from "@/lib/sort";

// ソート関連の型定義
export type BillSortField =
  | "created_at"
  | "published_at"
  | "status_order"
  | "publish_status_order"
  | "bill_number"
  | "name"
  | "council_session"
  | "is_featured";

export const BILL_SORT_FIELDS: readonly BillSortField[] = [
  "created_at",
  "published_at",
  "status_order",
  "publish_status_order",
  "bill_number",
  "name",
  "council_session",
  "is_featured",
] as const;

export type BillSortConfig = SortConfig<BillSortField>;

export const DEFAULT_BILL_SORT: BillSortConfig = {
  field: "created_at",
  order: "desc",
};

// ステータスのソート順（DBのstatus_order generated columnと一致させる）
export const BILL_STATUS_ORDER: Record<BillStatus, number> = {
  approved: 0,
  adopted: 0,
  reported: 0,
  partially_adopted: 1,
  rejected: 2,
  plenary_session: 3,
  in_committee: 4,
  submitted: 5,
  preparing: 6,
};

/**
 * ステータスを日本語ラベルに変換する
 *
 * 実体は @mirai-gikai/shared に一本化している（web と admin で同じラベルを出すため）。
 * status_note を渡すと、専決処分の承認のように列挙だけでは区別できない議決用語を
 * 正しく表示できる。
 */
export function getBillStatusLabel(
  status: BillStatus,
  statusNote?: string | null
): string {
  return getSharedBillStatusLabel({ status, statusNote });
}
