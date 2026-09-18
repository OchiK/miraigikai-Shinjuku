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
 * - 表（`|`）: セル区切りであり、1行=1文ではない
 * - 引用（`>`）: 条文・提案理由の原文引用。やさしく言い換えた文を
 *   直後に必ず添えるが、引用そのものを短く書き換えると
 *   「原文を改変しない」という出典の原則に反するため除外する
 * - コードフェンス（```）
 */
export function isExcludedLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("```")
  );
}

/** 箇条書き記号・強調記号など、文の長さに数えない装飾を落とす。 */
export function stripMarkup(line: string): string {
  return line
    .replace(/^\s*[-*]\s+/, "")
    .replace(/\*\*/g, "")
    .trim();
}

/**
 * Markdown本文を「文」の配列に分割する。
 * 句点・感嘆符・疑問符・改行を区切りとする。
 */
export function splitIntoSentences(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => !isExcludedLine(line))
    .map(stripMarkup)
    .flatMap((line) => line.split(/[。！？]/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}
