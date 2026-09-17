import { describe, expect, it } from "vitest";
import { pickBillContent, pickBillContentsForBills } from "./pick-bill-content";

const easy = { difficulty_level: "easy" as const, title: "やさしい" };
const normal = { difficulty_level: "normal" as const, title: "ふつう" };
const hard = { difficulty_level: "hard" as const, title: "くわしく" };

describe("pickBillContent", () => {
  it("希望した難易度の版があればそれを返す", () => {
    expect(pickBillContent([easy, normal, hard], "easy")).toBe(easy);
    expect(pickBillContent([easy, normal, hard], "hard")).toBe(hard);
  });

  it("希望した難易度が無ければ ふつう にフォールバックする", () => {
    expect(pickBillContent([normal, hard], "easy")).toBe(normal);
  });

  it("希望した難易度も ふつう も無ければ null を返す", () => {
    expect(pickBillContent([hard], "easy")).toBeNull();
  });

  it("空配列・null・undefined は null を返す", () => {
    expect(pickBillContent([], "normal")).toBeNull();
    expect(pickBillContent(null, "normal")).toBeNull();
    expect(pickBillContent(undefined, "normal")).toBeNull();
  });

  it("ふつう を希望した場合にフォールバックと同じ版を返す", () => {
    expect(pickBillContent([normal, hard], "normal")).toBe(normal);
  });
});

describe("pickBillContentsForBills", () => {
  it("各議案のコンテンツを1件に絞り込む", () => {
    const bills = [
      { id: "1", bill_contents: [easy, normal] },
      { id: "2", bill_contents: [normal, hard] },
    ];

    const result = pickBillContentsForBills(bills, "easy");

    expect(result).toHaveLength(2);
    // やさしい版がある議案はやさしい版、無い議案はふつう版
    expect(result[0].bill_contents).toEqual([easy]);
    expect(result[1].bill_contents).toEqual([normal]);
  });

  it("表示できるコンテンツが無い議案は一覧から除外する", () => {
    const bills = [
      { id: "1", bill_contents: [normal] },
      { id: "2", bill_contents: [hard] },
    ];

    const result = pickBillContentsForBills(bills, "easy");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("元の配列を変更しない", () => {
    const bills = [{ id: "1", bill_contents: [easy, normal] }];

    pickBillContentsForBills(bills, "easy");

    expect(bills[0].bill_contents).toHaveLength(2);
  });
});
