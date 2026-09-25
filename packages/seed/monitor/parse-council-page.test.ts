import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  decodeEntities,
  extractPrimaryContent,
  parseDecisionPage,
  parseIndexPage,
  parseLinks,
  parseSubmissionPage,
  resolveUrl,
  splitLabel,
  toPlainText,
  toSessionId,
} from "./parse-council-page";

/** 公式ページを 2026-09-25 に取得し、本文領域だけを残したもの */
const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf-8");

const R8_3_URL =
  "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html";

describe("extractPrimaryContent", () => {
  it("本文領域が無いページは、案件0件と誤認せず停止する", () => {
    expect(() =>
      extractPrimaryContent("<html><body>改装中</body></html>")
    ).toThrow(/primaryIn01/);
  });

  it("本文領域の外（ナビゲーション）のリンクを含めない", () => {
    const html = `<nav><a href="/kusei/nav.html">第1号議案　ナビ</a></nav>
      <div id="primaryIn01"><a href="/content/1.pdf">第2号議案　本文</a><!-- /primaryIn01 --></div>
      <a href="/kusei/footer.html">第3号議案　フッター</a>`;
    expect(
      parseSubmissionPage(html, R8_3_URL).map((e) => e.officialLabel)
    ).toEqual(["第2号議案"]);
  });
});

describe("toPlainText / decodeEntities", () => {
  it("PDFの容量表記と「（新規ウィンドウ表示）」を件名から落とす", () => {
    expect(
      toPlainText(
        "第63号議案　令和8年度新宿区一般会計補正予算（第4号）<span> [PDF形式：151KB] </span>（新規ウィンドウ表示）"
      )
    ).toBe("第63号議案 令和8年度新宿区一般会計補正予算（第4号）");
  });

  it("span に包まれていない容量表記も落とす（差し替えでの誤検知を防ぐ）", () => {
    expect(toPlainText("意見書 [PDF形式：101KB]")).toBe("意見書");
  });

  it("文字参照を戻す", () => {
    expect(decodeEntities("A&amp;B &#12354; &#x3042; &lt;&gt; &unknown;")).toBe(
      "A&B あ あ <> &unknown;"
    );
  });
});

describe("splitLabel", () => {
  it.each([
    ["第63号議案　補正予算", "第63号議案", "補正予算"],
    [
      "承認第2号　専決処分の承認について",
      "承認第2号",
      "専決処分の承認について",
    ],
    ["認定第1号　令和7年度決算", "認定第1号", "令和7年度決算"],
    ["議員提出議案第9号　意見書", "議員提出議案第9号", "意見書"],
    ["第42号議案", "第42号議案", ""],
  ])("%s を識別名と件名に分ける", (text, label, title) => {
    expect(splitLabel(text)).toEqual({
      officialLabel: label,
      officialTitle: title,
    });
  });

  it.each([
    ["同意第1号　人事案件", "同意第1号"],
    ["諮問第1号　人権擁護委員", "諮問第1号"],
    ["報告第1号　専決処分の報告", "報告第1号"],
  ])("%s の識別名を取り出す", (text, label) => {
    expect(splitLabel(text)?.officialLabel).toBe(label);
  });

  it("全角数字の識別名は半角に揃え、件名は原文のまま残す", () => {
    expect(splitLabel("第６３号議案　ＥＳＣＯ事業")).toEqual({
      officialLabel: "第63号議案",
      officialTitle: "ＥＳＣＯ事業",
    });
  });

  it("案件でない文言は null", () => {
    expect(splitLabel("令和8年度9月補正予算概要")).toBeNull();
    expect(
      splitLabel("決算書・実績報告は会計室のページをご覧ください")
    ).toBeNull();
  });
});

describe("resolveUrl", () => {
  it("相対パスをページのURLから解決する", () => {
    expect(resolveUrl("../content/1.pdf", R8_3_URL)).toBe(
      "https://www.city.shinjuku.lg.jp/content/1.pdf"
    );
  });

  it("基準URLを省くと区のサイトのルートから解決し、文字参照も戻す", () => {
    expect(resolveUrl("/kusei/a.html?x=1&amp;y=2")).toBe(
      "https://www.city.shinjuku.lg.jp/kusei/a.html?x=1&y=2"
    );
  });
});

