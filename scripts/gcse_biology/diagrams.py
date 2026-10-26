"""Original GCSE Biology diagrams for JD Science videos."""

from __future__ import annotations

import math

from PIL import ImageDraw

from gcse_foundations.diagrams import card, text_block
from jdscience_video.theme import GOLD, GREEN, LINE, MUTED, TEAL, TEAL_BAR, WHITE, font

PINK = (232, 120, 168)
ORANGE = (232, 150, 72)
PURPLE = (164, 120, 214)
CELL = (94, 214, 165)
DNA = (69, 208, 216)
LEAF = (70, 168, 110)


def _mid(box):
    return (box[0] + box[2]) / 2, (box[1] + box[3]) / 2


def _label(d, xy, text, fill=WHITE):
    d.text(xy, text, font=font("semibold", 18), fill=fill, anchor="mm")


def mitosis(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    cx, cy = _mid(box)
    phase = (t % 6.0) / 6.0
    # parent then two daughters
    d.ellipse((cx - 260, cy - 140, cx - 40, cy + 140), outline=CELL, width=4)
    d.text((cx - 150, cy - 170), "Parent  46", font=font("bold", 22), fill=GOLD, anchor="mm")
    for i, col in enumerate((DNA, PINK)):
        d.rectangle((cx - 200 + i * 40, cy - 50, cx - 180 + i * 40, cy + 50), fill=col)
    d.polygon([(cx - 20, cy), (cx + 40, cy - 18), (cx + 40, cy + 18)], fill=TEAL_BAR)
    for dx, title in ((90, "Daughter 46"), (320, "Daughter 46")):
        d.ellipse((cx + dx, cy - 110, cx + dx + 180, cy + 110), outline=CELL, width=4)
        d.text((cx + dx + 90, cy - 140), title, font=font("bold", 20), fill=GOLD, anchor="mm")
        for i, col in enumerate((DNA, PINK)):
            d.rectangle((cx + dx + 50 + i * 40, cy - 40, cx + dx + 68 + i * 40, cy + 40), fill=col)
    d.text((cx, y1 - 36), "DNA copied  →  chromosomes separated  →  clones", font=font("regular", 20), fill=MUTED, anchor="mm")


def stem_cells(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    items = [
        (x0 + 80, "Embryo", "Can become many cell types"),
        (x0 + 430, "Bone marrow", "Adult stem cells, more limited"),
        (x0 + 780, "Meristems", "Plant growing regions"),
    ]
    for x, title, body in items:
        d.ellipse((x, y0 + 80, x + 220, y0 + 300), outline=CELL, width=4, fill=(18, 48, 72))
        d.text((x + 110, y0 + 190), title, font=font("bold", 22), fill=WHITE, anchor="mm")
        d.text((x + 110, y0 + 340), body, font=font("regular", 18), fill=MUTED, anchor="mm")
    d.text(((x0 + x1) / 2, y1 - 40), "Not yet specialised", font=font("semibold", 22), fill=GOLD, anchor="mm")


def cell_cycle(d, box, t=0.0):
    card(d, box, accent=GOLD)
    cx, cy = _mid(box)
    r = 210
    d.ellipse((cx - r, cy - r + 10, cx + r, cy + r + 10), outline=TEAL, width=8)
    steps = [("Interphase", "DNA replicated", -90), ("Mitosis", "Chromosomes separated", 30), ("Cytokinesis", "Cytoplasm divides", 150)]
    for title, body, ang in steps:
        a = math.radians(ang)
        x, y = cx + r * math.cos(a), cy + 10 + r * math.sin(a)
        d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=GOLD)
        d.text((cx + (r + 90) * math.cos(a), cy + 10 + (r + 70) * math.sin(a)), title, font=font("bold", 22), fill=WHITE, anchor="mm")
        d.text((cx + (r + 90) * math.cos(a), cy + 42 + (r + 70) * math.sin(a)), body, font=font("regular", 18), fill=MUTED, anchor="mm")
    d.text((cx, cy + 10), "46 → 46", font=font("bold", 28), fill=GOLD, anchor="mm")


def binary_fission(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    cy = (y0 + y1) / 2
    d.ellipse((x0 + 80, cy - 70, x0 + 280, cy + 70), outline=ORANGE, width=4)
    d.ellipse((x0 + 150, cy - 24, x0 + 210, cy + 24), outline=DNA, width=3)
    d.text((x0 + 180, y0 + 50), "One cell", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.polygon([(x0 + 330, cy), (x0 + 390, cy - 16), (x0 + 390, cy + 16)], fill=TEAL_BAR)
    d.ellipse((x0 + 430, cy - 70, x0 + 630, cy + 70), outline=ORANGE, width=4)
    d.line((x0 + 530, cy - 60, x0 + 530, cy + 60), fill=GOLD, width=3)
    d.text((x0 + 530, y0 + 50), "DNA copied", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.polygon([(x0 + 680, cy), (x0 + 740, cy - 16), (x0 + 740, cy + 16)], fill=TEAL_BAR)
    d.ellipse((x0 + 780, cy - 90, x0 + 980, cy - 10), outline=ORANGE, width=4)
    d.ellipse((x0 + 780, cy + 10, x0 + 980, cy + 90), outline=ORANGE, width=4)
    d.text((x0 + 880, y0 + 50), "Two cells", font=font("bold", 22), fill=WHITE, anchor="mm")


def doubling(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    vals = [("0 min", "1"), ("20 min", "2"), ("40 min", "4"), ("60 min", "8"), ("2 hours", "64")]
    w = (x1 - x0 - 80) / len(vals)
    for i, (lab, n) in enumerate(vals):
        x = x0 + 40 + i * w
        h = 40 + i * 55
        d.rounded_rectangle((x, y1 - 80 - h, x + w - 24, y1 - 80), 12, fill=TEAL)
        d.text((x + (w - 24) / 2, y1 - 80 - h / 2), n, font=font("bold", 28), fill=WHITE, anchor="mm")
        d.text((x + (w - 24) / 2, y1 - 50), lab, font=font("semibold", 18), fill=MUTED, anchor="mm")


def petri(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    cx = x0 + 280
    cy = (y0 + y1) / 2
    d.ellipse((cx - 160, cy - 160, cx + 160, cy + 160), outline=WHITE, width=6)
    d.ellipse((cx - 130, cy - 130, cx + 130, cy + 130), fill=(40, 90, 60))
    d.text((cx, cy), "agar", font=font("bold", 22), fill=WHITE, anchor="mm")
    points = [
        "Sterilise loop and dish",
        "Tape the lid loosely — air in, microbes out",
        "Store upside down — no condensation drip",
        "School labs: not 37 °C",
    ]
    for i, text in enumerate(points):
        d.text((x0 + 520, y0 + 90 + i * 90), f"{i + 1}.  {text}", font=font("semibold", 24), fill=WHITE)


def diffusion(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 200, y0 + 40), "High concentration", font=font("bold", 20), fill=GOLD, anchor="mm")
    d.text((x1 - 220, y0 + 40), "Low concentration", font=font("bold", 20), fill=GOLD, anchor="mm")
    for i in range(18):
        px = x0 + 80 + (i % 6) * 40
        py = y0 + 90 + (i // 6) * 50
        d.ellipse((px, py, px + 18, py + 18), fill=TEAL_BAR)
    for i in range(5):
        px = x1 - 280 + (i % 3) * 40
        py = y0 + 120 + (i // 3) * 50
        d.ellipse((px, py, px + 18, py + 18), fill=TEAL_BAR)
    d.polygon([(x0 + 420, (y0 + y1) / 2), (x0 + 520, (y0 + y1) / 2 - 20), (x0 + 520, (y0 + y1) / 2 + 20)], fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 40), "Down the concentration gradient  ·  passive", font=font("regular", 20), fill=MUTED, anchor="mm")


def alveoli(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 80, y0 + 70, x0 + 520, y1 - 70), outline=PINK, width=5)
    d.text((x0 + 300, y0 + 50), "Alveolus", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 300, (y0 + y1) / 2), "O₂ in   ·   CO₂ out", font=font("semibold", 22), fill=GOLD, anchor="mm")
    for i, text in enumerate(["Large surface area", "Thin lining", "Good blood supply", "Ventilation"]):
        d.rounded_rectangle((x0 + 580, y0 + 80 + i * 110, x1 - 60, y0 + 170 + i * 110), 14, fill=(18, 48, 72), outline=LINE, width=2)
        d.text((x0 + 620, y0 + 125 + i * 110), text, font=font("semibold", 24), fill=WHITE, anchor="lm")


def osmosis(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.rectangle((x0 + 80, y0 + 80, x0 + 480, y1 - 80), outline=TEAL, width=3)
    d.rectangle((x0 + 520, y0 + 80, x0 + 920, y1 - 80), outline=TEAL, width=3)
    d.line((x0 + 500, y0 + 70, x0 + 500, y1 - 70), fill=GOLD, width=6)
    d.text((x0 + 500, y0 + 50), "partially permeable membrane", font=font("semibold", 18), fill=GOLD, anchor="mm")
    d.text((x0 + 280, y0 + 110), "More water", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 720, y0 + 110), "Less water", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.polygon([(x0 + 430, (y0 + y1) / 2), (x0 + 560, (y0 + y1) / 2 - 16), (x0 + 560, (y0 + y1) / 2 + 16)], fill=TEAL_BAR)
    d.text((x0 + 500, y1 - 40), "Water moves by osmosis  ·  passive", font=font("regular", 20), fill=MUTED, anchor="mm")


def active_transport(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.text((x0 + 260, y0 + 50), "Soil  ·  low ions", font=font("bold", 22), fill=MUTED, anchor="mm")
    d.text((x1 - 280, y0 + 50), "Root cell  ·  high ions", font=font("bold", 22), fill=MUTED, anchor="mm")
    d.rounded_rectangle((x0 + 420, y0 + 140, x0 + 700, y1 - 140), 40, fill=PURPLE)
    d.text((x0 + 560, (y0 + y1) / 2 - 20), "carrier", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 560, (y0 + y1) / 2 + 20), "protein", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.polygon([(x0 + 280, (y0 + y1) / 2), (x0 + 380, (y0 + y1) / 2 - 20), (x0 + 380, (y0 + y1) / 2 + 20)], fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 50), "Against the gradient  ·  energy from respiration (ATP)", font=font("semibold", 22), fill=GOLD, anchor="mm")


def transport_compare(d, box, t=0.0):
    x0, y0, x1, y1 = box
    cols = [
        ("Diffusion", "Oxygen into cells", "Passive"),
        ("Osmosis", "Water across a membrane", "Passive"),
        ("Active transport", "Mineral ions into roots", "Needs energy"),
    ]
    w = (x1 - x0 - 40) / 3
    for i, (title, body, tag) in enumerate(cols):
        x = x0 + i * (w + 20)
        card(d, (x, y0, x + w, y1), accent=TEAL if i < 2 else GOLD)
        d.text((x + 28, y0 + 30), title, font=font("bold", 26), fill=WHITE)
        text_block(d, (x + 28, y0 + 90), body, font("regular", 22), MUTED, w - 56)
        d.text((x + 28, y1 - 70), tag, font=font("semibold", 22), fill=GOLD)


def hierarchy(d, box, t=0.0):
    labels = ["Cell", "Tissue", "Organ", "Organ system", "Organism"]
    x0, y0, x1, y1 = box
    n = len(labels)
    for i, lab in enumerate(labels):
        pad = i * 50
        y = y0 + 20 + i * 95
        d.rounded_rectangle((x0 + 80 + pad, y, x1 - 80 - pad, y + 80), 16, fill=TEAL if i % 2 == 0 else (18, 48, 72), outline=LINE, width=2)
        d.text(((x0 + x1) / 2, y + 40), lab, font=font("bold", 28), fill=WHITE, anchor="mm")


def heart_org(d, box, t=0.0):
    card(d, box, accent=PINK)
    x0, y0, x1, y1 = box
    rows = [
        "Cardiac muscle cells contract together → heart muscle tissue",
        "Heart muscle + valves + connective tissue + vessels → heart (organ)",
        "Heart + blood vessels → circulatory system",
    ]
    for i, text in enumerate(rows):
        d.text((x0 + 50, y0 + 80 + i * 140), f"{i + 1}.", font=font("bold", 28), fill=GOLD)
        text_block(d, (x0 + 110, y0 + 80 + i * 140), text, font("semibold", 26), WHITE, x1 - x0 - 180)


def enzymes(d, box, t=0.0):
    x0, y0, x1, y1 = box
    rows = [
        ("Amylase", "Starch → maltose and other smaller sugars"),
        ("Protease", "Proteins → peptides → amino acids"),
        ("Lipase", "Lipids → fatty acids + glycerol"),
    ]
    for i, (title, body) in enumerate(rows):
        y = y0 + i * 160
        card(d, (x0, y, x1, y + 140), accent=TEAL)
        d.text((x0 + 40, y + 30), title, font=font("bold", 28), fill=GOLD)
        d.text((x0 + 40, y + 80), body, font=font("semibold", 24), fill=WHITE)


def bile(d, box, t=0.0):
    card(d, box, accent=ORANGE)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 40), "Bile is not an enzyme", font=font("bold", 32), fill=GOLD)
    text_block(d, (x0 + 50, y0 + 110), "Made in the liver and stored in the gall bladder. It neutralises acidic chyme entering the small intestine and emulsifies fat, increasing the surface area available to lipase.", font("regular", 26), WHITE, x1 - x0 - 100)


def active_site(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 80, y0 + 80, x0 + 420, y1 - 80), outline=TEAL_BAR, width=6)
    d.polygon([(x0 + 220, (y0 + y1) / 2 - 30), (x0 + 300, (y0 + y1) / 2), (x0 + 220, (y0 + y1) / 2 + 30)], fill=GOLD)
    d.text((x0 + 250, y0 + 50), "Active site", font=font("bold", 22), fill=GOLD, anchor="mm")
    d.text((x0 + 560, y0 + 140), "High temperature or the wrong pH", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 560, y0 + 200), "can change the shape.", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 560, y0 + 280), "The substrate no longer fits.", font=font("regular", 22), fill=MUTED)


