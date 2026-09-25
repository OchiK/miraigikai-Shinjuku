import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildDraftItems,
  buildNextState,
  compareKnownSession,
  detectChanges,
  diffLinks,
  hasChanges,
  mergeSessionPages,
  parseMonitorState,
  resolveKnownSessionPages,
  selectNewSessions,
  type DetectInput,
} from "./detect-changes";
import {
  parseDecisionPage,
  parseIndexPage,
  parseSubmissionPage,
} from "./parse-council-page";
import { R8_2_SESSION } from "../main/shinjuku-r8-2-inventory";
import { R8_3_SESSION } from "../main/shinjuku-r8-3-inventory";
import { KNOWN_SESSIONS } from "./targets";
import type {
  DetectionResult,
  IndexEntry,
  KnownSession,
  SessionSnapshot,
} from "./types";

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf-8");

/** KNOWN_SESSIONS から会期IDで取り出す（並び順に依存しない） */
const knownSession = (sessionId: string): KnownSession => {
  const session = KNOWN_SESSIONS.find((s) => s.sessionId === sessionId);
  if (!session) throw new Error(`KNOWN_SESSIONS に ${sessionId} が無い`);
  return session;
};

const entry = (sessionId: string, url = `https://example.jp/${sessionId}`) =>
  ({ title: sessionId, url, sessionId }) satisfies IndexEntry;

const known: KnownSession = {
  sessionId: "r8-2",
  submissionsUrl: "https://example.jp/sub",
  decisionsUrl: "https://example.jp/dec",
  items: [
    {
      officialLabel: "第42号議案",
      officialTitle: "補正予算（第2号）",
      fullTextPdfUrl: "https://example.jp/42.pdf",
      decision: "原案可決",
      reviewCompleted: true,
    },
    {
      officialLabel: "第43号議案",
      officialTitle: "補正予算（第3号）",
      fullTextPdfUrl: "https://example.jp/43.pdf",
      decision: "原案可決",
      reviewCompleted: false,
    },
  ],
};

/** known と一致する公式サイトの取得結果 */
const matchingSnapshot = (): SessionSnapshot => ({
  sessionId: "r8-2",
  sessionName: "令和8年第2回定例会",
  submissionsUrl: known.submissionsUrl,
  decisionsUrl: known.decisionsUrl,
  submissions: known.items.map((item) => ({
    officialLabel: item.officialLabel,
    officialTitle: item.officialTitle,
    pdfUrl: item.fullTextPdfUrl,
  })),
  // 未議決の案件は議決結果ページに載らない
  decisions: known.items.flatMap((item) =>
    item.decision === null
      ? []
      : [
          {
            officialLabel: item.officialLabel,
            officialTitle: item.officialTitle,
            decision: item.decision,
          },
        ]
  ),
});

const baseInput = (): DetectInput => ({
  knownSessions: [known],
  knownSnapshots: [matchingSnapshot()],
  newSessions: [],
  previousState: { linkPages: {}, pdfs: {} },
  linkPages: {},
  pdfs: {},
});

describe("selectNewSessions", () => {
  it("登録済みの会期より新しい会期だけを返す（古い会期はドラフトにしない）", () => {
    const index = [entry("r8-3"), entry("r8-2"), entry("r8-1"), entry("r7-4")];
    expect(selectNewSessions(index, new Set(["r8-2"]))).toEqual([
      entry("r8-3"),
    ]);
  });

  it("最新が登録済みなら空", () => {
    expect(
      selectNewSessions([entry("r8-2"), entry("r8-1")], new Set(["r8-2"]))
    ).toEqual([]);
  });

  it("登録済みの会期が一覧に無ければ、全件を新規扱いにせず停止する", () => {
    expect(() =>
      selectNewSessions([entry("r9-1"), entry("r8-9")], new Set(["r8-2"]))
    ).toThrow(/r8-2/);
  });
});

