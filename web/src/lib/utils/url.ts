import { headers } from "next/headers";

export function buildOriginUrl(
  host: string | null,
  proto: string | null
): string {
  return `${proto ?? "https"}://${host}`;
}

export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return buildOriginUrl(host, proto);
}

/**
 * サイトの正規ベースURLを解決する。
 * NEXT_PUBLIC_WEB_URL が設定されていればそれを最優先し、
 * Vercelの各種環境変数をフォールバックとして使用する。
 */
export function resolveSiteUrl(options?: {
  webUrl?: string;
  vercelProjectProductionUrl?: string;
  vercelUrl?: string;
}): string {
  const webUrl = options?.webUrl ?? process.env.NEXT_PUBLIC_WEB_URL;
  if (webUrl && webUrl !== "http://localhost:3000") {
    return webUrl.replace(/\/+$/, "");
  }

  const vercelProd =
    options?.vercelProjectProductionUrl ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) {
    return `https://${vercelProd.replace(/\/+$/, "")}`;
  }

  const vercelUrl = options?.vercelUrl ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return (webUrl || "http://localhost:3000").replace(/\/+$/, "");
}
