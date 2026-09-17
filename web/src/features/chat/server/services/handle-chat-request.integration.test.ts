import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { LanguageModelUsage, UIMessage } from "ai";
import {
  adminClient,
  createTestUser,
  cleanupTestUser,
  type TestUser,
} from "@test-utils/utils";
import { createStreamMock } from "@/test-utils/mock-language-model";
import { createMockPromptProvider } from "@/test-utils/mock-prompt-provider";
import {
  handleChatRequest,
  type ChatMessageMetadata,
} from "./handle-chat-request";
import type { BillWithContent } from "@/features/bills/shared/types";
import { ChatError, ChatErrorCode } from "@/features/chat/shared/types/errors";
import { recordChatUsage } from "./cost-tracker";

/**
 * Response のボディストリームを全て読み込み、テキストとして返す。
 * onFinish コールバックを発火させるために必要。
 */
async function consumeResponseStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

/**
 * テスト用の議案コンテキスト。
 * プロンプト組み立てに使う項目のみ持たせ、Row の全カラムは再現しない。
 */
function createTestBill(): BillWithContent {
  return {
    id: "test-bill-1",
    name: "議案第1号",
    bill_content: {
      title: "テスト議案のタイトル",
      summary: "テスト議案の要約",
      content: "テスト議案の本文",
    },
    tags: [],
  } as unknown as BillWithContent;
}

/**
 * テスト用メッセージを作成するヘルパー
 */
function createTestMessages(
  overrides: Partial<ChatMessageMetadata> = {}
): UIMessage<ChatMessageMetadata>[] {
  return [
    {
      id: "test-msg-1",
      role: "user",
      parts: [{ type: "text", text: "テスト質問です" }],
      metadata: {
        billContext: createTestBill(),
        difficultyLevel: "normal",
        sessionId: "",
        ...overrides,
      },
    },
  ];
}

