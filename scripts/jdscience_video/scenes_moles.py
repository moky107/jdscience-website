"""Moles lesson scenes — particles, Avogadro, formula board, worked examples."""

from __future__ import annotations

import math
from typing import Iterable

from PIL import Image, ImageDraw

from .theme import (
    GOLD,
    GREEN,
    H,
    INK,
    MUTED,
    NAVY_ROW,
    STRAPLINE,
    TEAL,
    TEAL_BAR,
    W,
    WHITE,
    chem,
    draw_chrome,
    draw_row,
    font,
    heading,
    hotspot,
    measure_run,
    new_canvas,
    supnum,
)

Hotspots = dict[str, dict]
TOPIC = "Calculating moles"
PAGES = 11


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _base(page: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    return img, draw_chrome(img, page, PAGES, TOPIC)


def _particles(d: ImageDraw.ImageDraw, cx: int, cy: int, t: float, n: int = 36, scale: float = 1.0) -> None:
    for i in range(n):
        ang = (i / n) * math.tau + t * 0.12 + (i % 5) * 0.15
        r = (28 + 82 * (((i * 5) % 11) / 11)) * scale
        x = cx + int(math.cos(ang) * r)
        y = cy + int(math.sin(ang) * r * 0.86)
        col = TEAL_BAR if i % 3 == 0 else GOLD if i % 7 == 0 else (90, 170, 210)
        d.ellipse((x - 7 * scale, y - 7 * scale, x + 7 * scale, y + 7 * scale), fill=col)


def _atom(d, xy, r, fill, label=None):
    x, y = xy
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=WHITE, width=2)
    if label:
        d.text((x, y), label, font=font("bold", max(14, r)), fill=WHITE, anchor="mm")


def _water(d, ox, oy, scale=1.0):
    _atom(d, (ox, oy), int(28 * scale), (220, 80, 80), "O")
    _atom(d, (ox - int(48 * scale), oy + int(32 * scale)), int(18 * scale), (230, 230, 240), "H")
    _atom(d, (ox + int(48 * scale), oy + int(32 * scale)), int(18 * scale), (230, 230, 240), "H")
    d.line((ox - 18 * scale, oy + 10 * scale, ox - 36 * scale, oy + 24 * scale), fill=WHITE, width=3)
    d.line((ox + 18 * scale, oy + 10 * scale, ox + 36 * scale, oy + 24 * scale), fill=WHITE, width=3)


def _co2(d, ox, oy, scale=1.0):
    _atom(d, (ox, oy), int(26 * scale), (80, 80, 90), "C")
    _atom(d, (ox - int(70 * scale), oy), int(24 * scale), (220, 80, 80), "O")
    _atom(d, (ox + int(70 * scale), oy), int(24 * scale), (220, 80, 80), "O")
    d.line((ox - 26 * scale, oy, ox - 46 * scale, oy), fill=WHITE, width=4)
    d.line((ox + 26 * scale, oy, ox + 46 * scale, oy), fill=WHITE, width=4)


def _row(d, box, text, accent=TEAL, color=INK, size=28, key=None, spots=None):
    draw_row(d, box, accent=accent)
    d.text((box[0] + 36, (box[1] + box[3]) / 2), text, font=font("medium", size), fill=color, anchor="lm")
    if spots is not None and key:
        spots[key] = hotspot(box)


def _empty(d, box):
    draw_row(d, box, fill=(16, 34, 58))


def intro(revealed, t=0.0):
    img, d = _base(1)
    spots = {}
    _particles(d, 1560, 430, t)
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    d.text((88, 200), "Calculating Moles", font=font("bold", 64), fill=WHITE)
    d.text((88, 284), "Counting particles in chemistry", font=font("regular", 26), fill=MUTED)
    d.text((88, 328), STRAPLINE, font=font("regular", 20), fill=MUTED)
    spots["title"] = hotspot((88, 200, 980, 280))
    items = [
        ("a1", "What a mole is"),
        ("a2", "Moles from a given mass"),
        ("a3", "Mass from a given number of moles"),
        ("a4", "A question to try yourself"),
    ]
    y = 390
    for i, (key, label) in enumerate(items):
        box = (88, y, 820, y + 72)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key == "a4" else TEAL, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 84
    return img, spots


