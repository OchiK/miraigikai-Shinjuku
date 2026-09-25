import { describe, expect, it } from "vitest";
import {
  decideRun,
  findSessionWindow,
  type MonthDayWindow,
  parseOpenDraftPrCount,
  SESSION_WINDOWS,
  toJstDate,
} from "./schedule";

/** 日本時間 09:00（ワークフローの起動時刻 00:00 UTC）の Date */
const jst9am = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

const scheduled = (isoDate: string, hasOpenDraftPr = false) =>
  decideRun({ now: jst9am(isoDate), eventName: "schedule", hasOpenDraftPr });

describe("toJstDate", () => {
  it("UTC の前日夜は日本時間の翌日として扱う", () => {
    // 2026-09-30T15:30Z = 2026-10-01 00:30 JST（木曜）
    expect(toJstDate(new Date("2026-09-30T15:30:00Z"))).toEqual({
      month: 10,
      day: 1,
      weekday: 4,
    });
  });
});

describe("findSessionWindow", () => {
  it.each([
    // 公式サイトで確認した実績の日付が、すべて毎日実行の期間に入る
    ["2026-02-17", "第1回定例会"], // 開会
    ["2026-03-24", "第1回定例会"], // 議決結果の掲載
    ["2025-03-31", "第1回定例会"], // 臨時会
    ["2026-06-10", "第2回定例会"],
    ["2026-06-19", "第2回定例会"],
    ["2026-09-08", "第3回定例会"], // 提出議案ページの掲載
    ["2026-10-15", "第3回定例会"],
    ["2025-10-20", "第3回定例会"], // 議決結果の掲載（R7）
    ["2025-11-26", "第4回定例会"],
    ["2025-12-26", "第4回定例会"], // 臨時会
  ])("%s は%sの期間", (date, label) => {
    expect(findSessionWindow(jst9am(date))?.label).toBe(label);
  });

  it.each([
    "2026-01-15",
    "2026-04-20",
    "2026-07-21",
    "2026-08-18",
  ])("%s は会期外", (date) => {
    expect(findSessionWindow(jst9am(date))).toBeNull();
  });

  it.each([
    ["2026-01-31", null],
    ["2026-02-01", "第1回定例会"],
    ["2026-03-31", "第1回定例会"],
    ["2026-04-01", null],
    ["2026-05-24", null],
    ["2026-05-25", "第2回定例会"],
    ["2026-06-30", "第2回定例会"],
    ["2026-07-01", null],
    ["2026-08-31", null],
    ["2026-09-01", "第3回定例会"],
    ["2026-10-27", "第3回定例会"],
    ["2026-10-28", null],
    ["2026-11-09", null],
    ["2026-11-10", "第4回定例会"],
    ["2026-12-31", "第4回定例会"],
  ])("境界: %s → %s", (date, label) => {
    expect(findSessionWindow(jst9am(date))?.label ?? null).toBe(label);
  });

  it("日本時間で判定する（UTC では前日の 8/31 でも、日本時間 9/1 なら期間内）", () => {
    expect(findSessionWindow(new Date("2026-08-31T15:00:00Z"))?.label).toBe(
      "第3回定例会"
    );
  });

  it("渡した期間で判定する", () => {
    const windows: MonthDayWindow[] = [
      { label: "試験", from: { month: 7, day: 1 }, to: { month: 7, day: 31 } },
    ];
    expect(findSessionWindow(jst9am("2026-07-15"), windows)?.label).toBe(
      "試験"
    );
  });

  it("期間は年をまたがず、重ならない", () => {
    const ordinal = (d: { month: number; day: number }) =>
      d.month * 100 + d.day;
    const sorted = [...SESSION_WINDOWS].sort(
      (a, b) => ordinal(a.from) - ordinal(b.from)
    );
    for (const [i, window] of sorted.entries()) {
      expect(ordinal(window.from)).toBeLessThanOrEqual(ordinal(window.to));
      if (i > 0) {
        expect(ordinal(sorted[i - 1].to)).toBeLessThan(ordinal(window.from));
      }
    }
  });
});

describe("decideRun", () => {
  it("手動実行は会期に関係なく実行する", () => {
    expect(
      decideRun({
        now: jst9am("2026-07-22"),
        eventName: "workflow_dispatch",
        hasOpenDraftPr: false,
      }).run
    ).toBe(true);
  });

  it("会期中は平日なら毎日実行する", () => {
    // 2026-09-16 は水曜
    expect(scheduled("2026-09-16")).toEqual({
      run: true,
      reason: "第3回定例会の期間中（毎日実行）",
    });
  });

  it("手動実行の理由にイベント名を残す", () => {
    expect(
      decideRun({
        now: jst9am("2026-07-22"),
        eventName: "workflow_dispatch",
        hasOpenDraftPr: false,
      }).reason
    ).toBe("手動実行（workflow_dispatch）");
  });

  it("会期中かつ下書きPRありなら、理由は会期を優先する", () => {
    expect(scheduled("2026-09-16", true).reason).toBe(
      "第3回定例会の期間中（毎日実行）"
    );
  });

  it("会期外の月曜かつ下書きPRありなら、理由は下書きPRを優先する", () => {
    expect(scheduled("2026-07-20", true).reason).toBe(
      "更新検知の下書きPRが開いている（毎日実行）"
    );
  });

  it("曜日も日本時間で判定する（UTC 日曜 15:00 = 日本時間 月曜 0:00）", () => {
    expect(
      decideRun({
        now: new Date("2026-07-19T15:00:00Z"),
        eventName: "schedule",
        hasOpenDraftPr: false,
      })
    ).toEqual({ run: true, reason: "会期外の週次実行（月曜）" });
  });

  it("会期外は月曜だけ実行する", () => {
    expect(scheduled("2026-07-20").run).toBe(true); // 月曜
    expect(scheduled("2026-07-21")).toEqual({
      run: false,
      reason: "会期外のため見送り（次は月曜に実行）",
    });
  });

  it("会期外でも、下書きPRが開いていれば実行する（時期の決まっていない臨時会を追う）", () => {
    expect(scheduled("2026-07-22", true)).toEqual({
      run: true,
      reason: "更新検知の下書きPRが開いている（毎日実行）",
    });
  });
});

describe("parseOpenDraftPrCount", () => {
  it.each([
    ["0", 0],
    ["2", 2],
    [" 1\n", 1],
  ])("%j → %d", (value, count) => {
    expect(parseOpenDraftPrCount(value)).toBe(count);
  });

  it.each([
    undefined,
    "",
    "abc",
    "-1",
    "1.5",
  ])("%j は gh の失敗を「PRなし」にしないよう停止する", (value) => {
    expect(() => parseOpenDraftPrCount(value)).toThrow(/OPEN_DRAFT_PR_COUNT/);
  });
});