describe("mergeSessionPages", () => {
  it("提出議案と議決結果を会期IDで束ねる", () => {
    expect(
      mergeSessionPages(
        [entry("r8-3", "https://example.jp/sub3")],
        [
          entry("r8-3", "https://example.jp/dec3"),
          entry("r8-rinji-1", "https://example.jp/decR1"),
        ]
      )
    ).toEqual([
      {
        sessionId: "r8-3",
        sessionName: "r8-3",
        submissionsUrl: "https://example.jp/sub3",
        decisionsUrl: "https://example.jp/dec3",
      },
      {
        sessionId: "r8-rinji-1",
        sessionName: "r8-rinji-1",
        submissionsUrl: null,
        decisionsUrl: "https://example.jp/decR1",
      },
    ]);
  });
});

describe("buildDraftItems", () => {
  const snapshot: SessionSnapshot = {
    sessionId: "r8-3",
    sessionName: "令和8年第3回定例会提出議案",
    submissionsUrl: "https://example.jp/sub3",
    decisionsUrl: "https://example.jp/dec3",
    submissions: [
      {
        officialLabel: "第63号議案",
        officialTitle: "補正予算",
        pdfUrl: "https://example.jp/63.pdf",
      },
      { officialLabel: "第64号議案", officialTitle: "条例", pdfUrl: null },
    ],
    decisions: [
      {
        officialLabel: "第63号議案",
        officialTitle: "補正予算",
        decision: "原案可決",
      },
      {
        officialLabel: "第81号議案",
        officialTitle: "追加議案",
        decision: "原案可決",
      },
    ],
  };

  it("すべての下書きが未レビュー・非公開になる", () => {
    const drafts = buildDraftItems(snapshot);
    expect(drafts).toHaveLength(3);
    for (const draft of drafts) {
      expect(draft.reviewCompleted).toBe(false);
      expect(draft.hasPublishableContent).toBe(false);
    }
  });

  it("議決結果が掲載済みなら出典つきで添え、未掲載なら null にする", () => {
    const [d63, d64] = buildDraftItems(snapshot);
    expect(d63).toMatchObject({
      decision: "原案可決",
      decisionSourceUrl: "https://example.jp/dec3",
    });
    expect(d64).toMatchObject({ decision: null, decisionSourceUrl: null });
  });

  it("議決結果ページにしか載っていない案件も落とさない", () => {
    expect(buildDraftItems(snapshot)[2]).toMatchObject({
      officialLabel: "第81号議案",
      sourcePageUrl: null,
      decision: "原案可決",
    });
  });

  it("登録済みの識別名は下書きにしない", () => {
    expect(
      buildDraftItems(snapshot, new Set(["第63号議案", "第81号議案"])).map(
        (d) => d.officialLabel
      )
    ).toEqual(["第64号議案"]);
  });
});

