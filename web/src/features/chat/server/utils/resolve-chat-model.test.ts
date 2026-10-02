import { describe, expect, it } from "vitest";
import { createStreamMock } from "@/test-utils/mock-language-model";
import { AI_MODELS } from "@/lib/ai/models";
import { calculateUsageCostUsd } from "@/lib/ai/calculate-ai-cost";
import { resolveChatModel } from "./resolve-chat-model";

describe("resolveChatModel", () => {
  it("GEMINI_API_KEY があればGoogle直結のgemini-2.5-flashを返す", () => {
    const result = resolveChatModel({ geminiApiKey: "test-key" });

    expect(result.provider).toBe("google");
    expect(result.modelId).toBe("gemini-2.5-flash");
    expect(typeof result.model).not.toBe("string");
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
