export type FactionRecord = {
  id: string;
  display_name: string;
  alternative_names: string[];
};

type FactionMatch =
  | {
      kind: "matched";
      faction: FactionRecord;
      matchedBy: "display_name" | "alternative_name";
    }
  | { kind: "ambiguous"; candidates: FactionRecord[] }
  | { kind: "unmatched" };

const normalize = (name: string) => name.trim().toLowerCase();

/** 完全一致だけを使い、同じ優先順位で複数の会派に一致したら確定しない。 */
export function matchFaction(
  factions: FactionRecord[],
  name: string
): FactionMatch {
  const normalized = normalize(name);
  if (!normalized) return { kind: "unmatched" };
  for (const matchedBy of ["display_name", "alternative_name"] as const) {
    const candidates = factions.filter((faction) =>
      matchedBy === "display_name"
        ? normalize(faction.display_name) === normalized
        : faction.alternative_names.some(
            (alias) => normalize(alias) === normalized
          )
    );
    if (candidates.length === 1)
      return { kind: "matched", faction: candidates[0], matchedBy };
    if (candidates.length > 1) return { kind: "ambiguous", candidates };
  }
  return { kind: "unmatched" };
}
