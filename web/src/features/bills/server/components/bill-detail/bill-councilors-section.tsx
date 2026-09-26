import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { CouncilorQuestionCard } from "@/features/councilors/server/components/councilor-question-card";
import type { BillRelatedQuestion } from "@/features/councilors/shared/types";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";

type Props = {
  /** この議案に紐づく議員の質問（新しい順） */
  questions: BillRelatedQuestion[];
  locale?: PublicLocale;
};

/**
 * 議案と議員をつなぐ節。
 *
 * 議案に紐づく質問を新しい順に並べる。
 * 質問の要約は DB のまま日本語で出す。
 */
export function BillCouncilorsSection({ questions, locale = "ja" }: Props) {
  const { billCouncilors } = getUiMessages(locale);

  return (
    <section
      aria-labelledby="bill-councilors-heading"
      className="flex flex-col gap-4"
      lang={locale}
    >
      <h2
        className="font-bold font-heading text-mirai-text text-xl"
        id="bill-councilors-heading"
      >
        {billCouncilors.heading}
      </h2>

      {questions.length > 0 && (
        <>
          {billCouncilors.questionsInJapaneseNotice && (
            <p className="text-mirai-text-muted text-sm leading-[1.9]">
              {billCouncilors.questionsInJapaneseNotice}
            </p>
          )}
          <ol className="flex flex-col gap-4" lang="ja">
            {questions.map((question) => (
              <li key={question.id}>
                <CouncilorQuestionCard
                  question={question}
                  speaker={question.councilor}
                  showBillLink={false}
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
