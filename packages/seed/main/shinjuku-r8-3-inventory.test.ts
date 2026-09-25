import { describe, expect, it } from "vitest";
import { findDuplicates } from "./shinjuku-r8-2-inventory";
import {
  R8_3_OFFICIAL_LABELS,
  R8_3_SESSION,
  R8_3_SUBMISSIONS_URL,
  buildR8_3ItemKey,
  r8ThirdSessionItems,
} from "./shinjuku-r8-3-inventory";

/** 公式PDFのURL形式。コンテンツIDは必ず9桁ゼロ埋め。 */
const OFFICIAL_PDF_URL =
  /^https:\/\/www\.city\.shinjuku\.lg\.jp\/content\/\d{9}\.pdf$/;

/**
 * 実際に取得して1ページ目の識別名・件名を確認済みの全文PDF（案件識別名 → コンテンツID）。
 * 2026-09-26 取得。
 */
const VERIFIED_FULL_TEXT_PDFS: Record<string, string> = {
  第63号議案: "000466336",
  第64号議案: "000466337",
  第65号議案: "000466338",
  第66号議案: "000466339",
  認定第1号: "000466361",
  認定第2号: "000466362",
  認定第3号: "000466363",
  認定第4号: "000466364",
  第67号議案: "000466368",
  第68号議案: "000466369",
  第69号議案: "000466370",
  第70号議案: "000466371",
  第71号議案: "000466374",
  第72号議案: "000466375",
  第73号議案: "000466376",
  第74号議案: "000466377",
  第75号議案: "000466378",
  第76号議案: "000466379",
  第77号議案: "000466380",
  第78号議案: "000466381",
  第79号議案: "000466382",
  第80号議案: "000466383",
};

describe("令和8年第3回定例会インベントリ", () => {
  it("会期は公式ページ記載の「会期：9月16日～10月15日」", () => {
    expect(R8_3_SESSION).toMatchObject({
      slug: "r8-3",
      council_url: R8_3_SUBMISSIONS_URL,
      start_date: "2026-09-16",
      end_date: "2026-10-15",
    });
  });

  it("DB投入と会期の切り替えを決めるまで、現在の会期にしない", () => {
    expect(R8_3_SESSION.is_active).toBe(false);
  });

  it("提出議案一覧ページの22件と過不足なく一致する", () => {
    const labels = r8ThirdSessionItems.map((i) => i.officialLabel);
    expect(labels).toHaveLength(22);
    expect([...labels].sort()).toEqual([...R8_3_OFFICIAL_LABELS].sort());
  });

  it("識別名・安定識別子に重複が無い", () => {
    expect(
      findDuplicates(r8ThirdSessionItems.map((i) => i.officialLabel))
    ).toEqual([]);
    expect(findDuplicates(r8ThirdSessionItems.map(buildR8_3ItemKey))).toEqual(
      []
    );
  });

  it("識別名は種別と番号から組み立てた形と一致する", () => {
    for (const item of r8ThirdSessionItems) {
      expect(item.officialLabel).toBe(
        item.itemType === "gian"
          ? `第${item.itemNumber}号議案`
          : `認定第${item.itemNumber}号`
      );
    }
  });

  it("安定識別子は会期・種別・番号を含む", () => {
    expect(buildR8_3ItemKey({ itemType: "nintei", itemNumber: 1 })).toBe(
      "shinjuku-2026-r3-nintei-1"
    );
    expect(buildR8_3ItemKey({ itemType: "gian", itemNumber: 63 })).toBe(
      "shinjuku-2026-r3-gian-63"
    );
  });

  it("全文PDFは取得して確認したファイルを指す", () => {
    for (const item of r8ThirdSessionItems) {
      expect(item.fullTextPdfUrl).toMatch(OFFICIAL_PDF_URL);
      expect(item.fullTextPdfUrl).toBe(
        `https://www.city.shinjuku.lg.jp/content/${VERIFIED_FULL_TEXT_PDFS[item.officialLabel]}.pdf`
      );
    }
  });

  it("概要PDFは決算認定だけが無く、ほかは公式PDFを指す", () => {
    for (const item of r8ThirdSessionItems) {
      if (item.itemType === "nintei") {
        expect(item.overviewPdfUrl).toBeNull();
      } else {
        expect(item.overviewPdfUrl).toMatch(OFFICIAL_PDF_URL);
      }
    }
  });

  it("議決結果が未掲載のあいだは全件未議決・非公開・未レビュー", () => {
    for (const item of r8ThirdSessionItems) {
      expect(item.decision).toBeNull();
      expect(item.hasPublishableContent).toBe(false);
      expect(item.reviewCompleted).toBe(false);
    }
  });
});
