"use client";

import { Send, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputError,
  PromptInputHint,
  type PromptInputMessage,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import type { BillWithContent } from "@/features/bills/shared/types";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { SystemMessage } from "./system-message";
import { UserMessage } from "./user-message";

/** チャットは議案に紐づくため、質問例も議案についてのものだけを出す */
const SAMPLE_QUESTIONS = [
  "この議案のポイントは？",
  "この議案は私にどんな影響がある？",
] as const;

interface ChatWindowProps {
  /** チャットは必ず1つの議案に紐づく（デザインシステム定義 §10） */
  billContext: BillWithContent;
  hasInterviewConfig?: boolean;
  difficultyLevel: string;
  chatState: ReturnType<typeof import("@ai-sdk/react").useChat>;
  isOpen: boolean;
  onClose: () => void;
  disableAutoFocus?: boolean;
  sessionId: string;
}

/**
 * Conversation内部で使用するコンポーネント
 * useStickToBottomContextを使用するために分離
 */
function ChatMessages({
  billContext,
  hasInterviewConfig,
  difficultyLevel,
  messages,
  sendMessage,
  status,
  sessionId,
}: {
  billContext: BillWithContent;
  hasInterviewConfig?: boolean;
  difficultyLevel: string;
  messages: ChatWindowProps["chatState"]["messages"];
  sendMessage: ChatWindowProps["chatState"]["sendMessage"];
  status: ChatWindowProps["chatState"]["status"];
  sessionId: string;
}) {
  const { scrollToBottom } = useStickToBottomContext();
  const userMessageLength = messages.filter((x) => x.role === "user").length;
  const isResponding = status === "streaming" || status === "submitted";

  // メッセージが追加されたら自動的にスクロール
  useEffect(() => {
    if (userMessageLength > 0) {
      scrollToBottom();
    }
  }, [userMessageLength, scrollToBottom]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* 初期メッセージ */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold leading-[1.8] text-mirai-text">
            この議案について、気になることをAIに質問してください。
          </p>
          <p className="text-sm font-bold leading-[1.8] text-mirai-text">
            本文中のテキストを選択すると簡単にAIに質問できます
          </p>
        </div>

        {/* サンプル質問チップ */}
        <div className="flex flex-wrap gap-3">
          {SAMPLE_QUESTIONS.map((question) => {
            return (
              <Button
                key={question}
                type="button"
                disabled={isResponding}
                className="min-h-11 border border-primary bg-transparent px-4 text-mirai-accent-text text-xs leading-[1.75] hover:bg-terracotta-100"
                onClick={() => {
                  sendMessage({
                    text: question,
                    metadata: {
                      billContext,
                      hasInterviewConfig,
                      difficultyLevel,
                      sessionId,
                    },
                  });
                }}
                variant="ghost"
              >
                {question}
              </Button>
            );
          })}
        </div>
      </div>
      {messages.map((message) => {
        const isStreaming =
          status === "streaming" && message.id === messages.at(-1)?.id;

        return message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <SystemMessage
            key={message.id}
            message={message}
            isStreaming={isStreaming}
            billId={billContext?.id}
            billName={billContext?.bill_content?.title ?? billContext?.name}
          />
        );
      })}
      {status === "submitted" && (
        <span className="text-mirai-text-muted text-sm">考え中...</span>
      )}
    </>
  );
}

