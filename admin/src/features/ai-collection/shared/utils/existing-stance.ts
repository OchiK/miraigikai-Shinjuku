import type { ExistingBillDetail, FactionMatchStatus } from "../types";

export function findExistingStance(
  stances: ExistingBillDetail["factionStances"],
  factionName: string,
  matches: Map<string, FactionMatchStatus>
): ExistingBillDetail["factionStances"][number] | undefined {
  const id = matches.get(factionName)?.matchedFactionId;
  return id == null
    ? undefined
    : stances.find((stance) => stance.factionId === id);
}
