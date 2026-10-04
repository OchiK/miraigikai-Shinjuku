#!/bin/sh
# R8-1 条例案 Group C 7件（第32〜36号議案・承認第1号・第41号議案）の一次資料を取得し、テキストを抽出する。
# 出力先: カレントディレクトリの pdf/。sha256 は pdf/sha256.txt に書く。
# 台帳の source_sha256 と一致しない場合は、区が資料を差し替えた可能性がある。
set -eu
mkdir -p pdf
cd pdf
# 全文PDF7件、提出案件概要（第32〜36号 000447774、承認第1号 000448541、第41号 000450970）、議案の概要と審議結果PDF
for id in 000448448 000448421 000448422 000448423 000448424 000448425 000451614 000447774 000448541 000450970 000452334; do
  curl -sf -o "$id.pdf" "https://www.city.shinjuku.lg.jp/content/$id.pdf"
  pdftotext "$id.pdf" "$id.txt"
  pdftotext -layout "$id.pdf" "$id.layout.txt"
done
shasum -a 256 ./*.pdf | sed 's# \./# #' > sha256.txt
curl -sf -o decisions.html "https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00015.html"
shasum -a 256 decisions.html >> sha256.txt
# 本会議の会議録（会議録検索システム API、tenant 211・council 3163）。
#   schedule 2 = 2月17日（第1日第1号）: 開会日。7件はいずれもこの日に採決されていないことの確認用（承認第1号と第32〜36号は議案送付の報告だけ）。
#   schedule 3 = 2月24日（第2日第2号）: 同上の確認用。
#   schedule 4 = 2月25日（第3日第3号）: 承認第1号・第32〜36号議案の提案説明と委員会付託。第33号議案の人事委員会の意見聴取の報告。
#   schedule 5 = 3月24日（第4日第4号）: 7件すべてがこの日に採決された。第41号議案はこの日に提案説明・付託・追加日程で採決まで行われた。
# 発言ごとの sha256 は、API が返す body をそのまま（タグを除かずに）計算する。
for sid in 2 3 4 5; do
  curl -sf -X POST -d "tenant_id=211&council_id=3163&schedule_id=$sid" \
    https://ssp.kaigiroku.net/dnp/search/minutes/get_minute -o "minutes_$sid.json"
done
python3 - <<'PY'
import hashlib, html, json, re
out = open("sha256.txt", "a")
for sid in (2, 3, 4, 5):
    for m in json.load(open(f"minutes_{sid}.json"))["tenant_minutes"]:
        name = f"minute_{sid}_{m['minute_id']}"
        open(f"{name}.txt", "w").write(re.sub(r"<[^>]+>", "", m["body"]))
        out.write(f"{hashlib.sha256(m['body'].encode()).hexdigest()}  {name}\n")
out.close()
t = open("decisions.html", encoding="utf-8", errors="ignore").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
open("decisions.txt", "w").write(html.unescape(re.sub(r"<[^>]+>", "\n", t)))
PY
