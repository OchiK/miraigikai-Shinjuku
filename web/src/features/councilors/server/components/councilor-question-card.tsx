import "server-only";

import { Quote } from "lucide-react";
import type { CouncilorQuestion } from "../../shared/types";
import {
  formatSpeechDate,
  QUESTION_KIND_LABELS,
  VENUE_LABELS,
} from "../../shared/utils/councilor-questions";
import { ExternalSourceLink } from "./councilor-sources";

type Props = {
  question: CouncilorQuestion;
};

/**
 * 質問1件のカード。見出しは議員が示した項目名、要約はAI生成。
 * 要約はデザインシステム §9 に従い AI の地色・ラベルに置き、会議録と見分けられるようにする。
 */
export function CouncilorQuestionCard({ question }: Props) {
  const venue =
    question.venueType === "committee" && question.committeeName
      ? question.committeeName
      : VENUE_LABELS[question.venueType];

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-mirai-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-mirai-tag px-3 py-0.5 font-bold text-mirai-tag-text">
          {venue}
        </span>
        {question.questionKind && (
          <span className="rounded-full bg-mirai-tag px-3 py-0.5 text-mirai-tag-text">
            {QUESTION_KIND_LABELS[question.questionKind]}
          </span>
        )}
        <time dateTime={question.speechDate} className="text-mirai-text-muted">
          {formatSpeechDate(question.speechDate)}
        </time>
        {question.sessionName && (
          <span className="text-mirai-text-muted">{question.sessionName}</span>
        )}
      </div>

      <h3 className="font-bold font-heading text-lg text-mirai-text leading-[1.6]">
        {question.title}
      </h3>

      <div className="flex gap-3 rounded-xl bg-mirai-ai-bg p-4 text-mirai-ai-text">
        <Quote
          aria-hidden="true"
          className="mt-1 size-4 shrink-0"
          strokeWidth={2.75}
        />
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-bold text-xs">
            <span className="inline-flex items-center justify-center rounded-full bg-mirai-accent-text px-3 py-0.5 font-display text-mirai-ground">
              AI
            </span>
            要約
          </p>
          <p className="text-base leading-[1.9]">{question.summary}</p>
        </div>
      </div>

      {question.topicTags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="テーマ">
          {question.topicTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-background px-3 py-0.5 text-mirai-text-muted text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {question.sourceUrl && (
        <ExternalSourceLink href={question.sourceUrl}>
          会議録でこの質問を読む
        </ExternalSourceLink>
      )}
    </article>
  );
}
