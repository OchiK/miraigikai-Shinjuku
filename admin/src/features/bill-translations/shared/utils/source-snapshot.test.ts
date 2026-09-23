import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { describe, expect, it } from "vitest";
import {
  parseSourceSnapshot,
  toSourceSnapshot,
  verifySourceSnapshot,
} from "./source-snapshot";

const snapshot = {
  title: "区税条例の専決処分の承認",
  summary: "区長が区税条例を改正しました。",
  content: "# 見出し\n\n本文です。",
};

describe("toSourceSnapshot", () => {
  it("title / summary / content だけを取り出す", () => {
    const row = { ...snapshot, id: "x", difficulty_level: "normal" };
    expect(toSourceSnapshot(row)).toEqual(snapshot);
  });
});

describe("parseSourceSnapshot", () => {
  it("3つの文字列を持つオブジェクトはそのまま返す", () => {
    expect(parseSourceSnapshot(snapshot)).toEqual(snapshot);
  });

  it.each([
    ["null", null],
    ["文字列", "text"],
    ["配列", []],
    ["フィールド欠け", { title: "a", summary: "b" }],
    ["文字列以外の値", { title: "a", summary: "b", content: 1 }],
  ])("%s は null", (_label, value) => {
    expect(parseSourceSnapshot(value)).toBeNull();
  });
});

describe("verifySourceSnapshot", () => {
  const sourceHash = calculateSourceHash({
    difficulty_level: "normal",
    ...snapshot,
  });

  it("source_hash と一致するスナップショットを返す", () => {
    expect(
      verifySourceSnapshot({
        snapshot,
        difficultyLevel: "normal",
        sourceHash,
        hashSource: calculateSourceHash,
      })
    ).toEqual(snapshot);
  });

  it("source_hash と一致しなければ差分に使わない", () => {
    expect(
      verifySourceSnapshot({
        snapshot: { ...snapshot, content: "書き換えた本文" },
        difficultyLevel: "normal",
        sourceHash,
        hashSource: calculateSourceHash,
      })
    ).toBeNull();
  });

  it("難易度が違えば一致しない", () => {
    expect(
      verifySourceSnapshot({
        snapshot,
        difficultyLevel: "hard",
        sourceHash,
        hashSource: calculateSourceHash,
      })
    ).toBeNull();
  });

  it("スナップショットがない翻訳（記録前）は null", () => {
    expect(
      verifySourceSnapshot({
        snapshot: null,
        difficultyLevel: "normal",
        sourceHash,
        hashSource: calculateSourceHash,
      })
    ).toBeNull();
  });
});
