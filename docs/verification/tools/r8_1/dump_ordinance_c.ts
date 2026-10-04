// 条例案 Group C 7件（第32〜36号議案・承認第1号・第41号議案）の解説本文を JSON に書き出す。台帳の内容ハッシュの入力。
// 使い方: packages/seed で `npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_c.ts <出力先.json>`
import { writeFileSync } from "node:fs";
import { billContentsR8_1OrdinancesC } from "../../../../packages/seed/main/bill-contents-r8-1-ordinances-c-data";

writeFileSync(
  process.argv[2],
  JSON.stringify(billContentsR8_1OrdinancesC, null, 1)
);
