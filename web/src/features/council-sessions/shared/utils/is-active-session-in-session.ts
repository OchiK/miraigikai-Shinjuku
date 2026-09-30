import type { CouncilSession } from "../types";

/**
 * トップに出す定例会（is_active）が、いま開会中か。
 * currentSession は今日の日付が会期内にある定例会。同じ定例会のときだけ開会中とする
 */
export function isActiveSessionInSession(
  activeSession: Pick<CouncilSession, "id"> | null,
  currentSession: Pick<CouncilSession, "id"> | null
): boolean {
  return activeSession != null && currentSession?.id === activeSession.id;
}
