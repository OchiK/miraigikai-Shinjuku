"use client";

import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { TextSelectionWrapper } from "@/features/bills/client/components/text-selection-tooltip/text-selection-wrapper";
import {
  BillChatProvider,
  useBillChat,
} from "@/features/chat/client/components/bill-chat-provider";
import type { BillWithContent } from "../../../shared/types";

interface BillDetailClientProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
  hasInterviewConfig: boolean;
  children: ReactNode;
}

/**
 * テキスト選択からチャットを開くためのラッパー。
 *
 * BillChatProvider の内側でしかコンテキストを読めないので、選択ハンドラは
 * ここで組み立てる。
 */
function TextSelectionChatBridge({ children }: { children: ReactNode }) {
  const chat = useBillChat();

  return (
    <TextSelectionWrapper onOpenChat={chat?.openWithText}>
      {children}
    </TextSelectionWrapper>
  );
}

/**
 * 議案詳細のクライアントサイド機能を管理するコンポーネント
 *
 * 実装背景:
 * - テキスト選択からのAIチャット連携機能を提供
 * - Server Componentである BillDetailLayout から切り出すことで
 *   SSRを保持しつつクライアントサイド機能を実装
 * - チャットの起動導線はフッターの1枚バナーとテキスト選択だけ。
 *   追尾するフローティングボタンは置かない（デザインシステム定義 §9-10）
 */
export function BillDetailClient({
  bill,
  currentDifficulty,
  hasInterviewConfig,
  children,
}: BillDetailClientProps) {
  if (!siteConfig.features.aiChat) {
    return <>{children}</>;
  }

  return (
    <BillChatProvider
      billContext={bill}
      difficultyLevel={currentDifficulty}
      hasInterviewConfig={hasInterviewConfig}
    >
      <TextSelectionChatBridge>{children}</TextSelectionChatBridge>
    </BillChatProvider>
  );
}
