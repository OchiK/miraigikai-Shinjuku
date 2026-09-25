import { describe, expect, it } from "vitest";
import { councilSessions } from "./data";
import { councilMembers } from "./shinjuku-council-members";
import {
  MINUTES_SCHEDULE_DATES,
  QUESTION_TOPIC_TAGS,
  buildMinuteUrl,
  councilMemberQuestions,
  createCouncilMemberQuestionInserts,
  normalizeMemberName,
} from "./shinjuku-council-questions";

/** DB投入後に返ってくる行を再現する */
const insertedMembers = councilMembers.map((m, i) => ({
  id: `member-uuid-${i}`,
  name: m.name,
}));
const insertedSessions = councilSessions.map((s, i) => ({
  id: `session-uuid-${i}`,
  slug: s.slug ?? null,
}));

describe("議員の質問要約 seed", () => {
  it("令和8年第1回・第2回定例会の代表質問・一般質問を103件持つ", () => {
    expect(councilMemberQuestions).toHaveLength(103);
  });

  it("全件の質問者が名簿の議員と一致する", () => {
    const rosterNames = new Set(
      councilMembers.map((m) => normalizeMemberName(m.name))
    );
    const unknown = councilMemberQuestions.filter(
      (q) => !rosterNames.has(q.member)
    );
    expect(unknown).toEqual([]);
  });

  // 議長は質問しない。会議録で2回の定例会に質問がなかった議員もいる
  it("質問者は30名で、議長は含まない", () => {
    const speakers = new Set(councilMemberQuestions.map((q) => q.member));
    expect(speakers.size).toBe(30);
    expect(speakers.has("渡辺清人")).toBe(false);
  });

  it("同じ会議録の発言を重複して参照しない", () => {
    const keys = councilMemberQuestions.map(
      (q) => `${q.session}/${q.scheduleId}/${q.minuteId}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("発言日が会議録の日程IDの会議日と一致する", () => {
    const mismatched = councilMemberQuestions.filter(
      (q) => MINUTES_SCHEDULE_DATES[q.session][q.scheduleId] !== q.speechDate
    );
    expect(mismatched).toEqual([]);
  });

  it("テーマタグは語彙の中から1〜3個、重複なく付ける", () => {
    const vocabulary = new Set<string>(QUESTION_TOPIC_TAGS);
    for (const q of councilMemberQuestions) {
      expect(q.topicTags.length).toBeGreaterThanOrEqual(1);
      expect(q.topicTags.length).toBeLessThanOrEqual(3);
      expect(new Set(q.topicTags).size).toBe(q.topicTags.length);
      for (const tag of q.topicTags) {
        expect(vocabulary.has(tag)).toBe(true);
      }
    }
  });

  it("見出しと要約は空でなく、要約は200字以内に収める", () => {
    for (const q of councilMemberQuestions) {
      expect(q.title.trim()).not.toBe("");
      expect(q.summary.trim()).not.toBe("");
      expect(q.summary.length).toBeLessThanOrEqual(200);
    }
  });
});

describe("buildMinuteUrl", () => {
  it("会議録検索システムの発言URLを組み立てる", () => {
    expect(buildMinuteUrl("r8-2", 3, 47)).toBe(
      "https://ssp.kaigiroku.net/tenant/shinjuku/MinuteView.html?council_id=3193&schedule_id=3&minute_id=47"
    );
  });
});

describe("createCouncilMemberQuestionInserts", () => {
  it("議員と会期を突合し、本会議の質問として出典URLつきで返す", () => {
    const inserts = createCouncilMemberQuestionInserts(
      councilMemberQuestions,
      insertedMembers,
      insertedSessions
    );
    expect(inserts).toHaveLength(councilMemberQuestions.length);

    const first = inserts[0];
    const firstQuestion = councilMemberQuestions[0];
    expect(first.council_member_id).toBe(
      insertedMembers.find(
        (m) => normalizeMemberName(m.name) === firstQuestion.member
      )?.id
    );
    expect(first.council_session_id).toBe(
      insertedSessions.find((s) => s.slug === firstQuestion.session)?.id
    );
    expect(first.venue_type).toBe("plenary");
    expect(first.question_kind).toBe("representative");
    expect(first.source_url).toBe(
      buildMinuteUrl(
        firstQuestion.session,
        firstQuestion.scheduleId,
        firstQuestion.minuteId
      )
    );
  });

  it("一般質問は general に変換する", () => {
    const general = councilMemberQuestions.filter((q) => q.kind === "一般質問");
    const inserts = createCouncilMemberQuestionInserts(
      general,
      insertedMembers,
      insertedSessions
    );
    expect(new Set(inserts.map((i) => i.question_kind))).toEqual(
      new Set(["general"])
    );
  });

  it("名簿にない議員は例外にする", () => {
    expect(() =>
      createCouncilMemberQuestionInserts(
        [{ ...councilMemberQuestions[0], member: "存在しない議員" }],
        insertedMembers,
        insertedSessions
      )
    ).toThrow("Council member not found");
  });

  it("存在しない会期は例外にする", () => {
    expect(() =>
      createCouncilMemberQuestionInserts(
        councilMemberQuestions.slice(0, 1),
        insertedMembers,
        []
      )
    ).toThrow("Council session not found");
  });
});
