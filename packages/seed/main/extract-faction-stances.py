"""「議案の概要と審議結果」表（新宿区議会の公式PDF。区議会だよりにも同じ表）を JSON で出す（verify-faction-stances.ts から呼ぶ）。

    python3 extract-faction-stances.py <PDFのパス>

必要: pip install pdfplumber
出力: {"headings": [...8会派の略称], "rows": [{"title", "marks", "result"}, ...]}
rows は表の上から順で、議員提出議案も含む。記号は ○（賛成）/ ×（反対）に揃える。
"""

import json
import sys

import pdfplumber

RESULTS = ("承認", "可決", "否決", "同意", "認定")
# PDF の賛成は漢数字のゼロ「〇」（U+3007）。seed と同じ「○」（U+25CB）に揃える
MARKS = {"〇": "○", "○": "○", "×": "×"}


def clean(cell):
    return (cell or "").replace("\n", "").strip()


def normalize_mark(c):
    if not c:
        return c
    # 「○1人反対」のような注記付き賛否は基本記号（○/×）を取り出す
    if c.startswith("○") or c.startswith("〇"):
        return "○"
    if c.startswith("×"):
        return "×"
    return c


def main(path):
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            # 見出しの文字列は PDF ごとに空白の入り方が違うため、
            # ページの本文ではなく表の列見出し（自参ク…議決結果）で判定する
            for table in page.extract_tables():
                headings, rows = None, []
                for raw in table:
                    cells = [clean(c) for c in raw]
                    if "自参ク" in cells and "議決結果" in cells:
                        start = cells.index("自参ク")
                        headings = [c for c in cells[start:] if c][:-1]
                        continue
                    filled = [clean(c) for c in raw if clean(c)]
                    if not filled or filled[-1] not in RESULTS:
                        continue
                    normalized_filled = [normalize_mark(c) for c in filled]
                    first_mark = next((i for i, c in enumerate(normalized_filled) if c in MARKS), None)
                    if first_mark is None:
                        continue
                    marks = normalized_filled[first_mark:-1]
                    # 議案名は記号の直前の概要欄のさらに前。概要欄が結合で無い行は直前
                    title = filled[first_mark - 2] if first_mark >= 2 else filled[0]
                    if any(c not in MARKS for c in marks):
                        raise SystemExit(f"不明な記号: {title} {marks}")
                    rows.append(
                        {
                            "title": title,
                            "marks": "".join(MARKS[c] for c in marks),
                            "result": filled[-1],
                        }
                    )
                if headings and rows:
                    json.dump({"headings": headings, "rows": rows}, sys.stdout, ensure_ascii=False)
                    return
    raise SystemExit("審議結果の表が見つかりません")


if __name__ == "__main__":
    main(sys.argv[1])
