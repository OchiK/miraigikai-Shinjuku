"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { href: routes.bills(), label: "議案管理" },
  { href: routes.billTranslationsList(), label: "多言語翻訳" },
  { href: routes.councilSessions(), label: "定例会管理" },
  { href: routes.tags(), label: "タグ管理" },
  { href: routes.factions(), label: "会派管理" },
  { href: routes.committees(), label: "委員会管理" },
  { href: routes.interviews(), label: "インタビュー" },
  { href: routes.aiCollection(), label: "AI情報収集" },
  { href: routes.experts(), label: "有識者" },
  { href: routes.admins(), label: "管理者" },
  { href: routes.aiSettings(), label: "AI管理" },
];

export function NavigationLinks() {
  const pathname = usePathname();
  // /bills/translations は /bills にも前方一致するので、最も長く一致したリンクだけを選択中にする
  const activeHref = navigationLinks
    .filter((link) => pathname.startsWith(link.href))
    .reduce<string | null>(
      (longest, link) =>
        longest === null || link.href.length > longest.length
          ? link.href
          : longest,
      null
    );

  return (
    <nav
      aria-label="管理画面のメインナビゲーション"
      className="overflow-x-auto"
    >
      <div className="flex w-max min-w-full gap-8">
        {navigationLinks.map((link) => {
          const isActive = link.href === activeHref;

          return (
            <Link
              key={link.href}
              href={link.href as Route}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm transition-colors",
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium"
              )}
            >
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
