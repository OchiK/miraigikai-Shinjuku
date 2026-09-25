import { describe, expect, it } from "vitest";
import { COMMITTEE_REFERRAL_OMITTED_NOTE } from "@mirai-gikai/shared/bills/decision-label";
import {
  R8_2_ALL_LABELS,
  R8_2_COUNCIL_RESOLUTIONS_URL,
  R8_2_COUNCIL_RESULTS_PDF,
  R8_2_COUNCIL_SESSION_URL,
  R8_2_COUNCILOR_BILL_LABELS,
  R8_2_DECISIONS_URL,
  R8_2_OFFICIAL_LABELS,
  R8_2_PUBLISHED_AT,
  R8_2_SESSION,
  R8_2_SUBMISSIONS_URL,
  type ShinjukuSessionItem,
  buildItemKey,
  findDuplicates,
  r8SecondSessionItems,
  reconcileInventory,
  toBillInsert,
  toBillInserts,
  toBillStatus,
} from "./shinjuku-r8-2-inventory";

/** 公式PDFのURL形式。コンテンツIDは必ず9桁ゼロ埋め。 */
const OFFICIAL_PDF_URL =
  /^https:\/\/www\.city\.shinjuku\.lg\.jp\/content\/\d{9}\.pdf$/;

/**
 * 実際に取得して中身を確認済みの全文PDF URL（案件識別名 → URL）。
 * 取得記録: docs/20260916_1400_令和8年第2回定例会_公式突合記録.md
 */
const VERIFIED_FULL_TEXT_PDFS: Record<string, string> = {
  "承認第2号": "000457641",
  "承認第3号": "000457642",
  "第42号議案": "000457639",
  "第43号議案": "000457640",
  "第44号議案": "000457643",
  "第45号議案": "000457644",
  "第46号議案": "000457645",
  "第47号議案": "000457646",
  "第48号議案": "000457647",
  "第49号議案": "000457648",
  "第50号議案": "000457649",
  "第51号議案": "000457650",
  "第52号議案": "000457651",
  "第53号議案": "000457652",
  "第54号議案": "000457653",
  "第55号議案": "000457654",
  "第56号議案": "000457655",
  "第57号議案": "000457656",
  "第58号議案": "000457657",
  "第59号議案": "000457658",
  "第60号議案": "000457659",
  "第61号議案": "000458535",
  "第62号議案": "000458536",
};

/** 区長提出議案（承認・議案）。全文PDF・提出議案一覧ページを持つ */
const wardItems = r8SecondSessionItems.filter((i) => i.itemType !== "giin");
/** 議員提出議案 */
const councilorItems = r8SecondSessionItems.filter((i) => i.itemType === "giin");
const councilorSlugs = new Set(councilorItems.map(buildItemKey));
const isWardBill = (bill: { slug?: string | null }) =>
  !councilorSlugs.has(bill.slug ?? "");

const item = (slug: string): ShinjukuSessionItem => {
  const found = r8SecondSessionItems.find((i) => buildItemKey(i) === slug);
  if (!found) throw new Error(`fixture missing: ${slug}`);
  return found;
};

describe("会期メタデータ", () => {
  it("公式ページ記載の会期（6月10日〜6月19日）と一致する", () => {
    expect(R8_2_SESSION.start_date).toBe("2026-06-10");
    expect(R8_2_SESSION.end_date).toBe("2026-06-19");
  });

  it("出典として公式の提出議案ページを保持する", () => {
    expect(R8_2_SESSION.council_url).toBe(R8_2_SUBMISSIONS_URL);
  });
});

describe("公式一覧との突合", () => {
  it("公式一覧は承認2件＋第42〜62号議案の21件で計23件", () => {
    expect(R8_2_OFFICIAL_LABELS).toHaveLength(23);
    expect(R8_2_OFFICIAL_LABELS).toContain("承認第2号");
    expect(R8_2_OFFICIAL_LABELS).toContain("承認第3号");
    expect(R8_2_OFFICIAL_LABELS).toContain("第42号議案");
    expect(R8_2_OFFICIAL_LABELS).toContain("第62号議案");
  });

  it("議会公式ページの議員提出議案は第7〜10号の4件", () => {
    expect(R8_2_COUNCILOR_BILL_LABELS).toEqual([
      "議員提出議案第7号",
      "議員提出議案第8号",
      "議員提出議案第9号",
      "議員提出議案第10号",
    ]);
    expect(R8_2_ALL_LABELS).toHaveLength(27);
  });

  it("インベントリは区長提出23件＋議員提出4件の27件で、欠落・重複・想定外がゼロ", () => {
    expect(wardItems).toHaveLength(23);
    expect(councilorItems).toHaveLength(4);
    expect(reconcileInventory()).toEqual({
      missing: [],
      unexpected: [],
      duplicatedLabels: [],
      duplicatedKeys: [],
    });
  });

  it("欠落を検出できる", () => {
    const result = reconcileInventory(
      r8SecondSessionItems.filter((i) => i.officialLabel !== "第55号議案")
    );
    expect(result.missing).toEqual(["第55号議案"]);
  });

  it("重複を検出できる", () => {
    const duplicated = [...r8SecondSessionItems, item("shinjuku-2026-r2-gian-42")];
    const result = reconcileInventory(duplicated);
    expect(result.duplicatedLabels).toEqual(["第42号議案"]);
    expect(result.duplicatedKeys).toEqual(["shinjuku-2026-r2-gian-42"]);
  });

  it("公式一覧に無い案件を検出できる", () => {
    const extra: ShinjukuSessionItem = {
      ...item("shinjuku-2026-r2-gian-42"),
      itemNumber: 99,
      officialLabel: "第99号議案",
    };
    expect(reconcileInventory([...r8SecondSessionItems, extra]).unexpected).toEqual(
      ["第99号議案"]
    );
  });
});

