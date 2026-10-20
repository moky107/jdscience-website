"""Shared chemistry illustrations for JDScience lesson videos."""

from __future__ import annotations

import math

from PIL import ImageDraw

from .theme import GOLD, GREEN, MUTED, TEAL, TEAL_BAR, WHITE, font


def atom(d: ImageDraw.ImageDraw, xy, r, fill, label=None, label_fill=WHITE):
    x, y = xy
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=WHITE, width=2)
    if label:
        d.text((x, y), label, font=font("bold", max(13, int(r * 0.85))), fill=label_fill, anchor="mm")


def particles(d: ImageDraw.ImageDraw, cx: int, cy: int, t: float, n: int = 36, scale: float = 1.0) -> None:
    for i in range(n):
        ang = (i / n) * math.tau + t * 0.12 + (i % 5) * 0.15
        r = (28 + 82 * (((i * 5) % 11) / 11)) * scale
        x = cx + int(math.cos(ang) * r)
        y = cy + int(math.sin(ang) * r * 0.86)
        col = TEAL_BAR if i % 3 == 0 else GOLD if i % 7 == 0 else (90, 170, 210)
        rad = 7 * scale
        d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=col)


def water(d, ox, oy, scale=1.0):
    atom(d, (ox, oy), int(28 * scale), (220, 80, 80), "O")
    atom(d, (ox - int(48 * scale), oy + int(32 * scale)), int(18 * scale), (230, 230, 240), "H", (40, 50, 70))
    atom(d, (ox + int(48 * scale), oy + int(32 * scale)), int(18 * scale), (230, 230, 240), "H", (40, 50, 70))
    d.line((ox - 18 * scale, oy + 10 * scale, ox - 36 * scale, oy + 24 * scale), fill=WHITE, width=3)
    d.line((ox + 18 * scale, oy + 10 * scale, ox + 36 * scale, oy + 24 * scale), fill=WHITE, width=3)


def co2(d, ox, oy, scale=1.0):
    atom(d, (ox, oy), int(26 * scale), (80, 80, 90), "C")
    atom(d, (ox - int(70 * scale), oy), int(24 * scale), (220, 80, 80), "O")
    atom(d, (ox + int(70 * scale), oy), int(24 * scale), (220, 80, 80), "O")
    d.line((ox - 26 * scale, oy, ox - 46 * scale, oy), fill=WHITE, width=4)
    d.line((ox + 26 * scale, oy, ox + 46 * scale, oy), fill=WHITE, width=4)


def caco3(d, ox, oy, scale=1.0):
    atom(d, (ox - int(70 * scale), oy), int(26 * scale), (200, 200, 210), "Ca", (40, 50, 70))
    atom(d, (ox, oy), int(22 * scale), (80, 80, 90), "C")
    atom(d, (ox + int(55 * scale), oy - int(38 * scale)), int(18 * scale), (220, 80, 80), "O")
    atom(d, (ox + int(70 * scale), oy + int(18 * scale)), int(18 * scale), (220, 80, 80), "O")
    atom(d, (ox + int(30 * scale), oy + int(48 * scale)), int(18 * scale), (220, 80, 80), "O")


def h2o2(d, ox, oy, scale=1.0):
    atom(d, (ox - int(22 * scale), oy), int(22 * scale), (220, 80, 80), "O")
    atom(d, (ox + int(22 * scale), oy), int(22 * scale), (220, 80, 80), "O")
    atom(d, (ox - int(52 * scale), oy - int(28 * scale)), int(14 * scale), (230, 230, 240), "H", (40, 50, 70))
    atom(d, (ox + int(52 * scale), oy - int(28 * scale)), int(14 * scale), (230, 230, 240), "H", (40, 50, 70))


def cao(d, ox, oy, scale=1.0):
    atom(d, (ox - int(32 * scale), oy), int(26 * scale), (200, 200, 210), "Ca", (40, 50, 70))
    atom(d, (ox + int(32 * scale), oy), int(22 * scale), (220, 80, 80), "O")


def beaker(d, ox, oy, w=160, h=200, fill_frac=0.55, liquid=(70, 160, 200), solute=False, label=None, conc=False):
    """Simple 2D beaker, origin at top-left of glass."""
    glass = (200, 220, 235)
    d.line((ox, oy, ox, oy + h), fill=glass, width=5)
    d.line((ox + w, oy, ox + w, oy + h), fill=glass, width=5)
    d.arc((ox, oy + h - 28, ox + w, oy + h + 20), 0, 180, fill=glass, width=5)
    d.line((ox - 8, oy, ox + w + 8, oy), fill=glass, width=4)
    ly = oy + int(h * (1 - fill_frac))
    d.rounded_rectangle((ox + 6, ly, ox + w - 6, oy + h - 8), 10, fill=liquid)
    if solute:
        n = 18 if conc else 8
        for i in range(n):
            x = ox + 22 + (i * 37) % (w - 40)
            y = ly + 18 + (i * 23) % int(h * fill_frac - 30)
            col = GOLD if conc else (180, 210, 230)
            d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=col)
    if label:
        d.text((ox + w / 2, oy + h + 28), label, font=font("medium", 20), fill=MUTED, anchor="mm")


def flask(d, ox, oy, scale=1.0, liquid=(70, 160, 200), fill=True, label=None):
    """Volumetric flask, ox,oy = centre of bulb."""
    s = scale
    neck_w = int(22 * s)
    neck_h = int(90 * s)
    bulb_r = int(70 * s)
    # neck
    d.rectangle((ox - neck_w, oy - bulb_r - neck_h, ox + neck_w, oy - bulb_r + 8), outline=(200, 220, 235), width=4)
    d.ellipse((ox - 18 * s, oy - bulb_r - neck_h - 10 * s, ox + 18 * s, oy - bulb_r - neck_h + 8 * s), outline=(200, 220, 235), width=4)
    d.ellipse((ox - bulb_r, oy - bulb_r, ox + bulb_r, oy + bulb_r), outline=(200, 220, 235), width=5)
    if fill:
        d.ellipse((ox - bulb_r + 10, oy - 10, ox + bulb_r - 10, oy + bulb_r - 8), fill=liquid)
        # meniscus mark
        d.line((ox - neck_w - 12, oy - bulb_r - 8, ox + neck_w + 22, oy - bulb_r - 8), fill=GOLD, width=3)
    if label:
        d.text((ox, oy + bulb_r + 28), label, font=font("medium", 20), fill=MUTED, anchor="mm")


def solute_solvent(d, ox, oy, show_solute=True, show_solvent=True, show_solution=False):
    """Three-panel mixing diagram."""
    beaker(d, ox, oy, w=130, h=170, fill_frac=0.15 if show_solute else 0.0,
           liquid=(180, 190, 80) if show_solute else (20, 40, 60),
           solute=show_solute, label="solute" if show_solute else None, conc=True)
    if show_solvent:
        beaker(d, ox + 200, oy, w=130, h=170, fill_frac=0.7, liquid=(80, 150, 210),
               solute=False, label="solvent")
    if show_solution:
        d.text((ox + 155, oy + 80), "+", font=font("bold", 36), fill=WHITE, anchor="mm")
        d.text((ox + 355, oy + 80), "→", font=font("bold", 36), fill=GOLD, anchor="mm")
        beaker(d, ox + 400, oy, w=130, h=170, fill_frac=0.7, liquid=(90, 170, 150),
               solute=True, label="solution", conc=False)
    elif show_solvent:
        d.text((ox + 155, oy + 80), "+", font=font("bold", 36), fill=WHITE, anchor="mm")
