"use client";

import { Badge } from "@/components/ui/badge";
import type { TranslationReviewStatus } from "../../shared/types/bill-translation";

const STATUS_DISPLAY: Record<
  TranslationReviewStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  reviewed: { label: "確認済み（公開中）", variant: "default" },
  generated: { label: "要確認（非公開）", variant: "secondary" },
  stale: { label: "原文変更あり（非公開）", variant: "destructive" },
  missing: { label: "未翻訳", variant: "outline" },
};

interface TranslationStatusBadgeProps {
  status: TranslationReviewStatus;
}

/** 翻訳の状態。色だけで区別しないよう、必ずラベルを添える */
export function TranslationStatusBadge({
  status,
}: TranslationStatusBadgeProps) {
  const { label, variant } = STATUS_DISPLAY[status];
  return <Badge variant={variant}>{label}</Badge>;
}
