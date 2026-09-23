import { describe, expect, it } from "vitest";
import type { CouncilorCommittee } from "../types";
import {
  getCommitteeKind,
  groupCommitteesByKind,
  isCommitteeRole,
  sortCommittees,
} from "./committee-kind";

const committee = (
  name: string,
  sortOrder: number,
  role: CouncilorCommittee["role"] = "委員"
): CouncilorCommittee => ({
  id: name,
  name,
  role,
  kind: getCommitteeKind(name),
  sortOrder,
});

describe("getCommitteeKind", () => {
  it("正式名称から種別を判定する", () => {
    expect(getCommitteeKind("総務区民委員会")).toBe("standing");
    expect(getCommitteeKind("議会運営委員会")).toBe("steering");
    expect(getCommitteeKind("防災等安全対策特別委員会")).toBe("special");
    expect(getCommitteeKind("自治・議会・行財政改革等特別委員会")).toBe(
      "special"
    );
  });
});

describe("isCommitteeRole", () => {
  it("委員会内の役職だけを受け付ける", () => {
    expect(isCommitteeRole("委員長")).toBe(true);
    expect(isCommitteeRole("副委員長")).toBe(true);
    expect(isCommitteeRole("委員")).toBe(true);
    expect(isCommitteeRole("幹事長")).toBe(false);
  });
});

describe("sortCommittees / groupCommitteesByKind", () => {
  const input = [
    committee("本庁舎対策等特別委員会", 9),
    committee("議会運営委員会", 5),
    committee("環境建設委員会", 1, "委員長"),
  ];

  it("常任 → 議会運営 → 特別の順に並べる", () => {
    expect(sortCommittees(input).map((c) => c.name)).toEqual([
      "環境建設委員会",
      "議会運営委員会",
      "本庁舎対策等特別委員会",
    ]);
  });

  it("所属のある種別だけをラベル付きでまとめる", () => {
    const groups = groupCommitteesByKind([
      committee("環境建設委員会", 1),
      committee("本庁舎対策等特別委員会", 9),
    ]);
    expect(groups.map((g) => g.label)).toEqual(["常任委員会", "特別委員会"]);
  });
});
