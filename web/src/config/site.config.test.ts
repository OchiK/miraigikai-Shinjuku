import { describe, expect, it } from "vitest";
import { siteConfig } from "./site.config";

describe("siteConfig.operator", () => {
  it("運営者名は個人名を出さず「新宿区民A」に固定する", () => {
    expect(siteConfig.operator.name).toBe("新宿区民A");
  });
});
