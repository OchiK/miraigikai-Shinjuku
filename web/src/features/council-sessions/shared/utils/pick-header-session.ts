import type { CouncilSession, CouncilSessionWithSlug } from "../types";

/** slug を持つ（議案一覧ページがある）定例会か */
export function hasSlug(
  session: CouncilSession
): session is CouncilSessionWithSlug {
  return Boolean(session.slug);
}

/**
 * ヘッダーの「議案一覧」リンクと会期バッジに使う定例会を選ぶ。
 * slug の無い定例会は議案一覧ページを持たないので対象外。
 * アクティブな定例会を優先し、無ければ開始日が最も新しいもの（先頭）を返す。
 *
 * @param sessions 開始日の降順に並んだ定例会
 */
export function pickHeaderSession(
  sessions: CouncilSession[]
): CouncilSessionWithSlug | null {
  const withSlug = sessions.filter(hasSlug);
  return withSlug.find((s) => s.is_active) ?? withSlug[0] ?? null;
}

/**
 * ヘッダーの定例会のほかに、議案一覧ページを持つ定例会があるか。
 * デスクトップのヘッダーからは辿れないので、メニューに残す必要がある。
 */
export function hasSessionsBesides(
  sessions: CouncilSession[],
  headerSession: CouncilSessionWithSlug | null
): boolean {
  return sessions.some(
    (session) => hasSlug(session) && session.id !== headerSession?.id
  );
}
