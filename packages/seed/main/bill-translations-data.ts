import { type SeededBillRef, requireBillBySlug } from "./bill-ref";
import { shoninKey } from "./shinjuku-r8-2-inventory";

/**
 * 議案コンテンツの翻訳（多言語基盤の動作確認用）。
 *
 * 翻訳元は bill-contents-data.ts の同じ議案・同じ難易度の日本語で、
 * source_hash はその日本語から計算した値を固定している。日本語を直すと
 * bill-translations-data.test.ts が失敗するので、翻訳も直してから
 * ハッシュを更新すること（ハッシュだけ書き換えてはならない）。
 *
 * status は generated（人の確認前）に固定する。公開画面は reviewed しか
 * 出さないため、このシードの翻訳はそのままでは表示されない。
 * 確認の手順は docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md を参照。
 *
 * このデータは本番インポーター（packages/seed/production）の対象外。
 */
type BillTranslationSeed = {
  bill_slug: string;
  difficulty_level: "easy" | "normal" | "hard";
  locale: "en" | "zh-Hans" | "ko" | "ne" | "my" | "vi";
  status: "generated";
  model: string;
  prompt_version: string;
  source_hash: string;
  title: string;
  summary: string;
  content: string;
};

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
