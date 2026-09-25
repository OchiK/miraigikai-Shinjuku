// 質問要約 seed の出典を、会議録検索システムの API と突き合わせる（ネットワークを使う手動検証）。
//
//   pnpm --filter @mirai-gikai/seed verify:council-questions
//
// 各件の minuteId が「◆質問」の発言で、発言者が seed の議員と一致するかを確かめる。
// 要約の中身までは機械で検証できないため、見出しと冒頭をあわせて表示する。

import {
  MINUTES_COUNCIL_IDS,
  type QuestionSessionSlug,
  councilMemberQuestions,
} from "./shinjuku-council-questions";

const API_URL = "https://ssp.kaigiroku.net/dnp/search/minutes/get_minute";
const TENANT_ID = 211; // 新宿区

type Minute = {
  minute_id: number;
  title: string;
  minute_type: string;
  body: string;
};

async function fetchMinutes(
  session: QuestionSessionSlug,
  scheduleId: number
): Promise<Minute[]> {
  const body = new URLSearchParams({
    tenant_id: String(TENANT_ID),
    council_id: String(MINUTES_COUNCIL_IDS[session]),
    schedule_id: String(scheduleId),
  });
  const res = await fetch(API_URL, { method: "POST", body });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${session}/${scheduleId}`);
  }
  const json = (await res.json()) as { tenant_minutes: Minute[] };
  return json.tenant_minutes;
}

async function main() {
  const cache = new Map<string, Minute[]>();
  const failures: string[] = [];

  for (const q of councilMemberQuestions) {
    const key = `${q.session}/${q.scheduleId}`;
    let minutes = cache.get(key);
    if (!minutes) {
      minutes = await fetchMinutes(q.session, q.scheduleId);
      cache.set(key, minutes);
    }

    const minute = minutes.find((m) => m.minute_id === q.minuteId);
    const label = `${q.speechDate} ${q.member}「${q.title}」 minute=${q.minuteId}`;
    if (!minute) {
      failures.push(`${label}: 発言が見つからない`);
      continue;
    }
    if (minute.minute_type !== "◆質問") {
      failures.push(`${label}: 質問ではない（${minute.minute_type}）`);
      continue;
    }
    if (!minute.title.includes(`（${q.member}）`)) {
      failures.push(`${label}: 発言者が違う（${minute.title}）`);
      continue;
    }

    const opening = minute.body
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .slice(0, 2)
      .join(" ")
      .slice(0, 80);
    console.log(`OK ${label}\n   ${opening}`);
  }

  console.log(
    `\n${councilMemberQuestions.length - failures.length}/${councilMemberQuestions.length} 件が一致`
  );
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
