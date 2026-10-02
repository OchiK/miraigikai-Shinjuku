import { describe, expect, it } from "vitest";
import { buildCommonRules, SOURCE_AND_LANGUAGE_RULES } from "./shared-sections";

describe("buildCommonRules", () => {
  const rules = buildCommonRules();

  it("出典・言語のルールが含まれる", () => {
    expect(rules).toContain(SOURCE_AND_LANGUAGE_RULES);
  });

  it("出典を示せない内容は答えず、辞退するよう指示している", () => {
    expect(rules).toContain("出典を示せない内容は回答しない");
    expect(rules).toContain("提供された議案資料からは確認できません");
  });

  it("出典行の書式（日本語・英語）を指定している", () => {
    expect(rules).toContain("【出典】");
    expect(rules).toContain("Source:");
  });

  it("回答の言語を質問者の言語に合わせるよう指示している", () => {
    expect(rules).toContain("質問者の言語に合わせる");
  });

  it("会話を深堀りする文を出典行より前に置くよう指示している", () => {
    expect(rules).toContain("出典行を最後にする");
  });
});
