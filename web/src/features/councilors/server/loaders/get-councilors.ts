import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Councilor } from "../../shared/types";
import { toCouncilor } from "../../shared/utils/to-councilor";
import { findActiveCouncilors } from "../repositories/councilor-repository";

/**
 * 現職の議員一覧（会派・委員会つき、議席番号順）
 */
export const getCouncilors = unstable_cache(
  async (): Promise<Councilor[]> => {
    const rows = await findActiveCouncilors();
    return rows.map(toCouncilor);
  },
  ["councilors"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COUNCILORS],
  }
);
