"""R8-3 議員提出議案第11〜14号の主張台帳を組み立てる。

tools/r8_1/ledger_build.py（R8-1 議員提出議案）と同じ書式・同じ照合で、出典だけを R8-3 のものにした。
同じディレクトリの ledger_build.py（区長提出22件）は議決結果ページの表から審議状況の行を作るが、
議員提出議案は議決結果ページに載らないため使えない。

- 各行の evidence_excerpt を一次資料の抽出テキストと機械照合する
  （NFKC 正規化・空白除去のうえ、「…」で区切った各断片が本文に含まれること）。
- reviewed_content_sha256 は解説本文（title\\nsummary\\ncontent）から計算する。
- 出典に記載がない事項（spec の unknown()）は事実主張ではないので行を作らない。全行 supported になる。
- 各変種に title / summary / content の行と、審議状況（page_or_section が「審議状況」で始まる）の行が
  なければ止まる。本文中の URL が台帳の source_url に無くても止まる。
- 出力は BOM 付き UTF-8・CRLF（既存台帳と同じ）。

使い方（fetch_sources_giin.sh を実行したディレクトリで）:
  python3 ledger_build_giin.py <contents.json> <出力.csv> spec_giin
"""
import csv, hashlib, importlib, io, json, re, sys, unicodedata
from pathlib import Path
from glossary_sources_giin import SOURCES as GLOSSARY_SOURCES

BASE = "https://www.city.shinjuku.lg.jp/content/"
SOURCES = {
    "RES": (BASE + "000468947.pdf", "000468947"),
    "O13": (BASE + "000468813.pdf", "000468813"),
    "O14": (BASE + "000468814.pdf", "000468814"),
    "SES": ("https://www.city.shinjuku.lg.jp/kusei/gikai01_00123620210909_00008.html", "session"),
}
SOURCES.update({key: (source["url"], source["name"]) for key, source in GLOSSARY_SOURCES.items()})
HTML_FILES = ("session",) + tuple(source["name"] for source in GLOSSARY_SOURCES.values() if source["kind"] != "pdf")

SHA = {}
for line in open("pdf/sha256.txt"):
    h, f = line.split()
    SHA[f.replace(".pdf", "")] = h
# 会期ページ（最終更新日 2026-10-19）を 2026-10-21 に取得した時点の値。
# 区が更新すれば変わる。pdf/html-sha256.txt（fetch_sources_giin.sh が書く）と違えば止める。
SHA["session"] = "89aa878bba93fb76c241be14e8c0a641176e54e82a5bc21f0a480c3ec4140035"
HTML_SHA_ERRORS = []
for line in open("pdf/html-sha256.txt"):
    h, f = line.split()
    name = f.replace(".html", "")
    if name in SHA and SHA[name] != h:
        HTML_SHA_ERRORS.append(f"{f} の sha256 が記録値と違う: 取得 {h} / 記録 {SHA[name]}")

# Re-hash the fetched original bytes, rather than trusting a pre-written hash list.
for source in GLOSSARY_SOURCES.values():
    name = source["name"]
    actual = hashlib.sha256(Path(f"pdf/{name}.{source['kind']}").read_bytes()).hexdigest()
    SHA[name] = source["sha256"]
    if actual != SHA[name]:
        HTML_SHA_ERRORS.append(f"{name}: source changed: {actual} != {SHA[name]}")


def norm(t):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", t))


_TEXT = {}


def text_of(key):
    if key not in _TEXT:
        _, f = SOURCES[key]
        files = [f"pdf/{f}.txt"] if f in HTML_FILES else [f"pdf/{f}.txt", f"pdf/{f}.layout.txt"]
        _TEXT[key] = [norm(open(p, encoding="utf-8").read()) for p in files]
    return _TEXT[key]


