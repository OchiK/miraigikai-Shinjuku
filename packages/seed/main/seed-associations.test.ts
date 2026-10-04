import { describe, expect, it } from "vitest";
import type { SeededBillRef } from "./bill-ref";
import {
  billContentsWithBillSlug,
  createBillContents,
} from "./bill-contents-data";
import {
  billSessionSlugByBillSlug,
  bills,
  createBillsTags,
  createFactionStances,
  createInterviewConfig,
  tags,
} from "./data";
import {
  R8_1_SESSION,
  buildR8_1ItemKey,
  r8FirstSessionItems,
} from "./shinjuku-r8-1-inventory";
import { buildItemKey, r8SecondSessionItems } from "./shinjuku-r8-2-inventory";
import {
  R8_3_SESSION,
  buildR8_3ItemKey,
  r8ThirdSessionItems,
} from "./shinjuku-r8-3-inventory";

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

/** 第1回定例会のうち解説を作成済みの全48件（Phase 2 パイロット5件、議員提出議案第1〜5号、予算関連議案11件、条例案 Group A・B・C の27件） */
const r8_1ItemsWithContent = r8FirstSessionItems.filter(
  (item) => item.hasPublishableContent
);

/** 第3回定例会のうち解説を作成済みの区長提出議案22件 */
const r8_3ItemsWithContent = r8ThirdSessionItems.filter(
  (item) => item.hasPublishableContent
);

/**
 * 解説（bill_contents）をそろえた議案。
 * 第1回定例会の全48件（パイロット5件、議員提出議案第1〜5号、予算関連議案11件、条例案 Group A・B・C の27件）、第2回定例会の区長提出議案23件・議員提出議案4件の27件、
 * 第3回定例会の22件の全97件。並びは bills（data.ts）の登録順に合わせる。
 */
const BILL_SLUGS_WITH_CONTENT = [
  ...r8_1ItemsWithContent.map(buildR8_1ItemKey),
  ...r8SecondSessionItems.map(buildItemKey),
  ...r8_3ItemsWithContent.map(buildR8_3ItemKey),
];

describe("bills seed", () => {
  it("R8-1の48件・R8-2の27件・R8-3の24件を公式インベントリから投入する", () => {
    expect(bills).toHaveLength(99);
    expect(bills.map((b) => b.slug)).toEqual([
      ...r8FirstSessionItems.map(buildR8_1ItemKey),
      ...r8SecondSessionItems.map(buildItemKey),
      ...r8ThirdSessionItems.map(buildR8_3ItemKey),
    ]);
  });

  it("議案は slug で正しい会期に紐づく", () => {
    for (const item of r8FirstSessionItems) {
      expect(billSessionSlugByBillSlug[buildR8_1ItemKey(item)]).toBe(
        R8_1_SESSION.slug
      );
    }
    for (const item of r8SecondSessionItems) {
      expect(billSessionSlugByBillSlug[buildItemKey(item)]).toBe("r8-2");
    }
    for (const item of r8ThirdSessionItems) {
      expect(billSessionSlugByBillSlug[buildR8_3ItemKey(item)]).toBe(
        R8_3_SESSION.slug
      );
    }
  });

  it("件名が重複する承認案件も slug で一意に区別される", () => {
    const shonin = bills.filter((b) => b.name === "専決処分の承認について");
    expect(shonin).toHaveLength(3);
    expect(shonin.map((b) => b.bill_number).sort()).toEqual([
      "承認第1号",
      "承認第2号",
      "承認第3号",
    ]);
    expect(new Set(shonin.map((b) => b.slug)).size).toBe(3);
  });
});

