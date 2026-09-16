/**
 * サイト設定ファイル
 * みらい議会＠新宿区（非公式・市民向け情報サイト）
 */
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
  /** 議案・議決結果の一覧ページ（定例会提出議案） */
  councilBillsDetailUrl:
    "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html",
  twitterHashtag: "みらい議会新宿区", // # なし
  externalLinks: {
    report: "https://github.com/OchiK/miraigikai-Shinjuku/issues/new",
    aboutNote: "",
    donation: "",
    teamAbout: "",
    terms: "",
    privacy: "",
    faq: "",
  },
  /**
   * ページを管理する政党名（空文字列の場合は政党名を省略した汎用表現を使用）
   */
  managingParty: "" as string,
  /**
   * サービス運営者情報
   * 利用規約や問い合わせ先に使用します。
   */
  operator: {
    name: "OchiK" as string,
    contactUrl: "https://github.com/OchiK/miraigikai-Shinjuku" as string,
    /** 利用規約の準拠法・管轄裁判所（第一審の専属的合意管轄） */
    jurisdiction: "東京地方裁判所" as string,
  },
  /**
   * AI機能の有効/無効設定
   * 本番環境のコスト管理のため、機能ごとにオン/オフを切り替えられます。
   */
  features: {
    /** AIチャット機能（議案への質問・テキスト選択からの質問）*/
    aiChat: true,
    /** AIインタビュー機能（議案当事者へのヒアリング）*/
    aiInterview: false,
    /**
     * チームみらいセクションの表示（トップページ・フッター・デスクトップメニュー）
     * 非公式運営など、党の公式サービスとして出さない場合は false にする。
     */
    showTeamMiraiSection: false as boolean,
  },
} as const;
