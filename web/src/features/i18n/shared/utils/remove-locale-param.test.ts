import { describe, expect, it } from "vitest";
import { removeLocaleParam } from "./remove-locale-param";

describe("removeLocaleParam", () => {
  it("?lang が無ければ null", () => {
    expect(removeLocaleParam("https://example.com/bills/1")).toBeNull();
    expect(
      removeLocaleParam("https://example.com/bills/1?difficulty=easy")
    ).toBeNull();
  });

  it("?lang だけを外し、ほかのパラメータとハッシュは残す", () => {
    expect(
      removeLocaleParam(
        "https://example.com/bills/1?lang=en&difficulty=easy#summary"
      )
    ).toBe("https://example.com/bills/1?difficulty=easy#summary");
  });

  it("?lang しか無ければクエリごと消える", () => {
    expect(removeLocaleParam("https://example.com/?lang=ja")).toBe(
      "https://example.com/"
    );
  });
});
