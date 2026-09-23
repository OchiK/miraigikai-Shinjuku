import { describe, expect, it } from "vitest";
import { isUuid } from "./is-uuid";

describe("isUuid", () => {
  it("UUID 形式を受け付ける（大文字も可）", () => {
    expect(isUuid("28d6208a-1311-4bec-80d2-4f18950a0dbe")).toBe(true);
    expect(isUuid("28D6208A-1311-4BEC-80D2-4F18950A0DBE")).toBe(true);
  });

  it("UUID でない文字列は受け付けない", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("28d6208a-1311-4bec-80d2-4f18950a0dbe/extra")).toBe(false);
  });
});