def vessels(d, box, t=0.0):
    x0, y0, x1, y1 = box
    rows = [
        ("Arteries", "High-pressure blood away from the heart", TEAL),
        ("Veins", "Low-pressure blood back to the heart", GOLD),
        ("Capillaries", "One cell thick so substances can pass through", PINK),
    ]
    for i, (title, body, col) in enumerate(rows):
        y = y0 + i * 160
        card(d, (x0, y, x1, y + 140), accent=col)
        d.text((x0 + 40, y + 30), title, font=font("bold", 28), fill=WHITE)
        d.text((x0 + 40, y + 80), body, font=font("regular", 24), fill=MUTED)


def leaf(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    layers = [
        ("Epidermis", "Covers the leaf"),
        ("Palisade mesophyll", "Packed with chloroplasts"),
        ("Spongy mesophyll", "Air spaces for gas exchange"),
        ("Vein", "Xylem and phloem"),
    ]
    for i, (title, body) in enumerate(layers):
        y = y0 + 40 + i * 110
        d.rectangle((x0 + 60, y, x0 + 520, y + 90), fill=(30 + i * 20, 80 + i * 12, 50), outline=LINE, width=2)
        d.text((x0 + 80, y + 28), title, font=font("bold", 22), fill=WHITE)
        d.text((x0 + 580, y + 28), body, font=font("regular", 22), fill=MUTED)


def stomata(d, box, t=0.0):
    card(d, box, accent=LEAF)
    cx, cy = _mid(box)
    d.ellipse((cx - 220, cy - 90, cx - 40, cy + 90), fill=CELL, outline=WHITE, width=3)
    d.ellipse((cx + 40, cy - 90, cx + 220, cy + 90), fill=CELL, outline=WHITE, width=3)
    d.ellipse((cx - 30, cy - 70, cx + 30, cy + 70), fill=(10, 23, 49))
    d.text((cx, cy - 140), "Guard cells open or close the stoma", font=font("bold", 24), fill=WHITE, anchor="mm")
    d.text((cx, cy + 140), "Controls gas exchange and water loss", font=font("regular", 22), fill=MUTED, anchor="mm")


def transpiration(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 40), "Water evaporates from mesophyll surfaces", font=font("bold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 100), "and diffuses out through stomata.", font=font("bold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 180), "This creates tension that draws a continuous", font=font("regular", 22), fill=MUTED)
    d.text((x0 + 50, y0 + 230), "column of water up the xylem.", font=font("regular", 22), fill=MUTED)
    d.text((x0 + 50, y0 + 320), "Faster in warm, dry, windy, bright conditions.", font=font("semibold", 22), fill=GOLD)


