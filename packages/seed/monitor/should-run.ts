/**
 * 更新検知をその日に走らせるかを判定し、GitHub Actions の出力 `run` に書く。
 *
 * 依存パッケージのインストールなしで動くよう、schedule.ts 以外は import しない
 * （ワークフローの判定ジョブは `npx tsx` だけで実行する）。
 *
 * 環境変数:
 * - GITHUB_EVENT_NAME: schedule / workflow_dispatch など
 * - OPEN_DRAFT_PR_COUNT: 更新検知の下書きPRの open 件数
 */
import { appendFileSync } from "node:fs";
import { decideRun, parseOpenDraftPrCount } from "./schedule";

const eventName = process.env.GITHUB_EVENT_NAME ?? "local";
let openCount: number;
try {
  openCount = parseOpenDraftPrCount(process.env.OPEN_DRAFT_PR_COUNT);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const decision = decideRun({
  now: new Date(),
  eventName,
  hasOpenDraftPr: openCount > 0,
});

console.log(`${decision.run ? "実行する" : "実行しない"}: ${decision.reason}`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `run=${decision.run}\n`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `更新検知: ${decision.run ? "実行" : "見送り"}（${decision.reason}）\n`
  );
}
