import { getBillsByFeaturedTags } from "@/features/bills/server/loaders/get-bills-by-featured-tags";
import { getActiveCouncilSession } from "@/features/council-sessions/server/loaders/get-active-council-session";
import { getCurrentCouncilSession } from "@/features/council-sessions/server/loaders/get-current-council-session";
import { getJapanTime } from "@/lib/utils/date";
import { getFeaturedBills } from "./get-featured-bills";
import { getPreviousSessionBills } from "./get-previous-session-bills";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData() {
  const [
    featuredBills,
    billsByTag,
    previousSessionData,
    activeSession,
    currentSession,
  ] = await Promise.all([
    getFeaturedBills(),
    getBillsByFeaturedTags(),
    getPreviousSessionBills(),
    getActiveCouncilSession(),
    getCurrentCouncilSession(getJapanTime()),
  ]);

  return {
    billsByTag,
    featuredBills,
    previousSessionData,
    activeSession,
    activeSessionSlug: activeSession?.slug ?? null,
    // is_active は「トップに出す定例会」のフラグ。開会中かどうかは会期の日付で決める
    isInSession:
      activeSession != null && currentSession?.id === activeSession.id,
  };
}
