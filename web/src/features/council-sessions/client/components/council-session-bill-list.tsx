import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type {
  BillWithContent,
  ComingSoonBill,
} from "@/features/bills/shared/types";
import { AroundJapanese } from "@/features/i18n/client/components/around-japanese";
import { BillsInJapaneseNotice } from "@/features/i18n/client/components/bills-in-japanese-notice";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import type { CouncilSession } from "../../shared/types";
import { BillListWithStatusFilter } from "./bill-list-with-status-filter";

type Props = {
  session: CouncilSession;
  bills: BillWithContent[];
  comingSoonBills?: ComingSoonBill[];
  locale?: PublicLocale;
};

export function CouncilSessionBillList({
  session,
  bills,
  comingSoonBills = [],
  locale = "ja",
}: Props) {
  const startDate = new Date(session.start_date);
  const endDate = new Date(session.end_date ?? session.start_date);
  const year = startDate.getFullYear();
  const { sessionBills, home, factionStances } = getUiMessages(locale);

  return (
    <div lang={locale} className="flex flex-col gap-8">
      {/* Archiveヘッダー */}
      <div className="flex flex-col gap-1">
        <h1>
          <Image
            src="/icons/archive-typography.svg"
            alt="Archive"
            width={156}
            height={36}
            priority
          />
        </h1>
        <p className="text-sm font-bold text-mirai-accent-text">
          <AroundJapanese around={sessionBills.archiveSubtitle}>
            {session.name}
          </AroundJapanese>
        </p>
      </div>

      {/* セクションヘッダー */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[22px] font-bold text-black leading-[1.48] flex items-center gap-4">
          <span>
            <AroundJapanese around={sessionBills.heading(year)}>
              {session.name}
            </AroundJapanese>
          </span>
          <span className="whitespace-nowrap">
            {home.billCount(bills.length)}
          </span>
        </h2>
        <p className="text-xs font-medium text-mirai-text">
          <AroundJapanese
            around={sessionBills.period(
              year,
              startDate.getMonth() + 1,
              endDate.getMonth() + 1
            )}
          >
            {session.name}
          </AroundJapanese>
        </p>
      </div>

      {/* 議案名・タグが日本語のままであることの案内（日本語表示では出さない） */}
      <BillsInJapaneseNotice locale={locale} />

      {/* フィルター付き議案リスト（coming soon含む） */}
      {bills.length === 0 && comingSoonBills.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          {sessionBills.emptyNotice}
        </p>
      ) : (
        <BillListWithStatusFilter
          bills={bills}
          comingSoonBills={comingSoonBills}
          locale={locale}
        />
      )}

      {/* 議会リンク */}
      {session.council_url && (
        <div className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-mirai-text">
          <span>
            <AroundJapanese around={sessionBills.councilLinkLead(year)}>
              {session.name}
            </AroundJapanese>
          </span>
          <a
            href={session.council_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
          >
            {sessionBills.councilLinkText}
            <ExternalLink
              aria-hidden="true"
              className="h-3 w-3"
              strokeWidth={2.75}
            />
            <span className="sr-only">{factionStances.opensInNewTab}</span>
          </a>
        </div>
      )}
    </div>
  );
}
