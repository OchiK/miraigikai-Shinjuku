/**
 * 議員名簿の出典。seed（packages/seed/main/shinjuku-council-members.ts）と
 * 同じ公式ページ・同じ更新日を指す。名簿を更新したらここも更新する。
 */
export const COUNCILOR_SOURCES = {
  asOf: "2026年8月7日",
  /** X（旧Twitter）アカウントの掲載基準と、本人のものと確認した日 */
  xAccounts: {
    rule: "本人のウェブサイトからのリンク、またはプロフィールの「新宿区議会議員」の記載で本人のものと確認したアカウント",
    asOf: "2026年9月26日",
  },
  roster: {
    label: "議員名簿",
    url: "https://www.city.shinjuku.lg.jp/kusei/gikai01_000112.html",
  },
  factions: {
    label: "会派構成",
    url: "https://www.city.shinjuku.lg.jp/kusei/file08_00003.html",
  },
  committees: {
    label: "委員会名簿",
    url: "https://www.city.shinjuku.lg.jp/kusei/file08_01_00013.html",
  },
  /** 英語表示用。上の日付・基準を変えたらここも合わせる */
  en: {
    asOf: "August 7, 2026",
    xAccountsRule:
      "accounts we confirmed as the councilor's own, either through a link from their website or a profile that names them as a Shinjuku City Council member",
    xAccountsAsOf: "September 26, 2026",
  },
} as const;

/**
 * 質問要約の出典と掲載範囲。seed（packages/seed/main/shinjuku-council-questions.ts）と
 * 同じ範囲を指す。掲載範囲を広げたらここも更新する。
 */
export const QUESTION_SOURCES = {
  /** 要約を作成した日 */
  asOf: "2026年9月25日",
  scope: "令和8年第1回・第2回定例会の本会議（代表質問・一般質問）",
  /** scope の会期部分だけ。注記の文中で使う */
  scopeSessionsLabel: "令和8年第1回・第2回定例会",
  /** 主な掲載範囲の初日（令和8年第1回定例会の開会日）。これより前の質問は「以前の定例会」 */
  scopeStartDate: "2026-02-17",
  /** 主な掲載範囲に質問がない議員の扱い */
  earlierSessionsRule:
    "この期間に代表質問・一般質問がなかった議員は、それ以前で最も新しい定例会の質問を掲載しています。",
  minutes: {
    label: "会議録検索システム",
    url: "https://ssp.kaigiroku.net/tenant/shinjuku/",
  },
  /** 英語表示用。上の掲載範囲・日付を変えたらここも合わせる */
  en: {
    asOf: "September 25, 2026",
    scope:
      "plenary sessions (representative and general questions) of the 1st and 2nd regular sessions of 2026",
    scopeSessionsLabel: "the 1st and 2nd regular sessions of 2026",
    earlierSessionsRule:
      "For councilors who asked no representative or general questions in this period, we show their questions from the most recent earlier session.",
  },
} as const;

/** 区議会の議員定数 */
export const COUNCIL_SEATS = 38;
