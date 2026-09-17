import { describe, expect, it } from "vitest";
import { difficultyLevelsToFetch } from "./difficulty-levels-to-fetch";

describe("difficultyLevelsToFetch", () => {
  it("やさしい はフォールバック（ふつう）も取得する", () => {
    expect(difficultyLevelsToFetch("easy")).toEqual(["easy", "normal"]);
  });

  it("ふつう は自身だけを取得する", () => {
    expect(difficultyLevelsToFetch("normal")).toEqual(["normal"]);
  });

  it("くわしく はフォールバックしない（未整備に気づけるようにする）", () => {
    expect(difficultyLevelsToFetch("hard")).toEqual(["hard"]);
  });
});
