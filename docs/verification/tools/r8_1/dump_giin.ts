// 議員提出議案第1〜5号の解説本文（15変種）を JSON に書き出す。台帳の内容ハッシュの入力。
// 使い方: packages/seed で `npx tsx ../../docs/verification/tools/r8_1/dump_giin.ts <出力先.json>`
import { writeFileSync } from "node:fs";
import { billContentsR8_1Giin } from "../../../../packages/seed/main/bill-contents-r8-1-giin-data";

writeFileSync(process.argv[2], JSON.stringify(billContentsR8_1Giin, null, 1));
