"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ExternalLink, MapIcon, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/site.config";
import type {
  CouncilSession,
  CouncilSessionWithSlug,
} from "@/features/council-sessions/shared/types";
import { hasSlug } from "@/features/council-sessions/shared/utils/pick-header-session";
import { LanguageSelector } from "@/features/i18n/client/components/language-selector";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { RubyToggle } from "@/lib/rubyful";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  locale: PublicLocale;
  sessions: CouncilSession[];
  /** デスクトップのヘッダー中央（NavLinks）に「最新の議案一覧」として出している定例会 */
  headerSession: CouncilSessionWithSlug | null;
  /**
   * メニュー内のふりがなスイッチに付けるクラス。ヘッダーのボタンが隠れる
   * 狭い画面でだけ見せる（例: "sm:hidden"）。undefined ならスイッチを出さない
   */
  rubyToggleClassName?: string;
  /** 「全国のみらい議会マップ」の遷移先。既定は siteConfig の設定値で、空文字列なら出さない */
  miraiMapHref?: string;
}

/**
 * スマートフォン・タブレット向けの全導線メニュー。
 *
 * デスクトップ（lg 以上）ではヘッダーに出ている項目（言語・議員一覧）を隠す。
 * 定例会ごとの議案一覧はヘッダーの「最新の議案一覧」と重なっても、
 * 最新の定例会を含めすべて常に残す。定例会が無ければメニューごと隠す
 * （docs/BACKLOG.md P8-11）。
 * lg:hidden は、header-client.tsx で NavLinks を lg 以上で出し、
 * LanguageToggle を sm 以上で必ず出していることを前提にしている。
 * 最下部には外部サイト「全国のみらい議会マップ」へのリンクを、
 * 画面幅にかかわらず置く（新しいタブで開く）。
 */
export function HamburgerMenu({
  locale,
  sessions,
  headerSession,
  rubyToggleClassName,
  miraiMapHref = siteConfig.externalLinks.miraiGikaiMap,
}: HamburgerMenuProps) {
  const sessionsWithSlug = sessions.filter(hasSlug);
  const hasSessionItems = sessionsWithSlug.length > 0;
  const { nav, home } = getUiMessages(locale);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-11 w-11", !hasSessionItems && "lg:hidden")}
          aria-label={nav.openMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent lang={locale} className="w-64" align="end">
        <div className="flex flex-col gap-3">
          <div className="lg:hidden">
            <LanguageSelector currentLocale={locale} />
          </div>
          {rubyToggleClassName !== undefined && (
            <RubyToggle className={rubyToggleClassName} />
          )}
          <Link
            href={routes.councilors()}
            className="flex min-h-11 items-center text-sm hover:underline lg:hidden"
          >
            {nav.councilors}
          </Link>
          {hasSessionItems && (
            <div>
              <p className="text-xs font-semibold text-mirai-text-muted mb-1">
                {nav.bills}
              </p>
              <ul className="flex flex-col gap-1">
                {sessionsWithSlug.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={routes.sessionBills(session.slug)}
                      className="flex min-h-11 items-center justify-between gap-2 text-sm hover:underline"
                    >
                      <span className="truncate">
                        {nav.sessionBills(session.name)}
                      </span>
                      {session.id === headerSession?.id && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-mirai-text">
                          {home.latestBadge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {miraiMapHref && (
            <div className="mt-1 border-t border-mirai-border/40 pt-2">
              <a
                href={miraiMapHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={nav.miraiMapAriaLabel}
                className="-mx-2 flex min-h-11 items-center justify-between gap-2 rounded-full px-2 text-sm text-mirai-text hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-mirai-accent-text"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <MapIcon
                    className="size-4 shrink-0 text-mirai-text-secondary"
                    strokeWidth={2.75}
                    aria-hidden="true"
                  />
                  <span className="truncate">{nav.miraiMap}</span>
                </span>
                <ExternalLink
                  className="size-3.5 shrink-0 text-mirai-text-muted"
                  strokeWidth={2.75}
                  aria-hidden="true"
                />
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
