/** Canonical reference terms for the R8-3 checks; these are not official English names. */
export const TRANSLATION_HEADINGS = {
  何にお金を使うのか: "What the money is for",
  どこからお金を出すのか: "Where the money comes from",
  債務負担行為の変更: "Changes to debt-burden commitments",
  "債務負担行為の追加・変更":
    "Additions and changes to debt-burden commitments",
  この議案のゆくえ: "What happened to this bill",
  この案件のゆくえ: "What happened to this item",
  分からないこと: "What the materials do not say",
  決算の全体: "The settlement as a whole",
  "主な歳入（収入済額）": "Main revenue (amounts received)",
  "主な歳出（支出済額）": "Main expenditure (amounts paid out)",
  主な歳入と歳出: "Main revenue and expenditure",
  "決算書・実績報告": "Settlement documents and performance reports",
  国民健康保険料: "National Health Insurance premiums",
  第65号議案との関係: "Relationship to Bill No. 65",
  第66号議案との関係: "Relationship to Bill No. 66",
  何が変わるのか: "What changes",
  いつから: "When it takes effect",
  なぜ改正するのか: "Why it is being amended",
  いくらになるのか: "What the amounts become",
  いつから適用されるのか: "When the changes apply",
  ESCO事業とは: "What an ESCO project is",
  契約の内容: "Contract details",
  お金の出どころ: "Where the money comes from",
  同じ定例会の関連議案: "Related bills in the same session",
  工事の内容: "What the construction covers",
  何を買うのか: "What is being purchased",
  何を放棄するのか: "What is being waived",
  事故の概要: "What happened in the accident",
  損害賠償額: "Amount of damages",
  訴訟の当事者: "Parties to the lawsuit",
  "事件の経過（議案本文による）": "Course of events (according to the bill)",
  区が求めること: "What the city is asking for",
} as const;

export const TRANSLATION_PARLIAMENTARY_GROUPS = {
  "自民・参政クラブ": "LDP and Sanseito Club",
  新宿区議会公明党: "Komeito, Shinjuku City Council",
  日本共産党新宿区議会議員団:
    "Japanese Communist Party Group, Shinjuku City Council",
  新宿未来の会: "Shinjuku Mirai no Kai",
  "立憲民主党・無所属クラブ":
    "Constitutional Democratic Party and Independents Club",
  "日本維新の会・新宿区議団":
    "Japan Innovation Party, Shinjuku City Council Group",
  "現役世代に優しい新宿・減税の会":
    "Shinjuku for the Working Generation, Tax Cut Group",
  アップデート新宿: "Update Shinjuku",
  "いのちの党 新宿": "Inochi no To Shinjuku",
} as const;

export const TRANSLATION_RESULTS = {
  原案可決: "passed as originally proposed (原案可決)",
  認定: "certified (認定)",
} as const;

/** Document titles and reference labels, not quotations of document wording. */
export const TRANSLATION_QUOTATION_EXEMPTIONS = [
  "Bill Summaries and Deliberation Results",
  "Detailed",
] as const;
