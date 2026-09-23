"use client";

import type { Locale } from "@mirai-gikai/shared/i18n/locales";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import { LanguageSelector } from "@/features/i18n/client/components/language-selector";
import { routes } from "@/lib/routes";
import { RubyToggle } from "@/lib/rubyful";

interface HamburgerMenuProps {
  locale: Locale;
  sessions: CouncilSession[];
}

export function HamburgerMenu({ locale, sessions }: HamburgerMenuProps) {
  const sessionsWithSlug = sessions.filter(
    (s): s is CouncilSession & { slug: string } => Boolean(s.slug)
  );

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
          <RubyToggle />
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
