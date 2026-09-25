import type {
  CouncilorQuestion,
  QuestionKind,
  QuestionVenueCounts,
  VenueType,
} from "../types";

export const VENUE_LABELS: Record<VenueType, string> = {
  plenary: "本会議",
  budget: "予算・決算特別委員会",
  committee: "委員会",
};

export const QUESTION_KIND_LABELS: Record<QuestionKind, string> = {
  representative: "代表質問",
  general: "一般質問",
};

/** 発言の場。表示順もこの並び */
export const VENUE_TYPES: VenueType[] = ["plenary", "budget", "committee"];

export function isVenueType(value: string): value is VenueType {
  return (VENUE_TYPES as string[]).includes(value);
}

export function isQuestionKind(value: string): value is QuestionKind {
  return value === "representative" || value === "general";
}

/**
 * 発言の場ごとの質問件数。未知の値は数えない
 */
export function countQuestionVenues(venueTypes: string[]): QuestionVenueCounts {
  const counts: QuestionVenueCounts = { plenary: 0, budget: 0, committee: 0 };
  for (const venueType of venueTypes) {
    if (isVenueType(venueType)) counts[venueType] += 1;
  }
  return counts;
}

/**
 * 最も新しい発言日（YYYY-MM-DD）。空なら null
 */
export function getLatestSpeechDate(speechDates: string[]): string | null {
  return speechDates.reduce<string | null>(
    (latest, date) => (latest === null || date > latest ? date : latest),
    null
  );
}

/**
 * 掲載中の質問がすべて主な掲載範囲より前か（令和8年に質問がなく、以前の定例会を載せている議員）。
 * 質問がなければ false
 */
export function hasOnlyEarlierQuestions(
  latestQuestionDate: string | null,
  scopeStartDate: string
): boolean {
  return latestQuestionDate !== null && latestQuestionDate < scopeStartDate;
}

/**
 * 以前の定例会を載せている議員に注記する会期名。新しい順の質問の先頭が直近の会期。
 * 注記が不要（令和8年の質問がある・質問がない）なら null
 */
export function getEarlierSessionNoticeName(
  latestQuestionDate: string | null,
  questionsNewestFirst: Pick<CouncilorQuestion, "sessionName">[],
  scopeStartDate: string
): string | null {
  if (!hasOnlyEarlierQuestions(latestQuestionDate, scopeStartDate)) return null;
  return questionsNewestFirst[0]?.sessionName ?? null;
}

/**
 * 会議録URLの minute_id（発言番号）。同じ日の質問を発言順に並べるのに使う。
 * 取り出せなければ null
 */
export function getSourceMinuteId(sourceUrl: string | null): number | null {
  if (!sourceUrl) return null;
  try {
    const value = new URL(sourceUrl).searchParams.get("minute_id");
    const minuteId = value === null ? Number.NaN : Number(value);
    return Number.isInteger(minuteId) ? minuteId : null;
  } catch {
    return null;
  }
}

/**
 * 新しい発言日順。同じ日は会議録の発言順（minute_id の小さい順）、
 * 発言番号がないものはその日の最後に置く
 */
export function sortQuestionsBySpeech<T extends CouncilorQuestion>(
  questions: T[]
): T[] {
  return [...questions].sort((a, b) => {
    if (a.speechDate !== b.speechDate) {
      return a.speechDate < b.speechDate ? 1 : -1;
    }
    const aMinute = getSourceMinuteId(a.sourceUrl) ?? Number.MAX_SAFE_INTEGER;
    const bMinute = getSourceMinuteId(b.sourceUrl) ?? Number.MAX_SAFE_INTEGER;
    return aMinute - bMinute;
  });
}

/**
 * "2026-06-11" → "2026年6月11日"。タイムゾーンの影響を受けないよう文字列から組み立てる
 */
export function formatSpeechDate(speechDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(speechDate);
  if (!match) return speechDate;
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}
