import type { BillWithContent } from "../types";

const MAX_DISPLAY_COUNT = 3;

export type BillDisplayResult = {
  /** 表示する議案 */
  displayBills: BillWithContent[];
  /** 「その他議案」リンクを表示するか（タグの議案が4件以上の場合） */
  showMoreLink: boolean;
};

/**
 * タグ別セクションに表示する議案を選択する
 *
 * ロジック:
 * - 件数にかかわらず、注目の議案で既に掲載済みのものを除外する
 * - 除外後3件以下: 全て掲載。元のタグの議案が4件以上なら「その他議案」リンクあり
 *   （除外後0件のときはリンクなし。呼び出し側でセクションごと非表示にする）
 * - 除外後4件以上: 以下の優先度で3件選択し、「その他議案」リンクあり
 *   1. 画像付きの議案を優先
 *   2. 画像付きが3件以上あればそこからランダム
 *   3. 3件に満たなければ残りからランダムで補充
 *
 * @param bills - そのタグに紐づく全議案
 * @param featuredBillIds - 注目の議案セクションで掲載済みの議案ID
 * @param randomFn - ランダム関数（テスト用にDI可能）
 */
export function selectBillsForDisplay(
  bills: BillWithContent[],
  featuredBillIds: Set<string>,
  randomFn: () => number = Math.random
): BillDisplayResult {
  // 注目の議案で掲載済みのものを除外（タグの議案数にかかわらず）
  const candidates = bills.filter((bill) => !featuredBillIds.has(bill.id));
  const tagHasMoreThanMax = bills.length > MAX_DISPLAY_COUNT;

  // 除外後に3件以下になった場合
  if (candidates.length <= MAX_DISPLAY_COUNT) {
    return {
      displayBills: candidates,
      showMoreLink: tagHasMoreThanMax && candidates.length > 0,
    };
  }

  // 画像あり/なしで分ける
  const withImage = candidates.filter((bill) => bill.thumbnail_url);
  const withoutImage = candidates.filter((bill) => !bill.thumbnail_url);

  let selected: BillWithContent[];

  if (withImage.length >= MAX_DISPLAY_COUNT) {
    // 画像付きだけで3件以上あればそこからランダム
    selected = pickRandom(withImage, MAX_DISPLAY_COUNT, randomFn);
  } else {
    // 画像付きを全て採用し、残りを画像なしから補充
    const remaining = MAX_DISPLAY_COUNT - withImage.length;
    selected = [...withImage, ...pickRandom(withoutImage, remaining, randomFn)];
  }

  return { displayBills: selected, showMoreLink: true };
}

/** 配列からランダムにcount件を選択する */
function pickRandom<T>(items: T[], count: number, randomFn: () => number): T[] {
  const shuffled = [...items].sort(() => randomFn() - 0.5);
  return shuffled.slice(0, count);
}
