import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { getAllCouncilSessions } from "@/features/council-sessions/server/loaders/get-all-council-sessions";
import { getLocale } from "@/features/i18n/server/loaders/get-locale";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [difficultyLevel, sessions, locale] = await Promise.all([
    getDifficultyLevel(),
    getAllCouncilSessions(),
    getLocale(),
  ]);
  return (
    <HeaderClient
      difficultyLevel={difficultyLevel}
      locale={locale}
      sessions={sessions}
    />
  );
}
