import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { billContentsWithBillSlug } from "./bill-contents-data";
import {
  R8_1_COUNCIL_RESULTS_PDF,
  R8_1_COUNCIL_SESSION_URL,
  R8_1_DECISIONS_URL,
  buildR8_1ItemKey,
  r8FirstSessionItems,
} from "./shinjuku-r8-1-inventory";
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

/** 令和8年第1回定例会のパイロット5件（第1・5・20・31号議案、議員提出議案第6号）の easy / normal / hard 版の突合記録。 */
const R8_1_PILOT_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20261003_1330_claim-ledger-r8-1-pilot.csv"
);

/** 令和8年第1回定例会の議員提出議案第1〜5号（否決された条例案5件）の easy / normal / hard 版の突合記録。 */
const R8_1_GIIN_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20261003_1600_claim-ledger-r8-1-giin.csv"
);

/** 令和8年第1回定例会の予算関連議案11件（第2・3・4・6・7・8・9・37・38・39・40号議案）の easy / normal / hard 版の突合記録。 */
const R8_1_BUDGET_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20261003_2100_claim-ledger-r8-1-budgets.csv"
);

/** 令和8年第1回定例会の条例案 Group A 10件（第10〜19号議案）の easy / normal / hard 版の突合記録。 */
const R8_1_ORDINANCES_A_CLAIM_LEDGER_PATH = ledgerPath(
  "../../../docs/verification/20261004_0630_claim-ledger-r8-1-ordinances-group-a.csv"
);

