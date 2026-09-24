import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { formatDateWithDots } from "@/lib/utils/date";
import type { CouncilSession } from "../../shared/types";

type CurrentCouncilSessionProps = {
  session: CouncilSession | null;
  locale?: PublicLocale;
};

export function CurrentCouncilSession({
  session,
  locale = "ja",
}: CurrentCouncilSessionProps) {
  const { home } = getUiMessages(locale);
  return (
    <div className="w-full bg-mirai-surface-sunken px-6 py-6">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 flex-1">
          <h2
            lang={locale}
            className="text-xl font-bold text-mirai-text leading-[0.9]"
          >
            {home.today}
          </h2>
          <div
            className={`
            inline-flex items-center justify-center px-5 py-1.5 rounded-[50px]  shrink-0
            ${session == null ? "bg-mirai-border" : "bg-primary text-mirai-text"}
            `}
          >
            <span lang={locale} className="text-base font-bold leading-[1.48]">
              {session == null ? home.notInSession : home.inSession}
            </span>
          </div>
        </div>
        {session != null && (
          <div className="text-sm leading-[1.5] shrink-0">
            <div lang="ja">{session.name}</div>
            <div lang={locale}>
              {home.sessionFrom(formatDateWithDots(session.start_date))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