def xylem_phloem(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=TEAL)
    d.text((x0 + 40, y0 + 40), "Xylem", font=font("bold", 32), fill=TEAL_BAR)
    text_block(d, (x0 + 40, y0 + 110), "Water and mineral ions upwards only.", font("regular", 24), WHITE, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=GOLD)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Phloem", font=font("bold", 32), fill=GOLD)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Dissolved sugars from sources to sinks — up and down.", font("regular", 24), WHITE, (x1 - x0) / 2 - 90)


def pathogens(d, box, t=0.0):
    x0, y0, x1, y1 = box
    items = [("Bacteria", "Toxins"), ("Viruses", "Reproduce inside cells"), ("Fungi", "Spores"), ("Protists", "Often vector-borne")]
    w = (x1 - x0 - 60) / 4
    for i, (title, body) in enumerate(items):
        x = x0 + i * (w + 20)
        card(d, (x, y0, x + w, y1), accent=TEAL)
        d.text((x + 24, y0 + 40), title, font=font("bold", 24), fill=WHITE)
        text_block(d, (x + 24, y0 + 100), body, font("regular", 20), MUTED, w - 48)


def defences(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 40, y0 + 40), "Non-specific barriers", font=font("bold", 24), fill=GOLD)
    d.text((x0 + 40, y0 + 90), "Skin  ·  mucus and hairs  ·  stomach acid", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 40, y0 + 180), "White blood cells", font=font("bold", 24), fill=GOLD)
    d.text((x0 + 40, y0 + 230), "Engulf microbes  ·  antibodies  ·  antitoxins", font=font("semibold", 22), fill=WHITE)


