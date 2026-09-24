export type FeaturedToggleOutcome = {
  isFeatured: boolean;
  toast: { type: "success" | "warning" | "error"; message: string };
};

/**
 * 注目トグルの保存結果から、表示する状態とトースト文言を決める
 *
 * 失敗時は切り替え前の状態へ戻す（オプティミスティック更新のロールバック）。
 */
export function resolveFeaturedToggle({
  billName,
  requested,
  result,
}: {
  billName: string;
  requested: boolean;
  result: { success: boolean; error?: string; warning?: string };
}): FeaturedToggleOutcome {
  if (!result.success) {
    return {
      isFeatured: !requested,
      toast: {
        type: "error",
        message: result.error || "注目設定の更新に失敗しました",
      },
    };
  }

  if (result.warning) {
    return {
      isFeatured: requested,
      toast: { type: "warning", message: result.warning },
    };
  }

  return {
    isFeatured: requested,
    toast: {
      type: "success",
      message: requested
        ? `「${billName}」を注目議案に設定しました`
        : `「${billName}」の注目設定を解除しました`,
    },
  };
}
