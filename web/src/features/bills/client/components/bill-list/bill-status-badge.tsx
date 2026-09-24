import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Badge } from "@/components/ui/badge";
import { localizeCardStatusLabel } from "@/features/i18n/shared/ui-messages";
import type { BillStatusEnum } from "../../../shared/types";
import {
  getCardStatusLabel,
  getStatusVariant,
} from "../../../shared/utils/bill-status";

interface BillStatusBadgeProps {
  status: BillStatusEnum;
  /**
   * bills.status_note。公式の議決用語（例:「本会議で承認」）を含む。
   * 渡さない場合は status の列挙だけでラベルを決めるため、
   * 専決処分の承認が「可決」と表示される点に注意。
   */
  statusNote?: string | null;
  /** 表示言語。省略時は日本語 */
  locale?: PublicLocale;
  className?: string;
}

export function BillStatusBadge({
  status,
  statusNote,
  locale = "ja",
  className,
}: BillStatusBadgeProps) {
  return (
    <Badge
      variant={getStatusVariant(status, statusNote)}
      lang={locale}
      className={className}
    >
      {localizeCardStatusLabel(getCardStatusLabel(status, statusNote), locale)}
    </Badge>
  );
}
