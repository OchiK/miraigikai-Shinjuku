export type CommitteeRole = "委員長" | "副委員長" | "委員";

/** 常任委員会 / 議会運営委員会 / 特別委員会 */
export type CommitteeKind = "standing" | "steering" | "special";

export type CouncilorCommittee = {
  id: string;
  name: string;
  role: CommitteeRole;
  kind: CommitteeKind;
  sortOrder: number;
};

export type CouncilorFaction = {
  id: string;
  displayName: string;
  sortOrder: number;
};

export type Councilor = {
  id: string;
  name: string;
  nameKana: string;
  /** 会派内の役職（幹事長・会計など） */
  factionRole: string | null;
  terms: number | null;
  officialUrl: string | null;
  websiteUrl: string | null;
  sortOrder: number;
  faction: CouncilorFaction | null;
  committees: CouncilorCommittee[];
};

export type CouncilorFactionGroup = {
  faction: CouncilorFaction | null;
  councilors: Councilor[];
};