const CLAIM_LEDGER_PATHS = [
  ...NORMAL_CLAIM_LEDGER_PATHS,
  EASY_CLAIM_LEDGER_PATH,
  GIIN_CLAIM_LEDGER_PATH,
  R8_3_CLAIM_LEDGER_PATH,
  R8_1_PILOT_CLAIM_LEDGER_PATH,
  R8_1_GIIN_CLAIM_LEDGER_PATH,
  R8_1_BUDGET_CLAIM_LEDGER_PATH,
  R8_1_ORDINANCES_A_CLAIM_LEDGER_PATH,
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

  it("240変種（第1回のパイロット5件・議員提出議案5件・予算関連議案11件・条例案10件、第2回の区長提出23件・議員提出4件、第3回の22件の各3段）すべてがハッシュ固定されている", () => {
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
    expect(Object.keys(pinned)).toHaveLength(240);
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
  // 台帳は区長提出議案22件のもの。議員提出議案（第11・12号）は解説未作成で台帳に無い
  const r8_3MayorItems = r8ThirdSessionItems.filter(
    (i) => i.itemType !== "giin"
  );
  const r8_3Keys = new Set(r8_3MayorItems.map(buildR8_3ItemKey));

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
      ...r8_3MayorItems.flatMap((i) =>
        [i.fullTextPdfUrl, i.overviewPdfUrl].filter(
          (url): url is string => url !== null
        )
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

/** 台帳ツール（docs/verification/tools/r8_1/ledger_build.py）が needs_source 行に書く定型の注記。 */
const R8_1_NO_SOURCE_NOTE =
  "（本件は解説本文が「一次資料に記載がない」と明示している箇所であり、事実主張ではない）";

/** パイロット5件の出典URLと、取得時点の sha256（実装計画に記載の値）。 */
const R8_1_PILOT_SOURCE_SHA256: Record<string, string> = {
  "https://www.city.shinjuku.lg.jp/content/000448420.pdf":
    "5a93c8ea6e8da97a4e2db6fb8d05e3bf5de17f67220d3ad35986b68a7b3baa27",
  "https://www.city.shinjuku.lg.jp/content/000448415.pdf":
    "709aef207f70d219b4ba0b8a33be8f41a0b83ff74120ac9caa0dcf839156c385",
  "https://www.city.shinjuku.lg.jp/content/000447772.pdf":
    "aaa515b53e3932878681e1cd7227929fce5fc0e0b629fff5d11789ef0393c597",
  "https://www.city.shinjuku.lg.jp/content/000448436.pdf":
    "26dae45a5333cc5c50c88c6411ee1016da151a63bcb086ad412980ff79b94fa4",
  "https://www.city.shinjuku.lg.jp/content/000447774.pdf":
    "1dc3eaffcafb1b1c9e139e823182dc80dc0755624813ca87d8b274d15f5b6624",
  "https://www.city.shinjuku.lg.jp/content/000448447.pdf":
    "80fb21345b307f476abc29b7de3200ef659d23b703a72d6b6c3e9482207aaef5",
  "https://www.city.shinjuku.lg.jp/content/000452351.pdf":
    "556f694a353ce984c50c5ee13aac5722257336857c904668ccda9ffc2178051f",
  "https://www.city.shinjuku.lg.jp/content/000452334.pdf":
    "22ba4f49b18c96bd1fa26241606257c05477f38e25ac46d6f8e4f416a2cedbf2",
  // HTML は区が更新すると変わる。2026-10-03 に取得した時点の値。
  // 本会議の会議録（MinuteView）は発言ごとに別の URL で、sha256 は API が返す body の値。
  // 下の MINUTE_VIEW_URL で形式を、URL ごとの sha256 は1つであることを別に確かめる。
  [R8_1_DECISIONS_URL]:
    "7c2b6f68db1b433b860b35d176b4dd9211e78582ec9de718fcfefe68b22d896a",
  [R8_1_COUNCIL_SESSION_URL]:
    "869549fe3ba94ac28c6e8fd003d4ad71484501a78203fc7a885109aae4ab487c",
};

/** 本会議の会議録の発言（council_id 3163 = 令和8年第1回定例会）。キャプチャは schedule_id。 */
const MINUTE_VIEW_URL =
  /^https:\/\/ssp\.kaigiroku\.net\/tenant\/shinjuku\/MinuteView\.html\?council_id=3163&schedule_id=(2|5)&minute_id=\d+$/;

describe("令和8年第1回定例会パイロット5件の主張台帳の構造", () => {
  // 議決済みの案件。議決結果は議決結果ページと「議案の概要と審議結果」から supported で引く。
  // 採決日は本会議の会議録、可決の表記は各行が引用する資料で個別に確かめる。
  const rows = readLedger(R8_1_PILOT_CLAIM_LEDGER_PATH);
  // 解説を公開した案件は議員提出議案第1〜5号の追加で増えたので、パイロットの5件は明示的に固定する。
  const pilotKeys = new Set([
    "shinjuku-2026-r1-gian-1",
    "shinjuku-2026-r1-gian-5",
    "shinjuku-2026-r1-gian-20",
    "shinjuku-2026-r1-gian-31",
    "shinjuku-2026-r1-giin-6",
  ]);

  it("パイロット5件すべてを指し、それ以外を指さない", () => {
    expect(pilotKeys.size).toBe(5);
    for (const key of pilotKeys) {
      expect(r8FirstSessionItems.map(buildR8_1ItemKey)).toContain(key);
    }
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...pilotKeys].sort()
    );
  });

  it("判定は supported か needs_source のいずれかである", () => {
    expect([...new Set(rows.map((r) => r.verdict))].sort()).toEqual([
      "needs_source",
      "supported",
    ]);
  });

  it("needs_source は「出典に記載がない事項」の行だけで、定型の注記を持つ", () => {
    // needs_source を事実主張の逃げ道にしない。
    // 一次資料に根拠がある主張は必ず supported として引用を持つ。
    const bad = rows
      .filter((r) =>
        r.verdict === "needs_source"
          ? r.page_or_section !== "出典に記載がない事項" ||
            r.evidence_excerpt !== R8_1_NO_SOURCE_NOTE
          : r.page_or_section === "出典に記載がない事項" ||
            r.evidence_excerpt === R8_1_NO_SOURCE_NOTE
      )
      .map((r) => r.claim_id);

    expect(bad).toEqual([]);
  });

  it("各変種に「出典に記載がない事項」の行が1行以上ある", () => {
    const withUnknowns = new Set(
      rows
        .filter((r) => r.page_or_section === "出典に記載がない事項")
        .map((r) => `${r.item_key}:${r.difficulty}`)
    );

    expect(withUnknowns.size).toBe(15);
  });

  it("審議状況の行は各変種に1行以上あり、すべて supported（議決結果は出典に載っている）", () => {
    const counts = new Map<string, number>();
    for (const r of rows.filter((row) =>
      row.page_or_section.startsWith("審議状況")
    )) {
      expect(r.verdict, r.claim_id).toBe("supported");
      const key = `${r.item_key}:${r.difficulty}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(15);
    expect([...counts.values()].every((n) => n >= 1)).toBe(true);
  });

  it("claim_id が一意である", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("複数条文・資料にまたがる要約は根拠ごとの原子的な行に分かれている", () => {
    const claims = rows.map((row) => ({
      item: row.item_key,
      claim: row.final_claim,
      section: row.page_or_section,
    }));

    expect(claims).toEqual(
      expect.arrayContaining([
        {
          item: "shinjuku-2026-r1-gian-1",
          claim: "要約: 第3表で債務負担行為（債務保証）を定める",
          section: "第3表 債務負担行為（債務保証）",
        },
        {
          item: "shinjuku-2026-r1-gian-31",
          claim: "要約: 状況届・結果届（第6条）を定める",
          section: "第6条",
        },
        {
          item: "shinjuku-2026-r1-gian-31",
          claim: "要約: 公表を定める",
          section: "第12条",
        },
      ])
    );

    const compoundRegressions = rows
      .filter(
        (row) =>
          row.content_field === "summary" &&
          (row.final_claim.includes("第2表・第3表") ||
            row.final_claim.includes("状況届・結果届（第6条）、完了届") ||
            row.final_claim.includes("勧告・公表を定める") ||
            row.final_claim.includes("7項目を国会と政府"))
      )
      .map((row) => row.claim_id);

    expect(compoundRegressions).toEqual([]);
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

  it("出典はパイロット5件の一次資料と第1回定例会の本会議の会議録だけで、URL ごとの sha256 は1つ（資料は計画に記載の値と一致）", () => {
    const shaByUrl = new Map<string, Set<string>>();
    for (const r of rows) {
      const shas = shaByUrl.get(r.source_url) ?? new Set<string>();
      shas.add(r.source_sha256);
      shaByUrl.set(r.source_url, shas);
    }

    for (const [url, shas] of shaByUrl) {
      expect([...shas], url).toHaveLength(1);
      if (MINUTE_VIEW_URL.test(url)) continue;
      expect([...shas], url).toEqual([R8_1_PILOT_SOURCE_SHA256[url]]);
    }
  });

  it("議決の日付は会議録で確かめた日と一致する（第5号議案は2月17日、ほかは3月24日）", () => {
    // 会議録: 第1日第1号（2月17日）の schedule 2、第4日第4号（3月24日）の schedule 5。
    const votedRows = rows.filter((r) =>
      r.page_or_section.startsWith("審議状況（本会議")
    );
    const scheduleByItem = new Map<string, Set<string>>();
    for (const r of votedRows) {
      const schedule = r.source_url.match(MINUTE_VIEW_URL)?.[1];
      expect(schedule, r.claim_id).toBeDefined();
      const set = scheduleByItem.get(r.item_key) ?? new Set<string>();
      set.add(schedule ?? "");
      scheduleByItem.set(r.item_key, set);
    }

    expect(Object.fromEntries(scheduleByItem.entries())).toEqual({
      "shinjuku-2026-r1-gian-1": new Set(["5"]),
      "shinjuku-2026-r1-gian-5": new Set(["2"]),
      "shinjuku-2026-r1-gian-20": new Set(["5"]),
      "shinjuku-2026-r1-gian-31": new Set(["5"]),
      "shinjuku-2026-r1-giin-6": new Set(["5"]),
    });
  });

  it("5件×3段の各変種が title / summary / content すべての行を持つ", () => {
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
    expect(byVariant.size).toBe(15);
  });

  it("本文の採決日は会議録の日付と一致する（第5号議案だけ2月17日、ほかは3月24日）", () => {
    // 実装計画は全件を3月24日とするが、第5号議案は2月17日の本会議で先に可決されている。
    const expectedDate: Record<string, string> = {
      "shinjuku-2026-r1-gian-1": "3月24日",
      "shinjuku-2026-r1-gian-5": "2月17日",
      "shinjuku-2026-r1-gian-20": "3月24日",
      "shinjuku-2026-r1-gian-31": "3月24日",
      "shinjuku-2026-r1-giin-6": "3月24日",
    };

    for (const c of billContentsWithBillSlug.filter((c) =>
      pilotKeys.has(c.bill_slug)
    )) {
      const label = `${c.bill_slug}:${c.difficulty_level}`;
      const dates = [
        ...`${c.summary}\n${c.content}`.matchAll(/(\d+月\d+日)の\s*本会議/g),
      ].map((m) => m[1]);

      // 解説は議決の日付を本会議の日として必ず書く
      expect(dates.length, label).toBeGreaterThan(0);
      for (const date of dates) {
        expect(date, label).toBe(expectedDate[c.bill_slug]);
      }
    }
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!pilotKeys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});

/** 議員提出議案第1〜5号の出典URLと、取得時点の sha256。会議録は発言ごとに別のURLで、sha256 は API が返す body の値。 */
const R8_1_GIIN_SOURCE_SHA256: Record<string, string> = {
  "https://www.city.shinjuku.lg.jp/content/000452334.pdf":
    "22ba4f49b18c96bd1fa26241606257c05477f38e25ac46d6f8e4f416a2cedbf2",
  // HTML は区が更新すると変わる。2026-10-03 に取得した時点の値。
  [R8_1_COUNCIL_SESSION_URL]:
    "869549fe3ba94ac28c6e8fd003d4ad71484501a78203fc7a885109aae4ab487c",
};

/** 本会議 3月24日（schedule 5）の会議録の発言。議員提出議案第1〜5号はすべてこの日に採決された。 */
const MINUTE_VIEW_URL_3_24 =
  /^https:\/\/ssp\.kaigiroku\.net\/tenant\/shinjuku\/MinuteView\.html\?council_id=3163&schedule_id=5&minute_id=(\d+)$/;

describe("令和8年第1回定例会 議員提出議案第1〜5号の主張台帳の構造", () => {
  // 否決された条例案5件。議決結果ページは区長提出議案しか載せないので、
  // 否決は「議案の概要と審議結果」（採決結果行）と本会議の会議録から supported で引く。
  const rows = readLedger(R8_1_GIIN_CLAIM_LEDGER_PATH);
  const giinKeys = new Set(
    [1, 2, 3, 4, 5].map((itemNumber) =>
      buildR8_1ItemKey({ itemType: "giin", itemNumber })
    )
  );

  it("議員提出議案第1〜5号だけを指し、インベントリで公開・レビュー済みになっている", () => {
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...giinKeys].sort()
    );

    const items = r8FirstSessionItems.filter((item) =>
      giinKeys.has(buildR8_1ItemKey(item))
    );
    expect(items).toHaveLength(5);
    for (const item of items) {
      expect(item.hasPublishableContent, item.officialLabel).toBe(true);
      expect(item.reviewCompleted, item.officialLabel).toBe(true);
      expect(item.decision, item.officialLabel).toBe("否決");
    }
  });

  it("事実主張の判定はすべて supported である", () => {
    expect([...new Set(rows.map((r) => r.verdict))]).toEqual(["supported"]);
  });

  it("各変種に supported の審議状況の行がある", () => {
    const statusCounts = new Map<string, number>();
    for (const r of rows) {
      const key = `${r.item_key}:${r.difficulty}`;
      if (r.page_or_section.startsWith("審議状況")) {
        expect(r.verdict, r.claim_id).toBe("supported");
        statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
      }
    }

    expect(statusCounts.size).toBe(15);
  });

  it("5件×3段の各変種が title / summary / content すべての行を持つ", () => {
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
    expect(byVariant.size).toBe(15);
  });

  it("claim_id が一意で、主張・出典・ハッシュ・位置・引用がいずれも空でない", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);

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

  it("出典は概要PDF・会期ページ・3月24日の会議録だけで、議決結果ページ（区長提出議案のみ）は引かない", () => {
    const shaByUrl = new Map<string, Set<string>>();
    for (const r of rows) {
      const shas = shaByUrl.get(r.source_url) ?? new Set<string>();
      shas.add(r.source_sha256);
      shaByUrl.set(r.source_url, shas);
    }

    expect(shaByUrl.has(R8_1_DECISIONS_URL)).toBe(false);
    for (const [url, shas] of shaByUrl) {
      expect([...shas], url).toHaveLength(1);
      if (MINUTE_VIEW_URL_3_24.test(url)) continue;
      expect([...shas], url).toEqual([R8_1_GIIN_SOURCE_SHA256[url]]);
    }
  });

  it("議決の日付は3月24日の会議録で確かめ、採決結果は議案ごとの発言を引く（第4号と第5号は別の発言）", () => {
    const resultMinute: Record<string, string> = {
      "shinjuku-2026-r1-giin-1": "102",
      "shinjuku-2026-r1-giin-2": "14",
      "shinjuku-2026-r1-giin-3": "110",
      "shinjuku-2026-r1-giin-4": "117",
      "shinjuku-2026-r1-giin-5": "118",
    };

    for (const [itemKey, minute] of Object.entries(resultMinute)) {
      const cited = new Set(
        rows
          .filter(
            (r) =>
              r.item_key === itemKey &&
              r.page_or_section === "審議状況（本会議 3月24日 議長）" &&
              r.evidence_excerpt === "起立少数と認めます。本案は、否決されました"
          )
          .map((r) => r.source_url.match(MINUTE_VIEW_URL_3_24)?.[1])
      );

      expect([...cited], itemKey).toEqual([minute]);
    }

    for (const c of billContentsWithBillSlug.filter((c) =>
      giinKeys.has(c.bill_slug)
    )) {
      const label = `${c.bill_slug}:${c.difficulty_level}`;
      const text = `${c.summary}\n${c.content}`;
      // easy / normal は「3月24日の本会議」、hard は「本会議 令和8年3月24日」と書く。
      expect(text, label).toContain("3月24日");
      for (const m of text.matchAll(/(\d+月\d+日)の\s*本会議/g)) {
        expect(m[1], label).toBe("3月24日");
      }
    }
  });

  it("会派別の賛否は概要PDFの採決結果行を根拠にし、共産・れいわが賛成、ほか6会派が反対と書いている", () => {
    for (const key of giinKeys) {
      const voteRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.page_or_section === "審議状況（議員提出議案の採決結果行）"
      );

      expect(voteRows.length, key).toBeGreaterThanOrEqual(3);
      for (const r of voteRows) {
        expect(r.source_url, r.claim_id).toBe(R8_1_COUNCIL_RESULTS_PDF);
        expect(r.evidence_excerpt, r.claim_id).toContain("×　×　○　×　×　×　×　○");
      }
    }
  });

  it("少数意見の報告を「討論」と呼ばない", () => {
    // 会議録は少数意見の報告の直後に起立採決へ進んでおり、この5件には討論がない。
    for (const c of billContentsWithBillSlug.filter((c) =>
      giinKeys.has(c.bill_slug)
    )) {
      const text = `${c.title}\n${c.summary}\n${c.content}`;
      expect(text, `${c.bill_slug}:${c.difficulty_level}`).not.toMatch(
        /賛成討論|反対討論|賛否の討論/
      );
    }
  });

  it("発言内容について区が確認していないとは断定しない", () => {
    for (const c of billContentsWithBillSlug.filter((c) =>
      giinKeys.has(c.bill_slug)
    )) {
      const text = `${c.title}\n${c.summary}\n${c.content}`;
      expect(text, `${c.bill_slug}:${c.difficulty_level}`).not.toMatch(
        /区が(?:\s*調べた\s*ことでは\s*ありません|確認した事実では(?:ありません|ない))/
      );
    }
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

/** 予算関連議案11件の出典URLと、取得時点の sha256。会議録は発言ごとに別のURLで、sha256 は API が返す body の値。 */
const R8_1_BUDGET_SOURCE_SHA256: Record<string, string> = {
  "https://www.city.shinjuku.lg.jp/content/000448412.pdf":
    "ed5f5fcc4ff84f64868da0d16a95bba5a9b0cdc60a7fd1122aa78d88bc6e873f",
  "https://www.city.shinjuku.lg.jp/content/000448413.pdf":
    "02a73417a063870b1a61c2cd6b0e5ffbe11cc318a301f68da79c32b5c749d616",
  "https://www.city.shinjuku.lg.jp/content/000448488.pdf":
    "47e837a8ce5c4fcd9d34bff3c2419b966b50822cad413c20cbaa0c4b24e24f89",
  "https://www.city.shinjuku.lg.jp/content/000448416.pdf":
    "0925b384cfe3b4e76dadfca0f0ecf49c6d7f17a75e2b119ebd8fbcaafdaaeec3",
  "https://www.city.shinjuku.lg.jp/content/000448417.pdf":
    "c5c9f0f096c373e7894e441508ed0d800d9af0962757f8bc2fce3306080ba5ce",
  "https://www.city.shinjuku.lg.jp/content/000448418.pdf":
    "f33d80167dc1baa073c68dac44d8d2395b5d52382d889eaf211f64daa70088be",
  "https://www.city.shinjuku.lg.jp/content/000448419.pdf":
    "167fb43e64a7e3af56a2a4e37a34a2d888c32c6bf39fc111c2bbf03b2780dc29",
  "https://www.city.shinjuku.lg.jp/content/000451609.pdf":
    "1c3d2b237f858f77d4e6b98d5dde46aa057b3b9dccae30e47a317d988d9eaccd",
  "https://www.city.shinjuku.lg.jp/content/000451610.pdf":
    "5d82fbdfc9d9d856b8b0f3c8f7fa29e853c84ed7b5b88bca3ea7e290bae6000f",
  "https://www.city.shinjuku.lg.jp/content/000451611.pdf":
    "24a345183e77ed48146fa02578def3867d966d982a15885f85db19c4e6e72c49",
  "https://www.city.shinjuku.lg.jp/content/000451612.pdf":
    "ed41abb21cafd251055ed13e249d3aab5c2e9d87f3fb4096acbd6772a2163b68",
  "https://www.city.shinjuku.lg.jp/content/000447773.pdf":
    "ae9c609468cf9087cd0ab31135321304662e24b0eb45121def2ff27bb4a89164",
  "https://www.city.shinjuku.lg.jp/content/000450968.pdf":
    "6f24c163553ee75dda2dfbfb35cf15aeb8a57fdc20e8eb8eebc9c916db34c497",
  "https://www.city.shinjuku.lg.jp/content/000451608.pdf":
    "05f4b686bcc5f7f240355042ac4bf08a3392abcb19dde2d9972fd5c626d63c22",
  "https://www.city.shinjuku.lg.jp/content/000452334.pdf":
    "22ba4f49b18c96bd1fa26241606257c05477f38e25ac46d6f8e4f416a2cedbf2",
  // HTML は区が更新すると変わる。2026-10-03 に取得した時点の値。
  [R8_1_DECISIONS_URL]:
    "7c2b6f68db1b433b860b35d176b4dd9211e78582ec9de718fcfefe68b22d896a",
  [R8_1_COUNCIL_SESSION_URL]:
    "869549fe3ba94ac28c6e8fd003d4ad71484501a78203fc7a885109aae4ab487c",
};

describe("令和8年第1回定例会 予算関連議案11件の主張台帳の構造", () => {
  // 実装計画（implementation_plan.md）は第2〜4号議案の予算規模、第7号・第38号・第40号議案の補正理由などを
  // 一次資料と違う内容で書いていたため、台帳は一次資料の抽出テキストと機械照合して作っている。
  const rows = readLedger(R8_1_BUDGET_CLAIM_LEDGER_PATH);
  const budgetNumbers = [2, 3, 4, 6, 7, 8, 9, 37, 38, 39, 40];
  const budgetKeys = new Set(
    budgetNumbers.map((itemNumber) =>
      buildR8_1ItemKey({ itemType: "gian", itemNumber })
    )
  );
  // 「議案の概要と審議結果」の採決結果行の賛否（列の並び: 自参ク 公明 共産 新宿会 民無ク 維新 現役 れいわ）。
  const votePattern: Record<number, string> = {
    2: "○○×○○○○×",
    3: "○○×○○○○×",
    4: "○○×○○○○×",
    6: "○○×○○○○○",
    7: "○○○○○○○○",
    8: "○○○○○○○○",
    9: "○○×○○○○○",
    37: "○○○○○○○○",
    38: "○○×○○○○×",
    39: "○○○○○○○○",
    40: "○○○○○○○○",
  };

  it("予算関連議案11件だけを指し、インベントリで公開・レビュー済み・原案可決になっている", () => {
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...budgetKeys].sort()
    );

    const items = r8FirstSessionItems.filter((item) =>
      budgetKeys.has(buildR8_1ItemKey(item))
    );
    expect(items).toHaveLength(11);
    for (const item of items) {
      expect(item.hasPublishableContent, item.officialLabel).toBe(true);
      expect(item.reviewCompleted, item.officialLabel).toBe(true);
      expect(item.decision, item.officialLabel).toBe("原案可決");
    }
  });

  it("判定はすべて supported である（出典に記載がない事項は事実主張として台帳に載せない）", () => {
    expect([...new Set(rows.map((r) => r.verdict))]).toEqual(["supported"]);
  });

  it("各変種に supported の審議状況の行があり、33変種すべてが title / summary / content の行を持つ", () => {
    const statusKeys = new Set<string>();
    const byVariant = new Map<string, Set<string>>();
    for (const r of rows) {
      const key = `${r.item_key}:${r.difficulty}`;
      const fields = byVariant.get(key) ?? new Set<string>();
      fields.add(r.content_field);
      byVariant.set(key, fields);
      if (r.page_or_section.startsWith("審議状況")) statusKeys.add(key);
    }

    expect(statusKeys.size).toBe(33);
    expect(byVariant.size).toBe(33);
    const incomplete = [...byVariant.entries()]
      .filter(([, fields]) =>
        ["title", "summary", "content"].some((f) => !fields.has(f))
      )
      .map(([key]) => key)
      .sort();
    expect(incomplete).toEqual([]);
  });

  it("claim_id が一意で、主張・出典・ハッシュ・位置・引用がいずれも空でない", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);

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

  it("出典は予算関連議案の一次資料・議決結果ページ・会期ページ・3月24日の会議録だけで、URL ごとの sha256 は1つ（資料は取得時の値と一致）", () => {
    const shaByUrl = new Map<string, Set<string>>();
    for (const r of rows) {
      const shas = shaByUrl.get(r.source_url) ?? new Set<string>();
      shas.add(r.source_sha256);
      shaByUrl.set(r.source_url, shas);
    }

    for (const [url, shas] of shaByUrl) {
      expect([...shas], url).toHaveLength(1);
      if (MINUTE_VIEW_URL_3_24.test(url)) continue;
      expect([...shas], url).toEqual([R8_1_BUDGET_SOURCE_SHA256[url]]);
    }
  });

  it("各議案の全文PDFを根拠に、予算額・補正額を第1条から引いている", () => {
    const fullText: Record<number, string> = {
      2: "000448412",
      3: "000448413",
      4: "000448488",
      6: "000448416",
      7: "000448417",
      8: "000448418",
      9: "000448419",
      37: "000451609",
      38: "000451610",
      39: "000451611",
      40: "000451612",
    };

    for (const n of budgetNumbers) {
      const key = buildR8_1ItemKey({ itemType: "gian", itemNumber: n });
      const article1 = rows.filter(
        (r) => r.item_key === key && r.page_or_section === "第1条"
      );
      expect(article1.length, key).toBeGreaterThanOrEqual(3);
      for (const r of article1) {
        expect(r.source_url, r.claim_id).toBe(
          `https://www.city.shinjuku.lg.jp/content/${fullText[n]}.pdf`
        );
      }
    }
  });

  it("会派別の賛否は概要PDFの採決結果行を根拠にし、列の並びの賛否と一致する", () => {
    for (const n of budgetNumbers) {
      const key = buildR8_1ItemKey({ itemType: "gian", itemNumber: n });
      const voteRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.page_or_section === "審議状況（議案の概要と審議結果の採決結果行）"
      );

      expect(voteRows.length, key).toBeGreaterThanOrEqual(3);
      for (const r of voteRows) {
        expect(r.source_url, r.claim_id).toBe(R8_1_COUNCIL_RESULTS_PDF);
        expect(r.evidence_excerpt, r.claim_id).toContain(
          `${votePattern[n]}可決`
        );
      }
    }
  });

  it("本文の反対会派の数は採決結果行の × の数と一致する（hard の表と easy の一覧）", () => {
    for (const n of budgetNumbers) {
      const key = buildR8_1ItemKey({ itemType: "gian", itemNumber: n });
      const against = [...votePattern[n]].filter((c) => c === "×").length;
      const hard = billContentsWithBillSlug.find(
        (c) => c.bill_slug === key && c.difficulty_level === "hard"
      );
      const easy = billContentsWithBillSlug.find(
        (c) => c.bill_slug === key && c.difficulty_level === "easy"
      );

      expect(
        [...(hard?.content ?? "").matchAll(/\| 反対 \|/g)].length,
        key
      ).toBe(against);
      expect(
        [...(hard?.content ?? "").matchAll(/\| 賛成 \|/g)].length,
        key
      ).toBe(8 - against);
      expect(
        [...(easy?.content ?? "").matchAll(/^- 反対: /gm)].length,
        key
      ).toBe(against);
      expect(
        [...(easy?.content ?? "").matchAll(/^- 賛成: /gm)].length,
        key
      ).toBe(8 - against);
    }
  });

  it("採決方法は反対会派がある議案が起立、全会派賛成の議案が異議なしで、会議録の発言を引く", () => {
    for (const n of budgetNumbers) {
      const key = buildR8_1ItemKey({ itemType: "gian", itemNumber: n });
      const unanimous = !votePattern[n].includes("×");
      const resultRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.page_or_section === "審議状況（本会議 3月24日 議長）" &&
          r.evidence_excerpt.includes("本案は")
      );

      expect(resultRows.length, key).toBeGreaterThanOrEqual(1);
      for (const r of resultRows) {
        expect(MINUTE_VIEW_URL_3_24.test(r.source_url), r.claim_id).toBe(true);
        expect(
          r.evidence_excerpt.startsWith(unanimous ? "異議なしと認めます" : "起立多数と認めます"),
          r.claim_id
        ).toBe(true);
      }
    }
  });

  it("議決の日付は11件とも3月24日（会議録の第4日第4号）で、本文もその日を本会議の日として書いている", () => {
    for (const c of billContentsWithBillSlug.filter((c) =>
      budgetKeys.has(c.bill_slug)
    )) {
      const label = `${c.bill_slug}:${c.difficulty_level}`;
      const text = `${c.summary}\n${c.content}`;
      expect(text, label).toContain("3月24日");
      for (const m of text.matchAll(/(\d+月\d+日)の\s*本会議/g)) {
        expect(m[1], label).toBe("3月24日");
      }
    }
  });

  it("実装計画の誤った金額（第2〜4号議案の予算規模）を本文に書かず、全文PDFの総額を書いている", () => {
    const totals: Record<number, { right: string; wrong: string }> = {
      2: { right: "38,291,549", wrong: "287億" },
      3: { right: "27,858,976", wrong: "299億" },
      4: { right: "9,955,404", wrong: "72億" },
    };

    for (const [n, { right, wrong }] of Object.entries(totals)) {
      const key = buildR8_1ItemKey({ itemType: "gian", itemNumber: Number(n) });
      const hard = billContentsWithBillSlug.find(
        (c) => c.bill_slug === key && c.difficulty_level === "hard"
      );

      expect(hard?.content, key).toContain(right);
      for (const c of billContentsWithBillSlug.filter(
        (c) => c.bill_slug === key
      )) {
        expect(`${c.summary}\n${c.content}`, key).not.toContain(wrong);
      }
    }
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!budgetKeys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});

