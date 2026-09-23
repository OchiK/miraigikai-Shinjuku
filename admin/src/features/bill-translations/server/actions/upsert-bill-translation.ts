"use server";

import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  type SaveBillTranslationInput,
  saveBillTranslationSchema,
} from "../../shared/types/bill-translation";
import {
  parseSourceSnapshot,
  toSourceSnapshot,
} from "../../shared/utils/source-snapshot";
import {
  buildTranslationStatusFields,
  isStoredTranslationStale,
  requiresStaleConfirmation,
} from "../../shared/utils/translation-review";
import {
  findBillContentById,
  findTranslation,
  upsertTranslation,
} from "../repositories/bill-translation-repository";

export type UpsertBillTranslationResult =
  | { success: true }
  | {
      success: false;
      error: string;
      needsStaleConfirmation?: boolean;
      /** 画面を開いた後に日本語が更新された。再読み込みして見直してもらう */
      sourceChanged?: boolean;
    };

/**
 * 翻訳を下書き保存（intent: draft）、または確認済みとして公開承認（intent: approve）する。
 * 日本語が変わった翻訳の承認は、confirmStale が true のときだけ受け付ける。
 */
export async function upsertBillTranslation(
  input: SaveBillTranslationInput
): Promise<UpsertBillTranslationResult> {
  try {
    const admin = await requireAdmin();
    const data = saveBillTranslationSchema.parse(input);

    const source = await findBillContentById(data.billContentId);
    if (!source) {
      return { success: false, error: "日本語の原文が見つかりません" };
    }

    const currentSourceHash = calculateSourceHash(source);
    // レビュアーが見ていない日本語に対して承認・保存しないよう、画面の原文と照合する
    if (data.reviewedSourceHash !== currentSourceHash) {
      return {
        success: false,
        error:
          "この画面を開いた後に日本語の原文が更新されました。最新の原文を読み込んだので、見直してから保存してください",
        sourceChanged: true,
      };
    }

    const existing = await findTranslation(data.billContentId, data.locale);
    const isStale = isStoredTranslationStale(existing, currentSourceHash);

    if (
      requiresStaleConfirmation({
        intent: data.intent,
        isStale,
        confirmStale: data.confirmStale,
      })
    ) {
      return {
        success: false,
        error:
          "翻訳した後に日本語の原文が変わっています。変更を反映したことを確認してから承認してください",
        needsStaleConfirmation: true,
      };
    }

    const statusFields = buildTranslationStatusFields({
      intent: data.intent,
      existing: existing && {
        status: existing.status,
        source_hash: existing.source_hash,
        source_snapshot: parseSourceSnapshot(existing.source_snapshot),
      },
      currentSourceHash,
      currentSource: toSourceSnapshot(source),
      reviewer: admin.email ?? admin.id,
      now: new Date(),
    });

    // model / prompt_version / translated_at は AI 生成時の記録なので、人の編集では変えない
    await upsertTranslation({
      bill_content_id: data.billContentId,
      locale: data.locale,
      title: data.title,
      summary: data.summary,
      content: data.content,
      ...statusFields,
    });

    // 公開・非公開が切り替わりうるので、保存のたびに公開画面のキャッシュを捨てる
    await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);

    return { success: true };
  } catch (error) {
    console.error("Upsert bill translation error:", error);
    return {
      success: false,
      error: getErrorMessage(error, "翻訳の保存中にエラーが発生しました"),
    };
  }
}
