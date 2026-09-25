import { describe, expect, it } from "vitest";
import {
  describeVoteSplit,
  summarizeFactionVotes,
  toVoteBucket,
} from "./summarize-faction-votes";

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

describe("describeVoteSplit", () => {
  const vote = (
    stance: "for" | "against" | "neutral" | "conditional_against",
    factionName: string
  ) => ({
    stance,
    factionName,
  });

  it("全会派が賛成なら全会一致として会派数を返す", () => {
    expect(
      describeVoteSplit([vote("for", "A"), vote("for", "B"), vote("for", "C")])
    ).toEqual({ kind: "unanimous", bucket: "for", count: 3 });
  });

  it("全会派が反対のときも全会一致として扱う", () => {
    expect(
      describeVoteSplit([vote("against", "A"), vote("against", "B")])
    ).toEqual({ kind: "unanimous", bucket: "against", count: 2 });
  });

  it("分かれたら、少ない側（反対）の会派名を並び順のまま返す", () => {
    expect(
      describeVoteSplit([
        vote("for", "A"),
        vote("against", "B"),
        vote("for", "C"),
        vote("conditional_against", "D"),
        vote("for", "E"),
      ])
    ).toEqual({
      kind: "split",
      minority: { bucket: "against", factionNames: ["B", "D"] },
    });
  });

  it("賛成が少ない側なら賛成の会派名を返す", () => {
    expect(
      describeVoteSplit([
        vote("against", "A"),
        vote("for", "B"),
        vote("against", "C"),
      ])
    ).toEqual({
      kind: "split",
      minority: { bucket: "for", factionNames: ["B"] },
    });
  });

  it("条件付き賛成もバーの集計と同じく賛成として全会一致に数える", () => {
    expect(
      describeVoteSplit([
        vote("for", "A"),
        { stance: "conditional_for", factionName: "B" },
      ])
    ).toEqual({ kind: "unanimous", bucket: "for", count: 2 });
  });

  it("全会派がその他（中立など）なら、その他の全会一致として返す", () => {
    expect(
      describeVoteSplit([vote("neutral", "A"), vote("neutral", "B")])
    ).toEqual({ kind: "unanimous", bucket: "other", count: 2 });
  });

  it("中立の会派があっても、賛成と反対の少ない側を返す", () => {
    expect(
      describeVoteSplit([
        vote("for", "A"),
        vote("for", "B"),
        vote("neutral", "C"),
        vote("against", "D"),
      ])
    ).toEqual({
      kind: "split",
      minority: { bucket: "against", factionNames: ["D"] },
    });
  });

  it("賛否が1件も無ければ、全会一致にも少数側にもしない", () => {
    expect(describeVoteSplit([])).toEqual({ kind: "split", minority: null });
  });

  it("同数なら名前を添えない", () => {
    expect(describeVoteSplit([vote("for", "A"), vote("against", "B")])).toEqual(
      { kind: "split", minority: null }
    );
  });

  it("反対が無く残りが中立などなら、全会一致にも少数側にもしない", () => {
    expect(
      describeVoteSplit([
        vote("for", "A"),
        vote("for", "B"),
        vote("neutral", "C"),
      ])
    ).toEqual({ kind: "split", minority: null });
  });
});
