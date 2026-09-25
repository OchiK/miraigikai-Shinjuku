import { describe, expect, it } from "vitest";
import { councilSessions } from "./data";
import { councilMembers } from "./shinjuku-council-members";
import {
  MINUTES_SCHEDULE_DATES,
  MINUTES_SESSION_NAMES,
  PRIMARY_SESSIONS,
  QUESTION_TOPIC_TAGS,
  buildMinuteUrl,
  councilMemberQuestions,
  createCouncilMemberQuestionInserts,
  findUnknownQuestionSessionSlugs,
  normalizeMemberName,
  toCouncilMemberQuestionImportRows,
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
  it("令和8年の103件と、以前の定例会の21件を持つ", () => {
    const primary = councilMemberQuestions.filter((q) =>
      PRIMARY_SESSIONS.includes(q.session)
    );
    expect(primary).toHaveLength(103);
    expect(councilMemberQuestions).toHaveLength(124);
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

  it("名簿の38名全員に質問がある", () => {
    const speakers = new Set(councilMemberQuestions.map((q) => q.member));
    expect(speakers.size).toBe(38);
  });

  // 以前の定例会は、令和8年に質問がない議員の直近1会期分だけを載せる
  it("以前の定例会の質問は、令和8年に質問がない議員の1会期分に限る", () => {
    const primarySpeakers = new Set(
      councilMemberQuestions
        .filter((q) => PRIMARY_SESSIONS.includes(q.session))
        .map((q) => q.member)
    );
    const earlier = councilMemberQuestions.filter(
      (q) => !PRIMARY_SESSIONS.includes(q.session)
    );

    expect(earlier.filter((q) => primarySpeakers.has(q.member))).toEqual([]);

    const sessionsByMember = new Map<string, Set<string>>();
    for (const q of earlier) {
      const sessions = sessionsByMember.get(q.member) ?? new Set();
      sessions.add(q.session);
      sessionsByMember.set(q.member, sessions);
    }
    expect(sessionsByMember.size).toBe(8);
    for (const sessions of sessionsByMember.values()) {
      expect(sessions.size).toBe(1);
    }
  });

  // web の QUESTION_SOURCES.scopeStartDate（令和8年第1回定例会の開会日）と同じ日付。
  // 画面の「以前の定例会」注記は発言日とこの日付の比較で出すため、seed の区分と一致させる
  it("主な掲載範囲の質問は2026-02-17以降、それ以外はそれより前の発言日", () => {
    const scopeStartDate = "2026-02-17";
    for (const q of councilMemberQuestions) {
      if (PRIMARY_SESSIONS.includes(q.session)) {
        expect(q.speechDate >= scopeStartDate).toBe(true);
      } else {
        expect(q.speechDate < scopeStartDate).toBe(true);
      }
    }
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

  it("主な掲載範囲の会期がDBになければ例外にする", () => {
    const primary = councilMemberQuestions.find((q) =>
      PRIMARY_SESSIONS.includes(q.session)
    );
    if (!primary) throw new Error("primary question missing");
    expect(() =>
      createCouncilMemberQuestionInserts([primary], insertedMembers, [])
    ).toThrow("Council session not found");
  });

  it("以前の定例会は会期ページに紐づけず、会期名だけ持つ", () => {
    const earlier = councilMemberQuestions.filter(
      (q) => !PRIMARY_SESSIONS.includes(q.session)
    );
    const inserts = createCouncilMemberQuestionInserts(
      earlier,
      insertedMembers,
      insertedSessions
    );
    for (const [i, insert] of inserts.entries()) {
      expect(insert.council_session_id).toBeNull();
      expect(insert.session_name).toBe(MINUTES_SESSION_NAMES[earlier[i].session]);
    }
  });
});

describe("toCouncilMemberQuestionImportRows", () => {
  const rows = toCouncilMemberQuestionImportRows(
    councilMemberQuestions,
    councilMembers
  );

  it("全件を名簿の氏名（空白入り）で表す", () => {
    expect(rows).toHaveLength(councilMemberQuestions.length);
    const rosterNames = new Set(councilMembers.map((m) => m.name));
    expect(rows.every((row) => rosterNames.has(row.member_name))).toBe(true);
  });

  it("主な掲載範囲は会期の slug を持ち、以前の定例会は null", () => {
    for (const [i, row] of rows.entries()) {
      const question = councilMemberQuestions[i];
      expect(row.session_slug).toBe(
        PRIMARY_SESSIONS.includes(question.session) ? question.session : null
      );
      expect(row.session_name).toBe(MINUTES_SESSION_NAMES[question.session]);
    }
  });

  it("本番の突合キー（議員・出典URL）が重複しない", () => {
    const keys = rows.map((row) => `${row.member_name}::${row.source_url}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("名簿にない議員は例外にする", () => {
    expect(() =>
      toCouncilMemberQuestionImportRows(councilMemberQuestions.slice(0, 1), [])
    ).toThrow("Council member not found");
  });
});

describe("findUnknownQuestionSessionSlugs", () => {
  it("投入する会期に無い slug を重複なく返し、null は無視する", () => {
    expect(
      findUnknownQuestionSessionSlugs(
        [
          { session_slug: "r8-2" },
          { session_slug: "r9-1" },
          { session_slug: "r9-1" },
          { session_slug: null },
        ],
        ["r8-1", "r8-2"]
      )
    ).toEqual(["r9-1"]);
  });

  it("本番の質問は全て投入する会期に含まれる", () => {
    expect(
      findUnknownQuestionSessionSlugs(
        toCouncilMemberQuestionImportRows(councilMemberQuestions, councilMembers),
        councilSessions.flatMap((session) => (session.slug ? [session.slug] : []))
      )
    ).toEqual([]);
  });
});
