import { describe, expect, it } from "vitest";
import { findDuplicates } from "./shinjuku-r8-2-inventory";
import {
  R8_1_ALL_LABELS,
  R8_1_COUNCIL_RESOLUTIONS_URL,
  R8_1_COUNCIL_RESULTS_PDF,
  R8_1_COUNCIL_SESSION_URL,
  R8_1_DECISIONS_URL,
  R8_1_OFFICIAL_LABELS,
  R8_1_SESSION,
  R8_1_SUBMISSIONS_URL,
  buildR8_1ItemKey,
  r8FirstSessionItems,
  r8_1GianKey,
  r8_1GiinKey,
  r8_1ShoninKey,
  toR8_1BillInsert,
  toR8_1BillInserts,
} from "./shinjuku-r8-1-inventory";

/** 公式のPDF URL形式。コンテンツIDは必ず9桁ゼロ埋め。 */
const OFFICIAL_PDF_URL =
  /^https:\/\/www\.city\.shinjuku\.lg\.jp\/content\/\d{9}\.pdf$/;

/**
 * 提出議案一覧ページのリンクから直接取り出した全文PDF（識別名 → コンテンツID）。
 * 2026-10-03 取得。インベントリとは別に転記し、写し間違いを検出する。
 */
const PAGE_FULL_TEXT_PDFS: Record<string, string> = {
  第1号議案: "000448420",
  第2号議案: "000448412",
  第3号議案: "000448413",
  第4号議案: "000448488",
  第5号議案: "000448415",
  第6号議案: "000448416",
  第7号議案: "000448417",
  第8号議案: "000448418",
  第9号議案: "000448419",
  第37号議案: "000451609",
  第38号議案: "000451610",
  第39号議案: "000451611",
  第40号議案: "000451612",
  第10号議案: "000448426",
  第11号議案: "000448427",
  第12号議案: "000448428",
  第13号議案: "000448429",
  第14号議案: "000448430",
  第15号議案: "000448431",
  第16号議案: "000448432",
  第17号議案: "000448433",
  第18号議案: "000448434",
  第19号議案: "000448435",
  第20号議案: "000448436",
  第21号議案: "000448437",
  第22号議案: "000448438",
  第23号議案: "000448439",
  第24号議案: "000448440",
  第25号議案: "000448441",
  第26号議案: "000448442",
  第27号議案: "000448443",
  第28号議案: "000448444",
  第29号議案: "000448445",
  第30号議案: "000448446",
  第31号議案: "000448447",
  第32号議案: "000448448",
  第33号議案: "000448421",
  第34号議案: "000448422",
  第35号議案: "000448423",
  第36号議案: "000448424",
  承認第1号: "000448425",
  第41号議案: "000451614",
};

/** 区長提出議案（提出議案一覧ページに載る42件）。議員提出議案は別に検証する */
const mayorItems = r8FirstSessionItems.filter((i) => i.itemType !== "giin");
const giinItems = r8FirstSessionItems.filter((i) => i.itemType === "giin");

