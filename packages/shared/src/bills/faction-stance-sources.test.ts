import { describe, expect, it } from "vitest";
import { getFactionStanceSource } from "./faction-stance-sources";

describe("getFactionStanceSource", () => {
  it("令和8年第2回定例会は区議会だより No.322 を出典にする", () => {
    expect(getFactionStanceSource("r8-2")).toEqual({
      label: "新宿区議会だより No.322（令和8年7月25日発行）",
      url: "https://www.city.shinjuku.lg.jp/content/000461727.pdf",
    });
  });

  it("出典の無い会期や slug の無い会期は null", () => {
    expect(getFactionStanceSource("r8-1")).toBeNull();
    expect(getFactionStanceSource(null)).toBeNull();
    expect(getFactionStanceSource(undefined)).toBeNull();
  });
});
