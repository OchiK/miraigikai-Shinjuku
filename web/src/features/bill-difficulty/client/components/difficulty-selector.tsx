"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import {
  SEGMENT_TRACK_CLASS,
  segmentItemClass,
} from "@/lib/segment-control-styles";
import { cn } from "@/lib/utils";
import { setDifficultyLevel } from "../../server/actions/set-difficulty-level";
import {
  type DifficultyLevelEnum,
  VALID_DIFFICULTY_LEVELS,
} from "../../shared/types";
import {
  saveScrollDistanceFromBottom,
  useRestoreScrollFromBottom,
} from "../hooks/use-scroll-from-bottom";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
  scrollToTop?: boolean;
  maintainScrollFromBottom?: boolean;
  /** 表示言語。省略時は日本語 */
  locale?: PublicLocale;
}

/**
 * やさしい / ふつう / くわしく の3択セグメント。
 * デザインシステム定義 §6 に従い、位置と形をどの画面でも変えない。
 */
export function DifficultySelector({
  currentLevel,
  scrollToTop,
  maintainScrollFromBottom,
  locale = "ja",
}: DifficultySelectorProps) {
  const { difficulty } = getUiMessages(locale);
  const [selectedLevel, setSelectedLevel] =
    useState<DifficultyLevelEnum>(currentLevel);
  const [isChanging, setIsChanging] = useState(false);

  // ページロード時にスクロール位置を復元
  useRestoreScrollFromBottom(maintainScrollFromBottom ?? false);

  const handleSelect = async (newLevel: DifficultyLevelEnum) => {
    if (newLevel === selectedLevel || isChanging) {
      return;
    }

    setIsChanging(true);
    setSelectedLevel(newLevel);

    try {
      await setDifficultyLevel(newLevel);

      if (scrollToTop) {
        // スクロール位置をトップに戻す
        window.scrollTo(0, 0);
      } else if (maintainScrollFromBottom) {
        // 画面下端からの距離を保存
        saveScrollDistanceFromBottom();
      }

      // URLから ?difficulty パラメータを削除
      const url = new URL(window.location.href);
      if (url.searchParams.get("difficulty") !== null) {
        url.searchParams.delete("difficulty");
        // パラメータを削除したURLでリロード
        // ただし、スクロール位置は維持されない
        window.location.replace(url.toString());
      } else {
        // パラメータがない場合は通常のリロード
        // この場合はスクロール位置は維持される
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update difficulty level:", error);
      // エラーの場合は元に戻す
      setSelectedLevel(currentLevel);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 md:gap-1",
        SEGMENT_TRACK_CLASS
      )}
      role="group"
      aria-label={difficulty.groupLabel}
    >
      {VALID_DIFFICULTY_LEVELS.map((level) => {
        const isSelected = level === selectedLevel;

        return (
          <Button
            key={level}
            type="button"
            variant="ghost"
            disabled={isChanging}
            aria-pressed={isSelected}
            onClick={() => handleSelect(level)}
            className={cn(
              "h-11 min-w-11 px-1 text-[11px] sm:px-1.5 sm:text-xs md:px-3 md:text-sm",
              segmentItemClass(isSelected)
            )}
          >
            {difficulty.labels[level]}
          </Button>
        );
      })}
    </div>
  );
}
