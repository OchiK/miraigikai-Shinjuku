import { describe, expect, it } from "vitest";
import { findDuplicates } from "./shinjuku-r8-2-inventory";
import {
  R8_3_ALL_LABELS,
  R8_3_COUNCIL_SESSION_URL,
  R8_3_COUNCILOR_BILL_LABELS,
  R8_3_OFFICIAL_LABELS,
  R8_3_SESSION,
  R8_3_SUBMISSIONS_URL,
  buildR8_3ItemKey,
  r8ThirdSessionItems,
  toR8_3BillInsert,
  toR8_3BillInserts,
} from "./shinjuku-r8-3-inventory";

/** 区長提出議案（提出議案一覧ページに載る22件） */
const mayorItems = r8ThirdSessionItems.filter(
  (item) => item.itemType !== "giin"
);

/** 議員提出議案（議会公式の会期ページに載る2件） */
const councilorItems = r8ThirdSessionItems.filter(
  (item) => item.itemType === "giin"
);

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

  it("公開レビュー済みの第3回定例会を現在の会期にする", () => {
    expect(R8_3_SESSION.is_active).toBe(true);
  });

  it("区長提出22件と議員提出2件の24件で過不足が無い", () => {
    const labels = r8ThirdSessionItems.map((i) => i.officialLabel);
    expect(labels).toHaveLength(24);
    expect([...labels].sort()).toEqual([...R8_3_ALL_LABELS].sort());
  });

  it("区長提出議案は提出議案一覧ページの22件と一致する", () => {
    const labels = mayorItems.map((i) => i.officialLabel);
    expect(labels).toHaveLength(22);
    expect([...labels].sort()).toEqual([...R8_3_OFFICIAL_LABELS].sort());
  });

  it("議員提出議案は会期ページ記載の第11・12号の2件で、件名は原文どおり", () => {
    expect(councilorItems.map((i) => i.officialLabel)).toEqual(
      R8_3_COUNCILOR_BILL_LABELS
    );
    expect(councilorItems.map((i) => i.officialTitle)).toEqual([
      "新宿区シルバーパス購入費助成金交付条例",
      "新宿区安心居住支援家賃の助成に関する条例",
    ]);
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
      const expected = {
        gian: `第${item.itemNumber}号議案`,
        nintei: `認定第${item.itemNumber}号`,
        giin: `議員提出議案第${item.itemNumber}号`,
      }[item.itemType];
      expect(item.officialLabel).toBe(expected);
    }
  });

  it("安定識別子は会期・種別・番号を含む", () => {
    expect(buildR8_3ItemKey({ itemType: "nintei", itemNumber: 1 })).toBe(
      "shinjuku-2026-r3-nintei-1"
    );
    expect(buildR8_3ItemKey({ itemType: "gian", itemNumber: 63 })).toBe(
      "shinjuku-2026-r3-gian-63"
    );
    expect(buildR8_3ItemKey({ itemType: "giin", itemNumber: 11 })).toBe(
      "shinjuku-2026-r3-giin-11"
    );
  });

  it("全文PDFは取得して確認したファイルを指す", () => {
    for (const item of mayorItems) {
      expect(item.fullTextPdfUrl).toMatch(OFFICIAL_PDF_URL);
      expect(item.fullTextPdfUrl).toBe(
        `https://www.city.shinjuku.lg.jp/content/${VERIFIED_FULL_TEXT_PDFS[item.officialLabel]}.pdf`
      );
    }
  });

  it("議員提出議案は会期ページに全文PDFが無いため null", () => {
    for (const item of councilorItems) {
      expect(item.fullTextPdfUrl).toBeNull();
    }
  });

  it("概要PDFは決算認定と議員提出議案だけが無く、ほかは公式PDFを指す", () => {
    for (const item of r8ThirdSessionItems) {
      if (item.itemType === "nintei" || item.itemType === "giin") {
        expect(item.overviewPdfUrl).toBeNull();
      } else {
        expect(item.overviewPdfUrl).toMatch(OFFICIAL_PDF_URL);
      }
    }
  });

  it("議決結果が未掲載のあいだは全件未議決", () => {
    for (const item of r8ThirdSessionItems) {
      expect(item.decision).toBeNull();
    }
  });

  it("区長提出議案の解説は公開レビュー済み", () => {
    for (const item of mayorItems) {
      expect(item.hasPublishableContent).toBe(true);
      expect(item.reviewCompleted).toBe(true);
    }
  });

  it("議員提出議案は解説未作成・レビュー未了", () => {
    for (const item of councilorItems) {
      expect(item.hasPublishableContent).toBe(false);
      expect(item.reviewCompleted).toBe(false);
    }
  });

  it("全24件を変換し、未議決の区長提出22件は submitted・published（レビュー済み）にする", () => {
    const bills = toR8_3BillInserts();

    expect(bills).toHaveLength(24);
    expect(bills.map((bill) => bill.slug)).toEqual(
      r8ThirdSessionItems.map(buildR8_3ItemKey)
    );
    const mayorBills = toR8_3BillInserts(mayorItems);
    expect(mayorBills).toHaveLength(22);
    for (const bill of mayorBills) {
      expect(bill).toMatchObject({
        status: "submitted",
        status_note: null,
        publish_status: "published",
        published_at: null,
        is_featured: false,
        is_review_completed: true,
        source_page_url: R8_3_SUBMISSIONS_URL,
        decision_source_url: null,
      });
    }
  });

  it("議員提出2件を coming_soon（レビュー未了）・会期ページ出典としてDB行へ変換する", () => {
    const bills = toR8_3BillInserts(councilorItems);

    expect(bills.map((bill) => bill.slug)).toEqual([
      "shinjuku-2026-r3-giin-11",
      "shinjuku-2026-r3-giin-12",
    ]);
    for (const bill of bills) {
      expect(bill).toMatchObject({
        status: "submitted",
        status_note: null,
        publish_status: "coming_soon",
        is_featured: false,
        is_review_completed: false,
        pdf_url: null,
        overview_pdf_url: null,
        source_page_url: R8_3_COUNCIL_SESSION_URL,
        decision_source_url: null,
      });
    }
  });

  it("議決結果が出た後は公式用語を status と status_note に反映できる", () => {
    const nintei = r8ThirdSessionItems.find(
      (item) => item.itemType === "nintei"
    );
    if (!nintei) throw new Error("認定案件がインベントリに無い");
    const approved = toR8_3BillInsert({
      ...r8ThirdSessionItems[0],
      decision: "原案可決",
    });
    const certified = toR8_3BillInsert({
      ...nintei,
      decision: "認定",
    });

    expect(approved).toMatchObject({
      status: "approved",
      status_note: "本会議で原案可決",
    });
    expect(certified).toMatchObject({
      status: "approved",
      status_note: "本会議で認定",
    });
  });
});
