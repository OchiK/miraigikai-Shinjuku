#!/bin/sh
# R8-3 の一次資料（PDF 25件と提出議案一覧ページ）を取得し、テキストを抽出する。
# 出力先: カレントディレクトリの pdf/。sha256 は pdf/sha256.txt に書く。
# 台帳の source_sha256 と一致しない場合は、区が資料を差し替えた可能性がある。
set -eu
mkdir -p pdf
cd pdf
for id in 000466336 000466337 000466338 000466339 000466361 000466362 000466363 000466364 \
  000466368 000466369 000466370 000466371 000466374 000466375 000466376 000466377 \
  000466378 000466379 000466380 000466381 000466382 000466383 000464781 000464782 000464786; do
  curl -sf -o "$id.pdf" "https://www.city.shinjuku.lg.jp/content/$id.pdf"
  pdftotext "$id.pdf" "$id.txt"
  pdftotext -layout "$id.pdf" "$id.layout.txt"
done
shasum -a 256 ./*.pdf | sed 's# \./# #' > sha256.txt
curl -sf -o submissions.html "https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html"
python3 - <<'PY'
import html, re
t = open("submissions.html", encoding="utf-8").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
open("submissions.txt", "w").write(html.unescape(re.sub(r"<[^>]+>", "\n", t)))
PY
