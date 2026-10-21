"""「議案の概要と審議結果」表（新宿区議会の公式PDF。区議会だよりにも同じ表）を JSON で出す（verify-faction-stances.ts から呼ぶ）。

    python3 extract-faction-stances.py <PDFのパス>

必要: pip install pdfplumber
出力: {"headings": [...会派の略称], "rows": [{"title", "marks", "result"}, ...]}
rows は表の上から順で、議員提出議案・同意・諮問も含む。記号は ○（賛成）/ ×（反対）に揃える。

列の位置は表の見出し行（自参ク…議決結果）から決める。件名の列は「概要」見出しの1つ左。
件名はセルの文字列を使わず、その行の○×セルの上下範囲と件名列の左右範囲でページを
切り抜いて読む。件名や概要が結合セルになっている表（令和8年第3回定例会）では、
セルの文字列が前の行に押し込まれたり、件名の代わりに概要が入ったりするため。
"""

import json
import sys

import pdfplumber

RESULTS = ("承認", "可決", "否決", "同意", "認定", "決定")
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


def header_columns(cells):
    """見出し行から（○×の列の範囲, 議決結果の列, 件名の列）を返す。見出し行でなければ None"""
    if "自参ク" not in cells or "議決結果" not in cells:
        return None
    first_mark = cells.index("自参ク")
    result_col = cells.index("議決結果")
    overview_col = next(
        (i for i, c in enumerate(cells) if c.replace(" ", "").replace("　", "") == "概要"),
        None,
    )
    if overview_col is None:
        raise SystemExit(f"見出し行に「概要」の列がありません: {cells}")
    return range(first_mark, result_col), result_col, overview_col - 1


def title_in_row(page, row, mark_cols, title_col, x_range):
    """行の○×セルの上下範囲 × 件名列の左右範囲を切り抜き、件名を読む"""
    bbox = next((row.cells[i] for i in mark_cols if row.cells[i] is not None), None)
    if bbox is None or title_col not in x_range:
        raise SystemExit(f"件名の位置を決められません（列 {title_col}）")
    x0, x1 = x_range[title_col]
    text = page.crop((x0, bbox[1], x1, bbox[3])).extract_text() or ""
    return text.replace("\n", "").strip()


def column_x_ranges(table):
    """列ごとの左右範囲。結合セル（None）の列は、ほかの行のセルから取る"""
    ranges = {}
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            if cell is None or i in ranges:
                continue
            # 結合セルは左端の列に幅の広い範囲で入る。右隣の列の左端までに縮める
            ranges[i] = (cell[0], cell[2])
    for i in sorted(ranges):
        if i + 1 in ranges and ranges[i][1] > ranges[i + 1][0]:
            ranges[i] = (ranges[i][0], ranges[i + 1][0])
    return ranges


def main(path):
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            # 見出しの文字列は PDF ごとに空白の入り方が違うため、
            # ページの本文ではなく表の列見出し（自参ク…議決結果）で判定する
            for table in page.find_tables():
                headings, rows, columns = None, [], None
                x_range = column_x_ranges(table)
                for row, raw in zip(table.rows, table.extract()):
                    cells = [clean(c) for c in raw]
                    found = header_columns(cells)
                    if found:
                        columns = found
                        headings = [cells[i] for i in columns[0]]
                        continue
                    if columns is None:
                        continue
                    mark_cols, result_col, title_col = columns
                    result = cells[result_col]
                    if result not in RESULTS:
                        continue
                    marks = [normalize_mark(cells[i]) for i in mark_cols]
                    title = title_in_row(page, row, mark_cols, title_col, x_range)
                    if any(c not in MARKS for c in marks):
                        raise SystemExit(f"不明な記号: {title} {marks}")
                    rows.append(
                        {
                            "title": title,
                            "marks": "".join(MARKS[c] for c in marks),
                            "result": result,
                        }
                    )
                if headings and rows:
                    json.dump({"headings": headings, "rows": rows}, sys.stdout, ensure_ascii=False)
                    return
    raise SystemExit("審議結果の表が見つかりません")


if __name__ == "__main__":
    main(sys.argv[1])
