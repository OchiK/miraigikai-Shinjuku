#!/bin/sh
# 保存済み一次資料で区長提出22件の台帳をオフライン再生成する。
# 作業ディレクトリ WORK をリポジトリ外に新設し、次の準備を行う（下記のコピーと生成は既存ファイルを上書きする）。
# mkdir -p "$WORK"
# BACKUP_DIR="${BACKUP_DIR:-/Users/ken/antigravity/miraikaigi-shinjuku-backups}"
# cp -R "$BACKUP_DIR/20261016-r8-3-decisions/work/pdf" "$WORK/"
# cp "$BACKUP_DIR/20261104-112500/000468947-b603.pdf" "$WORK/pdf/000468947.pdf"
# pdftotext "$WORK/pdf/000468947.pdf" "$WORK/pdf/000468947.txt"
# pdftotext -layout "$WORK/pdf/000468947.pdf" "$WORK/pdf/000468947.layout.txt"
# (cd "$WORK/pdf" && shasum -a 256 000468947.pdf >> sha256.txt)
# .py は下で作業ディレクトリに上書きコピーする（spec_b2 は esco.py をカレントから読む）。
# ライブ fetch_sources.sh は HTML ハッシュが変わる可能性があるため使用しない。
# cd "$WORK" && sh "$WT/docs/verification/tools/r8_3/rebuild.sh" "$WT" "$WORK/out.csv"
# 出力省略時はリポジトリの台帳を更新する。比較時は別の出力パスを渡す。
set -eu
if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <repo-root> [output.csv]" >&2
  exit 1
fi
ROOT="$1"
OUT="${2:-$ROOT/docs/verification/20260930_0910_claim-ledger-r8-3.csv}"
HERE="$(pwd)"
cp "$ROOT"/docs/verification/tools/r8_3/*.py "$HERE/"
(cd "$ROOT/packages/seed" && pnpm exec node --import tsx ../../docs/verification/tools/r8_3/dump.ts "$HERE/contents.json" "$HERE/votes.json")
python3 ledger_build.py contents.json "$OUT" spec_b1 spec_b2
