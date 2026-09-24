/**
 * Rubyful V2 に渡すカスタム辞書（customReadings）。
 *
 * web のふりがなは外部スクリプト Rubyful V2 が付けている。全23議案で自動付与を
 * 確認したところ、以下の語で誤読が起きていたため、正しい読みを辞書で上書きする。
 *
 * - 在日米軍: 「在日／米（まい）／軍」と分割され「まい」と読まれる
 * - 角筈: 「かくはず」と読まれる（新宿区の地名）
 * - 百人町: 「ひゃくにんまち」と読まれる（新宿区の地名）
 * - 繰越明許費: 「明許」が「めい／もと」と読まれる
 * - 半角数字 + 月: 「3月」の「月」だけに「つき」と振られる
 *
 * Rubyful の API は最長一致で辞書を当てるため、「1月」と「11月」を同時に
 * 登録しても「11月」は「じゅういちがつ」になる。
 *
 * 「1日」（ついたち／いちにち）のように文脈で読みが割れる語は、一律に
 * 上書きすると別の誤読を生むため登録しない。
 *
 * 将来 admin で辞書を管理・プレビューする場合も、このモジュールを再利用する。
 */

/** 読みとして受け付ける文字（ひらがな・踊り字ゝゞ・長音符） */
const HIRAGANA_READING_PATTERN = /^[ぁ-ゖゝゞー]+$/;

const MONTH_READINGS: Record<string, string> = {
  "1月": "いちがつ",
  "2月": "にがつ",
  "3月": "さんがつ",
  "4月": "しがつ",
  "5月": "ごがつ",
  "6月": "ろくがつ",
  "7月": "しちがつ",
  "8月": "はちがつ",
  "9月": "くがつ",
  "10月": "じゅうがつ",
  "11月": "じゅういちがつ",
  "12月": "じゅうにがつ",
};

export const DEFAULT_RUBY_CUSTOM_READINGS: Readonly<Record<string, string>> =
  Object.freeze({
    // 在日米軍関係
    在日米軍: "ざいにちべいぐん",
    米軍: "べいぐん",
    // 新宿区の地名
    角筈: "つのはず",
    百人町: "ひゃくにんちょう",
    // 議会・財政用語
    繰越明許費: "くりこしめいきょひ",
    // 月表記
    ...MONTH_READINGS,
  });

/** 読みがひらがな（踊り字・長音符を含む）だけで書かれているか */
export function isValidRubyReading(reading: string): boolean {
  return HIRAGANA_READING_PATTERN.test(reading);
}

/** 語が空、または読みがひらがなでない項目の語を返す */
export function findInvalidRubyCustomReadings(
  readings: Readonly<Record<string, string>>
): string[] {
  return Object.entries(readings)
    .filter(
      ([word, reading]) => word.trim() === "" || !isValidRubyReading(reading)
    )
    .map(([word]) => word);
}

/** 既定の辞書に追加分を重ねる。同じ語は追加分の読みを優先する */
export function mergeRubyCustomReadings(
  base: Readonly<Record<string, string>>,
  overrides: Readonly<Record<string, string>>
): Record<string, string> {
  return { ...base, ...overrides };
}
