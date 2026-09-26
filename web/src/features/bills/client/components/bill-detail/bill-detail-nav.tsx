import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { AroundJapanese } from "@/features/i18n/client/components/around-japanese";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import type { BillCouncilSession } from "../../../shared/types";

interface BillDetailNavProps {
  councilSession?: BillCouncilSession | null;
  locale?: PublicLocale;
}

/**
 * 議案詳細の上部ナビゲーション（デザインシステム定義 §9-1）。
 *
 * 左は会期一覧への戻り導線、右は区議会の公式ページ。公式資料への導線を
 * 1タップ以内に保つため、原文アコーディオンとは別にここにも置く。
 * 会期の slug が無い議案もあるため、その場合はトップに戻す。
 */
export function BillDetailNav({
  councilSession,
  locale = "ja",
}: BillDetailNavProps) {
  const { nav, billDetail, factionStances } = getUiMessages(locale);
  // 会期の slug が無い議案はトップに戻すしかないので、ラベルも行き先に合わせる
  const hasSession = councilSession?.slug != null;
  const backHref = hasSession
    ? routes.sessionBills(councilSession.slug as string)
    : routes.home();
  const backLabel = hasSession ? (
    <AroundJapanese around={billDetail.backToSession}>
      {councilSession.name}
    </AroundJapanese>
  ) : (
    nav.home
  );

  return (
    <nav
      lang={locale}
      className="flex flex-wrap items-center justify-between gap-3 py-4"
    >
      <Link
        href={backHref as Route}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-5 font-bold text-mirai-text text-sm shadow-mirai-sm transition-colors hover:bg-neutral-300"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2.75} />
        {backLabel}
      </Link>

      {councilSession?.council_url && (
        <a
          href={councilSession.council_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-bold text-mirai-accent-text text-sm transition-opacity hover:opacity-70"
        >
          {billDetail.officialPage}
          <ExternalLink
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.75}
          />
          <span className="sr-only">{factionStances.opensInNewTab}</span>
        </a>
      )}
    </nav>
  );
}
