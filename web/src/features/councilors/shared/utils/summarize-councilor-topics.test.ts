import { describe, expect, it } from "vitest";
import {
  buildTopicSummaryText,
  summarizeCouncilorTopics,
} from "./summarize-councilor-topics";

const q = (...topicTags: string[]) => ({ topicTags });

describe("summarizeCouncilorTopics", () => {
  it("タグを数えて多い順に並べる", () => {
    const summary = summarizeCouncilorTopics([
      q("防災", "子育て"),
      q("子育て"),
      q("教育", "子育て"),
      q("防災"),
    ]);
    expect(summary).toEqual({
      questionCount: 4,
      topTags: [
        { tag: "子育て", count: 3 },
        { tag: "防災", count: 2 },
        { tag: "教育", count: 1 },
      ],
    });
  });

  it("同数のタグは初出順を保つ", () => {
    const summary = summarizeCouncilorTopics([q("環境"), q("住宅"), q("交通")]);
    expect(summary.topTags.map((t) => t.tag)).toEqual(["環境", "住宅", "交通"]);
  });

  it("上位 limit 件に絞る", () => {
    const summary = summarizeCouncilorTopics(
      [q("a"), q("b"), q("c"), q("d"), q("e"), q("f")],
      5
    );
    expect(summary.topTags).toHaveLength(5);
    expect(summary.questionCount).toBe(6);
  });

  it("1件の質問に同じタグが重複していても1と数える", () => {
    const summary = summarizeCouncilorTopics([q("防災", "防災")]);
    expect(summary.topTags).toEqual([{ tag: "防災", count: 1 }]);
  });

  it("質問がなければ空", () => {
    expect(summarizeCouncilorTopics([])).toEqual({
      questionCount: 0,
      topTags: [],
    });
  });
});

describe("buildTopicSummaryText", () => {
  it("1位と、続く2つのタグを件数つきで述べる", () => {
    const text = buildTopicSummaryText({
      questionCount: 6,
      topTags: [
        { tag: "子育て", count: 4 },
        { tag: "教育", count: 3 },
        { tag: "福祉", count: 2 },
        { tag: "防災", count: 1 },
      ],
    });
    expect(text).toBe(
      "掲載中の質問6件のうち、「子育て」に関わる質問が4件と最も多く、「教育」3件、「福祉」2件と続きます。"
    );
  });

  it("同数1位が複数あれば並べて示す", () => {
    const text = buildTopicSummaryText({
      questionCount: 4,
      topTags: [
        { tag: "防災", count: 2 },
        { tag: "住宅", count: 2 },
        { tag: "交通", count: 1 },
      ],
    });
    expect(text).toBe(
      "掲載中の質問4件のうち、「防災」「住宅」に関わる質問がそれぞれ2件と最も多く、「交通」1件と続きます。"
    );
  });

  it("同数1位が4つ以上なら3つまで示して「など」とする", () => {
    const text = buildTopicSummaryText({
      questionCount: 2,
      topTags: [
        { tag: "a", count: 1 },
        { tag: "b", count: 1 },
        { tag: "c", count: 1 },
        { tag: "d", count: 1 },
      ],
    });
    expect(text).toBe(
      "掲載中の質問2件のうち、「a」「b」「c」などに関わる質問がそれぞれ1件と最も多くなっています。"
    );
  });

  it("2件以上でタグが1つだけならそれだけを述べる", () => {
    const text = buildTopicSummaryText({
      questionCount: 3,
      topTags: [{ tag: "環境", count: 3 }],
    });
    expect(text).toBe(
      "掲載中の質問3件のうち、「環境」に関わる質問が3件と最も多くなっています。"
    );
  });

  it("質問1件なら、その質問のテーマを述べる", () => {
    const text = buildTopicSummaryText({
      questionCount: 1,
      topTags: [
        { tag: "防災", count: 1 },
        { tag: "多文化共生", count: 1 },
      ],
    });
    expect(text).toBe(
      "掲載中の質問は1件で、「防災」「多文化共生」に関わる内容です。"
    );
  });

  it("質問はあってもタグが1つもなければ null", () => {
    expect(buildTopicSummaryText({ questionCount: 2, topTags: [] })).toBeNull();
  });

  it("質問がなければ null", () => {
    expect(buildTopicSummaryText({ questionCount: 0, topTags: [] })).toBeNull();
  });
});
