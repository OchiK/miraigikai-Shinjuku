import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";

/**
 * 解説の内容ハッシュを固定する。
 *
 * 主張台帳（docs/verification/20260917_1500_claim-ledger-step4-pilot.csv）の
 * `reviewed_content_sha256` は、どの本文に対して出典突合を行ったかを指す。
 * 本文を編集するとこのテストが落ちるので、台帳を更新せずに内容だけが
 * 書き換わることを防げる。
 *
 * 実装計画の「Later content edits must invalidate review status」に対応する。
 *
 * 本文を意図して変更したときは、
 *   1. 変更後の本文を一次資料と突合し直す
 *   2. 台帳の該当行と `reviewed_content_sha256` を更新する
 *   3. このテストの期待値を更新する
 * の順で対応すること。ハッシュだけ書き換えてはならない。
 */
const REVIEWED_CONTENT_SHA256: Record<string, string> = {
  "shinjuku-2026-r2-gian-43:normal":
    "942a14c6d64a722d2c4d2de8831cf81c4fde9a5aebb7a6037903cc5f9765d1dd",
  "shinjuku-2026-r2-gian-43:hard":
    "4743c3041b7ffedaf31298188955a0cd550839f65ea9a406ad8e942485412b15",
  "shinjuku-2026-r2-gian-44:normal":
    "9ccfbfcd99e7f5af2c25d944ca54e8c53abb4198ae895f79dd7d923070144415",
  "shinjuku-2026-r2-gian-44:hard":
    "8e6be6547643e7f2dc6216b6e3e57b77d1f433a7963fe710c70145dc45c9ae3d",
  "shinjuku-2026-r2-shonin-2:normal":
    "3e549c30e7cd1e8e9cb65d48a152fc1bc305f43611d8064ec1a22508285091a4",
  "shinjuku-2026-r2-shonin-2:hard":
    "1711d32e05e3fd6b142de0ec54ec6e6a31420dcdaade004f343792e9d79aaf99",
};

function contentSha256(c: {
  title: string;
  summary: string;
  content: string;
}): string {
  return createHash("sha256")
    .update(`${c.title}\n${c.summary}\n${c.content}`, "utf8")
    .digest("hex");
}

describe("ステップ4パイロットの解説の内容ハッシュ", () => {
  it("台帳が突合した本文から変わっていない", () => {
    const actual = Object.fromEntries(
      billContentsWithBillSlug
        .filter(
          (c) => `${c.bill_slug}:${c.difficulty_level}` in REVIEWED_CONTENT_SHA256
        )
        .map((c) => [`${c.bill_slug}:${c.difficulty_level}`, contentSha256(c)])
    );

    expect(actual).toEqual(REVIEWED_CONTENT_SHA256);
  });

  it("台帳に載っている6変種がすべて存在する", () => {
    const present = new Set(
      billContentsWithBillSlug.map((c) => `${c.bill_slug}:${c.difficulty_level}`)
    );

    for (const key of Object.keys(REVIEWED_CONTENT_SHA256)) {
      expect(present.has(key), key).toBe(true);
    }
  });
});
