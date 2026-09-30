import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import { buildItemKey, r8SecondSessionItems } from "./shinjuku-r8-2-inventory";
import {
  R8_3_SUBMISSIONS_URL,
  buildR8_3ItemKey,
  r8ThirdSessionItems,
} from "./shinjuku-r8-3-inventory";

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
function ledgerPath(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

/** ステップ3の5件（最終稿）の台帳。 */
const STEP3_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260917_1200_final-content-ledger-r8-2.csv"
);

/** ステップ4パイロット3件の台帳。 */
const STEP4_PILOT_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260917_1500_claim-ledger-step4-pilot.csv"
);

/** ステップ4残り15件の台帳（構造の不変条件をここで固定している）。 */
const STEP4_REST_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260917_2000_claim-ledger-step4-rest.csv"
);

/** normal / hard 版の突合記録。 */
const NORMAL_CLAIM_LEDGER_PATHS = [
  STEP3_CLAIM_LEDGER_PATH,
  STEP4_PILOT_CLAIM_LEDGER_PATH,
  STEP4_REST_CLAIM_LEDGER_PATH,
];

/** やさしい日本語版（easy）の突合記録。 */
const EASY_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260918_0930_claim-ledger-phase2-easy.csv"
);

/** 議員提出議案4件（第7〜10号）の easy / normal / hard 版の突合記録。 */
const GIIN_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260925_2000_claim-ledger-giin-r8-2.csv"
);

/** 令和8年第3回定例会の22件（第63〜80号議案、認定第1〜4号）の easy / normal / hard 版の突合記録。 */
const R8_3_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260930_0910_claim-ledger-r8-3.csv"
);

const CLAIM_LEDGER_PATHS = [
  ...NORMAL_CLAIM_LEDGER_PATHS,
  EASY_CLAIM_LEDGER_PATH,
  GIIN_CLAIM_LEDGER_PATH,
  R8_3_CLAIM_LEDGER_PATH,
];

const ORIGINAL_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20260917_1000_claim-ledger-r8-2.csv"
);

/** 台帳CSVを読む。BOM付きUTF-8なので bom: true を外してはならない。 */
function readLedger(path: string): Record<string, string>[] {
  return parse(readFileSync(path, "utf8"), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];
}

type ClaimLedgerRow = {
  item_key: string;
  difficulty: string;
  reviewed_content_sha256: string;
};

