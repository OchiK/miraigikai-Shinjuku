import { describe, expect, it } from "vitest";
import { resolveFeaturedToggle } from "./resolve-featured-toggle";

describe("resolveFeaturedToggle", () => {
  it("注目ONの保存に成功したら、ONのまま設定メッセージを返す", () => {
    const outcome = resolveFeaturedToggle({
      billName: "新宿区条例",
      requested: true,
      result: { success: true },
    });
    expect(outcome).toEqual({
      isFeatured: true,
      toast: {
        type: "success",
        message: "「新宿区条例」を注目議案に設定しました",
      },
    });
  });

  it("注目OFFの保存に成功したら、OFFのまま解除メッセージを返す", () => {
    const outcome = resolveFeaturedToggle({
      billName: "新宿区条例",
      requested: false,
      result: { success: true },
    });
    expect(outcome).toEqual({
      isFeatured: false,
      toast: {
        type: "success",
        message: "「新宿区条例」の注目設定を解除しました",
      },
    });
  });

  it("失敗したら切り替え前の状態へ戻し、エラー文言を返す", () => {
    const outcome = resolveFeaturedToggle({
      billName: "新宿区条例",
      requested: true,
      result: { success: false, error: "権限がありません" },
    });
    expect(outcome).toEqual({
      isFeatured: false,
      toast: { type: "error", message: "権限がありません" },
    });
  });

  it("OFFへの切り替えに失敗したらONへ戻す", () => {
    const outcome = resolveFeaturedToggle({
      billName: "新宿区条例",
      requested: false,
      result: { success: false },
    });
    expect(outcome.isFeatured).toBe(true);
  });

  it("エラー文言がなければ既定の文言を返す", () => {
    const outcome = resolveFeaturedToggle({
      billName: "新宿区条例",
      requested: true,
      result: { success: false },
    });
    expect(outcome.toast).toEqual({
      type: "error",
      message: "注目設定の更新に失敗しました",
    });
  });
});