describe("令和8年第1回定例会インベントリ", () => {
  it("会期は公式ページ記載の「会期：2月17日～3月24日」", () => {
    expect(R8_1_SESSION.slug).toBe("r8-1");
    expect(R8_1_SESSION.name).toBe("令和8年 第1回定例会");
    expect(R8_1_SESSION.start_date).toBe("2026-02-17");
    expect(R8_1_SESSION.end_date).toBe("2026-03-24");
    expect(R8_1_SESSION.is_active).toBe(false);
    expect(R8_1_SESSION.council_url).toBe(R8_1_SUBMISSIONS_URL);
  });

  it("全48件（議案41件 + 承認1件 + 議員提出議案6件）を収録する", () => {
    expect(r8FirstSessionItems).toHaveLength(48);
    expect(r8FirstSessionItems.filter((i) => i.itemType === "gian")).toHaveLength(41);
    expect(r8FirstSessionItems.filter((i) => i.itemType === "shonin")).toHaveLength(1);
    expect(giinItems).toHaveLength(6);
    expect(mayorItems).toHaveLength(42);
  });

  it("識別名は公式一覧と過不足なく一致し、重複しない", () => {
    const labels = r8FirstSessionItems.map((i) => i.officialLabel);
    expect(findDuplicates(labels)).toEqual([]);
    expect([...labels].sort()).toEqual([...R8_1_ALL_LABELS].sort());
    expect(mayorItems.map((i) => i.officialLabel).sort()).toEqual(
      [...R8_1_OFFICIAL_LABELS].sort()
    );
    expect(Object.keys(PAGE_FULL_TEXT_PDFS).sort()).toEqual(
      [...R8_1_OFFICIAL_LABELS].sort()
    );
  });

  it("識別名は種別と番号から決まる", () => {
    const expectedLabel = {
      gian: (n: number) => `第${n}号議案`,
      shonin: (n: number) => `承認第${n}号`,
      giin: (n: number) => `議員提出議案第${n}号`,
    };
    for (const item of r8FirstSessionItems) {
      expect(item.officialLabel).toBe(expectedLabel[item.itemType](item.itemNumber));
    }
  });

  it("slug は48件すべて異なる", () => {
    const keys = r8FirstSessionItems.map(buildR8_1ItemKey);
    expect(findDuplicates(keys)).toEqual([]);
    expect(new Set(keys).size).toBe(48);
    expect(r8_1GianKey(37)).toBe("shinjuku-2026-r1-gian-37");
    expect(r8_1ShoninKey(1)).toBe("shinjuku-2026-r1-shonin-1");
    expect(r8_1GiinKey(6)).toBe("shinjuku-2026-r1-giin-6");
  });

  it("全文PDFは9桁ゼロ埋めの公式URLで、公式一覧のリンクと一致する", () => {
    for (const item of mayorItems) {
      expect(item.fullTextPdfUrl, item.officialLabel).toMatch(OFFICIAL_PDF_URL);
      expect(item.fullTextPdfUrl, item.officialLabel).toBe(
        `https://www.city.shinjuku.lg.jp/content/${PAGE_FULL_TEXT_PDFS[item.officialLabel]}.pdf`
      );
    }
    expect(
      findDuplicates(mayorItems.map((i) => i.fullTextPdfUrl))
    ).toEqual([]);
  });

  it("概要PDFは当初予算の4件だけ null で、ほかは公式URL", () => {
    const withoutOverview = mayorItems
      .filter((i) => i.overviewPdfUrl === null)
      .map((i) => i.officialLabel);
    expect(withoutOverview).toEqual([
      "第1号議案",
      "第2号議案",
      "第3号議案",
      "第4号議案",
    ]);
    for (const item of mayorItems) {
      if (item.overviewPdfUrl !== null) {
        expect(item.overviewPdfUrl, item.officialLabel).toMatch(OFFICIAL_PDF_URL);
      }
    }
  });

  it("概要PDFは収録された案件に対応する", () => {
    const overviewOf = (label: string) =>
      r8FirstSessionItems.find((i) => i.officialLabel === label)?.overviewPdfUrl;
    const url = (id: string) => `https://www.city.shinjuku.lg.jp/content/${id}.pdf`;
    expect(overviewOf("第5号議案")).toBe(url("000447772"));
    for (const n of [6, 7, 8, 9]) {
      expect(overviewOf(`第${n}号議案`)).toBe(url("000447773"));
    }
    for (let n = 10; n <= 36; n++) {
      expect(overviewOf(`第${n}号議案`), `第${n}号議案`).toBe(url("000447774"));
    }
    expect(overviewOf("承認第1号")).toBe(url("000448541"));
    for (const n of [37, 38, 39]) {
      expect(overviewOf(`第${n}号議案`)).toBe(url("000451608"));
    }
    expect(overviewOf("第40号議案")).toBe(url("000450968"));
    expect(overviewOf("第41号議案")).toBe(url("000450970"));
  });

  it("議決結果は第1〜41号議案が「原案可決」、承認第1号が「承認」", () => {
    for (const item of mayorItems) {
      expect(item.decision, item.officialLabel).toBe(
        item.itemType === "shonin" ? "承認" : "原案可決"
      );
    }
    expect(mayorItems.filter((i) => i.decision === "原案可決")).toHaveLength(41);
    expect(mayorItems.filter((i) => i.decision === "承認")).toHaveLength(1);
  });

  it("議員提出議案は第1〜5号が否決（全文PDFなし）、第6号が原案可決（意見書PDFあり）", () => {
    expect(giinItems.map((i) => i.itemNumber)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const item of giinItems.filter((i) => i.itemNumber <= 5)) {
      expect(item.decision, item.officialLabel).toBe("否決");
      expect(item.fullTextPdfUrl, item.officialLabel).toBeNull();
      expect(item.sourcePageUrl, item.officialLabel).toBe(R8_1_COUNCIL_SESSION_URL);
    }
    const sixth = giinItems[5];
    expect(sixth.decision).toBe("原案可決");
    expect(sixth.fullTextPdfUrl).toBe(
      "https://www.city.shinjuku.lg.jp/content/000452351.pdf"
    );
    expect(sixth.sourcePageUrl).toBe(R8_1_COUNCIL_RESOLUTIONS_URL);
    for (const item of giinItems) {
      expect(item.overviewPdfUrl, item.officialLabel).toBe(R8_1_COUNCIL_RESULTS_PDF);
      expect(item.hasPublishableContent).toBe(false);
      expect(item.reviewCompleted).toBe(false);
    }
  });

  it("議員提出議案の件名は議会公式ページの記載どおり", () => {
    expect(giinItems.map((i) => i.officialTitle)).toEqual([
      "新宿区介護・福祉人材緊急確保・定着奨励金の支給に関する条例",
      "新宿区保健事業の利用に係る使用料等を定める条例を廃止する条例",
      "新宿区安心居住支援家賃の助成に関する条例",
      "新宿区立学校における学用品の給付に関する条例",
      "新宿区立学校における修学旅行費の無償化に関する条例",
      "住民の居住環境保護と適正な民泊運営の実現に向けた制度見直しに関する意見書",
    ]);
  });

  it("件名が重複するのは承認案件の仕様であり、第1回定例会の承認は1件だけ", () => {
    const titles = r8FirstSessionItems.map((i) => i.officialTitle);
    expect(findDuplicates(titles)).toEqual([]);
    expect(
      r8FirstSessionItems.filter((i) => i.officialTitle === "専決処分の承認について")
    ).toHaveLength(1);
  });
});

