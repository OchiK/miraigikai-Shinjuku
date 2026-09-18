import { describe, expect, it } from "vitest";
import {
  isExcludedLine,
  splitIntoSentences,
  stripAnchorGloss,
  stripMarkup,
} from "./easy-japanese-text";

describe("isExcludedLine", () => {
  it("見出し・表の区切り行・コードフェンスを除外する", () => {
    expect(isExcludedLine("# 見出し")).toBe(true);
    expect(isExcludedLine("### 小見出し")).toBe(true);
    expect(isExcludedLine("|------|------|")).toBe(true);
    expect(isExcludedLine("| :--- | ---: |")).toBe(true);
    expect(isExcludedLine("```ts")).toBe(true);
  });

  it("行頭の空白があっても除外する", () => {
    expect(isExcludedLine("  | --- | --- |")).toBe(true);
    expect(isExcludedLine("   ```ts")).toBe(true);
  });

  it("地の文・箇条書き・表のセル・引用は除外しない", () => {
    expect(isExcludedLine("区の お金を 足します。")).toBe(false);
    expect(isExcludedLine("- 道路を 直す 工事: 1億881万6千円")).toBe(false);
    expect(isExcludedLine("| 項目 | 内容 |")).toBe(false);
    expect(isExcludedLine("> 条文の引用")).toBe(false);
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

  it("引用記号を落とす", () => {
    expect(stripMarkup("> 条文の 引用です。")).toBe("条文の 引用です。");
  });

  it("文中のハイフンは落とさない", () => {
    expect(stripMarkup("第18条の2-1について")).toBe("第18条の2-1について");
  });
});

describe("stripAnchorGloss", () => {
  it("初出のアンカーを正式名称だけに畳む", () => {
    expect(
      stripAnchorGloss("【補正予算】［ほせいよさん］（＝あとから 足す お金）を 出します")
    ).toBe("補正予算を 出します");
  });

  it("2回目以降の【正式名称】だけの表記も畳む", () => {
    expect(stripAnchorGloss("【補正予算】は 区議会が 決めます")).toBe(
      "補正予算は 区議会が 決めます"
    );
  });

  it("1行に複数のアンカーがあっても畳む", () => {
    expect(
      stripAnchorGloss(
        "【繰入金】［くりいれきん］（＝貯金を くずす お金）と【特別区債】［とくべつくさい］（＝区の 借金）"
      )
    ).toBe("繰入金と特別区債");
  });

  it("ふりがなだけ・言いかえだけのアンカーも畳む", () => {
    expect(stripAnchorGloss("【原案可決】［げんあんかけつ］です")).toBe(
      "原案可決です"
    );
    expect(stripAnchorGloss("【原案可決】（＝出した 通りで 決まること）です")).toBe(
      "原案可決です"
    );
  });

  it("アンカーでない丸かっこは残す", () => {
    expect(stripAnchorGloss("道路の 工事（第Ⅰ期）です")).toBe(
      "道路の 工事（第Ⅰ期）です"
    );
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

  it("見出しと表の区切り行を数えず、表のセルと引用は数える", () => {
    const markdown = [
      "# 見出しは とても とても とても 長くても 数えない",
      "",
      "地の文です。",
      "| 項目 | 内容 |",
      "|------|------|",
      "> 条文の 引用は そのまま 残す",
      "- 箇条書きです",
    ].join("\n");

    expect(splitIntoSentences(markdown)).toEqual([
      "地の文です",
      "項目",
      "内容",
      "条文の 引用は そのまま 残す",
      "箇条書きです",
    ]);
  });

  it("表の長いセルと長い引用を検査対象に残す", () => {
    const long = "あ".repeat(41);

    expect(splitIntoSentences(`| 項目 | ${long} |`)).toContain(long);
    expect(splitIntoSentences(`> ${long}`)).toContain(long);
  });

  it("空行・空文は落とす", () => {
    expect(splitIntoSentences("\n\nあ。\n\n。\n")).toEqual(["あ"]);
  });

  it("40字を超える文をそのまま返す（検査側で判定できる）", () => {
    const long = "あ".repeat(41);

    expect(splitIntoSentences(`${long}。`)).toEqual([long]);
  });

  it("アンカーのふりがなと言いかえは文の長さに数えない", () => {
    expect(
      splitIntoSentences(
        "今回は【補正予算】［ほせいよさん］（＝あとから 足す お金）です。"
      )
    ).toEqual(["今回は補正予算です"]);
  });
});
