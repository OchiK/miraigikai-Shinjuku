import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import { buildItemKey, r8SecondSessionItems } from "./shinjuku-r8-2-inventory";

/**
 * 解説の内容ハッシュを固定する。
 *
 * 主張台帳の `reviewed_content_sha256` は、どの本文に対して出典突合を行ったかを指す。
 * このテストは台帳を直接読み、本文から計算したハッシュと比較する。
 * 本文または台帳の一方だけを書き換えると失敗する。
 *
 * 実装計画の「Later content edits must invalidate review status」に対応する。
 *
 * 本文を意図して変更したときは、
 *   1. 変更後の本文を一次資料と突合し直す
 *   2. 台帳の該当行と `reviewed_content_sha256` を更新する
 * の順で対応すること。ハッシュだけ書き換えてはならない。
 *
 * 台帳はステップごとに分かれている。すべてを読み、突合済みの全変種を対象とする。
 */
const CLAIM_LEDGER_PATHS = [
  "../../../docs/verification/20260917_1200_final-content-ledger-r8-2.csv",
  "../../../docs/verification/20260917_1500_claim-ledger-step4-pilot.csv",
  "../../../docs/verification/20260917_2000_claim-ledger-step4-rest.csv",
].map((relative) => fileURLToPath(new URL(relative, import.meta.url)));

const ORIGINAL_CLAIM_LEDGER_PATH = fileURLToPath(
  new URL(
    "../../../docs/verification/20260917_1000_claim-ledger-r8-2.csv",
    import.meta.url
  )
);

type ClaimLedgerRow = {
  item_key: string;
  difficulty: string;
  reviewed_content_sha256: string;
};

function reviewedContentHashesFromLedger(): Record<string, string> {
  const hashes: Record<string, string> = {};

  for (const ledgerPath of CLAIM_LEDGER_PATHS) {
    const rows = parse(readFileSync(ledgerPath, "utf8"), {
      bom: true,
      columns: true,
      skip_empty_lines: true,
    }) as ClaimLedgerRow[];

    for (const row of rows) {
      const key = `${row.item_key}:${row.difficulty}`;
      const previous = hashes[key];

      if (previous !== undefined && previous !== row.reviewed_content_sha256) {
        throw new Error(`台帳内で内容ハッシュが一致しません: ${key}`);
      }
      hashes[key] = row.reviewed_content_sha256;
    }
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

describe("ステップ4の解説の内容ハッシュ", () => {
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

  it("46変種すべてがハッシュ固定されている", () => {
    // 台帳に載っている変種だけを突き合わせると、
    // 「台帳に行を書かずに解説だけ足す」と全テストが通ってしまう。
    // 対象外の集合を明示的に固定し、新しい解説が黙って素通りしないようにする。
    //
    const pinned = reviewedContentHashesFromLedger();
    const unpinned = billContentsWithBillSlug
      .map((c) => `${c.bill_slug}:${c.difficulty_level}`)
      .filter((key) => !(key in pinned))
      .sort();

    expect(unpinned).toEqual([]);
    expect(Object.keys(pinned)).toHaveLength(46);
  });

  it("台帳に載っている変種はすべて実在する", () => {
    // 逆向き。台帳にあって本文に無い行（案件の削除・改名）を検出する。
    const pinned = reviewedContentHashesFromLedger();
    const present = new Set(
      billContentsWithBillSlug.map((c) => `${c.bill_slug}:${c.difficulty_level}`)
    );

    for (const key of Object.keys(pinned)) {
      expect(present.has(key), key).toBe(true);
    }
  });
});

describe("主張台帳の監査証跡", () => {
  it("改訂前台帳の全行に出典・ハッシュ・位置・証拠がある", () => {
    const rows = parse(readFileSync(ORIGINAL_CLAIM_LEDGER_PATH, "utf8"), {
      bom: true,
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const incomplete = rows
      .filter(
        (row) =>
          !row.source_url ||
          !row.source_sha256 ||
          !row.page_or_section ||
          !row.evidence_excerpt
      )
      .map((row) => row.claim_id);

    expect(incomplete).toEqual([]);
  });

  it("最終稿台帳の全行に有効な本文ハッシュがある", () => {
    const invalid: string[] = [];

    for (const ledgerPath of CLAIM_LEDGER_PATHS) {
      const rows = parse(readFileSync(ledgerPath, "utf8"), {
        bom: true,
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, string>[];
      for (const row of rows) {
        if (!/^[0-9a-f]{64}$/.test(row.reviewed_content_sha256 ?? "")) {
          invalid.push(row.claim_id);
        }
      }
    }

    expect(invalid).toEqual([]);
  });
});

describe("ステップ4残り15件の主張台帳の構造", () => {
  // ハッシュは台帳の1列を書き換えるだけで通ってしまう。
  // 台帳そのものの不変条件を別に固定し、ハッシュとは独立した歯止めを置く。
  const rows = parse(
    readFileSync(CLAIM_LEDGER_PATHS[2], "utf8"),
    { bom: true, columns: true, skip_empty_lines: true }
  ) as Record<string, string>[];

  it("判定は supported か needs_source のいずれかである", () => {
    // 未解決の contradicted / unsupported を公開可能な本文に残さないための番人。
    // 綴り間違いも弾く。
    const verdicts = [...new Set(rows.map((r) => r.verdict))].sort();
    expect(verdicts).toEqual(["needs_source", "supported"]);
  });

  it("claim_id が一意である", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("主張・出典・引用がいずれも空でない", () => {
    const incomplete = rows
      .filter(
        (r) => !r.final_claim || !r.source_url || !r.evidence_excerpt || !r.page_or_section
      )
      .map((r) => r.claim_id);

    expect(incomplete).toEqual([]);
  });

  it("item_key がインベントリの安定識別子と一致する", () => {
    const known = new Set(r8SecondSessionItems.map(buildItemKey));
    const unknown = [...new Set(rows.map((r) => r.item_key))].filter(
      (key) => !known.has(key)
    );

    expect(unknown).toEqual([]);
  });

  it("各変種が title / summary / content すべての行を持つ", () => {
    // 内容ハッシュは title + summary + content を対象にしている。
    // 台帳が content しか押さえていないと、要約だけが出典と食い違っても
    // 誰も気付けない（実際にこの穴で第60号議案の要約に誤りが入った）。
    // 被覆範囲をハッシュの対象と揃える。
    const byVariant = new Map<string, Set<string>>();
    for (const row of rows) {
      const key = `${row.item_key}:${row.difficulty}`;
      const fields = byVariant.get(key) ?? new Set<string>();
      fields.add(row.content_field);
      byVariant.set(key, fields);
    }

    const incomplete = [...byVariant.entries()]
      .filter(([, fields]) =>
        ["title", "summary", "content"].some((f) => !fields.has(f))
      )
      .map(([key]) => key)
      .sort();

    expect(incomplete).toEqual([]);
    expect(byVariant.size).toBe(30);
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    // ハッシュとは独立した歯止め。
    // 本文に別の出典を足して台帳を更新し忘れると落ちる。
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const itemKeys = new Set(rows.map((r) => r.item_key));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!itemKeys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});
