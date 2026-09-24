import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { CircleHelp } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";

/**
 * 免責（デザインシステム定義 §9-11）。
 *
 * 非公式であることとAI回答の限界を、各議案の末尾に必ず置く。
 */
export function BillDisclaimer({ locale = "ja" }: { locale?: PublicLocale }) {
  const { disclaimer } = getUiMessages(locale);
  return (
    <section lang={locale} className="rounded-xl bg-mirai-surface-sunken p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            {disclaimer.contentTitle}
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {disclaimer.contentBody}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-mirai-text text-sm">
            {disclaimer.disclaimerTitle}
          </h2>
          <p className="text-mirai-text-muted text-xs leading-[1.9]">
            {disclaimer.disclaimerBody}
          </p>
        </div>

        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-5 font-bold text-mirai-text text-sm shadow-mirai-sm transition-colors hover:bg-neutral-300"
          href={routes.faq() as Route}
        >
          <CircleHelp
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.75}
          />
          {disclaimer.faq}
        </Link>
      </div>
    </section>
  );
}
