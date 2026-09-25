import { describe, expect, it } from "vitest";
import {
  type BillQuestionRow,
  type CouncilorQuestionRow,
  type CouncilorRow,
  toBillRelatedQuestions,
  toCouncilor,
  toCouncilorDetail,
  toCouncilorQuestion,
} from "./to-councilor";

const row: CouncilorRow = {
  id: "member-1",
  name: "木もと ひろゆき",
  name_kana: "きもと ひろゆき",
  faction_role: "会計",
  terms: 3,
  official_url: "https://example.jp/roster",
  website_url: null,
  x_url: null,
  sort_order: 1,
  factions: {
    id: "faction-1",
    name: "komei",
    display_name: "新宿区議会公明党",
    sort_order: 2,
  },
  council_member_committees: [
    {
      role: "委員",
      committees: {
        id: "c-6",
        name: "防災等安全対策特別委員会",
        sort_order: 6,
      },
    },
    {
      role: "委員長",
      committees: { id: "c-3", name: "文教子ども家庭委員会", sort_order: 3 },
    },
  ],
  council_member_questions: [
    { venue_type: "plenary", speech_date: "2026-02-25" },
    { venue_type: "plenary", speech_date: "2026-06-11" },
    { venue_type: "committee", speech_date: "2026-06-10" },
  ],
};

const minuteUrl = (minuteId: number) =>
  `https://ssp.kaigiroku.net/tenant/shinjuku/MinuteView.html?council_id=3193&schedule_id=3&minute_id=${minuteId}`;

const questionRow: CouncilorQuestionRow = {
  id: "q-1",
  council_member_id: "member-1",
  venue_type: "plenary",
  question_kind: "general",
  title: "飯田橋駅周辺のまちづくり",
  summary: "要約",
  topic_tags: ["まちづくり", "交通"],
  speech_date: "2026-06-11",
  source_url: minuteUrl(61),
  session_name: "令和8年 第2回定例会",
  committees: null,
  bills: null,
};

describe("toCouncilor", () => {
  it("列名を画面用の形に変換し、委員会を常任→特別の順に並べる", () => {
    const councilor = toCouncilor(row);

    expect(councilor).toMatchObject({
      id: "member-1",
      nameKana: "きもと ひろゆき",
      factionRole: "会計",
      faction: {
        id: "faction-1",
        slug: "komei",
        displayName: "新宿区議会公明党",
      },
    });
    expect(councilor.committees).toEqual([
      {
        id: "c-3",
        name: "文教子ども家庭委員会",
        role: "委員長",
        kind: "standing",
        sortOrder: 3,
      },
      {
        id: "c-6",
        name: "防災等安全対策特別委員会",
        role: "委員",
        kind: "special",
        sortOrder: 6,
      },
    ]);
  });

  it("本人のウェブサイトとXのURLをそのまま渡し、無ければ null のまま", () => {
    expect(
      toCouncilor({
        ...row,
        website_url: "https://example.jp/site",
        x_url: "https://x.com/example",
      })
    ).toMatchObject({
      websiteUrl: "https://example.jp/site",
      xUrl: "https://x.com/example",
    });
    expect(toCouncilor(row)).toMatchObject({ websiteUrl: null, xUrl: null });
  });

  it("会派が無い議員は faction を null にする", () => {
    expect(toCouncilor({ ...row, factions: null }).faction).toBeNull();
  });

  it("委員会が削除された所属や未知の役職は落とす", () => {
    const councilor = toCouncilor({
      ...row,
      council_member_committees: [
        { role: "委員", committees: null },
        {
          role: "顧問",
          committees: { id: "c-1", name: "総務区民委員会", sort_order: 1 },
        },
      ],
    });
    expect(councilor.committees).toEqual([]);
  });
});

describe("toCouncilor の質問件数", () => {
  it("掲載中の質問を総数と発言の場ごとに数える", () => {
    const councilor = toCouncilor(row);
    expect(councilor.questionsCount).toBe(3);
    expect(councilor.questionVenueCounts).toEqual({
      plenary: 2,
      budget: 0,
      committee: 1,
    });
  });

  it("本会議の質問のうち最も新しい発言日を持つ", () => {
    expect(toCouncilor(row).latestQuestionDate).toBe("2026-06-11");
  });

  it("委員会の質問は最新の発言日に含めない", () => {
    const councilor = toCouncilor({
      ...row,
      council_member_questions: [
        { venue_type: "plenary", speech_date: "2025-11-27" },
        { venue_type: "committee", speech_date: "2026-06-10" },
      ],
    });
    expect(councilor.latestQuestionDate).toBe("2025-11-27");
  });

  it("質問がなければ0件で、最新の発言日は null", () => {
    const councilor = toCouncilor({ ...row, council_member_questions: [] });
    expect(councilor.latestQuestionDate).toBeNull();
    expect(councilor.questionsCount).toBe(0);
    expect(councilor.questionVenueCounts).toEqual({
      plenary: 0,
      budget: 0,
      committee: 0,
    });
  });
});

