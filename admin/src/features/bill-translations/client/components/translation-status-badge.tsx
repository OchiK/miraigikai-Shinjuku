"use client";

import { Badge } from "@/components/ui/badge";
import type { TranslationReviewStatus } from "../../shared/types/bill-translation";

const STATUS_DISPLAY: Record<
  TranslationReviewStatus,
  {
    label: string;
    /** 一覧の表のように幅が限られる場所で使う短い表記 */
    shortLabel: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  reviewed: {
    label: "確認済み（公開中）",
    shortLabel: "公開中",
    variant: "default",
  },
  generated: {
    label: "要確認（非公開）",
    shortLabel: "要確認",
    variant: "secondary",
  },
  stale: {
    label: "原文変更あり（非公開）",
    shortLabel: "原文変更",
    variant: "destructive",
  },
  missing: { label: "未翻訳", shortLabel: "未翻訳", variant: "outline" },
};

interface TranslationStatusBadgeProps {
  status: TranslationReviewStatus;
  compact?: boolean;
}

/** 翻訳の状態。色だけで区別しないよう、必ずラベルを添える */
export function TranslationStatusBadge({
  status,
  compact = false,
}: TranslationStatusBadgeProps) {
  const { label, shortLabel, variant } = STATUS_DISPLAY[status];
  return <Badge variant={variant}>{compact ? shortLabel : label}</Badge>;
}
