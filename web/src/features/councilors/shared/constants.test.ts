import { describe, expect, it } from "vitest";
import { COUNCILOR_SOURCES, QUESTION_SOURCES } from "./constants";

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** 「2026年8月7日」を英語表示の「August 7, 2026」にする */
function toEnglishDate(japaneseDate: string): string {
  const match = japaneseDate.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) throw new Error(`日付の形式が違います: ${japaneseDate}`);
  const [, year, month, day] = match;
  return `${EN_MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

// 日本語側の日付だけ更新して英語側を忘れると、英語表示に古い日付が出る
describe("出典の英語表記", () => {
  it("名簿の基準日が日本語と一致する", () => {
    expect(COUNCILOR_SOURCES.en.asOf).toBe(
      toEnglishDate(COUNCILOR_SOURCES.asOf)
    );
  });

  it("Xアカウントの確認日が日本語と一致する", () => {
    expect(COUNCILOR_SOURCES.en.xAccountsAsOf).toBe(
      toEnglishDate(COUNCILOR_SOURCES.xAccounts.asOf)
    );
  });

  it("質問要約の作成日が日本語と一致する", () => {
    expect(QUESTION_SOURCES.en.asOf).toBe(toEnglishDate(QUESTION_SOURCES.asOf));
  });
});