/** 条例案 Group A 10件の出典URLと、取得時点の sha256。会議録は発言ごとに別のURLで、sha256 は API が返す body の値。 */
const R8_1_ORDINANCES_A_SOURCE_SHA256: Record<string, string> = {
  "https://www.city.shinjuku.lg.jp/content/000448426.pdf":
    "52d6787e3d2e916924b78ddaba30ad14fb7e149cdb2102946034b6b91744295b",
  "https://www.city.shinjuku.lg.jp/content/000448427.pdf":
    "d60b06e949dad89dde7369f28775966b1f3118fa96fcde89e63173d05e0a1229",
  "https://www.city.shinjuku.lg.jp/content/000448428.pdf":
    "1b7d98e542f1e28cdbfc69410274553ee945f393f21c7e5c0c3ece82c4e0c1be",
  "https://www.city.shinjuku.lg.jp/content/000448429.pdf":
    "ea7770fc2dd74ad2d990160007672b0cdf2ff7d1957209ce4e3575543f7418fe",
  "https://www.city.shinjuku.lg.jp/content/000448430.pdf":
    "d8c713d0a9df19109d7d58c4e01a35a8bf6531aa456b16bd969a5988fd349b05",
  "https://www.city.shinjuku.lg.jp/content/000448431.pdf":
    "bd762ef61228a64d4cdeca831a11f10316b03b4cf70a4ceb0e17b36f153ba989",
  "https://www.city.shinjuku.lg.jp/content/000448432.pdf":
    "0fac12a2deb1f09a18176e4628726c26f34088aea7d542838233c7cec8892b05",
  "https://www.city.shinjuku.lg.jp/content/000448433.pdf":
    "6046c4988056b12f1ad5f7bd1ad01c3a52c4a79518ccd5414d72e1ca03b8ccdf",
  "https://www.city.shinjuku.lg.jp/content/000448434.pdf":
    "fd7898eb8ef9cc9ecf7c59845dbb222410f7dce8bb5e325a3130a8cf48e69845",
  "https://www.city.shinjuku.lg.jp/content/000448435.pdf":
    "0201b3be9cc0f8b8d9abf6623fabdd2b20a22d470c28c1aa925ee3c4b0fdf4c8",
  "https://www.city.shinjuku.lg.jp/content/000447774.pdf":
    "1dc3eaffcafb1b1c9e139e823182dc80dc0755624813ca87d8b274d15f5b6624",
  "https://www.city.shinjuku.lg.jp/content/000452334.pdf":
    "22ba4f49b18c96bd1fa26241606257c05477f38e25ac46d6f8e4f416a2cedbf2",
  // HTML は区が更新すると変わる。2026-10-04 に取得した時点の値。
  [R8_1_DECISIONS_URL]:
    "7c2b6f68db1b433b860b35d176b4dd9211e78582ec9de718fcfefe68b22d896a",
};

