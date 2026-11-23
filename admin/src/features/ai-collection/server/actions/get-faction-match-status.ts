"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import type { FactionMatchStatus } from "../../shared/types";
import { matchFaction } from "../../shared/utils/faction-matching";

/**
 * 会派名リストに対して、DBの会派とのマッチング状況を返す。
 * display_name → alternative_names の完全一致だけで検索し、複数会派への一致は未一致扱いにする。
 */
export async function getFactionMatchStatus(
  factionNames: string[]
): Promise<FactionMatchStatus[]> {
  await requireAdmin();

  if (factionNames.length === 0) return [];

  const supabase = createAdminClient();
  const { data: allFactions } = await supabase
    .from("factions")
    .select("id, display_name, alternative_names");

  const factions = allFactions ?? [];

  return factionNames.map((searchName) => {
    const result = matchFaction(factions, searchName);
    if (result.kind !== "matched") {
      return {
        factionName: searchName,
        matchedFactionId: null,
        matchedDisplayName: null,
        matchedBy: null,
      };
    }

    return {
      factionName: searchName,
      matchedFactionId: result.faction.id,
      matchedDisplayName: result.faction.display_name,
      matchedBy: result.matchedBy,
    };
  });
}