def vaccine(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    text_block(d, (x0 + 40, y0 + 50), "Some vaccines contain dead or inactive pathogens. Others contain purified antigens, inactivated toxins, or genetic instructions that allow the body to make an antigen.", font("regular", 24), WHITE, x1 - x0 - 80)
    text_block(d, (x0 + 40, y0 + 260), "Memory cells help the body respond more quickly on later exposure.", font("semibold", 24), GOLD, x1 - x0 - 80)


def trials(d, box, t=0.0):
    x0, y0, x1, y1 = box
    steps = [("1  Discovery", "Plants, moulds, chemists"), ("2  Preclinical", "Cells, tissues, models, animals"), ("3  Clinical", "People: safety, dose, effect")]
    w = (x1 - x0 - 40) / 3
    for i, (title, body) in enumerate(steps):
        x = x0 + i * (w + 20)
        card(d, (x, y0, x + w, y1), accent=TEAL)
        d.text((x + 28, y0 + 40), title, font=font("bold", 26), fill=GOLD)
        text_block(d, (x + 28, y0 + 110), body, font("regular", 22), WHITE, w - 56)


def blinding(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=TEAL)
    d.text((x0 + 40, y0 + 40), "Single-blind", font=font("bold", 28), fill=WHITE)
    text_block(d, (x0 + 40, y0 + 110), "Patients do not know which treatment they receive.", font("regular", 24), MUTED, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=GOLD)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Double-blind", font=font("bold", 28), fill=WHITE)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Neither patients nor doctors know which treatment is which.", font("regular", 24), MUTED, (x1 - x0) / 2 - 90)


def hybridoma(d, box, t=0.0):
    card(d, box, accent=PURPLE)
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 80, y0 + 120, x0 + 280, y0 + 320), outline=TEAL, width=4)
    d.text((x0 + 180, y0 + 80), "B lymphocyte", font=font("bold", 20), fill=WHITE, anchor="mm")
    d.text((x0 + 400, (y0 + y1) / 2), "+", font=font("bold", 40), fill=GOLD, anchor="mm")
    d.ellipse((x0 + 480, y0 + 120, x0 + 680, y0 + 320), outline=ORANGE, width=4)
    d.text((x0 + 580, y0 + 80), "Tumour cell", font=font("bold", 20), fill=WHITE, anchor="mm")
    d.polygon([(x0 + 720, (y0 + y1) / 2), (x0 + 790, (y0 + y1) / 2 - 18), (x0 + 790, (y0 + y1) / 2 + 18)], fill=TEAL_BAR)
    d.ellipse((x0 + 820, y0 + 100, x0 + 1100, y0 + 340), outline=GOLD, width=5)
    d.text((x0 + 960, y0 + 60), "Hybridoma", font=font("bold", 22), fill=GOLD, anchor="mm")
    d.text((x0 + 80, y1 - 50), "Specific antibody  +  rapid division  →  identical antibodies", font=font("regular", 20), fill=MUTED)


def plant_signs(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    signs = "Stunted growth  ·  spots  ·  decay  ·  growths  ·  pests  ·  discoloured or misshapen leaves"
    text_block(d, (x0 + 40, y0 + 80), signs, font("semibold", 28), WHITE, x1 - x0 - 80)
    text_block(d, (x0 + 40, y0 + 280), "Infectious disease and mineral deficiency can look similar. Use the pattern of symptoms.", font("regular", 22), MUTED, x1 - x0 - 80)


def minerals(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=GOLD)
    d.text((x0 + 40, y0 + 40), "Nitrate", font=font("bold", 28), fill=GOLD)
    text_block(d, (x0 + 40, y0 + 110), "Needed for amino acids and proteins. Deficiency: poor, stunted growth.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=TEAL)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Magnesium", font=font("bold", 28), fill=TEAL_BAR)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Needed for chlorophyll. Deficiency: chlorosis, often yellow between green veins on older leaves.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)


def photo_eq(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 - 20), "6 CO₂  +  6 H₂O    →    C₆H₁₂O₆  +  6 O₂", font=font("bold", 36), fill=WHITE, anchor="mm")
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 + 50), "light energy and chlorophyll", font=font("semibold", 24), fill=GOLD, anchor="mm")


