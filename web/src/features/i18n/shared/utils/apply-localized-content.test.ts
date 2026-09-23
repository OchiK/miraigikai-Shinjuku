import { describe, expect, it } from "vitest";
import type { BillContent } from "@/features/bills/shared/types";
import {
  applyLocalizedContent,
  keepJapaneseContent,
} from "./apply-localized-content";

function makeContent(
  difficulty_level: BillContent["difficulty_level"]
): BillContent {
  return {
    id: `content-${difficulty_level}`,
    bill_id: "bill-1",
    difficulty_level,
    title: `${difficulty_level}の題名`,
    summary: `${difficulty_level}の要約`,
    content: `${difficulty_level}の本文`,
    created_at: "2026-09-23T00:00:00Z",
    updated_at: "2026-09-23T00:00:00Z",
  };
}

const bill = {
  id: "bill-1",
  name: "議案名",
  bill_content: makeContent("hard"),
};

describe("applyLocalizedContent", () => {
  it("翻訳があれば題名・要約・本文だけを差し替える", () => {
    const normal = makeContent("normal");
    const { bill: result, localization } = applyLocalizedContent(bill, "en", {
      kind: "translated",
      source: normal,
      translation: {
        bill_content_id: normal.id,
        locale: "en",
        title: "EN title",
        summary: "EN summary",
        content: "EN content",
        source_hash: "v1:x",
        status: "reviewed",
      },
    });

    expect(result.bill_content).toEqual({
      ...normal,
      title: "EN title",
      summary: "EN summary",
      content: "EN content",
    });
    expect(result.name).toBe("議案名");
    expect(localization).toEqual({
      kind: "translated",
      requestedLocale: "en",
      sourceDifficulty: "normal",
    });
  });

  it("翻訳が無ければ日本語「ふつう」に差し替えて案内情報を返す", () => {
    const normal = makeContent("normal");
    const { bill: result, localization } = applyLocalizedContent(bill, "vi", {
      kind: "unavailable",
      fallback: normal,
    });

    expect(result.bill_content).toEqual(normal);
    expect(localization).toEqual({
      kind: "unavailable",
      requestedLocale: "vi",
      displayedDifficulty: "normal",
    });
  });

  it("日本語「ふつう」が無ければ取得済みの日本語を残す（本文を消さない）", () => {
    const { bill: result, localization } = applyLocalizedContent(bill, "ko", {
      kind: "unavailable",
      fallback: null,
    });

    expect(result.bill_content).toEqual(bill.bill_content);
    expect(localization).toEqual({
      kind: "unavailable",
      requestedLocale: "ko",
      displayedDifficulty: "hard",
    });
  });

  it("日本語がどこにも無ければ内容なし", () => {
    const noContent: { bill_content?: BillContent } = {};
    const { bill: result, localization } = applyLocalizedContent(
      noContent,
      "ko",
      { kind: "unavailable", fallback: null }
    );

    expect(result.bill_content).toBeUndefined();
    expect(localization).toMatchObject({ displayedDifficulty: null });
  });
});

describe("keepJapaneseContent", () => {
  it("取得済みの日本語をそのまま残し、翻訳なしの案内を付ける", () => {
    const { bill: result, localization } = keepJapaneseContent(bill, "en");

    expect(result).toBe(bill);
    expect(localization).toEqual({
      kind: "unavailable",
      requestedLocale: "en",
      displayedDifficulty: "hard",
    });
  });
});
