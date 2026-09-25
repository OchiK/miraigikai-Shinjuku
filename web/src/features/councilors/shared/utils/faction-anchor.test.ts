import { describe, expect, it } from "vitest";
import { getFactionAnchorId, getFactionCouncilorsHref } from "./faction-anchor";

describe("getFactionAnchorId", () => {
  it("会派の slug からアンカーIDを作る", () => {
    expect(getFactionAnchorId("jimin-sansei")).toBe("faction-jimin-sansei");
  });

  it("会派に属さない議員のセクションは固定のIDにする", () => {
    expect(getFactionAnchorId(null)).toBe("faction-unaffiliated");
  });
});

describe("getFactionCouncilorsHref", () => {
  it("議員一覧の該当会派セクションを指す", () => {
    expect(getFactionCouncilorsHref("komei")).toBe("/councilors#faction-komei");
  });
});
