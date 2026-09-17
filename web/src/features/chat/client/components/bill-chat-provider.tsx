"use client";

import { useChat } from "@ai-sdk/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { BillWithContent } from "@/features/bills/shared/types";
import { ChatWindow } from "./chat-window";

interface BillChatProviderProps {
  /** チャットは必ず1つの議案に紐づく（デザインシステム定義 §10） */
  billContext: BillWithContent;
  hasInterviewConfig?: boolean;
  difficultyLevel: string;
  children: ReactNode;
}

interface BillChatContextValue {
  /** 空のチャットを開く。フッターの1枚バナーから呼ぶ */
  open: () => void;
  /** 選択したテキストについての質問を送りながら開く */
  openWithText: (selectedText: string) => void;
}

const BillChatContext = createContext<BillChatContextValue | null>(null);

/**
 * 議案詳細のチャット状態を持つプロバイダ。
 *
 * デザインシステム定義 §9-10 に従い、追尾するフローティングボタンは置かない。
 * 起動導線はフッターの1枚バナーと本文のテキスト選択だけで、どちらもこの
 * コンテキスト経由で同じチャット状態を開く。モーダルを閉じても会話は残る。
 */
export function BillChatProvider({
  billContext,
  hasInterviewConfig,
  difficultyLevel,
  children,
}: BillChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openedWithText, setOpenedWithText] = useState(false);
  const pathname = usePathname();

  const chatState = useChat();

  // pathname が変わるたびに新しいセッションIDを発行し、ページ遷移で会話をリセットする
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathnameが変わるたびに新しいIDを生成するため意図的に依存配列に含めている
  const sessionId = useMemo(() => crypto.randomUUID(), [pathname]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const { sendMessage, status } = chatState;

  const openWithText = useCallback(
    (selectedText: string) => {
      // AIからの返答待ち中は新しいメッセージを送信しない
      if (status === "streaming" || status === "submitted") {
        return;
      }

      setOpenedWithText(true);
      setIsOpen(true);
      sendMessage({
        text: `「${selectedText}」について教えてください。`,
        metadata: {
          billContext,
          hasInterviewConfig,
          difficultyLevel,
          sessionId,
        },
      });
    },
    [
      billContext,
      difficultyLevel,
      hasInterviewConfig,
      sendMessage,
      sessionId,
      status,
    ]
  );

  const value = useMemo(() => ({ open, openWithText }), [open, openWithText]);

  return (
    <BillChatContext.Provider value={value}>
      {children}

      <ChatWindow
        billContext={billContext}
        chatState={chatState}
        difficultyLevel={difficultyLevel}
        disableAutoFocus={openedWithText}
        hasInterviewConfig={hasInterviewConfig}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setOpenedWithText(false);
        }}
        sessionId={sessionId}
      />
    </BillChatContext.Provider>
  );
}

/**
 * チャットの起動導線から使うフック。
 *
 * AIチャットを無効にしている場合はプロバイダを置かないため、null を返す。
 * 呼び出し側は null のときに導線そのものを出さないこと。
 */
export function useBillChat(): BillChatContextValue | null {
  return useContext(BillChatContext);
}
