"""Atom-economy lesson scenes — balanced equations, desired vs by-products."""

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
TOPIC = "Atom economy"
PAGES = 9


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
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    d.text((88, 200), "Atom Economy", font=font("bold", 64), fill=WHITE)
    d.text((88, 284), "How efficiently reactant atoms make the desired product", font=font("regular", 24), fill=MUTED)
    d.text((88, 324), STRAPLINE, font=font("regular", 18), fill=MUTED)
    spots["title"] = hotspot((88, 200, 820, 270))
    # mini pathway
    g.caco3(d, 1480, 420, 0.9)
    d.text((1480, 540), "→", font=font("bold", 40), fill=GOLD, anchor="mm")
    g.cao(d, 1380, 640, 0.8)
    g.co2(d, 1600, 640, 0.7)
    items = [
        ("a1", "What atom economy means"),
        ("a2", "How it is calculated"),
        ("a3", "A worked industrial example"),
        ("a4", "A question to try yourself"),
    ]
    y = 390
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
    heading(d, "What is atom economy?", "How efficiently reactant atoms become the desired product")
    spots = {}
    rows = [
        ("def", "It measures how well atoms of the reactants make the useful product"),
        ("more", "Some reactions form more than one product"),
        ("by", "One product may be useful — the others are by-products"),
    ]
    y = 250
    for key, label in rows:
        box = (88, y, W - 88, y + 140)
        if _vis(revealed, key):
            _row(d, box, label, size=28, key=key, spots=spots, accent=GOLD if key == "by" else TEAL)
        else:
            _empty(d, box)
        y += 160
    return img, spots


def high_low(revealed, t=0.0):
    img, d = _base(3)
    heading(d, "High or low atom economy?", "Industry wants more of the desired product and less waste")
    spots = {}
    left = (88, 250, 920, 760)
    right = (960, 250, W - 88, 760)
    d.rounded_rectangle(left, 22, fill=NAVY_ROW)
    d.rounded_rectangle(right, 22, fill=NAVY_ROW)
    if _vis(revealed, "high"):
        d.text((504, 330), "HIGH", font=font("bold", 40), fill=GREEN, anchor="mm")
        d.text((504, 430), "Large proportion of reactant", font=font("medium", 24), fill=INK, anchor="mm")
        d.text((504, 480), "atoms in the desired product", font=font("medium", 24), fill=INK, anchor="mm")
        spots["high"] = hotspot((200, 300, 800, 520))
    if _vis(revealed, "low"):
        d.text((1416, 330), "LOW", font=font("bold", 40), fill=GOLD, anchor="mm")
        d.text((1416, 430), "Greater proportion of", font=font("medium", 24), fill=INK, anchor="mm")
        d.text((1416, 480), "unwanted by-products", font=font("medium", 24), fill=INK, anchor="mm")
        spots["low"] = hotspot((1100, 300, 1700, 520))
    if _vis(revealed, "ind"):
        d.text((W / 2, 680), "Important in industry  ·  less waste  ·  better use of raw materials", font=font("semibold", 26), fill=GOLD, anchor="mm")
        spots["ind"] = hotspot((300, 640, 1620, 730))
    return img, spots


def formula(revealed, t=0.0):
    img, d = _base(4)
    heading(d, "How do we calculate atom economy?", "Use the balanced equation, including coefficients")
    spots = {}
    if _vis(revealed, "eq"):
        box = (88, 250, W - 88, 420)
        d.rounded_rectangle(box, 22, fill=NAVY_ROW)
        d.text((W / 2, 310), "atom economy  =", font=font("semibold", 28), fill=MUTED, anchor="mm")
        d.text((W / 2, 370), "(Mr of desired product × coefficient)  ÷  (total Mr of all products)  ×  100", font=font("bold", 28), fill=GOLD, anchor="mm")
        spots["eq"] = hotspot(box)
    if _vis(revealed, "bal"):
        box = (88, 470, W - 88, 620)
        _row(d, box, "Always check the chemical equation is balanced first.", key="bal", spots=spots, size=30, accent=GOLD)
    if _vis(revealed, "coef"):
        box = (88, 660, W - 88, 780)
        _row(d, box, "Coefficients in front of formulae must be included.", key="coef", spots=spots, size=30)
    return img, spots


