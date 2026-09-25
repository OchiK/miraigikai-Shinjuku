"use client";

import {
  LOCALE_NATIVE_NAMES,
  PUBLIC_LOCALES,
  type PublicLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANGUAGE_SELECTOR_LABEL } from "../../shared/messages";
import { useLocaleSwitch } from "../hooks/use-locale-switch";

interface LanguageToggleProps {
  currentLocale: PublicLocale;
  className?: string;
}

/**
 * 日本語 / English をワンタップで切り替えるセグメント。
 * メニューを開かずに切り替えられるよう、ヘッダーに直接置く
 * （docs/BACKLOG.md P8-4。トップページの重複配置は P8-15 で削除）。
 * 見た目は DifficultySelector に揃える。
 */
export function LanguageToggle({
  currentLocale,
  className,
}: LanguageToggleProps) {
  const { selected, isChanging, switchLocale } = useLocaleSwitch(currentLocale);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-full bg-neutral-200 p-0.5 md:gap-1 md:p-1",
        className
      )}
      role="group"
      aria-label={LANGUAGE_SELECTOR_LABEL}
    >
      {PUBLIC_LOCALES.map((locale) => {
        const isSelected = locale === selected;

        return (
          <Button
            key={locale}
            type="button"
            variant="ghost"
            lang={locale}
            disabled={isChanging}
            aria-pressed={isSelected}
            onClick={() => switchLocale(locale)}
            className={cn(
              "h-11 px-2 text-xs md:px-3 md:text-sm",
              isSelected
                ? "bg-primary text-mirai-text hover:bg-primary-accent hover:text-mirai-text"
                : "text-mirai-text-secondary"
            )}
          >
            {LOCALE_NATIVE_NAMES[locale]}
          </Button>
        );
      })}
    </div>
  );
}