export function ChatWindow({
  billContext,
  hasInterviewConfig,
  difficultyLevel,
  chatState,
  isOpen,
  onClose,
  disableAutoFocus = false,
  sessionId,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { messages, sendMessage, status, error } = chatState;
  const isDesktop = useIsDesktop();
  const viewportHeight = useViewportHeight();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isResponding = status === "streaming" || status === "submitted";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // チャットが開かれたときにinputにフォーカス（disableAutoFocusがfalseの場合のみ）
  useEffect(() => {
    if (isOpen && textareaRef.current && !disableAutoFocus) {
      textareaRef.current?.focus();
    }
  }, [isOpen, disableAutoFocus]);

  // Auto-resize textarea based on content
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    // Send message with context and difficulty level in metadata
    // By default, this sends a HTTP POST request to the /api/chat endpoint.
    sendMessage({
      text: message.text ?? "",
      metadata: {
        billContext,
        hasInterviewConfig,
        difficultyLevel,
        sessionId,
      },
    });

    // Reset form
    setInput("");
  };

  const chatContent = (
    <>
      {/* オーバーレイ（1400px未満でのみ表示） */}
      {isOpen && (
        <Button
          aria-label="モーダルを閉じる"
          className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-mirai-text/50 p-0 hover:bg-mirai-text/50 pc:hidden"
          onClick={onClose}
          type="button"
          variant="ghost"
        />
      )}

      {/* チャットウィンドウ */}
      <div
        aria-hidden={!isDesktop && !isOpen}
        aria-label="この議案について質問する"
        aria-modal={!isDesktop && isOpen ? true : undefined}
        // xlサイズでは、横幅1180px（メイン + チャット）の中央寄せにする
        className={`fixed inset-x-0 bottom-0 z-50
          flex flex-col rounded-t-xl bg-card shadow-mirai-lg
          md:bottom-4 md:right-4 md:left-auto md:w-[450px] md:rounded-xl
						pc:visible pc:opacity-100 h-[80vh] pc:h-[70vh]
          xl:right-[calc(calc(100%-1180px)/2)]
					${isOpen ? "visible opacity-100" : "invisible opacity-0 pc:visible pc:opacity-100"}
				`}
        style={
          viewportHeight && !isDesktop
            ? { maxHeight: `${viewportHeight}px` }
            : undefined
        }
        role="dialog"
      >
        <Button
          aria-label="モーダルを閉じる"
          className="m-2 size-11 self-end text-mirai-text hover:bg-neutral-300 pc:hidden"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-5" strokeWidth={2.75} />
        </Button>
        {/* メッセージエリア（スクロール可能） */}
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="p-0 flex flex-col gap-3 pc:pt-6 pb-2 px-6">
            <ChatMessages
              billContext={billContext}
              hasInterviewConfig={hasInterviewConfig}
              difficultyLevel={difficultyLevel}
              messages={messages}
              sendMessage={sendMessage}
              status={status}
              sessionId={sessionId}
            />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* 入力エリア（固定下部） */}
        <div className="px-6 pb-4 pt-2">
          <PromptInput
            className="flex items-end gap-2.5 divide-y-0 rounded-full bg-mirai-surface-sunken py-2 pr-2 pl-6 shadow-mirai-sm"
            onSubmit={handleSubmit}
          >
            <PromptInputBody className="flex-1">
              <PromptInputTextarea
                ref={textareaRef}
                onChange={handleInputChange}
                value={input}
                placeholder="わからないことをAIに質問する"
                rows={1}
                submitOnEnter={isDesktop}
                // min-w-0, wrap-anywhere が無いと長文で親幅を押し広げてしまう
                className={`!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-mirai-text-placeholder placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0`}
              />
            </PromptInputBody>
            <Button
              aria-label="送信"
              className="size-11 bg-primary text-primary-foreground hover:bg-primary-accent"
              disabled={!input || isResponding}
              size="icon"
              type="submit"
              variant="ghost"
            >
              <Send aria-hidden="true" className="size-5" strokeWidth={2.75} />
            </Button>
          </PromptInput>
          <PromptInputError status={status} error={error} />
          {messages.length > 0 && <PromptInputHint />}
        </div>
      </div>
    </>
  );

  // body直下にPortalでマウント（クライアントサイドのみ）
  if (!isMounted) {
    return null;
  }

  // チャットのストリーミング表示がルビ機能と競合して表示がおかしくなるため、body直下に移動してルビ機能の影響を受けないようにする
  return createPortal(chatContent, document.body);
}
