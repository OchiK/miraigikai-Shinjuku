"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  SEGMENT_TRACK_CLASS,
  segmentItemClass,
} from "@/lib/segment-control-styles";
import { cn } from "@/lib/utils";
import { useRubyToggle } from "./use-ruby-toggle";

interface RubyToggleProps {
  className?: string;
  /**
   * switch: メニュー内に置くラベル＋スイッチ
   * pill: ヘッダーに直接置くワンタップのピル型ボタン（docs/BACKLOG.md P8-10）。
   *       見た目は LanguageToggle / DifficultySelector に揃える
   */
  variant?: "switch" | "pill";
}

export function RubyToggle({ className, variant = "switch" }: RubyToggleProps) {
  const { rubyEnabled, handleRubyToggle } = useRubyToggle();

  if (variant === "pill") {
    // 1項目のセグメントとして地で包み、オンの塗りと地の 3:1 を他の2つと揃える。
    // className（ヘッダーの hidden sm:inline-flex 等）は地ごと隠すため外側に付ける
    return (
      <div
        className={cn("inline-flex shrink-0", SEGMENT_TRACK_CLASS, className)}
      >
        <Button
          type="button"
          variant="ghost"
          aria-pressed={rubyEnabled}
          aria-label="ふりがな表示の切り替え"
          onClick={() => handleRubyToggle(!rubyEnabled)}
          className={cn(
            "h-11 px-3 text-xs md:text-sm",
            segmentItemClass(rubyEnabled),
            // オン中に押すとオフになるので、塗りは変えずに影でホバーを示す
            rubyEnabled && "hover:shadow-mirai-md"
          )}
        >
          ふりがな
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-between space-x-4", className)}
    >
      <div className="space-y-0.5">
        <div className="text-sm font-medium">ふりがな表示</div>
      </div>
      <Switch
        checked={rubyEnabled}
        onCheckedChange={handleRubyToggle}
        aria-label="ふりがな表示の切り替え"
      />
    </div>
  );
}
