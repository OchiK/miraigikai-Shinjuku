import type { Database } from "@mirai-gikai/supabase";
import { type SeededBillRef, requireBillBySlug } from "./bill-ref";
import {
  R8_2_SESSION,
  gianKey,
  shoninKey,
  toBillInserts,
} from "./shinjuku-r8-2-inventory";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type FactionStanceInsert =
  Database["public"]["Tables"]["faction_stances"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];
type FactionInsert = Database["public"]["Tables"]["factions"]["Insert"];
type CommitteeInsert = Database["public"]["Tables"]["committees"]["Insert"];
type InterviewConfigInsert =
  Database["public"]["Tables"]["interview_configs"]["Insert"];
type InterviewQuestionInsert =
  Database["public"]["Tables"]["interview_questions"]["Insert"];
type InterviewSessionInsert =
  Database["public"]["Tables"]["interview_sessions"]["Insert"];
type InterviewMessageInsert =
  Database["public"]["Tables"]["interview_messages"]["Insert"];
type InterviewReportInsert =
  Database["public"]["Tables"]["interview_report"]["Insert"];

// 定例会データ
// 会期は公式の提出議案ページ記載の「会期：…」をそのまま採用する。
export const councilSessions: CouncilSessionInsert[] = [
  R8_2_SESSION,
  {
    name: "令和8年 第1回定例会",
    slug: "r8-1",
    council_url:
      "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_01.html",
    // 公式ページ記載: 「会期：2月17日～3月24日」
    start_date: "2026-02-17",
    end_date: "2026-03-24",
    is_active: false,
  },
];

// 会派データ
export const factions: FactionInsert[] = [
  {
    name: "jimin",
    display_name: "自由民主党",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "komei",
    display_name: "公明党",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "kyosan",
    display_name: "日本共産党",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "rikken",
    display_name: "立憲民主党・無所属クラブ",
    sort_order: 4,
    is_active: true,
  },
];

// 委員会データ
export const committees: CommitteeInsert[] = [
  {
    name: "環境建設委員会",
    description: "環境保全、ごみ減量、道路、公園、都市計画、建築などについての審査",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "総務区民委員会",
    description: "区政の総合企画、財務、税務、広報、戸籍、地域共生などについての審査",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "文教子ども家庭委員会",
    description: "学校教育、生涯学習、スポーツ、子ども・子育て支援、保育などについての審査",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "福祉健康委員会",
    description: "地域福祉、高齢者・障害者支援、保健衛生、健康づくりなどについての審査",
    sort_order: 4,
    is_active: true,
  },
];

// タグデータ
export const tags: TagInsert[] = [
  {
    label: "まちづくり・環境",
    description: "まちづくり、環境美化、路上喫煙防止、都市計画に関する議案",
    featured_priority: 1,
  },
  {
    label: "くらし・行財政",
    description: "補正予算、区税、行政制度、区民生活支援に関する議案",
    featured_priority: 2,
  },
  {
    label: "多文化共生・手続き",
    description: "外国人住民支援、証明書コンビニ交付、行政手続きに関する議案",
    featured_priority: 3,
  },
  {
    label: "子育て・教育",
    description: "子育て支援、保育事業、教育環境に関する議案",
    featured_priority: 4,
  },
  {
    label: "文化・生涯学習",
    description: "文化施設、生涯学習、科学教育に関する議案",
    featured_priority: 5,
  },
];

// 議案データ
// 令和8年第2回定例会の全23件（承認第2号・第3号 + 第42〜62号議案）を
// 公式インベントリから生成する。個別の手書きは行わない。
export const bills: BillInsert[] = toBillInserts();

