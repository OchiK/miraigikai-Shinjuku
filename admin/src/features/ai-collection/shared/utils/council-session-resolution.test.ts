import { describe, expect, it } from "vitest";
import { getCouncilSessionResolutionError } from "./council-session-resolution";

describe("getCouncilSessionResolutionError", () => {
  it("会期が一意に解決できた場合はnullを返す", () => {
    expect(
      getCouncilSessionResolutionError({
        sessionId: "session-id",
        matchCount: 1,
        errorMessage: null,
      })
    ).toBeNull();
  });

  it("一致する会期がない場合の理由を返す", () => {
    expect(
      getCouncilSessionResolutionError({
        sessionId: null,
        matchCount: 0,
        errorMessage: null,
      })
    ).toBe("対応する会期が見つかりません");
  });

  it("複数会期とDBエラーを区別する", () => {
    expect(
      getCouncilSessionResolutionError({
        sessionId: null,
        matchCount: 2,
        errorMessage: null,
      })
    ).toBe("対応する会期が複数見つかりました");
    expect(
      getCouncilSessionResolutionError({
        sessionId: null,
        matchCount: 0,
        errorMessage: "connection failed",
      })
    ).toBe("会期の確認に失敗しました: connection failed");
  });
});
