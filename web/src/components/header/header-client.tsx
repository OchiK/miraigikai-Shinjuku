"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { usePathname } from "next/navigation";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import { pickHeaderSession } from "@/features/council-sessions/shared/utils/pick-header-session";
import { LanguageToggle } from "@/features/i18n/client/components/language-toggle";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { isInterviewPage, isMainPage } from "@/lib/page-layout-utils";
import { routes } from "@/lib/routes";
import { HamburgerMenu } from "./hamburger-menu";
import { HomeLink } from "./home-link";
import { NavLinks } from "./nav-links";

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
  // 難易度セレクタやインタビュー操作が並ぶと、スマートフォン幅では横幅が足りない
  const isCrowded = showDifficultySelector || showInterviewActions;

  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-40 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-mirai-surface shadow-mirai-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-3 h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center min-w-0">
            <HomeLink isHome={pathname === routes.home()} compact={isCrowded} />
          </div>

          <NavLinks
            pathname={pathname}
            session={pickHeaderSession(sessions)}
            className="hidden lg:flex"
          />

          {/* Navigation */}
          <nav
            className="flex shrink-0 items-center space-x-2"
            aria-label="補助ナビゲーション"
          >
            {showDifficultySelector && (
              <DifficultySelector currentLevel={difficultyLevel} />
            )}
            {/* 狭い画面で隠すときは、メニューとトップページの案内から切り替える */}
            <LanguageToggle
              currentLocale={locale}
              className={isCrowded ? "hidden sm:flex" : undefined}
            />
            {showInterviewActions && <InterviewHeaderActions />}
            <HamburgerMenu locale={locale} sessions={sessions} />
          </nav>
        </div>
      </div>
    </header>
  );
}
