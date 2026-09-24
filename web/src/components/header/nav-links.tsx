import Link from "next/link";
import type { CouncilSessionWithSlug } from "@/features/council-sessions/shared/types";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  pathname: string;
  /** 「議案一覧」のリンク先と会期バッジに使う定例会 */
  session: CouncilSessionWithSlug | null;
  className?: string;
}

const linkClassName =
  "flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium text-mirai-text transition-colors hover:bg-neutral-200/60 hover:text-mirai-accent-text focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 aria-[current=page]:bg-neutral-200";

/**
 * デスクトップのヘッダー中央に並べる主要導線と会期バッジ（docs/BACKLOG.md P8-2）。
 * スマートフォンではハンバーガーメニューに同じ導線がある。
 * 会期バッジは難易度セレクタ等と並んでも収まる xl 以上でだけ出す。
 */
export function NavLinks({ pathname, session, className }: NavLinksProps) {
  const links = [
    ...(session
      ? [{ label: "議案一覧", href: routes.sessionBills(session.slug) }]
      : []),
    { label: "議員一覧", href: routes.councilors() },
  ];

  return (
    <div className={cn("items-center gap-3", className)}>
      <nav aria-label="主要ナビゲーション">
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
      {session && (
        <p className="hidden whitespace-nowrap rounded-full bg-card px-3 py-1 text-xs font-medium text-mirai-text shadow-mirai-sm xl:block">
          <span className="sr-only">現在の会期：</span>
          {session.name}
        </p>
      )}
    </div>
  );
}
