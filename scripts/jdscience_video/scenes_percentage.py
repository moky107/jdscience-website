"""Percentage-by-mass lesson scenes — structures, elemental contributions, % calculations."""

from __future__ import annotations

from . import graphics as g
from .theme import (
    GOLD,
    GREEN,
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
)

Hotspots = dict[str, dict]
TOPIC = "Percentage by mass"
PAGES = 8


def _vis(revealed, name):
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _base(page):
    img = new_canvas()
    return img, draw_chrome(img, page, PAGES, TOPIC)


def _row(d, box, text, accent=TEAL, key=None, spots=None, size=28, color=INK):
    draw_row(d, box, accent=accent)
    d.text((box[0] + 36, (box[1] + box[3]) / 2), text, font=font("medium", size), fill=color, anchor="lm")
    if spots is not None and key:
        spots[key] = hotspot(box)


def _empty(d, box):
    draw_row(d, box, fill=(16, 34, 58))


def intro(revealed, t=0.0):
    img, d = _base(1)
    spots = {}
    g.water(d, 1580, 430, 1.3)
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    d.text((88, 200), "Percentage by Mass", font=font("bold", 60), fill=WHITE)
    d.text((88, 284), "How much of a compound comes from each element", font=font("regular", 24), fill=MUTED)
    d.text((88, 324), STRAPLINE, font=font("regular", 18), fill=MUTED)
    spots["title"] = hotspot((88, 200, 980, 270))
    items = [
        ("a1", "What percentage by mass means"),
        ("a2", "How it is calculated"),
        ("a3", "Worked examples"),
        ("a4", "A question to try yourself"),
    ]
    y = 390
    for key, label in items:
        box = (88, y, 860, y + 72)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key == "a4" else TEAL, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 84
    return img, spots


def concept(revealed, t=0.0):
    img, d = _base(2)
    heading(d, "What is percentage by mass?", "The proportion of a compound's mass that comes from one element")
    spots = {}
    card = (88, 250, 820, 760)
    d.rounded_rectangle(card, 22, fill=NAVY_ROW)
    g.water(d, 454, 430, 1.4)
    if _vis(revealed, "h"):
        d.text((300, 620), "2 × H", font=font("semibold", 26), fill=WHITE, anchor="mm")
        spots["h"] = hotspot((230, 590, 370, 650))
    if _vis(revealed, "o"):
        d.text((600, 620), "1 × O", font=font("semibold", 26), fill=GOLD, anchor="mm")
        spots["o"] = hotspot((530, 590, 670, 650))
    if _vis(revealed, "most"):
        d.text((454, 700), "Oxygen contributes most of the mass", font=font("medium", 22), fill=GOLD, anchor="mm")
        spots["most"] = hotspot((220, 670, 690, 740))
    rows = [
        ("def", "It tells us the proportion of total mass from one element"),
        ("water", "Water contains hydrogen and oxygen"),
        ("most_r", "Two hydrogens, one oxygen — oxygen still dominates the mass"),
    ]
    y = 250
    for key, label in rows:
        box = (860, y, W - 88, y + 140)
        if _vis(revealed, key):
            _row(d, box, label, size=24, key=key, spots=spots, accent=GOLD if key == "most_r" else TEAL)
        else:
            _empty(d, box)
        y += 160
    return img, spots


