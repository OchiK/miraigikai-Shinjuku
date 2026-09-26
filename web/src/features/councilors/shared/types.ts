export type CommitteeRole = "委員長" | "副委員長" | "委員";

/** 常任委員会 / 議会運営委員会 / 特別委員会 */
export type CommitteeKind = "standing" | "steering" | "special";

export type CouncilorCommittee = {
  id: string;
  name: string;
  role: CommitteeRole;
  kind: CommitteeKind;
  sortOrder: number;
};

export type CouncilorFaction = {
  id: string;
  /** factions.name。議員一覧のアンカーIDに使う（例: jimin-sansei） */
  slug: string;
  displayName: string;
  sortOrder: number;
};

/** 発言の場。本会議 / 予算・決算特別委員会 / 委員会 */
export type VenueType = "plenary" | "budget" | "committee";

/** 本会議での質問の種別。代表質問 / 一般質問 */
export type QuestionKind = "representative" | "general";

export type QuestionVenueCounts = Record<VenueType, number>;

/** 議員の質問1件（会議録の1発言で扱った論点） */
export type CouncilorQuestion = {
  id: string;
  councilMemberId: string;
  venueType: VenueType;
  questionKind: QuestionKind | null;
  /** 議員が質問で示した項目名に沿った見出し */
  title: string;
  /** AIが会議録の質問部分から作成した要約 */
  summary: string;
  topicTags: string[];
  /** 発言日（YYYY-MM-DD） */
  speechDate: string;
  /** 会議録の該当発言へのURL */
  sourceUrl: string | null;
  committeeName: string | null;
  /** 会議録上の会期名（例: 令和8年 第2回定例会） */
  sessionName: string;
  /** 質問が扱った議案。公開中の議案に紐づくときだけ持つ */
  bill: { id: string; name: string } | null;
};

/** 議案詳細に出す質問1件。質問した議員を添える */
export type BillRelatedQuestion = CouncilorQuestion & {
  councilor: {
    id: string;
    name: string;
    factionDisplayName: string | null;
  };
};

/** 掲載中の質問のテーマタグ集計 */
export type CouncilorTopicSummary = {
  questionCount: number;
  /** 件数の多い順。同数はタグの初出順 */
  topTags: { tag: string; count: number }[];
};

export type Councilor = {
  id: string;
  name: string;
  nameKana: string;
  /** 会派内の役職（幹事長・会計など） */
  factionRole: string | null;
  terms: number | null;
  officialUrl: string | null;
  websiteUrl: string | null;
  /** 議員本人の公式X（旧Twitter）プロフィールURL */
  xUrl: string | null;
  sortOrder: number;
  faction: CouncilorFaction | null;
  committees: CouncilorCommittee[];
  /** 掲載中の質問の件数 */
  questionsCount: number;
  questionVenueCounts: QuestionVenueCounts;
  /**
   * 本会議の質問のうち最も新しい発言日。本会議の質問がなければ null。
   * 「以前の定例会」注記の判定に使うため、委員会の質問は含めない
   */
  latestQuestionDate: string | null;
};

/** 詳細ページ用。質問の一覧（新しい順）を持つ */
export type CouncilorDetail = Councilor & {
  questions: CouncilorQuestion[];
};

export type CouncilorFactionGroup = {
  faction: CouncilorFaction | null;
  councilors: Councilor[];
};

/** 委員会別表示の見出しに使う委員会の情報（役職は委員ごとに持つ） */
export type CouncilorCommitteeInfo = Omit<CouncilorCommittee, "role">;

export type CouncilorCommitteeMember = {
  councilor: Councilor;
  /** この委員会での役職 */
  role: CommitteeRole;
};

export type CouncilorCommitteeGroup = {
  committee: CouncilorCommitteeInfo;
  members: CouncilorCommitteeMember[];
};
