// Overlay example based on mirai-gikai-kawasaki.
// Reconcile against the actual current site.config.ts before replacing it.

export const siteConfig = {
  siteName: "みらい議会＠新宿区",
  siteDescription:
    "新宿区議会でどのような議案が検討されているかを、公式資料をもとにわかりやすく伝える非公式サイトです",
  cityName: "新宿区",
  councilName: "新宿区議会",
  keywords: [
    "みらい議会＠新宿区",
    "新宿区",
    "新宿区議会",
    "議案",
    "やさしい日本語",
    "多言語",
  ],
  councilBaseUrl: "https://www.city.shinjuku.lg.jp/",
  councilBillsDetailUrl:
    // 新宿区は会期ごとにURLが分かれるため、まず現在のlive targetを設定。
    // 後で「会期一覧/最新会期」を解決するadapterへ置き換える。
    "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html",
  twitterHashtag: "みらい議会新宿区",

  externalLinks: {
    report: "",       // 自分のフォーム等
    aboutNote: "",
    donation: "",     // 独立サイトでは党の寄付CTAを出さない
    teamAbout: "",
    terms: "",        // 自前ページへ差し替え
    privacy: "",      // 自前ページへ差し替え
    faq: "",
  },

  managingParty: "" as string,

  operator: {
    name: "<YOUR_NAME_OR_HANDLE>" as string,
    contactUrl: "<YOUR_CONTACT_URL>" as string,
    jurisdiction: "東京地方裁判所" as string,
  },

  features: {
    aiChat: true,
    aiInterview: false,
    showTeamMiraiSection: false as boolean,
  },
} as const;
