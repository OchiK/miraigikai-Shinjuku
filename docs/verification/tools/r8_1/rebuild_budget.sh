#!/bin/sh
# 予算議案11件の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources_budget.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_budget.sh <repo-root>
set -eu
ROOT="$1"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_1/dump_budget.ts "$HERE/contents_budget.json")
python3 "$ROOT/docs/verification/tools/r8_1/ledger_build.py" contents_budget.json \
  "$ROOT/docs/verification/20261003_2100_claim-ledger-r8-1-budgets.csv" spec_budget
