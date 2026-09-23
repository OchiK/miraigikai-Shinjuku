import "server-only";

import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import { createAdminClient, type Database } from "@mirai-gikai/supabase";
import type { DifficultyLevel } from "@/features/bills-edit/shared/types/bill-contents";

type BillContentTranslationInsert =
  Database["public"]["Tables"]["bill_content_translations"]["Insert"];
type BillContentTranslationUpdate =
  Database["public"]["Tables"]["bill_content_translations"]["Update"];

export async function findBillContentsByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("id, bill_id, difficulty_level, title, summary, content")
    .eq("bill_id", billId);

  if (error) {
    throw new Error(`Failed to fetch bill contents: ${error.message}`);
  }

  return data ?? [];
}

export async function findBillContentById(billContentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("id, bill_id, difficulty_level, title, summary, content")
    .eq("id", billContentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch bill content: ${error.message}`);
  }

  return data;
}

export async function findTranslationsByContentIds(billContentIds: string[]) {
  if (billContentIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_content_translations")
    .select("*")
    .in("bill_content_id", billContentIds);

  if (error) {
    throw new Error(`Failed to fetch translations: ${error.message}`);
  }

  return data ?? [];
}

export async function findTranslation(
  billContentId: string,
  locale: TranslationLocale
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_content_translations")
    .select("*")
    .eq("bill_content_id", billContentId)
    .eq("locale", locale)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch translation: ${error.message}`);
  }

  return data;
}

export async function upsertTranslation(row: BillContentTranslationInsert) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bill_content_translations")
    .upsert(row, { onConflict: "bill_content_id,locale" });

  if (error) {
    throw new Error(`Failed to save translation: ${error.message}`);
  }
}

export async function updateTranslation(
  billContentId: string,
  locale: TranslationLocale,
  update: BillContentTranslationUpdate
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bill_content_translations")
    .update(update)
    .eq("bill_content_id", billContentId)
    .eq("locale", locale);

  if (error) {
    throw new Error(`Failed to update translation: ${error.message}`);
  }
}

/** 翻訳状況の一覧用。全議案と所属する会期 */
export async function findBillsForTranslationMatrix() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      "id, name, bill_number, bill_number_order, council_sessions(name, start_date)"
    );

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  return data ?? [];
}

/** 翻訳状況の一覧用。指定した難易度の日本語コンテンツ（全議案分） */
export async function findBillContentsByDifficulty(
  difficultyLevel: DifficultyLevel
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("id, bill_id, difficulty_level, title, summary, content")
    .eq("difficulty_level", difficultyLevel);

  if (error) {
    throw new Error(`Failed to fetch bill contents: ${error.message}`);
  }

  return data ?? [];
}

/** 翻訳状況の一覧用。本文は取らず、状態の判定に要る列だけ */
export async function findTranslationStatusesByContentIds(
  billContentIds: string[]
) {
  if (billContentIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_content_translations")
    .select("bill_content_id, locale, status, source_hash")
    .in("bill_content_id", billContentIds);

  if (error) {
    throw new Error(`Failed to fetch translation statuses: ${error.message}`);
  }

  return data ?? [];
}
