import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("BillCouncilorsSection visibility guard", () => {
  it("renders the section only behind the nonempty questions guard", () => {
    const layoutSource = readFileSync(
      new URL("./bill-detail-layout.tsx", import.meta.url),
      "utf8"
    );

    expect(layoutSource).toMatch(
      /relatedQuestions\.length > 0 && \(\s*<BillCouncilorsSection/
    );
  });
});
