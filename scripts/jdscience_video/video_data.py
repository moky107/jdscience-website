"""Lesson scenes, cue phrases and default timing for JDScience Video Studio.

Default timestamps are spoken-rate placeholders used only when the original
ElevenLabs MP3 has not yet been aligned. transcribe.py overwrites them from
word-level Whisper timestamps of the master recording.
"""

from __future__ import annotations

import math
from typing import Iterable

from PIL import Image, ImageDraw

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


def _visible(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _label_box(d, x, y, text, fnt, fill=WHITE) -> tuple[int, int, int, int]:
    tw, th = measure_run(d, text, fnt)
    d.text((x, y), text, font=fnt, fill=fill, anchor="lt")
    return x, y, x + tw, y + th


# ---------------------------------------------------------------------------
# Moles — 60 s sample (intro + concept + cursor-guided formula)
# ---------------------------------------------------------------------------

MOLES_SAMPLE_SCRIPT = [
    (0.00, "In today's video, we want to look at calculating moles."),
    (5.20, "This is one of the most important ideas in GCSE chemistry."),
    (10.40, "Let's begin."),
    (12.20, "A mole is the amount of substance that contains 6.02 times 10 to the 23 particles."),
    (20.40, "We call this number Avogadro's constant."),
    (24.80, "One mole of any substance has a mass equal to its relative formula mass in grams."),
    (32.40, "That mass is called the molar mass."),
    (36.40, "Number of moles equals mass divided by molar mass."),
    (42.40, "For magnesium, Ar is 24."),
    (46.40, "Twelve divided by twenty-four gives zero point five moles."),
    (54.20, "So 12 grams of magnesium is 0.5 moles."),
]

MOLES_SLIDES = [
    {"t": 0.00, "id": "intro", "cue": "in today's video", "note": "Professional introduction"},
    {"t": 12.20, "id": "concept", "cue": "a mole is the amount", "note": "Particles, amount, mass"},
    {"t": 36.40, "id": "formula", "cue": "number of moles equals", "note": "n = m / Mr and Mg working"},
]

MOLES_REVEALS = [
    {"t": 0.00, "slide": "intro", "item": "title"},
    {"t": 5.20, "slide": "intro", "item": "agenda"},
    {"t": 10.40, "slide": "intro", "item": "begin"},
    {"t": 12.20, "slide": "concept", "item": "def"},
    {"t": 16.40, "slide": "concept", "item": "avogadro"},
    {"t": 20.40, "slide": "concept", "item": "name"},
    {"t": 24.80, "slide": "concept", "item": "mass_link"},
    {"t": 32.40, "slide": "concept", "item": "molar"},
    {"t": 36.40, "slide": "formula", "item": "n"},
    {"t": 38.40, "slide": "formula", "item": "m"},
    {"t": 40.40, "slide": "formula", "item": "mr"},
    {"t": 42.40, "slide": "formula", "item": "mg"},
    {"t": 44.20, "slide": "formula", "item": "ar"},
    {"t": 46.40, "slide": "formula", "item": "twelve"},
    {"t": 48.60, "slide": "formula", "item": "twenty_four"},
    {"t": 51.40, "slide": "formula", "item": "half"},
    {"t": 54.20, "slide": "formula", "item": "answer"},
]

MOLES_CURSOR = [
    {"t": 0.00, "target": None, "cue": None},
    {"t": 16.40, "target": "avogadro", "cue": "6.02"},
    {"t": 20.40, "target": "avogadro", "cue": "avogadro"},
    {"t": 24.80, "target": None, "cue": None},
    {"t": 36.40, "target": "n", "cue": "number of moles"},
    {"t": 38.40, "target": "m", "cue": "mass divided"},
    {"t": 40.40, "target": "mr", "cue": "molar mass"},
    {"t": 42.40, "target": None, "cue": None},
    {"t": 46.40, "target": "twelve", "cue": "twelve"},
    {"t": 48.60, "target": "twenty_four", "cue": "twenty-four"},
    {"t": 51.40, "target": "half", "cue": "zero point five"},
    {"t": 56.00, "target": None, "cue": None},
]


def _particles(d: ImageDraw.ImageDraw, cx: int, cy: int, t: float, n: int = 36) -> None:
    for i in range(n):
        ang = (i / n) * math.tau + t * 0.12 + (i % 5) * 0.15
        r = 28 + 82 * (((i * 5) % 11) / 11)
        x = cx + int(math.cos(ang) * r)
        y = cy + int(math.sin(ang) * r * 0.86)
        col = TEAL_BAR if i % 3 == 0 else GOLD if i % 7 == 0 else (90, 170, 210)
        d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=col)


