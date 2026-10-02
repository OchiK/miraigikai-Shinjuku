import { ArrowRight, BotMessageSquare, Check } from "lucide-react";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { getInterviewLPLink } from "@/features/interview-config/shared/utils/interview-links";

interface InterviewSuggestionBannerProps {
  billId: string;
  billName: string;
  locale?: PublicLocale;
}

export function InterviewSuggestionBanner({
  billId,
  billName,
  locale = "ja",
}: InterviewSuggestionBannerProps) {
  const messages = getUiMessages(locale).billDetail.chat.interviewSuggestion;

  return (
    <div className="flex gap-3 rounded-2xl bg-neutral-200 p-4">
      <div className="flex-shrink-0 size-10 rounded-lg bg-primary flex items-center justify-center">
        <BotMessageSquare
          className="size-8 text-primary-foreground"
          strokeWidth={2.75}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex">
            <span className="inline-flex items-center px-3 py-1 bg-card rounded-full text-xs font-medium text-mirai-text leading-none">
              {messages.audience}
            </span>
          </div>
          <p className="text-base font-bold leading-[1.5] text-mirai-text">
            {messages.heading(billName)}
          </p>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Check
                className="size-5 flex-shrink-0 text-mirai-text"
                strokeWidth={2.75}
              />
              <span className="text-xs font-medium leading-[1.8] text-mirai-text">
                {messages.duration}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Check
                className="size-5 flex-shrink-0 text-mirai-text"
                strokeWidth={2.75}
              />
              <span className="text-xs font-medium leading-[1.8] text-mirai-text">
                {messages.depth}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Check
                className="size-5 flex-shrink-0 text-mirai-text"
                strokeWidth={2.75}
              />
              <span className="text-xs font-medium leading-[1.8] text-mirai-text">
                {messages.policyUse}
              </span>
            </div>
          </div>
        </div>
        <Button
          asChild
          className="rounded-full h-11 px-4 font-medium text-sm gap-2.5"
        >
          <Link href={getInterviewLPLink(billId) as Route}>
            <span>{messages.cta}</span>
            <ArrowRight className="size-3" strokeWidth={2.75} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
