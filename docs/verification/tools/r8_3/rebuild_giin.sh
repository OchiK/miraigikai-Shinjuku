#!/bin/sh
# 議員提出議案第11〜14号の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources_giin.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_giin.sh <repo-root> [出力CSV]
# 出力CSVを省くとリポジトリの台帳を上書きする。cmp で確かめるときは別のパスを渡す。
set -eu
ROOT="$1"
OUT="${2:-$ROOT/docs/verification/20261021_1241_claim-ledger-r8-3-giin.csv}"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_3/dump_giin.ts "$HERE/contents_giin.json")
python3 "$ROOT/docs/verification/tools/r8_3/ledger_build_giin.py" contents_giin.json "$OUT" spec_giin