function reviewedContentHashesFromLedger(): Record<string, string> {
  const hashes: Record<string, string> = {};

  for (const ledgerPath of CLAIM_LEDGER_PATHS) {
    const rows = readLedger(ledgerPath) as unknown as ClaimLedgerRow[];

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

describe("解説の内容ハッシュ", () => {
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

  it("147変種（第2回の区長提出23件・議員提出4件と第3回の22件の各3段）すべてがハッシュ固定されている", () => {
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
    expect(Object.keys(pinned)).toHaveLength(147);
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
    const rows = readLedger(ORIGINAL_CLAIM_LEDGER_PATH);

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
      const rows = readLedger(ledgerPath);
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
  const rows = readLedger(STEP4_REST_CLAIM_LEDGER_PATH);

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

describe("やさしい日本語版の主張台帳の構造", () => {
  // easy 版は normal 版と同じ一次資料の同じ箇所を言い換えたものであり、
  // 出典・頁・引用は突合済みの normal 版の行を引き継いでいる。
  // 「言い換えたつもりで数字が変わった」を台帳側からも押さえる。
  const rows = readLedger(EASY_CLAIM_LEDGER_PATH);

  it("すべての行が easy 版を指している", () => {
    expect([...new Set(rows.map((r) => r.difficulty))]).toEqual(["easy"]);
  });

  it("判定はすべて supported である", () => {
    // easy 版は突合済みの normal 版を言い換えたものなので、
    // 出典が付かない主張（needs_source）が残っていてはならない。
    const verdicts = [...new Set(rows.map((r) => r.verdict))].sort();
    expect(verdicts).toEqual(["supported"]);
  });

  it("claim_id が一意である", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("主張・出典・引用がいずれも空でない", () => {
    const incomplete = rows
      .filter(
        (r) =>
          !r.final_claim ||
          !r.source_url ||
          !r.evidence_excerpt ||
          !r.page_or_section
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
    expect(byVariant.size).toBe(23);
  });

  it("出典とハッシュが同じ議案の normal 版台帳と整合する", () => {
    // easy 版の出典は normal 版から引き継ぐ。normal 側に無いURLが
    // 紛れ込んでいたら、言い換え元と違う資料を見たということになる。
    const normalUrls = new Set<string>();
    for (const path of NORMAL_CLAIM_LEDGER_PATHS) {
      for (const row of readLedger(path)) {
        normalUrls.add(row.source_url);
      }
    }

    const unknown = [...new Set(rows.map((r) => r.source_url))]
      .filter((url) => !normalUrls.has(url))
      .sort();

    expect(unknown).toEqual([]);
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const itemKeys = new Set(rows.map((r) => r.item_key));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (content.difficulty_level !== "easy") continue;
      if (!itemKeys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});

describe("議員提出議案4件の主張台帳の構造", () => {
  // 区の概要資料が無い議員提出議案は、会議録の発言と議会公式の資料を出典にする。
  // 賛否の理由は発言者の言葉として書いており、出典の付かない主張を残さない。
  const rows = readLedger(GIIN_CLAIM_LEDGER_PATH);
  const giinKeys = new Set(
    r8SecondSessionItems.filter((i) => i.itemType === "giin").map(buildItemKey)
  );

  it("議員提出議案だけを指している", () => {
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...giinKeys].sort()
    );
  });

  it("判定はすべて supported である", () => {
    expect([...new Set(rows.map((r) => r.verdict))]).toEqual(["supported"]);
  });

  it("claim_id が一意である", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("主張・出典・ハッシュ・位置・引用がいずれも空でない", () => {
    const incomplete = rows
      .filter(
        (r) =>
          !r.final_claim ||
          !r.source_url ||
          !/^[0-9a-f]{64}$/.test(r.source_sha256) ||
          !r.page_or_section ||
          !r.evidence_excerpt
      )
      .map((r) => r.claim_id);

    expect(incomplete).toEqual([]);
  });

  it("4件×3段の各変種が title / summary / content すべての行を持つ", () => {
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
      .map(([key]) => key);

    expect(incomplete).toEqual([]);
    expect(byVariant.size).toBe(12);
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!giinKeys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});

/** 台帳ツール（docs/verification/tools/r8_3/ledger_build.py）が needs_source 行に書く定型の注記。 */
const NO_SOURCE_NOTE =
  "（本件は解説本文が「一次資料に記載がない」と明示している箇所であり、事実主張ではない）";
const STATUS_NOTE =
  "（作成時点の審議状況の記述であり、一次資料の記載による主張ではない）";

describe("令和8年第3回定例会22件の主張台帳の構造", () => {
  // 議決前の案件なので、議決結果に関する主張は持たない。
  // 出典から確かめられない点は needs_source として、解説本文の
  // 「わからない こと」「出典に記載がない事項」と審議状況の記述にだけ置く。
  const rows = readLedger(R8_3_CLAIM_LEDGER_PATH);
  const r8_3Keys = new Set(r8ThirdSessionItems.map(buildR8_3ItemKey));

  it("第3回定例会の22件すべてを指し、それ以外を指さない", () => {
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...r8_3Keys].sort()
    );
  });

  it("判定は supported か needs_source のいずれかである", () => {
    // 未解決の contradicted / unsupported を公開する本文に残さないための番人。
    const verdicts = [...new Set(rows.map((r) => r.verdict))].sort();
    expect(verdicts).toEqual(["needs_source", "supported"]);
  });

  it("needs_source は「出典に記載がない事項」と審議状況の記述に限る", () => {
    // needs_source を事実主張の逃げ道にしない。
    // 一次資料に根拠がある主張は必ず supported として引用を持つ。
    const misplaced = rows
      .filter((r) => r.verdict === "needs_source")
      .filter(
        (r) =>
          r.page_or_section !== "出典に記載がない事項" &&
          r.page_or_section !== "審議状況"
      )
      .map((r) => r.claim_id);

    expect(misplaced).toEqual([]);
  });

  it("needs_source は定型の注記だけを持ち、supported は定型の注記を持たない", () => {
    // 見出し（page_or_section）の付け替えだけで事実主張を needs_source に
    // 逃がせないよう、引用欄の中身でも区別する。
    const notes = new Set([NO_SOURCE_NOTE, STATUS_NOTE]);
    const bad = rows
      .filter((r) =>
        r.verdict === "needs_source"
          ? !notes.has(r.evidence_excerpt)
          : notes.has(r.evidence_excerpt)
      )
      .map((r) => r.claim_id);

    expect(bad).toEqual([]);
  });

  it("審議状況の行は各変種にちょうど1行ある", () => {
    const counts = new Map<string, number>();
    for (const r of rows.filter((row) => row.page_or_section === "審議状況")) {
      const key = `${r.item_key}:${r.difficulty}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(66);
    expect([...counts.values()].every((n) => n === 1)).toBe(true);
  });

  it("claim_id が一意である", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("主張・出典・ハッシュ・位置・引用がいずれも空でない", () => {
    const incomplete = rows
      .filter(
        (r) =>
          !r.final_claim ||
          !r.source_url ||
          !/^[0-9a-f]{64}$/.test(r.source_sha256) ||
          !r.page_or_section ||
          !r.evidence_excerpt
      )
      .map((r) => r.claim_id);

    expect(incomplete).toEqual([]);
  });

  it("出典は第3回定例会の一次資料に限られ、URL ごとの sha256 は1つ", () => {
    // 案件をまたぐ引用（第64号議案が認定第1号の全文を引く等）は正当なので、
    // 案件単位ではなく会期の出典集合で縛る。
    const allowed = new Set<string>([
      R8_3_SUBMISSIONS_URL,
      ...r8ThirdSessionItems.flatMap((i) =>
        i.overviewPdfUrl ? [i.fullTextPdfUrl, i.overviewPdfUrl] : [i.fullTextPdfUrl]
      ),
    ]);
    const shaByUrl = new Map<string, Set<string>>();
    for (const r of rows) {
      const shas = shaByUrl.get(r.source_url) ?? new Set<string>();
      shas.add(r.source_sha256);
      shaByUrl.set(r.source_url, shas);
    }

    expect([...shaByUrl.keys()].filter((u) => !allowed.has(u))).toEqual([]);
    expect(
      [...shaByUrl.entries()].filter(([, shas]) => shas.size !== 1)
    ).toEqual([]);
  });

  it("議決前の案件なので、本文と主張は議決結果を述べない", () => {
    // 議決結果は bills.status で示し、解説本文には書かない方針。
    const verdictWords = /原案可決|否決|可決され|認定され|承認され/;
    const inText = billContentsWithBillSlug
      .filter((c) => r8_3Keys.has(c.bill_slug))
      .filter((c) =>
        verdictWords.test(`${c.title}\n${c.summary}\n${c.content}`)
      )
      .map((c) => `${c.bill_slug}:${c.difficulty_level}`);
    const inClaims = rows
      .filter((r) => verdictWords.test(r.final_claim))
      .map((r) => r.claim_id);

    expect(inText).toEqual([]);
    expect(inClaims).toEqual([]);
  });

  it("22件×3段の各変種が title / summary / content すべての行を持つ", () => {
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
    expect(byVariant.size).toBe(66);
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!r8_3Keys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});
