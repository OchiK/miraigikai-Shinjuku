import { describe, it, expect } from "vitest";
import { ChatError, ChatErrorCode } from "../../shared/types/errors";
import { chatErrorToResponse } from "./chat-error-response";

describe("chatErrorToResponse", () => {
  it("DAILY_COST_LIMIT_REACHED で 429 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED)
    );
    expect(res.status).toBe(429);
    expect(await res.text()).toContain("本日の利用上限");
  });

  it("SYSTEM_DAILY_COST_LIMIT_REACHED で 429 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.SYSTEM_DAILY_COST_LIMIT_REACHED)
    );
    expect(res.status).toBe(429);
    expect(await res.text()).toContain("本日の利用上限");
  });

  it("SYSTEM_MONTHLY_COST_LIMIT_REACHED で 429 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.SYSTEM_MONTHLY_COST_LIMIT_REACHED)
    );
    expect(res.status).toBe(429);
    expect(await res.text()).toContain("今月の利用上限");
  });

  it("CHAT_DISABLED で 503 を返す", async () => {
    const res = chatErrorToResponse(new ChatError(ChatErrorCode.CHAT_DISABLED));
    expect(res.status).toBe(503);
    expect(await res.text()).toContain("メンテナンス中");
  });

  it("BILL_NOT_PUBLISHED で 403 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.BILL_NOT_PUBLISHED)
    );
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("公開されていません");
  });

  it("BILL_CONTENT_UNAVAILABLE で 503 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.BILL_CONTENT_UNAVAILABLE)
    );
    expect(res.status).toBe(503);
    expect(await res.text()).toContain("議案情報を取得できませんでした");
  });

  it("COST_CHECK_FAILED で 503 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.COST_CHECK_FAILED)
    );
    expect(res.status).toBe(503);
    expect(await res.text()).toContain("一時的に利用できません");
  });

  it("その他の ChatError で 500 を返す", async () => {
    const res = chatErrorToResponse(
      new ChatError(ChatErrorCode.PROMPT_FETCH_FAILED)
    );
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("エラーが発生しました");
  });

  it("ChatError 以外のエラーで 500 を返す", async () => {
    const res = chatErrorToResponse(new Error("unexpected"));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("エラーが発生しました");
  });

  describe("英語", () => {
    it("日次上限は429で英語の文言を返す", async () => {
      const res = chatErrorToResponse(
        new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED),
        "en"
      );
      expect(res.status).toBe(429);
      expect(await res.text()).toContain("today's usage limit");
    });

    it("月次上限は429で英語の文言を返す", async () => {
      const res = chatErrorToResponse(
        new ChatError(ChatErrorCode.SYSTEM_MONTHLY_COST_LIMIT_REACHED),
        "en"
      );
      expect(res.status).toBe(429);
      expect(await res.text()).toContain("monthly usage limit");
    });

    it.each([
      [ChatErrorCode.BILL_CONTEXT_REQUIRED, 400, "No bill was specified"],
      [ChatErrorCode.BILL_NOT_PUBLISHED, 403, "not currently published"],
      [ChatErrorCode.BILL_CONTENT_UNAVAILABLE, 503, "could not load"],
      [ChatErrorCode.COST_CHECK_FAILED, 503, "temporarily unavailable"],
      [ChatErrorCode.CHAT_DISABLED, 503, "under maintenance"],
    ] as const)("%s は英語の文言を返す", async (code, status, text) => {
      const res = chatErrorToResponse(new ChatError(code), "en");
      expect(res.status).toBe(status);
      expect(await res.text()).toContain(text);
    });

    it("ChatError 以外は500で英語の汎用文言を返す", async () => {
      const res = chatErrorToResponse(new Error("boom"), "en");
      expect(res.status).toBe(500);
      expect(await res.text()).toContain("Something went wrong");
    });
  });
});
