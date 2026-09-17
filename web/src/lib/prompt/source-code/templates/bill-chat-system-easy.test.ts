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
