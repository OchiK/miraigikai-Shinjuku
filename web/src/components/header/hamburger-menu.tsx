"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  CouncilSession,
  CouncilSessionWithSlug,
} from "@/features/council-sessions/shared/types";
import {
  hasSessionsBesides,
  hasSlug,
} from "@/features/council-sessions/shared/utils/pick-header-session";
import { LanguageSelector } from "@/features/i18n/client/components/language-selector";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { RubyToggle } from "@/lib/rubyful";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  locale: PublicLocale;
  sessions: CouncilSession[];
  /** デスクトップのヘッダー中央（NavLinks）に「議案一覧」として出している定例会 */
  headerSession: CouncilSessionWithSlug | null;
  /**
   * メニュー内のふりがなスイッチに付けるクラス。ヘッダーのボタンが隠れる
   * 狭い画面でだけ見せる（例: "sm:hidden"）。undefined ならスイッチを出さない
   */
  rubyToggleClassName?: string;
}

/**
 * スマートフォン・タブレット向けの全導線メニュー。
 *
 * デスクトップ（lg 以上）ではヘッダーに出ている項目（言語・議員一覧・
 * ヘッダーの定例会の議案一覧）を隠し、ほかの定例会の議案一覧だけを残す。
 * 残すものが無ければメニューごと隠す（docs/BACKLOG.md P8-11）。
 * lg:hidden は、header-client.tsx で NavLinks を lg 以上で出し、
 * LanguageToggle を sm 以上で必ず出していることを前提にしている。
 */
export function HamburgerMenu({
  locale,
  sessions,
  headerSession,
  rubyToggleClassName,
}: HamburgerMenuProps) {
  const sessionsWithSlug = sessions.filter(hasSlug);
  const hasDesktopOnlyItems = hasSessionsBesides(sessions, headerSession);
  const { nav } = getUiMessages(locale);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-11 w-11", !hasDesktopOnlyItems && "lg:hidden")}
          aria-label={nav.openMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent lang={locale} className="w-56" align="end">
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
          {sessionsWithSlug.length > 0 && (
            <div className={cn(!hasDesktopOnlyItems && "lg:hidden")}>
              <p className="text-xs font-semibold text-mirai-text-muted mb-1">
                {nav.bills}
              </p>
              <ul className="flex flex-col gap-1">
                {sessionsWithSlug.map((session) => (
                  <li
                    key={session.id}
                    className={cn(
                      session.id === headerSession?.id && "lg:hidden"
                    )}
                  >
                    <Link
                      href={routes.sessionBills(session.slug)}
                      className="flex min-h-11 items-center text-sm hover:underline"
                    >
                      {nav.sessionBills(session.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
