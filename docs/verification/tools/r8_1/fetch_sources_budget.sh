#!/bin/sh
# R8-1 予算議案11件（第2・3・4・6・7・8・9・37・38・39・40号議案）の一次資料を取得し、テキストを抽出する。
# 出力先: カレントディレクトリの pdf/。sha256 は pdf/sha256.txt に書く。
# 台帳の source_sha256 と一致しない場合は、区が資料を差し替えた可能性がある。
set -eu
mkdir -p pdf
cd pdf
# 全文PDF11件（第2・3・4・6・7・8・9・37・38・39・40号）、補正予算概要PDF3件（第6〜9号 / 第40号 / 第37〜39号）、議案の概要と審議結果PDF
for id in 000448412 000448413 000448488 000448416 000448417 000448418 000448419 000451609 000451610 000451611 000451612 000447773 000450968 000451608 000452334; do
  curl -sf -o "$id.pdf" "https://www.city.shinjuku.lg.jp/content/$id.pdf"
  pdftotext "$id.pdf" "$id.txt"
  pdftotext -layout "$id.pdf" "$id.layout.txt"
done
shasum -a 256 ./*.pdf | sed 's# \./# #' > sha256.txt
curl -sf -o decisions.html "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00015.html"
curl -sf -o session.html "https://www.city.shinjuku.lg.jp/kusei/file08_05_0003820210204_00013.html"
shasum -a 256 decisions.html session.html >> sha256.txt
# 本会議の会議録（会議録検索システム API、tenant 211・council 3163）。schedule 5 = 3月24日（第4日第4号）。
# 発言ごとの sha256 は、API が返す body をそのまま（タグを除かずに）計算する。
curl -sf -X POST -d "tenant_id=211&council_id=3163&schedule_id=5" \
  https://ssp.kaigiroku.net/dnp/search/minutes/get_minute -o "minutes_5.json"
python3 - <<'PY'
import hashlib, html, json, re
out = open("sha256.txt", "a")
for m in json.load(open("minutes_5.json"))["tenant_minutes"]:
    name = f"minute_5_{m['minute_id']}"
    open(f"{name}.txt", "w").write(re.sub(r"<[^>]+>", "", m["body"]))
    out.write(f"{hashlib.sha256(m['body'].encode()).hexdigest()}  {name}\n")
out.close()
for name in ("decisions", "session"):
    t = open(f"{name}.html", encoding="utf-8", errors="ignore").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    open(f"{name}.txt", "w").write(html.unescape(re.sub(r"<[^>]+>", "\n", t)))
PY
