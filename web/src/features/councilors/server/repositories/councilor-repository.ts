import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type {
  BillQuestionRow,
  CouncilorQuestionRow,
  CouncilorRow,
} from "../../shared/utils/to-councilor";

const COUNCILOR_SELECT = `
  id,
  name,
  name_kana,
  faction_role,
  terms,
  official_url,
  website_url,
  sort_order,
  factions (id, name, display_name, sort_order),
  council_member_committees (role, committees (id, name, sort_order)),
  council_member_questions (venue_type, speech_date)
`;

const COUNCILOR_QUESTION_SELECT = `
  id,
  council_member_id,
  venue_type,
  question_kind,
  title,
  summary,
  topic_tags,
  speech_date,
  source_url,
  session_name,
  committees (name),
  bills (id, name, publish_status)
`;

const BILL_QUESTION_SELECT = `
  ${COUNCILOR_QUESTION_SELECT},
  council_members (id, name, is_active, factions (display_name))
`;

/**
 * 現職の議員を会派・委員会つきで議席番号順に取得
 */
export async function findActiveCouncilors(): Promise<CouncilorRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_members")
    .select(COUNCILOR_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 空配列に丸めると unstable_cache が「議員0人」を1時間キャッシュするため、投げる
  if (error) {
    throw new Error(`Failed to fetch councilors: ${error.message}`);
  }

  return data ?? [];
}

/**
 * 現職の議員を1人、会派・委員会つきで取得
 */
export async function findActiveCouncilorById(
  id: string
): Promise<CouncilorRow | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_members")
    .select(COUNCILOR_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  // null に丸めると unstable_cache が 404 を1時間キャッシュするため、投げる
  if (error) {
    throw new Error(`Failed to fetch councilor by id: ${error.message}`);
  }

  return data;
}

/**
 * 議員1人の質問要約を新しい発言日順に取得
 * 同じ日の発言順は画面側（sortQuestionsBySpeech）で整える
 */
export async function findQuestionsByCouncilorId(
  councilMemberId: string
): Promise<CouncilorQuestionRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_member_questions")
    .select(COUNCILOR_QUESTION_SELECT)
    .eq("council_member_id", councilMemberId)
    .order("speech_date", { ascending: false });

  // 空配列に丸めると unstable_cache が「質問0件」を1時間キャッシュするため、投げる
  if (error) {
    throw new Error(`Failed to fetch councilor questions: ${error.message}`);
  }

  return data ?? [];
}

/**
 * 議案に紐づく質問要約を、質問した議員つきで新しい発言日順に取得
 * 現職かどうかの絞り込みと発言順の整列は画面側（toBillRelatedQuestions）で行う
 */
export async function findQuestionsByBillId(
  billId: string
): Promise<BillQuestionRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("council_member_questions")
    .select(BILL_QUESTION_SELECT)
    .eq("bill_id", billId)
    .order("speech_date", { ascending: false });

  // 空配列に丸めると unstable_cache が「質問0件」を1時間キャッシュするため、投げる
  if (error) {
    throw new Error(`Failed to fetch bill questions: ${error.message}`);
  }

  return data ?? [];
}
