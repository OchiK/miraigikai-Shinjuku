import type { CouncilorQuestion, CouncilorTopicSummary } from "../types";

/**
 * 掲載中の質問からテーマタグを数え、多い順に上位 limit 件を返す。
 * 同数のときは質問一覧で先に出てきたタグを先にする（並びを安定させる）。
 */
export function summarizeCouncilorTopics(
  questions: Pick<CouncilorQuestion, "topicTags">[],
  limit = 5
): CouncilorTopicSummary {
  const counts = new Map<string, number>();
  for (const question of questions) {
    for (const tag of new Set(question.topicTags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  // Map は挿入順を保つため、安定ソートで同数は初出順のまま残る
  const topTags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { questionCount: questions.length, topTags };
}

/** 同数1位として名前を挙げるタグの上限 */
const MAX_LEADERS = 3;

/**
 * タグ集計を1文にする。AIの解釈は入れず、件数だけを述べる。
 * 質問がなければ null
 */
export function buildTopicSummaryText(
  summary: CouncilorTopicSummary
): string | null {
  const [first] = summary.topTags;
  if (!first) return null;

  const quote = (tags: { tag: string }[]) =>
    tags.map((t) => `「${t.tag}」`).join("");

  if (summary.questionCount === 1) {
    return `掲載中の質問は1件で、${quote(summary.topTags)}に関わる内容です。`;
  }

  // 同数1位が複数あれば並べて示す（「最も多い」を1つに決めつけない）
  const leaders = summary.topTags.filter((t) => t.count === first.count);
  const shownLeaders = leaders.slice(0, MAX_LEADERS);
  const leaderText =
    leaders.length > MAX_LEADERS
      ? `${quote(shownLeaders)}など`
      : quote(shownLeaders);
  const head =
    leaders.length > 1
      ? `掲載中の質問${summary.questionCount}件のうち、${leaderText}に関わる質問がそれぞれ${first.count}件と最も多く`
      : `掲載中の質問${summary.questionCount}件のうち、${leaderText}に関わる質問が${first.count}件と最も多く`;

  const followers = summary.topTags.slice(leaders.length, leaders.length + 2);
  if (followers.length === 0 || leaders.length > MAX_LEADERS) {
    return `${head}なっています。`;
  }
  const others = followers.map((t) => `「${t.tag}」${t.count}件`).join("、");
  return `${head}、${others}と続きます。`;
}
