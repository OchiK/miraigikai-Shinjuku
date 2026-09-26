import { describe, expect, it } from "vitest";
import { getCommitteeAnchorId } from "./committee-anchor";

describe("getCommitteeAnchorId", () => {
  it("委員会の id からアンカーIDを作る", () => {
    expect(getCommitteeAnchorId("k1")).toBe("committee-k1");
  });
});
