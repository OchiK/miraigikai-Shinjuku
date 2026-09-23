import "server-only";

import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import { createAdminClient, type Database } from "@mirai-gikai/supabase";

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
