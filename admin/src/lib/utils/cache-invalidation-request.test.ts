import { describe, expect, it, vi } from "vitest";
import { sendCacheInvalidationRequest } from "./cache-invalidation-request";

describe("sendCacheInvalidationRequest", () => {
  it("Web の再検証エンドポイントへタグを送る", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

    const result = await sendCacheInvalidationRequest({
      webUrl: "https://web.example.com/",
      revalidateSecret: "secret",
      tags: ["bills"],
      fetchImpl,
    });

    expect(result).toEqual({ success: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://web.example.com/api/revalidate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer secret",
        },
        body: JSON.stringify({ tags: ["bills"] }),
      }
    );
  });

  it("HTTP エラーを呼び出し元へ返す", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    const result = await sendCacheInvalidationRequest({
      webUrl: "https://web.example.com",
      revalidateSecret: "wrong-secret",
      fetchImpl,
    });

    expect(result).toEqual({
      success: false,
      error: "Cache invalidation failed: 401 Unauthorized",
    });
  });

  it("通信エラーを呼び出し元へ返す", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("connection refused"));

    const result = await sendCacheInvalidationRequest({
      webUrl: "https://web.example.com",
      revalidateSecret: "secret",
      fetchImpl,
    });

    expect(result).toEqual({
      success: false,
      error: "connection refused",
    });
  });
});
