import { House } from "lucide-react";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface HomeLinkProps {
  /** 今トップページにいるか。下層ページではトップへ戻る印を付ける */
  isHome: boolean;
  /**
   * 右側に難易度セレクタ等が並び、狭い画面では横幅が足りないか。
   * 下層ページでは、スマートフォン幅のときサイト名を読み上げ専用にしてアイコンだけ見せる
   */
  compact?: boolean;
  /** 表示言語。サイト名は英語表示でも日本語のまま出す */
  locale?: PublicLocale;
}

/**
 * ヘッダー左端のサイト名。トップページへのリンクであることを、
 * 下層ページでは家のアイコンと「トップへ」で明示する（docs/BACKLOG.md P8-1）。
 */
export function HomeLink({
  isHome,
  compact = false,
  locale = "ja",
}: HomeLinkProps) {
  const { nav } = getUiMessages(locale);
  return (
    <Link
      href={routes.home()}
      title={isHome ? undefined : nav.returnToHome}
      className="-mx-2 flex min-h-11 min-w-0 items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40"
    >
      {!isHome && (
        <span className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-neutral-200 px-2.5 text-xs font-semibold text-mirai-text">
          <House aria-hidden="true" className="size-4" strokeWidth={2.75} />
          <span className="sr-only sm:not-sr-only">{nav.home}</span>
        </span>
      )}
      {siteConfig.features.showTeamMiraiSection && (
        <Image src="/img/logo.svg" alt="" width={42} height={36} />
      )}
      <span
        lang="ja"
        className={cn(
          "truncate text-base font-bold sm:text-xl",
          !isHome && compact && "sr-only sm:not-sr-only"
        )}
      >
        {siteConfig.siteName}
      </span>
    </Link>
  );
}
