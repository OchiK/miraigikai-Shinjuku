import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { buildBillChatSystemHardPrompt } from "./bill-chat-system-hard";

describe("buildBillChatSystemHardPrompt", () => {
  it("4つのパラメータがプロンプトに埋め込まれる", () => {
    const result = buildBillChatSystemHardPrompt(
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

  it("難易度「難しい」セクションが含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain("回答の難易度：難しい");
    expect(result).toContain("専門用語を正確に使用");
  });

  it("サービス概要が含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain(siteConfig.siteName);
  });

  it("非公式運営では政党固有の記述が含まれない", () => {
    if (siteConfig.features.showTeamMiraiSection) {
      return;
    }
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).not.toContain("党首");
    expect(result).not.toContain("所属議員一覧");
    expect(result).not.toContain("2026年プラン");
  });
});
