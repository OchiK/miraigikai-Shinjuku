"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { BillShareModal } from "./bill-share-modal";

interface BillShareButtonsClientProps {
  shareMessage: string;
  shareUrl: string;
  thumbnailUrl?: string | null;
  locale?: PublicLocale;
}

export function BillShareButtonsClient({
  shareMessage,
  shareUrl,
  thumbnailUrl,
  locale = "ja",
}: BillShareButtonsClientProps) {
  const messages = getUiMessages(locale).billDetail.share;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReport = () => {
    window.open(
      siteConfig.externalLinks.report,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <div lang={locale} className="flex flex-col gap-3">
        <Button
          variant="default"
          onClick={handleShare}
          className="rounded-full px-6 py-3 h-auto font-bold text-base"
        >
          <Image
            src="/icons/ios-share.svg"
            alt=""
            width={28}
            height={28}
            className="shrink-0"
          />
          {messages.share}
        </Button>
        <Button
          variant="outline"
          onClick={handleReport}
          className="rounded-full px-6 py-3 h-auto font-bold text-base"
        >
          <Image
            src="/icons/report-error.svg"
            alt=""
            width={26}
            height={26}
            className="shrink-0"
          />
          {messages.report}
        </Button>
      </div>

      {/* 共有モーダル */}
      <BillShareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shareMessage={shareMessage}
        shareUrl={shareUrl}
        thumbnailUrl={thumbnailUrl}
        locale={locale}
      />
    </>
  );
}
