"use server";

import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  type RevokeBillTranslationInput,
  revokeBillTranslationSchema,
} from "../../shared/types/bill-translation";
import { buildRevokeStatusFields } from "../../shared/utils/translation-review";
import {
  findTranslation,
  updateTranslation,
} from "../repositories/bill-translation-repository";

export type RevokeBillTranslationResult =
  | { success: true }
  | { success: false; error: string };

/** 公開承認を取り消し、翻訳を下書き（generated）に戻す */
export async function revokeBillTranslation(
  input: RevokeBillTranslationInput
): Promise<RevokeBillTranslationResult> {
  try {
    await requireAdmin();
    const data = revokeBillTranslationSchema.parse(input);

    const existing = await findTranslation(data.billContentId, data.locale);
    if (!existing) {
      return { success: false, error: "翻訳が見つかりません" };
    }
    if (existing.status !== "reviewed") {
      return { success: false, error: "この翻訳は承認されていません" };
    }

    await updateTranslation(
      data.billContentId,
      data.locale,
      buildRevokeStatusFields()
    );

    await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);

    return { success: true };
  } catch (error) {
    console.error("Revoke bill translation error:", error);
    return {
      success: false,
      error: getErrorMessage(error, "承認の取り消し中にエラーが発生しました"),
    };
  }
}
