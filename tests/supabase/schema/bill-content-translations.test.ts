import { afterEach, describe, expect, it } from "vitest";
import {
  adminClient,
  cleanupTestBill,
  createTestBill,
  createTestBillContent,
  createTestBillContentTranslation,
} from "../utils";

/**
 * bill_content_translations の制約。
 * アプリ側の検証をすり抜けた不正な行を DB で止められることを確かめる。
 */
describe("bill_content_translations 制約", () => {
  const billIds: string[] = [];

  afterEach(async () => {
    for (const id of billIds) {
      await cleanupTestBill(id);
    }
    billIds.length = 0;
  });

  async function setupContent() {
    const bill = await createTestBill();
    billIds.push(bill.id);
    return createTestBillContent(bill.id);
  }

  it("同じ本文・同じロケールの翻訳は2件作れない", async () => {
    const content = await setupContent();
    await createTestBillContentTranslation(content.id, { locale: "en" });

    await expect(
      createTestBillContentTranslation(content.id, { locale: "en" })
    ).rejects.toThrow(/bill_content_translations_content_locale_key/);
  });

  it("同じ本文でもロケールが違えば作れる", async () => {
    const content = await setupContent();
    await createTestBillContentTranslation(content.id, { locale: "en" });
    await createTestBillContentTranslation(content.id, { locale: "ko" });

    const { data } = await adminClient
      .from("bill_content_translations")
      .select("locale")
      .eq("bill_content_id", content.id);
    expect(data?.map((r) => r.locale).sort()).toEqual(["en", "ko"]);
  });

  it.each([
    ["ja（正本）", "ja"],
    ["未対応の言語", "fr"],
    ["大文字小文字の揺れ", "zh-hans"],
  ])("locale に %s は入らない", async (_label, locale) => {
    const content = await setupContent();
    const { error } = await adminClient
      .from("bill_content_translations")
      .insert({
        bill_content_id: content.id,
        locale,
        title: "t",
        summary: "s",
        content: "c",
        source_hash: `v1:${"0".repeat(64)}`,
      });
    expect(error?.message).toMatch(/check constraint/);
  });

  it("source_hash は v<番号>:<sha256> の形式に限る", async () => {
    const content = await setupContent();
    await expect(
      createTestBillContentTranslation(content.id, { source_hash: "abc" })
    ).rejects.toThrow(/check constraint/);
  });

  it("status は generated / reviewed / stale のみ", async () => {
    const content = await setupContent();
    const { error } = await adminClient
      .from("bill_content_translations")
      .insert({
        bill_content_id: content.id,
        locale: "en",
        title: "t",
        summary: "s",
        content: "c",
        source_hash: `v1:${"0".repeat(64)}`,
        status: "published",
      });
    expect(error?.message).toMatch(/check constraint/);
  });

  it("reviewed にするには reviewed_at が必要", async () => {
    const content = await setupContent();
    await expect(
      createTestBillContentTranslation(content.id, {
        status: "reviewed",
        reviewed_at: null,
      })
    ).rejects.toThrow(/bill_content_translations_reviewed_has_timestamp/);
  });

  async function insertWithSnapshot(source_snapshot: unknown) {
    const content = await setupContent();
    return adminClient.from("bill_content_translations").insert({
      bill_content_id: content.id,
      locale: "en",
      title: "t",
      summary: "s",
      content: "c",
      source_hash: `v1:${"0".repeat(64)}`,
      // 不正な形を DB に送るため、型を外して渡す
      source_snapshot: source_snapshot as never,
    });
  }

  it.each([
    ["null（記録前の翻訳）", null],
    [
      "title / summary / content の文字列",
      { title: "a", summary: "b", content: "c" },
    ],
  ])("source_snapshot に %s は入る", async (_label, snapshot) => {
    const { error } = await insertWithSnapshot(snapshot);
    expect(error).toBeNull();
  });

  it.each([
    ["文字列", "text"],
    ["配列", ["a"]],
    ["フィールド欠け", { title: "a", summary: "b" }],
    ["文字列以外の値", { title: "a", summary: "b", content: 1 }],
  ])("source_snapshot に %s は入らない", async (_label, snapshot) => {
    const { error } = await insertWithSnapshot(snapshot);
    expect(error?.message).toMatch(
      /bill_content_translations_source_snapshot_shape/
    );
  });

  it("元の bill_contents を消すと翻訳も消える", async () => {
    const content = await setupContent();
    const translation = await createTestBillContentTranslation(content.id);

    await adminClient.from("bill_contents").delete().eq("id", content.id);

    const { data } = await adminClient
      .from("bill_content_translations")
      .select("id")
      .eq("id", translation.id);
    expect(data).toEqual([]);
  });
});
