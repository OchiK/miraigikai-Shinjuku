import "server-only";
import type { TranslationLocale } from "@mirai-gikai/shared/i18n/locales";
import { createAdminClient } from "@mirai-gikai/supabase";

/**
 * 指定ロケールの確認済み（reviewed）翻訳を取得。
 * generated / stale は公開画面では使わないので取得しない。
 * 日本語との一致（source_hash）は取得後に照合する。
 */
export async function findReviewedTranslationsByContentIds(
  billContentIds: string[],
  locale: TranslationLocale
) {
  if (billContentIds.length === 0) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_content_translations")
    .select(
      "bill_content_id, locale, title, summary, content, source_hash, status"
    )
    .in("bill_content_id", billContentIds)
    .eq("locale", locale)
    .eq("status", "reviewed");

  if (error) {
    throw new Error(`Failed to fetch translations: ${error.message}`);
  }

  return data;
}
