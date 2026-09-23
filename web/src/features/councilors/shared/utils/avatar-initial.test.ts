import { describe, expect, it } from "vitest";
import { getAvatarInitial, getAvatarTone } from "./avatar-initial";

describe("getAvatarInitial", () => {
  it("姓の頭文字を返す", () => {
    expect(getAvatarInitial("木もと ひろゆき")).toBe("木");
    expect(getAvatarInitial("のづ ケン")).toBe("の");
    expect(getAvatarInitial("志田 雄一郎")).toBe("志");
  });

  it("全角スペース区切りや前後の空白でも姓の頭文字を返す", () => {
    expect(getAvatarInitial("　たなえ　ひさし")).toBe("た");
  });

  it("サロゲートペアの文字を分割しない", () => {
    expect(getAvatarInitial("𠮷田 花子")).toBe("𠮷");
  });

  it("空文字では空文字を返す", () => {
    expect(getAvatarInitial("")).toBe("");
  });
});

describe("getAvatarTone", () => {
  it("同じキーには常に同じ色を返す", () => {
    const key = "0b5c1d2e-0000-4000-8000-000000000001";
    expect(getAvatarTone(key)).toBe(getAvatarTone(key));
  });

  it("3色のいずれかを返し、キーによって色が分かれる", () => {
    const tones = new Set(
      Array.from({ length: 30 }, (_, i) => getAvatarTone(`member-${i}`))
    );
    expect(tones).toEqual(new Set(["terracotta", "sage", "neutral"]));
  });
});
