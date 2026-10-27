"""2D labelled diagrams for acids, salts and electrolysis lessons."""

from __future__ import annotations

import math

from PIL import ImageDraw

from gcse_foundations.diagrams import (
    GREEN,
    ORANGE,
    PINK,
    PURPLE,
    beaker,
    card,
    evaporating_basin,
    funnel_filter,
    particle,
    text_block,
)
from jdscience_video.theme import GOLD, INK, LINE, MUTED, NAVY_ROW, TEAL, TEAL_BAR, WHITE, chem, font

RED = (220, 80, 80)
BLUE = (70, 150, 210)
HPLUS = (232, 140, 72)
OHMINUS = (110, 196, 150)


def ion(d, xy, label, fill, r=18):
    x, y = xy
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=WHITE, width=2)
    d.text((x, y), label, font=font("bold", 14), fill=WHITE, anchor="mm")


def labelled_beaker(d, ox, oy, title, ions, liquid=(40, 90, 130)):
    beaker(d, ox, oy, 200, 220, 0.62, liquid, label=title)
    for i, (lab, col) in enumerate(ions):
        x = ox + 40 + (i % 4) * 40
        y = oy + 70 + (i // 4) * 44
        ion(d, (x, y), lab, col, 16)


def acid_ions(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Hydrochloric acid in water", font=font("bold", 22), fill=WHITE)
    labelled_beaker(d, x0 + 80, y0 + 90, "HCl(aq)", [("H+", HPLUS), ("Cl-", BLUE), ("H+", HPLUS), ("Cl-", BLUE), ("H+", HPLUS), ("Cl-", BLUE)])
    d.text((x0 + 420, y0 + 140), "Acid → H+ in water", font=font("semibold", 24), fill=GOLD)
    d.text((x0 + 420, y0 + 190), chem("HCl(aq) → H+ + Cl-"), font=font("regular", 22), fill=INK)
    d.text((x0 + 420, y0 + 250), "GCSE answers may use H+ or H3O+.", font=font("regular", 18), fill=MUTED)


def acid_alkali(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    labelled_beaker(d, x0 + 70, y0 + 70, "acid  H+", [("H+", HPLUS), ("H+", HPLUS), ("H+", HPLUS), ("Cl-", BLUE)], (150, 70, 70))
    labelled_beaker(d, x0 + 360, y0 + 70, "alkali  OH-", [("OH-", OHMINUS), ("OH-", OHMINUS), ("Na+", GOLD), ("OH-", OHMINUS)], (40, 110, 90))
    d.text(((x0 + x1) / 2, y1 - 70), chem("H+ + OH-  →  H2O"), font=font("bold", 28), fill=GOLD, anchor="mm")
    d.text(((x0 + x1) / 2, y1 - 36), "Neutralisation — the salt's ions are spectators", font=font("regular", 18), fill=MUTED, anchor="mm")


def indicators(d, box, t=0.0):
    x0, y0, x1, y1 = box
    rows = [
        ("Litmus", "red in acid", "blue in alkali"),
        ("Methyl orange", "red in acid", "yellow in alkali"),
        ("Phenolphthalein", "colourless in acid", "pink in alkali"),
    ]
    h = (y1 - y0 - 40) // 3
    for i, (name, acid, alk) in enumerate(rows):
        y = y0 + i * (h + 12)
        card(d, (x0, y, x1, y + h), accent=TEAL)
        d.text((x0 + 28, y + 18), name, font=font("bold", 24), fill=WHITE)
        d.text((x0 + 28, y + 58), f"Acid: {acid}    ·    Alkali: {alk}", font=font("regular", 20), fill=MUTED)


def ph_scale(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Universal indicator and pH", font=font("bold", 22), fill=WHITE)
    colours = [
        (0, (180, 30, 40), "strong acid"),
        (2, (220, 90, 40), "acid"),
        (4, (230, 170, 40), "weak acid"),
        (7, (70, 170, 90), "neutral"),
        (10, (50, 120, 200), "weak alkali"),
        (14, (90, 50, 160), "strong alkali"),
    ]
    gx0, gx1 = x0 + 80, x1 - 80
    gy = y0 + 160
    for i in range(15):
        x = gx0 + i * (gx1 - gx0) / 14
        # interpolate colour
        if i <= 2:
            col = (200, 40, 50)
        elif i <= 5:
            col = (230, 140, 40)
        elif i == 7:
            col = (80, 180, 100)
        elif i <= 9:
            col = (70, 160, 190)
        elif i <= 11:
            col = (50, 100, 200)
        else:
            col = (110, 60, 170)
        d.rounded_rectangle((x - 22, gy - 36, x + 22, gy + 36), 8, fill=col)
        d.text((x, gy + 58), str(i), font=font("semibold", 16), fill=WHITE, anchor="mm")
    d.text((gx0, gy + 100), "0  acidic", font=font("medium", 18), fill=HPLUS, anchor="lm")
    d.text(((gx0 + gx1) / 2, gy + 100), "7  neutral", font=font("medium", 18), fill=GREEN, anchor="mm")
    d.text((gx1, gy + 100), "14  alkaline", font=font("medium", 18), fill=PURPLE, anchor="rm")
    d.text((x0 + 40, y1 - 50), "Lower pH  =  higher [H+]", font=font("semibold", 22), fill=GOLD)


def everyday_ph(d, box, t=0.0):
    items = [
        ("Lemon juice", "~ pH 2", HPLUS),
        ("Pure water", "pH 7", GREEN),
        ("Soap solution", "~ pH 9", BLUE),
        ("Oven cleaner", "~ pH 13", PURPLE),
    ]
    x0, y0, x1, y1 = box
    w = (x1 - x0 - 36) // 4
    for i, (title, body, col) in enumerate(items):
        x = x0 + i * (w + 12)
        card(d, (x, y0, x + w, y1), accent=col)
        d.text((x + 24, y0 + 28), title, font=font("bold", 22), fill=WHITE)
        d.text((x + 24, y0 + 80), body, font=font("semibold", 20), fill=GOLD)


def _particles(d, box, charged, molecules, title):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 20, y0 + 14), title, font=font("bold", 20), fill=WHITE)
    for i in range(charged):
        ion(d, (x0 + 50 + (i % 4) * 48, y0 + 80 + (i // 4) * 50), "H+", HPLUS, 14)
    for i in range(molecules):
        x = x0 + 50 + (i % 4) * 48
        y = y0 + 80 + ((charged + 3) // 4) * 50 + (i // 4) * 44
        d.rounded_rectangle((x - 22, y - 14, x + 22, y + 14), 8, fill=(80, 100, 140), outline=WHITE)
        d.text((x, y), "HA", font=font("bold", 13), fill=WHITE, anchor="mm")


def strong_acid(d, box, t=0.0):
    _particles(d, box, 8, 0, "Strong acid — fully ionised")


def weak_acid(d, box, t=0.0):
    _particles(d, box, 2, 6, "Weak acid — mostly HA molecules")


def strong_weak_compare(d, box, t=0.0):
    x0, y0, x1, y1 = box
    mid = (x0 + x1) // 2
    strong_acid(d, (x0, y0, mid - 12, y1), t)
    weak_acid(d, (mid + 12, y0, x1, y1), t)


def reactivity(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Will it displace hydrogen?", font=font("bold", 22), fill=WHITE)
    yes = ["K", "Na", "Ca", "Mg", "Al", "Zn", "Fe"]
    no = ["Cu", "Ag", "Au"]
    d.text((x0 + 40, y0 + 80), "Reacts with dilute acid", font=font("semibold", 20), fill=GREEN)
    for i, m in enumerate(yes):
        d.rounded_rectangle((x0 + 40 + i * 92, y0 + 120, x0 + 120 + i * 92, y0 + 190), 12, fill=(30, 90, 80), outline=GREEN)
        d.text((x0 + 80 + i * 92, y0 + 155), m, font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 40, y0 + 230), "No reaction with dilute HCl or H2SO4", font=font("semibold", 20), fill=HPLUS)
    for i, m in enumerate(no):
        d.rounded_rectangle((x0 + 40 + i * 110, y0 + 270, x0 + 130 + i * 110, y0 + 340), 12, fill=(90, 40, 50), outline=RED)
        d.text((x0 + 85 + i * 110, y0 + 305), m, font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 40, y1 - 50), "Hydrogen sits between iron and copper in the reactivity series.", font=font("regular", 18), fill=MUTED)


def h2_test(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Lighted splint — squeaky pop", font=font("bold", 22), fill=WHITE)
    beaker(d, x0 + 80, y0 + 120, 160, 200, 0.4, (90, 170, 200), label="acid + metal")
    # tube
    d.rectangle((x0 + 300, y0 + 90, x0 + 430, y0 + 320), outline=(200, 220, 235), width=4)
    d.text((x0 + 365, y0 + 200), "H2", font=font("bold", 28), fill=GOLD, anchor="mm")
    d.line((x0 + 450, y0 + 140, x0 + 560, y0 + 90), fill=ORANGE, width=6)
    d.ellipse((x0 + 548, y0 + 70, x0 + 590, y0 + 110), fill=ORANGE)
    d.text((x0 + 620, y0 + 160), "lighted splint", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 620, y0 + 210), "POP", font=font("bold", 40), fill=GOLD)
    d.text((x0 + 80, y1 - 48), "Oxygen uses a glowing splint. Do not mix the tests.", font=font("regular", 18), fill=MUTED)


def redox(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) // 2 - 10, y1), accent=HPLUS)
    d.text((x0 + 28, y0 + 24), "Oxidation — loss", font=font("bold", 26), fill=HPLUS)
    d.text((x0 + 28, y0 + 90), chem("Mg → Mg2+ + 2e-"), font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 28, y0 + 150), "The metal is oxidised.", font=font("regular", 20), fill=MUTED)
    card(d, ((x0 + x1) // 2 + 10, y0, x1, y1), accent=GREEN)
    mid = (x0 + x1) // 2 + 10
    d.text((mid + 28, y0 + 24), "Reduction — gain", font=font("bold", 26), fill=GREEN)
    d.text((mid + 28, y0 + 90), chem("2H+ + 2e- → H2"), font=font("semibold", 24), fill=WHITE)
    d.text((mid + 28, y0 + 150), "Hydrogen ions are reduced.", font=font("regular", 20), fill=MUTED)


def cuo(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Black copper oxide in sulfuric acid", font=font("bold", 22), fill=WHITE)
    beaker(d, x0 + 120, y0 + 110, 180, 220, 0.55, (40, 80, 140), solids=6, label="before")
    beaker(d, x0 + 520, y0 + 110, 180, 220, 0.7, (40, 110, 210), label="blue CuSO4(aq)")
    d.text((x0 + 400, y0 + 200), "→", font=font("bold", 48), fill=GOLD, anchor="mm")
    d.text((x0 + 80, y1 - 48), chem("CuO + H2SO4 → CuSO4 + H2O"), font=font("semibold", 22), fill=GOLD)


def gas_tests(d, box, t=0.0):
    items = [
        ("Hydrogen", "Lighted splint", "Squeaky pop", HPLUS),
        ("Oxygen", "Glowing splint", "Splint relights", GREEN),
        ("Carbon dioxide", "Limewater", "Turns milky", GOLD),
    ]
    x0, y0, x1, y1 = box
    w = (x1 - x0 - 24) // 3
    for i, (gas, test, result, col) in enumerate(items):
        x = x0 + i * (w + 12)
        card(d, (x, y0, x + w, y1), accent=col)
        d.text((x + 24, y0 + 24), gas, font=font("bold", 26), fill=WHITE)
        d.text((x + 24, y0 + 90), test, font=font("semibold", 22), fill=GOLD)
        d.text((x + 24, y0 + 140), result, font=font("regular", 20), fill=MUTED)


def solubility(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    rows = [
        ("Always soluble", "Sodium, potassium, ammonium salts; all nitrates"),
        ("Mostly soluble", "Chlorides except AgCl, PbCl2. Sulfates except BaSO4, PbSO4, CaSO4"),
        ("Mostly insoluble", "Carbonates and hydroxides, except Na+, K+, NH4+"),
    ]
    for i, (title, body) in enumerate(rows):
        y = y0 + 40 + i * 120
        d.text((x0 + 32, y), title, font=font("bold", 24), fill=GOLD)
        text_block(d, (x0 + 32, y + 40), body, font("regular", 20), INK, x1 - x0 - 80)


def crystallise(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 12), "Soluble salt from an insoluble base", font=font("bold", 22), fill=WHITE)
    funnel_filter(d, x0 + 80, y0 + 90)
    evaporating_basin(d, x0 + 360, y0 + 180, crystals=True, label="crystallise")
    d.text((x0 + 700, y0 + 140), "1  Excess solid", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 700, y0 + 190), "2  Filter off leftover base", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 700, y0 + 240), "3  Evaporate, then cool", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 700, y0 + 290), "4  Filter, wash, dry crystals", font=font("semibold", 22), fill=WHITE)


def precipitate(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Precipitation of an insoluble salt", font=font("bold", 22), fill=WHITE)
    beaker(d, x0 + 80, y0 + 100, 150, 180, 0.7, (80, 160, 200), label="BaCl2(aq)")
    beaker(d, x0 + 300, y0 + 100, 150, 180, 0.7, (80, 160, 200), label="Na2SO4(aq)")
    beaker(d, x0 + 560, y0 + 90, 180, 200, 0.65, (200, 210, 220), solids=9, label="BaSO4 precipitate")
    d.text((x0 + 80, y1 - 48), "Then filter, wash with distilled water, and dry.", font=font("regular", 20), fill=MUTED)


def titration(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box)
    # burette
    d.rectangle((x0 + 160, y0 + 50, x0 + 190, y0 + 280), outline=(200, 220, 235), width=3)
    d.polygon([(x0 + 160, y0 + 280), (x0 + 190, y0 + 280), (x0 + 175, y0 + 310)], outline=(200, 220, 235), width=3)
    d.text((x0 + 175, y0 + 40), "burette", font=font("medium", 16), fill=MUTED, anchor="mm")
    # flask
    d.polygon([(x0 + 110, y0 + 340), (x0 + 240, y0 + 340), (x0 + 210, y0 + 470), (x0 + 140, y0 + 470)], outline=(200, 220, 235), width=3)
    d.polygon([(x0 + 140, y0 + 400), (x0 + 210, y0 + 400), (x0 + 200, y0 + 460), (x0 + 150, y0 + 460)], fill=(180, 80, 140))
    d.text((x0 + 175, y0 + 500), "conical flask + indicator", font=font("medium", 16), fill=MUTED, anchor="mm")
    d.rounded_rectangle((x0 + 90, y0 + 470, x0 + 260, y0 + 484), 4, fill=(230, 230, 230))
    d.text((x0 + 175, y0 + 530), "white tile", font=font("medium", 16), fill=MUTED, anchor="mm")
    # pipette
    d.line((x0 + 360, y0 + 80, x0 + 360, y0 + 260), fill=(200, 220, 235), width=5)
    d.ellipse((x0 + 348, y0 + 250, x0 + 372, y0 + 320), outline=(200, 220, 235), width=3)
    d.text((x0 + 400, y0 + 160), "pipette  25.0 cm³", font=font("semibold", 20), fill=WHITE)
    d.text((x0 + 400, y0 + 220), "Read burette to 0.05 cm³", font=font("regular", 20), fill=MUTED)
    d.text((x0 + 400, y0 + 270), "Concordant titres within 0.10 cm³", font=font("regular", 20), fill=GOLD)


def electrode(d, x, y0, y1, label, sign, fill):
    d.rectangle((x - 14, y0, x + 14, y1), fill=(180, 190, 200), outline=WHITE)
    d.text((x, y0 - 22), sign, font=font("bold", 26), fill=fill, anchor="mm")
    d.text((x, y1 + 22), label, font=font("medium", 16), fill=MUTED, anchor="mm")


def cell_base(d, box, title, electrolyte_label, t=0.0, ions=None, anode="+", cathode="−"):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 14), title, font=font("bold", 22), fill=WHITE)
    tank = (x0 + 160, y0 + 90, x1 - 160, y1 - 80)
    d.rounded_rectangle(tank, 16, fill=(20, 70, 90), outline=TEAL_BAR, width=3)
    d.text(((tank[0] + tank[2]) / 2, tank[3] + 28), electrolyte_label, font=font("medium", 18), fill=MUTED, anchor="mm")
    electrode(d, tank[0] + 90, tank[1] + 20, tank[3] - 20, "cathode", cathode, TEAL_BAR)
    electrode(d, tank[2] - 90, tank[1] + 20, tank[3] - 20, "anode", anode, GOLD)
    ions = ions or []
    for i, (lab, col, side) in enumerate(ions):
        drift = 8 * math.sin(t * 2 + i)
        x = tank[0] + 160 + i * 70 + (20 if side == "c" else 160) + drift
        y = tank[1] + 80 + (i % 3) * 50
        ion(d, (x, y), lab, col, 15)
    return tank


def cell(d, box, t=0.0):
    cell_base(d, box, "Electrolytic cell", "ionic electrolyte — ions free to move", t, [("+", HPLUS, "c"), ("+", HPLUS, "c"), ("−", OHMINUS, "a"), ("−", OHMINUS, "a")])
    x0, y0, _, _ = box
    d.text((x0 + 40, y0 + 70), "Cations → cathode", font=font("semibold", 18), fill=TEAL_BAR)
    d.text((x0 + 40, y0 + 100), "Anions → anode", font=font("semibold", 18), fill=GOLD)


def solid_vs_molten(d, box, t=0.0):
    x0, y0, x1, y1 = box
    mid = (x0 + x1) // 2
    card(d, (x0, y0, mid - 10, y1), accent=HPLUS)
    d.text((x0 + 24, y0 + 20), "Solid ionic compound", font=font("bold", 22), fill=WHITE)
    d.text((x0 + 24, y0 + 80), "Ions locked in a lattice.", font=font("regular", 20), fill=MUTED)
    d.text((x0 + 24, y0 + 120), "Cannot move. Does not conduct.", font=font("regular", 20), fill=MUTED)
    card(d, (mid + 10, y0, x1, y1), accent=GREEN)
    d.text((mid + 34, y0 + 20), "Molten or dissolved", font=font("bold", 22), fill=WHITE)
    d.text((mid + 34, y0 + 80), "Ions are free to move.", font=font("regular", 20), fill=MUTED)
    d.text((mid + 34, y0 + 120), "This is the electrolyte.", font=font("regular", 20), fill=MUTED)


def lead_bromide(d, box, t=0.0):
    tank = cell_base(d, box, "Molten lead bromide", chem("PbBr2(l)"), t, [("Pb2+", GOLD, "c"), ("Br-", PINK, "a"), ("Pb2+", GOLD, "c"), ("Br-", PINK, "a")])
    d.text((tank[0] + 90, tank[1] + 40), "Pb metal", font=font("semibold", 16), fill=WHITE, anchor="mm")
    d.text((tank[2] - 90, tank[1] + 40), "Br2(g)", font=font("semibold", 16), fill=PINK, anchor="mm")


def aq_rules(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) // 2 - 8, y1), accent=TEAL)
    d.text((x0 + 24, y0 + 20), "Cathode (−)", font=font("bold", 24), fill=TEAL_BAR)
    d.text((x0 + 24, y0 + 80), "H2 unless the metal is", font=font("regular", 20), fill=INK)
    d.text((x0 + 24, y0 + 116), "less reactive than hydrogen.", font=font("regular", 20), fill=INK)
    d.text((x0 + 24, y0 + 170), "Na+, K+, Ca2+, Mg2+ → H2", font=font("semibold", 18), fill=GOLD)
    d.text((x0 + 24, y0 + 210), "Cu2+, Ag+ → metal", font=font("semibold", 18), fill=GOLD)
    mid = (x0 + x1) // 2 + 8
    card(d, (mid, y0, x1, y1), accent=GOLD)
    d.text((mid + 24, y0 + 20), "Anode (+)", font=font("bold", 24), fill=GOLD)
    d.text((mid + 24, y0 + 80), "Halogen from a concentrated", font=font("regular", 20), fill=INK)
    d.text((mid + 24, y0 + 116), "halide; otherwise oxygen.", font=font("regular", 20), fill=INK)
    d.text((mid + 24, y0 + 170), "Conc. Cl- → Cl2", font=font("semibold", 18), fill=GOLD)
    d.text((mid + 24, y0 + 210), "SO42- solution → O2", font=font("semibold", 18), fill=GOLD)


def brine(d, box, t=0.0):
    tank = cell_base(d, box, "Concentrated sodium chloride (brine)", "Na+(aq)  Cl-(aq)  H+(aq)  OH-(aq)", t)
    d.text((tank[0] + 90, tank[1] + 36), "H2", font=font("bold", 18), fill=WHITE, anchor="mm")
    d.text((tank[2] - 90, tank[1] + 36), "Cl2", font=font("bold", 18), fill=GOLD, anchor="mm")
    d.text(((tank[0] + tank[2]) / 2, tank[3] - 30), "NaOH left in solution", font=font("semibold", 18), fill=GREEN, anchor="mm")


def cuso4_inert(d, box, t=0.0):
    tank = cell_base(d, box, "Copper sulfate with graphite electrodes", chem("CuSO4(aq)  —  inert electrodes"), t, [("Cu2+", BLUE, "c")])
    d.text((tank[0] + 90, tank[1] + 36), "Cu metal", font=font("semibold", 16), fill=WHITE, anchor="mm")
    d.text((tank[2] - 90, tank[1] + 36), "O2", font=font("semibold", 16), fill=GOLD, anchor="mm")
    d.text(((tank[0] + tank[2]) / 2, tank[3] - 30), "Blue colour fades as Cu2+ is removed", font=font("regular", 18), fill=MUTED, anchor="mm")


def copper_cell(d, box, t=0.0):
    x0, y0, x1, y1 = box
    tank = cell_base(d, box, "Purifying copper", chem("CuSO4(aq)"), t, [("Cu2+", BLUE, "c")])
    d.text((tank[0] + 90, tank[1] - 8), "pure Cu cathode", font=font("medium", 14), fill=TEAL_BAR, anchor="mm")
    d.text((tank[2] - 90, tank[1] - 8), "impure Cu anode", font=font("medium", 14), fill=GOLD, anchor="mm")
    d.ellipse((tank[0] + 40, tank[3] - 36, tank[2] - 40, tank[3] - 8), fill=(90, 80, 50))
    d.text(((tank[0] + tank[2]) / 2, tank[3] - 22), "anode sludge", font=font("medium", 14), fill=WHITE, anchor="mm")
    d.text((x0 + 40, y1 - 36), "Blue colour stays — Cu2+ replaced as fast as it is plated.", font=font("regular", 18), fill=MUTED)


def topic_map(d, box, t=0.0):
    items = [
        ("Acids", "H+ in water"),
        ("Salts", "Excess / ppt / titration"),
        ("Gases", "Pop, relight, milky"),
        ("Electrolysis", "Molten / aqueous / Cu"),
    ]
    x0, y0, x1, y1 = box
    w = (x1 - x0 - 36) // 4
    for i, (title, body) in enumerate(items):
        x = x0 + i * (w + 12)
        card(d, (x, y0, x + w, y1), accent=TEAL)
        d.text((x + 20, y0 + 28), title, font=font("bold", 24), fill=WHITE)
        d.text((x + 20, y0 + 90), body, font=font("regular", 20), fill=MUTED)


DIAGRAMS = {
    "acid_ions": acid_ions,
    "acid_alkali": acid_alkali,
    "indicators": indicators,
    "ph_scale": ph_scale,
    "everyday_ph": everyday_ph,
    "strong_acid": strong_acid,
    "weak_acid": weak_acid,
    "strong_weak_compare": strong_weak_compare,
    "reactivity": reactivity,
    "h2_test": h2_test,
    "redox": redox,
    "cuo": cuo,
    "gas_tests": gas_tests,
    "solubility": solubility,
    "crystallise": crystallise,
    "precipitate": precipitate,
    "titration": titration,
    "cell": cell,
    "solid_vs_molten": solid_vs_molten,
    "lead_bromide": lead_bromide,
    "aq_rules": aq_rules,
    "brine": brine,
    "cuso4_inert": cuso4_inert,
    "copper_cell": copper_cell,
    "topic_map": topic_map,
}
