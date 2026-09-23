// node:crypto に依存しない。Client Component（原文差分の表示）からも使う

/**
 * 表記だけの揺れでハッシュが変わらないようにする。
 * - Unicode NFC（全角・半角や句読点は変えない。意味が変わりうるため）
 * - 改行を LF に統一
 * - 各行末の空白を削除
 * - 先頭・末尾の空行を削除
 */
export function normalizeSourceText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t　]+$/u, ""))
    .join("\n")
    .trim();
}