describe("公開状態と解説の整合", () => {
  // 公開する54件すべてについて、3難易度の解説がそろうことを固定する。
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

  it("R8-1の21件・R8-2の27件・R8-3の22件を published にし、R8-1の残り27件とR8-3の議員提出2件だけを coming_soon にする", () => {
    expect(
      bills
        .filter((b) => b.publish_status === "published")
        .map((b) => b.slug)
    ).toEqual(BILL_SLUGS_WITH_CONTENT);
    expect(
      bills
        .filter((b) => b.publish_status === "coming_soon")
        .map((b) => b.slug)
    ).toEqual([
      ...r8FirstSessionItems
        .filter((item) => !item.hasPublishableContent)
        .map(buildR8_1ItemKey),
      "shinjuku-2026-r3-giin-11",
      "shinjuku-2026-r3-giin-12",
    ]);
  });

  it("R8-1の解説を持つ全48件は公開レビュー済み（is_review_completed: true）", () => {
    const r8_1Slugs = new Set(r8_1ItemsWithContent.map(buildR8_1ItemKey));
    const r8_1Bills = bills.filter((b) => r8_1Slugs.has(b.slug ?? ""));

    expect(r8_1Bills).toHaveLength(48);
    for (const bill of r8_1Bills) {
      expect(bill.is_review_completed, bill.slug ?? "").toBe(true);
    }
  });

  it("R8-3の解説を持つ22件は公開レビュー済み（is_review_completed: true）", () => {
    const r8_3Slugs = new Set(r8_3ItemsWithContent.map(buildR8_3ItemKey));
    const r8_3Bills = bills.filter((b) => r8_3Slugs.has(b.slug ?? ""));

    expect(r8_3Bills).toHaveLength(22);
    for (const bill of r8_3Bills) {
      expect(bill.is_review_completed, bill.slug ?? "").toBe(true);
    }
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

  it("令和8年第1回定例会の10件、第2回定例会の27件、第3回定例会の22件すべてが解説を持つ", () => {
    // 第2回は区長提出議案23件（ステップ3の5件 + ステップ4パイロットの3件 +
    // ステップ4残り15件）と議員提出議案4件。第3回は第63〜80号議案と認定第1〜4号。
    // 対象の全件と一致することを確かめる（取りこぼしと余剰の双方を検出する）。
    // 期待値は各会期のインベントリから導出する。
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
      "shinjuku-2026-r3-gian-63": "くらし・行財政",
      "shinjuku-2026-r3-gian-64": "くらし・行財政",
      "shinjuku-2026-r3-gian-65": "くらし・行財政",
      "shinjuku-2026-r3-gian-66": "くらし・行財政",
      "shinjuku-2026-r3-nintei-1": "くらし・行財政",
      "shinjuku-2026-r3-nintei-2": "くらし・行財政",
      "shinjuku-2026-r3-nintei-3": "くらし・行財政",
      "shinjuku-2026-r3-nintei-4": "くらし・行財政",
      "shinjuku-2026-r3-gian-67": "くらし・行財政",
      "shinjuku-2026-r3-gian-68": "多文化共生・手続き",
      "shinjuku-2026-r3-gian-69": "子育て・教育",
      "shinjuku-2026-r3-gian-70": "子育て・教育",
      "shinjuku-2026-r3-gian-71": "まちづくり・環境",
      "shinjuku-2026-r3-gian-72": "子育て・教育",
      "shinjuku-2026-r3-gian-73": "まちづくり・環境",
      "shinjuku-2026-r3-gian-74": "まちづくり・環境",
      "shinjuku-2026-r3-gian-75": "まちづくり・環境",
      "shinjuku-2026-r3-gian-76": "まちづくり・環境",
      "shinjuku-2026-r3-gian-77": "くらし・行財政",
      "shinjuku-2026-r3-gian-78": "くらし・行財政",
      "shinjuku-2026-r3-gian-79": "くらし・行財政",
      "shinjuku-2026-r3-gian-80": "くらし・行財政",
    });
  });

  it("タグ未設定の議案には bills_tags を作らない", () => {
    // 現在は第2回・第3回定例会の全件にタグを付けているため、インベントリだけを渡すと
    // 未設定の経路を一度も通らず、このテストが空振りする。
    // タグ表に無い議案を明示的に混ぜて、その議案に関連付けが作られないことを見る。
    const unmapped: SeededBillRef = {
      id: "00000000-0000-0000-0000-0000000000ff",
      name: "タグ表に無い議案",
      slug: "not-in-tag-map",
    };
    const billsTags = createBillsTags([...insertedBills, unmapped], insertedTags);

    expect(billsTags.some((bt) => bt.bill_id === unmapped.id)).toBe(false);
    // R8-2 の区長提出議案23件 + R8-3 の区長提出議案22件
    // （R8-2 の議員提出議案4件と R8-3 の議員提出議案2件は未分類）
    expect(billsTags).toHaveLength(23 + 22);
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
        bill_id: billBySlug("shinjuku-2026-r1-gian-1").id,
        faction_id: "kyosan-uuid",
      })
    );
    expect(against).toContainEqual(
      expect.objectContaining({
        bill_id: billBySlug("shinjuku-2026-r1-gian-1").id,
        faction_id: "inochi-uuid",
      })
    );
    expect(against).toContainEqual(
      expect.objectContaining({
        bill_id: billBySlug("shinjuku-2026-r2-gian-54").id,
        faction_id: "kyosan-uuid",
      })
    );
    // R8-1: 48件×8会派=384件 + R8-2: 27件×8会派=216件
    expect(stances).toHaveLength(384 + 216);
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
