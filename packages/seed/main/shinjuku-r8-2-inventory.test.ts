import { describe, expect, it } from "vitest";
import {
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

  it("インベントリは23件で、欠落・重複・想定外がゼロ", () => {
    expect(r8SecondSessionItems).toHaveLength(23);
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

  it("全23件の識別子が一意", () => {
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
  it("全件が全文PDF・概要PDF・一覧ページ・議決結果ページのURLを持つ", () => {
    for (const bill of toBillInserts()) {
      // コンテンツIDは9桁ゼロ埋め。桁落ちすると実在しないURLになる
      expect(bill.pdf_url).toMatch(OFFICIAL_PDF_URL);
      expect(bill.overview_pdf_url).toMatch(OFFICIAL_PDF_URL);
      expect(bill.source_page_url).toBe(R8_2_SUBMISSIONS_URL);
      expect(bill.decision_source_url).toBe(R8_2_DECISIONS_URL);
    }
  });

  it("全文PDFのURLが取得確認済みのURLと完全に一致する", () => {
    for (const source of r8SecondSessionItems) {
      const contentId = VERIFIED_FULL_TEXT_PDFS[source.officialLabel];
      expect(contentId, `未検証の案件: ${source.officialLabel}`).toBeDefined();
      expect(source.fullTextPdfUrl).toBe(
        `https://www.city.shinjuku.lg.jp/content/${contentId}.pdf`
      );
    }
  });

  it("全文PDFのURLは案件ごとに異なる", () => {
    expect(findDuplicates(r8SecondSessionItems.map((i) => i.fullTextPdfUrl))).toEqual(
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
  it("解説が未整備の案件は published にせず coming_soon とする", () => {
    for (const source of r8SecondSessionItems) {
      const bill = toBillInsert(source);
      if (source.hasPublishableContent) {
        expect(bill.publish_status).toBe("published");
        expect(bill.published_at).not.toBeNull();
      } else {
        expect(bill.publish_status).toBe("coming_soon");
        expect(bill.published_at).toBeNull();
      }
    }
  });

  it("全件がレビュー未完了として扱われる", () => {
    for (const bill of toBillInserts()) {
      expect(bill.is_review_completed).toBe(false);
    }
  });

  it("外部プレースホルダ画像をサムネイルに設定しない", () => {
    for (const bill of toBillInserts()) {
      expect(bill.thumbnail_url).toBeNull();
    }
  });

  it("公開時に使う published_at は会期末日であり、議決日時を推定しない", () => {
    expect(R8_2_PUBLISHED_AT).toBe("2026-06-19T00:00:00+09:00");
    expect(toBillInserts().every((bill) => bill.published_at === null)).toBe(
      true
    );
  });

  it("公開レビュー未了の全23件を coming_soon に留める", () => {
    // 全件が解説を持つが、公開レビュー担当が未確定のため published にしない。
    // 解説の件数だけで一括して公開へ切り替えないことを固定する。
    const published = toBillInserts().filter(
      (b) => b.publish_status === "published"
    );
    expect(published).toEqual([]);
  });

  it("承認第2号・第3号はいずれも coming_soon で、slug で区別できる", () => {
    // 件名が完全に一致する2件を、件数ではなく slug で区別できることを固定する。
    const shonin = toBillInserts().filter((b) =>
      b.slug?.startsWith("shinjuku-2026-r2-shonin-")
    );
    expect(
      shonin.map((b) => [b.slug, b.publish_status] as const).sort()
    ).toEqual([
      ["shinjuku-2026-r2-shonin-2", "coming_soon"],
      ["shinjuku-2026-r2-shonin-3", "coming_soon"],
    ]);
  });
});
