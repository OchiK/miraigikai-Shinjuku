import {
  GUIDE_LOCALES,
  type GuideLocale,
  LOCALE_NATIVE_NAMES,
} from "@mirai-gikai/shared/i18n/locales";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface GuideLanguageLinksProps {
  /** 今いる案内ページの言語。リンクから外す */
  currentLocale?: GuideLocale;
  className?: string;
  linkClassName?: string;
}

/**
 * 5言語の案内ページ（/guide/[locale]）へのリンク。
 * 各言語の話者が自分の言語を見つけられるよう、自言語表記で並べる。
 * Server / Client のどちらからも使う（トップ・フッター・言語メニュー）。
 */
export function GuideLanguageLinks({
  currentLocale,
  className,
  linkClassName,
}: GuideLanguageLinksProps) {
  const locales = GUIDE_LOCALES.filter((locale) => locale !== currentLocale);

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {locales.map((locale) => (
        <li key={locale}>
          <Link
            href={routes.guide(locale)}
            hrefLang={locale}
            lang={locale}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full bg-background px-4 text-sm font-medium text-mirai-text shadow-mirai-sm transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40",
              linkClassName
            )}
          >
            {LOCALE_NATIVE_NAMES[locale]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
