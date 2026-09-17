import { describe, expect, it } from "vitest";
import { getCardStatusLabel, getStatusVariant } from "./bill-status";

describe("getCardStatusLabel", () => {
  it.each([
    ["submitted", "議会審議中"],
    ["in_committee", "議会審議中"],
    ["plenary_session", "議会審議中"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getCardStatusLabel(status)).toBe(expected);
  });

  it("approved → 可決", () => {
    expect(getCardStatusLabel("approved")).toBe("可決");
  });

  it("rejected → 否決", () => {
    expect(getCardStatusLabel("rejected")).toBe("否決");
  });

  it("preparing → 議案上程前", () => {
    expect(getCardStatusLabel("preparing")).toBe("議案上程前");
  });
});

describe("getStatusVariant", () => {
  it.each([
    ["submitted", "light"],
    ["in_committee", "light"],
    ["plenary_session", "light"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getStatusVariant(status)).toBe(expected);
  });

  it("approved → default", () => {
    expect(getStatusVariant("approved")).toBe("default");
  });

  it("rejected → dark", () => {
    expect(getStatusVariant("rejected")).toBe("dark");
  });

  it("preparing → muted", () => {
    expect(getStatusVariant("preparing")).toBe("muted");
  });
});

describe("議決用語（status_note）の反映", () => {
  it("専決処分の承認を「可決」ではなく「承認」と表示する", () => {
    expect(getCardStatusLabel("approved", "本会議で承認")).toBe("承認");
  });

  it("原案可決は従来どおり「可決」と表示する", () => {
    expect(getCardStatusLabel("approved", "本会議で原案可決")).toBe("可決");
  });

  it("承認の variant は可決と同じ", () => {
    expect(getStatusVariant("approved", "本会議で承認")).toBe("default");
  });
});
