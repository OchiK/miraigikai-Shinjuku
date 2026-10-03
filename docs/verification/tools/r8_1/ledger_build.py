"""R8-1 パイロット5件の主張台帳を組み立てる。

- 各行の evidence_excerpt を一次資料の抽出テキストと機械照合する
  （NFKC 正規化・空白除去のうえ、「…」で区切った各断片が本文に含まれること）。
- reviewed_content_sha256 は解説本文（title\\nsummary\\ncontent）から計算する。
- 出力は BOM 付き UTF-8・CRLF（既存台帳と同じ）。
- 使い方（fetch_sources.sh を実行したディレクトリで）:
    python3 ledger_build.py <contents.json> <out.csv> spec
"""
import csv, hashlib, importlib, io, json, re, sys, unicodedata

BASE = "https://www.city.shinjuku.lg.jp/content/"
SOURCES = {
    "G1": (BASE + "000448420.pdf", "000448420"),
    "G5": (BASE + "000448415.pdf", "000448415"),
    "O5": (BASE + "000447772.pdf", "000447772"),
    "G20": (BASE + "000448436.pdf", "000448436"),
    "OJ": (BASE + "000447774.pdf", "000447774"),
    "G31": (BASE + "000448447.pdf", "000448447"),
    "G6": (BASE + "000452351.pdf", "000452351"),
    "RES": (BASE + "000452334.pdf", "000452334"),
    # 予算議案11件（第2・3・4・6・7・8・9・37・38・39・40号議案）
    "B2": (BASE + "000448412.pdf", "000448412"),
    "B3": (BASE + "000448413.pdf", "000448413"),
    "B4": (BASE + "000448488.pdf", "000448488"),
    "B6": (BASE + "000448416.pdf", "000448416"),
    "B7": (BASE + "000448417.pdf", "000448417"),
    "B8": (BASE + "000448418.pdf", "000448418"),
    "B9": (BASE + "000448419.pdf", "000448419"),
    "B37": (BASE + "000451609.pdf", "000451609"),
    "B38": (BASE + "000451610.pdf", "000451610"),
    "B39": (BASE + "000451611.pdf", "000451611"),
    "B40": (BASE + "000451612.pdf", "000451612"),
    "OV13": (BASE + "000447773.pdf", "000447773"),
    "OV14": (BASE + "000450968.pdf", "000450968"),
    "OV37": (BASE + "000451608.pdf", "000451608"),
    "DEC": ("https://www.city.shinjuku.lg.jp/kusei/soumu01_002090_00015.html", "decisions"),
    "SES": ("https://www.city.shinjuku.lg.jp/kusei/file08_05_0003820210204_00013.html", "session"),
}

MINUTE_VIEW = "https://ssp.kaigiroku.net/tenant/shinjuku/MinuteView.html?council_id=3163&schedule_id={sid}&minute_id={mid}"


def source(key):
    """出典キー → (URL, 取得ファイルの基底名)。M<schedule>_<minute_id> は会議録の発言。"""
    if key.startswith("M"):
        sid, mid = key[1:].split("_")
        return MINUTE_VIEW.format(sid=sid, mid=mid), f"minute_{sid}_{mid}"
    return SOURCES[key]


SHA = {}
for line in open("pdf/sha256.txt"):
    h, f = line.split()
    SHA[f.replace(".pdf", "").replace(".html", "")] = h


def norm(t):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", t))


_TEXT = {}


def text_of(key):
    if key not in _TEXT:
        _, f = source(key)
        plain = f in ("decisions", "session") or f.startswith("minute_")
        files = [f"pdf/{f}.txt"] if plain else [f"pdf/{f}.txt", f"pdf/{f}.layout.txt"]
        _TEXT[key] = [norm(open(p, encoding="utf-8").read()) for p in files]
    return _TEXT[key]

NO_SOURCE_NOTE = "（本件は解説本文が「一次資料に記載がない」と明示している箇所であり、事実主張ではない）"


def excerpt_ok(src, excerpt):
    frags = [norm(x) for x in excerpt.split("…") if norm(x)]
    return all(any(fr in t for t in text_of(src)) for fr in frags)


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
            slug, prefix, facts, main_src = bill["slug"], bill["prefix"], bill["facts"], bill["main"]
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
                    if fact is None:
                        src, section, excerpt, verdict = main_src, "出典に記載がない事項", NO_SOURCE_NOTE, "needs_source"
                    else:
                        if fact not in facts:
                            errors.append(f"{cid}: unknown fact {fact}")
                            continue
                        src, section, excerpt = facts[fact]
                        verdict = "supported"
                        if not excerpt_ok(src, excerpt):
                            errors.append(f"{cid} [{fact}] excerpt not found in {src}: {excerpt}")
                    url, f = source(src)
                    key = (slug, level)
                    if key not in hashes:
                        errors.append(f"{cid}: no content for {key}")
                        continue
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
    # 15変種すべてに行があること
    for k in hashes:
        if k not in fields:
            errors.append(f"{k} has no ledger rows")
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
