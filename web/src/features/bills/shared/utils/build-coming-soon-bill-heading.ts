import type { ComingSoonBill } from "../types";

/**
 * 「これから掲載される議案」カードの見出しを組み立てる純粋関数。
 *
 * 解説がまだ無い議案は件名だけで表示されるが、件名は一意とは限らない。
 * 承認第2号・第3号はいずれも「専決処分の承認について」で完全に一致するため、
 * 公式の識別名を併記しないと利用者が区別できない。
 */

export interface ComingSoonBillHeading {
  /** 公式の識別名（例:「第42号議案」）。無い場合は null */
  identifier: string | null;
  /** 主見出し。解説のタイトルがあればそれ、無ければ正式名称 */
  title: string;
  /** 主見出しが解説のタイトルのときだけ併記する正式名称 */
  officialName: string | null;
}

type ComingSoonBillHeadingInput = Pick<
  ComingSoonBill,
  "name" | "bill_number" | "title"
>;

export function buildComingSoonBillHeading(
  bill: ComingSoonBillHeadingInput
): ComingSoonBillHeading {
  const identifier = bill.bill_number?.trim() || null;
  const title = bill.title?.trim() || bill.name;
  const officialName = title !== bill.name ? bill.name : null;

  return { identifier, title, officialName };
}
