"""Shared diagrams for the GCSE Chemistry foundations videos."""

from __future__ import annotations

import math
from typing import Iterable

from PIL import ImageDraw

from jdscience_video.theme import (
    GOLD,
    GREEN,
    INK,
    LINE,
    MUTED,
    NAVY_ROW,
    TEAL,
    TEAL_BAR,
    WHITE,
    font,
)


SOLID = (120, 196, 220)
LIQUID = (70, 168, 214)
GAS = (232, 194, 71)
INK_DYE = (40, 40, 48)
PINK = (232, 120, 168)
ORANGE = (232, 150, 72)
PURPLE = (164, 120, 214)


def wrap(d: ImageDraw.ImageDraw, text: str, fnt, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        bbox = d.textbbox((0, 0), trial, font=fnt)
        if bbox[2] - bbox[0] <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text_block(d, xy, text, fnt, fill, width, line_gap=8, anchor="lt") -> int:
    x, y = xy
    lines = wrap(d, text, fnt, width)
    for i, line in enumerate(lines):
        d.text((x, y + i * (fnt.size + line_gap)), line, font=fnt, fill=fill, anchor=anchor)
    return len(lines) * (fnt.size + line_gap)


def card(d, box, fill=NAVY_ROW, accent=None, radius=18):
    d.rounded_rectangle(box, radius, fill=fill, outline=LINE, width=2)
    if accent:
        d.rectangle((box[0] + 6, box[1] + 14, box[0] + 14, box[3] - 14), fill=accent)


def bullet_card(d, box, title, body, accent=TEAL, show=True):
    if not show:
        d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        return
    card(d, box, accent=accent)
    d.text((box[0] + 32, box[1] + 18), title, font=font("bold", 24), fill=WHITE)
    text_block(d, (box[0] + 32, box[1] + 56), body, font("regular", 20), MUTED, box[2] - box[0] - 52)


def particle(d, xy, r, fill, outline=WHITE):
    x, y = xy
    d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=outline, width=2)


def water_molecule(d, ox, oy, scale=1.0):
    particle(d, (ox, oy), int(16 * scale), (220, 80, 80))
    particle(d, (ox - int(26 * scale), oy + int(18 * scale)), int(10 * scale), (230, 230, 240), (60, 70, 90))
    particle(d, (ox + int(26 * scale), oy + int(18 * scale)), int(10 * scale), (230, 230, 240), (60, 70, 90))
    d.text((ox, oy), "O", font=font("bold", max(11, int(12 * scale))), fill=WHITE, anchor="mm")


def particle_box(d, box, state: str, t: float, title: str | None = None, highlight: bool = False):
    x0, y0, x1, y1 = box
    fill = (20, 48, 78) if highlight else NAVY_ROW
    d.rounded_rectangle(box, 20, fill=fill, outline=TEAL_BAR if highlight else LINE, width=3 if highlight else 2)
    inner = (x0 + 18, y0 + 52 if title else y0 + 18, x1 - 18, y1 - 22)
    ix0, iy0, ix1, iy1 = inner
    w, h = ix1 - ix0, iy1 - iy0
    if title:
        d.text(((x0 + x1) / 2, y0 + 26), title, font=font("semibold", 22), fill=WHITE, anchor="mm")
    if state == "solid":
        cols, rows = 6, 5
        for r in range(rows):
            for c in range(cols):
                jx = 2.2 * math.sin(t * 7.0 + r * 0.8 + c * 0.6)
                jy = 2.2 * math.cos(t * 6.4 + r * 0.5 + c * 0.9)
                x = ix0 + 22 + c * (w - 44) / (cols - 1) + jx
                y = iy0 + 22 + r * (h - 44) / (rows - 1) + jy
                particle(d, (x, y), 9, SOLID)
    elif state == "liquid":
        n = 28
        for i in range(n):
            px = (i * 47 + t * 38) % (w - 28)
            py = (i * 31 + math.sin(t * 1.4 + i) * 10) % (h - 28)
            x = ix0 + 14 + px
            y = iy0 + 14 + py
            particle(d, (x, y), 8, LIQUID)
    else:
        n = 11
        for i in range(n):
            px = (i * 89 + t * 90 + i * 17) % (w - 20)
            py = (i * 53 + t * 70 + i * 11) % (h - 20)
            x = ix0 + 10 + px
            y = iy0 + 10 + py
            particle(d, (x, y), 7, GAS)