def excerpt_ok(src, excerpt):
    frags = [norm(x) for x in excerpt.split("…") if norm(x)]
    return all(any(fr in t for t in text_of(src)) for fr in frags)


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
            slug, prefix, facts = bill["slug"], bill["prefix"], bill["facts"]
            counters = {}
            for field, fact, e, n, h in bill["sections"]:
                for level, claim in (("easy", e), ("normal", n), ("hard", h)):
                    if claim is None:
                        continue
                    lv = {"easy": "E", "normal": "N", "hard": "H"}[level]
                    fd = {"content": "", "title": "T", "summary": "S"}[field]
                    ck = f"{lv}{fd}"
                    counters[ck] = counters.get(ck, 0) + 1
                    cid = f"{prefix}-{ck}-{counters[ck]:02d}"
                    if fact not in facts:
                        errors.append(f"{cid}: unknown fact {fact}")
                        continue
                    src, section, excerpt = facts[fact]
                    if not excerpt_ok(src, excerpt):
                        errors.append(f"{cid} [{fact}] excerpt not found in {src}: {excerpt}")
                    url, f = SOURCES[src]
                    key = (slug, level)
                    if key not in hashes:
                        errors.append(f"{cid}: no content for {key}")
                        continue
                    rows.append({
                        "item_key": slug, "difficulty": level, "content_field": field,
                        "claim_id": cid, "final_claim": claim, "source_url": url,
                        "source_sha256": SHA[f], "page_or_section": section,
                        "evidence_excerpt": excerpt, "verdict": "supported",
                        "reviewed_content_sha256": hashes[key],
                    })
    # A definition is a factual claim, even when it is inside anchor assistance.
    # The actual term + gloss must have exactly one independently authored spec row.
    for content in contents:
        if content["difficulty_level"] != "easy":
            continue
        expected = [f"用語「{term}」の言いかえ: {gloss}" for term, gloss in
                    re.findall(r"【([^】]+)】［[^］]+］（＝([^）]+)）", content["content"])]
        actual = [r["final_claim"] for r in rows if r["item_key"] == content["bill_slug"]
                  and r["difficulty"] == "easy" and r["page_or_section"].startswith("用語説明（")]
        if sorted(expected) != sorted(actual):
            errors.append(f"{content['bill_slug']}: glossary coverage differs: expected {expected} / actual {actual}")
    ids = [r["claim_id"] for r in rows]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        errors.append(f"duplicate ids: {sorted(dup)}")
    # 本文中の URL がすべて台帳の source_url に載っていること
    urls = {r["source_url"] for r in rows}
    for c in contents:
        for u in re.findall(r"https?://[^\s|)]+", c["title"] + "\n" + c["summary"] + "\n" + c["content"]):
            if u not in urls:
                errors.append(f"{c['bill_slug']}:{c['difficulty_level']} url not in ledger: {u}")
    # 変種ごとに title/summary/content の行がそろうこと、審議状況の行があること
    fields, status = {}, {}
    for r in rows:
        k = (r["item_key"], r["difficulty"])
        fields.setdefault(k, set()).add(r["content_field"])
        if r["page_or_section"].startswith("審議状況"):
            status[k] = status.get(k, 0) + 1
    for k, v in fields.items():
        if v != {"title", "summary", "content"}:
            errors.append(f"{k} missing fields {set(['title','summary','content']) - v}")
        if not status.get(k):
            errors.append(f"{k} has no 審議状況 row")
    # 12変種すべてに行があること
    for k in hashes:
        if k not in fields:
            errors.append(f"{k} has no ledger rows")
    if errors:
        return rows, errors, fields
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=list(rows[0].keys()), lineterminator="\r\n")
    w.writeheader()
    w.writerows(rows)
    open(out_path, "w", encoding="utf-8-sig", newline="").write(buf.getvalue())
    return rows, errors, fields


if __name__ == "__main__":
    sys.path.insert(0, ".")
    sys.path.insert(0, __file__.rsplit("/", 1)[0])
    mods = sys.argv[3:]
    rows, errors, fields = build(mods, sys.argv[1], sys.argv[2])
    for e in errors:
        print("ERROR", e)
    from collections import Counter
    print(len(rows), "rows;", len(fields), "variants;", Counter(r["verdict"] for r in rows))
    if errors:
        sys.exit(1)
