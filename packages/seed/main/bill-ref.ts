/**
 * 投入済み議案への参照。
 *
 * seed 内の関連付け（bill_contents / bills_tags / faction_stances など）は
 * 必ず slug（安定識別子）で突合する。
 * 件名は「専決処分の承認について」のように複数案件で重複しうるため、
 * 件名や配列インデックスを突合キーに使ってはならない。
 */
export interface SeededBillRef {
  id: string;
  name: string;
  slug: string | null;
}

/** slug で議案を検索する。見つからなければ null。 */
export function findBillBySlug(
  bills: SeededBillRef[],
  slug: string
): SeededBillRef | null {
  const matched = bills.filter((b) => b.slug === slug);

  if (matched.length > 1) {
    throw new Error(
      `Ambiguous bill slug: ${slug} matched ${matched.length} bills`
    );
  }

  return matched[0] ?? null;
}

/** slug で議案を検索し、見つからなければ例外を投げる。 */
export function requireBillBySlug(
  bills: SeededBillRef[],
  slug: string
): SeededBillRef {
  const bill = findBillBySlug(bills, slug);
  if (!bill) {
    throw new Error(`Bill not found for slug: ${slug}`);
  }
  return bill;
}
