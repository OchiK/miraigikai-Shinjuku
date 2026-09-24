import { describe, expect, it, vi } from "vitest";
import { findFeaturedBillsWithSessionFallback } from "./find-featured-bills-with-session-fallback";

describe("findFeaturedBillsWithSessionFallback", () => {
  it("アクティブ会期に注目議案があればその結果を返す", async () => {
    const findFeaturedBills = vi.fn().mockResolvedValue([{ id: "active" }]);

    const result = await findFeaturedBillsWithSessionFallback({
      difficultyLevel: "normal",
      councilSessionId: "session-1",
      findFeaturedBills,
    });

    expect(result).toEqual([{ id: "active" }]);
    expect(findFeaturedBills).toHaveBeenCalledTimes(1);
    expect(findFeaturedBills).toHaveBeenCalledWith("normal", "session-1");
  });

  it("アクティブ会期が空なら全会期の注目議案へフォールバックする", async () => {
    const findFeaturedBills = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "previous" }]);

    const result = await findFeaturedBillsWithSessionFallback({
      difficultyLevel: "normal",
      councilSessionId: "session-1",
      findFeaturedBills,
    });

    expect(result).toEqual([{ id: "previous" }]);
    expect(findFeaturedBills).toHaveBeenNthCalledWith(1, "normal", "session-1");
    expect(findFeaturedBills).toHaveBeenNthCalledWith(2, "normal", null);
  });

  it("アクティブ会期がなければ全会期の検索を1回だけ行う", async () => {
    const findFeaturedBills = vi.fn().mockResolvedValue([]);

    await findFeaturedBillsWithSessionFallback({
      difficultyLevel: "easy",
      councilSessionId: null,
      findFeaturedBills,
    });

    expect(findFeaturedBills).toHaveBeenCalledTimes(1);
    expect(findFeaturedBills).toHaveBeenCalledWith("easy", null);
  });
});
