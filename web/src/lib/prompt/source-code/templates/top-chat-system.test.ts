import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { buildTopChatSystemPrompt } from "./top-chat-system";

describe("buildTopChatSystemPrompt", () => {
  it("identifies the independent local service and preserves bill context", () => {
    const summary = '{"bill_number":"第53号議案","isFeatured":true}';
    const result = buildTopChatSystemPrompt(summary);

    expect(result).toContain(summary);
    expect(result).toContain(siteConfig.siteName);
    expect(result).toContain(siteConfig.councilName);
    expect(result).toContain(siteConfig.operator.name);
    expect(result).toContain("非公式サービス");
    expect(result).toContain("公式サービスではありません");
    expect(result).toContain("公式サイトなど一次資料を優先");
    expect(result).toContain("必ず引用元のURLを明記");
    expect(result).not.toContain("## チームみらいの概要");
    expect(result).not.toContain("2026年プラン");
    expect(result).not.toContain("永田町に届く");
  });
});
