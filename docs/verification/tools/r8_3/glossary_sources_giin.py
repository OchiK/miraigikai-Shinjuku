"""R8-3 やさしい版の用語説明に用いる公式資料と取得時の固定ハッシュ。

定義・用例だけに用い、他の制度の対象要件・金額・年度を議案に移さない。
HTML/XML/PDF の原本を sha256 で照合してからテキストを抽出する。
差し替えがあれば止まり、抜粋の意味を再確認する。python3 <script> <output-dir>
"""
import hashlib
import html
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCES = {'MEET': {'url': 'https://www.city.shinjuku.lg.jp/kusei/file08_00001.html',
          'name': 'shinjuku-meetings',
          'kind': 'html',
          'label': '新宿区「会議のあらまし」',
          'sha256': 'd9423d23641822ad325f74b772c2bc440b05b60003546bddcc5ab19becfbce07'},
 'CLG': {'url': 'https://www.city.toshima.lg.jp/368/kuse/gikai/aramashi/2210120908.html',
         'name': 'council-glossary',
         'kind': 'html',
         'label': '豊島区「議会用語の解説」',
         'sha256': 'b6b05e5326d36068be56d7ef44ca8b56527ae54f9e458e4d036ef8f6d97df5ea'},
 'COG': {'url': 'https://www.city.tokyo-nakano.lg.jp/kenko_hukushi/kourei/ninchisyo/ninchisyotoha.html',
         'name': 'cognitive',
         'kind': 'html',
         'label': '中野区「認知症とは」',
         'sha256': 'ea5a1b68fc0bfa249a063c768dd3eed8a383c86c1d966db08617901b1d65da15'},
 'LOC': {'url': 'https://laws.e-gov.go.jp/api/1/lawdata/322AC0000000067',
         'name': 'local-autonomy',
         'kind': 'xml',
         'label': 'e-Gov「地方自治法」',
         'sha256': 'bca93e805c3f6395a4cf9d96d37be02b4c25d19712e9f97e32615442b2380519'},
 'HOU': {'url': 'https://laws.e-gov.go.jp/api/1/lawdata/419AC1000000112',
         'name': 'housing-law',
         'kind': 'xml',
         'label': 'e-Gov「住宅確保要配慮者に対する賃貸住宅の供給の促進に関する法律」',
         'sha256': '0b2c9b05367c5abb7e792211f30e0b02f4da43c550435cc51299958ceead653f'},
 'LOW': {'url': 'https://www.pref.tochigi.lg.jp/e12/welfare/chiikifukushi/zenpan/1255573950730.html',
         'name': 'low-income',
         'kind': 'html',
         'label': '栃木県「生活福祉資金貸付制度の概要」',
         'sha256': '5e9ab47fda998520f9d0317504e2949373c3eb697aacc33149fd2eac4ee6b6d3'},
 'TAX': {'url': 'https://www.tax.metro.tokyo.lg.jp/portal/pdf/summary/summary-00.pdf',
         'name': 'tokyo-summary',
         'kind': 'pdf',
         'label': '東京都主税局「令和7年版 事業概要」p55・57（用語説明のみ）',
         'sha256': '8afb8523e728a6a09a60f1214236813ae8514083947ca27323f92cb22453c538'},
 'NRES': {'url': 'https://www.tax.metro.tokyo.lg.jp/documents/d/tax/hijyuu2tsuutatsu',
          'name': 'tax-nonres',
          'kind': 'pdf',
          'label': '東京都主税局「小規模非住宅用地に対する固定資産税及び都市計画税の減免について（通達）」',
          'sha256': 'ddd35ca4140e85476cc4e49a703e38facbac5cf13d896293c5d5d8724c295c34'},
 'BUR': {'url': 'https://www.tax.metro.tokyo.lg.jp/documents/d/tax/hijyutaku',
         'name': 'tokyo-burden',
         'kind': 'pdf',
         'label': '東京都主税局「固定資産税（土地）の負担調整制度 非住宅用地」',
         'sha256': 'f5d3463ef287c9c90914f4c4d23096ccbd7317b7823a24575106f6832e715a51'}}


def fetch(output):
    output.mkdir(parents=True, exist_ok=True)
    hashes = []
    for source in SOURCES.values():
        name, kind = source["name"], source["kind"]
        original = output / f"{name}.{kind}"
        subprocess.run(["curl", "-fsSL", "-o", str(original), source["url"]], check=True)
        actual = hashlib.sha256(original.read_bytes()).hexdigest()
        if actual != source["sha256"]:
            raise SystemExit(f"{name}: source changed: {actual} != {source['sha256']}")
        hashes.append(f"{actual}  {original.name}\n")
        if kind == "pdf":
            subprocess.run(["pdftotext", str(original), str(output / f"{name}.txt")], check=True)
            subprocess.run(["pdftotext", "-layout", str(original), str(output / f"{name}.layout.txt")], check=True)
        else:
            if kind == "xml":
                text = "\n".join(ET.parse(original).getroot().itertext())
            else:
                text = original.read_text(encoding="utf-8")
                text = re.sub(r"<script.*?</script>|<style.*?</style>", "", text, flags=re.S)
                text = html.unescape(re.sub(r"<[^>]+>", "\n", text))
            (output / f"{name}.txt").write_text(text, encoding="utf-8")
        print(f"{name}: sha256 OK")
    (output / "glossary-sha256.txt").write_text("".join(hashes), encoding="utf-8")


if __name__ == "__main__":
    fetch(Path(sys.argv[1]))
