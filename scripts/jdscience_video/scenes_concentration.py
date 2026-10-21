"""Concentration lesson scenes — solutions, flasks, g/dm³ and mol/dm³."""

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
TOPIC = "Calculating concentration"
PAGES = 12


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
    g.flask(d, 1580, 520, 1.15, liquid=(70, 170, 180), label="volumetric flask")
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    d.text((88, 200), "Calculating Concentration", font=font("bold", 56), fill=WHITE)
    d.text((88, 278), "How much solute is dissolved in a solution", font=font("regular", 24), fill=MUTED)
    d.text((88, 318), STRAPLINE, font=font("regular", 18), fill=MUTED)
    spots["title"] = hotspot((88, 200, 1100, 270))
    items = [
        ("a1", "What concentration means"),
        ("a2", "Concentration in g dm⁻³"),
        ("a3", "Concentration in mol dm⁻³"),
        ("a4", "A question to try yourself"),
    ]
    y = 380
    for key, label in items:
        box = (88, y, 900, y + 72)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key == "a4" else TEAL, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 84
    return img, spots


def concept(revealed, t=0.0):
    img, d = _base(2)
    heading(d, "What is concentration?", "How much solute is dissolved in a given volume of solution")
    spots = {}
    g.beaker(d, 180, 320, w=220, h=280, fill_frac=0.6, liquid=(70, 160, 190), solute=True, conc=True, label="solution")
    g.particles(d, 290, 430, t, n=14, scale=0.45)
    rows = [
        ("def", "Concentration = amount of solute per unit volume"),
        ("solute", "Solute  —  the substance being dissolved"),
        ("vol", "Volume  —  the amount of solution, not just solvent"),
    ]
    y = 250
    for key, label in rows:
        box = (520, y, W - 88, y + 140)
        if _vis(revealed, key):
            _row(d, box, label, size=26, key=key, spots=spots)
        else:
            _empty(d, box)
        y += 160
    return img, spots


def solute_solvent(revealed, t=0.0):
    img, d = _base(3)
    heading(d, "Solute, solvent, solution", "Sodium chloride dissolving in water")
    spots = {}
    show_solute = _vis(revealed, "solute")
    show_solvent = _vis(revealed, "solvent")
    show_sol = _vis(revealed, "solution")
    g.solute_solvent(d, 200, 320, show_solute, show_solvent, show_sol)
    if show_solute:
        spots["solute"] = hotspot((200, 320, 340, 540))
        d.text((265, 300), chem("NaCl"), font=font("bold", 28), fill=GOLD, anchor="mm")
    if show_solvent:
        spots["solvent"] = hotspot((400, 320, 540, 540))
        d.text((465, 300), chem("H2O"), font=font("bold", 28), fill=TEAL_BAR, anchor="mm")
    if show_sol:
        spots["solution"] = hotspot((600, 320, 740, 540))
    rows = [
        ("solute", "Sodium chloride is the solute"),
        ("solvent", "Water is the solvent"),
        ("solution", "The mixture is a solution"),
    ]
    y = 250
    for key, label in rows:
        box = (980, y, W - 88, y + 140)
        if _vis(revealed, key):
            acc = GOLD if key == "solution" else TEAL
            _row(d, box, label, accent=acc, size=26, key=key + "_row", spots=spots)
        else:
            _empty(d, box)
        y += 160
    return img, spots


def conc_dilute(revealed, t=0.0):
    img, d = _base(4)
    heading(d, "Concentrated or dilute?", "More solute per unit volume means a more concentrated solution")
    spots = {}
    left = (88, 250, 920, 760)
    right = (960, 250, W - 88, 760)
    d.rounded_rectangle(left, 22, fill=NAVY_ROW)
    d.rounded_rectangle(right, 22, fill=NAVY_ROW)
    if _vis(revealed, "conc"):
        g.beaker(d, 360, 330, w=200, h=260, fill_frac=0.65, liquid=(40, 140, 160), solute=True, conc=True, label="concentrated")
        spots["conc"] = hotspot((360, 330, 560, 620))
    if _vis(revealed, "dilute"):
        g.beaker(d, 1230, 330, w=200, h=260, fill_frac=0.65, liquid=(120, 180, 210), solute=True, conc=False, label="dilute")
        spots["dilute"] = hotspot((1230, 330, 1430, 620))
    return img, spots


