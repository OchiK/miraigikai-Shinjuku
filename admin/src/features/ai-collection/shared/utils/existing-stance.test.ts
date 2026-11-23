import { describe, expect, it } from "vitest";
import type { ExistingBillDetail, FactionMatchStatus } from "../types";
import { findExistingStance } from "./existing-stance";

describe("findExistingStance", () => {
  const stances: ExistingBillDetail["factionStances"] = [
    {
      factionId: "rikken",
      factionName: "立憲民主党・無所属クラブ",
      type: "for",
      comment: null,
    },
    {
      factionId: "rikken-forum",
      factionName: "新宿区議会立憲フォーラム",
      type: "against",
      comment: null,
    },
  ];
  it("立憲は両会派に既存見解があっても一致しない", () => {
    const matches = new Map<string, FactionMatchStatus>([
      [
        "立憲",
        {
          factionName: "立憲",
          matchedFactionId: null,
          matchedDisplayName: null,
          matchedBy: null,
        },
      ],
    ]);
    expect(findExistingStance(stances, "立憲", matches)).toBeUndefined();
    expect(findExistingStance(stances, "未取得", matches)).toBeUndefined();
  });
  it("名前や並び順に依存せず解決したIDだけで探す", () => {
    const matches = new Map<string, FactionMatchStatus>([
      [
        "新立憲",
        {
          factionName: "新立憲",
          matchedFactionId: "rikken-forum",
          matchedDisplayName: "新宿区議会立憲フォーラム",
          matchedBy: "alternative_name",
        },
      ],
    ]);
    expect(findExistingStance(stances, "新立憲", matches)).toBe(stances[1]);
    expect(findExistingStance([], "新立憲", matches)).toBeUndefined();
  });
});
