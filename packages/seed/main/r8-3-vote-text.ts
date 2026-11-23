import type { BillContentWithBillSlug, DifficultyLevel } from "./bill-contents-data";
import {
  parseVoteMarks,
  R8_3_VOTE_COLUMNS,
  r8_3BillVotes,
  type SeedBillVotes,
} from "./shinjuku-faction-stances";

const STANCE_LABELS: Record<"for" | "against", string> = {
  for: "賛成（○）",
  against: "反対（×）",
};

export function voteStanceLabel(stance: string): string {
  if (stance !== "for" && stance !== "against") {
    throw new Error(`会派賛否の態度は変換できません: ${stance}`);
  }
  return STANCE_LABELS[stance];
}

export const VOTE_ABSENCE = {
  easy: "決まった 日と 議員 一人ひとりの 投票は、どちらの 資料にも ありません。",
  normal:
    "議決日と所属議員ごとの投票は、議決結果ページと「議案の概要と審議結果」のどちらにも載っていません。",
  hard: "議決日と所属議員ごとの投票は、議決結果ページと「議案の概要と審議結果」のどちらにも記載がない。",
} as const;

export const VOTE_REASONS_ABSENCE = {
  easy: "会派が 賛成や 反対を した 理由、委員会で 話し合った 内容は わかりません。",
  normal:
    "各会派の賛否の理由・討論と、委員会での審査の内容は確認できません。",
  hard: "- 各会派の賛否の理由・討論と、委員会での審査の内容は確認できない。",
} as const;

function voteColumns(billKey: string, votes: readonly SeedBillVotes[]) {
  const bill = votes.find((v) => v.billKey === billKey);
  if (!bill) throw new Error(`会派賛否が見つかりません: ${billKey}`);
  const stances = parseVoteMarks(bill.marks, R8_3_VOTE_COLUMNS.length);
  return R8_3_VOTE_COLUMNS.map((column, i) => ({
    ...column,
    stance: stances[i],
    label: voteStanceLabel(stances[i]),
  }));
}

/** 採決時点の9列から生成する。議員提出議案の既存出力も維持する。 */
export function hardVoteTable(
  billKey: string,
  result: string,
  votes: readonly SeedBillVotes[] = r8_3BillVotes
): string {
  const rows = voteColumns(billKey, votes).map(
    (column) =>
      `| ${column.heading}（${column.nameAtVote}） | ${column.label} |`
  );
  return [
    "| 会派（表の略称） | 態度 |",
    "|------|------|",
    ...rows,
    "",
    `議決結果の欄は「${result}」である。表は会派の態度を示すもので、所属議員ごとの投票は記載がない。`,
  ].join("\n");
}

/** easy/normal も同じ seed の記号と採決時の正式名称だけから作る。 */
export function voteProse(
  billKey: string,
  level: Exclude<DifficultyLevel, "hard">,
  votes: readonly SeedBillVotes[] = r8_3BillVotes
): string {
  const columns = voteColumns(billKey, votes);
  const yes = columns.filter((c) => c.stance === "for");
  const no = columns.filter((c) => c.stance === "against");
  if (level === "easy") {
    const intro =
      "「議案の 概要と 審議結果」に 会派ごとの 結果が のって います。\n会派は 9つです。";
    if (!no.length)
      return `${intro}\n9つの 会派 すべてが 賛成しました。\nこれは 会派ごとの 態度です。`;
    return [
      intro,
      `賛成は ${yes.length}つ、反対は ${no.length}つでした。`,
      "",
      ...yes.map((c) => `- 賛成: ${c.nameAtVote}`),
      ...no.map((c) => `- 反対: ${c.nameAtVote}`),
      "",
      "これは 会派ごとの 態度です。",
    ].join("\n");
  }
  if (!no.length)
    return "「議案の概要と審議結果」によると、9会派すべてが賛成しました。これは会派ごとの態度です。";
  return [
    "「議案の概要と審議結果」による会派ごとの態度は次のとおりです。",
    "",
    `- 賛成（${yes.length}会派）: ${yes.map((c) => c.nameAtVote).join("、")}`,
    `- 反対（${no.length}会派）: ${no.map((c) => c.nameAtVote).join("、")}`,
  ].join("\n");
}

function occursOnce(text: string, fragment: string): boolean {
  const first = text.indexOf(fragment);
  return first !== -1 && text.indexOf(fragment, first + fragment.length) === -1;
}

function section(content: string, heading: RegExp): string {
  return (
    content.split(/(?=^## )/m).find((s) => heading.test(s.split("\n")[0])) ?? ""
  );
}

/** 台帳ハッシュとは別に、実際の審議状況と不記載の節を検査する。 */
export function validateMayorVoteText(
  contents: readonly BillContentWithBillSlug[],
  votes: readonly SeedBillVotes[] = r8_3BillVotes
): string[] {
  const problems: string[] = [];
  for (const c of contents) {
    const level = c.difficulty_level;
    const id = `${c.bill_slug}:${level}`;
    const bill = votes.find((v) => v.billKey === c.bill_slug);
    if (!bill) {
      problems.push(`${id}: 会派賛否が見つかりません`);
      continue;
    }
    const status = section(
      c.content,
      /この(?:議案|決算)は どうなりましたか|この(?:議案|案件)のゆくえ|審議状況/
    );
    const unknown = section(
      c.content,
      /わからない こと|分からないこと|出典に記載がない事項/
    );
    // 可決／認定を slug で決める規則は ledger_build.py にもある。
    const result = c.bill_slug.includes("-nintei-") ? "認定" : "可決";
    const expected =
      level === "hard"
        ? hardVoteTable(c.bill_slug, result, votes)
        : voteProse(c.bill_slug, level, votes);
    if (!occursOnce(status, expected))
      problems.push(`${id}: 会派賛否の本文が seed と一致しない`);
    if (!bill.marks.includes("×") && /反対[:（]/.test(status))
      problems.push(`${id}: 全会一致に反対会派の記載`);
    if (!occursOnce(status, VOTE_ABSENCE[level]))
      problems.push(`${id}: 議決日・個人投票の不記載がない`);
    if (!occursOnce(unknown, VOTE_REASONS_ABSENCE[level]))
      problems.push(`${id}: 賛否理由・討論・委員会審査の不記載がない`);
  }
  return problems;
}
