// 解説本文（R8-3 の66変種）を JSON に書き出す。台帳の内容ハッシュと数値照合の入力。
// 使い方: packages/seed で `npx tsx ../../docs/verification/tools/r8_3/dump.ts <出力先.json>`
import { writeFileSync } from "node:fs";
import { billContentsR8_3 } from "../../../../packages/seed/main/bill-contents-r8-3-data";

writeFileSync(process.argv[2], JSON.stringify(billContentsR8_3, null, 1));
