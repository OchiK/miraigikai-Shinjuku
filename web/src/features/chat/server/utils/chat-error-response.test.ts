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
});
