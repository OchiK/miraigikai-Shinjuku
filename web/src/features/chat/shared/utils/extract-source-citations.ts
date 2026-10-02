/**
 * AI回答の末尾にある出典行を本文から切り離す。
 *
 * プロンプト（shared-sections.ts）は出典を最後の1行に書くよう指示している:
 * - 日本語の回答: `【出典】議案第XX号 本文、https://...`
 * - 英語の回答: `Source: Bill No. XX full text, https://...`
 * 出典が複数あるときは「、」「;」「；」で区切る。
 */

const SOURCE_LINE =
  /^[ \t]*(?:【出典】|\[出典\]|出典[:：]|Sources?[:：])[ \t]*(.*)$/i;
const SOURCE_SEPARATOR = /[、;；]/;

export interface ExtractedCitations {
  /** 出典行を取り除いた本文 */
  body: string;
  /** 出典。1件ずつ別のチップとして出す */
  sources: string[];
}

export function extractSourceCitations(text: string): ExtractedCitations {
  const sources: string[] = [];
  const bodyLines: string[] = [];

  for (const line of text.split("\n")) {
    const match = SOURCE_LINE.exec(line);
    if (!match) {
      bodyLines.push(line);
      continue;
    }
    for (const source of match[1].split(SOURCE_SEPARATOR)) {
      const trimmed = source.trim();
      if (trimmed) {
        sources.push(trimmed);
      }
    }
  }

  return { body: bodyLines.join("\n").trimEnd(), sources };
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/.test(value);
}
