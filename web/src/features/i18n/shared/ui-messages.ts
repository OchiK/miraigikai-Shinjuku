import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { siteConfig } from "@/config/site.config";
import {
  DIFFICULTY_LABELS,
  type DifficultyLevelEnum,
} from "@/features/bill-difficulty/shared/types";
import {
  type BillSourceLinkFormat,
  JA_BILL_SOURCE_LINK_FORMAT,
} from "@/features/bills/shared/utils/build-bill-source-links";
import {
  COUNCILOR_SOURCES,
  QUESTION_SOURCES,
} from "@/features/councilors/shared/constants";
import type {
  CommitteeKind,
  CommitteeRole,
  VenueType,
} from "@/features/councilors/shared/types";
import { COMMITTEE_KIND_LABELS } from "@/features/councilors/shared/utils/committee-kind";
import { VENUE_LABELS } from "@/features/councilors/shared/utils/councilor-questions";

/**
 * サイト全体の UI 文言（docs/BACKLOG.md P8-12）。
 *
 * docs/I18N_AND_EASY_JAPANESE.md「UI翻訳と議案翻訳を分ける」に従い、UI 文言は
 * ここで管理する。議案本文・議案名・タグ名・会期名は DB のまま（日本語）出す。
 * 英語側はネイティブ話者の確認前のため、日本語側を正とする。
 */
/**
 * DB の日本語（会期名・会派名など）の前後に置く文言。
 * 差し込む日本語を lang="ja" で挟めるよう、文言と分けて持つ
 */
export type AroundJa = { before: string; after: string };

