import { describe, expect, it } from "vitest";
import { billContentsR8_3 } from "./bill-contents-r8-3-data";
import {
  hardVoteTable,
  validateMayorVoteText,
  voteProse,
  voteStanceLabel,
  VOTE_ABSENCE,
  VOTE_REASONS_ABSENCE,
} from "./r8-3-vote-text";
import { r8_3GianKey, r8_3NinteiKey } from "./shinjuku-r8-3-inventory";

const unanimous = r8_3GianKey(63);
const opposed = r8_3GianKey(68);

describe("seed から生成する会派文と表", () => {
  it("hard は見出し・9会派・注記を持ち、採決時の名称と各記号を示す", () => {
    const table = hardVoteTable(opposed, "可決");
    expect(table.split("\n")).toHaveLength(13);
    expect(table).toContain(
      "| 共産（日本共産党新宿区議会議員団） | 反対（×） |"
    );
    expect(table).toContain(
      "| 現役（現役世代に優しい新宿・減税の会） | 賛成（○） |"
    );
    expect(table).toContain("| アプデ（アップデート新宿） | 賛成（○） |");
    expect(table).toContain("議決結果の欄は「可決」である。");
    expect(hardVoteTable(r8_3NinteiKey(1), "認定")).toContain(
      "議決結果の欄は「認定」である。"
    );
  });

  it.each([
    "easy",
    "normal",
  ] as const)("%s の全会一致と反対ありの定型", (level) => {
    expect(voteProse(unanimous, level)).toContain(
      level === "easy"
        ? "9つの 会派 すべてが 賛成しました。"
        : "9会派すべてが賛成しました。"
    );
    expect(voteProse(unanimous, level)).not.toContain("反対");
    const prose = voteProse(opposed, level);
    expect(prose).toContain("日本共産党新宿区議会議員団");
    expect(prose).toContain("いのちの党 新宿");
    expect(prose).toContain(
      level === "easy" ? "賛成は 7つ、反対は 2つでした。" : "反対（2会派）"
    );
    if (level === "easy")
      expect(prose.split("\n").filter((s) => s.startsWith("- "))).toHaveLength(
        9
      );
  });

  it.each([
    "○○○○○○○○",
    "○○○○?○○○○",
  ])("不正な記号列 %s を表・文とも拒否する", (marks) => {
    const votes = [{ billKey: unanimous, titleInSource: "テスト", marks }];
    expect(() => hardVoteTable(unanimous, "可決", votes)).toThrow();
    expect(() => voteProse(unanimous, "easy", votes)).toThrow();
    expect(() => voteProse(unanimous, "normal", votes)).toThrow();
  });

  it("for / against だけを表示し、それ以外の態度を拒否する", () => {
    expect(voteStanceLabel("for")).toBe("賛成（○）");
    expect(voteStanceLabel("against")).toBe("反対（×）");
    expect(() => voteStanceLabel("abstain")).toThrow(
      "会派賛否の態度は変換できません: abstain"
    );
  });

  it("会派文が重複した本文を検出する", () => {
    const c = billContentsR8_3.find(
      (c) => c.bill_slug === unanimous && c.difficulty_level === "easy"
    );
    if (!c) throw new Error("全会一致 easy のテスト本文がありません");
    const prose = voteProse(unanimous, "easy");
    const content = c.content.replace(prose, `${prose}\n${prose}`);
    expect(validateMayorVoteText([{ ...c, content }])).toContain(
      `${unanimous}:easy: 会派賛否の本文が seed と一致しない`
    );
  });

  it("不明な議案を拒否する", () => {
    expect(() => hardVoteTable("missing", "可決")).toThrow(
      /会派賛否が見つかりません/
    );
  });
});

describe("本文の独立した節検査", () => {
  it("全66変種を検査する", () => {
    expect(billContentsR8_3).toHaveLength(66);
    expect(validateMayorVoteText(billContentsR8_3)).toEqual([]);
  });

  const normal = billContentsR8_3.find(
    (c) => c.bill_slug === opposed && c.difficulty_level === "normal"
  );
  if (!normal) throw new Error("反対あり normal のテスト本文がありません");
  it("seed にない議案を例外ではなく問題として報告し、検査を続ける", () => {
    const contents = [
      { ...normal, bill_slug: "missing" },
      { ...normal, content: normal.content.replace(VOTE_ABSENCE.normal, "") },
    ];
    expect(validateMayorVoteText(contents)).toEqual([
      "missing:normal: 会派賛否が見つかりません",
      `${opposed}:normal: 議決日・個人投票の不記載がない`,
    ]);
  });

  it("反対会派を入れ替えた本文を検出する", () => {
    const wrong = normal.content.replace(
      "- 反対（2会派）: 日本共産党新宿区議会議員団、いのちの党 新宿",
      "- 反対（2会派）: 自民・参政クラブ、いのちの党 新宿"
    );
    expect(wrong).not.toBe(normal.content);
    expect(validateMayorVoteText([{ ...normal, content: wrong }])).not.toEqual(
      []
    );
  });

  it("会派文を消した本文を検出する", () => {
    const wrong = normal.content.replace(voteProse(opposed, "normal"), "");
    expect(validateMayorVoteText([{ ...normal, content: wrong }])).not.toEqual(
      []
    );
  });

  it.each([
    VOTE_ABSENCE.normal,
    VOTE_REASONS_ABSENCE.normal,
  ])("不明事項を消した本文を検出する: %s", (disclosure) => {
    const wrong = normal.content.replace(disclosure, "");
    expect(wrong).not.toBe(normal.content);
    expect(validateMayorVoteText([{ ...normal, content: wrong }])).not.toEqual(
      []
    );
  });

  it("全会一致に反対会派の列挙を加えた本文を検出する", () => {
    const c = billContentsR8_3.find(
      (c) => c.bill_slug === unanimous && c.difficulty_level === "easy"
    );
    if (!c) throw new Error("全会一致 easy のテスト本文がありません");
    const wrong = c.content.replace(
      VOTE_ABSENCE.easy,
      "- 反対: 自民・参政クラブ\n" + VOTE_ABSENCE.easy
    );
    expect(validateMayorVoteText([{ ...c, content: wrong }])).not.toEqual([]);
  });
});
