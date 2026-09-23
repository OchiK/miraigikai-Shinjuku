import { type SeededBillRef, requireBillBySlug } from "./bill-ref";
import { gianKey, shoninKey } from "./shinjuku-r8-2-inventory";

/**
 * 議案コンテンツの翻訳（多言語基盤の動作確認用）。
 *
 * 翻訳元は bill-contents-data.ts の同じ議案・同じ難易度の日本語で、
 * source_hash はその日本語から計算した値を固定している。日本語を直すと
 * bill-translations-data.test.ts が失敗するので、翻訳も直してから
 * ハッシュを更新すること（ハッシュだけ書き換えてはならない）。
 *
 * 人の確認が終わるまでは status を generated にする。reviewed へ移すときは
 * reviewed_at と reviewed_by も必ず設定する。公開画面は reviewed しか出さない。
 * 確認の手順は docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md を参照。
 *
 * このデータは本番インポーター（packages/seed/production）の対象外。
 */
type BillTranslationSeed = {
  bill_slug: string;
  difficulty_level: "easy" | "normal" | "hard";
  locale: "en" | "zh-Hans" | "ko" | "ne" | "my" | "vi";
  model: string;
  prompt_version: string;
  source_hash: string;
  title: string;
  summary: string;
  content: string;
} & (
  | {
      status: "generated";
      reviewed_at?: never;
      reviewed_by?: never;
    }
  | {
      status: "reviewed";
      reviewed_at: string;
      reviewed_by: string;
    }
);

