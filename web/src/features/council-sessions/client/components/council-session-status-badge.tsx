import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { cn } from "@/lib/utils";

type Props = {
  /** 今日が会期中（開会中）か */
  isInSession: boolean;
  locale?: PublicLocale;
  className?: string;
};

/** 「開会中」「閉会中」を示すピル。色だけでなくラベルでも区別する */
export function CouncilSessionStatusBadge({
  isInSession,
  locale = "ja",
  className,
}: Props) {
  const { home } = getUiMessages(locale);

  return (
    <span
      lang={locale}
      className={cn(
        "inline-flex min-h-8 shrink-0 items-center justify-center rounded-full px-4 py-1.5 text-sm font-bold text-mirai-text",
        isInSession ? "bg-primary" : "bg-neutral-200",
        className
      )}
    >
      {isInSession ? home.inSession : home.notInSession}
    </span>
  );
}
