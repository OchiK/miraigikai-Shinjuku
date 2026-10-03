// 条例案 Group A 10件（第10〜19号議案）の解説本文を JSON に書き出す。台帳の内容ハッシュの入力。
// 使い方: packages/seed で `npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_a.ts <出力先.json>`
import { writeFileSync } from "node:fs";
import { billContentsR8_1OrdinancesA } from "../../../../packages/seed/main/bill-contents-r8-1-ordinances-a-data";

writeFileSync(
  process.argv[2],
  JSON.stringify(billContentsR8_1OrdinancesA, null, 1)
);