describe("toR8_1BillInserts", () => {
  const inserts = toR8_1BillInserts();

  it("インベントリと同じ順序・件数で48件を返す", () => {
    expect(inserts).toHaveLength(48);
    expect(inserts.map((b) => b.slug)).toEqual(
      r8FirstSessionItems.map(buildR8_1ItemKey)
    );
  });

  it("全件 coming_soon・レビュー未完了・掲載日時なしで登録する", () => {
    for (const bill of inserts) {
      expect(bill.publish_status, bill.slug ?? "").toBe("coming_soon");
      expect(bill.is_review_completed, bill.slug ?? "").toBe(false);
      expect(bill.published_at, bill.slug ?? "").toBeNull();
      expect(bill.is_featured, bill.slug ?? "").toBe(false);
    }
  });

  it("区長提出議案の出典URLは提出議案一覧・議決結果の公式ページを指す", () => {
    const mayorInserts = inserts.filter(
      (b) => !(b.slug ?? "").includes("-giin-")
    );
    expect(mayorInserts).toHaveLength(42);
    for (const bill of mayorInserts) {
      expect(bill.source_page_url).toBe(R8_1_SUBMISSIONS_URL);
      expect(bill.decision_source_url).toBe(R8_1_DECISIONS_URL);
    }
  });

  it("議員提出議案の出典URLは議会公式ページ・議案の概要と審議結果PDFを指す", () => {
    for (let n = 1; n <= 6; n++) {
      const bill = inserts.find((b) => b.slug === r8_1GiinKey(n));
      expect(bill?.bill_number).toBe(`議員提出議案第${n}号`);
      expect(bill?.source_page_url).toBe(
        n === 6 ? R8_1_COUNCIL_RESOLUTIONS_URL : R8_1_COUNCIL_SESSION_URL
      );
      expect(bill?.decision_source_url).toBe(R8_1_COUNCIL_RESULTS_PDF);
      expect(bill?.overview_pdf_url).toBe(R8_1_COUNCIL_RESULTS_PDF);
      expect(bill?.pdf_url).toBe(
        n === 6 ? "https://www.city.shinjuku.lg.jp/content/000452351.pdf" : null
      );
    }
  });

  it("議決結果を status / status_note に対応付ける", () => {
    const gian = toR8_1BillInsert(r8FirstSessionItems[0]);
    expect(gian.status).toBe("approved");
    expect(gian.status_note).toBe("本会議で原案可決");

    const shonin = inserts.find((b) => b.slug === r8_1ShoninKey(1));
    expect(shonin?.bill_number).toBe("承認第1号");
    expect(shonin?.status).toBe("approved");
    expect(shonin?.status_note).toBe("本会議で承認");

    const rejected = inserts.find((b) => b.slug === r8_1GiinKey(1));
    expect(rejected?.status).toBe("rejected");
    expect(rejected?.status_note).toBe("本会議で否決");
    const adopted = inserts.find((b) => b.slug === r8_1GiinKey(6));
    expect(adopted?.status).toBe("approved");
  });

  it("件名・識別名・PDFをインベントリからそのまま写す", () => {
    for (const [i, item] of r8FirstSessionItems.entries()) {
      expect(inserts[i].name).toBe(item.officialTitle);
      expect(inserts[i].bill_number).toBe(item.officialLabel);
      expect(inserts[i].pdf_url).toBe(item.fullTextPdfUrl);
      expect(inserts[i].overview_pdf_url).toBe(item.overviewPdfUrl);
    }
  });
});