describe("toSessionId", () => {
  it.each([
    ["令和8年第3回定例会提出議案", "r8-3"],
    ["令和8年第2回区議会定例会議決結果", "r8-2"],
    ["令和7年第3回臨時会提出議案", "r7-rinji-3"],
    ["令和7年第3回区議会臨時会議決結果", "r7-rinji-3"],
    ["令和８年第４回定例会提出議案", "r8-4"],
    ["令和元年第1回定例会提出議案", "r1-1"],
  ])("%s → %s", (text, id) => {
    expect(toSessionId(text)).toBe(id);
  });

  it("会期名でなければ null", () => {
    expect(toSessionId("区長提出議案")).toBeNull();
  });
});

describe("parseSubmissionPage（令和8年第3回定例会の実ページ）", () => {
  const entries = parseSubmissionPage(
    fixture("submissions-r8-3.html"),
    R8_3_URL
  );

  it("議案18件と認定4件の計22件を読み取る（概要PDFや案内リンクは含めない）", () => {
    expect(entries).toHaveLength(22);
    expect(
      entries.filter((e) => e.officialLabel.startsWith("認定"))
    ).toHaveLength(4);
  });

  it("件名とPDFの絶対URLを原文どおり取り出す", () => {
    expect(entries[0]).toEqual({
      officialLabel: "第63号議案",
      officialTitle: "令和8年度新宿区一般会計補正予算（第4号）",
      pdfUrl: "https://www.city.shinjuku.lg.jp/content/000466336.pdf",
    });
  });

  it("公式表記の誤記（第2)期）も直さずに残す", () => {
    expect(
      entries.find((e) => e.officialLabel === "第76号議案")?.officialTitle
    ).toBe("道路改良工事（江戸川橋通り第2)期）請負契約");
  });
});

describe("parseDecisionPage（令和8年第2回定例会の実ページ）", () => {
  const entries = parseDecisionPage(fixture("decisions-r8-2.html"));

  it("表の23件を読み取る", () => {
    expect(entries).toHaveLength(23);
  });

  it("識別名・件名・議決結果を取り出す", () => {
    expect(entries.find((e) => e.officialLabel === "承認第3号")).toEqual({
      officialLabel: "承認第3号",
      officialTitle: "専決処分の承認について",
      decision: "承認",
    });
    expect(
      entries.find((e) => e.officialLabel === "第62号議案")?.decision
    ).toBe("原案可決");
  });
});

describe("parseIndexPage", () => {
  it("提出議案一覧を新しい順に読み取る", () => {
    const entries = parseIndexPage(
      fixture("index-submissions.html"),
      "https://www.city.shinjuku.lg.jp/kusei/index_gian01.html"
    );
    expect(entries.slice(0, 2)).toEqual([
      { title: "令和8年第3回定例会提出議案", url: R8_3_URL, sessionId: "r8-3" },
      {
        title: "令和8年第2回定例会提出議案",
        url: "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_02.html",
        sessionId: "r8-2",
      },
    ]);
  });

  it("議決結果一覧を新しい順に読み取る", () => {
    const entries = parseIndexPage(
      fixture("index-decisions.html"),
      "https://www.city.shinjuku.lg.jp/kusei/index_giketsu01.html"
    );
    expect(entries[0]).toEqual({
      title: "令和8年第2回区議会定例会議決結果",
      url: "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00016.html",
      sessionId: "r8-2",
    });
  });
});

describe("parseLinks", () => {
  it("決議・意見書ページの意見書PDFを拾う", () => {
    const links = parseLinks(
      fixture("council-resolutions-r8.html"),
      "https://www.city.shinjuku.lg.jp/kusei/file08_05_0004020210118_00006.html"
    );
    expect(links).toContainEqual({
      text: "ドナーミルクの利用拡大を求める意見書",
      href: "https://www.city.shinjuku.lg.jp/content/000459264.pdf",
    });
  });

  it("ページ内リンクと外部サイトへのリンクは含めない", () => {
    const html = `<div id="primaryIn01">
      <a href="#mark1">予算案</a>
      <a href="https://twitter.com/share?url=x">Tweet</a>
      <a href="/content/1.pdf">資料</a>
      <!-- /primaryIn01 --></div>`;
    expect(parseLinks(html, R8_3_URL)).toEqual([
      { text: "資料", href: "https://www.city.shinjuku.lg.jp/content/1.pdf" },
    ]);
  });
});
