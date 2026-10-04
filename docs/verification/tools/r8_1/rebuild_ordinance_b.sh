#!/bin/sh
# 条例案 Group B 10件の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources_ordinance_b.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_ordinance_b.sh <repo-root>
set -eu
ROOT="$1"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_b.ts "$HERE/contents_ordinance_b.json")
python3 "$ROOT/docs/verification/tools/r8_1/ledger_build.py" contents_ordinance_b.json \
  "$ROOT/docs/verification/20261004_1115_claim-ledger-r8-1-ordinances-group-b.csv" spec_ordinance_b
