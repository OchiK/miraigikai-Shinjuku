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

/** 公開しない言語（英語以外）で確認済みのもの。公開画面には出ない */
const REVIEWED_NOT_PUBLIC_DISPLAY = {
  label: "確認済み（公開対象外）",
  shortLabel: "対象外",
  variant: "outline",
} as const;

interface TranslationStatusBadgeProps {
  status: TranslationReviewStatus;
  compact?: boolean;
  /** 公開する言語か（canApproveTranslationLocale）。false なら reviewed を「公開中」と出さない */
  isPublicLocale?: boolean;
}

/** 翻訳の状態。色だけで区別しないよう、必ずラベルを添える */
export function TranslationStatusBadge({
  status,
  compact = false,
  isPublicLocale = true,
}: TranslationStatusBadgeProps) {
  const { label, shortLabel, variant } =
    status === "reviewed" && !isPublicLocale
      ? REVIEWED_NOT_PUBLIC_DISPLAY
      : STATUS_DISPLAY[status];
  return <Badge variant={variant}>{compact ? shortLabel : label}</Badge>;
}