// 議案とタグの関連付け
// タグは編集上の分類であり公式メタデータではないため、
// 分類を確認済みの議案にのみ付与する。未確認の議案は意図的に未分類のままにする。
const billTagsBySlug: Record<string, string[]> = {
  [gianKey(53)]: ["まちづくり・環境"],
  [gianKey(42)]: ["くらし・行財政"],
  [gianKey(49)]: ["多文化共生・手続き"],
  [gianKey(51)]: ["子育て・教育"],
  [gianKey(58)]: ["文化・生涯学習"],
  [gianKey(43)]: ["くらし・行財政"],
  [gianKey(44)]: ["くらし・行財政"],
  [shoninKey(2)]: ["くらし・行財政"],
};

export function createBillsTags(
  insertedBills: SeededBillRef[],
  insertedTags: { id: string; label: string }[]
): Omit<BillsTagsInsert, "id" | "created_at">[] {
  const billsTags: Omit<BillsTagsInsert, "id" | "created_at">[] = [];

  for (const [slug, tagLabels] of Object.entries(billTagsBySlug)) {
    const bill = requireBillBySlug(insertedBills, slug);

    for (const tagLabel of tagLabels) {
      const tag = insertedTags.find((t) => t.label === tagLabel);
      if (!tag) {
        throw new Error(`Tag not found: ${tagLabel}`);
      }
      billsTags.push({ bill_id: bill.id, tag_id: tag.id });
    }
  }

  return billsTags;
}

// 会派見解データ
//
// 令和8年第2回定例会の会派ごとの賛否は、提出議案ページ・議決結果ページのいずれにも
// 記載がなく、一次情報として取得できていない（docs/20260916_1400_令和8年第2回定例会_公式突合記録.md 11-2）。
// 以前はデモ用に創作した賛成意見を実在会派（factions[0]）に紐づけて投入していたが、
// 公開UIでは実際の会派見解と区別できないため削除した。
// 実際の会派見解を出典付きで取得できるまで、この seed は会派見解を投入しない。
const factionStancesBySlug: Record<
  string,
  Omit<FactionStanceInsert, "bill_id" | "faction_id">
> = {};

export function createFactionStances(
  insertedBills: SeededBillRef[],
  miraiFactionId: string
): FactionStanceInsert[] {
  return Object.entries(factionStancesBySlug).map(([slug, stance]) => ({
    ...stance,
    bill_id: requireBillBySlug(insertedBills, slug).id,
    faction_id: miraiFactionId,
  }));
}

// インタビュー設定を作成（最初の議案用）
// AIインタビューのデモ設定。knowledge_source の内容と対象議案がずれないよう、
// 配列の先頭ではなく slug で対象議案を特定する。
const INTERVIEW_DEMO_BILL_SLUG = gianKey(53);

export function createInterviewConfig(
  insertedBills: SeededBillRef[]
): Omit<InterviewConfigInsert, "id" | "created_at" | "updated_at"> {
  // 対象議案は必ず存在すべき。見つからない場合は黙って設定を省略せず落とす。
  const targetBill = requireBillBySlug(insertedBills, INTERVIEW_DEMO_BILL_SLUG);

  return {
    bill_id: targetBill.id,
    name: "デフォルト設定",
    status: "public",
    themes: ["賛否", "ポイ捨て防止", "愛犬マナー"],
    knowledge_source: `新宿区空き缶等の散乱及び路上喫煙による被害の防止に関する条例の一部改正について、区民の皆様のご意見を聞かせてください。`,
  };
}

// インタビュー質問を作成
export function createInterviewQuestions(
  interviewConfigId: string
): Omit<InterviewQuestionInsert, "id" | "created_at" | "updated_at">[] {
  return [
    {
      interview_config_id: interviewConfigId,
      question: "この条例改正案について、賛成ですか？反対ですか？",
      follow_up_guide: "条例改正に対するユーザーの立場を明確にしてください。",
      quick_replies: ["賛成", "反対", "どちらでもない"],
      question_order: 1,
    },
    {
      interview_config_id: interviewConfigId,
      question: "その理由や、路上喫煙・ごみ散乱対策について日頃感じていることを教えてください。",
      follow_up_guide: "身近な生活環境や街の美化に関する具体的な実感を掘り下げてください。",
      quick_replies: null,
      question_order: 2,
    },
  ];
}

