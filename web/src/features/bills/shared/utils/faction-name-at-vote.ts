/**
 * 採決後に会派名が変わったとき、採決時の名前を返す。変わっていなければ null。
 * 画面では現在の会派名に「（採決時：…）」を添える。
 */
export function getRenamedFactionNameAtVote(stance: {
  factionNameAtVote: string | null;
  faction: { display_name: string };
}): string | null {
  const { factionNameAtVote, faction } = stance;
  if (!factionNameAtVote || factionNameAtVote === faction.display_name) {
    return null;
  }
  return factionNameAtVote;
}

/**
 * 出典から転記した賛否（採決時の会派名を持つ行）が1件でもあるか。
 * 管理画面で入れた賛否だけの議案に、区議会だよりの出典を付けないために使う。
 */
export function hasSourcedStance(
  stances: { factionNameAtVote: string | null }[]
): boolean {
  return stances.some((stance) => stance.factionNameAtVote !== null);
}