def example_eq(revealed, t=0.0):
    img, d = _base(5)
    heading(d, "Worked example  ·  thermal decomposition", "Calcium carbonate → calcium oxide + carbon dioxide")
    spots = {}
    if _vis(revealed, "words"):
        box = (88, 240, W - 88, 340)
        _row(d, box, "CaCO₃  is heated  →  CaO  +  CO₂", key="words", spots=spots, size=32)
    if _vis(revealed, "eq"):
        d.text((W / 2, 430), chem("CaCO3  →  CaO  +  CO2"), font=font("bold", 48), fill=WHITE, anchor="mm")
        spots["eq"] = hotspot((400, 380, 1520, 490))
        spots["caco3"] = hotspot((430, 380, 780, 490))
        spots["cao"] = hotspot((900, 380, 1120, 490))
        spots["co2"] = hotspot((1220, 380, 1480, 490))
    if _vis(revealed, "des"):
        box = (88, 540, W - 88, 660)
        _row(d, box, "Desired product  =  calcium oxide, CaO", accent=GOLD, key="des", spots=spots, size=32)
    if _vis(revealed, "ar"):
        d.text((W / 2, 740), "Ar:   Ca = 40      C = 12      O = 16", font=font("semibold", 30), fill=MUTED, anchor="mm")
        spots["ca40"] = hotspot((620, 705, 820, 780))
        spots["c12"] = hotspot((860, 705, 1040, 780))
        spots["o16"] = hotspot((1100, 705, 1300, 780))
    return img, spots


def example_work(revealed, t=0.0):
    img, d = _base(6)
    heading(d, "Calculate the atom economy", "Desired product CaO  ·  by-product CO₂")
    spots = {}
    board = (88, 240, W - 88, 820)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "cao"):
        d.text((140, 310), chem("Mr(CaO)  =  40  +  16"), font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["p40"] = hotspot((420, 275, 500, 350))
        spots["p16"] = hotspot((560, 275, 660, 350))
    if _vis(revealed, "cao56"):
        d.text((760, 310), "=  56", font=font("bold", 34), fill=GOLD, anchor="lm")
        spots["cao56"] = hotspot((760, 275, 920, 350))
    if _vis(revealed, "co2"):
        d.text((140, 410), chem("Mr(CO2)  =  12  +  2 × 16"), font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["q12"] = hotspot((430, 375, 510, 450))
        spots["q16"] = hotspot((640, 375, 760, 450))
    if _vis(revealed, "co244"):
        d.text((820, 410), "=  44", font=font("bold", 34), fill=GOLD, anchor="lm")
        spots["co244"] = hotspot((820, 375, 980, 450))
    if _vis(revealed, "tot"):
        d.text((140, 520), "Total Mr of products  =  56  +  44", font=font("bold", 34), fill=WHITE, anchor="lm")
        spots["t56"] = hotspot((700, 485, 780, 560))
        spots["t44"] = hotspot((850, 485, 940, 560))
    if _vis(revealed, "tot100"):
        d.text((1020, 520), "=  100", font=font("bold", 34), fill=GOLD, anchor="lm")
        spots["tot100"] = hotspot((1020, 485, 1220, 560))
    if _vis(revealed, "div"):
        d.text((140, 640), "56  ÷  100  ×  100", font=font("bold", 40), fill=WHITE, anchor="lm")
        spots["d56"] = hotspot((140, 600, 240, 700))
        spots["d100"] = hotspot((300, 600, 480, 700))
    if _vis(revealed, "pct"):
        d.text((700, 640), "=  56 %", font=font("bold", 40), fill=GOLD, anchor="lm")
        spots["pct"] = hotspot((700, 600, 980, 700))
    if _vis(revealed, "mean"):
        d.text((140, 750), "56 % of the mass becomes CaO  ·  44 % becomes CO₂", font=font("semibold", 26), fill=MUTED, anchor="lm")
        spots["mean"] = hotspot((140, 720, 1500, 790))
    return img, spots


def practice_q(revealed, t=0.0):
    img, d = _base(7)
    heading(d, "Practice question", "Pause the video and try this yourself")
    spots = {}
    rows = [
        ("q", "Hydrogen peroxide decomposes to water and oxygen."),
        ("eq", chem("2H2O2  →  2H2O  +  O2")),
        ("des", "Desired product  =  water"),
        ("ar", "Ar:   H = 1      O = 16"),
    ]
    y = 240
    for key, label in rows:
        box = (88, y, W - 88, y + 88)
        if _vis(revealed, key):
            _row(d, box, label, size=30, key=key, spots=spots, accent=GOLD if key in {"eq", "des"} else TEAL)
        else:
            _empty(d, box)
        y += 100
    if _vis(revealed, "pause"):
        box = (88, 700, W - 88, 820)
        d.rounded_rectangle(box, 18, fill=(58, 42, 12))
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), "PAUSE THE VIDEO  ·  include the coefficients", font=font("bold", 30), fill=GOLD, anchor="mm")
        spots["pause"] = hotspot(box)
    return img, spots


