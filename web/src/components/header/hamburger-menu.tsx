"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import { hasSlug } from "@/features/council-sessions/shared/utils/pick-header-session";
import { LanguageSelector } from "@/features/i18n/client/components/language-selector";
import { routes } from "@/lib/routes";
import { RubyToggle } from "@/lib/rubyful";
import { isRubyfulExcludedPath } from "@/lib/rubyful/should-enable-rubyful";

interface HamburgerMenuProps {
  locale: PublicLocale;
  sessions: CouncilSession[];
}

export function HamburgerMenu({ locale, sessions }: HamburgerMenuProps) {
  const pathname = usePathname();
  // 多言語案内ページではルビを使わないため、ふりがなの切り替えを出さない
  const showRubyToggle = !isRubyfulExcludedPath(pathname);
  const sessionsWithSlug = sessions.filter(hasSlug);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="flex flex-col gap-3">
          <LanguageSelector currentLocale={locale} />
          {showRubyToggle && <RubyToggle />}
          <Link
            href={routes.councilors()}
            className="flex min-h-11 items-center text-sm hover:underline"
          >
            議員一覧
          </Link>
          {sessionsWithSlug.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-mirai-text-muted mb-1">
                議案一覧
              </p>
              <ul className="flex flex-col gap-1">
                {sessionsWithSlug.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={routes.sessionBills(session.slug)}
                      className="flex min-h-11 items-center text-sm hover:underline"
                    >
                      {session.name}の議案一覧
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
