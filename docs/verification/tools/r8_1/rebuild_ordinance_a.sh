#!/bin/sh
# 条例案 Group A 10件の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources_ordinance_a.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_ordinance_a.sh <repo-root>
set -eu
ROOT="$1"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_1/dump_ordinance_a.ts "$HERE/contents_ordinance_a.json")
python3 "$ROOT/docs/verification/tools/r8_1/ledger_build.py" contents_ordinance_a.json \
  "$ROOT/docs/verification/20261004_0630_claim-ledger-r8-1-ordinances-group-a.csv" spec_ordinance_a
