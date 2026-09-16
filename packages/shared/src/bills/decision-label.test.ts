import { describe, expect, it } from "vitest";
import {
  getBillCardStatusLabel,
  getBillStatusLabel,
  getBillStatusVariant,
  resolveOfficialDecisionTerm,
} from "./decision-label";

describe("resolveOfficialDecisionTerm", () => {
  it("議決済みなら status_note の公式用語を拾う", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "本会議で承認",
      })?.label
    ).toBe("承認");
  });

  it("「原案可決」を「可決」より先に判定する", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "本会議で原案可決",
      })?.term
    ).toBe("原案可決");
  });

  it("「不採択」を「採択」より先に判定する", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "rejected",
        statusNote: "本会議で不採択",
      })?.term
    ).toBe("不採択");
  });

  it("審議中のステータスでは status_note を参照しない", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "in_committee",
        statusNote: "本会議で可決予定",
      })
    ).toBeNull();
  });

  it("status_note が無い・空白のみなら null を返す", () => {
    expect(
      resolveOfficialDecisionTerm({ status: "approved", statusNote: null })
    ).toBeNull();
    expect(
      resolveOfficialDecisionTerm({ status: "approved", statusNote: "   " })
    ).toBeNull();
  });

  it("既知の用語を含まない status_note は拾わない", () => {
    expect(
      resolveOfficialDecisionTerm({
        status: "approved",
        statusNote: "委員会に付託",
      })
    ).toBeNull();
  });
});

describe("getBillStatusLabel", () => {
  it("専決処分の承認を「可決」ではなく「承認」と表示する", () => {
    expect(
      getBillStatusLabel({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("承認");
  });

  it("原案可決は従来どおり「可決」と表示する", () => {
    expect(
      getBillStatusLabel({ status: "approved", statusNote: "本会議で原案可決" })
    ).toBe("可決");
  });

  it.each([
    ["preparing", "準備中"],
    ["submitted", "上程済み"],
    ["in_committee", "委員会審査中"],
    ["plenary_session", "本会議採決中"],
    ["approved", "可決"],
    ["rejected", "否決"],
    ["adopted", "採択"],
    ["partially_adopted", "趣旨採択"],
    ["reported", "専決処分報告"],
  ])("status_note が無ければ列挙から引く: %s", (status, expected) => {
    expect(getBillStatusLabel({ status })).toBe(expected);
  });

  it("未知のステータスはそのまま返す", () => {
    expect(getBillStatusLabel({ status: "unknown_status" })).toBe(
      "unknown_status"
    );
  });
});

describe("getBillCardStatusLabel", () => {
  it("専決処分の承認を「承認」と表示する", () => {
    expect(
      getBillCardStatusLabel({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("承認");
  });

  it.each([
    ["submitted", "議会審議中"],
    ["in_committee", "議会審議中"],
    ["plenary_session", "議会審議中"],
    ["approved", "可決"],
    ["rejected", "否決"],
    ["preparing", "議案上程前"],
  ])("status_note が無ければ簡略ラベルを返す: %s", (status, expected) => {
    expect(getBillCardStatusLabel({ status })).toBe(expected);
  });
});

describe("getBillStatusVariant", () => {
  it("承認は可決と同じ variant を使う", () => {
    expect(
      getBillStatusVariant({ status: "approved", statusNote: "本会議で承認" })
    ).toBe("default");
  });

  it("不採択は否決と同じ variant を使う", () => {
    expect(
      getBillStatusVariant({ status: "rejected", statusNote: "本会議で不採択" })
    ).toBe("dark");
  });

  it.each([
    ["submitted", "light"],
    ["in_committee", "light"],
    ["plenary_session", "light"],
    ["approved", "default"],
    ["reported", "default"],
    ["rejected", "dark"],
    ["preparing", "muted"],
  ])("status_note が無ければ列挙から引く: %s", (status, expected) => {
    expect(getBillStatusVariant({ status })).toBe(expected);
  });
});