describe("compareKnownSession（レビュー済みコンテンツを上書きしない）", () => {
  it("公式サイトと一致していれば何も出さない", () => {
    expect(compareKnownSession(known, matchingSnapshot())).toEqual({
      draftItems: [],
      proposedChanges: [],
    });
  });

  it("件名が変わっても下書きで置き換えず、食い違いとして報告するだけ", () => {
    const before = structuredClone(known);
    const snapshot = matchingSnapshot();
    snapshot.submissions[0].officialTitle = "補正予算（第2号）（訂正）";

    const result = compareKnownSession(known, snapshot);

    expect(result.draftItems).toEqual([]);
    expect(result.proposedChanges).toEqual([
      {
        sessionId: "r8-2",
        officialLabel: "第42号議案",
        field: "officialTitle",
        current: "補正予算（第2号）",
        official: "補正予算（第2号）（訂正）",
        reviewCompleted: true,
      },
    ]);
    // 入力のインベントリには手を触れない
    expect(known).toEqual(before);
  });

  it("空白の揺れだけなら食い違いにしない", () => {
    const snapshot = matchingSnapshot();
    snapshot.submissions[0].officialTitle = " 補正予算（第2号）　";
    expect(compareKnownSession(known, snapshot).proposedChanges).toEqual([]);
  });

  it("全文PDF・議決結果の変更と、公式ページからの消失を報告する", () => {
    const snapshot = matchingSnapshot();
    snapshot.submissions = [
      { ...snapshot.submissions[0], pdfUrl: "https://example.jp/42-v2.pdf" },
    ];
    snapshot.decisions[0].decision = "否決";

    expect(
      compareKnownSession(known, snapshot).proposedChanges.map((c) => [
        c.officialLabel,
        c.field,
      ])
    ).toEqual([
      ["第42号議案", "fullTextPdfUrl"],
      ["第42号議案", "decision"],
      ["第43号議案", "missingOnOfficialPage"],
    ]);
  });

  it("登録済み会期に追加された案件は下書きにする", () => {
    const snapshot = matchingSnapshot();
    snapshot.submissions.push({
      officialLabel: "第61号議案",
      officialTitle: "追加提出の契約",
      pdfUrl: "https://example.jp/61.pdf",
    });
    expect(
      compareKnownSession(known, snapshot).draftItems.map(
        (d) => d.officialLabel
      )
    ).toEqual(["第61号議案"]);
  });

  it("ページから1件も読めなければ「全件消えた」と報告せず停止する", () => {
    expect(() =>
      compareKnownSession(known, { ...matchingSnapshot(), submissions: [] })
    ).toThrow(/提出議案ページ/);
    expect(() =>
      compareKnownSession(known, { ...matchingSnapshot(), decisions: [] })
    ).toThrow(/議決結果ページ/);
  });

  describe("議決結果が未掲載のまま登録した会期", () => {
    const pending: KnownSession = {
      ...known,
      decisionsUrl: null,
      items: known.items.map((item) => ({ ...item, decision: null })),
    };

    it("議決結果ページを取得していなければ、0件でも停止しない", () => {
      expect(
        compareKnownSession(pending, {
          ...matchingSnapshot(),
          decisionsUrl: null,
          decisions: [],
        })
      ).toEqual({ draftItems: [], proposedChanges: [] });
    });

    it("議決結果が掲載されたら、未議決との食い違いとして報告する", () => {
      const changes = compareKnownSession(
        pending,
        matchingSnapshot()
      ).proposedChanges;
      expect(
        changes.map((c) => [c.officialLabel, c.field, c.current, c.official])
      ).toEqual([
        ["第42号議案", "decision", null, "原案可決"],
        ["第43号議案", "decision", null, "原案可決"],
        ["（会期全体）", "decisionsUrl", null, known.decisionsUrl],
      ]);
    });

    it("一覧に載った議決結果ページから1件も読めなければ、ページURLつきで停止する", () => {
      expect(() =>
        compareKnownSession(pending, { ...matchingSnapshot(), decisions: [] })
      ).toThrow(/一覧に載ったが.*example\.jp\/dec/);
    });
  });
});

describe("resolveKnownSessionPages", () => {
  const pending: KnownSession = {
    ...known,
    sessionId: "r8-3",
    decisionsUrl: null,
  };

  it("登録済みの議決結果ページがあればそれを使う", () => {
    expect(
      resolveKnownSessionPages(
        [known],
        [entry("r8-2", "https://example.jp/other")]
      )
    ).toEqual([
      {
        sessionId: "r8-2",
        sessionName: "r8-2",
        submissionsUrl: known.submissionsUrl,
        decisionsUrl: known.decisionsUrl,
      },
    ]);
  });

  it("未掲載で登録した会期は、議決結果の一覧から同じ会期のページを探す", () => {
    const [pages] = resolveKnownSessionPages(
      [pending],
      [entry("r8-3", "https://example.jp/dec3"), entry("r8-2")]
    );
    expect(pages.decisionsUrl).toBe("https://example.jp/dec3");
  });

  it("一覧にまだ無ければ null のまま", () => {
    const [pages] = resolveKnownSessionPages([pending], [entry("r8-2")]);
    expect(pages.decisionsUrl).toBeNull();
  });
});

