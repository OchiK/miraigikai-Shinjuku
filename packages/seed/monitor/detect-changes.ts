import type {
  DetectionResult,
  DraftItem,
  IndexEntry,
  KnownSession,
  LinkPageChange,
  MonitorState,
  PageLink,
  PdfChange,
  ProposedChange,
  SessionSnapshot,
} from "./types";

/**
 * 公式サイトの内容とインベントリ・前回状態を比べる純粋関数。
 *
 * 比較の基準は「前回の取得結果」ではなく「インベントリ」。ドラフトは
 * (公式サイト, インベントリ) だけで決まるため、同じ状態で何度実行しても同じ結果になり、
 * 定期実行のたびにPRが増えることがない。インベントリへ転記されるまで、新規案件は
 * 毎回ドラフトに出続ける。
 */

/** 会期ページの組（提出議案ページと議決結果ページを会期IDで束ねたもの） */
export interface SessionPages {
  sessionId: string;
  sessionName: string;
  submissionsUrl: string | null;
  decisionsUrl: string | null;
}

/**
 * 一覧（新しい順）のうち、インベントリ登録済みの会期より新しいものを返す。
 * 登録済みの会期が一覧に見つからない場合は、一覧の作りが変わったとみなして例外を投げる。
 * 見つからないまま全件を新規扱いにすると、古い会期まで大量にドラフト化してしまう。
 */
export function selectNewSessions(
  index: IndexEntry[],
  knownSessionIds: Set<string>
): IndexEntry[] {
  const firstKnown = index.findIndex(
    (entry) => entry.sessionId !== null && knownSessionIds.has(entry.sessionId)
  );
  if (firstKnown < 0) {
    throw new Error(
      `一覧に登録済みの会期（${[...knownSessionIds].join(", ")}）が見つからない`
    );
  }
  return index.slice(0, firstKnown);
}

/** 提出議案一覧と議決結果一覧の新規会期を会期IDで束ねる（提出議案一覧の順を優先） */
export function mergeSessionPages(
  submissions: IndexEntry[],
  decisions: IndexEntry[]
): SessionPages[] {
  const pages = new Map<string, SessionPages>();

  for (const entry of submissions) {
    if (!entry.sessionId || pages.has(entry.sessionId)) continue;
    pages.set(entry.sessionId, {
      sessionId: entry.sessionId,
      sessionName: entry.title,
      submissionsUrl: entry.url,
      decisionsUrl: null,
    });
  }
  for (const entry of decisions) {
    if (!entry.sessionId) continue;
    const existing = pages.get(entry.sessionId);
    if (existing) {
      existing.decisionsUrl ??= entry.url;
    } else {
      pages.set(entry.sessionId, {
        sessionId: entry.sessionId,
        sessionName: entry.title,
        submissionsUrl: null,
        decisionsUrl: entry.url,
      });
    }
  }
  return [...pages.values()];
}

/** 比較用に空白の揺れだけを吸収する（文字そのものは変えない） */
function normalize(text: string | null): string | null {
  return text === null ? null : text.replace(/[\s　]+/g, " ").trim();
}

/** 会期の案件のうち、登録済みでないものをドラフトにする */
export function buildDraftItems(
  snapshot: SessionSnapshot,
  knownLabels: Set<string> = new Set()
): DraftItem[] {
  const decisions = new Map(
    snapshot.decisions.map((entry) => [entry.officialLabel, entry])
  );
  const drafts: DraftItem[] = [];
  const seen = new Set<string>();

  for (const entry of snapshot.submissions) {
    if (knownLabels.has(entry.officialLabel)) continue;
    seen.add(entry.officialLabel);
    drafts.push({
      sessionId: snapshot.sessionId,
      officialLabel: entry.officialLabel,
      officialTitle: entry.officialTitle,
      fullTextPdfUrl: entry.pdfUrl,
      decision: decisions.get(entry.officialLabel)?.decision ?? null,
      sourcePageUrl: snapshot.submissionsUrl,
      decisionSourceUrl: decisions.has(entry.officialLabel)
        ? snapshot.decisionsUrl
        : null,
      reviewCompleted: false,
      hasPublishableContent: false,
    });
  }
  // 議決結果ページにだけ載っている案件（追加提出分など）も落とさない
  for (const entry of snapshot.decisions) {
    if (knownLabels.has(entry.officialLabel) || seen.has(entry.officialLabel))
      continue;
    drafts.push({
      sessionId: snapshot.sessionId,
      officialLabel: entry.officialLabel,
      officialTitle: entry.officialTitle,
      fullTextPdfUrl: null,
      decision: entry.decision,
      sourcePageUrl: null,
      decisionSourceUrl: snapshot.decisionsUrl,
      reviewCompleted: false,
      hasPublishableContent: false,
    });
  }
  return drafts;
}

/**
 * 登録済み会期を公式サイトと突き合わせる。
 *
 * 登録済み案件の値が公式サイトと食い違っても、インベントリは書き換えない。
 * 食い違いは ProposedChange としてレポートに載せ、採否は人間が決める
 * （レビュー済みの解説・議決結果を黙って上書きしないため）。
 */
