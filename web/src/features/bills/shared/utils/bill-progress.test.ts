import { describe, expect, it } from "vitest";
import { getCurrentStep } from "./bill-progress";

describe("getCurrentStep", () => {
  it("上程前は0を返す", () => {
    expect(getCurrentStep("preparing")).toBe(0);
  });

  it("審議の各段階を順に数える", () => {
    expect(getCurrentStep("submitted")).toBe(1);
    expect(getCurrentStep("in_committee")).toBe(2);
    expect(getCurrentStep("plenary_session")).toBe(3);
  });

  it("議決済みのステータスはすべて最終ステップになる", () => {
    expect(getCurrentStep("approved")).toBe(4);
    expect(getCurrentStep("rejected")).toBe(4);
    expect(getCurrentStep("adopted")).toBe(4);
    expect(getCurrentStep("partially_adopted")).toBe(4);
    expect(getCurrentStep("reported")).toBe(4);
  });
});
