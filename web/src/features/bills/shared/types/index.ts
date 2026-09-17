import { getBillStatusLabel as getSharedBillStatusLabel } from "@mirai-gikai/shared/bills/decision-label";
import type { Database } from "@mirai-gikai/supabase";

// Database types
export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillContent = Database["public"]["Tables"]["bill_contents"]["Row"];
export type BillContentInsert =
  Database["public"]["Tables"]["bill_contents"]["Insert"];
export type BillContentUpdate =
  Database["public"]["Tables"]["bill_contents"]["Update"];

// Enums
export type BillStatusEnum = Database["public"]["Enums"]["bill_status_enum"];
export type StanceTypeEnum = Database["public"]["Enums"]["stance_type_enum"];

// mirai_stances テーブルは現在のDB上には存在しないが、
// stance-styles.ts と関連テストが参照するためローカル型として定義する
export type MiraiStance = {
  id: string;
  bill_id: string;
  type: StanceTypeEnum;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

// 公開ステータス型（議案の公開/非公開を管理）
export type BillPublishStatus = "draft" | "published" | "coming_soon";

// Coming Soon議案の型（最小限の情報のみ）
export type ComingSoonBill = {
  id: string;
  name: string; // 正式名称
  /**
   * 公式の識別名（例:「第42号議案」「承認第2号」）。
   * 件名は一意とは限らず、承認第2号・第3号はいずれも「専決処分の承認について」で
   * 完全に一致する。識別名がないと一覧で区別できないため保持する。
   */
  bill_number: string | null;
  title: string | null; // わかりやすいタイトル（bill_contentsから）
  council_url: string | null;
  status: BillStatusEnum;
  tags: BillTag[];
};

// Combined types for UI
export type FactionStance = {
  id: string;
  stance: StanceTypeEnum;
  comment: string | null;
  faction: {
    id: string;
    name: string;
    display_name: string;
    sort_order: number;
  };
};

export type BillWithStance = Bill & {
  faction_stances?: FactionStance[];
};

export type BillTag = {
  id: string;
  label: string;
};

export type FeaturedTag = {
  id: string;
  label: string;
  priority: number;
};

/**
 * 議案が属する定例会のうち、詳細ページの戻り導線に必要な最小限の情報。
 *
 * council_sessions の表示名の列は `name`（例:「令和8年第2回定例会」）。
 */
export type BillCouncilSession = {
  id: string;
  name: string;
  slug: string | null;
  council_url: string | null;
};

export type BillWithContent = Bill & {
  bill_content?: BillContent;
  faction_stances?: FactionStance[];
  committee_id: string | null;
  tags: BillTag[];
  featured_tag?: FeaturedTag;
  hasPublicInterview?: boolean;
  council_session?: BillCouncilSession | null;
};

// タグごとにグループ化された議案
export type BillsByTag = {
  tag: BillTag & { description?: string; priority: number };
  bills: BillWithContent[];
};

// ステータスのソート順（DBのstatus_order generated columnと一致させる）
export const BILL_STATUS_ORDER: Record<BillStatusEnum, number> = {
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
  status: BillStatusEnum,
  statusNote?: string | null
): string {
  return getSharedBillStatusLabel({ status, statusNote });
}

export const STANCE_LABELS: Record<StanceTypeEnum, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
  conditional_for: "条件付き賛成",
  conditional_against: "条件付き反対",
  considering: "検討中",
  continued_deliberation: "継続審査中",
};
