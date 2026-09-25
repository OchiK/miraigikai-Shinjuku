/**
 * 新宿区議会の更新検知（P5-1）。
 *
 *   pnpm --filter @mirai-gikai/seed monitor:shinjuku            # 下書きと監視状態を書き出す
 *   pnpm --filter @mirai-gikai/seed monitor:shinjuku --dry-run  # 表示だけ
 *
 * DB・インベントリ・解説には一切書き込まない。書き出すのは monitor/drafts/ と
 * monitor/state.json だけで、変更の反映は GitHub Actions が作る下書きPRを人間が見て判断する。
 * 公式サイトの取得に失敗したら非ゼロで終了する（「変更なし」と誤認させない）。
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDraftFile,
  buildReport,
  hasPendingDrafts,
  pendingOnly,
  truncateForPrBody,
} from "./build-draft";
import { parseMonitorCliArgs } from "./cli-args";
import {
  buildNextState,
  detectChanges,
  hasChanges,
  mergeSessionPages,
  parseMonitorState,
  resolveKnownSessionPages,
  selectNewSessions,
  type SessionPages,
} from "./detect-changes";
import {
  parseDecisionPage,
  parseIndexPage,
  parseLinks,
  parseSubmissionPage,
} from "./parse-council-page";
import {
  DECISIONS_INDEX_URL,
  KNOWN_SESSIONS,
  LINK_WATCH_URLS,
  MONITOR_USER_AGENT,
  PDF_WATCH_URLS,
  SUBMISSIONS_INDEX_URL,
} from "./targets";
import type { MonitorState, PageLink, SessionSnapshot } from "./types";

const MONITOR_DIR = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(MONITOR_DIR, "state.json");
const DRAFTS_DIR = join(MONITOR_DIR, "drafts");
const DRAFT_PATH = join(DRAFTS_DIR, "shinjuku-draft.json");
const REPORT_PATH = join(DRAFTS_DIR, "report.md");

const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 5_000;

const NO_CHANGE_MESSAGE =
  "新宿区議会の公式サイトに、インベントリへ未反映の変更はなかった。\n";

/** 4xx は再試行しても直らないので、すぐに失敗させる */
class ClientError extends Error {}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": MONITOR_USER_AGENT },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status >= 400 && response.status < 500) {
        throw new ClientError(`HTTP ${response.status}`);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (error instanceof ClientError) break;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  throw new Error(`${url} の取得に失敗した: ${String(lastError)}`);
}

async function fetchText(url: string): Promise<string> {
  return (await fetchWithRetry(url)).text();
}

async function fetchSha256(url: string): Promise<string> {
  const body = Buffer.from(await (await fetchWithRetry(url)).arrayBuffer());
  return createHash("sha256").update(body).digest("hex");
}

async function fetchSession(pages: SessionPages): Promise<SessionSnapshot> {
  const submissions = pages.submissionsUrl
    ? parseSubmissionPage(
        await fetchText(pages.submissionsUrl),
        pages.submissionsUrl
      )
    : [];
  const decisions = pages.decisionsUrl
    ? parseDecisionPage(await fetchText(pages.decisionsUrl))
    : [];
  return { ...pages, submissions, decisions };
}

function readState(): MonitorState {
  try {
    return parseMonitorState(JSON.parse(readFileSync(STATE_PATH, "utf-8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { linkPages: {}, pdfs: {} };
    }
    throw error;
  }
}

/**
 * GitHub Actions 向けの出力。
 * MONITOR_PR_BODY_PATH にはPR本文を必ず書く（変更なしでも、古い下書きを消すPRの本文になる）。
 */
function writeGithubOutputs(changed: boolean, message: string) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${changed}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, message);
  }
  if (process.env.MONITOR_PR_BODY_PATH) {
    writeFileSync(process.env.MONITOR_PR_BODY_PATH, truncateForPrBody(message));
  }
}

async function main() {
  const { dryRun } = parseMonitorCliArgs(process.argv.slice(2));
  const knownIds = new Set(KNOWN_SESSIONS.map((s) => s.sessionId));

  // 公式サイトへの負荷を抑えるため、リクエストは直列に行う
  const newSubmissionPages = selectNewSessions(
    parseIndexPage(
      await fetchText(SUBMISSIONS_INDEX_URL),
      SUBMISSIONS_INDEX_URL
    ),
    knownIds
  );
  const decisionsIndex = parseIndexPage(
    await fetchText(DECISIONS_INDEX_URL),
    DECISIONS_INDEX_URL
  );
  const newDecisionPages = selectNewSessions(decisionsIndex, knownIds);

  const newSessions: SessionSnapshot[] = [];
  for (const pages of mergeSessionPages(newSubmissionPages, newDecisionPages)) {
    newSessions.push(await fetchSession(pages));
  }

  const knownSnapshots: SessionSnapshot[] = [];
  for (const pages of resolveKnownSessionPages(
    KNOWN_SESSIONS,
    decisionsIndex
  )) {
    knownSnapshots.push(await fetchSession(pages));
  }

  const linkPages: Record<string, PageLink[]> = {};
  for (const url of LINK_WATCH_URLS) {
    linkPages[url] = parseLinks(await fetchText(url), url);
  }

  const pdfs: Record<string, string> = {};
  for (const url of PDF_WATCH_URLS) {
    pdfs[url] = await fetchSha256(url);
  }

  const result = detectChanges({
    knownSessions: KNOWN_SESSIONS,
    knownSnapshots,
    newSessions,
    previousState: readState(),
    linkPages,
    pdfs,
  });
  const changed = hasChanges(result);
  const message = changed ? buildReport(result) : NO_CHANGE_MESSAGE;

  console.log(message);
  writeGithubOutputs(changed, message);

  if (dryRun) {
    console.log("--dry-run のためファイルは書き出していない。");
    return;
  }

  writeFileSync(
    STATE_PATH,
    `${JSON.stringify(buildNextState(linkPages, pdfs), null, 2)}\n`
  );
  // コミットする下書きには、転記されるまで変わらない部分だけを書く（pendingOnly を参照）
  if (hasPendingDrafts(result)) {
    const pending = pendingOnly(result);
    mkdirSync(DRAFTS_DIR, { recursive: true });
    writeFileSync(
      DRAFT_PATH,
      `${JSON.stringify(buildDraftFile(pending), null, 2)}\n`
    );
    writeFileSync(REPORT_PATH, buildReport(pending));
  } else {
    // 転記が済んで差分が消えたら、古い下書きも消す
    rmSync(DRAFT_PATH, { force: true });
    rmSync(REPORT_PATH, { force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