// インタビューセッションを作成（5パターン × 20回 = 100件）
export function createInterviewSessions(
  interviewConfigId: string
): Omit<InterviewSessionInsert, "id" | "created_at" | "updated_at">[] {
  const now = new Date();
  const sessions: Omit<
    InterviewSessionInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // 20回ループして100件作成
  for (let i = 0; i < 20; i++) {
    const baseOffset = i * 86400000 * 3; // 3日ずつずらす

    // パターン1: 完了 + レポートあり（賛成）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 1).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 3600000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 3000000
      ).toISOString(),
    });

    // パターン2: 完了 + レポートあり（反対）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 2).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 7200000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 6600000
      ).toISOString(),
    });

    // パターン3: 完了 + レポートあり（中立）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 3).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 10800000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 10200000
      ).toISOString(),
    });

    // パターン4: 完了したけどレポート未作成
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 4).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 14400000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 13800000
      ).toISOString(),
    });

    // パターン5: 進行中（未完了、レポートなし）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 5).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 1800000
      ).toISOString(),
      completed_at: null,
    });
  }

  return sessions;
}

// インタビューメッセージを作成（5パターンをループ）
export function createInterviewMessages(
  sessionIds: string[]
): Omit<InterviewMessageInsert, "id" | "created_at">[] {
  const conversations = [
    // パターン1: 賛成（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "賛成です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content:
          "なぜなら賛成だからです。市民のためになると思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン2: 反対（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "反対です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "財源が不明確だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン3: どちらでもない（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      {
        role: "user" as const,
        content: "どちらでもないです",
      },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "もっと情報が必要だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン4: 完了したけどレポート未作成
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "賛成です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "良い議案だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン5: 進行中（途中で離脱）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      {
        role: "user" as const,
        content: "うーん、ちょっと考えさせてください",
      },
    ],
  ];

  const messages: Omit<
    InterviewMessageInsert,
    "id" | "created_at"
  >[] = [];

  sessionIds.forEach((sessionId, sessionIndex) => {
    // 5パターンをループ
    const patternIndex = sessionIndex % 5;
    const conversation = conversations[patternIndex];
    conversation.forEach((msg) => {
      messages.push({
        interview_session_id: sessionId,
        role: msg.role,
        content: msg.content,
      });
    });
  });

  return messages;
}

// インタビューレポートを作成（パターン1,2,3のみ = 5の倍数で0,1,2番目）
export function createInterviewReports(
  sessionIds: string[]
): Omit<
  InterviewReportInsert,
  "id" | "created_at" | "updated_at"
>[] {
  const reportTemplates = [
    {
      stance: "for" as const,
      summary:
        "この議案に賛成。市民のためになると考えている。",
      role: "general_citizen" as const,
      role_title: "一般市民",
      role_description: "議案の内容に賛同する市民",
      opinions: [
        { title: "賛成理由", content: "市民のためになる" },
      ],
    },
    {
      stance: "against" as const,
      summary:
        "財源の確保が不透明であり、将来世代への負担増大が懸念されるため反対の立場をとる。歳出削減や他の財源確保策を十分に検討した上で、持続可能な制度設計を行うべきだと考える。",
      role: "work_related" as const,
      role_title: "会社員",
      role_description: "財政面を懸念する市民",
      opinions: [
        { title: "反対理由", content: "財源が不明確" },
      ],
    },
    {
      stance: "neutral" as const,
      summary:
        "判断するにはより多くの情報が必要と考えている。",
      role: "subject_expert" as const,
      role_title: "専門家",
      role_description: "慎重な判断を求める市民",
      opinions: [
        { title: "態度保留理由", content: "情報不足" },
      ],
    },
  ];

  const reports: Omit<
    InterviewReportInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // パターン1,2,3（5の倍数で0,1,2番目）のみレポートを作成
  sessionIds.forEach((sessionId, index) => {
    const patternIndex = index % 5;
    if (patternIndex < 3) {
      const loopIndex = Math.floor(index / 5);
      reports.push({
        interview_session_id: sessionId,
        ...reportTemplates[patternIndex],
        is_public_by_user: loopIndex < 5, // 最初の5件は公開
        is_public_by_admin: loopIndex < 3, // 最初の3ループ分は管理者承認済み
      });
    }
  });

  return reports;
}

