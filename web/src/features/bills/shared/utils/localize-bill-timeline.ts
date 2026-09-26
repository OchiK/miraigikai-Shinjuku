import { getDecisionStepLabel } from "@mirai-gikai/shared/bills/decision-label";
import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import {
  getUiMessages,
  localizeCardStatusLabel,
} from "@/features/i18n/shared/ui-messages";
import type { BillTimelineEvent, BillTimelineInput } from "./bill-timeline";

export interface LocalizedBillTimelineEvent {
  label: string;
  dateLabel: string;
  detail?: string;
  /** detail が DB の status_note（日本語）のとき "ja" */
  detailLang?: "ja";
}

const DATE_LABEL_KEYS = {
  日付未登録: "notRecorded",
  日付未定: "undecided",
  省略: "omitted",
} as const;

/**
 * 審議の経過の1件を表示言語に合わせる。
 *
 * 日本語表示ではそのまま返す。英語表示では、ステップ名と日付ラベルを UI 文言から引き、
 * 議決ステップは公式の議決用語の区別を保ったまま英語にする。
 * status_note は DB のまま日本語で出す。
 */
export function localizeBillTimelineEvent(
  event: BillTimelineEvent,
  input: BillTimelineInput,
  locale: PublicLocale
): LocalizedBillTimelineEvent {
  const isStatusNote = event.key === "decision" && event.detail !== undefined;

  if (locale === "ja") {
    return {
      label: event.label,
      dateLabel: event.dateLabel,
      detail: event.detail,
      detailLang: isStatusNote ? "ja" : undefined,
    };
  }

  const { timeline } = getUiMessages(locale).billDetail;
  const dateLabel = timeline.dateLabels[DATE_LABEL_KEYS[event.dateLabel]];

  if (event.key !== "decision") {
    return {
      label: timeline.events[event.key],
      dateLabel,
      // 議決前のステップの detail は委員会付託の省略だけ
      detail: event.detail ? timeline.committeeOmitted : undefined,
    };
  }

  const isDecided = event.state !== "upcoming";
  const decision = getDecisionStepLabel(input);
  const label = isDecided
    ? localizeCardStatusLabel(event.label, locale)
    : [decision.positive, decision.negative]
        .map((term) => localizeCardStatusLabel(term, locale))
        .join(timeline.decisionSeparator);

  return {
    label,
    dateLabel,
    detail: event.detail,
    detailLang: isStatusNote ? "ja" : undefined,
  };
}
