/**
 * やさしい日本語版（easy）の本文を「文」に分ける。
 *
 * デザインシステム定義 §3 は easy 段の1文を40字以内と定めている。
 * 「1文」をどう数えるかで検証の厳しさが変わるため、
 * 分け方そのものを独立した純粋関数として切り出し、テストで固定する。
 */

/**
 * 文長の検査対象にならない行かどうか。
 *
 * - 見出し（`#`）: 文ではなく見出しであり、句点で終わらない
 * - 表の区切り行（`|---|`）: 読者に見せる文章ではない
 * - コードフェンス（```）
 *
 * 表のセルと引用は読者に見える文章なので除外しない。
 */
export function isExcludedLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("#") ||
    /^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmed) ||
    trimmed.startsWith("```")
  );
}

/** 箇条書き・引用・強調など、文の長さに数えない装飾を落とす。 */
export function stripMarkup(line: string): string {
  return line
    .replace(/^\s*[-*]\s+/, "")
    .replace(/^\s*>\s?/, "")
    .replace(/\*\*/g, "")
    .trim();
}

/** 表の行はセルごとの文章として検査する。 */
function splitTableCells(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return [line];
  }

  return trimmed.slice(1, -1).split("|");
}

/**
 * Markdown本文を「文」の配列に分割する。
 * 句点・感嘆符・疑問符・改行を区切りとする。
 */
export function splitIntoSentences(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => !isExcludedLine(line))
    .flatMap(splitTableCells)
    .map(stripMarkup)
    .flatMap((line) => line.split(/[。！？]/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}