// デモ用の固定ID
export const DEMO_SESSION_ID =
  "00000000-0000-0000-0000-000000000001";
export const DEMO_REPORT_ID =
  "00000000-0000-0000-0000-000000000001";

// 4種類のロールを確認するためのデモ用ID
export const DEMO_SESSION_ID_WORK =
  "00000000-0000-0000-0000-000000000002";
export const DEMO_SESSION_ID_DAILY =
  "00000000-0000-0000-0000-000000000003";
export const DEMO_SESSION_ID_CITIZEN =
  "00000000-0000-0000-0000-000000000004";
export const DEMO_REPORT_ID_WORK =
  "00000000-0000-0000-0000-000000000002";
export const DEMO_REPORT_ID_DAILY =
  "00000000-0000-0000-0000-000000000003";
export const DEMO_REPORT_ID_CITIZEN =
  "00000000-0000-0000-0000-000000000004";

// デモ用のインタビューセッション（公開、固定ID）
export function createDemoSession(
  interviewConfigId: string
): InterviewSessionInsert {
  const now = new Date();
  return {
    id: DEMO_SESSION_ID,
    interview_config_id: interviewConfigId,
    user_id: "00000000-0000-0000-0000-000000000000",
    started_at: new Date(now.getTime() - 3600000).toISOString(),
    completed_at: new Date(now.getTime() - 3000000).toISOString(),
  };
}

// デモ用のインタビューメッセージ
export function createDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。\n\n新宿区議会で審議されている路上喫煙・散乱ごみ防止条例の改正について、区民の皆さまのご意見をお聞かせください。この条例改正について、どのようにお考えですか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content:
        "繁華街だけでなく住宅街のポイ捨てや犬のふん放置も困っていたので、条例でしっかり対策を進めてほしいです。",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "身近な生活環境の改善を期待されているのですね。特にテイクアウト容器の散乱や犬のふん処理について、どのような対策や周知が効果的だとお考えですか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content:
        "テイクアウト店へのごみ箱設置協力や、散歩ルートでのマナー周知など、誰にでもわかりやすい啓発が大切だと思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// デモ用のインタビューレポート（固定ID）
export function createDemoReport(): InterviewReportInsert {
  return {
    id: DEMO_REPORT_ID,
    interview_session_id: DEMO_SESSION_ID,
    stance: "for",
    summary:
      "テイクアウト容器等の散乱や犬のふん放置対策の強化に賛成。実効性を高めるため、飲食店との連携や分かりやすい多言語マナー啓発の推進を求める。",
    role: "subject_expert",
    role_title: "環境衛生専門家",
    role_description:
      "新宿区在住の環境アドバイザー\n都市の生活環境美化と衛生管理に精通している",
    opinions: [
      {
        title: "生活環境美化と犬のふん放置防止の徹底",
        content:
          "繁華街だけでなく住宅街や通学路の美化向上のため、飲食店へのごみ箱管理協力や多言語でのマナー啓発が必要。",
      },
    ],
    is_public_by_user: true,
    is_public_by_admin: true,
  };
}

