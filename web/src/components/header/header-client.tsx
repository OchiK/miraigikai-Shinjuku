"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { isInterviewPage, isMainPage } from "@/lib/page-layout-utils";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { HamburgerMenu } from "./hamburger-menu";

interface HeaderClientProps {
  difficultyLevel: DifficultyLevelEnum;
  locale: PublicLocale;
  sessions: CouncilSession[];
}

export function HeaderClient({
  difficultyLevel,
  locale,
  sessions,
}: HeaderClientProps) {
  const pathname = usePathname();
  const showDifficultySelector = isMainPage(pathname);
  const showInterviewActions = isInterviewPage(pathname);

  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-40 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-mirai-surface shadow-mirai-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center min-w-0">
            <Link
              href={routes.home()}
              className="flex items-center space-x-2 min-w-0 min-h-11"
            >
              {siteConfig.features.showTeamMiraiSection && (
                <Image src="/img/logo.svg" alt="" width={42} height={36} />
              )}
              <div className="truncate text-base font-bold sm:text-xl">
                {siteConfig.siteName}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex shrink-0 items-center space-x-2"
            aria-label="補助ナビゲーション"
          >
            {showDifficultySelector && (
              <DifficultySelector currentLevel={difficultyLevel} />
            )}
            {showInterviewActions && <InterviewHeaderActions />}
            <HamburgerMenu locale={locale} sessions={sessions} />
          </nav>
        </div>
      </div>
    </header>
  );
}
