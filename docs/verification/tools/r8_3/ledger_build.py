"""R8-3 の主張台帳を組み立てる。

- 各行の evidence_excerpt を一次資料の抽出テキストと機械照合する
  （NFKC 正規化・空白除去のうえ、「…」で区切った各断片が本文に含まれること）。
- reviewed_content_sha256 は解説本文（title\\nsummary\\ncontent）から計算する。
- 出力は BOM 付き UTF-8・CRLF（既存台帳と同じ）。
- 審議状況の行（fact "DECISION"）と最終更新日の行（fact "decdate"）は、議決結果ページ
  （DEC）の表から案件ごとに組み立てる。引用は表の1行（識別名・件名・議決結果）を
  連結した1つの断片で、抽出テキストに連続して含まれることを機械照合する。
  議決結果が案件種別の想定（議案は原案可決、決算は認定）と違えば止まる。

使い方（fetch_sources.sh を実行したディレクトリで）:
  python3 ledger_build.py <contents.json> <出力.csv> spec_b1 spec_b2
"""
import csv, hashlib, importlib, io, json, re, sys, unicodedata

BASE = "https://www.city.shinjuku.lg.jp/content/"
SOURCES = {
    "SUB": ("https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html", "submissions"),
    "DEC": ("https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00018.html", "decisions"),
    "O4": (BASE + "000464781.pdf", "000464781"),
    "O5": (BASE + "000464782.pdf", "000464782"),
    "OJ": (BASE + "000464786.pdf", "000464786"),
}
for k, pdf in {
    "P63": "000466336", "P64": "000466337", "P65": "000466338", "P66": "000466339",
    "PC1": "000466361", "PC2": "000466362", "PC3": "000466363", "PC4": "000466364",
    "P67": "000466368", "P68": "000466369", "P69": "000466370", "P70": "000466371",
    "P71": "000466374", "P72": "000466375", "P73": "000466376", "P74": "000466377",
    "P75": "000466378", "P76": "000466379", "P77": "000466380", "P78": "000466381",
    "P79": "000466382", "P80": "000466383",
}.items():
    SOURCES[k] = (BASE + pdf + ".pdf", pdf)

SHA = {}
for line in open("pdf/sha256.txt"):
    h, f = line.split()
    SHA[f.replace(".pdf", "")] = h
SHA["submissions"] = "31b8240a9210c5965a74134fca286bef83cc7b5e9eb4bae326847e0a170a89d0"
# 議決結果ページ（最終更新日 2026-10-15）の HTML を 2026-10-16 に取得した時点の値。
# 区が更新すれば変わる。pdf/html-sha256.txt（fetch_sources.sh が書く）と違えば下で報告する。
SHA["decisions"] = "ce0da96ac3ee25a9225c50dfac5b93b58f12d63594af3db0a956bb4182905389"
HTML_SHA_ERRORS = []
for line in open("pdf/html-sha256.txt"):
    h, f = line.split()
    name = f.replace(".html", "")
    if SHA.get(name) != h:
        HTML_SHA_ERRORS.append(f"{f} の sha256 が記録値と違う: 取得 {h} / 記録 {SHA.get(name)}")


def norm(t):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", t))


TEXT = {}
for key, (_, f) in SOURCES.items():
    files = [f"pdf/{f}.txt"] if f in ("submissions", "decisions") else [f"pdf/{f}.txt", f"pdf/{f}.layout.txt"]
    TEXT[key] = [norm(open(p).read()) for p in files]

NO_SOURCE_NOTE = "（本件は解説本文が「一次資料に記載がない」と明示している箇所であり、事実主張ではない）"

# 議決結果ページの表（識別名・件名・議決結果）。抽出テキストの行を順に読む。
LABEL_RE = re.compile(r"^(第\d+号議案|認定第\d+号|同意第\d+号|諮問第\d+号)$")


def parse_decisions():
    lines = [x.strip() for x in open("pdf/decisions.txt").read().split("\n") if x.strip()]
    out = {}
    for i, line in enumerate(lines):
        if LABEL_RE.match(line):
            out[line] = (lines[i + 1], lines[i + 2])
    return out


DECISIONS = parse_decisions()
DEC_UPDATED = "最終更新日：2026年10月15日"


def slug_label(slug):
    m = re.search(r"-(gian|nintei)-(\d+)$", slug)
    if not m:
        raise ValueError(slug)
    return f"第{m.group(2)}号議案" if m.group(1) == "gian" else f"認定第{m.group(2)}号"


