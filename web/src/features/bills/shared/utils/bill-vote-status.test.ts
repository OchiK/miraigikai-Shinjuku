import { describe, expect, it } from "vitest";
import type { BillStatusEnum } from "../types";
import { hasFinalVoteResult } from "./bill-vote-status";

describe("hasFinalVoteResult", () => {
  it.each<BillStatusEnum>([
    "approved",
    "rejected",
    "adopted",
    "partially_adopted",
  ])("returns true for final status %s", (status) => {
    expect(hasFinalVoteResult(status)).toBe(true);
  });

  it.each<BillStatusEnum>([
    "preparing",
    "submitted",
    "in_committee",
    "plenary_session",
    "reported",
  ])("returns false for non-final status %s", (status) => {
    expect(hasFinalVoteResult(status)).toBe(false);
  });

  it("returns false when the status is unavailable", () => {
    expect(hasFinalVoteResult(undefined)).toBe(false);
  });
});
