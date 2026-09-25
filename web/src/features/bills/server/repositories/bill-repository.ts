import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { MiraiStance } from "../../shared/types";
import { difficultyLevelsToFetch } from "../../shared/utils/difficulty-levels-to-fetch";
import {
  pickBillContent,
  pickBillContentsForBills,
} from "../../shared/utils/pick-bill-content";

// ============================================================
// Bills
// ============================================================

/**
 * 議案一覧の並びを議案番号順に確定させる。
 *
 * 同一会期の議案は published_at が全件同一（会期末日）になるため、
 * published_at だけでは並びが Postgres の物理行順に委ねられる。
 * LIMIT 付きのクエリでは、どの議案が返るかまで不定になる。
 *
 * bill_number の一意制約は会期スコープのため、会期をまたぐ一覧では
 * 番号が重なりうる。最後に id を足して並びを完全に確定させる。
 */
function orderByBillNumber<
  T extends { order(column: string, options: { ascending: boolean }): T },
>(query: T): T {
  return query
    .order("bill_number_order", { ascending: true })
    .order("bill_number", { ascending: true })
    .order("id", { ascending: true });
}

/**
 * 公開済み議案を難易度コンテンツ付きで取得
 */
export async function findPublishedBillsWithContents(
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const query = supabase
    .from("bills")
    .select(
      `
      *,
      bill_contents!inner (
        id,
        bill_id,
        title,
        summary,
        content,
        difficulty_level,
        created_at,
        updated_at
      )
    `
    )
    .eq("publish_status", "published")
    .in(
      "bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    )
    .order("published_at", { ascending: false });

  const { data, error } = await orderByBillNumber(query);
  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  return pickBillContentsForBills(data, difficultyLevel);
}

/**
 * 議案詳細で使う select 句。
 *
 * 議案詳細の先頭に「← 令和8年 第2回定例会」の戻り導線を出すため、議案が属する
 * 定例会の slug と名称も一緒に取る（デザインシステム定義 §9-1）。
 */
const BILL_WITH_SESSION_SELECT = `
  *,
  council_sessions (
    id,
    name,
    slug,
    council_url
  )
` as const;

/**
 * 公開済み議案を1件取得
 */
export async function findPublishedBillById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(BILL_WITH_SESSION_SELECT)
    .eq("id", id)
    .eq("publish_status", "published")
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 管理者用: ステータス問わず議案を1件取得
 */
export async function findBillById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(BILL_WITH_SESSION_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 議案のmirai_stanceを取得
 * 現在のDBにはmirai_stancesテーブルが存在しないため常にnullを返す
 */
export async function findMiraiStanceByBillId(
  _billId: string
): Promise<MiraiStance | null> {
  return null;
}

/**
 * 議案に紐づく会派見解を取得
 */
export async function findFactionStancesByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("faction_stances")
    .select(
      `
      id,
      type,
      comment,
      faction_name_at_vote,
      factions (
        id,
        name,
        display_name,
        sort_order
      )
    `
    )
    .eq("bill_id", billId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Failed to fetch faction stances: ${error.message}`);
    return [];
  }

  return data ?? [];
}

/**
 * 議案のタグを取得
 */
export async function findTagsByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills_tags")
    .select("tags(id, label)")
    .eq("bill_id", billId);

  if (error) {
    return null;
  }

  return data;
}

// ============================================================
// Bill Contents
// ============================================================

/**
 * 指定された難易度の議案コンテンツを取得
 */
export async function findBillContentByDifficulty(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", billId)
    .in("difficulty_level", difficultyLevelsToFetch(difficultyLevel));

  if (error) {
    console.error(`Failed to fetch bill content: ${error.message}`);
    return null;
  }

  return pickBillContent(data, difficultyLevel);
}

/**
 * 議案の全難易度のコンテンツを取得（翻訳元の照合に使う）
 */
export async function findAllBillContentsByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", billId);

  if (error) {
    throw new Error(`Failed to fetch bill contents: ${error.message}`);
  }

  return data;
}

// ============================================================
// Tags (bulk)
// ============================================================

import { groupTagsByBillId } from "../../shared/utils/group-tags";

/**
 * 複数のbill_idに紐づくタグを一括取得し、bill_idごとにグループ化して返す
 */
export async function findTagsByBillIds(
  billIds: string[]
): Promise<Map<string, Array<{ id: string; label: string }>>> {
  if (billIds.length === 0) {
    return new Map();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills_tags")
    .select("bill_id, tags(id, label)")
    .in("bill_id", billIds);

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return groupTagsByBillId(data ?? []);
}

// ============================================================
// Council Session Bills
// ============================================================

/**
 * 定例会IDに紐づく公開済み議案を取得
 */
export async function findPublishedBillsByDietSession(
  councilSessionId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const query = supabase
    .from("bills")
    .select(
      `
      *,
      bill_contents!inner (
        id,
        bill_id,
        title,
        summary,
        content,
        difficulty_level,
        created_at,
        updated_at
      )
    `
    )
    .eq("council_session_id", councilSessionId)
    .eq("publish_status", "published")
    .in(
      "bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    )
    .order("status_order", { ascending: true })
    .order("published_at", { ascending: false });

  const { data, error } = await orderByBillNumber(query);
  if (error) {
    throw new Error(
      `Failed to fetch bills by council session: ${error.message}`
    );
  }

  return pickBillContentsForBills(data, difficultyLevel);
}

/**
 * 前回の定例会の公開済み議案を取得（件数制限あり）
 */
export async function findPreviousSessionBills(
  councilSessionId: string,
  difficultyLevel: DifficultyLevelEnum,
  limit: number
) {
  const supabase = createAdminClient();
  const query = supabase
    .from("bills")
    .select(
      `
      *,
      bill_contents!inner (
        id,
        bill_id,
        title,
        summary,
        content,
        difficulty_level,
        created_at,
        updated_at
      )
    `
    )
    .eq("council_session_id", councilSessionId)
    .eq("publish_status", "published")
    .in(
      "bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    )
    .order("status_order", { ascending: true })
    .order("published_at", { ascending: false });

  // 並びを確定させてから件数を絞る。順序が不定だと、返る議案そのものが変わる。
  const { data, error } = await orderByBillNumber(query).limit(limit);

  if (error) {
    console.error("Failed to fetch previous session bills:", error);
    return [];
  }

  return pickBillContentsForBills(data ?? [], difficultyLevel);
}

/**
 * 前回の定例会の公開済み議案数を取得
 */
export async function countPublishedBillsByDietSession(
  councilSessionId: string,
  difficultyLevel: DifficultyLevelEnum
): Promise<number> {
  const supabase = createAdminClient();
  // 埋め込みの !inner は親行を複製しないため、難易度を複数指定しても
  // 議案は重複して数えられない。表示できる議案の件数と一致する。
  const { count, error } = await supabase
    .from("bills")
    .select("*, bill_contents!inner(difficulty_level)", {
      count: "exact",
      head: true,
    })
    .eq("council_session_id", councilSessionId)
    .eq("publish_status", "published")
    .in(
      "bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    );

  if (error) {
    console.error("Failed to count previous session bills:", error);
    return 0;
  }

  return count ?? 0;
}

// ============================================================
// Featured
// ============================================================

/**
 * featured_priorityが設定されているタグを取得
 */
export async function findFeaturedTags() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, label, description, featured_priority")
    .not("featured_priority", "is", null)
    .order("featured_priority", { ascending: true });

  if (error) {
    console.error("Failed to fetch featured tags:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 特定タグに紐づく公開済み議案を取得（bill_contents + タグ付き）
 */
export async function findPublishedBillsByTag(
  tagId: string,
  difficultyLevel: DifficultyLevelEnum,
  councilSessionId: string | null
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills_tags")
    .select(
      `
      bill_id,
      bills!inner (
        *,
        bill_contents!inner (
          id,
          bill_id,
          title,
          summary,
          content,
          difficulty_level,
          created_at,
          updated_at
        ),
        bills_tags!inner (
          tags (
            id,
            label
          )
        )
      )
    `
    )
    .eq("tag_id", tagId)
    .eq("bills.publish_status", "published")
    .in(
      "bills.bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    );

  if (councilSessionId) {
    query = query.eq("bills.council_session_id", councilSessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Failed to fetch bills for tag:`, error);
    return null;
  }

  // bills_tags の各行に議案が入れ子になっているので、議案ごとに絞り込む
  return data.flatMap((row) => {
    const [bill] = pickBillContentsForBills([row.bills], difficultyLevel);
    return bill == null ? [] : [{ ...row, bills: bill }];
  });
}

