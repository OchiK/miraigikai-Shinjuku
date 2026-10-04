#!/bin/sh
# R8-1 条例案 Group B 10件（第21〜30号議案）の一次資料を取得し、テキストを抽出する。
# 出力先: カレントディレクトリの pdf/。sha256 は pdf/sha256.txt に書く。
# 台帳の source_sha256 と一致しない場合は、区が資料を差し替えた可能性がある。
set -eu
mkdir -p pdf
cd pdf
# 全文PDF10件（第21〜30号）、条例案等提出案件概要PDF、議案の概要と審議結果PDF
for id in 000448437 000448438 000448439 000448440 000448441 000448442 000448443 000448444 000448445 000448446 000447774 000452334; do
  curl -sf -o "$id.pdf" "https://www.city.shinjuku.lg.jp/content/$id.pdf"
  pdftotext "$id.pdf" "$id.txt"
  pdftotext -layout "$id.pdf" "$id.layout.txt"
done
shasum -a 256 ./*.pdf | sed 's# \./# #' > sha256.txt
curl -sf -o decisions.html "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00015.html"
shasum -a 256 decisions.html >> sha256.txt
# 本会議の会議録（会議録検索システム API、tenant 211・council 3163）。
#   schedule 2 = 2月17日（第1日第1号）: 第21号議案は追加日程で当日に採決された。
#   schedule 5 = 3月24日（第4日第4号）: 第22〜30号議案はこの日に採決された。
# 発言ごとの sha256 は、API が返す body をそのまま（タグを除かずに）計算する。
for sid in 2 5; do
  curl -sf -X POST -d "tenant_id=211&council_id=3163&schedule_id=$sid" \
    https://ssp.kaigiroku.net/dnp/search/minutes/get_minute -o "minutes_$sid.json"
done
python3 - <<'PY'
import hashlib, html, json, re
out = open("sha256.txt", "a")
for sid in (2, 5):
    for m in json.load(open(f"minutes_{sid}.json"))["tenant_minutes"]:
        name = f"minute_{sid}_{m['minute_id']}"
        open(f"{name}.txt", "w").write(re.sub(r"<[^>]+>", "", m["body"]))
        out.write(f"{hashlib.sha256(m['body'].encode()).hexdigest()}  {name}\n")
out.close()
t = open("decisions.html", encoding="utf-8", errors="ignore").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
open("decisions.txt", "w").write(html.unescape(re.sub(r"<[^>]+>", "\n", t)))
PY