describe("安定識別子", () => {
  it("西暦・会期・案件種別・番号を含む", () => {
    expect(buildItemKey({ itemType: "gian", itemNumber: 42 })).toBe(
      "shinjuku-2026-r2-gian-42"
    );
    expect(buildItemKey({ itemType: "shonin", itemNumber: 2 })).toBe(
      "shinjuku-2026-r2-shonin-2"
    );
  });

  it("件名が同一の承認第2号・第3号にも別々の識別子が割り当たる", () => {
    const shonin = r8SecondSessionItems.filter((i) => i.itemType === "shonin");
    expect(shonin).toHaveLength(2);
    expect(new Set(shonin.map((i) => i.officialTitle)).size).toBe(1);
    expect(new Set(shonin.map(buildItemKey)).size).toBe(2);
  });

  it("議員提出議案は giin の識別子を持つ", () => {
    expect(buildItemKey({ itemType: "giin", itemNumber: 7 })).toBe(
      "shinjuku-2026-r2-giin-7"
    );
  });

  it("全27件の識別子が一意", () => {
    expect(findDuplicates(r8SecondSessionItems.map(buildItemKey))).toEqual([]);
  });
});

describe("議決結果", () => {
  it("議案は原案可決、承認案件は承認として区別される", () => {
    const byType = (t: ShinjukuSessionItem["itemType"]) =>
      new Set(
        r8SecondSessionItems.filter((i) => i.itemType === t).map((i) => i.decision)
      );
    expect(byType("gian")).toEqual(new Set(["原案可決"]));
    expect(byType("shonin")).toEqual(new Set(["承認"]));
  });

  it("議員提出議案は、条例2件が否決、意見書2件が原案可決", () => {
    expect(
      councilorItems.map((i) => [i.officialLabel, i.decision])
    ).toEqual([
      ["議員提出議案第7号", "否決"],
      ["議員提出議案第8号", "否決"],
      ["議員提出議案第9号", "原案可決"],
      ["議員提出議案第10号", "原案可決"],
    ]);
  });

  it("否決は rejected として status_note に否決と残す", () => {
    expect(toBillStatus("否決")).toEqual({
      status: "rejected",
      statusNote: "本会議で否決",
    });
  });

  it("委員会付託を省略した案件は、status_note にその旨を残す", () => {
    expect(
      toBillStatus("原案可決", { committeeReferralOmitted: true })
    ).toEqual({
      status: "approved",
      statusNote: `${COMMITTEE_REFERRAL_OMITTED_NOTE}本会議で原案可決`,
    });
    // 付託を省略したのは意見書2件（第9・10号）だけ
    expect(
      r8SecondSessionItems
        .filter((i) => i.committeeReferralOmitted)
        .map((i) => i.officialLabel)
    ).toEqual(["議員提出議案第9号", "議員提出議案第10号"]);
  });

  it("議決用語が status_note に反映される", () => {
    expect(toBillStatus("原案可決")).toEqual({
      status: "approved",
      statusNote: "本会議で原案可決",
    });
    expect(toBillStatus("承認")).toEqual({
      status: "approved",
      statusNote: "本会議で承認",
    });
  });
});

