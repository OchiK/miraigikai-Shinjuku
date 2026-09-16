import { describe, expect, it } from "vitest";
import { type SeededBillRef, findBillBySlug, requireBillBySlug } from "./bill-ref";

// 承認第2号・承認第3号は件名が完全に同一。件名で突合すると取り違える。
const duplicateTitleBills: SeededBillRef[] = [
  {
    id: "id-shonin-2",
    name: "専決処分の承認について",
    slug: "shinjuku-2026-r2-shonin-2",
  },
  {
    id: "id-shonin-3",
    name: "専決処分の承認について",
    slug: "shinjuku-2026-r2-shonin-3",
  },
];

describe("findBillBySlug", () => {
  it("件名が重複していても slug で正しい議案を特定できる", () => {
    expect(findBillBySlug(duplicateTitleBills, "shinjuku-2026-r2-shonin-3")?.id).toBe(
      "id-shonin-3"
    );
    expect(findBillBySlug(duplicateTitleBills, "shinjuku-2026-r2-shonin-2")?.id).toBe(
      "id-shonin-2"
    );
  });

  it("件名での突合は一意に定まらないことを示す（回帰防止）", () => {
    const byName = duplicateTitleBills.filter(
      (b) => b.name === "専決処分の承認について"
    );
    expect(byName).toHaveLength(2);
  });

  it("該当が無ければ null", () => {
    expect(findBillBySlug(duplicateTitleBills, "shinjuku-2026-r2-gian-42")).toBeNull();
  });

  it("slug が重複していれば例外を投げる", () => {
    const collided: SeededBillRef[] = [
      { id: "a", name: "A", slug: "dup" },
      { id: "b", name: "B", slug: "dup" },
    ];
    expect(() => findBillBySlug(collided, "dup")).toThrow(/Ambiguous bill slug/);
  });

  it("slug が null の議案には一致しない", () => {
    const withNull: SeededBillRef[] = [{ id: "a", name: "A", slug: null }];
    expect(findBillBySlug(withNull, "shinjuku-2026-r2-gian-42")).toBeNull();
  });
});

describe("requireBillBySlug", () => {
  it("該当が無ければ例外を投げる", () => {
    expect(() => requireBillBySlug(duplicateTitleBills, "missing")).toThrow(
      /Bill not found for slug: missing/
    );
  });
});
