import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Link from "next/link";
import type { CouncilSessionWithSlug } from "@/features/council-sessions/shared/types";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  pathname: string;
  /** 「最新の議案一覧」のリンク先に使う定例会 */
  session: CouncilSessionWithSlug | null;
  /** 表示言語。省略時は日本語 */
  locale?: PublicLocale;
  className?: string;
}

const linkClassName =
  "flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium text-mirai-text transition-colors hover:bg-neutral-200/60 hover:text-mirai-accent-text focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 aria-[current=page]:bg-neutral-200";

/**
 * デスクトップのヘッダー中央に並べる主要導線（docs/BACKLOG.md P8-2）。
 * スマートフォンではハンバーガーメニューに同じ導線がある。
 * 会期名はトップページと議案一覧ページの見出しで示すので、ここには出さない。
 */
export function NavLinks({
  pathname,
  session,
  locale = "ja",
  className,
}: NavLinksProps) {
  const { nav } = getUiMessages(locale);
  const links = [
    ...(session
      ? [{ label: nav.latestBills, href: routes.sessionBills(session.slug) }]
      : []),
    { label: nav.councilors, href: routes.councilors() },
  ];

  return (
    <div className={cn("items-center gap-3", className)}>
      <nav aria-label={nav.primaryNavLabel}>
        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                // 一覧ページそのものにいるときだけ。議案詳細等の下層では付けない
                aria-current={pathname === link.href ? "page" : undefined}
                className={linkClassName}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