describe("handleChatRequest 統合テスト", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await adminClient
      .from("chat_usage_events")
      .delete()
      .eq("user_id", testUser.id);
    await cleanupTestUser(testUser.id);
  });

  describe("ストリーミングレスポンス", () => {
    it("mock model + mock promptProvider でストリーミングレスポンスが返る", async () => {
      const mockModel = createStreamMock([
        "こんにちは",
        "！",
        "テスト応答です。",
      ]);
      const mockPromptProvider = createMockPromptProvider();
      const messages = createTestMessages();

      const response = await handleChatRequest({
        messages,
        userId: testUser.id,
        deps: { model: mockModel, promptProvider: mockPromptProvider },
      });

      expect(response.status).toBe(200);
      const content = await consumeResponseStream(response);
      // AI SDK のストリーム形式でテキストが含まれている
      expect(content.length).toBeGreaterThan(0);
    });

    it("billContext を持つメッセージで bill-chat-system プロンプトが選択される", async () => {
      const promptProvider = createMockPromptProvider(
        "請求書チャット用システムプロンプト"
      );
      const receivedPromptNames: string[] = [];
      const receivedVariables: (Record<string, string> | undefined)[] = [];

      // getPrompt が呼ばれた際にプロンプト名と変数を記録するカスタムプロバイダー
      const trackingPromptProvider = {
        getPrompt: async (name: string, variables?: Record<string, string>) => {
          receivedPromptNames.push(name);
          receivedVariables.push(variables);
          return promptProvider.getPrompt(name, variables);
        },
      };

      const mockModel = createStreamMock(["テスト応答"]);
      const messages = createTestMessages({
        difficultyLevel: "normal",
      });

      const response = await handleChatRequest({
        messages,
        userId: testUser.id,
        deps: { model: mockModel, promptProvider: trackingPromptProvider },
      });

      await consumeResponseStream(response);

      expect(receivedPromptNames).toHaveLength(1);
      expect(receivedPromptNames[0]).toBe("bill-chat-system-normal");
      // billContext の内容がそのままプロンプト変数に渡る
      expect(receivedVariables[0]).toEqual({
        billName: "議案第1号",
        billTitle: "テスト議案のタイトル",
        billSummary: "テスト議案の要約",
        billContent: "テスト議案の本文",
      });
    });

    it("billContext を持たないメッセージは BILL_CONTEXT_REQUIRED で拒否される", async () => {
      const mockModel = createStreamMock(["テスト応答"]);
      const mockPromptProvider = createMockPromptProvider();
      const messages = createTestMessages();
      // 議案に紐づかないチャットは受け付けない（デザインシステム定義 §10）
      messages[0].metadata = {
        difficultyLevel: "normal",
        sessionId: "",
      } as unknown as ChatMessageMetadata;

      await expect(
        handleChatRequest({
          messages,
          userId: testUser.id,
          deps: { model: mockModel, promptProvider: mockPromptProvider },
        })
      ).rejects.toMatchObject({
        code: ChatErrorCode.BILL_CONTEXT_REQUIRED,
      });
    });

    it("難易度に応じた bill-chat-system プロンプトが選択される", async () => {
      const receivedPromptNames: string[] = [];
      const trackingPromptProvider = {
        getPrompt: async (name: string) => {
          receivedPromptNames.push(name);
          return { content: "議案チャット用プロンプト", metadata: "{}" };
        },
      };

      const mockModel = createStreamMock(["テスト応答"]);
      const messages = createTestMessages({ difficultyLevel: "hard" });

      const response = await handleChatRequest({
        messages,
        userId: testUser.id,
        deps: { model: mockModel, promptProvider: trackingPromptProvider },
      });

      await consumeResponseStream(response);

      expect(receivedPromptNames[0]).toBe("bill-chat-system-hard");
    });
  });

  describe("chat_usage_events の保存", () => {
    it("ストリーム完了後に chat_usage_events が DB に保存される", async () => {
      const sessionId = `test-session-${Date.now()}`;
      const mockModel = createStreamMock(["テスト応答"]);
      const mockPromptProvider = createMockPromptProvider();
      const messages = createTestMessages({ sessionId });

      const response = await handleChatRequest({
        messages,
        userId: testUser.id,
        deps: { model: mockModel, promptProvider: mockPromptProvider },
      });

      // ストリームを全て読み込んで onFinish を発火させる
      await consumeResponseStream(response);

      // onFinish は非同期のため少し待つ
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { data: usageEvents } = await adminClient
        .from("chat_usage_events")
        .select("*")
        .eq("user_id", testUser.id);

      expect(usageEvents).toHaveLength(1);
      expect(usageEvents?.[0].user_id).toBe(testUser.id);
      expect(usageEvents?.[0].session_id).toBe(sessionId);
      expect(usageEvents?.[0].metadata).toMatchObject({
        pageType: "bill",
        billId: "test-bill-1",
      });
    });

    it("sessionId が空の場合は session_id が null として保存される", async () => {
      const mockModel = createStreamMock(["応答"]);
      const mockPromptProvider = createMockPromptProvider();
      const messages = createTestMessages({ sessionId: "" });

      const response = await handleChatRequest({
        messages,
        userId: testUser.id,
        deps: { model: mockModel, promptProvider: mockPromptProvider },
      });

      await consumeResponseStream(response);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { data: usageEvents } = await adminClient
        .from("chat_usage_events")
        .select("session_id")
        .eq("user_id", testUser.id);

      expect(usageEvents).toHaveLength(1);
      expect(usageEvents?.[0].session_id).toBeNull();
    });
  });

  describe("コストリミット超過", () => {
    it("日次コストリミットを超過している場合は ChatError をスローする", async () => {
      // デイリーコストリミットを超える記録を事前にシード
      await recordChatUsage({
        userId: testUser.id,
        model: "openai/gpt-4o",
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        } as LanguageModelUsage,
        costUsd: 9999.99,
      });

      const mockModel = createStreamMock(["テスト"]);
      const mockPromptProvider = createMockPromptProvider();
      const messages = createTestMessages();

      await expect(
        handleChatRequest({
          messages,
          userId: testUser.id,
          deps: { model: mockModel, promptProvider: mockPromptProvider },
        })
      ).rejects.toThrow(ChatError);

      await expect(
        handleChatRequest({
          messages,
          userId: testUser.id,
          deps: { model: mockModel, promptProvider: mockPromptProvider },
        })
      ).rejects.toMatchObject({
        code: ChatErrorCode.DAILY_COST_LIMIT_REACHED,
      });
    });
  });
});
