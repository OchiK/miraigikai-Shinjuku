import type { PublicLocale } from "@mirai-gikai/shared/i18n/locales";
import { siteConfig } from "@/config/site.config";
import {
  DIFFICULTY_LABELS,
  type DifficultyLevelEnum,
} from "@/features/bill-difficulty/shared/types";
import {
  STANCE_LABELS,
  type StanceTypeEnum,
} from "@/features/bills/shared/types";

/**
 * サイト全体の UI 文言（docs/BACKLOG.md P8-12）。
 *
 * docs/I18N_AND_EASY_JAPANESE.md「UI翻訳と議案翻訳を分ける」に従い、UI 文言は
 * ここで管理する。議案本文・議案名・タグ名・会期名は DB のまま（日本語）出す。
 * 英語側はネイティブ話者の確認前のため、日本語側を正とする。
 */
export type UiMessages = {
  nav: {
    bills: string;
    councilors: string;
    primaryNavLabel: string;
    secondaryNavLabel: string;
    currentSessionPrefix: string;
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
    sessionBillsHeading: (year: number, sessionName: string) => string;
    billCount: (count: number) => string;
    sessionPeriod: (params: {
      year: number;
      startMonth: number;
      endMonth: number;
      sessionName: string;
    }) => string;
    readMore: string;
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
    stanceLabels: Record<StanceTypeEnum, string>;
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
    /**
     * 採決後に会派名が変わったときに添える、採決時の会派名の前後の文言。
     * 会派名は日本語のまま lang="ja" で挟むため、文言と分けて持つ
     */
    nameAtVote: { before: string; after: string };
    councilorsOf: (factionName: string) => string;
    source: string;
    opensInNewTab: string;
  };
  billCouncilors: {
    heading: string;
    /** 議員の質問が日本語のままであることの案内。日本語表示では出さない */
    questionsInJapaneseNotice: string | null;
    body: string;
    councilorsLink: string;
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

const en = siteConfig.english;

export const UI_MESSAGES: Record<PublicLocale, UiMessages> = {
  ja: {
    nav: {
      bills: "議案一覧",
      councilors: "議員一覧",
      primaryNavLabel: "主要ナビゲーション",
      secondaryNavLabel: "補助ナビゲーション",
      currentSessionPrefix: "現在の会期：",
      home: "トップへ",
      returnToHome: "トップページへ戻る",
      openMenu: "メニューを開く",
      sessionBills: (sessionName) => `${sessionName}の議案一覧`,
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
      sessionBillsHeading: (year, sessionName) =>
        `${year}年 ${sessionName}の議案`,
      billCount: (count) => `${count}件`,
      sessionPeriod: ({ year, startMonth, endMonth, sessionName }) =>
        `${year}.${startMonth}月〜${endMonth}月に実施された${sessionName}`,
      readMore: "もっと読む",
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
      stanceLabels: STANCE_LABELS,
      otherLabel: "その他",
      factionCount: (count) => `${count}会派`,
      unanimousFor: (count) => `全会派が賛成（${count}会派）`,
      unanimousAgainst: (count) => `全会派が反対（${count}会派）`,
      minorityNames: { before: "（", after: "）", separator: "、" },
      nameAtVote: { before: "（採決時：", after: "）" },
      councilorsOf: (factionName) => `${factionName}の所属議員を見る`,
      source: "出典：",
      opensInNewTab: "（新しいタブで開きます）",
    },
    billCouncilors: {
      heading: "この議案と議員",
      questionsInJapaneseNotice: null,
      body: "議案は区議会の本会議で採決されます。どの会派にどの議員がいるかは、議員一覧で確認できます。",
      councilorsLink: "議員一覧を見る",
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
  },
  en: {
    nav: {
      bills: "Bills",
      councilors: "Councilors",
      primaryNavLabel: "Main navigation",
      secondaryNavLabel: "Secondary navigation",
      currentSessionPrefix: "Current session: ",
      home: "Home",
      returnToHome: "Back to the home page",
      openMenu: "Open menu",
      sessionBills: (sessionName) => `Bills: ${sessionName}`,
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
      sessionBillsHeading: (year, sessionName) =>
        `Bills from ${sessionName} (${year})`,
      billCount: (count) => (count === 1 ? "1 bill" : `${count} bills`),
      sessionPeriod: ({ year, startMonth, endMonth, sessionName }) =>
        startMonth === endMonth
          ? `${sessionName}, held in ${EN_MONTHS[startMonth - 1]} ${year}`
          : `${sessionName}, held ${EN_MONTHS[startMonth - 1]}–${EN_MONTHS[endMonth - 1]} ${year}`,
      readMore: "Read more",
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
        neutral: "Neutral",
        conditional_for: "For, with conditions",
        conditional_against: "Against, with conditions",
        considering: "Undecided",
        continued_deliberation: "Carried over",
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
      nameAtVote: { before: "(called ", after: " at the time of the vote)" },
      councilorsOf: (factionName) => `See councilors in ${factionName}`,
      source: "Source: ",
      opensInNewTab: "(opens in a new tab)",
    },
    billCouncilors: {
      heading: "Councilors and this bill",
      questionsInJapaneseNotice:
        "Councilors' questions about this bill are shown in Japanese.",
      body: "Bills are put to a vote at a plenary session of the council. The list of councilors shows which councilors belong to each parliamentary group.",
      councilorsLink: "See the list of councilors",
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