describe("KNOWN_SESSIONS と公式ページの実物（2026-09-25 取得）", () => {
  it("令和8年第2回定例会のインベントリは公式ページと食い違いがない", () => {
    const r82 = knownSession("r8-2");
    const snapshot: SessionSnapshot = {
      sessionId: r82.sessionId,
      sessionName: r82.sessionId,
      submissionsUrl: r82.submissionsUrl,
      decisionsUrl: r82.decisionsUrl,
      submissions: parseSubmissionPage(
        fixture("submissions-r8-2.html"),
        r82.submissionsUrl
      ),
      decisions: parseDecisionPage(fixture("decisions-r8-2.html")),
    };
    expect(r82.sessionId).toBe(R8_2_SESSION.slug);
    expect(r82.items).toHaveLength(23);
    expect(compareKnownSession(r82, snapshot)).toEqual({
      draftItems: [],
      proposedChanges: [],
    });
  });

  it("令和8年第3回定例会のインベントリは公式ページと食い違いがない", () => {
    const r83 = knownSession("r8-3");
    const snapshot: SessionSnapshot = {
      sessionId: r83.sessionId,
      sessionName: r83.sessionId,
      submissionsUrl: r83.submissionsUrl,
      decisionsUrl: r83.decisionsUrl,
      submissions: parseSubmissionPage(
        fixture("submissions-r8-3.html"),
        r83.submissionsUrl
      ),
      decisions: [],
    };
    expect(r83.sessionId).toBe(R8_3_SESSION.slug);
    expect(r83.items).toHaveLength(22);
    expect(compareKnownSession(r83, snapshot)).toEqual({
      draftItems: [],
      proposedChanges: [],
    });
  });

  it("一覧の実物に、インベントリ未登録の会期は無い", () => {
    const knownIds = new Set(KNOWN_SESSIONS.map((s) => s.sessionId));
    for (const [name, url] of [
      [
        "index-submissions.html",
        "https://www.city.shinjuku.lg.jp/kusei/index_gian01.html",
      ],
      [
        "index-decisions.html",
        "https://www.city.shinjuku.lg.jp/kusei/index_giketsu01.html",
      ],
    ]) {
      expect(
        selectNewSessions(parseIndexPage(fixture(name), url), knownIds)
      ).toEqual([]);
    }
  });

  it("令和8年第3回定例会の議決結果ページは、一覧の実物にまだ無い", () => {
    const decisionsIndex = parseIndexPage(
      fixture("index-decisions.html"),
      "https://www.city.shinjuku.lg.jp/kusei/index_giketsu01.html"
    );
    const pages = resolveKnownSessionPages(KNOWN_SESSIONS, decisionsIndex);
    expect(pages.find((p) => p.sessionId === "r8-3")?.decisionsUrl).toBeNull();
    expect(pages.find((p) => p.sessionId === "r8-2")?.decisionsUrl).toBe(
      knownSession("r8-2").decisionsUrl
    );
  });
});

describe("diffLinks", () => {
  const a = { text: "意見書A", href: "https://example.jp/a.pdf" };
  const b = { text: "意見書B", href: "https://example.jp/b.pdf" };

  it("前回状態が無ければ基準を記録するだけで、変更にしない", () => {
    expect(diffLinks("u", undefined, [a])).toBeNull();
  });

  it("増減を返す", () => {
    expect(diffLinks("u", [a], [b])).toEqual({
      url: "u",
      added: [b],
      removed: [a],
    });
  });

  it("並び順が変わっただけなら変更にしない", () => {
    expect(diffLinks("u", [a, b], [b, a])).toBeNull();
  });
});

