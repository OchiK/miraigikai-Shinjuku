import { describe, expect, it } from "vitest";
import { isActiveSessionInSession } from "./is-active-session-in-session";

describe("isActiveSessionInSession", () => {
  it("今日の会期が表示中の定例会と同じなら開会中", () => {
    expect(isActiveSessionInSession({ id: "a" }, { id: "a" })).toBe(true);
  });

  it("今日の会期がない（閉会中）なら false", () => {
    expect(isActiveSessionInSession({ id: "a" }, null)).toBe(false);
  });

  it("今日の会期が別の定例会なら false", () => {
    expect(isActiveSessionInSession({ id: "a" }, { id: "b" })).toBe(false);
  });

  it("表示中の定例会がなければ false", () => {
    expect(isActiveSessionInSession(null, { id: "a" })).toBe(false);
    expect(isActiveSessionInSession(null, null)).toBe(false);
  });
});
