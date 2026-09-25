/**
 * 更新検知をその日に走らせるかを決める純粋関数。
 *
 * ワークフローは平日毎日起動し、ここで「走らせる」と決めた日だけ本体を実行する。
 * 会期中（とその前後）は平日毎日、それ以外は週1回（月曜）にする。
 */

/** 年をまたがない月日の範囲（両端を含む） */
export interface MonthDayWindow {
  /** 対応する定例会（コメント・ログ用） */
  label: string;
  from: { month: number; day: number };
  to: { month: number; day: number };
}

/**
 * 平日毎日実行する期間。年によらず同じ月日で繰り返す。
 *
 * 新宿区の定例会は毎年ほぼ同じ時期に開かれるため、年ごとの日付ではなく月日の範囲で持つ
 * （年ごとの日付だと、更新を忘れたときに黙って週1回に落ちる）。
 * 範囲は、公式サイトで確認した実績の「開会の約2週間前」から「議決結果の掲載の約1週間後」まで。
 * 開会日を確かめられたのは令和8年（第4回は令和7年）の1回分だけで、議決結果の掲載日は
 * 令和7・8年の両方を見た。例年と大きくずれる年があれば、この表を直すこと。提出議案ページは開会の約1週間前に載る
 * （令和8年第3回: 9月8日掲載、9月16日開会）。
 *
 * - 第1回: 会期 2/17〜3/24（R8）、議決結果 3/24（R7・R8）
 * - 第2回: 会期 6/10〜6/19（R8）、議決結果 6/19（R7・R8）
 * - 第3回: 会期 9/16〜10/15（R8）、議決結果 10/20（R7）
 * - 第4回: 会期 11/26〜12/5（R7）、議決結果 12/5（R7）。年末の臨時会（12/26・12/27）も含める。
 *   年をまたげないため、終わりは臨時会の約1週間後ではなく 12/31 で打ち切る
 *
 * 臨時会は時期が決まっておらず、ここでは拾いきれない。月曜の定期実行で見つかれば、
 * 下書きPRが開いている間は毎日実行に切り替わる（decideRun の hasOpenDraftPr）。
 */
export const SESSION_WINDOWS: MonthDayWindow[] = [
  {
    label: "第1回定例会",
    from: { month: 2, day: 1 },
    to: { month: 3, day: 31 },
  },
  {
    label: "第2回定例会",
    from: { month: 5, day: 25 },
    to: { month: 6, day: 30 },
  },
  {
    label: "第3回定例会",
    from: { month: 9, day: 1 },
    to: { month: 10, day: 27 },
  },
  {
    label: "第4回定例会",
    from: { month: 11, day: 10 },
    to: { month: 12, day: 31 },
  },
];

/** 会期外に実行する曜日（0=日曜 … 1=月曜） */
export const WEEKLY_RUN_DAY = 1;

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 日本時間の月・日・曜日。GitHub Actions のランナーは UTC で動くため明示的に変換する */
export function toJstDate(now: Date): {
  month: number;
  day: number;
  weekday: number;
} {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  return {
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
    weekday: jst.getUTCDay(),
  };
}

const toOrdinal = ({ month, day }: { month: number; day: number }) =>
  month * 100 + day;

export function findSessionWindow(
  now: Date,
  windows: MonthDayWindow[] = SESSION_WINDOWS
): MonthDayWindow | null {
  const today = toOrdinal(toJstDate(now));
  return (
    windows.find(
      (window) =>
        toOrdinal(window.from) <= today && today <= toOrdinal(window.to)
    ) ?? null
  );
}

export interface RunDecisionInput {
  now: Date;
  /** GITHUB_EVENT_NAME（schedule / workflow_dispatch など） */
  eventName: string;
  /** 更新検知の下書きPRが開いているか */
  hasOpenDraftPr: boolean;
  windows?: MonthDayWindow[];
}

export interface RunDecision {
  run: boolean;
  reason: string;
}

/**
 * 下書きPRの open 件数（`gh pr list … --jq length` の出力）を読む。
 * 空文字や数字以外を 0 件と読むと、gh の失敗が「PRなし」に化けるため停止する。
 */
export function parseOpenDraftPrCount(value: string | undefined): number {
  const trimmed = value?.trim() ?? "";
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`OPEN_DRAFT_PR_COUNT が不正: "${value ?? ""}"`);
  }
  return Number(trimmed);
}

export function decideRun(input: RunDecisionInput): RunDecision {
  if (input.eventName !== "schedule") {
    return { run: true, reason: `手動実行（${input.eventName}）` };
  }
  const window = findSessionWindow(input.now, input.windows);
  if (window) {
    return { run: true, reason: `${window.label}の期間中（毎日実行）` };
  }
  if (input.hasOpenDraftPr) {
    return {
      run: true,
      reason: "更新検知の下書きPRが開いている（毎日実行）",
    };
  }
  if (toJstDate(input.now).weekday === WEEKLY_RUN_DAY) {
    return { run: true, reason: "会期外の週次実行（月曜）" };
  }
  return { run: false, reason: "会期外のため見送り（次は月曜に実行）" };
}
