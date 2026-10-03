#!/bin/sh
# 議員提出議案第1〜5号の解説本文を JSON に書き出し、台帳 CSV を再生成する。
# 先に fetch_sources.sh を実行したディレクトリ（pdf/ がある場所）で、リポジトリのルートを引数に渡して実行する。
#   sh rebuild_giin.sh <repo-root>
set -eu
ROOT="$1"
HERE="$(pwd)"
(cd "$ROOT/packages/seed" && npx tsx ../../docs/verification/tools/r8_1/dump_giin.ts "$HERE/contents_giin.json")
python3 "$ROOT/docs/verification/tools/r8_1/ledger_build.py" contents_giin.json \
  "$ROOT/docs/verification/20261003_1600_claim-ledger-r8-1-giin.csv" spec_giin