/** 全議案共通の標準テンプレート（AGENTS.md「議案解説・コンテンツ作成ルール」）の H2 見出し。 */
const STANDARD_ORDINANCE_HEADINGS = {
  easy: [
    "この議案は 何ですか",
    "何を 変えますか（何を 足しますか）",
    "いつから 始まりますか",
    "この議案は どうなりましたか",
    "わからない こと",
  ],
  normal: [
    "どういう仕組みの話か",
    "何が変わるのか（主な変更点）",
    "いつから始まるのか",
    "この議案のゆくえ",
    "分からないこと",
  ],
  hard: [
    "1. 議案の基本情報",
    "2. 改め文・条文の内容",
    "3. 概要資料が示す改正の位置づけ",
    "4. 施行期日と経過措置",
    "5. 資料から読み取れない事項",
    "6. 一次資料一覧",
  ],
} as const;

function h2Headings(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim());
}

describe("令和8年第1回定例会 条例案 Group A 10件の主張台帳の構造", () => {
  // 実装計画（implementation_plan.md）の「主な内容・改正対象」欄は一次資料と違う内容を多く含んでいたため、
  // 台帳は一次資料の抽出テキストと機械照合して作っている。
  const rows = readLedger(R8_1_ORDINANCES_A_CLAIM_LEDGER_PATH);
  const numbers = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const keys = new Set(
    numbers.map((itemNumber) =>
      buildR8_1ItemKey({ itemType: "gian", itemNumber })
    )
  );
  const keyOf = (n: number) =>
    buildR8_1ItemKey({ itemType: "gian", itemNumber: n });
  const contentsOf = (n: number) =>
    billContentsWithBillSlug.filter((c) => c.bill_slug === keyOf(n));
  // 「議案の概要と審議結果」の採決結果行の賛否（列の並び: 自参ク 公明 共産 新宿会 民無ク 維新 現役 れいわ）。
  const votePattern = (n: number) => (n === 17 ? "○○×○○○○○" : "○○○○○○○○");
  const fullText: Record<number, string> = {
    10: "000448426",
    11: "000448427",
    12: "000448428",
    13: "000448429",
    14: "000448430",
    15: "000448431",
    16: "000448432",
    17: "000448433",
    18: "000448434",
    19: "000448435",
  };

  it("条例案10件だけを指し、インベントリで公開・レビュー済み・原案可決になっている", () => {
    expect([...new Set(rows.map((r) => r.item_key))].sort()).toEqual(
      [...keys].sort()
    );

    const items = r8FirstSessionItems.filter((item) =>
      keys.has(buildR8_1ItemKey(item))
    );
    expect(items).toHaveLength(10);
    for (const item of items) {
      expect(item.hasPublishableContent, item.officialLabel).toBe(true);
      expect(item.reviewCompleted, item.officialLabel).toBe(true);
      expect(item.decision, item.officialLabel).toBe("原案可決");
    }
  });

  it("判定はすべて supported である（出典に記載がない事項は事実主張として台帳に載せない）", () => {
    expect([...new Set(rows.map((r) => r.verdict))]).toEqual(["supported"]);
  });

  it("各変種に supported の審議状況の行があり、30変種すべてが title / summary / content の行を持つ", () => {
    const statusKeys = new Set<string>();
    const byVariant = new Map<string, Set<string>>();
    for (const r of rows) {
      const key = `${r.item_key}:${r.difficulty}`;
      const fields = byVariant.get(key) ?? new Set<string>();
      fields.add(r.content_field);
      byVariant.set(key, fields);
      if (r.page_or_section.startsWith("審議状況")) statusKeys.add(key);
    }

    expect(statusKeys.size).toBe(30);
    expect(byVariant.size).toBe(30);
    const incomplete = [...byVariant.entries()]
      .filter(([, fields]) =>
        ["title", "summary", "content"].some((f) => !fields.has(f))
      )
      .map(([key]) => key)
      .sort();
    expect(incomplete).toEqual([]);
  });

  it("claim_id が一意で、主張・出典・ハッシュ・位置・引用がいずれも空でない", () => {
    const ids = rows.map((r) => r.claim_id);
    expect(new Set(ids).size).toBe(ids.length);

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

  it("出典は条例案の一次資料・議決結果ページ・3月24日の会議録だけで、URL ごとの sha256 は1つ（資料は取得時の値と一致）", () => {
    const shaByUrl = new Map<string, Set<string>>();
    for (const r of rows) {
      const shas = shaByUrl.get(r.source_url) ?? new Set<string>();
      shas.add(r.source_sha256);
      shaByUrl.set(r.source_url, shas);
    }

    for (const [url, shas] of shaByUrl) {
      expect([...shas], url).toHaveLength(1);
      if (MINUTE_VIEW_URL_3_24.test(url)) continue;
      expect([...shas], url).toEqual([R8_1_ORDINANCES_A_SOURCE_SHA256[url]]);
    }
  });

  it("各議案の改め文・附則は、その議案の全文PDFを根拠にしている", () => {
    for (const n of numbers) {
      const key = keyOf(n);
      const fullRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.source_url ===
            `https://www.city.shinjuku.lg.jp/content/${fullText[n]}.pdf`
      );
      expect(fullRows.length, key).toBeGreaterThanOrEqual(10);
      expect(
        fullRows.some((r) => r.page_or_section === "附則（施行期日）"),
        key
      ).toBe(true);
    }
  });

  it("会派別の賛否は概要PDFの採決結果行を根拠にし、列の並びの賛否と一致する", () => {
    for (const n of numbers) {
      const key = keyOf(n);
      const voteRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.page_or_section === "審議状況（議案の概要と審議結果の採決結果行）"
      );

      expect(voteRows.length, key).toBeGreaterThanOrEqual(3);
      for (const r of voteRows) {
        expect(r.source_url, r.claim_id).toBe(R8_1_COUNCIL_RESULTS_PDF);
        expect(r.evidence_excerpt, r.claim_id).toContain(
          `${votePattern(n)}可決`
        );
      }
    }
  });

  it("採決方法は第17号議案だけが起立（少数意見の報告あり）、ほかの9件は異議なしで、会議録の発言を引く", () => {
    for (const n of numbers) {
      const key = keyOf(n);
      const resultRows = rows.filter(
        (r) =>
          r.item_key === key &&
          r.page_or_section === "審議状況（本会議 3月24日 議長）" &&
          r.evidence_excerpt.includes("本案は")
      );

      expect(resultRows.length, key).toBeGreaterThanOrEqual(1);
      for (const r of resultRows) {
        expect(MINUTE_VIEW_URL_3_24.test(r.source_url), r.claim_id).toBe(true);
        expect(
          r.evidence_excerpt.startsWith(
            n === 17 ? "起立多数と認めます" : "異議なしと認めます"
          ),
          r.claim_id
        ).toBe(true);
      }
    }
  });

  it("議決の日付は10件とも3月24日（会議録の第4日第4号）で、本文もその日を本会議の日として書いている", () => {
    for (const c of billContentsWithBillSlug.filter((c) =>
      keys.has(c.bill_slug)
    )) {
      const label = `${c.bill_slug}:${c.difficulty_level}`;
      const text = `${c.summary}\n${c.content}`;
      expect(text, label).toContain("3月24日");
      for (const m of text.matchAll(/(\d+月\d+日)の\s*本会議/g)) {
        expect(m[1], label).toBe("3月24日");
      }
    }
  });

  it("30変種すべてが標準テンプレート（AGENTS.md）の見出し構成と順序のとおりで、わからないことの節が最後の説明節として置かれている", () => {
    for (const n of numbers) {
      const contents = contentsOf(n);
      expect(contents.map((c) => c.difficulty_level).sort(), keyOf(n)).toEqual([
        "easy",
        "hard",
        "normal",
      ]);
      for (const c of contents) {
        const level = c.difficulty_level as "easy" | "normal" | "hard";
        const headings = h2Headings(c.content);
        const expected = STANDARD_ORDINANCE_HEADINGS[level];
        // 議決の節（easy: どうなりましたか、normal: ゆくえ）は、わからないことの直前に置く。
        expect(headings, `${c.bill_slug}:${level}`).toEqual([...expected]);
      }
    }
  });

  it("わからないこと・資料から読み取れない事項の節に、1件以上の項目がある", () => {
    for (const n of numbers) {
      for (const c of contentsOf(n)) {
        const unknownHeading = {
          easy: "## わからない こと",
          normal: "## 分からないこと",
          hard: "## 5. 資料から読み取れない事項",
        }[c.difficulty_level as "easy" | "normal" | "hard"];
        const start = c.content.indexOf(unknownHeading);
        expect(start, `${c.bill_slug}:${c.difficulty_level}`).toBeGreaterThan(
          -1
        );
        const after = c.content.slice(start + unknownHeading.length);
        const section = after.split(/\n## /)[0];
        expect(
          [...section.matchAll(/^- /gm)].length,
          `${c.bill_slug}:${c.difficulty_level}`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hard の一次資料一覧のsha256は、台帳に記録した取得時のsha256と一致する", () => {
    for (const n of numbers) {
      const hard = contentsOf(n).find((c) => c.difficulty_level === "hard");
      expect(hard, keyOf(n)).toBeDefined();
      const tableRows = [
        ...(hard?.content ?? "").matchAll(
          /^\| [^|]+ \| (https?:\/\/[^\s|]+) \| ([0-9a-f]{64}) \|$/gm
        ),
      ];
      // 全文PDF・概要PDF・審議結果PDF・議決結果ページ・会議録の発言
      expect(tableRows.length, keyOf(n)).toBeGreaterThanOrEqual(6);
      for (const [, url, sha] of tableRows) {
        const ledgerShas = new Set(
          rows.filter((r) => r.source_url === url).map((r) => r.source_sha256)
        );
        expect([...ledgerShas], `${keyOf(n)} ${url}`).toEqual([sha]);
      }
    }
  });

  it("第17号議案だけが反対会派を挙げ、少数意見は「述べた」調で書かれ、評価語を持ち込んでいない", () => {
    for (const n of numbers) {
      for (const c of contentsOf(n)) {
        const label = `${c.bill_slug}:${c.difficulty_level}`;
        const text = `${c.summary}\n${c.content}`;
        if (n === 17) {
          expect(text, label).toContain("日本共産党新宿区議会議員団");
          expect(text, label).not.toContain("ひどい");
          expect(text, label).not.toContain("なりふり構わない");
        } else {
          expect(text, label).not.toContain("反対");
        }
      }
    }
    const hard17 = contentsOf(17).find((c) => c.difficulty_level === "hard");
    // 「620数人」は発言者が「とのことです」と述べた数であり、区の資料の数ではない。
    expect(hard17?.content).toContain("「620数人いるとのことです」と述べた");
    for (const c of contentsOf(17).filter(
      (c) => c.difficulty_level !== "hard"
    )) {
      expect(c.content, `${c.bill_slug}:${c.difficulty_level}`).not.toContain(
        "620"
      );
    }
  });

  it("実装計画の誤った内容（押印・指定管理・減免・職員配置・DV支援措置）を本文に書いていない", () => {
    for (const n of numbers) {
      for (const c of contentsOf(n)) {
        const text = `${c.title}\n${c.summary}\n${c.content}`;
        for (const wrong of ["押印", "指定管理", "減免", "職員配置", "支援措置"]) {
          expect(text, `${c.bill_slug}:${c.difficulty_level}`).not.toContain(
            wrong
          );
        }
      }
    }
  });

  it("引用条項の整理だけの議案（第15・19号）は、引用先の法令名を本文が断定していない", () => {
    const f15 = contentsOf(15).find((c) => c.difficulty_level === "hard");
    const f19 = contentsOf(19).find((c) => c.difficulty_level === "hard");
    expect(f15?.content).toContain("改め文には法令名が記載されていない");
    expect(f19?.content).toContain("改め文には法令名が記載されていない");
  });

  it("施行日が規則委任・公布日の議案は、日付を断定していない（第15号は公布の日、第16号は規則で定める日）", () => {
    for (const c of contentsOf(15)) {
      expect(c.content, c.difficulty_level).not.toMatch(/令和8年\d+月\d+日から施行/);
    }
    for (const c of contentsOf(16)) {
      expect(c.content, c.difficulty_level).toContain("規則");
    }
  });

  it("本文に出てくる出典URLはすべて台帳に載っている", () => {
    const ledgerUrls = new Set(rows.map((r) => r.source_url));
    const missing = new Set<string>();

    for (const content of billContentsWithBillSlug) {
      if (!keys.has(content.bill_slug)) continue;
      const text = `${content.title}\n${content.summary}\n${content.content}`;
      for (const url of text.match(/https?:\/\/[^\s|)]+/g) ?? []) {
        if (!ledgerUrls.has(url)) missing.add(url);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});
