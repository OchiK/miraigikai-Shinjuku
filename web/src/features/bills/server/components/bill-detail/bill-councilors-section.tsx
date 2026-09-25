import "server-only";

import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { Users } from "lucide-react";
import Link from "next/link";
import { CouncilorQuestionCard } from "@/features/councilors/server/components/councilor-question-card";
import type { BillRelatedQuestion } from "@/features/councilors/shared/types";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { routes } from "@/lib/routes";

type Props = {
  /** この議案に紐づく議員の質問（新しい順） */
  questions: BillRelatedQuestion[];
  locale?: PublicLocale;
};

/**
 * 議案と議員をつなぐ節。
 *
 * 会派別の賛否は一次情報が揃った議案にしか出ないため、議員一覧への導線は
 * 賛否の有無にかかわらずここに置く。議案に紐づく質問があれば先に並べる。
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

      <div className="flex flex-col gap-4 rounded-xl bg-mirai-surface-sunken p-6">
        <p className="text-base text-mirai-text leading-[1.9]">
          {billCouncilors.body}
        </p>
        <Link
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-card px-5 font-bold text-mirai-text text-sm shadow-mirai-sm transition-colors hover:bg-neutral-300"
          href={routes.councilors()}
        >
          <Users aria-hidden="true" className="size-4" strokeWidth={2.75} />
          {billCouncilors.councilorsLink}
        </Link>
      </div>
    </section>
  );
}