def glucose_uses(d, box, t=0.0):
    x0, y0, x1, y1 = box
    uses = ["Respiration", "Starch storage", "Cellulose walls", "Amino acids (with nitrates)", "Lipids in seeds"]
    for i, text in enumerate(uses):
        y = y0 + i * 95
        card(d, (x0, y, x1, y + 80), accent=TEAL)
        d.text((x0 + 40, y + 24), text, font=font("semibold", 24), fill=WHITE)


def limiting(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.line((x0 + 80, y1 - 80, x1 - 80, y1 - 80), fill=MUTED, width=3)
    d.line((x0 + 80, y1 - 80, x0 + 80, y0 + 60), fill=MUTED, width=3)
    d.line((x0 + 80, y1 - 200, x0 + 420, y1 - 200), fill=TEAL, width=6)
    d.line((x0 + 420, y1 - 200, x0 + 900, y1 - 80), fill=ORANGE, width=6)
    d.text((x0 + 100, y0 + 40), "Rate", font=font("semibold", 20), fill=MUTED)
    d.text((x1 - 160, y1 - 50), "Light intensity", font=font("semibold", 20), fill=MUTED)
    d.text((x0 + 500, y0 + 80), "A plateau means another factor is limiting", font=font("regular", 22), fill=GOLD)


def inverse_square(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 80, (y0 + y1) / 2 - 30, x0 + 140, (y0 + y1) / 2 + 30), fill=GOLD)
    d.text((x0 + 110, y0 + 50), "lamp", font=font("bold", 20), fill=GOLD, anchor="mm")
    d.text((x0 + 360, (y0 + y1) / 2), "20 cm  ·  intensity 1", font=font("semibold", 24), fill=WHITE, anchor="mm")
    d.text((x0 + 780, (y0 + y1) / 2), "40 cm  ·  intensity 1/4", font=font("semibold", 24), fill=WHITE, anchor="mm")
    d.text(((x0 + x1) / 2, y1 - 50), "Doubling distance cuts intensity to a quarter", font=font("regular", 22), fill=MUTED, anchor="mm")


def aerobic(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 - 20), "glucose + oxygen  →  carbon dioxide + water", font=font("bold", 28), fill=WHITE, anchor="mm")
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 + 40), "Mitochondria  ·  more energy transferred", font=font("semibold", 22), fill=GOLD, anchor="mm")


def anaerobic(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=ORANGE)
    d.text((x0 + 40, y0 + 40), "Animals", font=font("bold", 28), fill=GOLD)
    text_block(d, (x0 + 40, y0 + 110), "Glucose → lactate / lactic acid. Less energy per glucose.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=TEAL)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Yeast and plants", font=font("bold", 28), fill=TEAL_BAR)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Glucose → ethanol + carbon dioxide. Fermentation.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)


def breathe_vs_resp(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=TEAL)
    d.text((x0 + 40, y0 + 40), "Respiration", font=font("bold", 28), fill=WHITE)
    text_block(d, (x0 + 40, y0 + 110), "A chemical process in cells that transfers energy from glucose.", font("regular", 22), MUTED, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=GOLD)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Breathing", font=font("bold", 28), fill=WHITE)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "The physical movement of air into and out of the lungs.", font("regular", 22), MUTED, (x1 - x0) / 2 - 90)


