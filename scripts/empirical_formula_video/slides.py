"""Slide layouts for the empirical-formulae video. Each state returns (image, hotspots)."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from .theme import (
    AMBER_HL,
    GOLD,
    GREEN,
    H,
    INK,
    MUTED,
    NAVY_ROW,
    TEAL,
    WHITE,
    W,
    chem,
    draw_centered,
    draw_chrome,
    draw_row,
    font,
    heading,
    hotspot,
    measure_run,
    new_canvas,
    row_rect,
)

Hotspots = dict[str, dict]


def _base(page: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    d = draw_chrome(img, page)
    return img, d


def _row_text(d, box, text, fnt=None, fill=INK, left=36, color=None):
    fnt = fnt or font("medium", 30)
    x0, y0, x1, y1 = box
    d.text((x0 + left, (y0 + y1) / 2), text, font=fnt, fill=color or fill, anchor="lm")


def _suffix_hotspot(d, box, prefix: str, suffix: str, fnt, left=36) -> dict:
    x0, y0, x1, y1 = box
    pw, _ = measure_run(d, prefix, fnt)
    sw, sh = measure_run(d, suffix, fnt)
    sx = x0 + left + pw
    cy = (y0 + y1) / 2
    return hotspot((sx, cy - sh / 2 - 4, sx + sw, cy + sh / 2 + 4))


def _visible(revealed: Iterable[str], name: str) -> bool:
    return name in revealed or "*" in revealed


def title(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(1)
    heading(d, "Empirical Formulae", "Building on relative atomic mass and relative formula mass")
    items = [
        ("a1", "What is an empirical formula?"),
        ("a2", "Calculating from masses"),
        ("a3", "Calculating from percentages"),
        ("a4", "Two questions to practise"),
    ]
    spots: Hotspots = {}
    for i, (key, label) in enumerate(items):
        box = row_rect(i, 4)
        if _visible(revealed, key):
            draw_row(d, box, accent=TEAL if i == 0 else GOLD if i == 3 else TEAL)
            _row_text(d, box, label)
            spots[key] = hotspot(box)
        else:
            draw_row(d, box, fill=(18, 38, 64))
            _row_text(d, box, label, fill=(80, 102, 128))
    return img, spots


def definition(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(2)
    heading(d, "What is an empirical formula?", "The simplest whole-number ratio of atoms")
    spots: Hotspots = {}

    rows = [
        ("def", "Empirical formula  =  simplest ratio", GOLD, font("semibold", 32)),
        ("glucose", None, INK, font("medium", 32)),
        ("ratio", None, INK, font("medium", 32)),
        ("ch2o", "Empirical formula:  CH₂O", GOLD, font("bold", 34)),
    ]
    for i, (key, label, color, fnt) in enumerate(rows):
        box = row_rect(i, 4)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        draw_row(d, box, accent=GOLD if key in {"def", "ch2o"} else TEAL)
        if key == "glucose":
            _draw_glucose_row(d, box, spots, revealed)
        elif key == "ratio":
            _draw_ratio_row(d, box, spots, revealed)
        else:
            _row_text(d, box, label, fnt=fnt, color=color)
            spots[key] = hotspot(box)
            if key == "ch2o":
                spots["ch2o"] = _suffix_hotspot(d, box, "Empirical formula:  ", "CH₂O", font("bold", 34))
    return img, spots


def _draw_glucose_row(d, box, spots, revealed):
    x0, y0, x1, y1 = box
    cy = (y0 + y1) / 2
    d.text((x0 + 36, cy), "Glucose:", font=font("medium", 32), fill=INK, anchor="lm")
    formula = "C₆H₁₂O₆"
    fx = x0 + 220
    d.text((fx, cy), formula, font=font("bold", 36), fill=WHITE, anchor="lm")
    tw, th = measure_run(d, formula, font("bold", 36))
    spots["glucose"] = hotspot((fx, cy - th / 2, fx + tw, cy + th / 2))
    spots["c6"] = hotspot((fx, cy - 22, fx + 48, cy + 22))
    spots["h12"] = hotspot((fx + 48, cy - 22, fx + 128, cy + 22))
    spots["o6"] = hotspot((fx + 128, cy - 22, fx + 188, cy + 22))


def _draw_ratio_row(d, box, spots, revealed):
    x0, y0, x1, y1 = box
    cy = (y0 + y1) / 2
    fnt = font("semibold", 34)
    parts = [
        ("r6a", "6"),
        ("colon1", " : "),
        ("r12", "12"),
        ("colon2", " : "),
        ("r6b", "6"),
        ("div", "   ÷ 6   =   "),
        ("out1", "1"),
        ("colon3", " : "),
        ("out2", "2"),
        ("colon4", " : "),
        ("out3", "1"),
    ]
    x = x0 + 36
    for key, text in parts:
        col = GOLD if key.startswith("out") else WHITE
        d.text((x, cy), text, font=fnt, fill=col, anchor="lm")
        tw, th = measure_run(d, text, fnt)
        if key not in {"colon1", "colon2", "colon3", "colon4", "div"}:
            spots[key] = hotspot((x, cy - 22, x + tw, cy + 22))
        x += tw
    spots["ratio"] = hotspot((x0 + 36, y0 + 12, x, y1 - 12))


def key_idea(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(3)
    heading(d, "Empirical formula: key idea", "Ratio, not necessarily the molecular formula")
    spots: Hotspots = {}
    rows = [
        ("mol", "Molecular formula:  C₆H₁₂O₆", INK),
        ("emp", "Empirical formula:  CH₂O", GOLD),
        ("same", "Both describe the same elemental proportions", INK),
    ]
    for i, (key, label, color) in enumerate(rows):
        box = row_rect(i, 3)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        draw_row(d, box, accent=GOLD if key == "emp" else TEAL)
        _row_text(d, box, label, fnt=font("semibold", 32), color=color)
        spots[key] = hotspot(box)
    return img, spots


def method(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(4)
    heading(d, "Four-step method", "From mass data to a chemical formula")
    spots: Hotspots = {}
    steps = [
        ("s1", "1", "Write down the mass of each element"),
        ("s2", "2", "Divide each mass by its Ar"),
        ("s3", "3", "Divide mole values by the smallest"),
        ("s4", "4", "Write the whole-number ratio"),
    ]
    for i, (key, num, label) in enumerate(steps):
        box = row_rect(i, 4)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            d.ellipse((box[0] + 28, box[1] + 28, box[0] + 80, box[3] - 28), fill=(30, 50, 74))
            d.text((box[0] + 54, (box[1] + box[3]) / 2), num, font=font("bold", 26), fill=(90, 110, 130), anchor="mm")
            continue
        draw_row(d, box, accent=TEAL)
        d.ellipse((box[0] + 28, box[1] + 24, box[0] + 84, box[3] - 24), fill=TEAL)
        d.text((box[0] + 56, (box[1] + box[3]) / 2), num, font=font("bold", 26), fill=WHITE, anchor="mm")
        d.text((box[0] + 110, (box[1] + box[3]) / 2), label, font=font("medium", 30), fill=INK, anchor="lm")
        spots[key] = hotspot(box)
    return img, spots


def _table_header(d, cols, y, col_x):
    for name, x0, x1 in zip([c[0] for c in cols], [c[1] for c in cols], [c[2] for c in cols]):
        d.text(((x0 + x1) / 2, y), name, font=font("semibold", 18), fill=MUTED, anchor="mm")


def _calc_table(d, cols, rows, revealed, spots, y0=250):
    """Generic calculation table. rows: list of dicts with keys matching col ids."""
    header_y = y0
    row_h = 92
    gap = 14
    # header bar
    d.rounded_rectangle((88, header_y, W - 88, header_y + 44), 12, fill=(16, 36, 60))
    for name, x0, x1 in cols:
        d.text(((x0 + x1) / 2, header_y + 22), name, font=font("semibold", 18), fill=MUTED, anchor="mm")

    for r_i, row in enumerate(rows):
        y = header_y + 56 + r_i * (row_h + gap)
        box = (88, y, W - 88, y + row_h)
        if not _visible(revealed, row["id"]):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        draw_row(d, box, accent=row.get("accent", TEAL))
        for name, x0, x1 in cols:
            key = row["id"] + "_" + name.lower().split()[0].replace("÷", "div").replace("aᵣ", "ar").replace("ar", "ar")
            # simpler: use explicit cells
        for cell_key, text, col_i, color in row["cells"]:
            if not _visible(revealed, cell_key) and cell_key != row["id"]:
                continue
            if not _visible(revealed, cell_key) and cell_key.startswith(row["id"] + "_"):
                # still skip unrevealed cells
                continue
            if cell_key != row["id"] and not _visible(revealed, cell_key):
                continue
            name, x0, x1 = cols[col_i]
            fnt = font("bold", 30) if col_i >= 3 else font("medium", 28)
            d.text(((x0 + x1) / 2, y + row_h / 2), text, font=fnt, fill=color, anchor="mm")
            tw, th = measure_run(d, text, fnt)
            cx = (x0 + x1) / 2
            spots[cell_key] = hotspot((cx - tw / 2, y + 18, cx + tw / 2, y + row_h - 18))
        spots[row["id"]] = hotspot(box)
    return header_y + 56 + len(rows) * (row_h + gap)


COLS4 = [
    ("Element", 88, 360),
    ("Mass / g", 360, 680),
    ("Ar", 680, 960),
    ("Moles", 960, 1320),
    ("Ratio", 1320, 1832),
]


def _answer_banner(d, y, text, revealed, key, spots):
    box = (88, y, W - 88, y + 100)
    if not _visible(revealed, key):
        return
    d.rounded_rectangle(box, 18, fill=(36, 48, 22))
    d.rounded_rectangle((box[0], box[1], box[0] + 10, box[3]), 18, fill=GOLD)
    d.text((box[0] + 40, (box[1] + box[3]) / 2), text, font=font("bold", 34), fill=GOLD, anchor="lm")
    spots[key] = hotspot((box[0] + 430, box[1] + 20, box[0] + 780, box[3] - 20))


def example1(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(5)
    heading(d, "Worked example 1", "Empirical formula from masses")
    spots: Hotspots = {}
    cols = COLS4
    d.rounded_rectangle((88, 248, W - 88, 292), 12, fill=(16, 36, 60))
    for name, x0, x1 in cols:
        d.text(((x0 + x1) / 2, 270), name, font=font("semibold", 18), fill=MUTED, anchor="mm")

    rows = [
        {
            "id": "mg",
            "cells": [
                ("mg", "Mg", 0, WHITE),
                ("mg_mass", "2.4", 1, WHITE),
                ("mg_ar", "24", 2, WHITE),
                ("mg_mol", "2.4 ÷ 24 = 0.10", 3, WHITE),
                ("mg_ratio", "0.10 ÷ 0.10 = 1", 4, GOLD),
            ],
        },
        {
            "id": "o",
            "cells": [
                ("o", "O", 0, WHITE),
                ("o_mass", "1.6", 1, WHITE),
                ("o_ar", "16", 2, WHITE),
                ("o_mol", "1.6 ÷ 16 = 0.10", 3, WHITE),
                ("o_ratio", "0.10 ÷ 0.10 = 1", 4, GOLD),
            ],
        },
    ]
    y = 308
    row_h = 100
    for r_i, row in enumerate(rows):
        box = (88, y, W - 88, y + row_h)
        if not _visible(revealed, row["id"]):
            draw_row(d, box, fill=(18, 38, 64))
            y += row_h + 16
            continue
        draw_row(d, box, accent=TEAL)
        for cell_key, text, col_i, color in row["cells"]:
            if cell_key not in {row["id"]} and not _visible(revealed, cell_key):
                continue
            if cell_key == row["id"]:
                name, x0, x1 = cols[col_i]
                d.text(((x0 + x1) / 2, y + row_h / 2), text, font=font("bold", 32), fill=color, anchor="mm")
                spots[cell_key] = hotspot(box)
                continue
            name, x0, x1 = cols[col_i]
            fnt = font("semibold", 28)
            d.text(((x0 + x1) / 2, y + row_h / 2), text, font=fnt, fill=color, anchor="mm")
            tw, th = measure_run(d, text, fnt)
            cx = (x0 + x1) / 2
            spots[cell_key] = hotspot((cx - tw / 2, y + 22, cx + tw / 2, y + row_h - 22))
            # finer number hotspots for Mg moles line
            if cell_key == "mg_mol":
                spots["mg_mass2"] = spots["mg_mass"]
                spots["mg_div24"] = hotspot((cx - 40, y + 22, cx + 10, y + row_h - 22))
                spots["mg_01"] = hotspot((cx + 70, y + 22, cx + tw / 2, y + row_h - 22))
            if cell_key == "o_mol":
                spots["o_01"] = hotspot((cx + 70, y + 22, cx + tw / 2, y + row_h - 22))
        y += row_h + 16

    # smallest + overall ratio + formula
    extra = [
        ("smallest", "Smallest mole value  =  0.10"),
        ("overall", "Ratio  Mg : O  =  1 : 1"),
        ("formula", "Empirical formula  =  MgO"),
    ]
    for key, label in extra:
        box = (88, y, W - 88, y + 88)
        if _visible(revealed, key):
            fill = (36, 48, 22) if key == "formula" else NAVY_ROW
            draw_row(d, box, fill=fill, accent=GOLD if key == "formula" else TEAL)
            col = GOLD if key in {"formula", "overall"} else INK
            _row_text(d, box, label, fnt=font("bold" if key == "formula" else "medium", 30), color=col)
            spots[key] = hotspot(box)
            if key == "formula":
                spots["mgo"] = _suffix_hotspot(d, box, "Empirical formula  =  ", "MgO", font("bold", 30))
            if key == "smallest":
                spots["small_01"] = _suffix_hotspot(d, box, "Smallest mole value  =  ", "0.10", font("medium", 30))
        y += 100
    return img, spots


def practice1_q(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(8)
    heading(d, "Practice question 1", "Pause and try it yourself")
    spots: Hotspots = {}
    rows = [
        ("masses", "Sodium:  4.6 g      Oxygen:  1.6 g"),
        ("ar", "Ar(Na)  =  23          Ar(O)  =  16"),
        ("ask", "What is the empirical formula?"),
        ("pause", "PAUSE THE VIDEO"),
    ]
    for i, (key, label) in enumerate(rows):
        box = row_rect(i, 4)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        if key == "pause":
            d.rounded_rectangle(box, 18, fill=(58, 42, 12))
            d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), label, font=font("bold", 32), fill=GOLD, anchor="mm")
        else:
            draw_row(d, box, accent=TEAL)
            _row_text(d, box, label, fnt=font("semibold" if key == "ask" else "medium", 30))
        spots[key] = hotspot(box)
        if key == "masses":
            spots["na_mass"] = hotspot((box[0] + 200, box[1] + 16, box[0] + 340, box[3] - 16))
            spots["o_mass"] = hotspot((box[0] + 560, box[1] + 16, box[0] + 720, box[3] - 16))
        if key == "ar":
            spots["na_ar"] = hotspot((box[0] + 200, box[1] + 16, box[0] + 320, box[3] - 16))
            spots["o_ar"] = hotspot((box[0] + 620, box[1] + 16, box[0] + 740, box[3] - 16))
    return img, spots


def practice1_ans(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(9)
    heading(d, "Practice 1  ·  Answer", "Let’s check your working")
    spots: Hotspots = {}
    cols = COLS4
    d.rounded_rectangle((88, 248, W - 88, 292), 12, fill=(16, 36, 60))
    for name, x0, x1 in cols:
        d.text(((x0 + x1) / 2, 270), name, font=font("semibold", 18), fill=MUTED, anchor="mm")
    rows = [
        ("na", [("na", "Na", 0, WHITE), ("na_mass", "4.6", 1, WHITE), ("na_ar", "23", 2, WHITE),
                ("na_mol", "4.6 ÷ 23 = 0.20", 3, WHITE), ("na_ratio", "0.20 ÷ 0.10 = 2", 4, GOLD)]),
        ("o", [("o", "O", 0, WHITE), ("o_mass", "1.6", 1, WHITE), ("o_ar", "16", 2, WHITE),
               ("o_mol", "1.6 ÷ 16 = 0.10", 3, WHITE), ("o_ratio", "0.10 ÷ 0.10 = 1", 4, GOLD)]),
    ]
    y = 308
    row_h = 100
    for rid, cells in rows:
        box = (88, y, W - 88, y + row_h)
        if not _visible(revealed, rid):
            draw_row(d, box, fill=(18, 38, 64))
            y += row_h + 16
            continue
        draw_row(d, box, accent=TEAL)
        for cell_key, text, col_i, color in cells:
            if cell_key != rid and not _visible(revealed, cell_key):
                continue
            name, x0, x1 = cols[col_i]
            fnt = font("bold", 32) if col_i == 0 else font("semibold", 28)
            d.text(((x0 + x1) / 2, y + row_h / 2), text, font=fnt, fill=color, anchor="mm")
            tw, _ = measure_run(d, text, fnt)
            cx = (x0 + x1) / 2
            spots[cell_key] = hotspot((cx - tw / 2, y + 22, cx + tw / 2, y + row_h - 22))
        y += row_h + 16
    extra = [
        ("smallest", "Smallest mole value  =  0.10"),
        ("overall", "Ratio  Na : O  =  2 : 1"),
        ("formula", "Empirical formula  =  Na₂O"),
    ]
    for key, label in extra:
        box = (88, y, W - 88, y + 84)
        if _visible(revealed, key):
            fill = (36, 48, 22) if key == "formula" else NAVY_ROW
            draw_row(d, box, fill=fill, accent=GOLD if key == "formula" else TEAL)
            _row_text(d, box, label, fnt=font("bold" if key == "formula" else "medium", 30),
                      color=GOLD if key == "formula" else INK)
            spots[key] = hotspot(box)
            if key == "formula":
                spots["na2o"] = _suffix_hotspot(d, box, "Empirical formula  =  ", "Na₂O", font("bold", 30))
        y += 96
    return img, spots


def example2(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(11)
    heading(d, "Worked example 2", "Empirical formula from percentages")
    spots: Hotspots = {}
    rows = [
        ("pct", "C  =  40.0%      H  =  6.7%      O  =  53.3%"),
        ("assume", "Assume a 100 g sample"),
        ("grams", "40.0 g C      6.7 g H      53.3 g O"),
        ("ar", "Ar  C = 12,   H = 1,   O = 16"),
    ]
    for i, (key, label) in enumerate(rows):
        box = row_rect(i, 4)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        draw_row(d, box, accent=GOLD if key == "assume" else TEAL)
        col = GOLD if key == "assume" else INK
        _row_text(d, box, label, fnt=font("semibold", 30), color=col)
        spots[key] = hotspot(box)
        if key == "pct":
            spots["c_pct"] = hotspot((box[0] + 36, box[1] + 16, box[0] + 280, box[3] - 16))
            spots["h_pct"] = hotspot((box[0] + 300, box[1] + 16, box[0] + 560, box[3] - 16))
            spots["o_pct"] = hotspot((box[0] + 580, box[1] + 16, box[0] + 900, box[3] - 16))
        if key == "grams":
            spots["c_g"] = hotspot((box[0] + 36, box[1] + 16, box[0] + 280, box[3] - 16))
            spots["h_g"] = hotspot((box[0] + 300, box[1] + 16, box[0] + 540, box[3] - 16))
            spots["o_g"] = hotspot((box[0] + 560, box[1] + 16, box[0] + 860, box[3] - 16))
        if key == "ar":
            spots["c_ar"] = hotspot((box[0] + 160, box[1] + 16, box[0] + 280, box[3] - 16))
            spots["h_ar"] = hotspot((box[0] + 360, box[1] + 16, box[0] + 480, box[3] - 16))
            spots["o_ar"] = hotspot((box[0] + 560, box[1] + 16, box[0] + 700, box[3] - 16))
    return img, spots


def example2_work(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(12)
    heading(d, "Worked example 2  ·  Working", "Divide each mass by Ar, then by the smallest")
    spots: Hotspots = {}
    cols = COLS4
    d.rounded_rectangle((88, 248, W - 88, 292), 12, fill=(16, 36, 60))
    for name, x0, x1 in cols:
        d.text(((x0 + x1) / 2, 270), name, font=font("semibold", 18), fill=MUTED, anchor="mm")
    rows = [
        ("c", [("c", "C", 0, WHITE), ("c_mass", "40.0", 1, WHITE), ("c_ar", "12", 2, WHITE),
               ("c_mol", "40.0 ÷ 12 = 3.33", 3, WHITE), ("c_ratio", "3.33 ÷ 3.33 ≈ 1", 4, GOLD)]),
        ("h", [("h", "H", 0, WHITE), ("h_mass", "6.7", 1, WHITE), ("h_ar", "1", 2, WHITE),
               ("h_mol", "6.7 ÷ 1 = 6.70", 3, WHITE), ("h_ratio", "6.70 ÷ 3.33 ≈ 2", 4, GOLD)]),
        ("o", [("o", "O", 0, WHITE), ("o_mass", "53.3", 1, WHITE), ("o_ar", "16", 2, WHITE),
               ("o_mol", "53.3 ÷ 16 = 3.33", 3, WHITE), ("o_ratio", "3.33 ÷ 3.33 ≈ 1", 4, GOLD)]),
    ]
    y = 308
    row_h = 88
    for rid, cells in rows:
        box = (88, y, W - 88, y + row_h)
        if not _visible(revealed, rid):
            draw_row(d, box, fill=(18, 38, 64))
            y += row_h + 12
            continue
        draw_row(d, box, accent=TEAL)
        for cell_key, text, col_i, color in cells:
            if cell_key != rid and not _visible(revealed, cell_key):
                continue
            name, x0, x1 = cols[col_i]
            fnt = font("bold", 30) if col_i == 0 else font("semibold", 26)
            d.text(((x0 + x1) / 2, y + row_h / 2), text, font=fnt, fill=color, anchor="mm")
            tw, _ = measure_run(d, text, fnt)
            cx = (x0 + x1) / 2
            spots[cell_key] = hotspot((cx - tw / 2, y + 16, cx + tw / 2, y + row_h - 16))
        y += row_h + 12
    extra = [
        ("overall", "Ratio  C : H : O  ≈  1 : 2 : 1"),
        ("formula", "Empirical formula  =  CH₂O"),
    ]
    for key, label in extra:
        box = (88, y, W - 88, y + 80)
        if _visible(revealed, key):
            fill = (36, 48, 22) if key == "formula" else NAVY_ROW
            draw_row(d, box, fill=fill, accent=GOLD if key == "formula" else TEAL)
            _row_text(d, box, label, fnt=font("bold" if key == "formula" else "medium", 30),
                      color=GOLD if key == "formula" else INK)
            spots[key] = hotspot(box)
            if key == "formula":
                spots["ch2o"] = _suffix_hotspot(d, box, "Empirical formula  =  ", "CH₂O", font("bold", 30))
        y += 92
    return img, spots


def practice2_q(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(14)
    heading(d, "Practice question 2", "Pause and work through the calculation")
    spots: Hotspots = {}
    rows = [
        ("c", "Carbon  =  52.2%"),
        ("h", "Hydrogen  =  13.0%"),
        ("o", "Oxygen  =  34.8%"),
        ("ar", "Ar:  C = 12,   H = 1,   O = 16"),
        ("pause", "PAUSE THE VIDEO"),
    ]
    for i, (key, label) in enumerate(rows):
        box = row_rect(i, 5)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        if key == "pause":
            d.rounded_rectangle(box, 18, fill=(58, 42, 12))
            d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), label, font=font("bold", 30), fill=GOLD, anchor="mm")
        else:
            draw_row(d, box, accent=TEAL)
            _row_text(d, box, label, fnt=font("medium", 28))
        spots[key] = hotspot(box)
    return img, spots


def practice2_ans(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(15)
    heading(d, "Practice 2  ·  Answer", "Assume 100 g, then divide by Ar and by the smallest")
    spots: Hotspots = {}
    cols = COLS4
    d.rounded_rectangle((88, 248, W - 88, 292), 12, fill=(16, 36, 60))
    for name, x0, x1 in cols:
        d.text(((x0 + x1) / 2, 270), name, font=font("semibold", 18), fill=MUTED, anchor="mm")
    rows = [
        ("c", [("c", "C", 0, WHITE), ("c_mass", "52.2", 1, WHITE), ("c_ar", "12", 2, WHITE),
               ("c_mol", "52.2 ÷ 12 = 4.35", 3, WHITE), ("c_ratio", "4.35 ÷ 2.175 = 2", 4, GOLD)]),
        ("h", [("h", "H", 0, WHITE), ("h_mass", "13.0", 1, WHITE), ("h_ar", "1", 2, WHITE),
               ("h_mol", "13.0 ÷ 1 = 13.0", 3, WHITE), ("h_ratio", "13.0 ÷ 2.175 ≈ 6", 4, GOLD)]),
        ("o", [("o", "O", 0, WHITE), ("o_mass", "34.8", 1, WHITE), ("o_ar", "16", 2, WHITE),
               ("o_mol", "34.8 ÷ 16 = 2.175", 3, WHITE), ("o_ratio", "2.175 ÷ 2.175 = 1", 4, GOLD)]),
    ]
    y = 304
    row_h = 84
    for rid, cells in rows:
        box = (88, y, W - 88, y + row_h)
        if not _visible(revealed, rid):
            draw_row(d, box, fill=(18, 38, 64))
            y += row_h + 10
            continue
        draw_row(d, box, accent=TEAL)
        for cell_key, text, col_i, color in cells:
            if cell_key != rid and not _visible(revealed, cell_key):
                continue
            name, x0, x1 = cols[col_i]
            fnt = font("bold", 28) if col_i == 0 else font("semibold", 24)
            d.text(((x0 + x1) / 2, y + row_h / 2), text, font=fnt, fill=color, anchor="mm")
            tw, _ = measure_run(d, text, fnt)
            cx = (x0 + x1) / 2
            spots[cell_key] = hotspot((cx - tw / 2, y + 14, cx + tw / 2, y + row_h - 14))
        y += row_h + 10
    extra = [
        ("smallest", "Smallest mole value  =  2.175"),
        ("overall", "Ratio  C : H : O  =  2 : 6 : 1"),
        ("formula", "Empirical formula  =  C₂H₆O"),
    ]
    for key, label in extra:
        box = (88, y, W - 88, min(y + 72, H - 80))
        if _visible(revealed, key) and box[3] > box[1] + 40:
            fill = (36, 48, 22) if key == "formula" else NAVY_ROW
            draw_row(d, box, fill=fill, accent=GOLD if key == "formula" else TEAL)
            _row_text(d, box, label, fnt=font("bold" if key == "formula" else "medium", 26),
                      color=GOLD if key == "formula" else INK)
            spots[key] = hotspot(box)
            if key == "formula":
                spots["c2h6o"] = _suffix_hotspot(d, box, "Empirical formula  =  ", "C₂H₆O", font("bold", 26))
            if key == "smallest":
                spots["small"] = _suffix_hotspot(d, box, "Smallest mole value  =  ", "2.175", font("medium", 26))
        y += 80
    return img, spots


def close(revealed: set[str]) -> tuple[Image.Image, Hotspots]:
    img, d = _base(18)
    heading(d, "Well done!", "You have completed both practice questions")
    spots: Hotspots = {}
    rows = [
        ("na2o", "From masses:  Na₂O"),
        ("c2h6o", "From percentages:  C₂H₆O"),
        ("brand", "JDScience  ·  Learn Smarter. Revise Better. Achieve More."),
    ]
    for i, (key, label) in enumerate(rows):
        box = row_rect(i, 3)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(18, 38, 64))
            continue
        draw_row(d, box, accent=GOLD if key != "brand" else TEAL)
        col = GOLD if key != "brand" else INK
        _row_text(d, box, label, fnt=font("semibold", 32), color=col)
        spots[key] = hotspot(box)
    return img, spots


SLIDES = {
    "title": title,
    "definition": definition,
    "key_idea": key_idea,
    "method": method,
    "example1": example1,
    "practice1_q": practice1_q,
    "practice1_ans": practice1_ans,
    "example2": example2,
    "example2_work": example2_work,
    "practice2_q": practice2_q,
    "practice2_ans": practice2_ans,
    "close": close,
}


def render_slide(slide_id: str, revealed: Iterable[str]) -> tuple[Image.Image, Hotspots]:
    fn = SLIDES[slide_id]
    return fn(set(revealed))
