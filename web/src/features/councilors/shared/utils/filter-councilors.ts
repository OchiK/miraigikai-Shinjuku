import type { Councilor, CouncilorFactionGroup } from "../types";

/** カタカナをひらがなに寄せ、空白を除く（検索語と氏名の両方に使う） */
export function normalizeSearchText(text: string): string {
  return text
    .replace(/[\s　]+/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/**
 * 会派と検索語で絞り込む。検索語は氏名・ふりがなの部分一致で、
 * 空白の有無とひらがな／カタカナの違いを無視する。
 */
export function filterCouncilors(
  councilors: Councilor[],
  { factionId, query }: { factionId: string | null; query: string }
): Councilor[] {
  const needle = normalizeSearchText(query);
  return councilors.filter((c) => {
    if (factionId && c.faction?.id !== factionId) return false;
    if (!needle) return true;
    return (
      normalizeSearchText(c.name).includes(needle) ||
      normalizeSearchText(c.nameKana).includes(needle)
    );
  });
}

/**
 * 会派の表示順でまとめ、会派内は議席番号順に並べる。会派の無い議員は最後。
 */
export function groupCouncilorsByFaction(
  councilors: Councilor[]
): CouncilorFactionGroup[] {
  const groups = new Map<string, CouncilorFactionGroup>();
  for (const councilor of councilors) {
    const key = councilor.faction?.id ?? "";
    const group = groups.get(key) ?? {
      faction: councilor.faction,
      councilors: [],
    };
    group.councilors.push(councilor);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      councilors: [...group.councilors].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
    }))
    .sort(
      (a, b) =>
        (a.faction?.sortOrder ?? Number.POSITIVE_INFINITY) -
        (b.faction?.sortOrder ?? Number.POSITIVE_INFINITY)
    );
}
