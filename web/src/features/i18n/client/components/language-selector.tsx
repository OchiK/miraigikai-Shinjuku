"use client";

import {
  LOCALE_NATIVE_NAMES,
  LOCALE_QUERY_PARAM,
  PUBLIC_LOCALES,
  type PublicLocale,
  parseLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { useId, useState } from "react";
import { GuideLanguageLinks } from "@/features/guide/client/components/guide-language-links";
import { GUIDE_LINKS_LABEL } from "@/features/guide/shared/guide-content";
import { setLocale } from "../../server/actions/set-locale";
import { LANGUAGE_SELECTOR_LABEL } from "../../shared/messages";

interface LanguageSelectorProps {
  currentLocale: PublicLocale;
}

/**
 * 表示言語の切り替え。URL は変えず、Cookie を更新して同じページを読み直す。
 * 議案ページなら同じ議案のまま、難易度の選択も保ったまま言語だけが変わる。
 *
 * 議案の翻訳を公開しているのは英語だけなので、選べるのは日本語と英語だけ。
 * ほかの5言語は、議案の翻訳の代わりに案内ページへのリンクを下に並べる
 * （docs/20260924_0450_多言語方針の見直し_英語のみ翻訳と多言語案内ページ.md）。
 *
 * ネイティブの select を使う（キーボード・スクリーンリーダーの操作がそのまま効く）。
 */
export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const id = useId();
  const [selected, setSelected] = useState<PublicLocale>(currentLocale);
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (value: string) => {
    const next = parseLocale(value);
    if (next === selected || isChanging) {
      return;
    }

    setIsChanging(true);
    setSelected(next);

    try {
      await setLocale(next);

      // URLに ?lang が残っていると Middleware が Cookie を上書きするため外す
      const url = new URL(window.location.href);
      if (url.searchParams.has(LOCALE_QUERY_PARAM)) {
        url.searchParams.delete(LOCALE_QUERY_PARAM);
        window.location.replace(url.toString());
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update locale:", error);
      setSelected(currentLocale);
      setIsChanging(false);
    }
  };

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
        onChange={(e) => handleChange(e.target.value)}
        className="h-11 w-full rounded-full bg-neutral-200 px-4 text-sm text-mirai-text outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {PUBLIC_LOCALES.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {LOCALE_NATIVE_NAMES[locale]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs font-semibold text-mirai-text-muted">
        {GUIDE_LINKS_LABEL}
      </p>
      <GuideLanguageLinks
        className="gap-1"
        linkClassName="bg-neutral-200 px-3 text-xs shadow-none"
      />
    </div>
  );
}
