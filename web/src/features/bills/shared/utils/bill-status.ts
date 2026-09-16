import {
  getBillCardStatusLabel,
  getBillStatusVariant,
} from "@mirai-gikai/shared/bills/decision-label";
import type { BillStatusEnum } from "../types";

/**
 * カード用の簡略化されたステータスラベルを取得
 *
 * 実体は @mirai-gikai/shared に一本化している。status_note を渡すと、
 * 専決処分の承認のように列挙だけでは区別できない議決用語を正しく表示できる。
 */
export function getCardStatusLabel(
  status: BillStatusEnum,
  statusNote?: string | null
): string {
  return getBillCardStatusLabel({ status, statusNote });
}

/** ステータスに対応するBadgeのvariantを取得 */
export function getStatusVariant(
  status: BillStatusEnum,
  statusNote?: string | null
): "light" | "default" | "dark" | "muted" {
  return getBillStatusVariant({ status, statusNote });
}
