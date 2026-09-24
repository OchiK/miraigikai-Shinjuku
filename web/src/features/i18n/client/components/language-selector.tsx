"use client";

import {
  LOCALE_NATIVE_NAMES,
  PUBLIC_LOCALES,
  type PublicLocale,
  parseLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { useId } from "react";
import { LANGUAGE_SELECTOR_LABEL } from "../../shared/messages";
import { useLocaleSwitch } from "../hooks/use-locale-switch";

interface LanguageSelectorProps {
  currentLocale: PublicLocale;
}

/**
 * メニュー内の表示言語の切り替え。
 *
 * 議案の翻訳を公開しているのは英語だけなので、選べるのは日本語と英語だけ。
 * ほかの5言語の案内ページへのリンクはトップページに一本化した
 * （docs/BACKLOG.md P8-3）。
 *
 * ネイティブの select を使う（キーボード・スクリーンリーダーの操作がそのまま効く）。
 */
export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const id = useId();
  const { selected, isChanging, switchLocale } = useLocaleSwitch(currentLocale);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-mirai-text-muted"
      >
        {LANGUAGE_SELECTOR_LABEL}
      </label>
      <select
        id={id}
        value={selected}
        disabled={isChanging}
        onChange={(e) => switchLocale(parseLocale(e.target.value))}
        className="h-11 w-full rounded-full bg-neutral-200 px-4 text-sm text-mirai-text outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {PUBLIC_LOCALES.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {LOCALE_NATIVE_NAMES[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
