"use client";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

interface BillOriginalAccordionProps {
  /** Server Component としてレンダリング済みの原文 */
  children: ReactNode;
  locale?: PublicLocale;
}

/**
 * 議案の原文（デザインシステム定義 §9-8）。
 *
 * 要約を先に読ませるため既定では開かない。中身は Server Component のまま
 * children で受け取り、開閉だけをクライアントで持つ。
 */
export function BillOriginalAccordion({
  children,
  locale = "ja",
}: BillOriginalAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        lang={locale}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-xl bg-card p-5 text-left font-bold font-heading text-lg text-mirai-text shadow-mirai-sm transition-colors hover:bg-neutral-300"
      >
        {getUiMessages(locale).billDetail.originalText}
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.75}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
