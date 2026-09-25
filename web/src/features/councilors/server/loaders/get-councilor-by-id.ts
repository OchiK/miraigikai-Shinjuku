import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilorDetail } from "../../shared/types";
import { isUuid } from "../../shared/utils/is-uuid";
import { toCouncilorDetail } from "../../shared/utils/to-councilor";
import {
  findActiveCouncilorById,
  findQuestionsByCouncilorId,
} from "../repositories/councilor-repository";

/**
 * 議員1人の詳細（会派・委員会・掲載中の質問つき）。見つからなければ null
 * UUID でない id は DB に問い合わせず null にする（不正な URL を 404 にする）
 */
export async function getCouncilorById(
  id: string
): Promise<CouncilorDetail | null> {
  if (!isUuid(id)) return null;
  return _getCachedCouncilorById(id);
}

const _getCachedCouncilorById = unstable_cache(
  async (id: string): Promise<CouncilorDetail | null> => {
    const row = await findActiveCouncilorById(id);
    if (!row) return null;
    const questionRows = await findQuestionsByCouncilorId(row.id);
    return toCouncilorDetail(row, questionRows);
  },
  // v2: 質問一覧を追加。旧形のキャッシュを読まないようキーを変える
  ["councilor-by-id-v2"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.COUNCILORS],
  }
);