describe("toCouncilorQuestion", () => {
  it("列名を画面用の形に変換する", () => {
    expect(toCouncilorQuestion(questionRow)).toEqual({
      id: "q-1",
      councilMemberId: "member-1",
      venueType: "plenary",
      questionKind: "general",
      title: "飯田橋駅周辺のまちづくり",
      summary: "要約",
      topicTags: ["まちづくり", "交通"],
      speechDate: "2026-06-11",
      sourceUrl: minuteUrl(61),
      committeeName: null,
      sessionName: "令和8年 第2回定例会",
      bill: null,
    });
  });

  it("公開中の議案に紐づく質問は議案を持つ", () => {
    expect(
      toCouncilorQuestion({
        ...questionRow,
        bills: { id: "bill-1", name: "議案名", publish_status: "published" },
      })?.bill
    ).toEqual({ id: "bill-1", name: "議案名" });
  });

  it("非公開の議案はリンク先が 404 になるため持たない", () => {
    expect(
      toCouncilorQuestion({
        ...questionRow,
        bills: { id: "bill-1", name: "議案名", publish_status: "draft" },
      })?.bill
    ).toBeNull();
  });

  it("未知の質問種別は null にする", () => {
    expect(
      toCouncilorQuestion({ ...questionRow, question_kind: "other" })
        ?.questionKind
    ).toBeNull();
  });

  it("未知の発言の場の行は落とす", () => {
    expect(
      toCouncilorQuestion({ ...questionRow, venue_type: "unknown" })
    ).toBeNull();
  });
});

describe("toCouncilorDetail", () => {
  it("質問を新しい順・同じ日は発言順に並べ、未知の行は落とす", () => {
    const detail = toCouncilorDetail(row, [
      { ...questionRow, id: "feb", speech_date: "2026-02-25" },
      { ...questionRow, id: "jun-late", source_url: minuteUrl(90) },
      { ...questionRow, id: "broken", venue_type: "unknown" },
      { ...questionRow, id: "jun-early", source_url: minuteUrl(10) },
    ]);
    expect(detail.questions.map((q) => q.id)).toEqual([
      "jun-early",
      "jun-late",
      "feb",
    ]);
    expect(detail.name).toBe("木もと ひろゆき");
  });
});

describe("toBillRelatedQuestions", () => {
  const member = {
    id: "member-1",
    name: "木もと ひろゆき",
    is_active: true,
    factions: { display_name: "新宿区議会公明党" },
  };
  const billQuestionRow: BillQuestionRow = {
    ...questionRow,
    council_members: member,
  };

  it("質問した議員を添えて、新しい順・同じ日は発言順に並べる", () => {
    const questions = toBillRelatedQuestions([
      { ...billQuestionRow, id: "feb", speech_date: "2026-02-25" },
      { ...billQuestionRow, id: "jun-late", source_url: minuteUrl(90) },
      { ...billQuestionRow, id: "jun-early", source_url: minuteUrl(10) },
    ]);
    expect(questions.map((q) => q.id)).toEqual([
      "jun-early",
      "jun-late",
      "feb",
    ]);
    expect(questions[0].councilor).toEqual({
      id: "member-1",
      name: "木もと ひろゆき",
      factionDisplayName: "新宿区議会公明党",
    });
  });

  it("会派に属さない議員は会派名を null にする", () => {
    const [question] = toBillRelatedQuestions([
      { ...billQuestionRow, council_members: { ...member, factions: null } },
    ]);
    expect(question.councilor.factionDisplayName).toBeNull();
  });

  it("現職でない議員・議員の無い行・未知の発言の場の行は落とす", () => {
    expect(
      toBillRelatedQuestions([
        {
          ...billQuestionRow,
          id: "retired",
          council_members: { ...member, is_active: false },
        },
        { ...billQuestionRow, id: "orphan", council_members: null },
        { ...billQuestionRow, id: "broken", venue_type: "unknown" },
      ])
    ).toEqual([]);
  });
});
