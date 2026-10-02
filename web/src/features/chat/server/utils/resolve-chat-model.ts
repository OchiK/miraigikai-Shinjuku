import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { AI_MODELS, GEMINI_DIRECT_CHAT_MODEL_ID } from "@/lib/ai/models";

export type ChatModelProvider = "google" | "gateway" | "custom";

type ResolveChatModelParams = {
  /** テストなどから注入されるモデル。指定されたらそのまま使う */
  customModel?: LanguageModel;
  geminiApiKey?: string;
};

type ResolvedChatModel = {
  model: LanguageModel;
  provider: ChatModelProvider;
  /** modelPricing のキーと一致するID（コスト計算に使う） */
  modelId: string;
};

/**
 * APIキーの前後の空白やクォーテーション（" または '）を除去する
 */
export function sanitizeApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  const trimmed = key
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * チャットで使うモデルを決める。
 * GEMINI_API_KEY があればGoogle AI Studio直結、なければGateway経由のgpt-4o-mini。
 */
export function resolveChatModel({
  customModel,
  geminiApiKey,
}: ResolveChatModelParams): ResolvedChatModel {
  if (customModel) {
    return {
      model: customModel,
      provider: "custom",
      modelId:
        typeof customModel === "string"
          ? customModel
          : (customModel.modelId ?? "unknown"),
    };
  }

  const sanitizedKey = sanitizeApiKey(geminiApiKey);

  if (sanitizedKey) {
    const google = createGoogleGenerativeAI({ apiKey: sanitizedKey });
    return {
      model: google(GEMINI_DIRECT_CHAT_MODEL_ID),
      provider: "google",
      modelId: GEMINI_DIRECT_CHAT_MODEL_ID,
    };
  }

  return {
    model: AI_MODELS.gpt4o_mini,
    provider: "gateway",
    modelId: AI_MODELS.gpt4o_mini,
  };
}
