import type {
  Councilor,
  CouncilorCommittee,
  CouncilorDetail,
  CouncilorQuestion,
} from "../types";
import {
  getCommitteeKind,
  isCommitteeRole,
  sortCommittees,
} from "./committee-kind";
import {
  countQuestionVenues,
  getLatestSpeechDate,
  isQuestionKind,
  isVenueType,
  sortQuestionsBySpeech,
} from "./councilor-questions";

/** council_members を会派・委員会つきで select した1行 */
export type CouncilorRow = {
  id: string;
  name: string;
  name_kana: string;
  faction_role: string | null;
  terms: number | null;
  official_url: string | null;
  website_url: string | null;
  sort_order: number;
  factions: { id: string; display_name: string; sort_order: number } | null;
  council_member_committees: {
    role: string;
    committees: { id: string; name: string; sort_order: number } | null;
  }[];
  /** 件数と最新の発言日の集計にだけ使うため、この2列だけを select する */
  council_member_questions: { venue_type: string; speech_date: string }[];
};

/** council_member_questions を委員会名つきで select した1行 */
export type CouncilorQuestionRow = {
  id: string;
  council_member_id: string;
  venue_type: string;
  question_kind: string | null;
  title: string;
  summary: string;
  topic_tags: string[];
  speech_date: string;
  source_url: string | null;
  session_name: string;
  committees: { name: string } | null;
};

export function toCouncilor(row: CouncilorRow): Councilor {
  const committees: CouncilorCommittee[] =
    row.council_member_committees.flatMap(({ role, committees: committee }) =>
      committee && isCommitteeRole(role)
        ? [
            {
              id: committee.id,
              name: committee.name,
              role,
              kind: getCommitteeKind(committee.name),
              sortOrder: committee.sort_order,
            },
          ]
        : []
    );

  return {
    id: row.id,
    name: row.name,
    nameKana: row.name_kana,
    factionRole: row.faction_role,
    terms: row.terms,
    officialUrl: row.official_url,
    websiteUrl: row.website_url,
    sortOrder: row.sort_order,
    faction: row.factions
      ? {
          id: row.factions.id,
          displayName: row.factions.display_name,
          sortOrder: row.factions.sort_order,
        }
      : null,
    committees: sortCommittees(committees),
    questionsCount: row.council_member_questions.length,
    questionVenueCounts: countQuestionVenues(
      row.council_member_questions.map((q) => q.venue_type)
    ),
    latestQuestionDate: getLatestSpeechDate(
      row.council_member_questions
        .filter((q) => q.venue_type === "plenary")
        .map((q) => q.speech_date)
    ),
  };
}

/**
 * 質問1行を画面用に変換する。発言の場が未知の行は null（表示しない）
 */
export function toCouncilorQuestion(
  row: CouncilorQuestionRow
): CouncilorQuestion | null {
  if (!isVenueType(row.venue_type)) return null;
  return {
    id: row.id,
    councilMemberId: row.council_member_id,
    venueType: row.venue_type,
    questionKind:
      row.question_kind && isQuestionKind(row.question_kind)
        ? row.question_kind
        : null,
    title: row.title,
    summary: row.summary,
    topicTags: row.topic_tags,
    speechDate: row.speech_date,
    sourceUrl: row.source_url,
    committeeName: row.committees?.name ?? null,
    sessionName: row.session_name,
  };
}

/**
 * 詳細ページ用。質問は新しい発言日順・同じ日は発言順に並べる
 */
export function toCouncilorDetail(
  row: CouncilorRow,
  questionRows: CouncilorQuestionRow[]
): CouncilorDetail {
  const questions = questionRows.flatMap((q) => {
    const question = toCouncilorQuestion(q);
    return question ? [question] : [];
  });
  return {
    ...toCouncilor(row),
    questions: sortQuestionsBySpeech(questions),
  };
}
