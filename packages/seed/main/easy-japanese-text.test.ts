import { describe, expect, it } from "vitest";
import {
  isExcludedLine,
  splitIntoSentences,
  stripMarkup,
} from "./easy-japanese-text";

describe("isExcludedLine", () => {
  it("見出し・表・引用・コードフェンスを除外する", () => {
    expect(isExcludedLine("# 見出し")).toBe(true);
    expect(isExcludedLine("### 小見出し")).toBe(true);
    expect(isExcludedLine("| 項目 | 内容 |")).toBe(true);
    expect(isExcludedLine("> 条文の引用")).toBe(true);
    expect(isExcludedLine("```ts")).toBe(true);
  });

  it("行頭の空白があっても除外する", () => {
    expect(isExcludedLine("   > 引用")).toBe(true);
    expect(isExcludedLine("  | セル |")).toBe(true);
  });

  it("地の文と箇条書きは除外しない", () => {
    expect(isExcludedLine("区の お金を 足します。")).toBe(false);
    expect(isExcludedLine("- 道路を 直す 工事: 1億881万6千円")).toBe(false);
    expect(isExcludedLine("")).toBe(false);
  });
});

describe("stripMarkup", () => {
  it("箇条書き記号を落とす", () => {
    expect(stripMarkup("- 道路を 直す 工事")).toBe("道路を 直す 工事");
    expect(stripMarkup("* 下水道を つくる 工事")).toBe("下水道を つくる 工事");
    expect(stripMarkup("  - 前後に 空白")).toBe("前後に 空白");
  });

  it("強調記号を落とす", () => {
    expect(stripMarkup("**新宿区基本構想**")).toBe("新宿区基本構想");
  });

  it("文中のハイフンは落とさない", () => {
    expect(stripMarkup("第18条の2-1について")).toBe("第18条の2-1について");
  });
});

describe("splitIntoSentences", () => {
  it("句点で文に分ける", () => {
    expect(splitIntoSentences("あいうえお。かきくけこ。")).toEqual([
      "あいうえお",
      "かきくけこ",
    ]);
  });

  it("感嘆符・疑問符でも分ける", () => {
    expect(splitIntoSentences("そうですか？はい！")).toEqual([
      "そうですか",
      "はい",
    ]);
  });

  it("改行でも分ける", () => {
    expect(splitIntoSentences("一行目\n二行目")).toEqual(["一行目", "二行目"]);
  });

  it("読点では分けない", () => {
    expect(splitIntoSentences("あい、うえ、おか。")).toEqual(["あい、うえ、おか"]);
  });

  it("見出し・表・引用を数えない", () => {
    const markdown = [
      "# 見出しは とても とても とても 長くても 数えない",
      "",
      "地の文です。",
      "| 表 | の | 行 |",
      "> 条文の 引用は そのまま 残す",
      "- 箇条書きです",
    ].join("\n");

    expect(splitIntoSentences(markdown)).toEqual(["地の文です", "箇条書きです"]);
  });

  it("空行・空文は落とす", () => {
    expect(splitIntoSentences("\n\nあ。\n\n。\n")).toEqual(["あ"]);
  });

  it("40字を超える文をそのまま返す（検査側で判定できる）", () => {
    const long = "あ".repeat(41);

    expect(splitIntoSentences(`${long}。`)).toEqual([long]);
  });
});
