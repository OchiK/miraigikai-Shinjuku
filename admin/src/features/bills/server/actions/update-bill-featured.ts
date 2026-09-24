"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { routes } from "@/lib/routes";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { updateBillIsFeatured } from "../repositories/bill-repository";

export type UpdateBillFeaturedResult = {
  success: boolean;
  error?: string;
};

export async function updateBillFeaturedAction({
  billId,
  isFeatured,
}: {
  billId: string;
  isFeatured: boolean;
}): Promise<UpdateBillFeaturedResult> {
  try {
    await requireAdmin();

    if (!billId) {
      return { success: false, error: "議案IDが指定されていません" };
    }
    if (typeof isFeatured !== "boolean") {
      return { success: false, error: "注目設定の値が不正です" };
    }

    await updateBillIsFeatured(billId, isFeatured);

    // web側のキャッシュを無効化（トップの「注目の議案」へ即時反映）
    await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
    revalidatePath(routes.bills());

    return { success: true };
  } catch (error) {
    console.error("Error updating bill featured status:", error);
    return { success: false, error: "注目設定の更新に失敗しました" };
  }
}
