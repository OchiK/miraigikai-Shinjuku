import { describe, expect, it } from "vitest";
import { getFeaturedBillLayout } from "./featured-bill-layout";

const layoutsFor = (total: number) =>
  Array.from({ length: total }, (_, i) => getFeaturedBillLayout(i, total));

describe("getFeaturedBillLayout", () => {
  it("1件なら全幅の主役カードにする", () => {
    expect(layoutsFor(1)).toEqual([{ isLead: true, spansFullRow: true }]);
  });

  it("2件なら2カラムで均等に並べ、主役は作らない", () => {
    expect(layoutsFor(2)).toEqual([
      { isLead: false, spansFullRow: false },
      { isLead: false, spansFullRow: false },
    ]);
  });

  it("3件なら先頭を主役にし、残り2件を2カラムで並べる", () => {
    expect(layoutsFor(3)).toEqual([
      { isLead: true, spansFullRow: true },
      { isLead: false, spansFullRow: false },
      { isLead: false, spansFullRow: false },
    ]);
  });

  it("4件なら残りが奇数になるので最後の1件を全幅にする", () => {
    expect(layoutsFor(4)).toEqual([
      { isLead: true, spansFullRow: true },
      { isLead: false, spansFullRow: false },
      { isLead: false, spansFullRow: false },
      { isLead: false, spansFullRow: true },
    ]);
  });

  it("5件なら残り4件を2カラムで埋める", () => {
    expect(layoutsFor(5).map((l) => l.spansFullRow)).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
  });
});
