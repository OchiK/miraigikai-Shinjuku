"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  LOCALE_NATIVE_NAMES,
  PUBLIC_LOCALES,
  type PublicLocale,
} from "@mirai-gikai/shared/i18n/locales";
import { Send, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import {
  SEGMENT_TRACK_CLASS,
  segmentItemClass,
} from "@/lib/segment-control-styles";
import { cn } from "@/lib/utils";
import { SystemMessage } from "./system-message";
import { UserMessage } from "./user-message";

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
  locale?: PublicLocale;
  onLocaleChange?: (locale: PublicLocale) => void;
}

function ChatLanguageToggle({
  locale,
  label,
  onLocaleChange,
}: {
  locale: PublicLocale;
  label: string;
  onLocaleChange?: (locale: PublicLocale) => void;
}) {
  return (
    <div
      aria-label={label}
      className={cn("flex shrink-0 items-center gap-0.5", SEGMENT_TRACK_CLASS)}
      role="group"
    >
      {PUBLIC_LOCALES.map((option) => (
        <Button
          key={option}
          aria-pressed={option === locale}
          className={cn(
            "h-11 px-2 text-xs",
            segmentItemClass(option === locale)
          )}
          lang={option}
          onClick={() => onLocaleChange?.(option)}
          type="button"
          variant="ghost"
        >
          {LOCALE_NATIVE_NAMES[option]}
        </Button>
      ))}
    </div>
  );
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
  locale,
}: {
  billContext: BillWithContent;
  hasInterviewConfig?: boolean;
  difficultyLevel: string;
  messages: ChatWindowProps["chatState"]["messages"];
  sendMessage: ChatWindowProps["chatState"]["sendMessage"];
  status: ChatWindowProps["chatState"]["status"];
  sessionId: string;
  locale: PublicLocale;
}) {
  const chat = getUiMessages(locale).billDetail.chat;
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
          {/* 会話が伸びても消えない最初の1枚（デザインシステム定義 §10-2） */}
          <p className="rounded-xl bg-mirai-surface px-4 py-3 text-xs font-medium leading-[1.8] text-mirai-text-muted shadow-mirai-sm">
            {chat.window.notice}
          </p>
          <p className="mt-2 text-sm font-bold leading-[1.8] text-mirai-text">
            {chat.window.initialHeading}
          </p>
          <p className="text-sm font-bold leading-[1.8] text-mirai-text">
            {chat.window.initialSub}
          </p>
        </div>

        {/* サンプル質問チップ */}
        <div className="flex flex-wrap gap-3">
          {chat.window.sampleQuestions.map((question) => {
            return (
              <Button
                key={question}
                type="button"
                disabled={isResponding}
                className="min-h-11 rounded-full bg-mirai-surface px-4 text-mirai-accent-text text-xs leading-[1.75] shadow-mirai-sm hover:bg-terracotta-100"
                onClick={() => {
                  sendMessage({
                    text: question,
                    metadata: {
                      billContext,
                      hasInterviewConfig,
                      difficultyLevel,
                      sessionId,
                      locale,
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
            locale={locale}
          />
        );
      })}
      {status === "submitted" && (
        <span className="text-mirai-text-muted text-sm">
          {chat.window.thinking}
        </span>
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
  locale = "ja",
  onLocaleChange,
}: ChatWindowProps) {
  const chat = getUiMessages(locale).billDetail.chat;
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = chatState;
  const isDesktop = useIsDesktop();
  const viewportHeight = useViewportHeight();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isResponding = status === "streaming" || status === "submitted";

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
        locale,
      },
    });

    // Reset form
    setInput("");
  };

  const chatContent = (
    <DialogPrimitive.Root
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={isOpen}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-mirai-text/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col rounded-t-xl bg-background shadow-mirai-lg outline-none md:bottom-4 md:right-4 md:left-auto md:w-[450px] md:rounded-xl pc:h-[70vh] xl:right-[calc(calc(100%-1180px)/2)]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocusRef.current?.focus();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            previousFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            const focusTarget = disableAutoFocus
              ? closeButtonRef.current
              : textareaRef.current;
            focusTarget?.focus();
          }}
          style={
            viewportHeight ? { maxHeight: `${viewportHeight}px` } : undefined
          }
        >
          <div className="flex items-center gap-2 px-4 pt-2">
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate text-sm font-bold text-mirai-text">
              {billContext.name}
            </DialogPrimitive.Title>
            <ChatLanguageToggle
              label={chat.window.languageSelectorLabel}
              locale={locale}
              onLocaleChange={onLocaleChange}
            />
            <DialogPrimitive.Close asChild>
              <Button
                ref={closeButtonRef}
                aria-label={chat.window.closeAriaLabel}
                className="size-11 shrink-0 text-mirai-text hover:bg-neutral-300"
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={2.75} />
              </Button>
            </DialogPrimitive.Close>
          </div>
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
                locale={locale}
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
                  placeholder={chat.window.placeholder}
                  rows={1}
                  submitOnEnter={isDesktop}
                  // min-w-0, wrap-anywhere が無いと長文で親幅を押し広げてしまう
                  className={`!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-mirai-text-placeholder placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0`}
                />
              </PromptInputBody>
              <Button
                aria-label={chat.window.sendAriaLabel}
                className="size-11 bg-primary text-mirai-text hover:bg-primary-accent"
                disabled={!input || isResponding}
                size="icon"
                type="submit"
                variant="ghost"
              >
                <Send
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={2.75}
                />
              </Button>
            </PromptInput>
            <PromptInputError status={status} error={error} />
            <PromptInputHint>
              {messages.length > 0 && `${chat.window.hint} `}
              {chat.window.disclaimer}
            </PromptInputHint>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );

  return chatContent;
}