def excerpt_ok(src, excerpt):
    frags = [norm(x) for x in excerpt.split("…") if norm(x)]
    return all(any(fr in t for t in TEXT[src]) for fr in frags)


def build(spec_modules, contents_path, out_path):
    contents = json.load(open(contents_path))
    hashes = {}
    for c in contents:
        h = hashlib.sha256(f"{c['title']}\n{c['summary']}\n{c['content']}".encode()).hexdigest()
        hashes[(c["bill_slug"], c["difficulty_level"])] = h
    rows, errors = [], list(HTML_SHA_ERRORS)
    for mod in spec_modules:
        m = importlib.import_module(mod)
        for bill in m.BILLS:
            slug, prefix, facts, claims, main_src = bill["slug"], bill["prefix"], bill["facts"], bill["claims"], bill["main"]
            counters = {}
            for level, field, claim, fact in claims:
                lv = {"easy": "E", "normal": "N", "hard": "H"}[level]
                fd = {"content": "", "title": "T", "summary": "S"}[field]
                ck = f"{lv}{fd}"
                counters[ck] = counters.get(ck, 0) + 1
                cid = f"{prefix}-{ck}-{counters[ck]:02d}"
                if fact is None:
                    src = main_src
                    section = "出典に記載がない事項"
                    excerpt = NO_SOURCE_NOTE
                    verdict = "needs_source"
                elif fact in ("DECISION", "decdate"):
                    src, verdict = "DEC", "supported"
                    if fact == "decdate":
                        section, excerpt = "最終更新日", DEC_UPDATED
                    else:
                        label = slug_label(slug)
                        title, result = DECISIONS[label]
                        want = "認定" if label.startswith("認定") else "原案可決"
                        if result != want:
                            errors.append(f"{cid}: {label} の議決結果が想定（{want}）と違う: {result}")
                        section, excerpt = "審議状況", f"{label} {title} {result}"
                        claim = claim.replace("{result}", result)
                    if not excerpt_ok(src, excerpt):
                        errors.append(f"{cid} [{fact}] excerpt not found in {src}: {excerpt}")
                else:
                    if fact not in facts:
                        errors.append(f"{cid}: unknown fact {fact}"); continue
                    src, section, excerpt = facts[fact]
                    verdict = "supported"
                    if not excerpt_ok(src, excerpt):
                        errors.append(f"{cid} [{fact}] excerpt not found in {src}: {excerpt}")
                url, f = SOURCES[src]
                key = (slug, level)
                if key not in hashes:
                    errors.append(f"{cid}: no content for {key}"); continue
                rows.append({
                    "item_key": slug, "difficulty": level, "content_field": field,
                    "claim_id": cid, "final_claim": claim, "source_url": url,
                    "source_sha256": SHA[f], "page_or_section": section,
                    "evidence_excerpt": excerpt, "verdict": verdict,
                    "reviewed_content_sha256": hashes[key],
                })
    ids = [r["claim_id"] for r in rows]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        errors.append(f"duplicate ids: {sorted(dup)}")
    # 本文中の URL がすべて台帳の source_url に載っていること
    urls = {r["source_url"] for r in rows}
    keys = {r["item_key"] for r in rows}
    for c in contents:
        if c["bill_slug"] not in keys:
            continue
        for u in re.findall(r"https?://[^\s|)]+", c["title"] + "\n" + c["summary"] + "\n" + c["content"]):
            if u not in urls:
                errors.append(f"{c['bill_slug']}:{c['difficulty_level']} url not in ledger: {u}")
    # 変種ごとに title/summary/content の行がそろうこと
    fields = {}
    for r in rows:
        fields.setdefault((r["item_key"], r["difficulty"]), set()).add(r["content_field"])
    for k, v in fields.items():
        if v != {"title", "summary", "content"}:
            errors.append(f"{k} missing fields {set(['title','summary','content']) - v}")
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=list(rows[0].keys()), lineterminator="\r\n")
    w.writeheader()
    w.writerows(rows)
    open(out_path, "w", encoding="utf-8-sig", newline="").write(buf.getvalue())
    return rows, errors, fields


if __name__ == "__main__":
    sys.path.insert(0, ".")
    mods = sys.argv[3:]
    rows, errors, fields = build(mods, sys.argv[1], sys.argv[2])
    for e in errors:
        print("ERROR", e)
    from collections import Counter
    print(len(rows), "rows;", len(fields), "variants;", Counter(r["verdict"] for r in rows))
    if errors:
        sys.exit(1)