def practice_ans(revealed, t=0.0):
    img, d = _base(8)
    heading(d, "Let's check your answer", "Include the numbers in front of the formulae")
    spots = {}
    board = (88, 230, W - 88, 820)
    d.rounded_rectangle(board, 22, fill=NAVY_ROW)
    if _vis(revealed, "h2o"):
        d.text((140, 280), chem("Mr(H2O)  =  2 × 1  +  16"), font=font("bold", 30), fill=WHITE, anchor="lm")
        spots["h2"] = hotspot((420, 250, 500, 320))
        spots["h16"] = hotspot((600, 250, 700, 320))
    if _vis(revealed, "h18"):
        d.text((760, 280), "=  18", font=font("bold", 30), fill=GOLD, anchor="lm")
        spots["h18"] = hotspot((760, 250, 900, 320))
    if _vis(revealed, "times"):
        d.text((140, 360), "Two water molecules  →  18  ×  2", font=font("bold", 30), fill=WHITE, anchor="lm")
        spots["t18"] = hotspot((700, 330, 780, 400))
        spots["t2"] = hotspot((850, 330, 920, 400))
    if _vis(revealed, "t36"):
        d.text((980, 360), "=  36", font=font("bold", 30), fill=GOLD, anchor="lm")
        spots["t36"] = hotspot((980, 330, 1140, 400))
    if _vis(revealed, "o2"):
        d.text((140, 440), chem("Mr(O2)  =  2 × 16"), font=font("bold", 30), fill=WHITE, anchor="lm")
        spots["o16"] = hotspot((420, 410, 560, 480))
    if _vis(revealed, "o32"):
        d.text((620, 440), "=  32", font=font("bold", 30), fill=GOLD, anchor="lm")
        spots["o32"] = hotspot((620, 410, 800, 480))
    if _vis(revealed, "tot"):
        d.text((140, 530), "Total Mr of products  =  36  +  32", font=font("bold", 32), fill=WHITE, anchor="lm")
        spots["tot36"] = hotspot((700, 495, 780, 575))
        spots["tot32"] = hotspot((850, 495, 940, 575))
    if _vis(revealed, "tot68"):
        d.text((1020, 530), "=  68", font=font("bold", 32), fill=GOLD, anchor="lm")
        spots["tot68"] = hotspot((1020, 495, 1180, 575))
    if _vis(revealed, "div"):
        d.text((140, 630), "36  ÷  68  ×  100", font=font("bold", 36), fill=WHITE, anchor="lm")
        spots["d36"] = hotspot((140, 590, 240, 680))
        spots["d68"] = hotspot((300, 590, 420, 680))
    if _vis(revealed, "pct"):
        d.text((680, 630), "≈  52.9 %", font=font("bold", 36), fill=GOLD, anchor="lm")
        spots["pct"] = hotspot((680, 590, 1000, 680))
    if _vis(revealed, "well"):
        d.text((140, 740), "Well done  ·  forgetting the coefficient 2 is a common mistake", font=font("medium", 24), fill=MUTED, anchor="lm")
    return img, spots


def close(revealed, t=0.0):
    img, d = _base(9)
    heading(d, "Keep practising", "Higher atom economy means less waste")
    spots = {}
    rows = [
        ("high", "A higher atom economy puts more reactant atoms in the desired product"),
        ("green", "This matters in green chemistry and industrial manufacturing"),
        ("brand", "JDScience  ·  " + STRAPLINE),
    ]
    y = 280
    for key, label in rows:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            _row(d, box, label, accent=GOLD if key != "brand" else TEAL, size=28, key=key, spots=spots,
                 color=GOLD if key != "brand" else INK)
        else:
            _empty(d, box)
        y += 130
    return img, spots


SCENES = {
    "intro": intro,
    "concept": concept,
    "high_low": high_low,
    "formula": formula,
    "example_eq": example_eq,
    "example_work": example_work,
    "practice_q": practice_q,
    "practice_ans": practice_ans,
    "close": close,
}