describe("detectChanges", () => {
  it("何も変わっていなければ変更なし", () => {
    expect(hasChanges(detectChanges(baseInput()))).toBe(false);
  });

  it("PDFの内容が差し替わったら報告する（初回は基準の記録だけ）", () => {
    const input = baseInput();
    input.previousState.pdfs = { "https://example.jp/r.pdf": "old" };
    input.pdfs = {
      "https://example.jp/r.pdf": "new",
      "https://example.jp/first.pdf": "x",
    };

    expect(detectChanges(input).pdfChanges).toEqual([
      { url: "https://example.jp/r.pdf", previous: "old", current: "new" },
    ]);
  });

  it("新しい会期の案件は下書きになる", () => {
    const input = baseInput();
    input.newSessions = [
      {
        sessionId: "r8-3",
        sessionName: "令和8年第3回定例会提出議案",
        submissionsUrl: "https://example.jp/sub3",
        decisionsUrl: null,
        submissions: [
          {
            officialLabel: "第63号議案",
            officialTitle: "補正予算",
            pdfUrl: null,
          },
        ],
        decisions: [],
      },
    ];
    const result = detectChanges(input);
    expect(hasChanges(result)).toBe(true);
    expect(result.draftItems.map((d) => d.officialLabel)).toEqual([
      "第63号議案",
    ]);
  });

  it("同じ入力なら何度実行しても同じ結果になる（定期実行でPRを増やさない）", () => {
    const input = baseInput();
    input.newSessions = [
      {
        sessionId: "r8-3",
        sessionName: "令和8年第3回定例会提出議案",
        submissionsUrl: "https://example.jp/sub3",
        decisionsUrl: null,
        submissions: [
          {
            officialLabel: "第63号議案",
            officialTitle: "補正予算",
            pdfUrl: null,
          },
        ],
        decisions: [],
      },
    ];
    expect(detectChanges(input)).toEqual(detectChanges(structuredClone(input)));
  });

  it("登録済み会期の取得結果が無ければ停止する", () => {
    expect(() => detectChanges({ ...baseInput(), knownSnapshots: [] })).toThrow(
      /r8-2/
    );
  });
});

describe("hasChanges", () => {
  const none: DetectionResult = {
    newSessions: [],
    draftItems: [],
    proposedChanges: [],
    linkPageChanges: [],
    pdfChanges: [],
  };

  it.each([
    ["proposedChanges", { proposedChanges: [{} as never] }],
    ["linkPageChanges", { linkPageChanges: [{} as never] }],
    ["pdfChanges", { pdfChanges: [{} as never] }],
    ["draftItems", { draftItems: [{} as never] }],
    ["newSessions", { newSessions: [{} as never] }],
  ])("%s だけでも変更ありにする", (_, partial) => {
    expect(hasChanges({ ...none, ...partial })).toBe(true);
  });

  it("すべて空なら変更なし", () => {
    expect(hasChanges(none)).toBe(false);
  });
});

describe("parseMonitorState", () => {
  it("正しい形ならそのまま返す", () => {
    const state = {
      linkPages: { u: [{ text: "a", href: "h" }] },
      pdfs: { p: "sha" },
    };
    expect(parseMonitorState(state)).toEqual(state);
  });

  it.each([
    ["null", null],
    ["pdfs が無い", { linkPages: {} }],
    ["linkPages が配列でない値を持つ", { linkPages: { u: "x" }, pdfs: {} }],
    ["pdfs の値が文字列でない", { linkPages: {}, pdfs: { p: 1 } }],
  ])("%s なら原因がわかる形で停止する", (_, json) => {
    expect(() => parseMonitorState(json)).toThrow(/state\.json/);
  });
});

describe("buildNextState", () => {
  it("URLの順に並べ、同じ内容なら同じJSONになる", () => {
    const pdfs = {
      "https://example.jp/b.pdf": "2",
      "https://example.jp/a.pdf": "1",
    };
    expect(JSON.stringify(buildNextState({}, pdfs))).toBe(
      JSON.stringify({
        linkPages: {},
        pdfs: {
          "https://example.jp/a.pdf": "1",
          "https://example.jp/b.pdf": "2",
        },
      })
    );
  });
});
