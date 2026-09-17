import { describe, expect, it } from "vitest";
import { summarizeFactionVotes, toVoteBucket } from "./summarize-faction-votes";

describe("toVoteBucket", () => {
  it("条件付きの賛否を賛成・反対に畳む", () => {
    expect(toVoteBucket("conditional_for")).toBe("for");
    expect(toVoteBucket("conditional_against")).toBe("against");
  });

  it("中立・検討中・継続審査中はその他に置く", () => {
    expect(toVoteBucket("neutral")).toBe("other");
    expect(toVoteBucket("considering")).toBe("other");
    expect(toVoteBucket("continued_deliberation")).toBe("other");
  });
});

describe("summarizeFactionVotes", () => {
  it("会派数を区分ごとに数える", () => {
    const summary = summarizeFactionVotes([
      { stance: "for" },
      { stance: "conditional_for" },
      { stance: "against" },
      { stance: "neutral" },
    ]);

    expect(summary.for).toBe(2);
    expect(summary.against).toBe(1);
    expect(summary.other).toBe(1);
    expect(summary.total).toBe(4);
  });

  it("バーの幅は合計に対する割合になる", () => {
    const summary = summarizeFactionVotes([
      { stance: "for" },
      { stance: "for" },
      { stance: "for" },
      { stance: "against" },
    ]);

    expect(summary.forRatio).toBe(75);
    expect(summary.againstRatio).toBe(25);
    expect(summary.otherRatio).toBe(0);
  });

  it("会派がいなければ0除算せずすべて0を返す", () => {
    const summary = summarizeFactionVotes([]);

    expect(summary.total).toBe(0);
    expect(summary.forRatio).toBe(0);
    expect(summary.againstRatio).toBe(0);
    expect(summary.otherRatio).toBe(0);
  });
});
