import type { UIMessage } from "@ai-sdk/react";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import type { ComponentProps } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { SUGGEST_INTERVIEW_TOOL_TYPE } from "@/features/chat/shared/constants";
import {
  extractSourceCitations,
  isHttpUrl,
} from "@/features/chat/shared/utils/extract-source-citations";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { InterviewSuggestionBanner } from "./interview-suggestion-banner";

type RehypePlugins = ComponentProps<typeof Response>["rehypePlugins"];

interface SystemMessageProps {
  message: UIMessage;
  isStreaming: boolean;
  billId?: string;
  billName?: string;
  rehypePlugins?: RehypePlugins;
  locale?: PublicLocale;
}

const SOURCE_CHIP_CLASS =
  "inline-flex min-h-6 max-w-full items-center rounded-full bg-mirai-source-chip px-3 py-1 text-xs font-medium text-mirai-source-chip-text break-all";

/** 回答の下に並べる出典チップ。URLだけはリンクにする */
function SourceChips({ sources, label }: { sources: string[]; label: string }) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <ul aria-label={label} className="mt-2 flex flex-wrap gap-2">
      {sources.map((source) => (
        <li className="max-w-full" key={source}>
          {isHttpUrl(source) ? (
            <a
              className={`${SOURCE_CHIP_CLASS} underline`}
              href={source}
              rel="noopener noreferrer"
              target="_blank"
            >
              {source}
            </a>
          ) : (
            <span className={SOURCE_CHIP_CLASS}>{source}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function SystemMessage({
  message,
  isStreaming,
  billId,
  billName,
  rehypePlugins,
  locale = "ja",
}: SystemMessageProps) {
  const sourceLabel = getUiMessages(locale).billDetail.chat.window.sourceLabel;

  return (
    <Message from="assistant" className="justify-start py-0">
      <MessageContent
        variant="flat"
        className="rounded-2xl rounded-tl-sm bg-card p-4 text-sm font-medium leading-[1.8] text-mirai-text shadow-mirai-sm"
      >
        {message.parts.map((part, i: number) => {
          if (part.type === "text") {
            const { body, sources } = extractSourceCitations(part.text);
            return (
              <div key={`${message.id}-${i}`}>
                <Response className="break-words" rehypePlugins={rehypePlugins}>
                  {body}
                </Response>
                <SourceChips label={sourceLabel} sources={sources} />
              </div>
            );
          }
          if (part.type === "reasoning") {
            return (
              <Reasoning
                key={`${message.id}-${i}`}
                className="w-full"
                isStreaming={isStreaming && i === message.parts.length - 1}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          }
          if (part.type === SUGGEST_INTERVIEW_TOOL_TYPE && billId && billName) {
            return (
              <InterviewSuggestionBanner
                key={`${message.id}-${i}`}
                billId={billId}
                billName={billName}
              />
            );
          }
          return null;
        })}
      </MessageContent>
    </Message>
  );
}
