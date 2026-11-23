// 解説本文（R8-3 の66変種）を JSON に書き出す。台帳の内容ハッシュと数値照合の入力。
// 使い方: packages/seed で `pnpm exec node --import tsx ../../docs/verification/tools/r8_3/dump.ts <出力先.json> [賛否出力先.json]`
// ledger_build.py には賛否出力が必須。rebuild.sh は作業ディレクトリの votes.json を指定する。
import { writeFileSync } from "node:fs";
import { billContentsR8_3 } from "../../../../packages/seed/main/bill-contents-r8-3-data";
import { r8_3BillVotes } from "../../../../packages/seed/main/shinjuku-faction-stances";

if (process.argv[3]) {
  writeFileSync(process.argv[3], JSON.stringify(r8_3BillVotes, null, 1));
}

writeFileSync(process.argv[2], JSON.stringify(billContentsR8_3, null, 1));
