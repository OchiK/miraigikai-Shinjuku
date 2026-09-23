import "server-only";
import type { Locale } from "@mirai-gikai/shared/i18n/locales";
import { unstable_cache } from "next/cache";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { BillWithContent } from "@/features/bills/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillLocalization } from "../../shared/types";
import {
  applyLocalizedContent,
  keepJapaneseContent,
} from "../../shared/utils/apply-localized-content";
import { resolveLocalizedBillContent } from "../services/resolve-localized-bill-content";

/**
 * 議案詳細の本文を表示言語に合わせて差し替える。
 * ja のときは何もしない（getBillById の結果をそのまま使う）。
 *
 * getBillById のキャッシュ（id × 難易度）とは別に、id × 言語 × 難易度で
 * キャッシュする。unstable_cache は関数の引数をキーに含めるため、
 * locale と難易度は必ず引数で渡すこと（クロージャで渡すと言語違いの本文が混ざる）。
 *
 * 翻訳の status を変える経路（admin・スクリプト）では、必ず CACHE_TAGS.BILLS を
 * revalidate すること。しないと取り下げた翻訳が最大10分出続ける。
 */
export async function getLocalizedBill(
  bill: BillWithContent,
  locale: Locale,
  difficultyLevel: DifficultyLevelEnum
): Promise<{
  bill: BillWithContent;
  localization: BillLocalization | null;
}> {
  if (locale === "ja") {
    return { bill, localization: null };
  }

  try {
    const result = await _getCachedLocalizedBillContent(
      bill.id,
      locale,
      difficultyLevel
    );
    return applyLocalizedContent(bill, locale, result);
  } catch (error) {
    // 翻訳が出せないだけで議案ページを落とさない。日本語は取得済み
    console.error("Failed to resolve localized bill content:", error);
    return keepJapaneseContent(bill, locale);
  }
}

const _getCachedLocalizedBillContent = unstable_cache(
  resolveLocalizedBillContent,
  ["localized-bill-content"],
  {
    revalidate: 600, // 10分（600秒）。getBillById と揃える
    tags: [CACHE_TAGS.BILLS],
  }
);
