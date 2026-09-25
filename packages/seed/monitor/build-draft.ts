import type { DetectionResult, DraftItem, ProposedChange } from "./types";

/**
 * 検知結果から、ドラフトJSONとレビュー用レポート（Markdown）を作る純粋関数。
 *
 * ドラフトはどのインポーターからも読まれない。人間が一次資料と突合したうえで
 * インベントリ（packages/seed/main/shinjuku-*-inventory.ts）へ転記して初めて、
 * import:production の対象になる。
 */

export interface DraftFile {
  /** このファイルが何か、どう扱うかの説明（JSONを開いた人向け） */
  notice: string;
  items: DraftItem[];
  proposedChanges: ProposedChange[];
}

export const DRAFT_NOTICE =
  "自動検知ジョブ（pnpm monitor:shinjuku）が生成した下書き。どのインポーターも読まない。" +
  "一次資料と突合してからインベントリへ転記すること。reviewCompleted / hasPublishableContent は常に false。";

export function buildDraftFile(result: DetectionResult): DraftFile {
  return {
    notice: DRAFT_NOTICE,
    items: result.draftItems.map((item) => ({
      ...item,
      // 型でも false だが、JSONに書き出す直前にも固定しておく
      reviewCompleted: false,
      hasPublishableContent: false,
    })),
    proposedChanges: result.proposedChanges,
  };
}

/**
 * リポジトリに書き出す（下書きPRでコミットする）部分だけを残す。
 *
 * 新しい会期・未登録の案件・食い違いは (公式サイト, インベントリ) だけで決まるので、
 * 転記されるまで毎回同じ内容になる。一方、リンクの増減とPDFの差し替えは state.json との
 * 相対差分で、PRをマージすると消える。これをコミットするファイルに混ぜると、マージのたびに
 * main と食い違って追いかけPRができてしまうため、PR本文と実行サマリーにだけ出す。
 */
export function pendingOnly(result: DetectionResult): DetectionResult {
  return { ...result, linkPageChanges: [], pdfChanges: [] };
}

export function hasPendingDrafts(result: DetectionResult): boolean {
  return (
    result.newSessions.length > 0 ||
    result.draftItems.length > 0 ||
    result.proposedChanges.length > 0
  );
}

/** GitHub のPR本文の上限（65,536字）に収める */
export const PR_BODY_LIMIT = 60_000;

export function truncateForPrBody(report: string): string {
  if (report.length <= PR_BODY_LIMIT) return report;
  return `${report.slice(0, PR_BODY_LIMIT)}\n\n…（長いため省略。全文は \`packages/seed/monitor/drafts/report.md\` と実行サマリーを参照）\n`;
}

const FIELD_LABELS: Record<ProposedChange["field"], string> = {
  officialTitle: "件名",
  fullTextPdfUrl: "全文PDF",
  decision: "議決結果",
  missingOnOfficialPage: "公式ページに見当たらない",
};

/** 表のセルに入れられるよう、改行とパイプを無害化する */
function cell(value: string | null): string {
  if (value === null || value === "") return "—";
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function buildReport(result: DetectionResult): string {
  const lines: string[] = [
    "## 新宿区議会の更新を検知した（自動生成）",
    "",
    "`pnpm monitor:shinjuku` が公式サイトとインベントリを比べた結果。",
    "このPRはインベントリ・解説・DBを一切変更しない。変更するのは下書き（`packages/seed/monitor/drafts/`）と監視状態（`packages/seed/monitor/state.json`）だけ。",
    "",
  ];

  if (result.newSessions.length > 0) {
    lines.push("### 新しい会期", "");
    for (const session of result.newSessions) {
      const count = result.draftItems.filter(
        (item) => item.sessionId === session.sessionId
      ).length;
      lines.push(
        `- **${session.sessionName}**（\`${session.sessionId}\`）: ${count}件`
      );
      if (session.submissionsUrl) {
        lines.push(`  - 提出議案: ${session.submissionsUrl}`);
      }
      lines.push(`  - 議決結果: ${session.decisionsUrl ?? "未掲載"}`);
    }
    lines.push("");
  }

  if (result.draftItems.length > 0) {
    lines.push(
      "### 未登録の案件（下書き）",
      "",
      "すべて `reviewCompleted: false` / `hasPublishableContent: false`。",
      "",
      "| 会期 | 識別名 | 件名 | 議決結果 | 全文PDF |",
      "| --- | --- | --- | --- | --- |"
    );
    for (const item of result.draftItems) {
      lines.push(
        `| ${item.sessionId} | ${cell(item.officialLabel)} | ${cell(item.officialTitle)} | ${cell(item.decision ?? "未掲載")} | ${cell(item.fullTextPdfUrl)} |`
      );
    }
    lines.push("");
  }

  if (result.proposedChanges.length > 0) {
    lines.push(
      "### 登録済み案件と公式サイトの食い違い（自動では反映しない）",
      "",
      "インベントリは書き換えていない。公式サイトを確認し、採用するなら手で直すこと。",
      "",
      "| 会期 | 識別名 | 項目 | インベントリ | 公式サイト | レビュー済み |",
      "| --- | --- | --- | --- | --- | --- |"
    );
    for (const change of result.proposedChanges) {
      lines.push(
        `| ${change.sessionId} | ${cell(change.officialLabel)} | ${FIELD_LABELS[change.field]} | ${cell(change.current)} | ${cell(change.official)} | ${change.reviewCompleted ? "**済（要注意）**" : "未"} |`
      );
    }
    lines.push("");
  }

  if (result.linkPageChanges.length > 0) {
    lines.push("### 議会側ページのリンクの増減", "");
    for (const change of result.linkPageChanges) {
      lines.push(`- ${change.url}`);
      for (const link of change.added) {
        lines.push(`  - 追加: ${cell(link.text)} — ${link.href}`);
      }
      for (const link of change.removed) {
        lines.push(`  - 削除: ${cell(link.text)} — ${link.href}`);
      }
    }
    lines.push("");
  }

  if (result.pdfChanges.length > 0) {
    lines.push("### 内容が差し替わったPDF", "");
    for (const change of result.pdfChanges) {
      lines.push(
        `- ${change.url}（sha256: \`${change.previous?.slice(0, 12) ?? "なし"}…\` → \`${change.current.slice(0, 12)}…\`）`
      );
    }
    lines.push("");
  }

  lines.push(
    "### 次にやること",
    "",
    "1. 公式ページ・PDFを開き、上の内容が正しいか確かめる。",
    "2. 新しい会期ならインベントリ（`packages/seed/main/shinjuku-*-inventory.ts`）を別PRで作り、`packages/seed/monitor/targets.ts` の `KNOWN_SESSIONS` に足す。",
    "3. 解説を書いて公開レビューを終えるまで `reviewCompleted` は `false` のままにする。",
    "4. このPRは、監視状態を進めるためにマージするか、不要ならクローズする。"
  );

  return `${lines.join("\n")}\n`;
}
