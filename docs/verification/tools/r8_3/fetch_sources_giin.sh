#!/bin/sh
# R8-3 議員提出議案第11〜14号の一次資料（PDF 3件、会期ページ）を取得し、テキストを抽出する。
# 出力先: カレントディレクトリの pdf/。sha256 は pdf/sha256.txt に書く。
# PDF の sha256 が 2026-10-21 取得時の値と違えば、区が資料を差し替えたので止まる（台帳を作り直す前に読み直すこと）。
# 会期ページ（HTML）は区が更新すると sha256 が変わる。ledger_build_giin.py が記録値と比べて止まる。
set -eu
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
mkdir -p pdf
cd pdf
for id in 000468947 000468813 000468814; do
  curl -sf -o "$id.pdf" "https://www.city.shinjuku.lg.jp/content/$id.pdf"
  pdftotext "$id.pdf" "$id.txt"
  pdftotext -layout "$id.pdf" "$id.layout.txt"
done
shasum -a 256 ./*.pdf | sed 's# \./# #' > sha256.txt
shasum -a 256 -c - <<'SHA'
f421eee5931b7fa8aa026d5ff7680ce5e233ec6773b3260931baeb1a671845cf  000468947.pdf
9e09bf316e6bef455b861893625499c8cfdc40fd406972cf4a5f38776743524b  000468813.pdf
3d5d8d4c0b517cc8d41491f65b91c6b559b0b7f9e0194e5c17c3f3f4a6d7538a  000468814.pdf
SHA
curl -sf -o session.html "https://www.city.shinjuku.lg.jp/kusei/gikai01_00123620210909_00008.html"
shasum -a 256 session.html > html-sha256.txt
python3 - <<'PY'
import html, re
for name in ("session",):
    t = open(f"{name}.html", encoding="utf-8").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    open(f"{name}.txt", "w").write(html.unescape(re.sub(r"<[^>]+>", "\n", t)))
PY

# 用語説明の公式資料も、原本の固定ハッシュを確認してから抽出する。
python3 "$SCRIPT_DIR/glossary_sources_giin.py" .
