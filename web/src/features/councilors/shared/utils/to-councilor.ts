import type { Councilor, CouncilorCommittee } from "../types";
import {
  getCommitteeKind,
  isCommitteeRole,
  sortCommittees,
} from "./committee-kind";

/** council_members を会派・委員会つきで select した1行 */
export type CouncilorRow = {
  id: string;
  name: string;
  name_kana: string;
  faction_role: string | null;
  terms: number | null;
  official_url: string | null;
  website_url: string | null;
  sort_order: number;
  factions: { id: string; display_name: string; sort_order: number } | null;
  council_member_committees: {
    role: string;
    committees: { id: string; name: string; sort_order: number } | null;
  }[];
};

export function toCouncilor(row: CouncilorRow): Councilor {
  const committees: CouncilorCommittee[] =
    row.council_member_committees.flatMap(({ role, committees: committee }) =>
      committee && isCommitteeRole(role)
        ? [
            {
              id: committee.id,
              name: committee.name,
              role,
              kind: getCommitteeKind(committee.name),
              sortOrder: committee.sort_order,
            },
          ]
        : []
    );

  return {
    id: row.id,
    name: row.name,
    nameKana: row.name_kana,
    factionRole: row.faction_role,
    terms: row.terms,
    officialUrl: row.official_url,
    websiteUrl: row.website_url,
    sortOrder: row.sort_order,
    faction: row.factions
      ? {
          id: row.factions.id,
          displayName: row.factions.display_name,
          sortOrder: row.factions.sort_order,
        }
      : null,
    committees: sortCommittees(committees),
  };
}
