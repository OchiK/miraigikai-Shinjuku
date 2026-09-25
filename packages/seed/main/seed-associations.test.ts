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

/** 解説（bill_contents）をそろえた議案。区長提出議案23件と議員提出議案4件の全27件 */
const BILL_SLUGS_WITH_CONTENT = r8SecondSessionItems.map(buildItemKey);

describe("bills seed", () => {
  it("公式インベントリ27件（区長提出23件＋議員提出4件）をそのまま投入する", () => {
    expect(bills).toHaveLength(27);
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
  // 公開レビューを完了した23件すべてについて、3難易度の解説がそろうことを固定する。
  it("published の議案は必ず解説を持つ", () => {
    const slugsWithContent = new Set(
      billContentsWithBillSlug.map((c) => c.bill_slug)
    );

    const publishedWithoutContent = bills
      .filter((b) => b.publish_status === "published")
      .filter((b) => !slugsWithContent.has(b.slug ?? ""))
      .map((b) => b.slug);

    expect(publishedWithoutContent).toEqual([]);
  });

  it("全27件を published とし、coming_soon を残さない", () => {
    expect(
      bills
        .filter((b) => b.publish_status === "published")
        .map((b) => b.slug)
    ).toEqual(BILL_SLUGS_WITH_CONTENT);
    expect(bills.filter((b) => b.publish_status === "coming_soon")).toEqual(
      []
    );
  });

  it("published の全議案に easy / normal / hard の解説がそろう", () => {
    const levelsBySlug = new Map<string, Set<string>>();
    for (const content of billContentsWithBillSlug) {
      const levels = levelsBySlug.get(content.bill_slug) ?? new Set<string>();
      levels.add(content.difficulty_level);
      levelsBySlug.set(content.bill_slug, levels);
    }

    for (const bill of bills.filter((b) => b.publish_status === "published")) {
      expect(
        [...(levelsBySlug.get(bill.slug ?? "") ?? [])].sort(),
        bill.slug ?? "slug missing"
      ).toEqual(["easy", "hard", "normal"]);
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

  it("入力順が変わっても解説は正しい議案に結び付く", () => {
    // 実装計画の受入条件「Normal/hard content joins to the intended bill
    // even when input order changes」に対応する。
    // 位置ベースで結び付けていると、並びを変えた瞬間に別の議案に付く。
    const reversed = [...insertedBills].reverse();
    const byOriginal = createBillContents(insertedBills);
    const byReversed = createBillContents(reversed);

    expect(byReversed).toEqual(byOriginal);
    for (const [i, content] of byReversed.entries()) {
      expect(content.bill_id).toBe(
        billBySlug(billContentsWithBillSlug[i].bill_slug).id
      );
    }
  });

  it("令和8年第2回定例会の27件すべてが解説を持つ", () => {
    // 区長提出議案23件（ステップ3の5件 + ステップ4パイロットの3件 + ステップ4残り15件）
    // と議員提出議案4件。
    // 対象の全件と一致することを確かめる（取りこぼしと余剰の双方を検出する）。
    // 期待値は令和8年第2回定例会のインベントリから導出する。
    // bills 全件と比べると、別会期の議案を seed に足した瞬間に無関係な理由で落ちる。
    expect([...new Set(billContentsWithBillSlug.map((c) => c.bill_slug))].sort()).toEqual(
      [...BILL_SLUGS_WITH_CONTENT].sort()
    );
  });

  it("解説を持つ議案はすべて normal と hard の2種をそろえる", () => {
    // 片方だけだと難易度切り替えで空表示になる。
    // easy の全件整備後も、従来の normal と hard は必ず残ることを押さえる。
    const byBill = new Map<string, Set<string>>();
    for (const c of billContentsWithBillSlug) {
      const levels = byBill.get(c.bill_slug) ?? new Set<string>();
      levels.add(c.difficulty_level);
      byBill.set(c.bill_slug, levels);
    }

    for (const [slug, levels] of byBill) {
      // easy を除くと必ず normal と hard の2種。
      // 「normal か hard が欠けている」と「未知の段が増えた」を同時に弾く。
      expect([...levels].filter((l) => l !== "easy").sort(), slug).toEqual([
        "hard",
        "normal",
      ]);
    }
  });

  it("(bill_slug, difficulty_level) の組に重複がない", () => {
    const keys = billContentsWithBillSlug.map(
      (c) => `${c.bill_slug}:${c.difficulty_level}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("承認案件の解説は承認の slug に付く（件名が重複するため slug でのみ特定できる）", () => {
    const shoninContents = billContentsWithBillSlug.filter((c) =>
      c.bill_slug.startsWith("shinjuku-2026-r2-shonin-")
    );
    expect(
      shoninContents.map((c) => [c.bill_slug, c.difficulty_level])
    ).toEqual([
      ["shinjuku-2026-r2-shonin-2", "easy"],
      ["shinjuku-2026-r2-shonin-2", "normal"],
      ["shinjuku-2026-r2-shonin-2", "hard"],
      ["shinjuku-2026-r2-shonin-3", "easy"],
      ["shinjuku-2026-r2-shonin-3", "normal"],
      ["shinjuku-2026-r2-shonin-3", "hard"],
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
      "shinjuku-2026-r2-gian-43": "くらし・行財政",
      "shinjuku-2026-r2-gian-44": "くらし・行財政",
      "shinjuku-2026-r2-shonin-2": "くらし・行財政",
      "shinjuku-2026-r2-shonin-3": "くらし・行財政",
      "shinjuku-2026-r2-gian-45": "多文化共生・手続き",
      "shinjuku-2026-r2-gian-46": "くらし・行財政",
      "shinjuku-2026-r2-gian-47": "くらし・行財政",
      "shinjuku-2026-r2-gian-48": "くらし・行財政",
      "shinjuku-2026-r2-gian-50": "子育て・教育",
      "shinjuku-2026-r2-gian-52": "くらし・行財政",
      "shinjuku-2026-r2-gian-54": "まちづくり・環境",
      "shinjuku-2026-r2-gian-55": "子育て・教育",
      "shinjuku-2026-r2-gian-56": "子育て・教育",
      "shinjuku-2026-r2-gian-57": "文化・生涯学習",
      "shinjuku-2026-r2-gian-59": "くらし・行財政",
      "shinjuku-2026-r2-gian-60": "くらし・行財政",
      "shinjuku-2026-r2-gian-61": "まちづくり・環境",
      "shinjuku-2026-r2-gian-62": "文化・生涯学習",
    });
  });

  it("タグ未設定の議案には bills_tags を作らない", () => {
    // 現在は23件すべてにタグを付けているため、インベントリだけを渡すと
    // 未設定の経路を一度も通らず、このテストが空振りする。
    // タグ表に無い議案を明示的に混ぜて、その議案に関連付けが作られないことを見る。
    const unmapped: SeededBillRef = {
      id: "00000000-0000-0000-0000-0000000000ff",
      name: "タグ表に無い議案",
      slug: "not-in-tag-map",
    };
    const billsTags = createBillsTags([...insertedBills, unmapped], insertedTags);

    expect(billsTags.some((bt) => bt.bill_id === unmapped.id)).toBe(false);
    expect(billsTags).toHaveLength(23);
  });
});

describe("createFactionStances", () => {
  const insertedFactions = [
    "jimin-sansei",
    "komei",
    "kyosan",
    "shinjuku-mirai",
    "rikken",
    "ishin",
    "genekisedai",
    "inochi",
    "update",
  ].map((name) => ({ id: `${name}-uuid`, name }));

  it("議案には slug で結び付き、配列の並び順に依存しない", () => {
    // 以前 createFactionStances は insertedBills[index] による位置ベース割り当てで、
    // 議案が増えた時点で無関係な議案へ見解が付く不具合があった。
    const stances = createFactionStances(
      [...insertedBills].reverse(),
      insertedFactions
    );
    const against = stances.filter((stance) => stance.type === "against");
    expect(against).toContainEqual(
      expect.objectContaining({
        bill_id: billBySlug("shinjuku-2026-r2-gian-54").id,
        faction_id: "kyosan-uuid",
      })
    );
    expect(stances).toHaveLength(216);
  });

  it("採決後に結成された会派には賛否を付けない", () => {
    const stances = createFactionStances(insertedBills, insertedFactions);
    expect(stances.some((s) => s.faction_id === "update-uuid")).toBe(false);
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