def formula(revealed, t=0.0):
    img, d = _base(3)
    heading(d, "How do we calculate it?", "Element contribution  ÷  Mr of the compound  ×  100")
    spots = {}
    steps = [
        ("s1", "1.  Calculate Mr of the whole compound"),
        ("s2", "2.  Find the mass contribution of the element"),
        ("s3", "3.  Divide contribution by Mr, then × 100"),
    ]
    y = 250
    for key, label in steps:
        box = (88, y, W - 88, y + 100)
        if _vis(revealed, key):
            _row(d, box, label, size=30, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 118
    if _vis(revealed, "eq"):
        box = (88, 640, W - 88, 780)
        _row(d, box, "% by mass  =  (element contribution  ÷  Mr)  ×  100", accent=GOLD, key="eq", spots=spots, size=32)
    return img, spots


def example1(revealed, t=0.0):
    img, d = _base(4)
    heading(d, "Worked example 1  ·  water", "Percentage by mass of oxygen in H₂O")
    spots = {}
    g.water(d, 1680, 200, 0.7)
    given = (88, 240, W - 88, 330)
    d.rounded_rectangle(given, 18, fill=NAVY_ROW)
    if _vis(revealed, "h2o"):
        d.text((120, 285), chem("H2O"), font=font("bold", 32), fill=WHITE, anchor="lm")
        spots["h2o"] = hotspot((120, 250, 260, 320))
    if _vis(revealed, "h1"):
        d.text((360, 285), "H = 1", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["h1"] = hotspot((360, 250, 520, 320))
    if _vis(revealed, "o16"):
        d.text((620, 285), "O = 16", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["o16"] = hotspot((620, 250, 820, 320))
    board = (88, 360, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "mr"):
        d.text((140, 430), "Mr  =  2 × 1  +  16", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["mr2"] = hotspot((300, 395, 400, 470))
        spots["mr16"] = hotspot((500, 395, 620, 470))
        spots["mr"] = hotspot((140, 395, 700, 470))
    if _vis(revealed, "mr18"):
        d.text((760, 430), "=  18", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["mr18"] = hotspot((760, 395, 920, 470))
    if _vis(revealed, "ox"):
        d.text((140, 530), "Oxygen contribution  =  16", font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["ox"] = hotspot((140, 495, 800, 575))
    if _vis(revealed, "div"):
        d.text((140, 640), "16  ÷  18  ×  100", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["d16"] = hotspot((140, 600, 240, 690))
        spots["d18"] = hotspot((280, 600, 400, 690))
        spots["d100"] = hotspot((480, 600, 620, 690))
    if _vis(revealed, "pct"):
        d.text((700, 640), "≈  88.9 %", font=font("bold", 40), fill=GOLD, anchor="lm")
        spots["pct"] = hotspot((700, 600, 1100, 690))
    return img, spots


def example2(revealed, t=0.0):
    img, d = _base(5)
    heading(d, "Worked example 2  ·  carbon dioxide", "Percentage by mass of carbon in CO₂")
    spots = {}
    g.co2(d, 1680, 200, 0.65)
    given = (88, 240, W - 88, 330)
    d.rounded_rectangle(given, 18, fill=NAVY_ROW)
    if _vis(revealed, "co2"):
        d.text((120, 285), chem("CO2"), font=font("bold", 32), fill=WHITE, anchor="lm")
        spots["co2"] = hotspot((120, 250, 280, 320))
    if _vis(revealed, "c12"):
        d.text((360, 285), "C = 12", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["c12"] = hotspot((360, 250, 540, 320))
    if _vis(revealed, "o16"):
        d.text((640, 285), "O = 16", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["o16"] = hotspot((640, 250, 840, 320))
    board = (88, 360, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "mr"):
        d.text((140, 430), "Mr  =  12  +  2 × 16", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["mr12"] = hotspot((300, 395, 380, 470))
        spots["mr16"] = hotspot((520, 395, 640, 470))
        spots["mr"] = hotspot((140, 395, 720, 470))
    if _vis(revealed, "mr44"):
        d.text((780, 430), "=  44", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["mr44"] = hotspot((780, 395, 940, 470))
    if _vis(revealed, "carb"):
        d.text((140, 530), "Carbon contribution  =  12", font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["carb"] = hotspot((140, 495, 820, 575))
    if _vis(revealed, "div"):
        d.text((140, 640), "12  ÷  44  ×  100", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["d12"] = hotspot((140, 600, 240, 690))
        spots["d44"] = hotspot((280, 600, 400, 690))
    if _vis(revealed, "pct"):
        d.text((700, 640), "≈  27.3 %", font=font("bold", 40), fill=GOLD, anchor="lm")
        spots["pct"] = hotspot((700, 600, 1100, 690))
    return img, spots


def practice_q(revealed, t=0.0):
    img, d = _base(6)
    heading(d, "Practice question", "Pause the video and try this yourself")
    spots = {}
    g.caco3(d, 1600, 200, 0.85)
    rows = [
        ("q", "Calculate the % by mass of calcium in CaCO₃"),
        ("ca", "Ar:   Ca = 40"),
        ("c", "Ar:   C  = 12"),
        ("o", "Ar:   O  = 16"),
    ]
    y = 240
    for key, label in rows:
        box = (88, y, 1300, y + 88)
        if _vis(revealed, key):
            _row(d, box, label, size=30, key=key, spots=spots, accent=GOLD if key == "q" else TEAL)
        else:
            _empty(d, box)
        y += 100
    if _vis(revealed, "pause"):
        box = (88, 700, W - 88, 820)
        d.rounded_rectangle(box, 18, fill=(58, 42, 12))
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), "PAUSE THE VIDEO", font=font("bold", 34), fill=GOLD, anchor="mm")
        spots["pause"] = hotspot(box)
    return img, spots


def practice_ans(revealed, t=0.0):
    img, d = _base(7)
    heading(d, "Let's check your answer", "Calcium in calcium carbonate")
    spots = {}
    board = (88, 240, W - 88, 820)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "mr"):
        d.text((140, 340), "Mr  =  40  +  12  +  3 × 16", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["m40"] = hotspot((300, 305, 380, 385))
        spots["m12"] = hotspot((430, 305, 520, 385))
        spots["m16"] = hotspot((640, 305, 760, 385))
        spots["mr"] = hotspot((140, 305, 820, 385))
    if _vis(revealed, "mr100"):
        d.text((900, 340), "=  100", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["mr100"] = hotspot((900, 305, 1100, 385))
    if _vis(revealed, "ca"):
        d.text((140, 460), "Calcium contribution  =  40", font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["ca"] = hotspot((140, 420, 860, 510))
    if _vis(revealed, "div"):
        d.text((140, 580), "40  ÷  100  ×  100", font=font("bold", 44), fill=WHITE, anchor="lm")
        spots["d40"] = hotspot((140, 535, 240, 640))
        spots["d100"] = hotspot((300, 535, 480, 640))
    if _vis(revealed, "pct"):
        d.text((720, 580), "=  40 %", font=font("bold", 44), fill=GOLD, anchor="lm")
        spots["pct"] = hotspot((720, 535, 1000, 640))
    if _vis(revealed, "well"):
        d.text((140, 720), "Well done if you got that correct.", font=font("medium", 28), fill=MUTED, anchor="lm")
    return img, spots


def close(revealed, t=0.0):
    img, d = _base(8)
    heading(d, "Keep practising", "Find Mr correctly, then the element's contribution")
    spots = {}
    rows = [
        ("eq", "% by mass  =  (element contribution  ÷  Mr)  ×  100"),
        ("tip", "Count every atom of the element you are asked about"),
        ("brand", "JDScience  ·  " + STRAPLINE),
    ]
    y = 280
    for key, label in rows:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key != "brand" else TEAL, size=30, key=key, spots=spots,
                 color=GOLD if key != "brand" else INK)
        else:
            _empty(d, box)
        y += 130
    return img, spots


SCENES = {
    "intro": intro,
    "concept": concept,
    "formula": formula,
    "example1": example1,
    "example2": example2,
    "practice_q": practice_q,
    "practice_ans": practice_ans,
    "close": close,
}
