import { describe, expect, it } from "vitest";
import { createStreamMock } from "@/test-utils/mock-language-model";
import { AI_MODELS } from "@/lib/ai/models";
import { calculateUsageCostUsd } from "@/lib/ai/calculate-ai-cost";
import { resolveChatModel, sanitizeApiKey } from "./resolve-chat-model";

describe("sanitizeApiKey", () => {
  it("前後の空白や改行を除去する", () => {
    expect(sanitizeApiKey("  test-key\n ")).toBe("test-key");
  });

  it("前後のダブルクォーテーションを除去する", () => {
    expect(sanitizeApiKey('"test-key"')).toBe("test-key");
  });

  it("前後のシングルクォーテーションを除去する", () => {
    expect(sanitizeApiKey("'test-key'")).toBe("test-key");
  });

  it("空文字や空白のみの場合は undefined を返す", () => {
    expect(sanitizeApiKey("")).toBeUndefined();
    expect(sanitizeApiKey("   ")).toBeUndefined();
    expect(sanitizeApiKey('""')).toBeUndefined();
    expect(sanitizeApiKey(undefined)).toBeUndefined();
  });
});

describe("resolveChatModel", () => {
  it("GEMINI_API_KEY があればGoogle直結のgemini-3.8-flashを返す", () => {
    const result = resolveChatModel({ geminiApiKey: "test-key" });

    expect(result.provider).toBe("google");
    expect(result.modelId).toBe("gemini-3.8-flash");
    expect(typeof result.model).not.toBe("string");
  });

  it("クォーテーション付きの GEMINI_API_KEY もサニタイズして Google 直結にする", () => {
    const result = resolveChatModel({ geminiApiKey: ' "test-key" ' });

    expect(result.provider).toBe("google");
    expect(result.modelId).toBe("gemini-3.8-flash");
  });

  it("GEMINI_API_KEY がなければGateway経由のgpt-4o-miniにフォールバックする", () => {
    const result = resolveChatModel({});

    expect(result.provider).toBe("gateway");
    expect(result.model).toBe(AI_MODELS.gpt4o_mini);
    expect(result.modelId).toBe("openai/gpt-4o-mini");
  });

  it("customModel はAPIキーより優先される", () => {
    const mock = createStreamMock(["x"]);
    const result = resolveChatModel({
      customModel: mock,
      geminiApiKey: "test-key",
    });

    expect(result.provider).toBe("custom");
    expect(result.model).toBe(mock);
  });

  it("返した modelId は必ず単価表に存在する", () => {
    const usage = { inputTokens: 1000, outputTokens: 1000, totalTokens: 2000 };
    for (const key of ["test-key", undefined]) {
      const { modelId } = resolveChatModel({ geminiApiKey: key });
      expect(calculateUsageCostUsd(modelId, usage)).toBeGreaterThan(0);
    }
  });
});