/**
 * 注目の議案を取得（is_featured = true）
 */
export async function findFeaturedBillsWithContents(
  difficultyLevel: DifficultyLevelEnum,
  councilSessionId: string | null
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills")
    .select(
      `
      *,
      bill_contents!inner (
        id,
        bill_id,
        title,
        summary,
        content,
        difficulty_level,
        created_at,
        updated_at
      ),
      tags:bills_tags(
        tag:tags(
          id,
          label
        )
      )
    `
    )
    .eq("publish_status", "published")
    .eq("is_featured", true)
    .in(
      "bill_contents.difficulty_level",
      difficultyLevelsToFetch(difficultyLevel)
    )
    .order("published_at", { ascending: false });

  if (councilSessionId) {
    query = query.eq("council_session_id", councilSessionId);
  }

  const { data, error } = await orderByBillNumber(query);

  if (error) {
    console.error("Failed to fetch featured bills:", error);
    return [];
  }

  return pickBillContentsForBills(data ?? [], difficultyLevel);
}

// ============================================================
// Coming Soon
// ============================================================

/**
 * Coming Soon議案を取得
 */
export async function findComingSoonBills(councilSessionId: string | null) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills")
    .select(
      `
      id,
      name,
      bill_number,
      status,
      bill_contents (
        title,
        difficulty_level
      ),
      council_sessions (
        council_url
      )
    `
    )
    .eq("publish_status", "coming_soon")
    // 一括投入した議案は created_at が同一になりうる
    .order("created_at", { ascending: false });

  if (councilSessionId) {
    query = query.eq("council_session_id", councilSessionId);
  }

  const { data, error } = await orderByBillNumber(query);

  if (error) {
    console.error("Failed to fetch coming soon bills:", error);
    return [];
  }

  return data ?? [];
}

// ============================================================
// Preview Tokens
// ============================================================

/**
 * プレビュートークンを検証
 */
export async function findPreviewToken(billId: string, token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("preview_tokens")
    .select("expires_at")
    .eq("bill_id", billId)
    .eq("token", token)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// ============================================================
// Interview Status
// ============================================================

/**
 * 複数のbill_idに対して、公開中のインタビュー設定があるかを一括判定
 */
export async function findBillIdsWithPublicInterview(
  billIds: string[]
): Promise<Set<string>> {
  if (billIds.length === 0) {
    return new Set();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("bill_id")
    .in("bill_id", billIds)
    .eq("status", "public");

  if (error) {
    console.error("Failed to fetch interview configs:", error);
    return new Set();
  }

  return new Set(data.map((row) => row.bill_id));
}
