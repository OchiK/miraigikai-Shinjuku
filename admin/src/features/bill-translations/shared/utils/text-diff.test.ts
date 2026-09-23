import { describe, expect, it } from "vitest";
import { collapseUnchangedLines, diffLines, hasDiff } from "./text-diff";

describe("diffLines", () => {
  it("同じ文なら全行 same", () => {
    expect(diffLines("a\nb", "a\nb")).toEqual([
      { type: "same", text: "a" },
      { type: "same", text: "b" },
    ]);
  });

  it("書き換えた行は削除 → 追加の順に並べる", () => {
    expect(diffLines("a\n旧\nc", "a\n新\nc")).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "旧" },
      { type: "added", text: "新" },
      { type: "same", text: "c" },
    ]);
  });

  it("行の追加と削除を検出する", () => {
    expect(diffLines("a\nb\nc", "a\nc\nd")).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "b" },
      { type: "same", text: "c" },
      { type: "added", text: "d" },
    ]);
  });

  it("空文字からの差分は全行 added", () => {
    expect(diffLines("", "a\nb")).toEqual([
      { type: "added", text: "a" },
      { type: "added", text: "b" },
    ]);
  });

  it("改行コードの違いは差分にしない", () => {
    expect(hasDiff(diffLines("a\r\nb", "a\nb"))).toBe(false);
  });

  it("source_hash が無視する行末空白と Unicode 正規化の違いも差分にしない", () => {
    expect(hasDiff(diffLines("a  \nが", "a\nが"))).toBe(false);
  });
});

describe("hasDiff", () => {
  it("same だけなら false、変更があれば true", () => {
    expect(hasDiff(diffLines("a", "a"))).toBe(false);
    expect(hasDiff(diffLines("a", "b"))).toBe(true);
  });
});

describe("collapseUnchangedLines", () => {
  const before = ["1", "2", "3", "4", "5", "6", "7", "8"].join("\n");

  it("変更行の前後 context 行を残し、残りを省略にまとめる", () => {
    const lines = diffLines(before, before.replace("7", "七"));
    expect(collapseUnchangedLines(lines, 1)).toEqual([
      { kind: "skipped", position: 0, count: 5 },
      { kind: "line", position: 5, type: "same", text: "6" },
      { kind: "line", position: 6, type: "removed", text: "7" },
      { kind: "line", position: 7, type: "added", text: "七" },
      { kind: "line", position: 8, type: "same", text: "8" },
    ]);
  });

  it("離れた変更の間も省略する", () => {
    const after = before.replace("1", "一").replace("8", "八");
    const items = collapseUnchangedLines(diffLines(before, after), 1);
    expect(items.filter((item) => item.kind === "skipped")).toEqual([
      { kind: "skipped", position: 3, count: 4 },
    ]);
  });

  it("変更がなければ全体を1つの省略にする", () => {
    expect(collapseUnchangedLines(diffLines(before, before))).toEqual([
      { kind: "skipped", position: 0, count: 8 },
    ]);
  });
});
