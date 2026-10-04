// 条例案 Group B 10件（第21〜30号議案）の解説本文を JSON に書き出す。台帳の内容ハッシュの入力。
// 使い方: packages/seed で `npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_b.ts <出力先.json>`
import { writeFileSync } from "node:fs";
import { billContentsR8_1OrdinancesB } from "../../../../packages/seed/main/bill-contents-r8-1-ordinances-b-data";

writeFileSync(
  process.argv[2],
  JSON.stringify(billContentsR8_1OrdinancesB, null, 1)
);
