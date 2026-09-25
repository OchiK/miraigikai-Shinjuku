// 会派賛否 seed を、出典の「議案の概要と審議結果」PDFと突き合わせる（ネットワークを使う手動検証）。
//
//   pnpm --filter @mirai-gikai/seed verify:faction-stances
//
// PDFの表は extract-faction-stances.py（pdfplumber）で読む。事前に `pip install pdfplumber`。
// 列見出し・議案名・○×を1行ずつ比べ、1件でも違えば終了コード1で止まる。
// 列ずれは件数のテストでは見つからないため、seed を変えたら必ず実行すること。

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareStanceTable,
  type ExtractedStanceTable,
  FACTION_STANCE_SOURCES,
  R8_2_VOTE_COLUMNS,
  r8_2BillVotes,
} from "./shinjuku-faction-stances";

/** PDFを一時ディレクトリに落として表を読み、ディレクトリは必ず消す */
async function extractTableFromUrl(url: string): Promise<ExtractedStanceTable> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const dir = mkdtempSync(join(tmpdir(), "faction-stances-"));
  try {
    const pdfPath = join(dir, "source.pdf");
    writeFileSync(pdfPath, Buffer.from(await res.arrayBuffer()));
    const script = fileURLToPath(
      new URL("./extract-faction-stances.py", import.meta.url)
    );
    const stdout = execFileSync("python3", [script, pdfPath], {
      encoding: "utf8",
    });
    return JSON.parse(stdout) as ExtractedStanceTable;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const source = FACTION_STANCE_SOURCES["r8-2"];
  console.log(`出典: ${source.label}\n${source.url}\n`);
  const table = await extractTableFromUrl(source.url);
  const problems = compareStanceTable(table, r8_2BillVotes);

  const headings = R8_2_VOTE_COLUMNS.map((c) => c.heading);
  console.log(`照合: ${r8_2BillVotes.length}議案 × ${headings.length}会派`);
  console.log("全会一致でない議案（PDFの2面で×の位置を目で確認すること）:");
  for (const bill of r8_2BillVotes.filter((b) => b.marks.includes("×"))) {
    const names = [...bill.marks].flatMap((mark, i) =>
      mark === "×" ? [headings[i]] : []
    );
    console.log(`  ${bill.titleInSource}: 反対 ${names.join("・")}`);
  }

  if (problems.length > 0) {
    console.error(`\n不一致 ${problems.length}件:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log("\n不一致なし");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
