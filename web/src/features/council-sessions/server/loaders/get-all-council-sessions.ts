import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilSession } from "../../shared/types";
import { findAllCouncilSessions } from "../repositories/council-session-repository";

/**
 * 全定例会を開始日の降順で取得
 */
export async function getAllCouncilSessions(): Promise<CouncilSession[]> {
  const cached = await _getCachedAllCouncilSessions();
  if (cached && cached.length > 0) {
    return cached;
  }
  return findAllCouncilSessions();
}

const _getCachedAllCouncilSessions = unstable_cache(
  async (): Promise<CouncilSession[]> => {
    return findAllCouncilSessions();
  },
  ["all-council-sessions-v2"],
  {
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.COUNCIL_SESSIONS],
  }
);
