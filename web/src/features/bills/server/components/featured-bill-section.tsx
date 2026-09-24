import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import type { Route } from "next";
import Link from "next/link";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { BillCard } from "../../client/components/bill-list/bill-card";
import type { BillWithContent } from "../../shared/types";
import { getFeaturedBillLayout } from "../../shared/utils/featured-bill-layout";

interface FeaturedBillSectionProps {
  bills: BillWithContent[];
  locale?: PublicLocale;
}

export function FeaturedBillSection({
  bills,
  locale = "ja",
}: FeaturedBillSectionProps) {
  if (bills.length === 0) {
    return null;
  }
  const { home } = getUiMessages(locale);

  return (
    <section className="flex flex-col gap-6">
      {/* セクションヘッダー */}
      <div lang={locale} className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
          {home.featuredTitle}
        </h2>
        <p className="text-xs font-medium text-mirai-text-secondary leading-[1.67]">
          {home.featuredSubtitle}
        </p>
      </div>

      {/* 注目の議案カード */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {bills.map((bill, index) => {
          const { isLead, spansFullRow } = getFeaturedBillLayout(
            index,
            bills.length
          );
          return (
            <Link
              key={bill.id}
              href={routes.billDetail(bill.id) as Route}
              className={cn("block h-full", spansFullRow && "md:col-span-2")}
            >
              <BillCard
                bill={bill}
                locale={locale}
                variant={isLead ? "lead" : "default"}
                wide={spansFullRow}
                className="h-full max-w-none transition-[background-color,box-shadow] hover:shadow-(--shadow-mirai-md)"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
