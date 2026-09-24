import { env } from "../env";
import { logger } from "../logger";
import {
  type CacheInvalidationResult,
  sendCacheInvalidationRequest,
} from "./cache-invalidation-request";

/**
 * Web側で定義されているキャッシュタグと同じ値
 * web/src/lib/cache-tags.ts と同期を保つこと
 */
export const WEB_CACHE_TAGS = {
  BILLS: "bills",
  COUNCIL_SESSIONS: "council-sessions",
  DIET_SESSIONS: "diet-sessions",
  INTERVIEW_CONFIGS: "interview-configs",
} as const;

export type WebCacheTag = (typeof WEB_CACHE_TAGS)[keyof typeof WEB_CACHE_TAGS];

/**
 * Invalidate specific cache tags in the web application.
 * If no tags are specified, all caches are invalidated.
 */
export async function invalidateWebCache(
  tags?: WebCacheTag[]
): Promise<CacheInvalidationResult> {
  const usesLocalhostInVercel =
    Boolean(process.env.VERCEL) &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(env.webUrl);

  if (!env.revalidateSecret || usesLocalhostInVercel) {
    const error =
      "Production Web URL or revalidate secret is not configured; cache invalidation was skipped";
    console.error(error);
    return { success: false, error };
  }

  const result = await sendCacheInvalidationRequest({
    webUrl: env.webUrl,
    revalidateSecret: env.revalidateSecret,
    tags,
  });

  if (result.success) {
    logger.debug("Cache invalidated successfully", { tags });
  } else {
    console.error("Failed to invalidate web cache:", result.error);
  }

  return result;
}
