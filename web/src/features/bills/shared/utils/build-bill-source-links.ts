/**
 * 議案に紐づく出典リンクを表示順に組み立てる純粋関数。
 *
 * DBに出典URLを保持していても画面に出さなければ出典を辿れないため、
 * 議案詳細ページで一次資料へのリンクを列挙するために使う。
 */

export interface BillSourceLinkInput {
  /** 議案の全文PDF */
  pdf_url: string | null;
  /** 当該議案を収録した提出案件概要PDF */
  overview_pdf_url: string | null;
  /** 提出議案一覧ページ */
  source_page_url: string | null;
  /** 議決結果ページ */
  decision_source_url: string | null;
}

export interface BillSourceLink {
  /** リンクの種別（テストと表示キーに使う） */
  kind: "fullText" | "overview" | "submissions" | "decisions";
  label: string;
  url: string;
}

/** リンクの表示名と、同じURLのラベルをまとめるときの区切り。UI 文言として言語ごとに持つ */
export interface BillSourceLinkFormat {
  labels: Record<BillSourceLink["kind"], string>;
  separator: string;
  /** PDF を指すラベルの末尾。まとめるときに1つにする */
  pdfSuffix: string;
}

export const JA_BILL_SOURCE_LINK_FORMAT: BillSourceLinkFormat = {
  labels: {
    fullText: "議案全文（PDF）",
    overview: "提出案件概要（PDF）",
    submissions: "提出議案一覧",
    decisions: "議決結果",
  },
  separator: "・",
  pdfSuffix: "（PDF）",
};

const SOURCE_LINK_ORDER: {
  kind: BillSourceLink["kind"];
  field: keyof BillSourceLinkInput;
}[] = [
  { kind: "fullText", field: "pdf_url" },
  { kind: "overview", field: "overview_pdf_url" },
  { kind: "submissions", field: "source_page_url" },
  { kind: "decisions", field: "decision_source_url" },
];

/** 同じURLを指す2つのラベルを1つにまとめる（例: 提出案件概要・議決結果（PDF）） */
function mergeLabels(
  first: string,
  second: string,
  { separator, pdfSuffix }: BillSourceLinkFormat
): string {
  const hasPdf = first.endsWith(pdfSuffix) || second.endsWith(pdfSuffix);
  const strip = (label: string) => label.replace(pdfSuffix, "");
  return `${strip(first)}${separator}${strip(second)}${hasPdf ? pdfSuffix : ""}`;
}

/**
 * 値が入っている出典だけを、決まった順序で返す。
 * 議員提出議案のように概要と議決結果が同じPDFに載っている場合は、
 * 同じリンクを2つ並べず、ラベルをまとめた1つにする。
 */
export function buildBillSourceLinks(
  bill: BillSourceLinkInput,
  format: BillSourceLinkFormat = JA_BILL_SOURCE_LINK_FORMAT
): BillSourceLink[] {
  const links: BillSourceLink[] = [];

  for (const { kind, field } of SOURCE_LINK_ORDER) {
    const label = format.labels[kind];
    const url = bill[field]?.trim();
    if (!url) continue;
    const existing = links.find((link) => link.url === url);
    if (existing) {
      existing.label = mergeLabels(existing.label, label, format);
      continue;
    }
    links.push({ kind, label, url });
  }

  return links;
}