def intro(revealed: set[str], t: float = 0.0) -> tuple[Image.Image, Hotspots]:
    img = new_canvas()
    d = draw_chrome(img, 1, 3, "Calculating moles")
    spots: Hotspots = {}
    _particles(d, 1560, 430, t)
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    if _visible(revealed, "title"):
        d.text((88, 200), "Calculating Moles", font=font("bold", 64), fill=WHITE)
        d.text((88, 284), STRAPLINE, font=font("regular", 26), fill=MUTED)
        spots["title"] = hotspot((88, 200, 920, 280))
    items = [
        "What is a mole?",
        "Avogadro's constant",
        "n  =  m  ÷  Mr",
    ]
    if _visible(revealed, "agenda"):
        y = 380
        for i, label in enumerate(items):
            box = (88, y, 760, y + 78)
            draw_row(d, box, accent=TEAL if i < 2 else GOLD)
            d.text((box[0] + 36, (box[1] + box[3]) / 2), label, font=font("semibold", 30), fill=INK, anchor="lm")
            spots[f"a{i+1}"] = hotspot(box)
            y += 96
    if _visible(revealed, "begin"):
        d.text((88, 700), "Let's begin.", font=font("semibold", 28), fill=GOLD)
    return img, spots


def concept(revealed: set[str], t: float = 0.0) -> tuple[Image.Image, Hotspots]:
    img = new_canvas()
    d = draw_chrome(img, 2, 3, "Calculating moles")
    heading(d, "What is a mole?", "Amount of substance  ·  particles  ·  mass")
    spots: Hotspots = {}
    # Particle diagram card
    card = (88, 250, 760, 760)
    d.rounded_rectangle(card, 22, fill=NAVY_ROW, outline=(42, 92, 128), width=2)
    _particles(d, 424, 470, t, n=22)
    if _visible(revealed, "avogadro"):
        avo = f"6.02 × 10{supnum(23)}"
        d.text((424, 680), avo, font=font("bold", 36), fill=GOLD, anchor="mm")
        tw, th = measure_run(d, avo, font("bold", 36))
        spots["avogadro"] = hotspot((424 - tw / 2, 680 - th / 2, 424 + tw / 2, 680 + th / 2))
        d.text((424, 724), "particles", font=font("medium", 20), fill=MUTED, anchor="mm")
    # Definition stack
    rows = [
        ("def", "1 mole  =  the amount of substance"),
        ("name", "Avogadro's constant  Nᴀ"),
        ("mass_link", "Mass of 1 mole in grams  =  Mr"),
        ("molar", "That mass is the molar mass, Mr"),
    ]
    y = 250
    for key, label in rows:
        box = (800, y, W - 88, y + 100)
        if not _visible(revealed, key):
            draw_row(d, box, fill=(16, 34, 58))
            y += 118
            continue
        draw_row(d, box, accent=GOLD if key in {"name", "molar"} else TEAL)
        d.text((box[0] + 36, (box[1] + box[3]) / 2), label, font=font("medium", 28), fill=INK, anchor="lm")
        spots[key] = hotspot(box)
        y += 118
    return img, spots


