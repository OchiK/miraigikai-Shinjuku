"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import type { KeyboardEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  shareNative,
  shareOnFacebook,
  shareOnLine,
  shareOnThreads,
  shareOnTwitter,
} from "@/features/bills/client/utils/share-handlers";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

interface BillShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareMessage: string;
  shareUrl: string;
  thumbnailUrl?: string | null;
  locale?: PublicLocale;
}

export function BillShareModal({
  isOpen,
  onClose,
  shareMessage,
  shareUrl,
  thumbnailUrl,
  locale = "ja",
}: BillShareModalProps) {
  if (!isOpen) return null;

  const messages = getUiMessages(locale).billDetail.share;

  // 共有ボタンの設定
  const shareButtons = [
    {
      name: "X (Twitter)",
      iconPath: "/icons/sns/icon_x.png",
      onClick: () => shareOnTwitter(shareMessage, shareUrl),
    },
    {
      name: "Facebook",
      iconPath: "/icons/sns/icon_facebook.png",
      onClick: () => shareOnFacebook(shareUrl),
    },
    {
      name: "LINE",
      iconPath: "/icons/sns/icon_line.png",
      onClick: () => shareOnLine(shareMessage, shareUrl),
      className: "md:hidden",
    },
    {
      name: "Threads",
      iconPath: "/icons/sns/icon_threads.png",
      onClick: () => shareOnThreads(shareMessage, shareUrl),
      className: "md:hidden",
    },
    {
      name: messages.nativeShare,
      iconPath: "/icons/share-general.png",
      onClick: () => shareNative(shareMessage, shareUrl),
      className: "md:hidden",
    },
  ];

  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    // 背景クリック時のみモーダルを閉じる
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBackgroundKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Escapeキーでモーダルを閉じる
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-share-modal-title"
      lang={locale}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3"
      onClick={handleBackgroundClick}
      onKeyDown={handleBackgroundKeyDown}
      tabIndex={-1}
    >
      <div className="bg-card rounded-2xl p-7 w-[370px] max-w-full flex flex-col items-center gap-9">
        {/* タイトル */}
        <h2
          id="bill-share-modal-title"
          className="text-xl font-bold text-mirai-text text-center w-full"
        >
          {messages.modalTitle}
        </h2>

        {/* サムネイル画像エリア */}
        {thumbnailUrl && (
          <div className="w-full h-[180px] relative rounded-md overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={messages.thumbnailAlt}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* シェアセクション */}
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-base font-bold text-mirai-text text-center">
            {messages.modalSubtitle}
          </p>

          {/* SNSアイコン */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {shareButtons.map((button) => (
              <button
                key={button.name}
                type="button"
                onClick={button.onClick}
                className={`w-12 h-12 flex items-center justify-center ${
                  button.className || ""
                }`}
              >
                <Image
                  src={button.iconPath}
                  alt={button.name}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 閉じるボタン */}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-[287px] max-w-full rounded-full px-6 py-3 h-auto font-bold text-base"
        >
          {messages.close}
        </Button>
      </div>
    </div>
  );
}
