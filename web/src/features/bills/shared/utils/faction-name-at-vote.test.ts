import { describe, expect, it } from "vitest";
import {
  getRenamedFactionNameAtVote,
  hasSourcedStance,
} from "./faction-name-at-vote";

const faction = { display_name: "いのちの党 新宿" };

describe("getRenamedFactionNameAtVote", () => {
  it("採決後に名前が変わった会派は、採決時の名前を返す", () => {
    expect(
      getRenamedFactionNameAtVote({
        factionNameAtVote: "れいわ新選組 新宿",
        faction,
      })
    ).toBe("れいわ新選組 新宿");
  });

  it("名前が変わっていなければ null", () => {
    expect(
      getRenamedFactionNameAtVote({
        factionNameAtVote: "いのちの党 新宿",
        faction,
      })
    ).toBeNull();
  });

  it("出典の無い賛否（採決時の名前が無い）は null", () => {
    expect(
      getRenamedFactionNameAtVote({ factionNameAtVote: null, faction })
    ).toBeNull();
  });
});

describe("hasSourcedStance", () => {
  it("採決時の会派名を持つ賛否が1件でもあれば true", () => {
    expect(
      hasSourcedStance([
        { factionNameAtVote: null },
        { factionNameAtVote: "新宿未来の会" },
      ])
    ).toBe(true);
  });

  it("管理画面で入れた賛否（採決時の会派名なし）だけなら false", () => {
    expect(hasSourcedStance([{ factionNameAtVote: null }])).toBe(false);
    expect(hasSourcedStance([])).toBe(false);
  });
});
