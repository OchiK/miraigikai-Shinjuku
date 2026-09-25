import { describe, expect, it } from "vitest";
import type { CouncilorQuestion } from "../types";
import {
  countQuestionVenues,
  formatSpeechDate,
  getSourceMinuteId,
  isQuestionKind,
  isVenueType,
  sortQuestionsBySpeech,
} from "./councilor-questions";

const minuteUrl = (minuteId: number) =>
  `https://ssp.kaigiroku.net/tenant/shinjuku/MinuteView.html?council_id=3193&schedule_id=3&minute_id=${minuteId}`;

function question(
  id: string,
  speechDate: string,
  sourceUrl: string | null
): CouncilorQuestion {
  return {
    id,
    councilMemberId: "m1",
    venueType: "plenary",
    questionKind: "general",
    title: id,
    summary: "",
    topicTags: [],
    speechDate,
    sourceUrl,
    committeeName: null,
    sessionName: null,
  };
}

describe("countQuestionVenues", () => {
  it("発言の場ごとに数え、未知の値は無視する", () => {
    expect(
      countQuestionVenues(["plenary", "plenary", "committee", "unknown"])
    ).toEqual({ plenary: 2, budget: 0, committee: 1 });
  });

  it("空なら全て0", () => {
    expect(countQuestionVenues([])).toEqual({
      plenary: 0,
      budget: 0,
      committee: 0,
    });
  });
});

describe("isVenueType", () => {
  it("本会議・予算特別委員会・委員会の値だけを受け付ける", () => {
    expect(isVenueType("plenary")).toBe(true);
    expect(isVenueType("budget")).toBe(true);
    expect(isVenueType("committee")).toBe(true);
    expect(isVenueType("unknown")).toBe(false);
    expect(isVenueType("")).toBe(false);
  });
});

describe("isQuestionKind", () => {
  it("代表質問・一般質問の値だけを受け付ける", () => {
    expect(isQuestionKind("representative")).toBe(true);
    expect(isQuestionKind("general")).toBe(true);
    expect(isQuestionKind("other")).toBe(false);
  });
});

describe("getSourceMinuteId", () => {
  it("会議録URLから発言番号を取り出す", () => {
    expect(getSourceMinuteId(minuteUrl(47))).toBe(47);
  });

  it("URLがない・壊れている・番号がないときは null", () => {
    expect(getSourceMinuteId(null)).toBeNull();
    expect(getSourceMinuteId("not a url")).toBeNull();
    expect(getSourceMinuteId("https://example.com/")).toBeNull();
    expect(getSourceMinuteId("https://example.com/?minute_id=abc")).toBeNull();
  });
});

describe("sortQuestionsBySpeech", () => {
  it("新しい日付順、同じ日は発言番号の小さい順に並べる", () => {
    const sorted = sortQuestionsBySpeech([
      question("feb-12", "2026-02-25", minuteUrl(12)),
      question("jun-11", "2026-06-11", minuteUrl(11)),
      question("jun-8", "2026-06-11", minuteUrl(8)),
      question("feb-9", "2026-02-25", minuteUrl(9)),
    ]);
    expect(sorted.map((q) => q.id)).toEqual([
      "jun-8",
      "jun-11",
      "feb-9",
      "feb-12",
    ]);
  });

  it("発言番号がないものは同じ日の最後に置く", () => {
    const sorted = sortQuestionsBySpeech([
      question("no-url", "2026-06-11", null),
      question("with-url", "2026-06-11", minuteUrl(100)),
    ]);
    expect(sorted.map((q) => q.id)).toEqual(["with-url", "no-url"]);
  });

  it("元の配列を変更しない", () => {
    const input = [
      question("a", "2026-02-25", null),
      question("b", "2026-06-11", null),
    ];
    sortQuestionsBySpeech(input);
    expect(input.map((q) => q.id)).toEqual(["a", "b"]);
  });
});

describe("formatSpeechDate", () => {
  it("ゼロ埋めなしの年月日にする", () => {
    expect(formatSpeechDate("2026-06-01")).toBe("2026年6月1日");
    expect(formatSpeechDate("2026-11-25")).toBe("2026年11月25日");
  });

  it("形式が違えばそのまま返す", () => {
    expect(formatSpeechDate("2026/06/01")).toBe("2026/06/01");
  });
});