export function compareKnownSession(
  known: KnownSession,
  snapshot: SessionSnapshot
): { draftItems: DraftItem[]; proposedChanges: ProposedChange[] } {
  if (known.items.length > 0 && snapshot.submissions.length === 0) {
    throw new Error(
      `${known.sessionId} の提出議案ページから案件を1件も読み取れない。公式サイトの構成が変わった可能性がある`
    );
  }
  if (known.items.length > 0 && snapshot.decisions.length === 0) {
    throw new Error(
      `${known.sessionId} の議決結果ページから案件を1件も読み取れない。公式サイトの構成が変わった可能性がある`
    );
  }

  const submissions = new Map(
    snapshot.submissions.map((entry) => [entry.officialLabel, entry])
  );
  const decisions = new Map(
    snapshot.decisions.map((entry) => [entry.officialLabel, entry])
  );
  const proposedChanges: ProposedChange[] = [];

  for (const item of known.items) {
    const change = (
      field: ProposedChange["field"],
      current: string | null,
      official: string | null
    ) =>
      proposedChanges.push({
        sessionId: known.sessionId,
        officialLabel: item.officialLabel,
        field,
        current,
        official,
        reviewCompleted: item.reviewCompleted,
      });

    const submission = submissions.get(item.officialLabel);
    if (!submission) {
      change("missingOnOfficialPage", item.officialTitle, null);
    } else {
      if (
        normalize(submission.officialTitle) !== normalize(item.officialTitle)
      ) {
        change("officialTitle", item.officialTitle, submission.officialTitle);
      }
      if (submission.pdfUrl !== item.fullTextPdfUrl) {
        change("fullTextPdfUrl", item.fullTextPdfUrl, submission.pdfUrl);
      }
    }

    const decision = decisions.get(item.officialLabel);
    if (decision && normalize(decision.decision) !== normalize(item.decision)) {
      change("decision", item.decision, decision.decision);
    }
  }

  const knownLabels = new Set(known.items.map((item) => item.officialLabel));
  return {
    draftItems: buildDraftItems(snapshot, knownLabels),
    proposedChanges,
  };
}

const linkKey = (link: PageLink) => `${link.href}\n${link.text}`;

export function diffLinks(
  url: string,
  previous: PageLink[] | undefined,
  current: PageLink[]
): LinkPageChange | null {
  // 初回（前回状態なし）は基準を記録するだけで、変更としては扱わない
  if (previous === undefined) return null;
  const before = new Set(previous.map(linkKey));
  const after = new Set(current.map(linkKey));
  const added = current.filter((link) => !before.has(linkKey(link)));
  const removed = previous.filter((link) => !after.has(linkKey(link)));
  return added.length === 0 && removed.length === 0
    ? null
    : { url, added, removed };
}

export interface DetectInput {
  knownSessions: KnownSession[];
  /** knownSessions と同じ会期IDを持つ取得結果 */
  knownSnapshots: SessionSnapshot[];
  newSessions: SessionSnapshot[];
  previousState: MonitorState;
  linkPages: Record<string, PageLink[]>;
  pdfs: Record<string, string>;
}

export function detectChanges(input: DetectInput): DetectionResult {
  const draftItems: DraftItem[] = [];
  const proposedChanges: ProposedChange[] = [];

  for (const known of input.knownSessions) {
    const snapshot = input.knownSnapshots.find(
      (s) => s.sessionId === known.sessionId
    );
    if (!snapshot) {
      throw new Error(`${known.sessionId} の取得結果がない`);
    }
    const result = compareKnownSession(known, snapshot);
    draftItems.push(...result.draftItems);
    proposedChanges.push(...result.proposedChanges);
  }

  for (const snapshot of input.newSessions) {
    draftItems.push(...buildDraftItems(snapshot));
  }

  const linkPageChanges = Object.entries(input.linkPages)
    .map(([url, links]) =>
      diffLinks(url, input.previousState.linkPages[url], links)
    )
    .filter((change): change is LinkPageChange => change !== null);

  const pdfChanges: PdfChange[] = Object.entries(input.pdfs)
    .filter(([url, sha]) => {
      const previous = input.previousState.pdfs[url];
      return previous !== undefined && previous !== sha;
    })
    .map(([url, sha]) => ({
      url,
      previous: input.previousState.pdfs[url],
      current: sha,
    }));

  return {
    newSessions: input.newSessions,
    draftItems,
    proposedChanges,
    linkPageChanges,
    pdfChanges,
  };
}

export function hasChanges(result: DetectionResult): boolean {
  return (
    result.newSessions.length > 0 ||
    result.draftItems.length > 0 ||
    result.proposedChanges.length > 0 ||
    result.linkPageChanges.length > 0 ||
    result.pdfChanges.length > 0
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * state.json の中身を確かめる。手で編集して形が崩れていたら、比較の途中で
 * TypeError になる前に、原因がわかる形で停止する。
 */
export function parseMonitorState(json: unknown): MonitorState {
  if (!isRecord(json) || !isRecord(json.linkPages) || !isRecord(json.pdfs)) {
    throw new Error(
      "monitor/state.json の形式が不正（linkPages と pdfs のオブジェクトが必要）"
    );
  }
  for (const [url, links] of Object.entries(json.linkPages)) {
    if (!Array.isArray(links)) {
      throw new Error(`monitor/state.json の linkPages["${url}"] が配列でない`);
    }
  }
  for (const [url, sha] of Object.entries(json.pdfs)) {
    if (typeof sha !== "string") {
      throw new Error(`monitor/state.json の pdfs["${url}"] が文字列でない`);
    }
  }
  return json as unknown as MonitorState;
}

/** 次回の比較基準。キーをソートして、同じ内容なら同じJSONになるようにする */
export function buildNextState(
  linkPages: Record<string, PageLink[]>,
  pdfs: Record<string, string>
): MonitorState {
  const sortKeys = <T>(record: Record<string, T>): Record<string, T> =>
    Object.fromEntries(
      Object.entries(record).sort(([a], [b]) => a.localeCompare(b))
    );
  return { linkPages: sortKeys(linkPages), pdfs: sortKeys(pdfs) };
}