export const billTranslationsWithBillSlug: BillTranslationSeed[] = [
  // =========================================================================
  // 承認第2号 専決処分の承認について（新宿区特別区税条例の一部を改正する条例）
  // =========================================================================
  {
    bill_slug: shoninKey(2),
    difficulty_level: "normal",
    locale: "en",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-23",
    source_hash:
      "v1:cf454d4071aa261fa81a71908467471118e3cf79957552f673d830a80d4b197a",
    title:
      "Approval of the Mayor's emergency amendment to the Ward Tax Ordinance (light vehicle tax, housing loan deduction, etc.)",
    summary:
      "Because an amendment to the Local Tax Act was promulgated on March 31, 2026 (Reiwa 8) and took effect the next day, the Mayor amended the Ward Tax Ordinance without convening the Ward Assembly (専決処分). This item reports that action to the Ward Assembly and asks for its approval. The changes include abolishing the environmental performance levy on light vehicles and renaming the tax, and extending the housing loan deduction by five years. It was approved at the 2nd Regular Session of 2026 (Reiwa 8).",
    content: `# Approval of the Mayor's emergency amendment to the Ward Tax Ordinance (light vehicle tax, housing loan deduction, etc.)

## What "approval of a 専決処分" means

Amending a ward ordinance normally requires a vote of the Ward Assembly. However, Article 179, Paragraph 1 of the Local Autonomy Act (地方自治法, 昭和22年法律第67号) allows the Mayor to take action in place of the Assembly when the Mayor finds that the matter is especially urgent and it is clear that there is no time to convene the Assembly. This is called a 専決処分 (senketsu shobun).

When the Mayor has taken such an action, Paragraph 3 of the same Article requires the Mayor to report it to the next Assembly meeting and ask for approval. This item is that report and request for approval. That is why it is numbered "Approval No. 2" (承認第2号) rather than as a bill, and why its result is recorded as "approved" (承認) rather than "passed" (可決).

## When and why the Mayor acted

| Item | Details |
|------|------|
| Matter to be decided | Partial amendment of the Shinjuku Special Ward Tax Ordinance (新宿区特別区税条例, 昭和39年新宿区条例第57号) |
| Date of action | March 31, 2026 (Reiwa 8) |
| Public notice | Shinjuku Ward Public Notice No. 202 (新宿区告示第202号) |
| Reason | The Act Partially Amending the Local Tax Act, etc. (地方税法等の一部を改正する法律, 令和8年法律第2号) was promulgated on March 31, 2026 and takes effect on April 1 of the same year. The ward tax ordinance had to be amended and put into effect urgently in response, and it was clear that there was no time to convene the Ward Assembly. |

The explanation is that the national law was promulgated on March 31 and took effect the next day, April 1, so the ward ordinance also had to be in place by April 1, and there was no time to hold an Assembly meeting in between.

## What was amended

The ward's summary of submitted items lists four main changes.

### 1. Abolishing the environmental performance levy on light vehicles and renaming the tax

The environmental performance levy (環境性能割) of the light vehicle tax is abolished, and the current "annual levy by vehicle type" (種別割) is renamed "light vehicle tax" (軽自動車税). Until now, the light vehicle tax had two parts: the environmental performance levy and the annual levy by vehicle type. With the environmental performance levy gone, the name goes back to "light vehicle tax."

### 2. Review of the green special provision (reduced rates) for the light vehicle tax

The green special provision reduces the light vehicle tax rate for the fiscal year after the year in which the vehicle was acquired. Within it, the special provision for a 75% reduction is extended by two years, through fiscal 2028 (Reiwa 10).

### 3. Extending the housing loan deduction in the ward resident tax

The period covered by the ward resident tax housing loan deduction (住宅借入金等特別税額控除) is extended by five years, to include people who start living in the home by December 31, 2030 (Reiwa 12).

### 4. Review of the special tax provision for transferring land to develop quality residential land, etc.

- The deadline for applying the special provision is extended by three years, through fiscal 2029 (Reiwa 11).
- If, at the time of transfer, the transferred land is located in a landslide prevention area (地すべり防止区域), a steep slope collapse hazard area (急傾斜地崩壊危険区域), a special sediment disaster warning area (土砂災害特別警戒区域), or a flood damage prevention area (浸水被害防止区域), the special provision cannot be applied.

## When the changes apply

In principle, the changes apply from April 1, 2026, but some parts start later.

| Item | Effective date |
|------|------|
| General rule | April 1, 2026 (Reiwa 8) |
| Item 3 above (housing loan deduction extension) | January 1, 2027 (Reiwa 9) |
| The part of item 4 that excludes land in disaster hazard areas from the special provision | January 1, 2028 (Reiwa 10) |

For the light vehicle tax, the amended rules apply to fiscal 2026 and later. The annual levy by vehicle type for fiscal 2025 and earlier follows the previous rules. The environmental performance levy on light vehicles with three or more wheels acquired before the ordinance took effect also follows the previous rules.

## What happened to this item

It was approved at the 2nd Regular Session of 2026 (Reiwa 8) (session period: June 10 to June 19).`,
  },

  // =========================================================================
  // 第42号議案 令和8年度新宿区一般会計補正予算（第2号）
  // =========================================================================
  {
    bill_slug: gianKey(42),
    difficulty_level: "normal",
    locale: "en",
    status: "generated",
    model: "claude-opus-5-5",
    prompt_version: "manual-2026-09-23",
    source_hash:
      "v1:50bae16937cb286f0067304c2100f22f5612bcde839282c49c929e96eafb891b",
    title:
      "More money for shopping-street vouchers and road work (General Account Supplementary Budget No. 2)",
    summary:
      "This supplementary budget adds ¥292,564,000 to the General Account. It covers a subsidy that raises the premium rate of the Shopping Street Happy Vouchers from 20% to 30%, equipment work at the Tsunohazu Community Center, and increased funding for road improvement and public sewer work on Phase I of Edogawabashi-dori.",
    content: `# More money for shopping-street vouchers and road work (General Account Supplementary Budget No. 2)

This is a supplementary budget for the fiscal 2026 (Reiwa 8) General Account, submitted by the Mayor on June 10, 2026. It adds 292,564 thousand yen (about ¥292.56 million) to both revenue and expenditure, bringing the General Account total to 189,293,341 thousand yen (about ¥189.29 billion).

## What the money is for

### Expanding the Shopping Street Happy Vouchers (160,224 thousand yen)

This is a subsidy to the Shinjuku Federation of Shopping Street Associations (新宿区商店会連合会). The ward's summary document gives the reason for the expansion as follows (our translation): "to revitalize shopping streets and support residents' daily lives, in light of the prolonged rise in prices and the effects of the situation in the Middle East."

| Item | Details |
|------|------|
| Premium rate | 20% → 30% (¥13,000 worth of paper vouchers for ¥10,000) |
| Common vouchers (usable at all stores) | ¥4,500 worth → ¥5,000 worth |
| Support vouchers (usable at stores run by small and medium-sized enterprises with a floor area under 1,000 square meters) | ¥7,500 worth → ¥8,000 worth |
| Participating stores | Stores that belong to a shopping street association and to the Shinjuku Federation of Shopping Street Associations |
| Number of books issued | 150,000 |
| Where to buy | All post offices in the ward |
| Application period | July 1 to July 27 |
| Sales period | September 16 to October 16 |
| Period of use | October 1 to January 8 |

### Equipment work at the Tsunohazu Community Center (角筈地域センター) (9,284 thousand yen)

This increases the construction cost because of revisions to labor unit prices and other factors.

### Road and sewer work on Phase I of Edogawabashi-dori (江戸川橋通り第Ⅰ期) (123,056 thousand yen)

Both are increases in construction costs due to changes in the development plan.

- Road improvement (construction costs): 108,816 thousand yen
- Public sewer development (construction costs): 14,240 thousand yen

## Where the money comes from

| Revenue category | Amount added | Breakdown |
|------|--------|------|
| Transfers from funds (繰入金) | 61,985 thousand yen | Fiscal Adjustment Fund 47,885 thousand yen / Social Capital Development Fund 14,100 thousand yen |
| Miscellaneous revenue (諸収入) | 126,579 thousand yen | Revenue from commissioned work (public sewer development costs) 14,240 thousand yen / Penalties and late-payment interest 32,235 thousand yen / Other income (雑入; equivalent to the refund of road improvement costs for Phase I of Edogawabashi-dori) 80,104 thousand yen |
| Special ward bonds (特別区債) | 104,000 thousand yen | Regional development bonds 7,000 thousand yen / Civil engineering bonds 97,000 thousand yen |

This budget draws 47,885 thousand yen from the Fiscal Adjustment Fund (財政調整基金). The fund's projected balance at the end of fiscal 2026 is 26,179,670 thousand yen (about ¥26.18 billion).

The overall limit on special ward bonds changes from 2,443,000 thousand yen to 2,547,000 thousand yen.

## What happened to this bill

It was passed as originally proposed (原案可決) at the 2nd Regular Session of 2026 (Reiwa 8) (session period: June 10 to June 19).`,
  },
];

export function createBillContentTranslations(
  insertedBills: SeededBillRef[],
  insertedContents: Array<{
    id: string;
    bill_id: string;
    difficulty_level: string;
  }>
) {
  return billTranslationsWithBillSlug.map(
    ({ bill_slug, difficulty_level, ...translation }) => {
      const bill = requireBillBySlug(insertedBills, bill_slug);
      const content = insertedContents.find(
        (c) => c.bill_id === bill.id && c.difficulty_level === difficulty_level
      );
      if (!content) {
        throw new Error(
          `bill_contents not found for translation: ${bill_slug} / ${difficulty_level}`
        );
      }
      return { bill_content_id: content.id, ...translation };
    }
  );
}