def formula_g(revealed, t=0.0):
    img, d = _base(5)
    heading(d, "Concentration in g dm⁻³", "Mass of solute divided by volume of solution")
    spots = {}
    cards = [
        ("c", "c", "concentration / g dm⁻³", TEAL),
        ("m", "m", "mass of solute / g", GOLD),
        ("v", "V", "volume / dm³", GREEN),
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
    if _vis(revealed, "eq"):
        box = (88, 500, W - 88, 620)
        _row(d, box, "c  =  mass of solute  ÷  volume of solution", key="eq", spots=spots, size=32, accent=GOLD)
    if _vis(revealed, "units"):
        box = (88, 650, W - 88, 760)
        _row(d, box, "Mass in grams.   Volume in cubic decimetres (dm³).", key="units", spots=spots)
    return img, spots


def convert(revealed, t=0.0):
    img, d = _base(6)
    heading(d, "Converting the volume", "1 dm³  =  1000 cm³")
    spots = {}
    g.flask(d, 320, 520, 1.2, liquid=(70, 160, 190), label="1 dm³")
    if _vis(revealed, "eq"):
        d.text((820, 430), "1 dm³  =  1000 cm³", font=font("bold", 48), fill=GOLD, anchor="lm")
        spots["eq"] = hotspot((820, 380, 1600, 480))
        spots["one"] = hotspot((820, 380, 980, 480))
        spots["thousand"] = hotspot((1180, 380, 1500, 480))
    if _vis(revealed, "rule"):
        box = (700, 540, W - 88, 700)
        _row(d, box, "If volume is in cm³, divide by 1000 first.", key="rule", spots=spots, size=30, accent=GOLD)
    return img, spots


def example1(revealed, t=0.0):
    img, d = _base(7)
    heading(d, "Worked example 1", "Concentration in g dm⁻³")
    spots = {}
    g.flask(d, 1680, 200, 0.45, liquid=(90, 170, 160))
    given = (88, 240, W - 88, 340)
    d.rounded_rectangle(given, 18, fill=NAVY_ROW)
    if _vis(revealed, "m10"):
        d.text((120, 290), "mass  =  10 g NaCl", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["m10"] = hotspot((120, 255, 520, 325))
    if _vis(revealed, "v250"):
        d.text((620, 290), "volume  =  250 cm³", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["v250"] = hotspot((620, 255, 1100, 325))
    board = (88, 370, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "conv"):
        d.text((140, 450), "250  ÷  1000", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["c250"] = hotspot((140, 415, 260, 490))
        spots["c1000"] = hotspot((330, 415, 520, 490))
    if _vis(revealed, "v025"):
        d.text((560, 450), "=  0.25 dm³", font=font("bold", 40), fill=GOLD, anchor="lm")
        spots["v025"] = hotspot((560, 415, 920, 490))
    if _vis(revealed, "div"):
        d.text((140, 560), "10  ÷  0.25", font=font("bold", 44), fill=WHITE, anchor="lm")
        spots["d10"] = hotspot((140, 520, 240, 610))
        spots["d025"] = hotspot((300, 520, 500, 610))
    if _vis(revealed, "c40"):
        d.text((560, 560), "=  40 g dm⁻³", font=font("bold", 44), fill=GOLD, anchor="lm")
        spots["c40"] = hotspot((560, 520, 1100, 610))
    if _vis(revealed, "note"):
        d.text((140, 700), "Use the final volume of the solution, not the water added.", font=font("medium", 26), fill=MUTED, anchor="lm")
        spots["note"] = hotspot((140, 670, 1500, 740))
    return img, spots


def formula_mol(revealed, t=0.0):
    img, d = _base(8)
    heading(d, "Concentration in mol dm⁻³", "Number of moles divided by volume of solution")
    spots = {}
    cards = [
        ("c", "c", "concentration / mol dm⁻³", TEAL),
        ("n", "n", "amount / mol", GOLD),
        ("v", "V", "volume / dm³", GREEN),
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
    if _vis(revealed, "eq"):
        box = (88, 520, W - 88, 700)
        _row(d, box, "c  =  number of moles  ÷  volume in dm³", key="eq", spots=spots, size=32, accent=GOLD)
    return img, spots


def example2(revealed, t=0.0):
    img, d = _base(9)
    heading(d, "Worked example 2", "Concentration in mol dm⁻³")
    spots = {}
    given = (88, 240, W - 88, 340)
    d.rounded_rectangle(given, 18, fill=NAVY_ROW)
    if _vis(revealed, "n05"):
        d.text((120, 290), "n  =  0.5 mol NaOH", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["n05"] = hotspot((120, 255, 560, 325))
    if _vis(revealed, "v250"):
        d.text((680, 290), "volume  =  250 cm³", font=font("semibold", 30), fill=INK, anchor="lm")
        spots["v250"] = hotspot((680, 255, 1160, 325))
    board = (88, 370, W - 88, 800)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "conv"):
        d.text((140, 470), "250 cm³  →  0.25 dm³", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["c250"] = hotspot((140, 430, 320, 520))
        spots["v025"] = hotspot((520, 430, 820, 520))
    if _vis(revealed, "div"):
        d.text((140, 590), "0.5  ÷  0.25", font=font("bold", 44), fill=WHITE, anchor="lm")
        spots["d05"] = hotspot((140, 550, 280, 650))
        spots["d025"] = hotspot((360, 550, 560, 650))
    if _vis(revealed, "c2"):
        d.text((620, 590), "=  2 mol dm⁻³", font=font("bold", 44), fill=GOLD, anchor="lm")
        spots["c2"] = hotspot((620, 550, 1120, 650))
    return img, spots


def practice_q(revealed, t=0.0):
    img, d = _base(10)
    heading(d, "Practice question", "Pause the video and try this yourself")
    spots = {}
    rows = [
        ("q", "A student dissolves 8 g of potassium chloride in water"),
        ("v", "to make 200 cm³ of solution."),
        ("ask", "Calculate the concentration in g dm⁻³."),
    ]
    y = 250
    for key, label in rows:
        box = (88, y, W - 88, y + 100)
        if _vis(revealed, key):
            _row(d, box, label, size=30, key=key, spots=spots, accent=GOLD if key == "ask" else TEAL)
        else:
            _empty(d, box)
        y += 120
    if _vis(revealed, "pause"):
        box = (88, 700, W - 88, 820)
        d.rounded_rectangle(box, 18, fill=(58, 42, 12))
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), "PAUSE THE VIDEO", font=font("bold", 34), fill=GOLD, anchor="mm")
        spots["pause"] = hotspot(box)
    return img, spots


def practice_ans(revealed, t=0.0):
    img, d = _base(11)
    heading(d, "Let's check your answer", "8 g of KCl in 200 cm³")
    spots = {}
    board = (88, 240, W - 88, 820)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "conv"):
        d.text((140, 340), "200  ÷  1000", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["c200"] = hotspot((140, 300, 260, 390))
        spots["c1000"] = hotspot((330, 300, 520, 390))
    if _vis(revealed, "v02"):
        d.text((560, 340), "=  0.2 dm³", font=font("bold", 40), fill=GOLD, anchor="lm")
        spots["v02"] = hotspot((560, 300, 900, 390))
    if _vis(revealed, "div"):
        d.text((140, 480), "8  ÷  0.2", font=font("bold", 48), fill=WHITE, anchor="lm")
        spots["d8"] = hotspot((140, 435, 220, 540))
        spots["d02"] = hotspot((280, 435, 480, 540))
    if _vis(revealed, "c40"):
        d.text((540, 480), "=  40 g dm⁻³", font=font("bold", 48), fill=GOLD, anchor="lm")
        spots["c40"] = hotspot((540, 435, 1100, 540))
    if _vis(revealed, "well"):
        d.text((140, 680), "Well done if you got that correct.", font=font("medium", 28), fill=MUTED, anchor="lm")
    return img, spots


def close(revealed, t=0.0):
    img, d = _base(12)
    heading(d, "Keep practising", "Always convert cm³ into dm³ before you divide")
    spots = {}
    rows = [
        ("g", "c  =  mass (g)  ÷  volume (dm³)"),
        ("n", "c  =  moles  ÷  volume (dm³)"),
        ("brand", "JDScience  ·  " + STRAPLINE),
    ]
    y = 280
    for key, label in rows:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key != "brand" else TEAL, size=32, key=key, spots=spots,
                 color=GOLD if key != "brand" else INK)
        else:
            _empty(d, box)
        y += 130
    return img, spots


SCENES = {
    "intro": intro,
    "concept": concept,
    "solute_solvent": solute_solvent,
    "conc_dilute": conc_dilute,
    "formula_g": formula_g,
    "convert": convert,
    "example1": example1,
    "formula_mol": formula_mol,
    "example2": example2,
    "practice_q": practice_q,
    "practice_ans": practice_ans,
    "close": close,
}
