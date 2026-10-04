#!/bin/sh
# 条例案 Group C 7件の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources_ordinance_c.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_ordinance_c.sh <repo-root>
set -eu
ROOT="$1"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_c.ts "$HERE/contents_ordinance_c.json")
python3 "$ROOT/docs/verification/tools/r8_1/ledger_build.py" contents_ordinance_c.json \
  "$ROOT/docs/verification/20261004_1300_claim-ledger-r8-1-ordinances-group-c.csv" spec_ordinance_c
