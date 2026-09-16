import type { Database } from "@mirai-gikai/supabase";

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
export const councilSessions: CouncilSessionInsert[] = [
  {
    name: "令和8年 第2回定例会",
    slug: "r8-2",
    council_url:
      "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_02.html",
    start_date: "2026-06-05",
    end_date: "2026-06-19",
    is_active: true,
  },
  {
    name: "令和8年 第1回定例会",
    slug: "r8-1",
    council_url:
      "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_01.html",
    start_date: "2026-02-18",
    end_date: "2026-03-23",
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

export const bills: BillInsert[] = [
  {
    name: "新宿区空き缶等の散乱及び路上喫煙による被害の防止に関する条例の一部を改正する条例",
    bill_number: "第53号議案",
    slug: "bill-r8-2-53",
    status: "approved",
    status_note: "本会議で原案可決",
    published_at: "2026-06-19T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
    pdf_url: "https://www.city.shinjuku.lg.jp/content/000457652.pdf",
  },
  {
    name: "令和8年度新宿区一般会計補正予算（第2号）",
    bill_number: "第42号議案",
    slug: "bill-r8-2-42",
    status: "approved",
    status_note: "本会議で原案可決",
    published_at: "2026-06-19T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
    pdf_url: "https://www.city.shinjuku.lg.jp/content/000457639.pdf",
  },
  {
    name: "新宿区印鑑条例等の一部を改正する条例",
    bill_number: "第49号議案",
    slug: "bill-r8-2-49",
    status: "approved",
    status_note: "本会議で原案可決",
    published_at: "2026-06-19T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
    pdf_url: "https://www.city.shinjuku.lg.jp/content/000457648.pdf",
  },
  {
    name: "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例",
    bill_number: "第51号議案",
    slug: "bill-r8-2-51",
    status: "approved",
    status_note: "本会議で原案可決",
    published_at: "2026-06-19T10:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
    pdf_url: "https://www.city.shinjuku.lg.jp/content/000457650.pdf",
  },
  {
    name: "新宿コズミックセンタープラネタリウム設備改修工事等委託契約",
    bill_number: "第58号議案",
    slug: "bill-r8-2-58",
    status: "approved",
    status_note: "本会議で原案可決",
    published_at: "2026-06-19T10:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
    pdf_url: "https://www.city.shinjuku.lg.jp/content/000457657.pdf",
  },
];

// 議案とタグの関連付け
export function createBillsTags(
  insertedBills: { id: string; name: string }[],
  insertedTags: { id: string; label: string }[]
): Omit<BillsTagsInsert, "id" | "created_at">[] {
  const billTagMap: { [billName: string]: string[] } = {
    "新宿区空き缶等の散乱及び路上喫煙による被害の防止に関する条例の一部を改正する条例": ["まちづくり・環境"],
    "令和8年度新宿区一般会計補正予算（第2号）": ["くらし・行財政"],
    "新宿区印鑑条例等の一部を改正する条例": ["多文化共生・手続き"],
    "新宿区特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例": ["子育て・教育"],
    "新宿コズミックセンタープラネタリウム設備改修工事等委託契約": ["文化・生涯学習"],
  };

  const billsTags: Omit<BillsTagsInsert, "id" | "created_at">[] = [];

  for (const bill of insertedBills) {
    const tagLabels = billTagMap[bill.name] || [];
    for (const tagLabel of tagLabels) {
      const tag = insertedTags.find((t) => t.label === tagLabel);
      if (tag) {
        billsTags.push({
          bill_id: bill.id,
          tag_id: tag.id,
        });
      }
    }
  }

  return billsTags;
}

// 会派見解データ
const factionStancesData: Omit<
  FactionStanceInsert,
  "bill_id" | "faction_id"
>[] = [
  {
    type: "for",
    comment: `繁華街をはじめとする区内全域での路上喫煙やテイクアウト容器等のポイ捨て防止を徹底し、清潔で安心なまちづくりを前進させる適切な改正です。`,
  },
  {
    type: "for",
    comment: `物価高騰下における区民生活への緊急支援と地域防災の強化を迅速に進めるための追加予算として賛成します。`,
  },
  {
    type: "for",
    comment: `在留カードとマイナンバーカードの一体化に対応し、外国人住民の証明書コンビニ交付の利便性を向上させる前向きな措置です。`,
  },
  {
    type: "for",
    comment: `満3歳以上の小規模保育事業の基準を整備し、待機児童対策と質の高い保育環境の確保を両立させる改正として妥当です。`,
  },
  {
    type: "for",
    comment: `子どもたちの科学への関心を育み、幅広い世代の区民に親しまれる教育・生涯学習拠点としての設備更新として賛成します。`,
  },
];

export function createFactionStances(
  insertedBills: { id: string; name: string }[],
  miraiFactionId: string
): FactionStanceInsert[] {
  return factionStancesData.map((stance, index) => ({
    ...stance,
    bill_id: insertedBills[index]?.id || "",
    faction_id: miraiFactionId,
  }));
}

// インタビュー設定を作成（最初の議案用）
export function createInterviewConfig(
  insertedBills: { id: string; name: string }[]
): Omit<InterviewConfigInsert, "id" | "created_at" | "updated_at"> | null {
  const targetBill = insertedBills[0];
  if (!targetBill) return null;

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