def heating_curve(d, box, progress: float):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 28, y0 + 18), "Heating curve for pure water", font=font("bold", 24), fill=WHITE)
    gx0, gy0, gx1, gy1 = x0 + 90, y0 + 70, x1 - 40, y1 - 70
    d.line((gx0, gy1, gx1, gy1), fill=MUTED, width=3)
    d.line((gx0, gy1, gx0, gy0), fill=MUTED, width=3)
    d.text((gx0 - 16, gy1), "−10", font=font("medium", 16), fill=MUTED, anchor="rm")
    d.text((gx0 - 16, gy1 - 0.35 * (gy1 - gy0)), "0", font=font("medium", 16), fill=MUTED, anchor="rm")
    d.text((gx0 - 16, gy0 + 8), "100", font=font("medium", 16), fill=MUTED, anchor="rm")
    d.text((gx0 - 52, (gy0 + gy1) / 2), "T / °C", font=font("medium", 16), fill=MUTED, anchor="mm")
    d.text((gx1, gy1 + 28), "Energy supplied →", font=font("medium", 16), fill=MUTED, anchor="rm")
    # Normalised path: heat ice, melt, heat water, boil
    pts = [
        (0.00, 0.00),  # -10
        (0.18, 0.35),  # 0
        (0.40, 0.35),  # melt
        (0.62, 1.00),  # 100
        (0.92, 1.00),  # boil
    ]
    drawn = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        if progress <= a[0]:
            break
        frac = min(1.0, (progress - a[0]) / (b[0] - a[0]))
        x = gx0 + (a[0] + (b[0] - a[0]) * frac) * (gx1 - gx0)
        y = gy1 - (a[1] + (b[1] - a[1]) * frac) * (gy1 - gy0)
        drawn.append((gx0 + a[0] * (gx1 - gx0), gy1 - a[1] * (gy1 - gy0)))
        drawn.append((x, y))
        if frac < 1:
            break
    if len(drawn) >= 2:
        d.line(drawn, fill=TEAL_BAR, width=5)
        x, y = drawn[-1]
        d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=GOLD)
    labels = [("ice heats", 0.08), ("melting", 0.28), ("water heats", 0.50), ("boiling", 0.78)]
    for label, px in labels:
        if progress >= px:
            d.text((gx0 + px * (gx1 - gx0), gy1 + 50), label, font=font("medium", 16), fill=GOLD, anchor="mm")


def beaker(d, ox, oy, w=130, h=160, fill_frac=0.55, liquid=(70, 160, 200), solids=0, label=None):
    glass = (200, 220, 235)
    d.line((ox, oy, ox, oy + h), fill=glass, width=5)
    d.line((ox + w, oy, ox + w, oy + h), fill=glass, width=5)
    d.arc((ox, oy + h - 24, ox + w, oy + h + 16), 0, 180, fill=glass, width=5)
    d.line((ox - 8, oy, ox + w + 8, oy), fill=glass, width=4)
    ly = oy + int(h * (1 - fill_frac))
    if fill_frac > 0:
        d.rounded_rectangle((ox + 6, ly, ox + w - 6, oy + h - 8), 10, fill=liquid)
    for i in range(solids):
        x = ox + 20 + (i * 29) % (w - 36)
        y = oy + h - 28 - (i * 11) % 40
        d.ellipse((x - 5, y - 4, x + 5, y + 4), fill=(210, 190, 120))
    if label:
        d.text((ox + w / 2, oy + h + 24), label, font=font("medium", 18), fill=MUTED, anchor="mm")


def funnel_filter(d, ox, oy):
    glass = (200, 220, 235)
    d.polygon([(ox, oy), (ox + 150, oy), (ox + 86, oy + 90), (ox + 64, oy + 90)], outline=glass, fill=(18, 40, 68))
    d.line((ox + 75, oy + 90, ox + 75, oy + 150), fill=glass, width=5)
    d.arc((ox + 18, oy + 8, ox + 132, oy + 70), 200, 340, fill=(230, 230, 220), width=6)
    d.text((ox + 75, oy - 18), "filter paper", font=font("medium", 16), fill=MUTED, anchor="mm")
    d.text((ox + 75, oy + 48), "residue", font=font("semibold", 16), fill=GOLD, anchor="mm")


def condenser(d, ox, oy):
    glass = (200, 220, 235)
    d.rounded_rectangle((ox, oy, ox + 260, oy + 54), 10, outline=glass, width=3)
    d.rounded_rectangle((ox + 16, oy + 16, ox + 244, oy + 38), 8, fill=(90, 180, 210))
    d.text((ox + 130, oy - 16), "condenser", font=font("medium", 16), fill=MUTED, anchor="mm")


