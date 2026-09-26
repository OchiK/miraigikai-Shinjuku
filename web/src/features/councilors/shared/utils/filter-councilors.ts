import type {
  Councilor,
  CouncilorCommitteeGroup,
  CouncilorFactionGroup,
} from "../types";
import { compareCommittees, ROLE_ORDER } from "./committee-kind";

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

/**
 * 所属委員会ごとにまとめる。同じ議員が複数の委員会に出る。
 * 委員会は常任 → 議会運営 → 特別、同じ種別の中は委員会の表示順。
 * 委員会内は委員長 → 副委員長 → 委員、同じ役職の中は議席番号順。
 * 委員会の名前・種別・表示順は、その委員会に最初に出てきた議員の値を使う。
 * 所属のない議員はどのグループにも入らない。
 */
export function groupCouncilorsByCommittee(
  councilors: Councilor[]
): CouncilorCommitteeGroup[] {
  const groups = new Map<string, CouncilorCommitteeGroup>();
  for (const councilor of councilors) {
    for (const { role, ...committee } of councilor.committees) {
      const group = groups.get(committee.id) ?? { committee, members: [] };
      group.members.push({ councilor, role });
      groups.set(committee.id, group);
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      members: [...group.members].sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
          a.councilor.sortOrder - b.councilor.sortOrder
      ),
    }))
    .sort((a, b) => compareCommittees(a.committee, b.committee));
}

/** 委員会で絞り込む。null なら全件、存在しない id なら空 */
export function filterCommitteeGroups(
  groups: CouncilorCommitteeGroup[],
  committeeId: string | null
): CouncilorCommitteeGroup[] {
  if (committeeId === null) return groups;
  return groups.filter((g) => g.committee.id === committeeId);
}

/**
 * 委員会別表示の件数。people は複数の委員会に出る議員を1人と数える
 * （延べ人数を合計しない）
 */
export function countCommitteeView(groups: CouncilorCommitteeGroup[]): {
  committees: number;
  people: number;
} {
  const ids = new Set(
    groups.flatMap((g) => g.members.map((m) => m.councilor.id))
  );
  return { committees: groups.length, people: ids.size };
}
