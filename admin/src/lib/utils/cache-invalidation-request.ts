export type CacheInvalidationResult =
  | { success: true }
  | { success: false; error: string };

type SendCacheInvalidationRequestOptions = {
  webUrl: string;
  revalidateSecret: string;
  tags?: string[];
  fetchImpl?: typeof fetch;
};

export async function sendCacheInvalidationRequest({
  webUrl,
  revalidateSecret,
  tags,
  fetchImpl = fetch,
}: SendCacheInvalidationRequestOptions): Promise<CacheInvalidationResult> {
  try {
    const response = await fetchImpl(
      `${webUrl.replace(/\/$/, "")}/api/revalidate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${revalidateSecret}`,
        },
        body: tags ? JSON.stringify({ tags }) : undefined,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Cache invalidation failed: ${response.status} ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