def simple_distillation(d, box):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Simple distillation", font=font("bold", 22), fill=WHITE)
    beaker(d, x0 + 80, y0 + 160, 180, 230, 0.48, (90, 170, 200), solids=8, label="saltwater")
    d.line((x0 + 170, y0 + 150, x0 + 170, y0 + 110), fill=WHITE, width=4)
    d.line((x0 + 170, y0 + 110, x0 + 430, y0 + 110), fill=WHITE, width=4)
    condenser(d, x0 + 430, y0 + 84)
    d.line((x0 + 690, y0 + 110, x0 + 820, y0 + 110), fill=WHITE, width=4)
    d.line((x0 + 820, y0 + 110, x0 + 820, y0 + 180), fill=WHITE, width=4)
    beaker(d, x0 + 760, y0 + 200, 140, 180, 0.38, (150, 210, 230), label="distillate")
    d.text((x0 + 360, y1 - 48), "Heat  →  vapour  →  condense  ·  salt remains in the flask", font=font("medium", 20), fill=MUTED, anchor="lm")
    d.text((x0 + 560, y0 + 70), "cold water jacket", font=font("medium", 16), fill=TEAL_BAR, anchor="mm")


def fractionating_column(d, box):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Fractional distillation", font=font("bold", 22), fill=WHITE)
    col = (x0 + 120, y0 + 70, x0 + 200, y1 - 90)
    d.rounded_rectangle(col, 12, outline=(200, 220, 235), width=4)
    for i in range(6):
        y = col[1] + 18 + i * 38
        d.line((col[0] + 8, y, col[2] - 8, y), fill=TEAL, width=2)
    d.text((x0 + 160, y0 + 58), "cool", font=font("medium", 14), fill=MUTED, anchor="mm")
    d.text((x0 + 160, y1 - 70), "hot", font=font("medium", 14), fill=GOLD, anchor="mm")
    beaker(d, x0 + 90, y1 - 88, 100, 40, 0.8, (180, 150, 70), label="mixture")
    d.text((x0 + 280, y0 + 110), "ethanol-rich vapour first", font=font("semibold", 20), fill=GOLD)
    d.text((x0 + 280, y0 + 150), "78 °C then 100 °C", font=font("regular", 18), fill=MUTED)
    d.text((x0 + 280, y0 + 190), "Also used for crude oil fractions", font=font("regular", 18), fill=MUTED)


def evaporating_basin(d, ox, oy, crystals=False, label="evaporating basin"):
    d.ellipse((ox, oy, ox + 160, oy + 46), outline=(200, 220, 235), width=4)
    d.ellipse((ox + 10, oy + 8, ox + 150, oy + 40), fill=(70, 150, 190))
    if crystals:
        for i in range(7):
            x = ox + 30 + i * 16
            d.polygon([(x, oy + 18), (x + 6, oy + 24), (x, oy + 30), (x - 6, oy + 24)], fill=WHITE)
    d.text((ox + 80, oy + 66), label, font=font("medium", 16), fill=MUTED, anchor="mm")


def chromatogram(d, box, progress: float, spots: Iterable[tuple[float, tuple[int, int, int]]], title="Chromatogram"):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 22, y0 + 14), title, font=font("bold", 20), fill=WHITE)
    paper = (x0 + 70, y0 + 50, x0 + 190, y1 - 30)
    d.rounded_rectangle(paper, 8, fill=(236, 232, 220), outline=WHITE, width=2)
    base_y = paper[3] - 36
    d.line((paper[0] + 8, base_y, paper[2] - 8, base_y), fill=(90, 90, 90), width=2)
    d.text((paper[0] - 8, base_y), "baseline", font=font("medium", 14), fill=MUTED, anchor="rm")
    solvent_y = base_y - progress * (base_y - paper[1] - 24)
    d.rectangle((paper[0] + 4, paper[3] - 18, paper[2] - 4, paper[3] - 6), fill=(150, 200, 230))
    if progress > 0:
        d.line((paper[0] + 8, solvent_y, paper[2] - 8, solvent_y), fill=TEAL, width=2)
        d.text((paper[2] + 10, solvent_y), "solvent front", font=font("medium", 14), fill=TEAL_BAR, anchor="lm")
    d.ellipse((x0 + 122, base_y - 5, x0 + 136, base_y + 7), fill=INK_DYE)
    for rf, colour in spots:
        y = base_y - progress * rf * (base_y - paper[1] - 24)
        d.ellipse((x0 + 118, y - 8, x0 + 140, y + 8), fill=colour)