def concept(revealed, t=0.0):
    img, d = _base(2)
    heading(d, "What is a mole?", "Atoms, molecules and ions are far too small to count")
    spots = {}
    card = (88, 250, 760, 760)
    d.rounded_rectangle(card, 22, fill=NAVY_ROW)
    _particles(d, 424, 460, t, n=28, scale=0.85)
    d.text((424, 700), "tiny particles", font=font("medium", 22), fill=MUTED, anchor="mm")
    rows = [
        ("tiny", "Atoms, molecules and ions are extremely small"),
        ("count", "Chemists cannot count them one by one"),
        ("unit", "Instead we use a unit called the mole"),
    ]
    y = 250
    for key, label in rows:
        box = (800, y, W - 88, y + 140)
        if _vis(revealed, key):
            _row(d, box, label, size=26, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 160
    return img, spots


def avogadro(revealed, t=0.0):
    img, d = _base(3)
    heading(d, "Avogadro's constant", "One mole is a standard number of particles")
    spots = {}
    card = (88, 250, 900, 760)
    d.rounded_rectangle(card, 22, fill=NAVY_ROW)
    _particles(d, 494, 470, t, n=40, scale=1.05)
    avo = f"6.02 × 10{supnum(23)}"
    if _vis(revealed, "avo"):
        d.text((494, 690), avo, font=font("bold", 40), fill=GOLD, anchor="mm")
        tw, th = measure_run(d, avo, font("bold", 40))
        spots["avo"] = hotspot((494 - tw / 2, 690 - th / 2, 494 + tw / 2, 690 + th / 2))
        d.text((494, 734), "particles", font=font("medium", 22), fill=MUTED, anchor="mm")
    rows = [
        ("one", "One mole contains this many particles"),
        ("name", "This number is the Avogadro constant"),
    ]
    y = 250
    for key, label in rows:
        box = (940, y, W - 88, y + 200)
        if _vis(revealed, key):
            acc = GOLD if key == "name" else TEAL
            _row(d, box, label, accent=acc, size=26, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 230
    return img, spots


def same_n(revealed, t=0.0):
    img, d = _base(4)
    heading(d, "Same number, different mass", "One mole of carbon and one mole of water")
    spots = {}
    # Carbon card
    left = (88, 250, 920, 760)
    right = (960, 250, W - 88, 760)
    d.rounded_rectangle(left, 22, fill=NAVY_ROW)
    d.rounded_rectangle(right, 22, fill=NAVY_ROW)
    _atom(d, (504, 430), 54, (80, 80, 90), "C")
    _water(d, 1410, 420, 1.15)
    if _vis(revealed, "carbon"):
        d.text((504, 560), "1 mole of carbon atoms", font=font("semibold", 26), fill=WHITE, anchor="mm")
        avo = f"6.02 × 10{supnum(23)}"
        d.text((504, 640), avo, font=font("bold", 32), fill=GOLD, anchor="mm")
        tw, th = measure_run(d, avo, font("bold", 32))
        spots["carbon"] = hotspot((504 - tw / 2, 640 - th / 2, 504 + tw / 2, 640 + th / 2))
        spots["c_atom"] = hotspot((450, 376, 558, 484))
    if _vis(revealed, "water"):
        d.text((1410, 560), "1 mole of water molecules", font=font("semibold", 26), fill=WHITE, anchor="mm")
        avo = f"6.02 × 10{supnum(23)}"
        d.text((1410, 640), avo, font=font("bold", 32), fill=GOLD, anchor="mm")
        spots["water"] = hotspot((1280, 610, 1540, 670))
    if _vis(revealed, "diff"):
        d.text((W / 2, 800), "Same number of particles  ·  different masses", font=font("semibold", 28), fill=GOLD, anchor="mm")
        spots["diff"] = hotspot((520, 775, 1400, 830))
    return img, spots


def molar(revealed, t=0.0):
    img, d = _base(5)
    heading(d, "What is molar mass?", "The mass of one mole of a substance, in g/mol")
    spots = {}
    if _vis(revealed, "def"):
        box = (88, 240, W - 88, 330)
        _row(d, box, "Molar mass  =  mass of 1 mole   ·   unit g mol⁻¹", accent=GOLD, key="def", spots=spots, size=30)
    # Mg card
    left = (88, 360, 920, 760)
    right = (960, 360, W - 88, 760)
    d.rounded_rectangle(left, 22, fill=NAVY_ROW)
    d.rounded_rectangle(right, 22, fill=NAVY_ROW)
    _atom(d, (280, 540), 48, (180, 200, 210), "Mg")
    _water(d, 1120, 560, 0.95)
    if _vis(revealed, "mg24"):
        d.text((620, 430), "Magnesium   Ar = 24", font=font("semibold", 28), fill=MUTED, anchor="mm")
        spots["ar24"] = hotspot((540, 400, 760, 460))
    if _vis(revealed, "g24"):
        d.text((620, 620), "1 mole  ≈  24 g", font=font("bold", 36), fill=GOLD, anchor="mm")
        spots["mg24"] = hotspot((470, 580, 780, 660))
        spots["g24"] = hotspot((470, 580, 780, 660))
    if _vis(revealed, "h2o"):
        d.text((1480, 420), chem("H2O"), font=font("bold", 40), fill=WHITE, anchor="mm")
        spots["h2o"] = hotspot((1410, 385, 1550, 455))
    calc_y = 520
    if _vis(revealed, "two"):
        d.text((1280, calc_y), "2 × 1", font=font("semibold", 32), fill=WHITE, anchor="lm")
        spots["two"] = hotspot((1280, calc_y - 28, 1420, calc_y + 28))
    if _vis(revealed, "plus16"):
        d.text((1440, calc_y), "+  16", font=font("semibold", 32), fill=WHITE, anchor="lm")
        spots["plus16"] = hotspot((1440, calc_y - 28, 1580, calc_y + 28))
    if _vis(revealed, "eq18"):
        d.text((1610, calc_y), "=  18", font=font("semibold", 32), fill=GOLD, anchor="lm")
        spots["eq18"] = hotspot((1610, calc_y - 28, 1760, calc_y + 28))
    if _vis(revealed, "g18"):
        d.text((1480, 640), "1 mole  =  18 g", font=font("bold", 36), fill=GOLD, anchor="mm")
        spots["g18"] = hotspot((1280, 600, 1680, 680))
    return img, spots


def formula(revealed, t=0.0):
    img, d = _base(6)
    heading(d, "How do we calculate moles?", "Number of moles  =  mass  ÷  molar mass")
    spots = {}
    cards = [
        ("n", "n", "number of moles", TEAL),
        ("m", "m", "mass in grams", GOLD),
        ("mr", "Mr", "molar mass / g mol⁻¹", GREEN),
    ]
    x = 88
    for key, symbol, caption, accent in cards:
        box = (x, 250, x + 560, 460)
        if _vis(revealed, key):
            d.rounded_rectangle(box, 22, fill=NAVY_ROW)
            d.rectangle((box[0] + 8, box[1] + 18, box[0] + 18, box[3] - 18), fill=accent)
            d.text((x + 280, 300), caption, font=font("medium", 22), fill=MUTED, anchor="mm")
            d.text((x + 280, 380), symbol, font=font("bold", 72), fill=WHITE, anchor="mm")
            tw, th = measure_run(d, symbol, font("bold", 72))
            spots[key] = hotspot((x + 280 - tw / 2, 380 - th / 2, x + 280 + tw / 2, 380 + th / 2), pad=12)
        else:
            d.rounded_rectangle(box, 22, fill=(16, 34, 58))
        x += 588
    if _vis(revealed, "units"):
        box = (88, 500, W - 88, 620)
        _row(d, box, "Mass must be in grams.   Molar mass is in grams per mole.", key="units", spots=spots)
    if _vis(revealed, "apply"):
        box = (88, 650, W - 88, 760)
        _row(d, box, "Let's apply this formula to an example.", accent=GOLD, key="apply", spots=spots)
    return img, spots


def example1(revealed, t=0.0):
    img, d = _base(7)
    heading(d, "Worked example 1", "Mass of magnesium  →  number of moles")
    spots = {}
    _atom(d, (1680, 200), 36, (180, 200, 210), "Mg")
    given = (88, 240, W - 88, 340)
    d.rounded_rectangle(given, 18, fill=NAVY_ROW)
    if _vis(revealed, "q12"):
        d.text((120, 290), "mass  =  12 g", font=font("semibold", 32), fill=INK, anchor="lm")
        spots["q12"] = hotspot((250, 260, 480, 320))
        spots["q"] = hotspot(given)
    if _vis(revealed, "q24"):
        d.text((560, 290), "Ar(Mg)  =  24", font=font("semibold", 32), fill=INK, anchor="lm")
        spots["q24"] = hotspot((560, 260, 900, 320))
    board = (88, 370, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "fn"):
        d.text((140, 430), "n  =  m  ÷  Mr", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["fn"] = hotspot((140, 400, 620, 470))
    parts = [
        ("twelve", "12", 180),
        ("div", "÷", 430),
        ("twenty_four", "24", 620),
        ("eq", "=", 900),
        ("half", "0.5 mol", 1120),
    ]
    for key, text, px in parts:
        need = {"div": "twelve", "eq": "twenty_four"}.get(key, key)
        if not _vis(revealed, need):
            continue
        if key in {"div", "eq"}:
            d.text((px, 560), text, font=font("bold", 56), fill=MUTED, anchor="lm")
            continue
        col = GOLD if key == "half" else WHITE
        d.text((px, 560), text, font=font("bold", 56), fill=col, anchor="lm")
        tw, th = measure_run(d, text, font("bold", 56))
        spots[key] = hotspot((px, 560 - th / 2, px + tw, 560 + th / 2))
    if _vis(revealed, "ans"):
        d.text((140, 700), "12 g of Mg contains 0.5 mol   ·   half a mole of atoms", font=font("semibold", 30), fill=GOLD, anchor="lm")
        spots["ans"] = hotspot((140, 670, 1500, 740))
    return img, spots


def example2(revealed, t=0.0):
    img, d = _base(8)
    heading(d, "Worked example 2", "Number of moles  →  mass of carbon dioxide")
    spots = {}
    _co2(d, 1680, 200, 0.7)
    if _vis(revealed, "rearr"):
        box = (88, 240, W - 88, 330)
        _row(d, box, "Mass  =  number of moles  ×  molar mass", accent=GOLD, key="rearr", spots=spots, size=30)
    if _vis(revealed, "co2"):
        box = (88, 360, 900, 450)
        _row(d, box, chem("CO2") + "    2.00 mol", key="co2", spots=spots)
    if _vis(revealed, "c12"):
        d.text((980, 405), "C = 12", font=font("bold", 32), fill=WHITE, anchor="lm")
        spots["c12"] = hotspot((980, 375, 1160, 435))
    if _vis(revealed, "o16"):
        d.text((1240, 405), "O = 16", font=font("bold", 32), fill=WHITE, anchor="lm")
        spots["o16"] = hotspot((1240, 375, 1460, 435))
    board = (88, 480, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "mr"):
        d.text((140, 540), "Mr  =  12  +  2 × 16", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["mr12"] = hotspot((300, 510, 380, 575))
        spots["mr2"] = hotspot((430, 510, 490, 575))
        spots["mr16"] = hotspot((560, 510, 660, 575))
        spots["mr"] = hotspot((140, 510, 720, 575))
    if _vis(revealed, "mr44"):
        d.text((760, 540), "=  44", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["mr44"] = hotspot((760, 510, 920, 575))
    if _vis(revealed, "times"):
        d.text((140, 640), "2  ×  44", font=font("bold", 44), fill=WHITE, anchor="lm")
        spots["two"] = hotspot((140, 605, 200, 680))
        spots["t44"] = hotspot((280, 605, 420, 680))
    if _vis(revealed, "t88"):
        d.text((460, 640), "=  88 g", font=font("bold", 44), fill=GOLD, anchor="lm")
        spots["t88"] = hotspot((460, 605, 760, 680))
    if _vis(revealed, "ans"):
        d.text((140, 740), "Mass of 2 mol CO₂  =  88 g", font=font("semibold", 30), fill=GOLD, anchor="lm")
        spots["ans"] = hotspot((140, 710, 1100, 780))
    return img, spots


def practice_q(revealed, t=0.0):
    img, d = _base(9)
    heading(d, "Practice question", "Pause the video and try this yourself")
    spots = {}
    _water(d, 1680, 200, 0.75)
    rows = [
        ("q", "Calculate the number of moles in 9 g of water."),
        ("h", "Ar:   H = 1"),
        ("o", "Ar:   O = 16"),
        ("ask", "n  =  ?"),
    ]
    y = 250
    for key, label in rows:
        box = (88, y, 1400, y + 90)
        if _vis(revealed, key):
            _row(d, box, label, size=30, key=key, spots=spots, accent=GOLD if key == "ask" else TEAL)
        else:
            _empty(d, box)
        y += 108
    if _vis(revealed, "pause"):
        box = (88, 720, W - 88, 820)
        d.rounded_rectangle(box, 18, fill=(58, 42, 12))
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), "PAUSE THE VIDEO", font=font("bold", 34), fill=GOLD, anchor="mm")
        spots["pause"] = hotspot(box)
    return img, spots


def practice_ans(revealed, t=0.0):
    img, d = _base(10)
    heading(d, "Let's check your answer", "9 g of water")
    spots = {}
    board = (88, 240, W - 88, 820)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "h2o"):
        d.text((140, 300), chem("Water is H2O"), font=font("semibold", 32), fill=INK, anchor="lm")
        spots["h2o"] = hotspot((140, 270, 620, 340))
    if _vis(revealed, "mr"):
        d.text((140, 400), "Mr  =  2 × 1  +  16", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["mr2"] = hotspot((280, 365, 360, 440))
        spots["mr1"] = hotspot((390, 365, 450, 440))
        spots["mr16"] = hotspot((500, 365, 600, 440))
        spots["mr"] = hotspot((140, 365, 620, 440))
    if _vis(revealed, "mr18"):
        d.text((680, 400), "=  18 g mol⁻¹", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["mr18"] = hotspot((680, 365, 1100, 440))
    if _vis(revealed, "nine"):
        d.text((140, 530), "9", font=font("bold", 48), fill=WHITE, anchor="lm")
        spots["nine"] = hotspot((140, 490, 220, 580))
    if _vis(revealed, "eighteen"):
        d.text((240, 530), "÷  18", font=font("bold", 48), fill=WHITE, anchor="lm")
        spots["eighteen"] = hotspot((240, 490, 430, 580))
    if _vis(revealed, "half"):
        d.text((470, 530), "=  0.5 mol", font=font("bold", 48), fill=GOLD, anchor="lm")
        spots["half"] = hotspot((470, 490, 900, 580))
    if _vis(revealed, "ans"):
        d.text((140, 680), "9 g of water contains 0.5 mol", font=font("semibold", 32), fill=GOLD, anchor="lm")
        spots["ans"] = hotspot((140, 650, 1100, 720))
    if _vis(revealed, "well"):
        d.text((140, 760), "Well done if you got that correct.", font=font("medium", 28), fill=MUTED, anchor="lm")
    return img, spots


def close(revealed, t=0.0):
    img, d = _base(11)
    heading(d, "Keep practising", "The mole measures amount of substance")
    spots = {}
    rows = [
        ("n", "n  =  m  ÷  Mr"),
        ("m", "m  =  n  ×  Mr"),
        ("brand", "JDScience  ·  " + STRAPLINE),
    ]
    y = 280
    for key, label in rows:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key != "brand" else TEAL, size=34, key=key, spots=spots, color=GOLD if key != "brand" else INK)
        else:
            _empty(d, box)
        y += 130
    return img, spots


SCENES = {
    "intro": intro,
    "concept": concept,
    "avogadro": avogadro,
    "same_n": same_n,
    "molar": molar,
    "formula": formula,
    "example1": example1,
    "example2": example2,
    "practice_q": practice_q,
    "practice_ans": practice_ans,
    "close": close,
}
