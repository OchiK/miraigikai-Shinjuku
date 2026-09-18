import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { buildBillChatSystemEasyPrompt } from "./bill-chat-system-easy";

describe("buildBillChatSystemEasyPrompt", () => {
  it("4つのパラメータがプロンプトに埋め込まれる", () => {
    const result = buildBillChatSystemEasyPrompt(
      "テスト法案名",
      "テスト法案タイトル",
      "テスト法案要約",
      "テスト法案詳細"
    );

    expect(result).toContain("テスト法案名");
    expect(result).toContain("テスト法案タイトル");
    expect(result).toContain("テスト法案要約");
    expect(result).toContain("テスト法案詳細");
  });

  it("難易度「やさしい」セクションが含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain("回答の難易度：やさしい");
  });

  it("1文の長さの制約が指示に含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain("40字以内");
  });

  it("アンカー保持プロトコルの指示が含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain("【正式名称】［ふりがな］（＝やさしい言いかえ）");
    expect(result).toContain(
      "【補正予算】［ほせいよさん］（＝あとから 足す お金）"
    );
  });

  it("元号を西暦と曜日に直す指示が含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain("2026年（令和8年）6月10日（水）");
  });

  it("義務を弱めない指示が含まれる", () => {
    // 「しなければならない」を「したほうがいい」に緩めると、
    // 読み手が義務を任意と誤解する。難易度を下げる圧力への歯止め。
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain(
      "「しなければならない」を「したほうが いいです」にしないでください"
    );
  });

  it("議案に書いていないことを足さない指示が含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain("この議案には 書いて ありません");
  });

  it("サービス概要が含まれる", () => {
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).toContain(siteConfig.siteName);
  });

  it("非公式運営では政党固有の記述が含まれない", () => {
    if (siteConfig.features.showTeamMiraiSection) {
      return;
    }
    const result = buildBillChatSystemEasyPrompt("a", "b", "c", "d");

    expect(result).not.toContain("党首");
    expect(result).not.toContain("所属議員一覧");
    expect(result).not.toContain("2026年プラン");
  });
});
