import { describe, expect, it } from "vitest";
import {
  buildDraftFile,
  buildReport,
  hasPendingDrafts,
  PR_BODY_LIMIT,
  pendingOnly,
  truncateForPrBody,
} from "./build-draft";
import type { DetectionResult, DraftItem } from "./types";

const draft: DraftItem = {
  sessionId: "r8-3",
  officialLabel: "第63号議案",
  officialTitle: "令和8年度新宿区一般会計補正予算（第4号）",
  fullTextPdfUrl: "https://www.city.shinjuku.lg.jp/content/000466336.pdf",
  decision: null,
  sourcePageUrl:
    "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html",
  decisionSourceUrl: null,
  reviewCompleted: false,
  hasPublishableContent: false,
};

const empty: DetectionResult = {
  newSessions: [],
  draftItems: [],
  proposedChanges: [],
  linkPageChanges: [],
  pdfChanges: [],
};

describe("buildDraftFile", () => {
  it("型をすり抜けた値が来ても、未レビュー・非公開で書き出す", () => {
    const tampered = {
      ...draft,
      reviewCompleted: true,
      hasPublishableContent: true,
    } as unknown as DraftItem;

    const file = buildDraftFile({ ...empty, draftItems: [tampered] });

    expect(file.items[0].reviewCompleted).toBe(false);
    expect(file.items[0].hasPublishableContent).toBe(false);
    expect(file.notice).toMatch(/どのインポーターも読まない/);
  });
});

describe("pendingOnly / hasPendingDrafts", () => {
  const withEvents: DetectionResult = {
    ...empty,
    draftItems: [draft],
    linkPageChanges: [{ url: "u", added: [], removed: [] }],
    pdfChanges: [{ url: "p", previous: "a", current: "b" }],
  };

  it("コミットする下書きからは、マージで消える相対差分（リンク・PDF）を外す", () => {
    expect(pendingOnly(withEvents)).toEqual({ ...empty, draftItems: [draft] });
  });

  it("リンク・PDFの変化だけなら、コミットする下書きは無い", () => {
    expect(hasPendingDrafts({ ...withEvents, draftItems: [] })).toBe(false);
    expect(hasPendingDrafts(withEvents)).toBe(true);
  });
});

describe("truncateForPrBody", () => {
  it("上限以下ならそのまま", () => {
    expect(truncateForPrBody("短い")).toBe("短い");
  });

  it("上限を超えたら切り詰めて、全文の場所を添える", () => {
    const body = truncateForPrBody("あ".repeat(PR_BODY_LIMIT + 10));
    expect(body.length).toBeLessThan(PR_BODY_LIMIT + 200);
    expect(body).toContain("drafts/report.md");
  });
});

describe("buildReport", () => {
  it("検知結果が空なら、見出しは「次にやること」だけ", () => {
    const headings = buildReport(empty)
      .split("\n")
      .filter((line) => line.startsWith("### "));
    expect(headings).toEqual(["### 次にやること"]);
  });

  it("新しい会期と下書き案件を載せ、議決結果の未掲載を明示する", () => {
    const report = buildReport({
      ...empty,
      newSessions: [
        {
          sessionId: "r8-3",
          sessionName: "令和8年第3回定例会提出議案",
          submissionsUrl: draft.sourcePageUrl,
          decisionsUrl: null,
          submissions: [],
          decisions: [],
        },
      ],
      draftItems: [draft],
    });

    expect(report).toContain("**令和8年第3回定例会提出議案**（`r8-3`）: 1件");
    expect(report).toContain("議決結果: 未掲載");
    expect(report).toContain(
      "| r8-3 | 第63号議案 | 令和8年度新宿区一般会計補正予算（第4号） | 未掲載 |"
    );
  });

  it("レビュー済み案件の食い違いを強調し、自動で反映しないと明記する", () => {
    const report = buildReport({
      ...empty,
      proposedChanges: [
        {
          sessionId: "r8-2",
          officialLabel: "第42号議案",
          field: "decision",
          current: "原案可決",
          official: "否決",
          reviewCompleted: true,
        },
      ],
    });

    expect(report).toContain("自動では反映しない");
    expect(report).toContain(
      "| r8-2 | 第42号議案 | 議決結果 | 原案可決 | 否決 | **済（要注意）** |"
    );
  });

  it("表のセルを壊すパイプと改行を無害化する", () => {
    const report = buildReport({
      ...empty,
      draftItems: [{ ...draft, officialTitle: "A|B\nC" }],
    });
    expect(report).toContain("A\\|B C");
  });

  it("議会側ページのリンク増減とPDFの差し替えを載せる", () => {
    const report = buildReport({
      ...empty,
      linkPageChanges: [
        {
          url: "https://example.jp/resolutions",
          added: [{ text: "新しい意見書", href: "https://example.jp/new.pdf" }],
          removed: [],
        },
      ],
      pdfChanges: [
        {
          url: "https://example.jp/r.pdf",
          previous: "a".repeat(64),
          current: "b".repeat(64),
        },
      ],
    });
    expect(report).toContain("追加: 新しい意見書 — https://example.jp/new.pdf");
    expect(report).toContain("`aaaaaaaaaaaa…` → `bbbbbbbbbbbb…`");
  });
});