def flow_steps(d, box, steps: list[tuple[str, str]], active: int | None = None):
    x0, y0, x1, y1 = box
    n = len(steps)
    gap = 16
    h = min(92, ((y1 - y0) - gap * (n - 1)) // n)
    for i, (title, body) in enumerate(steps):
        y = y0 + i * (h + gap)
        accent = GOLD if active == i else TEAL if active is None or i <= (active or 0) else LINE
        card(d, (x0, y, x1, y + h), accent=accent)
        d.text((x0 + 28, y + 14), f"{i + 1}  {title}", font=font("bold", 22), fill=WHITE)
        d.text((x0 + 28, y + 48), body, font=font("regular", 18), fill=MUTED)


def exam_panel(d, box, question: str, marks: str, answer: str | None):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, x1, y0 + 168), accent=GOLD)
    d.text((x0 + 28, y0 + 16), f"GCSE examination question  ·  {marks}", font=font("semibold", 18), fill=GOLD)
    text_block(d, (x0 + 28, y0 + 50), question, font("regular", 22), WHITE, x1 - x0 - 56)
    if answer:
        card(d, (x0, y0 + 188, x1, y1), accent=GREEN)
        d.text((x0 + 28, y0 + 204), "Model answer", font=font("bold", 20), fill=GREEN)
        text_block(d, (x0 + 28, y0 + 240), answer, font("regular", 20), INK, x1 - x0 - 56)
    else:
        d.rounded_rectangle((x0, y0 + 188, x1, y1), 18, fill=(16, 34, 58), outline=LINE, width=1)
        d.text(((x0 + x1) / 2, (y0 + 188 + y1) / 2), "Think, then check the model answer", font=font("medium", 22), fill=MUTED, anchor="mm")


def quiz_list(d, box, items: list[tuple[str, str, str, str]], revealed: set[str]):
    x0, y0, x1, y1 = box
    n = len(items)
    gap = 14
    h = min(110, ((y1 - y0) - gap * (n - 1)) // n)
    for i, (qk, ak, q, a) in enumerate(items):
        y = y0 + i * (h + gap)
        card(d, (x0, y, x1, y + h), accent=TEAL if qk in revealed else LINE)
        if qk in revealed:
            d.text((x0 + 28, y + 16), q, font=font("semibold", 22), fill=WHITE)
        if ak in revealed:
            d.text((x0 + 28, y + 58), a, font=font("bold", 24), fill=GOLD)
        elif qk in revealed:
            d.text((x0 + 28, y + 58), "Pause and decide…", font=font("regular", 20), fill=MUTED)


def recap_cards(d, box, items: list[tuple[str, str]], revealed: set[str], keys: list[str]):
    x0, y0, x1, y1 = box
    n = len(items)
    w = (x1 - x0 - 20 * (n - 1)) // n
    for i, ((title, body), key) in enumerate(zip(items, keys)):
        x = x0 + i * (w + 20)
        show = key in revealed or "*" in revealed
        bullet_card(d, (x, y0, x + w, y1), title, body, accent=TEAL, show=show)


def syringe(d, box, compress: float):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Compressing a gas", font=font("bold", 22), fill=WHITE)
    barrel = (x0 + 80, y0 + 90, x0 + 420, y1 - 70)
    d.rounded_rectangle(barrel, 16, outline=(200, 220, 235), width=4)
    travel = int(180 * compress)
    plunger_x = barrel[0] + 20 + travel
    d.rectangle((plunger_x, barrel[1] + 8, plunger_x + 18, barrel[3] - 8), fill=TEAL)
    d.rectangle((x0 + 40, (barrel[1] + barrel[3]) / 2 - 6, plunger_x, (barrel[1] + barrel[3]) / 2 + 6), fill=MUTED)
    room = (plunger_x + 26, barrel[1] + 12, barrel[2] - 12, barrel[3] - 12)
    rw, rh = room[2] - room[0], room[3] - room[1]
    for i in range(10):
        px = room[0] + (i * 53 + compress * 20) % max(20, rw - 12)
        py = room[1] + (i * 37) % max(16, rh - 12)
        particle(d, (px, py), 7, GAS)
    d.text((x0 + 24, y1 - 40), "Particles move closer  ·  volume decreases", font=font("medium", 18), fill=MUTED)


def perfume_room(d, box, t: float):
    x0, y0, x1, y1 = box
    card(d, box)
    d.text((x0 + 24, y0 + 16), "Diffusion", font=font("bold", 22), fill=WHITE)
    d.rounded_rectangle((x0 + 40, y0 + 70, x1 - 40, y1 - 40), 16, outline=LINE, width=2)
    spread = min(1.0, t / 8.0)
    for i in range(22):
        ang = i * 0.7
        r = 20 + spread * (90 + (i % 5) * 28)
        x = x0 + 120 + math.cos(ang + t * 0.4) * r
        y = (y0 + y1) / 2 + math.sin(ang + t * 0.35) * r * 0.55
        particle(d, (x, y), 6, PINK if i % 2 == 0 else ORANGE)
    d.text((x0 + 80, y1 - 64), "spray", font=font("medium", 16), fill=MUTED, anchor="mm")