export type UiMessages = {
  nav: {
    bills: string;
    /** ヘッダーの主要導線。最新の定例会の議案一覧へ行くことを示す */
    latestBills: string;
    councilors: string;
    primaryNavLabel: string;
    secondaryNavLabel: string;
    home: string;
    returnToHome: string;
    openMenu: string;
    sessionBills: (sessionName: string) => string;
  };
  difficulty: {
    groupLabel: string;
    labels: Record<DifficultyLevelEnum, string>;
  };
  home: {
    heroLines: [string, string];
    heroImageAlt: string;
    /** 議案名・要約・タグが日本語のままであることの案内。日本語表示では出さない */
    billsInJapaneseNotice: string | null;
    featuredTitle: string;
    featuredSubtitle: string;
    moreTagBills: (tagLabel: string) => string;
    archiveSubtitle: string;
    /** 現在の定例会の議案一覧ページ見出しの下に置く説明 */
    currentSessionSubtitle: string;
    /** 最新の定例会に付けるバッジ */
    latestBadge: string;
    inSession: string;
    notInSession: string;
    /** 会期。終了日が未定なら開始日のみ */
    sessionDates: (start: string, end: string | null) => string;
    allBillsHeading: string;
    sessionBillsHeading: (year: number, sessionName: string) => string;
    billCount: (count: number) => string;
    sessionPeriod: (params: {
      year: number;
      startMonth: number;
      endMonth: number;
      sessionName: string;
    }) => string;
    readMore: string;
    /** 全国のみらい議会マップへのバナー */
    miraiMap: {
      badge: string;
      title: string;
      description: string;
      buttonLabel: string;
      /** リンクのアクセシブルネーム。表示ラベルを含める（WCAG 2.5.3） */
      ariaLabel: string;
    };
  };
  about: {
    lead: string;
    headingLines: [string, string];
    body: string;
    basedOn: string;
    unofficial: string;
    contactBefore: string;
    operatorName: string;
    contactAfter: string;
    sourceBefore: string;
    sourceAfter: string;
  };
  factionStances: {
    headingFinal: string;
    headingPending: string;
    preparing: string;
    stanceLabels: {
      for: string;
      against: string;
    };
    otherLabel: string;
    factionCount: (count: number) => string;
    /** 全会派が同じ賛否のとき、件数の代わりに出す一文 */
    unanimousFor: (count: number) => string;
    unanimousAgainst: (count: number) => string;
    /**
     * 賛否が分かれたとき、少ない側の件数に添える会派名の括弧と区切り。
     * 会派名は日本語のまま lang="ja" で挟むため、文言と分けて持つ
     */
    minorityNames: { before: string; after: string; separator: string };
    source: string;
    opensInNewTab: string;
  };
  billCouncilors: {
    heading: string;
    /** 議員の質問が日本語のままであることの案内。日本語表示では出さない */
    questionsInJapaneseNotice: string | null;
  };
  disclaimer: {
    contentTitle: string;
    contentBody: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    faq: string;
  };
  card: {
    featured: string;
    published: (date: string) => string;
    interviewOpen: string;
    reviewComplete: string;
  };
  footer: {
    primaryLinksLabel: string;
    homeLogoLabel: string;
    top: string;
    aboutSite: string;
    faq: string;
    terms: string;
    privacy: string;
    sourceCode: string;
    notTeamMirai: string;
    unofficialNotice: string;
    copyright: string;
  };
  sessionBills: {
    /** Archive ロゴの下。会期名を挟む */
    archiveSubtitle: AroundJa;
    heading: (year: number) => AroundJa;
    period: (year: number, startMonth: number, endMonth: number) => AroundJa;
    emptyNotice: string;
    councilLinkLead: (year: number) => AroundJa;
    councilLinkText: string;
    statusFilterLabel: string;
    statusFilters: Record<"all" | "approved" | "rejected" | "other", string>;
    tagFilterLabel: string;
    allTags: string;
    noResults: string;
    upcomingHeading: string;
    upcomingSubtitle: string;
  };
  councilors: {
    heading: string;
    lead: string;
    stats: { listed: string; seats: string; groups: string; questions: string };
    personCount: (count: number) => string;
    groupCount: (count: number) => string;
    questionCount: (count: number) => string;
    sourceNotice: string;
    emptyNotice: string;
    searchLabel: string;
    filterLegend: string;
    filterAll: (total: number) => string;
    showing: (count: number) => string;
    viewMode: { legend: string; byFaction: string; byCommittee: string };
    committeeFilterLegend: string;
    /** 委員会別表示の件数。people は重複を除いた人数 */
    showingByCommittee: (committees: number, people: number) => string;
    noResults: string;
    unaffiliated: string;
    memberCount: (count: number) => string;
    terms: (terms: number) => string;
    questions: (count: number) => string;
    onlyEarlierNotice: string;
    committeeRoles: Record<CommitteeRole, string>;
    /** 委員会名（日本語）に添える役職の括弧 */
    roleParen: AroundJa;
    listSeparator: string;
  };
  councilorDetail: {
    backToList: string;
    memberTitle: string;
    questionCountsLabel: string;
    venueLabels: Record<VenueType, string>;
    venueCount: (count: number) => string;
    aboutHeading: string;
    questionsHeading: string;
    labels: {
      faction: string;
      bills: string;
      committees: string;
      topics: string;
      terms: string;
      officialInfo: string;
    };
    officialFactionsLink: string;
    officialCommitteesLink: string;
    billsLead: string;
    viewSessionBills: AroundJa;
    committeeKinds: Record<CommitteeKind, string>;
    noCommittees: string;
    topicTagsLabel: string;
    topicTagCount: (count: number) => string;
    noTopicTags: string;
    /** 傾向の注記。以前の定例会の質問なら、その会期名を session で挟む */
    topicsNote: (count: number) => {
      before: string;
      session: AroundJa;
      after: string;
    };
    websiteLink: string;
    websiteNote: string;
    xLink: string;
    xNote: string;
    questionsLead: string;
    earlierSessionsRule: string;
    questionsTail: string;
    /** 質問が日本語のままであることの案内。日本語表示では出さない */
    questionsInJapaneseNotice: string | null;
    earlierNotice: AroundJa;
    noQuestions: string;
  };
  councilorSources: {
    councilorsHeading: string;
    councilorsBody: string;
    xBody: string;
    linkLabels: {
      roster: string;
      factions: string;
      committees: string;
      minutes: string;
    };
    questionsHeading: string;
    questionsBody: string;
    disclaimerHeading: string;
    disclaimerBody: string;
    faq: string;
  };
  billDetail: {
    /** 上部ナビの戻り先（会期の議案一覧）。会期名を挟む */
    backToSession: AroundJa;
    officialPage: string;
    summaryHeading: string;
    summaryNote: string;
    reviewInProgress: string;
    /** レビュー完了バッジのツールチップ。2行に分けて出す */
    reviewCompleteTooltip: [string, string];
    timeline: {
      heading: string;
      events: Record<"submitted" | "in_committee" | "plenary_session", string>;
      dateLabels: { notRecorded: string; undecided: string; omitted: string };
      committeeOmitted: string;
      /** 議決前に並べる肯定形と否定形の区切り */
      decisionSeparator: string;
    };
    originalText: string;
    sourcesHeading: string;
    sourceLinks: BillSourceLinkFormat;
    chat: {
      heading: string;
      body: string;
      button: string;
      window: {
        title: string;
        /** 会話の先頭に固定する注意書き（デザインシステム定義 §10-2） */
        notice: string;
        initialHeading: string;
        initialSub: string;
        /** 議案についてのものだけを3つまで */
        sampleQuestions: [string, string, string];
        thinking: string;
        placeholder: string;
        sendAriaLabel: string;
        closeAriaLabel: string;
        languageSelectorLabel: string;
        hint: string;
        /** 窓口確認の免責。AIを最終的な判断者にしない */
        disclaimer: string;
        /** 出典チップのスクリーンリーダー向けラベル */
        sourceLabel: string;
        /** 本文選択からチャットを開くとき最初に送る質問 */
        askAboutSelection: (selectedText: string) => string;
      };
      errors: {
        dailyLimit: string;
        monthlyLimit: string;
        billContextRequired: string;
        billNotPublished: string;
        billContentUnavailable: string;
        costCheckFailed: string;
        maintenance: string;
        general: string;
        /** 議案と関係のない質問への案内（有料モデルは呼ばない） */
        offTopic: string;
        /** 出典のない生成回答を画面に出さないための差し替え文言 */
        sourceUnavailable: string;
      };
      interviewSuggestion: {
        audience: string;
        heading: (billName: string) => string;
        duration: string;
        depth: string;
        policyUse: string;
        cta: string;
      };
    };
    participationLabel: string;
    share: {
      share: string;
      report: string;
      modalTitle: string;
      modalSubtitle: string;
      nativeShare: string;
      thumbnailAlt: string;
      close: string;
    };
  };
};

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** 「held in June 2026」「held February–March 2026」 */
function enHeld(year: number, startMonth: number, endMonth: number): string {
  return startMonth === endMonth
    ? `held in ${EN_MONTHS[startMonth - 1]} ${year}`
    : `held ${EN_MONTHS[startMonth - 1]}–${EN_MONTHS[endMonth - 1]} ${year}`;
}

