"""R8-3 の主張台帳を組み立てる。

- 各行の evidence_excerpt を一次資料の抽出テキストと機械照合する
  （NFKC 正規化・空白除去のうえ、「…」で区切った各断片が本文に含まれること）。
- reviewed_content_sha256 は解説本文（title\\nsummary\\ncontent）から計算する。
- 出力は BOM 付き UTF-8・CRLF（既存台帳と同じ）。
"""
import csv, hashlib, importlib, io, json, re, sys, unicodedata

BASE = "https://www.city.shinjuku.lg.jp/content/"
SOURCES = {
    "SUB": ("https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_03.html", "submissions"),
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


def norm(t):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", t))


TEXT = {}
for key, (_, f) in SOURCES.items():
    files = ["pdf/submissions.txt"] if f == "submissions" else [f"pdf/{f}.txt", f"pdf/{f}.layout.txt"]
    TEXT[key] = [norm(open(p).read()) for p in files]

NO_SOURCE_NOTE = "（本件は解説本文が「一次資料に記載がない」と明示している箇所であり、事実主張ではない）"
STATUS_NOTE = "（作成時点の審議状況の記述であり、一次資料の記載による主張ではない）"


def excerpt_ok(src, excerpt):
    frags = [norm(x) for x in excerpt.split("…") if norm(x)]
    return all(any(fr in t for t in TEXT[src]) for fr in frags)


def build(spec_modules, contents_path, out_path):
    contents = json.load(open(contents_path))
    hashes = {}
    for c in contents:
        h = hashlib.sha256(f"{c['title']}\n{c['summary']}\n{c['content']}".encode()).hexdigest()
        hashes[(c["bill_slug"], c["difficulty_level"])] = h
    rows, errors = [], []
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
                if fact is None or fact == "STATUS":
                    src = main_src
                    section = "出典に記載がない事項" if fact is None else "審議状況"
                    excerpt = NO_SOURCE_NOTE if fact is None else STATUS_NOTE
                    verdict = "needs_source"
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
