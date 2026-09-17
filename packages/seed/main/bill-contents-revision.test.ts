import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";

/**
 * 解説の内容ハッシュを固定する。
 *
 * 主張台帳（docs/verification/20260917_1500_claim-ledger-step4-pilot.csv）の
 * `reviewed_content_sha256` は、どの本文に対して出典突合を行ったかを指す。
 * このテストは台帳を直接読み、本文から計算したハッシュと比較する。
 * 本文または台帳の一方だけを書き換えると失敗する。
 *
 * 実装計画の「Later content edits must invalidate review status」に対応する。
 *
 * 本文を意図して変更したときは、
 *   1. 変更後の本文を一次資料と突合し直す
 *   2. 台帳の該当行と `reviewed_content_sha256` を更新する
 * の順で対応すること。ハッシュだけ書き換えてはならない。
 */
const CLAIM_LEDGER_PATH = fileURLToPath(
  new URL(
    "../../../docs/verification/20260917_1500_claim-ledger-step4-pilot.csv",
    import.meta.url
  )
);

type ClaimLedgerRow = {
  item_key: string;
  difficulty: string;
  reviewed_content_sha256: string;
};

function reviewedContentHashesFromLedger(): Record<string, string> {
  const rows = parse(readFileSync(CLAIM_LEDGER_PATH, "utf8"), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as ClaimLedgerRow[];
  const hashes: Record<string, string> = {};

  for (const row of rows) {
    const key = `${row.item_key}:${row.difficulty}`;
    const previous = hashes[key];

    if (previous !== undefined && previous !== row.reviewed_content_sha256) {
      throw new Error(`台帳内で内容ハッシュが一致しません: ${key}`);
    }
    hashes[key] = row.reviewed_content_sha256;
  }

  return hashes;
}

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
    const reviewedContentSha256 = reviewedContentHashesFromLedger();
    const actual = Object.fromEntries(
      billContentsWithBillSlug
        .filter(
          (c) =>
            `${c.bill_slug}:${c.difficulty_level}` in reviewedContentSha256
        )
        .map((c) => [`${c.bill_slug}:${c.difficulty_level}`, contentSha256(c)])
    );

    expect(actual).toEqual(reviewedContentSha256);
  });

  it("台帳に載っている6変種がすべて存在する", () => {
    const reviewedContentSha256 = reviewedContentHashesFromLedger();
    const present = new Set(
      billContentsWithBillSlug.map((c) => `${c.bill_slug}:${c.difficulty_level}`)
    );

    expect(Object.keys(reviewedContentSha256)).toHaveLength(6);
    for (const key of Object.keys(reviewedContentSha256)) {
      expect(present.has(key), key).toBe(true);
    }
  });
});
