import { describe, expect, it } from "vitest";
import {
  type BillSourceLinkInput,
  buildBillSourceLinks,
} from "./build-bill-source-links";

const fullSource: BillSourceLinkInput = {
  pdf_url: "https://www.city.shinjuku.lg.jp/content/000457652.pdf",
  overview_pdf_url: "https://www.city.shinjuku.lg.jp/content/000456353.pdf",
  source_page_url:
    "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_02.html",
  decision_source_url:
    "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00016.html",
};

describe("buildBillSourceLinks", () => {
  it("4種類の出典を全文・概要・提出議案一覧・議決結果の順で返す", () => {
    expect(buildBillSourceLinks(fullSource)).toEqual([
      { kind: "fullText", label: "議案全文（PDF）", url: fullSource.pdf_url },
      {
        kind: "overview",
        label: "提出案件概要（PDF）",
        url: fullSource.overview_pdf_url,
      },
      {
        kind: "submissions",
        label: "提出議案一覧",
        url: fullSource.source_page_url,
      },
      {
        kind: "decisions",
        label: "議決結果",
        url: fullSource.decision_source_url,
      },
    ]);
  });

  it("null の出典は落とす", () => {
    const links = buildBillSourceLinks({
      ...fullSource,
      overview_pdf_url: null,
      decision_source_url: null,
    });

    expect(links.map((l) => l.kind)).toEqual(["fullText", "submissions"]);
  });

  it("空文字や空白だけのURLはリンクにしない", () => {
    const links = buildBillSourceLinks({
      pdf_url: "",
      overview_pdf_url: "   ",
      source_page_url: null,
      decision_source_url: fullSource.decision_source_url,
    });

    expect(links.map((l) => l.kind)).toEqual(["decisions"]);
  });

  it("出典が1件も無ければ空配列を返す", () => {
    expect(
      buildBillSourceLinks({
        pdf_url: null,
        overview_pdf_url: null,
        source_page_url: null,
        decision_source_url: null,
      })
    ).toEqual([]);
  });
});
