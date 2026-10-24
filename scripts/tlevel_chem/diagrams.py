"""Collision-theory diagrams for A11.1."""

from __future__ import annotations

import math

from PIL import ImageDraw

from gcse_foundations.diagrams import card, text_block
from jdscience_video.theme import GOLD, GREEN, INK, LINE, MUTED, NAVY_ROW, TEAL, TEAL_BAR, WHITE, font

RED = (220, 80, 90)
BLUE = (70, 150, 220)
ORANGE = (232, 150, 72)


def molecule(d, xy, angle, scale=1.0, highlight="left"):
    x, y = xy
    dx = math.cos(angle) * 26 * scale
    dy = math.sin(angle) * 26 * scale
    left = (x - dx, y - dy)
    right = (x + dx, y + dy)
    r = int(18 * scale)
    a_fill = RED if highlight == "left" else BLUE
    b_fill = BLUE if highlight == "left" else RED
    d.ellipse((left[0] - r, left[1] - r, left[0] + r, left[1] + r), fill=a_fill, outline=WHITE, width=2)
    d.ellipse((right[0] - r, right[1] - r, right[0] + r, right[1] + r), fill=b_fill, outline=WHITE, width=2)
    d.line((left[0], left[1], right[0], right[1]), fill=WHITE, width=3)


def energy_bar(d, box, energy, ea, title="Collision energy"):
    x0, y0, x1, y1 = box
    card(d, box, fill=NAVY_ROW, accent=TEAL)
    d.text((x0 + 28, y0 + 16), title, font=font("semibold", 20), fill=WHITE)
    bx0, by0, bx1, by1 = x0 + 46, y0 + 56, x0 + 78, y1 - 28
    d.rounded_rectangle((bx0, by0, bx1, by1), 10, fill=(12, 28, 48), outline=LINE, width=2)
    max_e = max(ea * 1.4, energy * 1.1, 80)
    frac = max(0.0, min(1.0, energy / max_e))
    ea_frac = max(0.0, min(1.0, ea / max_e))
    top = by1 - (by1 - by0) * frac
    d.rectangle((bx0 + 4, top, bx1 - 4, by1 - 4), fill=TEAL_BAR if energy >= ea else ORANGE)
    ea_y = by1 - (by1 - by0) * ea_frac
    d.line((bx0 - 10, ea_y, bx1 + 48, ea_y), fill=GOLD, width=3)
    d.text((bx1 + 16, ea_y), f"Ea {ea:g}", font=font("semibold", 18), fill=GOLD, anchor="lm")
    d.text((x0 + 28, y1 - 22), f"{energy:g} kJ mol⁻¹", font=font("bold", 20), fill=INK if energy >= ea else ORANGE)


def collision_frame(d, box, t, mode: str):
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, 22, fill=NAVY_ROW, outline=LINE, width=2)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 10
    cycle = (t % 3.2) / 3.2
    span = (x1 - x0) / 2 - 80
    if cycle < 0.42:
        p = cycle / 0.42
        gap = span * (1 - p)
        hit = False
        bounce = 0
    elif cycle < 0.55:
        gap = 0
        hit = True
        bounce = 0
        p = 1
    else:
        p = (cycle - 0.55) / 0.45
        gap = span * min(1.0, p)
        hit = False
        bounce = 1

    success = mode in {"high", "right_orient"} and bounce
    fail_energy = mode == "low"
    fail_orient = mode == "wrong_orient"
    left_angle = 0.15 if mode != "wrong_orient" else 0.15
    right_angle = math.pi + 0.15 if mode != "wrong_orient" else 0.4
    if mode == "right_orient":
        left_angle, right_angle = 0.0, math.pi

    lx = cx - 40 - gap
    rx = cx + 40 + gap
    if bounce and (fail_energy or fail_orient):
        lx -= 8 * math.sin(p * math.pi)
        rx += 8 * math.sin(p * math.pi)
    molecule(d, (lx, cy), left_angle, 1.15, "left")
    molecule(d, (rx, cy), right_angle, 1.15, "right" if mode != "wrong_orient" else "left")

    if hit:
        d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), outline=GOLD, width=3)
    if success:
        d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), outline=GREEN, width=4)
        d.text((cx, y0 + 36), "Successful collision possible", font=font("bold", 24), fill=GREEN, anchor="mm")
    elif bounce and fail_energy:
        d.text((cx, y0 + 36), "Unsuccessful: energy too low", font=font("bold", 24), fill=ORANGE, anchor="mm")
    elif bounce and fail_orient:
        d.text((cx, y0 + 36), "Unsuccessful: wrong orientation", font=font("bold", 24), fill=ORANGE, anchor="mm")
    else:
        label = {
            "low": "Energy below Ea",
            "high": "Energy meets Ea",
            "wrong_orient": "Reactive sites miss",
            "right_orient": "Reactive sites meet",
        }.get(mode, "")
        d.text((cx, y0 + 36), label, font=font("semibold", 22), fill=TEAL_BAR, anchor="mm")
