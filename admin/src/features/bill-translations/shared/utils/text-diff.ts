import { normalizeSourceText } from "@mirai-gikai/shared/i18n/normalize-source-text";

export type DiffLineType = "same" | "added" | "removed";

export type DiffLine = {
  type: DiffLineType;
  text: string;
};

/** source_hash と同じ正規化をかけてから行に分ける（ハッシュが無視する揺れは差分にも出さない） */
function splitLines(text: string): string[] {
  const normalized = normalizeSourceText(text);
  return normalized === "" ? [] : normalized.split("\n");
}

/**
 * 行単位の差分（最長共通部分列）。改定前 → 改定後の順に、削除行を追加行より先に並べる。
 * 議案本文は数百行程度なので O(n×m) の表で足りる。
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = splitLines(before);
  const b = splitLines(after);

  // lcs[i][j]: a[i..] と b[j..] の最長共通部分列の長さ
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  for (; i < a.length; i++) result.push({ type: "removed", text: a[i] });
  for (; j < b.length; j++) result.push({ type: "added", text: b[j] });

  return result;
}

export function hasDiff(lines: DiffLine[]): boolean {
  return lines.some((line) => line.type !== "same");
}

/** position は差分全体での行の位置（省略は先頭行の位置）。表示時のキーに使う */
export type DiffDisplayItem =
  | ({ kind: "line"; position: number } & DiffLine)
  | { kind: "skipped"; position: number; count: number };

/**
 * 変更行の前後 context 行だけを残し、それ以外の変わっていない行は「N行省略」にまとめる。
 * 本文の末尾だけが変わったときに、変更箇所を探して全文をスクロールさせないため。
 */
export function collapseUnchangedLines(
  lines: DiffLine[],
  context = 2
): DiffDisplayItem[] {
  const keep = lines.map((line) => line.type !== "same");
  lines.forEach((line, index) => {
    if (line.type === "same") return;
    const from = Math.max(0, index - context);
    const to = Math.min(lines.length - 1, index + context);
    for (let i = from; i <= to; i++) keep[i] = true;
  });

  const items: DiffDisplayItem[] = [];
  let skipped = 0;
  const flushSkipped = (end: number) => {
    if (skipped > 0) {
      items.push({ kind: "skipped", position: end - skipped, count: skipped });
    }
    skipped = 0;
  };
  lines.forEach((line, index) => {
    if (keep[index]) {
      flushSkipped(index);
      items.push({ kind: "line", position: index, ...line });
    } else {
      skipped++;
    }
  });
  flushSkipped(lines.length);

  return items;
}
