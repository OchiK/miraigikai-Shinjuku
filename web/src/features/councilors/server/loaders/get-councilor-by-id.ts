import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Councilor } from "../../shared/types";
import { isUuid } from "../../shared/utils/is-uuid";
import { toCouncilor } from "../../shared/utils/to-councilor";
import { findActiveCouncilorById } from "../repositories/councilor-repository";

/**
 * 議員1人の詳細（会派・委員会つき）。見つからなければ null
 * UUID でない id は DB に問い合わせず null にする（不正な URL を 404 にする）
 */
export async function getCouncilorById(id: string): Promise<Councilor | null> {
  if (!isUuid(id)) return null;
  return _getCachedCouncilorById(id);
}

const _getCachedCouncilorById = unstable_cache(
  async (id: string): Promise<Councilor | null> => {
    const row = await findActiveCouncilorById(id);
    return row ? toCouncilor(row) : null;
  },
  ["councilor-by-id"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COUNCILORS],
  }
);