/** 1件だけ単数形にする */
function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${pluralForm}`;
}

const en = siteConfig.english;
const cs = COUNCILOR_SOURCES;
const qs = QUESTION_SOURCES;

export const UI_MESSAGES: Record<PublicLocale, UiMessages> = {
  ja: {
    nav: {
      bills: "議案一覧",
      latestBills: "最新の議案一覧",
      councilors: "議員一覧",
      primaryNavLabel: "主要ナビゲーション",
      secondaryNavLabel: "補助ナビゲーション",
      home: "トップへ",
      returnToHome: "トップページへ戻る",
      openMenu: "メニューを開く",
      sessionBills: (sessionName) => sessionName,
    },
    difficulty: {
      groupLabel: "説明の詳しさを切り替え",
      labels: DIFFICULTY_LABELS,
    },
    home: {
      heroLines: [
        `いま${siteConfig.councilName}で議論されていること`,
        "やさしい言葉で説明します",
      ],
      heroImageAlt: siteConfig.councilName,
      billsInJapaneseNotice: null,
      featuredTitle: "注目の議案",
      featuredSubtitle: "議会に上程された注目議案",
      moreTagBills: (tagLabel) => `その他の${tagLabel}議案はこちら`,
      archiveSubtitle: "過去の定例会に上程された議案",
      currentSessionSubtitle: "現在審議されている議案の一覧",
      latestBadge: "最新",
      inSession: "開会中",
      notInSession: "閉会中",
      sessionDates: (start, end) => (end ? `${start}〜${end}` : `${start}〜`),
      allBillsHeading: "分野別の議案一覧",
      sessionBillsHeading: (year, sessionName) =>
        `${year}年 ${sessionName}の議案`,
      billCount: (count) => `${count}件`,
      sessionPeriod: ({ year, startMonth, endMonth, sessionName }) =>
        `${year}.${startMonth}月〜${endMonth}月に実施された${sessionName}`,
      readMore: "もっと読む",
      miraiMap: {
        badge: "関連プロジェクト",
        title: "全国のみらい議会マップ",
        description:
          "全国の自治体議会における「みらい議会」の開設状況や議会カバー率を可視化したポータルサイトです。",
        buttonLabel: "マップを見る",
        ariaLabel: "みらい議会マップを見る（新しいタブで開きます）",
      },
    },
    about: {
      lead: `${siteConfig.siteName}とは`,
      headingLines: ["議会での議論を", "できる限りわかりやすく"],
      body: `${siteConfig.siteName}は、${siteConfig.siteDescription}。公式資料を確認しながら、区政への理解を深めるためにご利用ください。`,
      basedOn:
        "このサイトは「チームみらい」開発の「みらい議会」をベースに作成しています。",
      unofficial:
        "このサイトは「チームみらい」の公式ではない、非公式のサイトです。",
      contactBefore:
        "ご意見や不具合等がございましたら党公式への連絡ではなく、運営者（",
      operatorName: siteConfig.operator.name,
      contactAfter: "）にご連絡お願いします。",
      sourceBefore: "本サービスのソースコード（AGPL-3.0）は ",
      sourceAfter: " で公開されています。",
    },
    factionStances: {
      headingFinal: "議決結果",
      headingPending: "会派の賛否",
      preparing: "議案上程後に各会派の賛否を表明します。",
      stanceLabels: {
        for: "賛成",
        against: "反対",
      },
      otherLabel: "その他",
      factionCount: (count) => `${count}会派`,
      unanimousFor: (count) => `全会派が賛成（${count}会派）`,
      unanimousAgainst: (count) => `全会派が反対（${count}会派）`,
      minorityNames: { before: "（", after: "）", separator: "、" },
      source: "出典：",
      opensInNewTab: "（新しいタブで開きます）",
    },
    billCouncilors: {
      heading: "この議案と議員",
      questionsInJapaneseNotice: null,
    },
    disclaimer: {
      contentTitle: "掲載コンテンツについて",
      contentBody: `掲載されている議案情報は、${siteConfig.councilName}に上程された議案などの公開情報を基に、AIを活用しながら背景情報を整理したものです。`,
      disclaimerTitle: "免責事項",
      disclaimerBody:
        "本サイトで公開する情報は、可能な限り正確かつ最新の情報を反映するよう努めていますが、その正確性・完全性・即時性について保証するものではありません。また、AIチャットは不正確または誤解を招く回答を生成する可能性があります。正確な情報は、公式文書や一次資料をご確認ください。",
      faq: "よくある質問",
    },
    card: {
      featured: "注目",
      published: (date) => `${date} 掲載`,
      interviewOpen: "AIインタビュー受付中",
      reviewComplete: "レビュー完了",
    },
    footer: {
      primaryLinksLabel: "主要リンク",
      homeLogoLabel: `${siteConfig.siteName} トップページ`,
      top: "TOP",
      aboutSite: `${siteConfig.siteName}とは`,
      faq: "よくあるご質問",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      sourceCode: "ソースコード (GitHub)",
      notTeamMirai: "これは政党チームみらいが運営しているものではありません。",
      unofficialNotice: `本サイトは個人が運営する非公式サービスです。${siteConfig.cityName}および${siteConfig.councilName}が運営・監修するものではありません。`,
      copyright: `© 2026 ${siteConfig.siteName} (非公式) / 運営: ${siteConfig.operator.name}`,
    },
    sessionBills: {
      archiveSubtitle: { before: "", after: "に上程された議案" },
      heading: (year) => ({ before: `${year}年 `, after: "の提出議案" }),
      period: (year, startMonth, endMonth) => ({
        before: `${year}.${startMonth}月〜${endMonth}月に実施された`,
        after: "",
      }),
      emptyNotice: "この定例会の議案はまだありません",
      councilLinkLead: (year) => ({
        before: `${year}年`,
        after: "に上程された全ての議案は",
      }),
      councilLinkText: `${siteConfig.councilName}情報へ`,
      statusFilterLabel: "議決結果で絞り込む",
      // status 列挙での絞り込みであり、approved には原案可決の議案と
      // 専決処分の承認（承認第2号・第3号）が混在する。「可決」だけを掲げると
      // 承認案件を可決と呼ぶことになるため、両方の用語を label に出す。
      statusFilters: {
        all: "ALL",
        approved: "可決・承認",
        rejected: "否決・不承認",
        other: "その他",
      },
      tagFilterLabel: "タグで絞り込む",
      allTags: "すべてのタグ",
      noResults: "該当する議案がありません",
      upcomingHeading: "これから掲載される議案",
      upcomingSubtitle: "順次掲載されていきます",
    },
    councilors: {
      heading: `${siteConfig.councilName}議員`,
      lead: `${siteConfig.councilName}の議員の所属会派と所属委員会、議会での質問をまとめています。`,
      stats: {
        listed: "掲載議員",
        seats: "定数",
        groups: "会派",
        questions: "掲載質問",
      },
      personCount: (count) => `${count}人`,
      groupCount: (count) => `${count}会派`,
      questionCount: (count) => `${count}件`,
      sourceNotice: `${cs.asOf}時点の公式名簿にもとづきます。質問は${qs.scope}の会議録から掲載しています。${qs.earlierSessionsRule}`,
      emptyNotice: "議員情報はまだ掲載されていません",
      searchLabel: "氏名・ふりがなで探す",
      filterLegend: "会派で絞り込む",
      filterAll: (total) => `すべて ${total}`,
      showing: (count) => `${count}人を表示しています`,
      viewMode: {
        legend: "表示の切り替え",
        byFaction: "会派別",
        byCommittee: "委員会別",
      },
      committeeFilterLegend: "委員会で絞り込む",
      showingByCommittee: (committees, people) =>
        `${committees}委員会・${people}人を表示しています`,
      noResults: "該当する議員がいません",
      unaffiliated: "会派なし",
      memberCount: (count) => `${count}人`,
      terms: (terms) => `${terms}期`,
      questions: (count) => `質問 ${count}件`,
      onlyEarlierNotice: `${qs.scopeSessionsLabel}の代表質問・一般質問はなく、以前の定例会の質問を掲載`,
      committeeRoles: { 委員長: "委員長", 副委員長: "副委員長", 委員: "委員" },
      roleParen: { before: "（", after: "）" },
      listSeparator: "、",
    },
    councilorDetail: {
      backToList: "議員一覧へ",
      memberTitle: `${siteConfig.councilName}議員`,
      questionCountsLabel: "掲載中の質問",
      venueLabels: VENUE_LABELS,
      venueCount: (count) => `${count}件`,
      aboutHeading: "この議員について",
      questionsHeading: "掲載中の質問",
      labels: {
        faction: "会派等",
        bills: "審議している議案",
        committees: "所属委員会",
        topics: "掲載中の質問からの傾向",
        terms: "当選回数",
        officialInfo: "公式の情報",
      },
      officialFactionsLink: `公式の${cs.factions.label}`,
      officialCommitteesLink: `公式の${cs.committees.label}`,
      billsLead: "議案は本会議で採決され、各会派が賛否を示します。",
      viewSessionBills: { before: "", after: "の議案一覧を見る" },
      committeeKinds: COMMITTEE_KIND_LABELS,
      noCommittees: "所属なし",
      topicTagsLabel: "主なテーマ",
      topicTagCount: (count) => `${count}件`,
      noTopicTags: "テーマタグはまだありません",
      topicsNote: (count) => ({
        before: `このサイトで公開中の質問${count}件`,
        session: { before: "（", after: "の質問）" },
        after: `に付けたテーマタグを数えたものです（${qs.asOf}時点）。タグはAIが付けたもので、議員の関心のすべてを表すものではありません。`,
      }),
      websiteLink: "議員本人のウェブサイト",
      websiteNote: "公式名簿に掲載されているURLです",
      xLink: "議員本人のX（旧Twitter）",
      xNote: `${cs.xAccounts.rule}です`,
      questionsLead: `${qs.scope}での質問を、論点ごとに新しい順で掲載しています。`,
      earlierSessionsRule: qs.earlierSessionsRule,
      questionsTail:
        "要約はAIが会議録の質問部分をもとに作成したもので、答弁の内容は含みません。正確な内容は会議録をご確認ください。",
      questionsInJapaneseNotice: null,
      earlierNotice: {
        before: `${qs.scopeSessionsLabel}の本会議では、この議員の代表質問・一般質問はありません。それ以前で最も新しい`,
        after: "の質問を掲載しています。",
      },
      noQuestions: "質問はまだ登録されていません",
    },
    councilorSources: {
      councilorsHeading: "議員情報の出典",
      councilorsBody: `氏名・当選回数・所属会派・所属委員会は、${siteConfig.councilName}の公式ページ（${cs.asOf}更新）を転記したものです。肖像権に配慮し、顔写真は掲載していません。`,
      xBody: `議員本人のX（旧Twitter）は、${cs.xAccounts.rule}だけを掲載しています（${cs.xAccounts.asOf}確認）。`,
      linkLabels: {
        roster: `${siteConfig.councilName} ${cs.roster.label}`,
        factions: `${siteConfig.councilName} ${cs.factions.label}`,
        committees: `${siteConfig.councilName} ${cs.committees.label}`,
        minutes: `${siteConfig.councilName} ${qs.minutes.label}`,
      },
      questionsHeading: "質問要約の出典",
      questionsBody: `質問の見出しと要約は、${siteConfig.councilName}の${qs.minutes.label}に掲載された${qs.scope}の会議録をもとに、AIが作成したものです（${qs.asOf}作成）。${qs.earlierSessionsRule}要約に答弁の内容は含みません。テーマタグもAIが付けたものです。正確な内容は会議録をご確認ください。`,
      disclaimerHeading: "免責事項",
      disclaimerBody: `本サイトは${siteConfig.councilName}の公式サイトではありません。会派や委員会の構成は年度途中でも変わることがあります。正確な情報は、公式ページをご確認ください。`,
      faq: "よくある質問",
    },
    billDetail: {
      backToSession: { before: "", after: "" },
      officialPage: "区議会の公式ページ",
      summaryHeading: "かんたん要約",
      summaryNote: "AIによる要約です。正確な内容は原文をご確認ください。",
      reviewInProgress:
        "この記事はAI生成による下書きを含みます。公式一次資料との照合を進めているため、内容が変更されることがあります。",
      reviewCompleteTooltip: [
        "この記事は公式一次資料との照合および",
        "内容の確認が完了しています",
      ],
      timeline: {
        heading: "審議の経過",
        events: {
          submitted: "議案の上程",
          in_committee: "委員会での審査",
          plenary_session: "本会議での採決",
        },
        dateLabels: {
          notRecorded: "日付未登録",
          undecided: "日付未定",
          omitted: "省略",
        },
        committeeOmitted: "委員会への付託を省略し、本会議で採決",
        decisionSeparator: "／",
      },
      originalText: "議案の原文",
      sourcesHeading: "区議会の公式ページ",
      sourceLinks: JA_BILL_SOURCE_LINK_FORMAT,
      chat: {
        heading: "この議案について質問する",
        body: "この議案の資料をもとにAIが答えます。答えは間違うことがあります。",
        button: "質問する",
        window: {
          title: "この議案について質問する",
          notice:
            "この議案の資料をもとにAIが答えます。答えは間違うことがあります。",
          initialHeading:
            "この議案について、気になることをAIに質問してください。",
          initialSub: "本文中のテキストを選択すると簡単にAIに質問できます",
          sampleQuestions: [
            "この議案のポイントは？",
            "この議案は私にどんな影響がある？",
            "わが家は対象になりますか？",
          ],
          thinking: "考え中...",
          placeholder: "わからないことをAIに質問する",
          sendAriaLabel: "送信",
          closeAriaLabel: "モーダルを閉じる",
          languageSelectorLabel: "チャットの表示言語",
          hint: "AIの回答は間違えることがあります。重要な情報はご確認ください。",
          disclaimer: `手続きや対象の判断は${siteConfig.cityName}の窓口にご確認ください。`,
          sourceLabel: "出典",
          askAboutSelection: (selectedText) =>
            `「${selectedText}」について教えてください。`,
        },
        errors: {
          dailyLimit:
            "本日の利用上限に達しました。明日0時以降に再度お試しください。",
          monthlyLimit:
            "今月の利用上限に達しました。来月1日以降に再度お試しください。",
          billContextRequired:
            "議案が指定されていません。議案のページから質問してください。",
          billNotPublished: "指定された議案は現在公開されていません。",
          billContentUnavailable:
            "議案情報を取得できませんでした。時間をおいて再度お試しください。",
          costCheckFailed:
            "サービスが一時的に利用できません。時間をおいて再度お試しください。",
          maintenance:
            "現在AIチャット機能はメンテナンス中です。しばらく経ってから再度お試しください。",
          general:
            "エラーが発生しました。しばらく待ってから再度お試しください。",
          offTopic:
            "このチャットは、この議案についての質問にお答えします。議案の内容や、区民への影響、手続きなどについて質問してください。",
          sourceUnavailable:
            "提供された議案資料からは確認できません。詳しくは区の公式窓口にお問い合わせください。",
        },
        interviewSuggestion: {
          audience: "議案の当事者の方へ",
          heading: (billName) =>
            `${billName}についてのご意見をお聞かせください`,
          duration: "所要時間は最短約5分〜",
          depth: "AIがあなたの意見を深掘り",
          policyUse: "ご意見は政策議論に活用します",
          cta: "AIインタビューを受ける",
        },
      },
      participationLabel: "この議案への参加と共有",
      share: {
        share: "記事を共有する",
        report: "問題を報告する",
        modalTitle: "記事を共有する",
        modalSubtitle: "シェアして議会の議論をオープンに",
        nativeShare: "共有",
        thumbnailAlt: "記事のサムネイル",
        close: "このまま閉じる",
      },
    },
  },
  en: {
    nav: {
      bills: "Bills",
      latestBills: "Latest Bills",
      councilors: "Councilors",
      primaryNavLabel: "Main navigation",
      secondaryNavLabel: "Secondary navigation",
      home: "Home",
      returnToHome: "Back to the home page",
      openMenu: "Open menu",
      sessionBills: (sessionName) => sessionName,
    },
    difficulty: {
      groupLabel: "Choose how detailed the explanation is",
      labels: { easy: "Plain", normal: "Standard", hard: "Detailed" },
    },
    home: {
      heroLines: [
        `What ${en.councilName} is debating right now,`,
        "explained in plain language",
      ],
      heroImageAlt: en.councilName,
      billsInJapaneseNotice:
        "Bill titles, summaries, and topics on this page are shown in Japanese. Open a bill to read it in English when a translation is available.",
      featuredTitle: "Featured bills",
      featuredSubtitle: "Key bills submitted to the council",
      moreTagBills: (tagLabel) => `More bills tagged “${tagLabel}”`,
      archiveSubtitle: "Bills from past council sessions",
      currentSessionSubtitle: "Bills currently before the council",
      latestBadge: "Latest",
      inSession: "In session",
      notInSession: "Not in session",
      sessionDates: (start, end) =>
        end ? `${start} – ${end}` : `From ${start}`,
      allBillsHeading: "Bills by Topic",
      sessionBillsHeading: (year, sessionName) =>
        `Bills from ${sessionName} (${year})`,
      billCount: (count) => (count === 1 ? "1 bill" : `${count} bills`),
      sessionPeriod: ({ year, startMonth, endMonth, sessionName }) =>
        `${sessionName}, ${enHeld(year, startMonth, endMonth)}`,
      readMore: "Read more",
      miraiMap: {
        badge: "Related Project",
        title: "Nationwide Mirai Gikai Map",
        description:
          "A portal visualizing the adoption status and coverage of Mirai Gikai instances across local councils in Japan.",
        buttonLabel: "View Map",
        ariaLabel: "View Map: Nationwide Mirai Gikai Map (opens in a new tab)",
      },
    },
    about: {
      lead: `What is ${en.siteName}?`,
      headingLines: ["Making council debates", "as clear as we can"],
      body: `${en.siteName} is ${en.siteDescription}. Use it alongside the official materials to learn more about how the city is run.`,
      basedOn:
        "This site is built on Mirai Gikai, which was developed by Team Mirai.",
      unofficial: "It is an unofficial site and is not run by Team Mirai.",
      contactBefore:
        "For feedback or bug reports, please contact the operator (",
      operatorName: en.operatorName,
      contactAfter: "), not the party.",
      sourceBefore: "The source code for this service (AGPL-3.0) is on ",
      sourceAfter: ".",
    },
    factionStances: {
      headingFinal: "Vote results",
      headingPending: "Positions by parliamentary group",
      preparing:
        "Each parliamentary group will state its position once the bill is submitted.",
      stanceLabels: {
        for: "For",
        against: "Against",
      },
      otherLabel: "Other",
      factionCount: (count) => (count === 1 ? "1 group" : `${count} groups`),
      unanimousFor: (count) =>
        count === 1
          ? "The only parliamentary group voted in favor"
          : `All ${count} parliamentary groups voted in favor`,
      unanimousAgainst: (count) =>
        count === 1
          ? "The only parliamentary group voted against"
          : `All ${count} parliamentary groups voted against`,
      minorityNames: { before: " (", after: ")", separator: ", " },
      source: "Source: ",
      opensInNewTab: "(opens in a new tab)",
    },
    billCouncilors: {
      heading: "Councilors and this bill",
      questionsInJapaneseNotice:
        "Councilors' questions about this bill are shown in Japanese.",
    },
    disclaimer: {
      contentTitle: "About this content",
      contentBody: `The bill information on this site is based on public information, such as the bills submitted to ${en.councilName}. AI was used to help organize the background information.`,
      disclaimerTitle: "Disclaimer",
      disclaimerBody:
        "We try to keep the information on this site accurate and up to date, but we cannot guarantee that it is accurate, complete, or current. The AI chat can also give answers that are wrong or misleading. For accurate information, please check the official documents and primary sources.",
      faq: "FAQ",
    },
    card: {
      featured: "Featured",
      published: (date) => `Published ${date}`,
      interviewOpen: "AI interview open",
      reviewComplete: "Reviewed",
    },
    footer: {
      primaryLinksLabel: "Main links",
      homeLogoLabel: `${en.siteName} home page`,
      top: "Home",
      aboutSite: `About ${en.siteName}`,
      faq: "FAQ",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      sourceCode: "Source code (GitHub)",
      notTeamMirai: "This site is not run by the political party Team Mirai.",
      unofficialNotice: `This is an unofficial service run by an individual. It is not run or supervised by ${en.cityName} or ${en.councilName}.`,
      copyright: `© 2026 ${en.siteName} (unofficial) / Operator: ${en.operatorName}`,
    },
    sessionBills: {
      archiveSubtitle: { before: "Bills submitted to ", after: "" },
      heading: (year) => ({
        before: "Bills submitted to ",
        after: ` (${year})`,
      }),
      period: (year, startMonth, endMonth) => ({
        before: "",
        after: `, ${enHeld(year, startMonth, endMonth)}`,
      }),
      emptyNotice: "No bills have been listed for this session yet.",
      councilLinkLead: () => ({
        before: "For every bill submitted to ",
        after: ", see",
      }),
      councilLinkText: `the ${en.councilName} website`,
      statusFilterLabel: "Filter by result",
      statusFilters: {
        all: "ALL",
        approved: "Passed / Approved",
        rejected: "Rejected / Not approved",
        other: "Other",
      },
      tagFilterLabel: "Filter by topic",
      allTags: "All topics",
      noResults: "No bills match these filters.",
      upcomingHeading: "Bills coming soon",
      upcomingSubtitle: "We will add these as they are ready.",
    },
    councilors: {
      heading: `${en.councilName} members`,
      lead: `This page lists the parliamentary groups, committees, and council questions of each member of ${en.councilName}.`,
      stats: {
        listed: "Councilors listed",
        seats: "Seats",
        groups: "Parliamentary groups",
        questions: "Questions listed",
      },
      personCount: (count) => `${count}`,
      groupCount: (count) => `${count}`,
      questionCount: (count) => `${count}`,
      sourceNotice: `Based on the official roster as of ${cs.en.asOf}. Questions are taken from the minutes of the ${qs.en.scope}. ${qs.en.earlierSessionsRule}`,
      emptyNotice: "No councilor information has been added yet.",
      searchLabel: "Search by name (kanji or kana)",
      filterLegend: "Filter by parliamentary group",
      filterAll: (total) => `All ${total}`,
      showing: (count) => `Showing ${plural(count, "councilor", "councilors")}`,
      viewMode: {
        legend: "View",
        byFaction: "By parliamentary group",
        byCommittee: "By committee",
      },
      committeeFilterLegend: "Filter by committee",
      showingByCommittee: (committees, people) =>
        `Showing ${plural(people, "councilor", "councilors")} in ${plural(committees, "committee", "committees")}`,
      noResults: "No councilors match your search.",
      unaffiliated: "No parliamentary group",
      memberCount: (count) => plural(count, "member", "members"),
      terms: (terms) => plural(terms, "term", "terms"),
      questions: (count) => plural(count, "question", "questions"),
      onlyEarlierNotice: `No representative or general questions in ${qs.en.scopeSessionsLabel}; questions from an earlier session are shown.`,
      committeeRoles: {
        委員長: "Chair",
        副委員長: "Vice Chair",
        委員: "Member",
      },
      roleParen: { before: " (", after: ")" },
      listSeparator: ", ",
    },
    councilorDetail: {
      backToList: "Back to councilors",
      memberTitle: `Member of ${en.councilName}`,
      questionCountsLabel: "Questions listed",
      venueLabels: {
        plenary: "Plenary sessions",
        budget: "Budget and settlement committees",
        committee: "Committees",
      },
      venueCount: (count) => `${count}`,
      aboutHeading: "About this councilor",
      questionsHeading: "Questions in the council",
      labels: {
        faction: "Parliamentary group",
        bills: "Bills under deliberation",
        committees: "Committees",
        topics: "Topics in the listed questions",
        terms: "Terms served",
        officialInfo: "Official information",
      },
      officialFactionsLink: "Official list of parliamentary groups",
      officialCommitteesLink: "Official committee roster",
      billsLead:
        "Bills are put to a vote at a plenary session, and each parliamentary group states its position.",
      viewSessionBills: { before: "See bills from ", after: "" },
      committeeKinds: {
        standing: "Standing committees",
        steering: "Steering committee",
        special: "Special committees",
      },
      noCommittees: "None",
      topicTagsLabel: "Main topics",
      topicTagCount: (count) => `${count}`,
      noTopicTags: "No topic tags yet.",
      topicsNote: (count) => ({
        before: `Based on the topic tags attached to the ${plural(count, "question", "questions")} on this site`,
        session: { before: " (from ", after: ")" },
        after: `, as of ${qs.en.asOf}. The tags were assigned by AI and do not cover everything the councilor works on.`,
      }),
      websiteLink: "Councilor's own website",
      websiteNote: "This URL is listed in the official roster.",
      xLink: "Councilor's own X (Twitter) account",
      xNote: `We list only ${cs.en.xAccountsRule}.`,
      questionsLead: `Questions from the ${qs.en.scope}, newest first, one card per issue.`,
      // 英語は前の文との間に空白が要る
      earlierSessionsRule: ` ${qs.en.earlierSessionsRule}`,
      questionsTail:
        " The summaries were written by AI from the question part of the minutes and do not include the answers. Check the minutes for the exact wording.",
      questionsInJapaneseNotice:
        "The questions below are shown in Japanese, as recorded in the council minutes.",
      earlierNotice: {
        before: `This councilor asked no representative or general questions at the plenary sessions of ${qs.en.scopeSessionsLabel}. Shown instead are the questions from the most recent earlier session, `,
        after: ".",
      },
      noQuestions: "No questions have been added yet.",
    },
    councilorSources: {
      councilorsHeading: "Sources for councilor information",
      councilorsBody: `Names, terms served, parliamentary groups, and committees are copied from the official ${en.councilName} pages (updated ${cs.en.asOf}). We do not show photos, out of respect for portrait rights.`,
      xBody: `For councilors' own X (Twitter) accounts, we list only ${cs.en.xAccountsRule} (checked ${cs.en.xAccountsAsOf}).`,
      linkLabels: {
        roster: `${en.councilName}: member roster`,
        factions: `${en.councilName}: parliamentary groups`,
        committees: `${en.councilName}: committee roster`,
        minutes: `${en.councilName}: minutes search`,
      },
      questionsHeading: "Sources for question summaries",
      questionsBody: `The question titles and summaries were written by AI from the minutes of the ${qs.en.scope}, as published in the ${en.councilName} minutes search (written ${qs.en.asOf}). ${qs.en.earlierSessionsRule} The summaries do not include the answers. The topic tags were also assigned by AI. Check the minutes for the exact wording.`,
      disclaimerHeading: "Disclaimer",
      disclaimerBody: `This is not an official ${en.councilName} site. Parliamentary groups and committees can change during the year. For accurate information, please check the official pages.`,
      faq: "FAQ",
    },
    billDetail: {
      backToSession: { before: "Bills: ", after: "" },
      officialPage: "Official council page",
      summaryHeading: "Plain summary",
      summaryNote:
        "This summary was written by AI. Check the original text for the exact wording.",
      reviewInProgress:
        "This article includes an AI-generated draft. We are still checking it against the official documents, so the content may change.",
      reviewCompleteTooltip: [
        "This article has been checked against",
        "the official documents and reviewed.",
      ],
      timeline: {
        heading: "How this bill has progressed",
        events: {
          submitted: "Bill submitted",
          in_committee: "Committee review",
          plenary_session: "Plenary vote",
        },
        dateLabels: {
          notRecorded: "Date not recorded",
          undecided: "Date not set",
          omitted: "Skipped",
        },
        committeeOmitted:
          "Referral to committee was skipped, and the bill was voted on at the plenary session.",
        decisionSeparator: " / ",
      },
      originalText: "Original bill text",
      sourcesHeading: "Official council pages",
      sourceLinks: {
        labels: {
          fullText: "Full text of the bill (PDF)",
          overview: "Summary of submitted bills (PDF)",
          submissions: "List of submitted bills",
          decisions: "Voting results",
        },
        separator: " / ",
        pdfSuffix: " (PDF)",
      },
      chat: {
        heading: "Ask about this bill",
        body: "AI answers based on this bill's materials. Its answers can be wrong.",
        button: "Ask a question",
        window: {
          title: "Ask about this bill",
          notice:
            "AI answers based on this bill's materials. Its answers can be wrong.",
          initialHeading: "Ask the AI anything you wonder about this bill.",
          initialSub: "You can also select text on the page to ask about it.",
          sampleQuestions: [
            "What are the key points of this bill?",
            "How does this bill affect me?",
            "Does my household qualify?",
          ],
          thinking: "Thinking...",
          placeholder: "Ask the AI what you don't understand",
          sendAriaLabel: "Send",
          closeAriaLabel: "Close dialog",
          languageSelectorLabel: "Chat language",
          hint: "AI answers can be wrong. Please double-check important information.",
          disclaimer: `For official procedures and eligibility, please check with the ${en.cityName} office.`,
          sourceLabel: "Source",
          askAboutSelection: (selectedText) =>
            `Please tell me about "${selectedText}".`,
        },
        errors: {
          dailyLimit:
            "You have reached today's usage limit. Please try again after midnight (Japan time).",
          monthlyLimit:
            "The monthly usage limit has been reached. Please try again from the 1st of next month.",
          billContextRequired:
            "No bill was specified. Please ask from a bill's page.",
          billNotPublished: "This bill is not currently published.",
          billContentUnavailable:
            "We could not load the bill information. Please try again in a little while.",
          costCheckFailed:
            "The service is temporarily unavailable. Please try again in a little while.",
          maintenance:
            "The AI chat is under maintenance. Please try again in a little while.",
          general: "Something went wrong. Please try again in a little while.",
          offTopic:
            "This chat answers questions about this bill. Please ask about what the bill says, how it affects residents, or the procedures involved.",
          sourceUnavailable:
            "I could not confirm that from the provided bill materials. Please contact the city office for official information.",
        },
        interviewSuggestion: {
          audience: "For people affected by this bill",
          heading: (billName) => `Share your views on ${billName}`,
          duration: "Takes about 5 minutes or more",
          depth: "AI asks follow-up questions about your views",
          policyUse: "Your input will inform policy discussions",
          cta: "Start the AI interview",
        },
      },
      participationLabel: "Take part and share",
      share: {
        share: "Share this article",
        report: "Report a problem",
        modalTitle: "Share this article",
        modalSubtitle: "Share it and help open up council debates",
        nativeShare: "Share",
        thumbnailAlt: "Article thumbnail",
        close: "Close",
      },
    },
  },
};

export function getUiMessages(locale: PublicLocale): UiMessages {
  return UI_MESSAGES[locale] ?? UI_MESSAGES.ja;
}

/**
 * 一覧カードの議決ステータス（packages/shared の getBillCardStatusLabel が返す
 * 日本語ラベル）の英語表記。公式の議決用語ごとに区別を保つ。
 */
const EN_CARD_STATUS_LABELS: Record<string, string> = {
  可決: "Passed",
  修正可決: "Passed with amendments",
  否決: "Rejected",
  承認: "Approved",
  不承認: "Not approved",
  同意: "Consented",
  不同意: "Not consented",
  認定: "Certified",
  不認定: "Not certified",
  採択: "Adopted",
  趣旨採択: "Adopted in principle",
  不採択: "Not adopted",
  議会審議中: "Under deliberation",
  専決処分報告: "Mayor's decision reported",
  議案上程前: "Not yet submitted",
};

/** 日本語のステータスラベルを表示言語に合わせる。英語が無ければ日本語のまま返す */
export function localizeCardStatusLabel(
  label: string,
  locale: PublicLocale
): string {
  if (locale === "ja") {
    return label;
  }
  return EN_CARD_STATUS_LABELS[label] ?? label;
}
