"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
    return (
      <Button
        type="button"
        variant="ghost"
        aria-pressed={rubyEnabled}
        aria-label="ふりがな表示の切り替え"
        onClick={() => handleRubyToggle(!rubyEnabled)}
        className={cn(
          "h-11 px-3 text-xs md:text-sm",
          rubyEnabled
            ? "bg-primary text-mirai-text shadow-mirai-sm hover:bg-primary-accent hover:text-mirai-text"
            : "bg-neutral-200 text-mirai-text-secondary hover:bg-neutral-300 hover:text-mirai-text",
          className
        )}
      >
        ふりがな
      </Button>
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
