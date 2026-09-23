import { openai } from "@ai-sdk/openai";
import type { Database } from "@mirai-gikai/supabase";
import {
  convertToModelMessages,
  type LanguageModel,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { siteConfig } from "@/config/site.config";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { parseDifficultyLevel } from "@/features/bill-difficulty/shared/utils/parse-difficulty-level";
import type { BillWithContent } from "@/features/bills/shared/types";
import {
  SUGGEST_INTERVIEW_TOOL_NAME,
  SUGGEST_INTERVIEW_TOOL_TYPE,
} from "@/features/chat/shared/constants";
import { ChatError, ChatErrorCode } from "@/features/chat/shared/types/errors";
import { findPublicInterviewConfigByBillId } from "@/features/interview-config/server/repositories/interview-config-repository";
import { AI_MODELS } from "@/lib/ai/models";
import { env } from "@/lib/env";
import {
  type CompiledPrompt,
  createPromptProvider,
  type PromptProvider,
} from "@/lib/prompt";
import { loadPublishedBillForChat } from "../loaders/load-published-bill-for-chat";
import { isWithinDailyCostLimit, recordChatUsage } from "./cost-tracker";
import {
  checkSystemDailyCostLimit,
  checkSystemMonthlyCostLimit,
} from "./system-cost-guard";

export type ChatMessageMetadata = {
  /** チャットは必ず1つの議案に紐づく（デザインシステム定義 §10） */
  billContext: BillWithContent;
  hasInterviewConfig?: boolean;
  difficultyLevel: DifficultyLevelEnum;
  sessionId: string;
};

type ChatRequestParams = {
  messages: UIMessage<ChatMessageMetadata>[];
  userId: string;
  deps?: HandleChatDeps;
};

/** テスト時にモック注入するための外部依存 */
export type HandleChatDeps = {
  promptProvider?: PromptProvider;
  model?: LanguageModel;
  /** 既定は siteConfig.features.aiChat */
  chatEnabled?: boolean;
  /** 既定は公開済み議案のみ返す loadPublishedBillForChat */
  billLoader?: (
    billId: string,
    difficultyLevel: DifficultyLevelEnum
  ) => Promise<BillWithContent | null>;
  /** 既定はユーザー日次・システム日次・システム月次の上限チェック */
  checkCostLimits?: (userId: string) => Promise<void>;
};

type ChatUsageMetadata =
  Database["public"]["Tables"]["chat_usage_events"]["Insert"]["metadata"];

/**
 * チャットリクエストを処理してストリーミングレスポンスを返す
 */
export async function handleChatRequest({
  messages,
  userId,
  deps,
}: ChatRequestParams) {
  // 画面を経由しないリクエストもAPIで止める
  const chatEnabled = deps?.chatEnabled ?? siteConfig.features.aiChat;
  if (!chatEnabled) {
    throw new ChatError(ChatErrorCode.CHAT_DISABLED);
  }

  const promptProvider = deps?.promptProvider ?? createPromptProvider();

  // Extract context from messages
  const clientContext = extractChatContext(messages);

  // クライアントの billContext は議案IDだけを信用し、本文はDBの公開データで置き換える
  const billLoader = deps?.billLoader ?? loadPublishedBillForChat;
  const verifiedBill = await billLoader(
    clientContext.billContext.id,
    clientContext.difficultyLevel
  );
  if (!verifiedBill) {
    throw new ChatError(ChatErrorCode.BILL_NOT_PUBLISHED);
  }
  const context: ChatMessageMetadata = {
    ...clientContext,
    billContext: verifiedBill,
  };

  const checkCostLimits = deps?.checkCostLimits ?? checkAllCostLimits;
  try {
    await checkCostLimits(userId);
  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    // 上限を確認できないまま有料APIを呼ばない（fail-closed）
    console.error("Cost limit check error:", error);
    throw new ChatError(
      ChatErrorCode.COST_CHECK_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Build prompt configuration
  const { promptName, promptResult } = await buildPrompt(
    context,
    promptProvider
  );
  // Model configuration
  const model = deps?.model ?? AI_MODELS.gpt4o;
  const modelName =
    typeof model === "string" ? model : (model.modelId ?? "unknown");

  // Determine if interview suggestion should be enabled
  const shouldSuggestInterview = await determineShouldSuggestInterview(
    context,
    messages
  );

  // Build system prompt with interview suggestion instructions
  const systemPrompt = buildSystemPromptWithInterviewInstructions(
    promptResult.content,
    shouldSuggestInterview
  );

  // Build tools configuration
  const tools = buildTools(shouldSuggestInterview);

  // Generate streaming response
  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      onFinish: async (event) => {
        try {
          const providerCost = extractGatewayCost(event);
          await recordChatUsage({
            userId,
            sessionId: context.sessionId || undefined,
            promptName,
            model: modelName,
            usage: event.totalUsage,
            costUsd: providerCost,
            metadata: buildUsageMetadata(context, event),
          });
        } catch (usageError) {
          console.error("Failed to record chat usage:", usageError);
        }
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: promptName,
        metadata: buildTelemetryMetadata(context, promptResult, userId),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * ユーザー日次・システム日次・システム月次のコスト上限を確認する。
 * 上限超過時は ChatError をスローする。
 */
async function checkAllCostLimits(userId: string): Promise<void> {
  const isWithinLimit = await isWithinDailyCostLimit(
    userId,
    env.chat.dailyUserCostLimitUsd
  );
  if (!isWithinLimit) {
    throw new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED);
  }

  await checkSystemDailyCostLimit();
  await checkSystemMonthlyCostLimit();
}

/**
 * メッセージから最初のメタデータを抽出してコンテキストを作成
 */
function extractChatContext(
  messages: UIMessage<ChatMessageMetadata>[]
): ChatMessageMetadata {
  const metadata = messages[0]?.metadata;

  // 議案に紐づかないチャットは受け付けない
  if (!metadata?.billContext) {
    throw new ChatError(ChatErrorCode.BILL_CONTEXT_REQUIRED);
  }

  return {
    billContext: metadata.billContext,
    hasInterviewConfig: metadata.hasInterviewConfig,
    // プロンプト名に使うため、許可された難易度以外は既定値に落とす
    difficultyLevel: parseDifficultyLevel(metadata.difficultyLevel),
    sessionId: metadata.sessionId || "",
  };
}

/**
 * コンテキストに基づいてプロンプトを組み立てる
 */
async function buildPrompt(
  context: ChatMessageMetadata,
  promptProvider: PromptProvider
) {
  // Determine prompt name
  const promptName = `bill-chat-system-${context.difficultyLevel}`;

  // Prepare prompt variables
  const variables: Record<string, string> = {
    billName: context.billContext.name,
    billTitle: context.billContext.bill_content?.title ?? "",
    billSummary: context.billContext.bill_content?.summary ?? "",
    billContent: context.billContext.bill_content?.content ?? "",
  };

  // Fetch prompt from Langfuse
  try {
    const promptResult = await promptProvider.getPrompt(promptName, variables);
    return { promptName, promptResult };
  } catch (error) {
    console.error("Prompt fetch error:", error);
    throw new ChatError(
      ChatErrorCode.PROMPT_FETCH_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * テレメトリメタデータを構築
 */
function buildTelemetryMetadata(
  context: ChatMessageMetadata,
  promptResult: CompiledPrompt,
  userId: string
) {
  return {
    langfusePrompt: promptResult.metadata,
    billId: context.billContext.id,
    pageType: "bill",
    difficultyLevel: context.difficultyLevel,
    userId,
    sessionId: context.sessionId,
  };
}

function buildUsageMetadata(
  context: ChatMessageMetadata,
  finishEvent: { finishReason?: unknown; steps?: unknown[] }
): ChatUsageMetadata {
  const finishReason =
    typeof finishEvent.finishReason === "string"
      ? finishEvent.finishReason
      : null;
  const stepCount = Array.isArray(finishEvent.steps)
    ? finishEvent.steps.length
    : 0;

  return {
    pageType: "bill",
    difficultyLevel: context.difficultyLevel,
    billId: context.billContext.id,
    finishReason,
    stepCount,
  };
}

function extractGatewayCost(event: {
  providerMetadata?: unknown;
}): number | undefined {
  const providerMetadata = event.providerMetadata;
  if (!providerMetadata || typeof providerMetadata !== "object") {
    return undefined;
  }

  const gatewayCost = (
    providerMetadata as {
      gateway?: { cost?: unknown };
    }
  ).gateway?.cost;

  const numericCost = Number(gatewayCost);

  return Number.isFinite(numericCost) ? numericCost : undefined;
}

const INTERVIEW_AWARENESS_BASE = `

## AIインタビュー機能について
${siteConfig.siteName}には「AIインタビュー」機能があります。これは議案ごとに提供される機能で、ユーザーがAIインタビュアーと対話形式で議案に対する意見や知見を共有できる仕組みです。インタビュー結果は分析・レポート化され、地域課題の議論に活用されます。
`;

const INTERVIEW_AWARENESS_PROMPT_BILL = `${INTERVIEW_AWARENESS_BASE}
この議案のインタビュー機能が現在利用可能かどうかは状況によって異なります。インタビューについて質問された場合は、この機能の存在を説明した上で、議案詳細ページでインタビューへの案内が表示されているか確認するよう案内してください。
`;

const INTERVIEW_SUGGESTION_PROMPT = `

## AIインタビュー提案について
この議案にはAIインタビュー機能があります。以下の条件に該当する場合、通常のテキスト応答と併せて suggest_interview ツールを呼び出してください。
ただし、1つの会話の中で suggest_interview ツールを呼び出すのは1回のみとしてください。

### suggest_interview を呼び出す条件:
- ユーザーがこの議案の当事者や関係者であることがわかった場合
- ユーザーがこの議案について専門的な知識を持っていると判断できる場合
- ユーザーがこの議案に対して具体的な提言や意見を述べた場合
- ユーザーがインタビューや意見提出について質問した場合
- ユーザーが自分の意見を共有したい、政策に反映してほしいと表明した場合

### 重要:
- suggest_interview ツールの呼び出しは、通常のテキスト応答と同時に行ってください。ツールだけを呼び出してテキスト応答を省略しないでください。
- ツールの呼び出しは会話全体で最大1回です。既に呼び出し済みの場合は再度呼び出さないでください。
`;

/**
 * インタビュー提案を有効にすべきか判定
 *
 * 以下のすべてを満たす場合にtrueを返す:
 * - 法案ページである
 * - サーバー側でインタビュー設定が公開状態であることを確認
 * - 会話中にまだsuggest_interviewツールが呼び出されていない
 *
 * NOTE: インタビュー回答済みでも導線を表示する（再回答の促進のため）
 */
async function determineShouldSuggestInterview(
  context: ChatMessageMetadata,
  messages: UIMessage<ChatMessageMetadata>[]
): Promise<boolean> {
  if (!siteConfig.features.aiInterview) {
    return false;
  }

  if (hasExistingSuggestInterview(messages)) {
    return false;
  }

  // サーバー側でインタビュー設定の存在を検証（クライアント側のメタデータを信頼しない）
  const { data: interviewConfig } = await findPublicInterviewConfigByBillId(
    context.billContext.id
  );
  return !!interviewConfig;
}

/**
 * 会話履歴にsuggest_interviewツール呼び出しが既に存在するか判定
 */
function hasExistingSuggestInterview(
  messages: UIMessage<ChatMessageMetadata>[]
): boolean {
  return messages.some(
    (msg) =>
      msg.role === "assistant" &&
      msg.parts.some(
        (part) =>
          "toolCallId" in part && part.type === SUGGEST_INTERVIEW_TOOL_TYPE
      )
  );
}

/**
 * インタビュー提案の指示をシステムプロンプトに追加
 */
function buildSystemPromptWithInterviewInstructions(
  basePrompt: string,
  shouldSuggestInterview: boolean
): string {
  if (!siteConfig.features.aiInterview) {
    return basePrompt;
  }
  let prompt = basePrompt + INTERVIEW_AWARENESS_PROMPT_BILL;
  if (shouldSuggestInterview) {
    prompt += INTERVIEW_SUGGESTION_PROMPT;
  }
  return prompt;
}

/**
 * チャットで使用するツール一覧を構築
 */
function buildTools(shouldSuggestInterview: boolean) {
  // biome-ignore lint/suspicious/noExplicitAny: OpenAI web_search tool type incompatibility
  const tools: Record<string, any> = {
    web_search: openai.tools.webSearch(),
  };

  if (shouldSuggestInterview) {
    tools[SUGGEST_INTERVIEW_TOOL_NAME] = tool({
      description:
        "ユーザーが議案の当事者・有識者であると判断された場合、またはインタビューについて聞かれた場合に呼び出す。通常のテキスト応答と同時に呼び出すこと。",
      inputSchema: z.object({}),
      execute: async () => ({ suggested: true }),
    });
  }

  return tools;
}
