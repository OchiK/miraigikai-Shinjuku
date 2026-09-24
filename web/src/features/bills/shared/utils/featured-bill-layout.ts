export type FeaturedBillCardLayout = {
  /** 先頭の議案を主役として大きく見せるか */
  isLead: boolean;
  /** md 以上の2カラムグリッドで行全体を占めるか */
  spansFullRow: boolean;
};

/**
 * 「注目の議案」グリッドでの各カードの配置を決める
 * - 1件: 主役カードを全幅で表示
 * - 2件: 2カラムで均等に並べる
 * - 3件以上: 先頭を全幅の主役カードにし、残りを2カラムで並べる。
 *   残りが奇数件のときは最後の1件を全幅にして空きセルを作らない
 */
export function getFeaturedBillLayout(
  index: number,
  total: number
): FeaturedBillCardLayout {
  if (total === 2) {
    return { isLead: false, spansFullRow: false };
  }
  if (index === 0) {
    return { isLead: true, spansFullRow: true };
  }
  const restCount = total - 1;
  const isLastOfOddRest = restCount % 2 === 1 && index === total - 1;
  return { isLead: false, spansFullRow: isLastOfOddRest };
}
