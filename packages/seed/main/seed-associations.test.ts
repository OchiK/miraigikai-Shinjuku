import { describe, expect, it } from "vitest";
import type { SeededBillRef } from "./bill-ref";
import { createBillContents, billContentsWithBillSlug } from "./bill-contents-data";
import { bills, createBillsTags, createFactionStances, createInterviewConfig, tags } from "./data";
import { buildItemKey, r8SecondSessionItems } from "./shinjuku-r8-2-inventory";

/** DB投入後に返ってくる { id, name, slug } を再現する */
const insertedBills: SeededBillRef[] = bills.map((b, i) => ({
  id: `bill-uuid-${i}`,
  name: b.name,
  slug: b.slug ?? null,
}));

const insertedTags = tags.map((t, i) => ({ id: `tag-uuid-${i}`, label: t.label }));

const billBySlug = (slug: string) => {
  const bill = insertedBills.find((b) => b.slug === slug);
  if (!bill) throw new Error(`missing ${slug}`);
  return bill;
};

describe("bills seed", () => {
  it("公式インベントリ23件をそのまま投入する", () => {
    expect(bills).toHaveLength(23);
    expect(bills.map((b) => b.slug)).toEqual(r8SecondSessionItems.map(buildItemKey));
  });

  it("件名が重複する承認案件も slug で一意に区別される", () => {
    const shonin = bills.filter((b) => b.name === "専決処分の承認について");
    expect(shonin).toHaveLength(2);
    expect(shonin.map((b) => b.bill_number).sort()).toEqual(["承認第2号", "承認第3号"]);
    expect(new Set(shonin.map((b) => b.slug)).size).toBe(2);
  });
});

describe("公開状態と解説の整合", () => {
  // hasPublishableContent（インベントリ側）と解説の実在（bill-contents-data 側）が
  // 食い違うと、解説ゼロの議案が published になって詳細ページが空になる。
  it("published の議案と解説を持つ議案が完全に一致する", () => {
    const publishedSlugs = bills
      .filter((b) => b.publish_status === "published")
      .map((b) => b.slug)
      .sort();

    const slugsWithContent = [
      ...new Set(billContentsWithBillSlug.map((c) => c.bill_slug)),
    ].sort();

    expect(publishedSlugs).toEqual(slugsWithContent);
  });

  it("coming_soon の議案は解説を持たない", () => {
    const comingSoonSlugs = new Set(
      bills.filter((b) => b.publish_status === "coming_soon").map((b) => b.slug)
    );

    for (const content of billContentsWithBillSlug) {
      expect(comingSoonSlugs.has(content.bill_slug)).toBe(false);
    }
  });

  it("解説の対象議案はすべてインベントリに存在する", () => {
    const allSlugs = new Set(bills.map((b) => b.slug));
    for (const content of billContentsWithBillSlug) {
      expect(allSlugs.has(content.bill_slug)).toBe(true);
    }
  });
});

describe("createBillContents", () => {
  it("解説を slug で正しい議案に結び付ける", () => {
    const contents = createBillContents(insertedBills);
    expect(contents).toHaveLength(billContentsWithBillSlug.length);

    for (const [i, content] of contents.entries()) {
      expect(content.bill_id).toBe(billBySlug(billContentsWithBillSlug[i].bill_slug).id);
    }
  });

  it("解説が付くのは第42・49・51・53・58号議案のみ", () => {
    expect([...new Set(billContentsWithBillSlug.map((c) => c.bill_slug))].sort()).toEqual([
      "shinjuku-2026-r2-gian-42",
      "shinjuku-2026-r2-gian-49",
      "shinjuku-2026-r2-gian-51",
      "shinjuku-2026-r2-gian-53",
      "shinjuku-2026-r2-gian-58",
    ]);
  });

  it("対象議案が投入されていなければ例外を投げる（黙って取り違えない）", () => {
    expect(() => createBillContents([])).toThrow(/Bill not found for slug/);
  });
});

describe("createBillsTags", () => {
  it("タグを slug で正しい議案に結び付ける", () => {
    const billsTags = createBillsTags(insertedBills, insertedTags);
    const labelOf = (id: string) =>
      insertedTags.find((t) => t.id === id)?.label;

    const mapped = Object.fromEntries(
      billsTags.map((bt) => [
        insertedBills.find((b) => b.id === bt.bill_id)?.slug,
        labelOf(bt.tag_id),
      ])
    );

    expect(mapped).toEqual({
      "shinjuku-2026-r2-gian-53": "まちづくり・環境",
      "shinjuku-2026-r2-gian-42": "くらし・行財政",
      "shinjuku-2026-r2-gian-49": "多文化共生・手続き",
      "shinjuku-2026-r2-gian-51": "子育て・教育",
      "shinjuku-2026-r2-gian-58": "文化・生涯学習",
    });
  });

  it("タグ未設定の議案には bills_tags を作らない", () => {
    const billsTags = createBillsTags(insertedBills, insertedTags);
    expect(billsTags).toHaveLength(5);
  });
});

describe("createFactionStances", () => {
  it("出典のない会派見解を投入しない", () => {
    // 令和8年第2回定例会の会派ごとの賛否は一次情報として取得できていない。
    // 創作した見解を実在会派に紐づけて公開UIに出すことがないよう、空であることを固定する。
    //
    // 出典のある会派見解を投入する際は、このテストを「slug で議案に結び付ける
    // （配列の並び順に依存しない）」ことを検証する回帰テストに戻すこと。
    // 以前 createFactionStances は insertedBills[index] による位置ベース割り当てで、
    // 議案が増えた時点で無関係な議案へ見解が付く不具合があった。
    expect(createFactionStances(insertedBills, "faction-uuid")).toEqual([]);
  });
});

describe("createInterviewConfig", () => {
  it("knowledge_source の対象である第53号議案に結び付く", () => {
    const config = createInterviewConfig(insertedBills);
    expect(config?.bill_id).toBe(billBySlug("shinjuku-2026-r2-gian-53").id);
  });

  it("対象議案が無ければ例外を投げる（黙って設定を省略しない）", () => {
    expect(() => createInterviewConfig([])).toThrow(/Bill not found for slug/);
  });
});
