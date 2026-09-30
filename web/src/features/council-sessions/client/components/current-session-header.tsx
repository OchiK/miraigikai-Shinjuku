import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { formatDateWithDots } from "@/lib/utils/date";
import type { CouncilSession } from "../../shared/types";
import { CouncilSessionStatusBadge } from "./council-session-status-badge";

type Props = {
  session: CouncilSession;
  isInSession: boolean;
  locale?: PublicLocale;
};

/** トップページで、いま扱っている定例会の名前と開会状況を示す見出し */
export function CurrentSessionHeader({
  session,
  isInSession,
  locale = "ja",
}: Props) {
  const { home } = getUiMessages(locale);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 className="text-2xl font-bold leading-[1.48] text-mirai-text">
        <span lang="ja">{session.name}</span>
      </h2>
      <CouncilSessionStatusBadge isInSession={isInSession} locale={locale} />
      <p
        lang={locale}
        className="text-sm font-medium text-mirai-text-secondary"
      >
        {home.sessionDates(
          formatDateWithDots(session.start_date),
          session.end_date ? formatDateWithDots(session.end_date) : null
        )}
      </p>
    </div>
  );
}