def control_loop(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    labels = ["Receptor", "Coordinator", "Effector"]
    for i, lab in enumerate(labels):
        x = x0 + 80 + i * 420
        d.rounded_rectangle((x, (y0 + y1) / 2 - 70, x + 280, (y0 + y1) / 2 + 70), 18, fill=(18, 48, 72), outline=TEAL, width=3)
        d.text((x + 140, (y0 + y1) / 2), lab, font=font("bold", 26), fill=WHITE, anchor="mm")
        if i < 2:
            d.polygon([(x + 300, (y0 + y1) / 2), (x + 380, (y0 + y1) / 2 - 16), (x + 380, (y0 + y1) / 2 + 16)], fill=GOLD)


def glucose_fb(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 50), "Blood glucose rises  →  insulin from beta cells  →  uptake and storage", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Blood glucose falls  →  glucagon from alpha cells  →  liver releases glucose", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 260), "Negative feedback opposes the change from the normal range.", font=font("regular", 22), fill=GOLD)


def conscious(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Stimulus → receptor → sensory neurone → brain → motor neurone → effector", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 180), "The brain decides on the response.", font=font("regular", 22), fill=MUTED)


def reflex(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    steps = ["Receptor", "Sensory neurone", "Relay neurone\n(spinal cord)", "Motor neurone", "Effector"]
    w = (x1 - x0 - 80) / 5
    for i, lab in enumerate(steps):
        x = x0 + 20 + i * w
        d.rounded_rectangle((x, y0 + 80, x + w - 20, y1 - 80), 16, fill=(18, 48, 72), outline=TEAL, width=2)
        d.text((x + (w - 20) / 2, (y0 + y1) / 2), lab, font=font("bold", 20), fill=WHITE, anchor="mm")


def synapse(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.rounded_rectangle((x0 + 80, y0 + 120, x0 + 420, y1 - 120), 20, outline=TEAL, width=4)
    d.rounded_rectangle((x0 + 700, y0 + 120, x0 + 1040, y1 - 120), 20, outline=GOLD, width=4)
    d.text((x0 + 250, y0 + 80), "Presynaptic", font=font("bold", 20), fill=WHITE, anchor="mm")
    d.text((x0 + 870, y0 + 80), "Postsynaptic", font=font("bold", 20), fill=WHITE, anchor="mm")
    for i in range(5):
        d.ellipse((x0 + 500 + i * 8, (y0 + y1) / 2 - 8, x0 + 516 + i * 8, (y0 + y1) / 2 + 8), fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 50), "Neurotransmitter diffuses across the synaptic cleft", font=font("regular", 20), fill=MUTED, anchor="mm")


def eye(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    cx, cy = x0 + 280, (y0 + y1) / 2
    d.ellipse((cx - 180, cy - 140, cx + 180, cy + 140), outline=WHITE, width=5)
    d.ellipse((cx - 40, cy - 40, cx + 40, cy + 40), outline=GOLD, width=4)
    d.text((x0 + 620, y0 + 120), "Cornea and lens focus light", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 620, y0 + 190), "Iris controls how much light enters", font=font("semibold", 24), fill=WHITE)


def glands(d, box, t=0.0):
    card(d, box, accent=PINK)
    x0, y0, x1, y1 = box
    rows = [
        "Pituitary — FSH, LH, ADH (coordinates several glands)",
        "Pancreas — insulin   ·   Adrenal — adrenaline",
        "Ovaries — oestrogen, progesterone   ·   Testes — testosterone",
    ]
    for i, text in enumerate(rows):
        d.text((x0 + 50, y0 + 80 + i * 120), text, font=font("semibold", 24), fill=WHITE)


def diabetes(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=ORANGE)
    d.text((x0 + 40, y0 + 40), "Type 1", font=font("bold", 28), fill=GOLD)
    text_block(d, (x0 + 40, y0 + 110), "Usually autoimmune destruction of beta cells. Not enough insulin. Treated by injecting insulin.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=TEAL)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Type 2", font=font("bold", 28), fill=TEAL_BAR)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Insulin resistance, sometimes reduced production. Treatment varies: lifestyle and sometimes medicines.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)


def menstrual(d, box, t=0.0):
    card(d, box, accent=PINK)
    x0, y0, x1, y1 = box
    rows = [("FSH", "Matures an egg"), ("LH", "Triggers ovulation"), ("Oestrogen", "Builds the lining"), ("Progesterone", "Maintains the lining")]
    w = (x1 - x0 - 80) / 4
    for i, (title, body) in enumerate(rows):
        x = x0 + 20 + i * w
        d.rounded_rectangle((x, y0 + 80, x + w - 20, y1 - 80), 16, fill=(18, 48, 72), outline=PINK, width=2)
        d.text((x + (w - 20) / 2, (y0 + y1) / 2 - 20), title, font=font("bold", 24), fill=GOLD, anchor="mm")
        d.text((x + (w - 20) / 2, (y0 + y1) / 2 + 24), body, font=font("regular", 18), fill=MUTED, anchor="mm")


def tropisms(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "Shoots: towards light (positive phototropism), against gravity (negative geotropism)", font=font("semibold", 22), fill=WHITE)
    d.text((x0 + 50, y0 + 160), "Roots: away from light, towards gravity", font=font("semibold", 22), fill=WHITE)


def auxin(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    # shoot bent towards light on the left
    d.polygon([(x0 + 280, y1 - 80), (x0 + 340, y1 - 80), (x0 + 360, y0 + 90), (x0 + 220, y0 + 140)], fill=LEAF)
    d.ellipse((x0 + 80, y0 + 80, x0 + 150, y0 + 150), fill=GOLD)
    d.text((x0 + 115, y0 + 50), "light", font=font("bold", 18), fill=GOLD, anchor="mm")
    d.text((x0 + 520, y0 + 80), "More auxin on the shaded side", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 520, y0 + 140), "Greater cell elongation there", font=font("semibold", 24), fill=MUTED)
    d.text((x0 + 520, y0 + 200), "Shoot bends towards the light", font=font("semibold", 24), fill=GOLD)
    d.text((x0 + 520, y0 + 280), "Not simply destroyed by light", font=font("regular", 22), fill=ORANGE)


def meiosis(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "Body cell 46  →  meiosis  →  gametes 23", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Egg 23 + sperm 23  →  zygote 46", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 240), "Recombination and independent assortment create variation.", font=font("regular", 22), fill=MUTED)


def dna(d, box, t=0.0):
    card(d, box, accent=DNA)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "DNA is a double helix of nucleotides.", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Base pairing:  C with G    A with T", font=font("bold", 26), fill=GOLD)
    d.text((x0 + 50, y0 + 230), "A gene is a section of DNA that codes for a protein.", font=font("regular", 22), fill=MUTED)


def punnett(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    cells = [["", "F", "F"], ["F", "FF", "FF"], ["f", "Ff", "Ff"]]
    s = 110
    ox, oy = x0 + 80, y0 + 50
    for r, row in enumerate(cells):
        for c, val in enumerate(row):
            d.rectangle((ox + c * s, oy + r * s, ox + (c + 1) * s, oy + (r + 1) * s), outline=WHITE, width=2)
            d.text((ox + c * s + s / 2, oy + r * s + s / 2), val, font=font("bold", 26), fill=GOLD if val == "Ff" else WHITE, anchor="mm")
    d.text((x0 + 520, y0 + 80), "Parents: FF × Ff", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 520, y0 + 150), "Offspring: FF or Ff", font=font("semibold", 24), fill=MUTED)
    d.text((x0 + 520, y0 + 220), "ff needed for cystic fibrosis", font=font("semibold", 24), fill=MUTED)
    d.text((x0 + 520, y0 + 300), "Probability = 0%", font=font("bold", 32), fill=GOLD)


def variation(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Mutations  →  new alleles", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 160), "Meiosis and fertilisation  →  reshuffle existing alleles", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 240), "Environment can also cause differences.", font=font("regular", 22), fill=MUTED)


def selection(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "Individuals vary. Some traits improve reproductive success", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 130), "in a particular environment.", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 210), "Those alleles are passed on. Populations change over generations.", font=font("regular", 22), fill=MUTED)
    d.text((x0 + 50, y0 + 290), "An individual does not evolve because it ‘needs’ to.", font=font("semibold", 22), fill=GOLD)


def ge_insulin(d, box, t=0.0):
    x0, y0, x1, y1 = box
    steps = ["Identify the human insulin gene", "Cut it out", "Insert it into a plasmid", "Put the plasmid into bacteria and clone"]
    for i, text in enumerate(steps):
        y = y0 + i * 115
        card(d, (x0, y, x1, y + 100), accent=TEAL)
        d.text((x0 + 40, y + 32), f"{i + 1}.  {text}", font=font("semibold", 26), fill=WHITE)


def ideas(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 60), "Darwin and Wallace: natural selection", font=font("bold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 130), "Lamarck: acquired characteristics inherited — now rejected", font=font("bold", 24), fill=ORANGE)
    d.text((x0 + 50, y0 + 200), "Mendel: inherited units, later called genes", font=font("bold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 270), "Chromosomes were later shown to carry those genes", font=font("regular", 22), fill=MUTED)


def resistance(d, box, t=0.0):
    card(d, box, accent=ORANGE)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "1.  A random mutation may already give resistance.", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "2.  Antibiotics kill susceptible bacteria more effectively.", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 230), "3.  Resistant bacteria survive, reproduce and pass it on.", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 310), "Antibiotics do not create purposeful mutations.", font=font("bold", 22), fill=GOLD)


def speciation(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Geographic isolation  →  populations can no longer breed  →  speciation", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 180), "Extinction: every member of a species dies", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 250), "Habitat loss, new predators, disease, human activity", font=font("regular", 22), fill=MUTED)


def ranks(d, box, t=0.0):
    labels = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"]
    x0, y0, x1, y1 = box
    for i, lab in enumerate(labels):
        y = y0 + i * 70
        pad = i * 40
        d.rounded_rectangle((x0 + 40 + pad, y, x1 - 40 - pad, y + 58), 12, fill=TEAL if i % 2 == 0 else (18, 48, 72))
        d.text(((x0 + x1) / 2, y + 29), lab, font=font("bold", 22), fill=WHITE, anchor="mm")


def domains(d, box, t=0.0):
    x0, y0, x1, y1 = box
    for i, lab in enumerate(["Bacteria", "Archaea", "Eukarya"]):
        x = x0 + i * ((x1 - x0) / 3)
        card(d, (x + 10, y0, x + (x1 - x0) / 3 - 10, y1), accent=TEAL)
        d.text((x + (x1 - x0) / 6, (y0 + y1) / 2), lab, font=font("bold", 28), fill=WHITE, anchor="mm")


def tree(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.line(((x0 + x1) / 2, y1 - 60, (x0 + x1) / 2, y0 + 80), fill=TEAL, width=6)
    d.line(((x0 + x1) / 2, y0 + 160, x0 + 200, y0 + 80), fill=TEAL, width=6)
    d.line(((x0 + x1) / 2, y0 + 160, x1 - 200, y0 + 80), fill=TEAL, width=6)
    d.text(((x0 + x1) / 2, y1 - 40), "Shared ancestry from classification, fossils and DNA", font=font("regular", 20), fill=MUTED, anchor="mm")


def ecosystem(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Living organisms + non-living surroundings", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 160), "Compete for space, food, water and light", font=font("semibold", 24), fill=MUTED)
    d.text((x0 + 50, y0 + 240), "Interdependence: oxpeckers eat parasites from buffalo", font=font("regular", 22), fill=MUTED)


def adapt_types(d, box, t=0.0):
    x0, y0, x1, y1 = box
    cols = [("Structural", "Physical feature, e.g. thick fur"), ("Behavioural", "An action, e.g. migration"), ("Physiological", "Internal process, e.g. concentrated urine")]
    w = (x1 - x0 - 40) / 3
    for i, (title, body) in enumerate(cols):
        x = x0 + i * (w + 20)
        card(d, (x, y0, x + w, y1), accent=TEAL)
        d.text((x + 24, y0 + 40), title, font=font("bold", 24), fill=GOLD)
        text_block(d, (x + 24, y0 + 110), body, font("regular", 22), WHITE, w - 48)


def factors(d, box, t=0.0):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, (x0 + x1) / 2 - 12, y1), accent=TEAL)
    d.text((x0 + 40, y0 + 40), "Abiotic", font=font("bold", 28), fill=TEAL_BAR)
    text_block(d, (x0 + 40, y0 + 110), "Temperature, moisture, light, pH, wind, oxygen, carbon dioxide.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)
    card(d, ((x0 + x1) / 2 + 12, y0, x1, y1), accent=GOLD)
    d.text(((x0 + x1) / 2 + 52, y0 + 40), "Biotic", font=font("bold", 28), fill=GOLD)
    text_block(d, ((x0 + x1) / 2 + 52, y0 + 110), "Food, new predators, diseases, competition.", font("regular", 22), WHITE, (x1 - x0) / 2 - 90)


def food_chain(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    labels = ["Producer", "Primary\nconsumer", "Secondary\nconsumer", "Tertiary\nconsumer"]
    w = (x1 - x0 - 80) / 4
    for i, lab in enumerate(labels):
        x = x0 + 20 + i * w
        d.rounded_rectangle((x, y0 + 80, x + w - 30, y1 - 80), 16, fill=(18, 48, 72), outline=TEAL, width=2)
        d.text((x + (w - 30) / 2, (y0 + y1) / 2), lab, font=font("bold", 22), fill=WHITE, anchor="mm")
        if i < 3:
            d.polygon([(x + w - 22, (y0 + y1) / 2), (x + w - 4, (y0 + y1) / 2 - 12), (x + w - 4, (y0 + y1) / 2 + 12)], fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 40), "Arrow points towards the organism receiving energy", font=font("regular", 20), fill=MUTED, anchor="mm")


def carbon(d, box, t=0.0):
    card(d, box, accent=ORANGE)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Air CO₂  →  plants (photosynthesis)  →  animals", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 160), "Returns by respiration, decomposition and combustion", font=font("semibold", 24), fill=WHITE)


def water(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Evaporation and transpiration  →  water vapour", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 160), "Condensation  →  clouds   ·   precipitation  →  surface", font=font("semibold", 24), fill=WHITE)


def biodiversity(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Variety within species, between species, and across ecosystems", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 180), "High biodiversity makes ecosystems more stable", font=font("bold", 24), fill=GOLD)


def greenhouse(d, box, t=0.0):
    card(d, box, accent=ORANGE)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "Fewer trees  →  less CO₂ absorbed", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Burning or decay  →  more CO₂ released", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 230), "Stronger greenhouse effect  →  global warming", font=font("semibold", 24), fill=GOLD)


def trophic(d, box, t=0.0):
    x0, y0, x1, y1 = box
    rows = ["Level 1  Producers", "Level 2  Herbivores", "Level 3  Carnivores that eat herbivores", "Level 4  Carnivores that eat carnivores"]
    for i, text in enumerate(rows):
        y = y0 + i * 115
        card(d, (x0, y, x1, y + 100), accent=TEAL)
        d.text((x0 + 40, y + 32), text, font=font("semibold", 26), fill=WHITE)


def pyramid(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    cx = (x0 + x1) / 2
    masses = [("Fox  0.04 kg", 180), ("Stoat  0.45 kg", 320), ("Rabbit  3.2 kg", 520), ("Cabbage  37 kg", 760)]
    top = y0 + 40
    for i, (lab, w) in enumerate(masses):
        y = top + i * 95
        d.rectangle((cx - w / 2, y, cx + w / 2, y + 80), fill=TEAL if i == 3 else (18, 48, 72), outline=LINE, width=2)
        d.text((cx, y + 40), lab, font=font("bold", 22), fill=WHITE, anchor="mm")


def biomass_calc(d, box, t=0.0):
    card(d, box, accent=GOLD)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 60), "% biomass transfer  =  (biomass transferred ÷ biomass available) × 100", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 140), "Cabbage → rabbit  8.6%     rabbit → stoat  14.1%     stoat → fox  8.9%", font=font("bold", 24), fill=GOLD)
    d.text((x0 + 50, y0 + 230), "Do not call this energy-transfer efficiency unless energy was measured.", font=font("regular", 22), fill=MUTED)


def food_eff(d, box, t=0.0):
    card(d, box, accent=TEAL)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 80), "Shorten the food chain", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Keep animals warm and limit movement", font=font("bold", 26), fill=WHITE)
    d.text((x0 + 50, y0 + 220), "Feed protein where it improves conversion", font=font("bold", 26), fill=WHITE)


def mycoprotein(d, box, t=0.0):
    card(d, box, accent=LEAF)
    x0, y0, x1, y1 = box
    d.text((x0 + 50, y0 + 70), "Fusarium grown on glucose syrup in aerobic conditions", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 150), "Harvest biomass  →  process as protein-rich food", font=font("semibold", 24), fill=WHITE)
    d.text((x0 + 50, y0 + 230), "Suitable for vegetarians", font=font("bold", 24), fill=GOLD)


DIAGRAMS = {
    "mitosis": mitosis,
    "stem_cells": stem_cells,
    "cell_cycle": cell_cycle,
    "binary_fission": binary_fission,
    "doubling": doubling,
    "petri": petri,
    "diffusion": diffusion,
    "alveoli": alveoli,
    "osmosis": osmosis,
    "active_transport": active_transport,
    "transport_compare": transport_compare,
    "hierarchy": hierarchy,
    "heart_org": heart_org,
    "enzymes": enzymes,
    "bile": bile,
    "active_site": active_site,
    "vessels": vessels,
    "leaf": leaf,
    "stomata": stomata,
    "transpiration": transpiration,
    "xylem_phloem": xylem_phloem,
    "pathogens": pathogens,
    "defences": defences,
    "vaccine": vaccine,
    "trials": trials,
    "blinding": blinding,
    "hybridoma": hybridoma,
    "plant_signs": plant_signs,
    "minerals": minerals,
    "photo_eq": photo_eq,
    "glucose_uses": glucose_uses,
    "limiting": limiting,
    "inverse_square": inverse_square,
    "aerobic": aerobic,
    "anaerobic": anaerobic,
    "breathe_vs_resp": breathe_vs_resp,
    "control_loop": control_loop,
    "glucose_fb": glucose_fb,
    "conscious": conscious,
    "reflex": reflex,
    "synapse": synapse,
    "eye": eye,
    "glands": glands,
    "diabetes": diabetes,
    "menstrual": menstrual,
    "tropisms": tropisms,
    "auxin": auxin,
    "meiosis": meiosis,
    "dna": dna,
    "punnett": punnett,
    "variation": variation,
    "selection": selection,
    "ge_insulin": ge_insulin,
    "ideas": ideas,
    "resistance": resistance,
    "speciation": speciation,
    "ranks": ranks,
    "domains": domains,
    "tree": tree,
    "ecosystem": ecosystem,
    "adapt_types": adapt_types,
    "factors": factors,
    "food_chain": food_chain,
    "carbon": carbon,
    "water": water,
    "biodiversity": biodiversity,
    "greenhouse": greenhouse,
    "trophic": trophic,
    "pyramid": pyramid,
    "biomass_calc": biomass_calc,
    "food_eff": food_eff,
    "mycoprotein": mycoprotein,
}
