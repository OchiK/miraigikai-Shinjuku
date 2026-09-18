"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillChat } from "@/features/chat/client/components/bill-chat-provider";

/**
 * 「この議案について質問する」バナー（デザインシステム定義 §9-10）。
 *
 * チャットの起動導線はこのフッターの1枚だけにする。追尾するボタンは置かない。
 */
export function BillChatCtaBanner() {
  const chat = useBillChat();

  // AIチャットを無効にしている場合はプロバイダが無いので導線も出さない
  if (!chat) {
    return null;
  }

  return (
    <section className="rounded-xl bg-sage-200 p-6 shadow-mirai-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquare
            aria-hidden="true"
            className="mt-0.5 size-6 shrink-0 text-sage-700"
            strokeWidth={2.75}
          />
          <div>
            <h2 className="font-bold font-heading text-lg text-sage-900">
              この議案について質問する
            </h2>
            <p className="mt-1 text-sage-900 text-sm leading-[1.9]">
              この議案の資料をもとにAIが答えます。答えは間違うことがあります。
            </p>
          </div>
        </div>

        <Button
          className="min-h-11 shrink-0 bg-primary text-mirai-text hover:opacity-90"
          onClick={chat.open}
          type="button"
          variant="ghost"
        >
          質問する
        </Button>
      </div>
    </section>
  );
}