// 追加のデモ用セッション（3種類のロール確認用）
export function createAdditionalDemoSessions(
  interviewConfigId: string
): InterviewSessionInsert[] {
  const now = new Date();
  return [
    {
      id: DEMO_SESSION_ID_WORK,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000010",
      started_at: new Date(now.getTime() - 7200000).toISOString(),
      completed_at: new Date(now.getTime() - 6600000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_DAILY,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000011",
      started_at: new Date(now.getTime() - 10800000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_CITIZEN,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000012",
      started_at: new Date(now.getTime() - 14400000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
  ];
}

// 追加のデモ用メッセージ（3種類のロール確認用）
export function createAdditionalDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    // work_related セッション用
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content:
        "店舗前の路上へのごみポイ捨てが多く困っていたので、条例改正には大賛成です。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "事業者としてのお立場からのご意見ですね。具体的にどのような影響がありますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content:
        "毎朝店舗前のプラスチック容器や吸い殻の清掃に追われています。テイクアウト容器も対象になることで、ポイ捨て抑止につながると期待しています。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
    // daily_life_affected セッション用
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content:
        "愛犬の散歩を毎日していますが、ふんの不始末で愛犬家全体が悪く見られるのが悲しかったので、用具携帯の義務化に賛成です。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "飼い主として日常的な影響を感じていらっしゃるのですね。どのような周知や設備があると良いとお考えですか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content:
        "公園にマナー啓発の看板を増やしたり、専用のごみ箱が適切に管理されると、散歩する側も街の人も気持ちよく過ごせると思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
    // general_citizen セッション用
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content:
        "きれいな街になるのは良いことですが、過剰な取り締まりにならないかや、外国人観光客への周知が気になります。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "実効性と周知方法のバランスについてお考えなのですね。どのような点が大切だと思いますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content:
        "罰則だけでなく、多言語での分かりやすい案内表示や喫煙所の適切な配置など、環境整備もセットで進めてほしいです。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// 追加のデモ用レポート（3種類のロール確認用）
export function createAdditionalDemoReports(): InterviewReportInsert[] {
  return [
    {
      id: DEMO_REPORT_ID_WORK,
      interview_session_id: DEMO_SESSION_ID_WORK,
      stance: "for",
      summary:
        "商店街の店舗経営者として、店舗前ごみ散乱防止と街の美化向上のため賛成",
      role: "work_related",
      role_title: "飲食店経営者",
      role_description:
        "新宿区内で店舗を営む事業者\n毎朝の路上清掃負担や街の景観に関心がある",
      opinions: [
        {
          title: "テイクアウトごみのポイ捨て抑止に期待",
          content:
            "毎朝店舗前のプラスチック容器や吸い殻の清掃に追われている。テイクアウト容器も対象になることで、ポイ捨て抑止につながると期待している。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_DAILY,
      interview_session_id: DEMO_SESSION_ID_DAILY,
      stance: "for",
      summary:
        "愛犬の散歩を行う区民として、マナー向上と清潔な歩道環境の確保を期待",
      role: "daily_life_affected",
      role_title: "主婦・愛犬家",
      role_description:
        "新宿区在住の区民\n犬の散歩を日課としており、公園や歩道の美化に関心がある",
      opinions: [
        {
          title: "飼い主のマナー向上と用具携帯の義務化を歓迎",
          content:
            "一部のマナー違反で愛犬家全体が悪く見られることを防ぐためにも、用具携帯義務化と啓発看板の設置を歓迎する。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_CITIZEN,
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      stance: "neutral",
      summary:
        "環境美化には賛同しつつも、多言語での分かりやすい周知と喫煙所整備を要望",
      role: "general_citizen",
      role_title: "会社員",
      role_description:
        "新宿区在住の会社員\n外国人来訪者への案内や都市の受入環境に関心がある",
      opinions: [
        {
          title: "多言語啓発と喫煙環境整備のバランス",
          content:
            "罰則だけでなく、外国人観光客にも分かりやすい案内表示や喫煙所の適切な配置など、受入環境の整備もセットで進めてほしい。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
  ];
}