describe("出典", () => {
  it("区長提出議案は全文PDF・概要PDF・一覧ページ・議決結果ページのURLを持つ", () => {
    for (const bill of toBillInserts().filter(isWardBill)) {
      // コンテンツIDは9桁ゼロ埋め。桁落ちすると実在しないURLになる
      expect(bill.pdf_url).toMatch(OFFICIAL_PDF_URL);
      expect(bill.overview_pdf_url).toMatch(OFFICIAL_PDF_URL);
      expect(bill.source_page_url).toBe(R8_2_SUBMISSIONS_URL);
      expect(bill.decision_source_url).toBe(R8_2_DECISIONS_URL);
    }
  });

  it("議員提出議案は議会公式の「議案の概要と審議結果」を概要・議決結果の出典にする", () => {
    for (const bill of toBillInserts().filter((b) => !isWardBill(b))) {
      expect(bill.overview_pdf_url).toBe(R8_2_COUNCIL_RESULTS_PDF);
      expect(bill.decision_source_url).toBe(R8_2_COUNCIL_RESULTS_PDF);
    }
  });

  it("否決された条例案（第7・8号）は全文PDFを持たず、会期ページを出典にする", () => {
    // 全文はオンラインで公開されていない（会議録は「巻末議案の部参照」とだけ記す）
    for (const n of [7, 8]) {
      const bill = toBillInsert(item(`shinjuku-2026-r2-giin-${n}`));
      expect(bill.pdf_url).toBeNull();
      expect(bill.source_page_url).toBe(R8_2_COUNCIL_SESSION_URL);
    }
  });

  it("可決した意見書（第9・10号）は「決議・意見書」ページの全文PDFを持つ", () => {
    const expected: Record<number, string> = { 9: "000459264", 10: "000459265" };
    for (const n of [9, 10]) {
      const bill = toBillInsert(item(`shinjuku-2026-r2-giin-${n}`));
      expect(bill.pdf_url).toBe(
        `https://www.city.shinjuku.lg.jp/content/${expected[n]}.pdf`
      );
      expect(bill.source_page_url).toBe(R8_2_COUNCIL_RESOLUTIONS_URL);
    }
  });

  it("全文PDFのURLが取得確認済みのURLと完全に一致する", () => {
    for (const source of wardItems) {
      const contentId = VERIFIED_FULL_TEXT_PDFS[source.officialLabel];
      expect(contentId, `未検証の案件: ${source.officialLabel}`).toBeDefined();
      expect(source.fullTextPdfUrl).toBe(
        `https://www.city.shinjuku.lg.jp/content/${contentId}.pdf`
      );
    }
  });

  it("全文PDFのURLは案件ごとに異なる", () => {
    expect(findDuplicates(wardItems.map((i) => i.fullTextPdfUrl))).toEqual(
      []
    );
  });

  it("補正予算は各号専用の概要PDFを参照する", () => {
    expect(item("shinjuku-2026-r2-gian-42").overviewPdfUrl).toBe(
      "https://www.city.shinjuku.lg.jp/content/000456354.pdf"
    );
    expect(item("shinjuku-2026-r2-gian-43").overviewPdfUrl).toBe(
      "https://www.city.shinjuku.lg.jp/content/000456355.pdf"
    );
  });

  it("追加提出の第61・62号議案は追加分の概要PDFを参照する", () => {
    for (const n of [61, 62]) {
      expect(item(`shinjuku-2026-r2-gian-${n}`).overviewPdfUrl).toBe(
        "https://www.city.shinjuku.lg.jp/content/000458106.pdf"
      );
    }
  });
});

describe("公開可否", () => {
  it("区長提出議案23件を published として会期末日に公開する", () => {
    const bills = toBillInserts().filter(isWardBill);

    expect(bills).toHaveLength(23);
    expect(bills.every((bill) => bill.publish_status === "published")).toBe(
      true
    );
    expect(
      bills.every((bill) => bill.published_at === R8_2_PUBLISHED_AT)
    ).toBe(true);
  });

  it("区長提出議案23件をレビュー完了として扱う", () => {
    for (const bill of toBillInserts().filter(isWardBill)) {
      expect(bill.is_review_completed).toBe(true);
    }
  });

  it("公開レビュー未了の案件は coming_soon に留める", () => {
    // 令和8年第2回定例会は全件が公開済みだが、次の会期の案件は
    // hasPublishableContent: false から始まる。
    // 未公開側の分岐が壊れても全件 published のテストでは気づけないため、
    // フォールバックをここで押さえる。
    const bill = toBillInsert({
      ...r8SecondSessionItems[0],
      hasPublishableContent: false,
    });

    expect(bill.publish_status).toBe("coming_soon");
    expect(bill.published_at).toBeNull();
    expect(bill.is_review_completed).toBe(false);
  });

  it("外部プレースホルダ画像をサムネイルに設定しない", () => {
    for (const bill of toBillInserts()) {
      expect(bill.thumbnail_url).toBeNull();
    }
  });

  it("公開時に使う published_at は会期末日であり、議決日時を推定しない", () => {
    expect(R8_2_PUBLISHED_AT).toBe("2026-06-19T00:00:00+09:00");
    expect(
      toBillInserts()
        .filter(isWardBill)
        .every((bill) => bill.published_at === R8_2_PUBLISHED_AT)
    ).toBe(true);
  });

  it("coming_soon は解説がまだ無い議員提出議案4件だけ", () => {
    expect(
      toBillInserts()
        .filter((b) => b.publish_status === "coming_soon")
        .map((b) => b.bill_number)
    ).toEqual(R8_2_COUNCILOR_BILL_LABELS);
  });

  it("承認第2号・第3号はいずれも published で、slug で区別できる", () => {
    // 件名が完全に一致する2件を、件数ではなく slug で区別できることを固定する。
    const shonin = toBillInserts().filter((b) =>
      b.slug?.startsWith("shinjuku-2026-r2-shonin-")
    );
    expect(
      shonin.map((b) => [b.slug, b.publish_status] as const).sort()
    ).toEqual([
      ["shinjuku-2026-r2-shonin-2", "published"],
      ["shinjuku-2026-r2-shonin-3", "published"],
    ]);
  });
});
