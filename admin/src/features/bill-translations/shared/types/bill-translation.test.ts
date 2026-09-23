import { describe, expect, it } from "vitest";
import {
  billTranslationFormSchema,
  revokeBillTranslationSchema,
  saveBillTranslationSchema,
  TRANSLATION_LOCALES,
} from "./bill-translation";

const CONTENT_ID = "3f1c2b7e-5d0a-4c8e-9b61-2a7d4e9f0c13";

describe("TRANSLATION_LOCALES", () => {
  it("ja を含まず、DB の CHECK 制約と同じ6言語", () => {
    expect(TRANSLATION_LOCALES).toEqual([
      "en",
      "zh-Hans",
      "ko",
      "ne",
      "my",
      "vi",
    ]);
  });
});

describe("billTranslationFormSchema", () => {
  it("前後の空白を落とす", () => {
    expect(
      billTranslationFormSchema.parse({
        title: "  Title ",
        summary: " ",
        content: "Body\n",
      })
    ).toEqual({ title: "Title", summary: "", content: "Body" });
  });

  it("タイトルが空白だけなら拒否する", () => {
    const result = billTranslationFormSchema.safeParse({
      title: "   ",
      summary: "",
      content: "Body",
    });
    expect(result.success).toBe(false);
  });

  it("本文が空なら拒否する", () => {
    const result = billTranslationFormSchema.safeParse({
      title: "Title",
      summary: "",
      content: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("saveBillTranslationSchema", () => {
  const valid = {
    billContentId: CONTENT_ID,
    locale: "en",
    intent: "approve",
    title: "Title",
    summary: "Summary",
    content: "Body",
    reviewedSourceHash: `v1:${"a".repeat(64)}`,
  };

  it("confirmStale の既定値は false", () => {
    expect(saveBillTranslationSchema.parse(valid).confirmStale).toBe(false);
  });

  it("ja は翻訳先として受け付けない", () => {
    expect(
      saveBillTranslationSchema.safeParse({ ...valid, locale: "ja" }).success
    ).toBe(false);
  });

  it("reviewedSourceHash の形式が不正なら拒否する", () => {
    expect(
      saveBillTranslationSchema.safeParse({
        ...valid,
        reviewedSourceHash: "abc",
      }).success
    ).toBe(false);
  });

  it("未知の intent は受け付けない", () => {
    expect(
      saveBillTranslationSchema.safeParse({ ...valid, intent: "publish" })
        .success
    ).toBe(false);
  });
});

describe("revokeBillTranslationSchema", () => {
  it("ID の形式が不正なら拒否する", () => {
    expect(
      revokeBillTranslationSchema.safeParse({
        billContentId: "not-a-uuid",
        locale: "en",
      }).success
    ).toBe(false);
  });
});
