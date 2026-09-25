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

const SOURCE_LINK_ORDER: {
  kind: BillSourceLink["kind"];
  label: string;
  field: keyof BillSourceLinkInput;
}[] = [
  { kind: "fullText", label: "議案全文（PDF）", field: "pdf_url" },
  { kind: "overview", label: "提出案件概要（PDF）", field: "overview_pdf_url" },
  { kind: "submissions", label: "提出議案一覧", field: "source_page_url" },
  { kind: "decisions", label: "議決結果", field: "decision_source_url" },
];

const PDF_SUFFIX = "（PDF）";

/** 同じURLを指す2つのラベルを1つにまとめる（例: 提出案件概要・議決結果（PDF）） */
function mergeLabels(first: string, second: string): string {
  const hasPdf = first.endsWith(PDF_SUFFIX) || second.endsWith(PDF_SUFFIX);
  const strip = (label: string) => label.replace(PDF_SUFFIX, "");
  return `${strip(first)}・${strip(second)}${hasPdf ? PDF_SUFFIX : ""}`;
}

/**
 * 値が入っている出典だけを、決まった順序で返す。
 * 議員提出議案のように概要と議決結果が同じPDFに載っている場合は、
 * 同じリンクを2つ並べず、ラベルをまとめた1つにする。
 */
export function buildBillSourceLinks(
  bill: BillSourceLinkInput
): BillSourceLink[] {
  const links: BillSourceLink[] = [];

  for (const { kind, label, field } of SOURCE_LINK_ORDER) {
    const url = bill[field]?.trim();
    if (!url) continue;
    const existing = links.find((link) => link.url === url);
    if (existing) {
      existing.label = mergeLabels(existing.label, label);
      continue;
    }
    links.push({ kind, label, url });
  }

  return links;
}
