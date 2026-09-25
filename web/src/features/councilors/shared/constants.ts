/**
 * 議員名簿の出典。seed（packages/seed/main/shinjuku-council-members.ts）と
 * 同じ公式ページ・同じ更新日を指す。名簿を更新したらここも更新する。
 */
export const COUNCILOR_SOURCES = {
  asOf: "2026年8月7日",
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
} as const;

/** 区議会の議員定数 */
export const COUNCIL_SEATS = 38;
