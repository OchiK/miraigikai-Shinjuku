/**
 * 会派ごとの賛否の出典（会期 slug ごと）。
 *
 * seed（賛否の転記・照合）と web（議決結果カードの出典表示）の両方で使う。
 * 賛否は新宿区議会（議会事務局）が定例会ごとに公開する「議案の概要と審議結果」表から
 * 転記している。同じ表は区議会だよりにも載るが、先に出る議会公式ページのPDFを出典にする
 * （docs/20260925_1330_会派賛否データ投入計画.md）。
 */
export type FactionStanceSource = {
  /** 画面に出す出典名 */
  label: string;
  url: string;
};

export const FACTION_STANCE_SOURCES: Record<string, FactionStanceSource> = {
  "r8-2": {
    label: "新宿区議会「議案の概要と審議結果」（令和8年第2回定例会）",
    url: "https://www.city.shinjuku.lg.jp/content/000459252.pdf",
  },
};

/** 会期の賛否の出典。出典の無い会期（slug が無い場合も含む）は null */
export function getFactionStanceSource(
  sessionSlug: string | null | undefined
): FactionStanceSource | null {
  if (!sessionSlug) return null;
  return FACTION_STANCE_SOURCES[sessionSlug] ?? null;
}
