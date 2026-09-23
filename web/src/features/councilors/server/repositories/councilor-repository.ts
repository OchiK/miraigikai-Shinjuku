import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { CouncilorRow } from "../../shared/utils/to-councilor";

const COUNCILOR_SELECT = `
  id,
  name,
  name_kana,
  faction_role,
  terms,
  official_url,
  website_url,
  sort_order,
  factions (id, display_name, sort_order),
  council_member_committees (role, committees (id, name, sort_order))
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