def formula(revealed: set[str], t: float = 0.0) -> tuple[Image.Image, Hotspots]:
    img = new_canvas()
    d = draw_chrome(img, 3, 3, "Calculating moles")
    heading(d, "The mole formula", "Number of moles  =  mass  ÷  molar mass")
    spots: Hotspots = {}
    cards = [
        ("n", "n", "number of moles", TEAL),
        ("m", "m", "mass in grams", GOLD),
        ("mr", "Mr", "molar mass", GREEN),
    ]
    x = 88
    for key, symbol, caption, accent in cards:
        box = (x, 250, x + 560, 430)
        if _visible(revealed, key):
            d.rounded_rectangle(box, 22, fill=NAVY_ROW)
            d.rectangle((box[0] + 8, box[1] + 18, box[0] + 18, box[3] - 18), fill=accent)
            d.text((x + 280, 278), caption, font=font("medium", 22), fill=MUTED, anchor="mm")
            d.text((x + 280, 348), symbol, font=font("bold", 64), fill=WHITE, anchor="mm")
            tw, th = measure_run(d, symbol, font("bold", 64))
            spots[key] = hotspot((x + 280 - tw / 2, 348 - th / 2, x + 280 + tw / 2, 348 + th / 2), pad=12)
        else:
            d.rounded_rectangle(box, 22, fill=(16, 34, 58))
        x += 588
    work = (88, 470, W - 88, 760)
    d.rounded_rectangle(work, 22, fill=NAVY_ROW)
    if _visible(revealed, "mg"):
        d.text((120, 500), "Magnesium   ·   Ar = 24   ·   mass = 12 g", font=font("medium", 26), fill=MUTED)
        spots["mg"] = hotspot((120, 490, 380, 540))
    if _visible(revealed, "ar"):
        spots["ar"] = hotspot((400, 490, 560, 540))
    parts = [
        ("twelve", "12", 160, "twelve"),
        ("div", "÷", 430, "twelve"),
        ("twenty_four", "24", 620, "twenty_four"),
        ("eq", "=", 900, "twenty_four"),
        ("half", "0.5 mol", 1120, "half"),
    ]
    for key, text, px, need in parts:
        if not _visible(revealed, need):
            continue
        if key in {"div", "eq"}:
            d.text((px, 640), text, font=font("bold", 56), fill=MUTED, anchor="lm")
            continue
        col = GOLD if key == "half" else WHITE
        d.text((px, 640), text, font=font("bold", 56), fill=col, anchor="lm")
        tw, th = measure_run(d, text, font("bold", 56))
        spots[key] = hotspot((px, 640 - th / 2, px + tw, 640 + th / 2))
    if _visible(revealed, "answer"):
        d.text((120, 800), "12 g of Mg  =  0.5 mol", font=font("semibold", 32), fill=GOLD)
        spots["answer"] = hotspot((120, 780, 720, 840))
    return img, spots


MOLES_SCENE_FNS = {
    "intro": intro,
    "concept": concept,
    "formula": formula,
}


LESSONS = {
    "moles": {
        "title": "Calculating Moles",
        "slug": "moles",
        "audio_names": ("moles.mp3", "calculating-moles.mp3", "01-moles.mp3"),
        "duration": 60.0,
        "slides": MOLES_SLIDES,
        "reveals": MOLES_REVEALS,
        "cursor": MOLES_CURSOR,
        "scenes": MOLES_SCENE_FNS,
        "sample": True,
    },
    "concentration": {
        "title": "Calculating Concentration",
        "slug": "concentration",
        "audio_names": ("concentration.mp3", "calculating-concentration.mp3"),
        "duration": 0.0,
        "slides": [],
        "reveals": [],
        "cursor": [],
        "scenes": {},
        "sample": False,
    },
    "percentage-by-mass": {
        "title": "Percentage by Mass",
        "slug": "percentage-by-mass",
        "audio_names": ("percentage-by-mass.mp3", "percentage_by_mass.mp3"),
        "duration": 0.0,
        "slides": [],
        "reveals": [],
        "cursor": [],
        "scenes": {},
        "sample": False,
    },
    "atom-economy": {
        "title": "Atom Economy",
        "slug": "atom-economy",
        "audio_names": ("atom-economy.mp3", "atom_economy.mp3"),
        "duration": 0.0,
        "slides": [],
        "reveals": [],
        "cursor": [],
        "scenes": {},
        "sample": False,
    },
}


def slide_at(lesson: dict, t: float) -> str:
    current = lesson["slides"][0]["id"]
    for s in lesson["slides"]:
        if t + 1e-9 >= s["t"]:
            current = s["id"]
        else:
            break
    return current


def revealed_at(lesson: dict, t: float, slide_id: str) -> list[str]:
    items = []
    for ev in lesson["reveals"]:
        if ev["slide"] == slide_id and t + 1e-9 >= ev["t"]:
            items.append(ev["item"])
    return items


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float = 0.0) -> tuple[Image.Image, Hotspots]:
    fn = lesson["scenes"][slide_id]
    return fn(set(revealed), t)
