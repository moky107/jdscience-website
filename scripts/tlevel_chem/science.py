"""Accurate scientific diagrams for T-Level Chemistry rate lessons."""

from __future__ import annotations

import math
import random

from PIL import ImageDraw

from gcse_foundations.diagrams import card, text_block
from jdscience_video.theme import GOLD, GREEN, INK, LINE, MUTED, NAVY_ROW, TEAL, TEAL_BAR, WHITE, font

ORANGE = (232, 150, 72)
RED = (220, 80, 90)
BLUE = (70, 150, 220)
VIOLET = (160, 120, 230)
SHADE_HI = (69, 208, 216, 70)
SHADE_LO = (232, 150, 72, 55)


def _mb(e: float, t: float) -> float:
    """Energy form of a Maxwell–Boltzmann-like distribution: f(E) ∝ √E e^{-E/T}."""
    if e <= 0 or t <= 0:
        return 0.0
    return math.sqrt(e) * math.exp(-e / t)


def mb_points(t: float, e_max: float, n: int = 160) -> list[tuple[float, float]]:
    xs = [e_max * i / (n - 1) for i in range(n)]
    ys = [_mb(x, t) for x in xs]
    area = sum((ys[i] + ys[i + 1]) * 0.5 * (xs[i + 1] - xs[i]) for i in range(n - 1))
    scale = 1.0 / area if area else 1.0
    return [(x, y * scale) for x, y in zip(xs, ys)]


def _to_xy(box, e, f, e_max, f_max):
    x0, y0, x1, y1 = box
    px = x0 + (e / e_max) * (x1 - x0)
    py = y1 - (f / f_max) * (y1 - y0)
    return px, py


def maxwell_boltzmann(
    d: ImageDraw.ImageDraw,
    box,
    *,
    temps: list[tuple[str, float, tuple[int, int, int]]],
    ea: float | None = None,
    extra_ea: float | None = None,
    shade_from: float | None = None,
    shade_color=TEAL_BAR,
    title: str = "Maxwell–Boltzmann distribution",
    show_axes: bool = True,
    highlight: str | None = None,
):
    """Draw one or two energy distributions with optional Ea thresholds."""
    x0, y0, x1, y1 = box
    card(d, box, fill=NAVY_ROW, accent=TEAL)
    plot = (x0 + 88, y0 + 72, x1 - 36, y1 - 64)
    px0, py0, px1, py1 = plot
    e_max = max(ea or 0, extra_ea or 0, 18) * 1.7
    series = [(label, colour, mb_points(t, e_max)) for label, t, colour in temps]
    f_max = max(f for _, _, pts in series for _, f in pts) * 1.08

    if show_axes:
        d.line((px0, py1, px1, py1), fill=LINE, width=3)
        d.line((px0, py0, px0, py1), fill=LINE, width=3)
        d.text((px1, py1 + 18), "particle energy →", font=font("semibold", 18), fill=MUTED, anchor="rt")
        d.text((px0 - 16, (py0 + py1) / 2), "number of\nparticles", font=font("semibold", 16), fill=MUTED, anchor="rm")

    def x_of(e):
        return px0 + (e / e_max) * (px1 - px0)

    if shade_from is not None:
        pts = series[0][2]
        poly = [(x_of(shade_from), py1)]
        for e, f in pts:
            if e >= shade_from:
                poly.append(_to_xy(plot, e, f, e_max, f_max))
        poly.append((px1, py1))
        if len(poly) > 3:
            d.polygon(poly, fill=(20, 70, 78) if shade_color == TEAL_BAR else (70, 48, 24))

    for label, colour, pts in series:
        coords = [_to_xy(plot, e, f, e_max, f_max) for e, f in pts]
        d.line(coords, fill=colour, width=5)
        peak = max(pts, key=lambda p: p[1])
        d.text(_to_xy(plot, peak[0], peak[1], e_max, f_max), label, font=font("bold", 18), fill=colour, anchor="mb")

    def ea_line(value, label, colour=GOLD):
        x = x_of(value)
        d.line((x, py0 + 8, x, py1), fill=colour, width=3)
        d.text((x, py0), label, font=font("bold", 16), fill=colour, anchor="mb")

    if ea is not None:
        ea_line(ea, "Ea" if extra_ea is None else "Ea uncatalysed", GOLD)
    if extra_ea is not None:
        ea_line(extra_ea, "Ea catalysed", GREEN)

    d.text((x0 + 24, y0 + 16), title, font=font("semibold", 20), fill=WHITE)
    if highlight:
        d.text((x1 - 24, y0 + 18), highlight, font=font("bold", 18), fill=TEAL_BAR, anchor="rt")


def particle_chamber(d, box, t: float, temp: str = "high", collisions: bool = True, title: str = ""):
    x0, y0, x1, y1 = box
    card(d, box, fill=NAVY_ROW, accent=TEAL if temp == "high" else ORANGE)
    inner = (x0 + 22, y0 + 56, x1 - 22, y1 - 22)
    d.rounded_rectangle(inner, 16, outline=LINE, width=2)
    speed = 2.4 if temp == "high" else 1.05
    n = 18
    rng = random.Random(11)
    seeds = [(rng.random(), rng.random(), rng.random(), rng.random()) for _ in range(n)]
    cx0, cy0, cx1, cy1 = inner
    w, h = cx1 - cx0 - 24, cy1 - cy0 - 24
    hits = 0
    for i, (sx, sy, vx, vy) in enumerate(seeds):
        px = cx0 + 12 + ((sx * w + t * speed * (40 + 80 * vx)) % w)
        py = cy0 + 12 + ((sy * h + t * speed * (30 + 70 * vy)) % h)
        r = 8 if temp == "high" else 9
        fill = TEAL_BAR if temp == "high" else ORANGE
        d.ellipse((px - r, py - r, px + r, py + r), fill=fill, outline=WHITE, width=1)
        if collisions and (int(t * 8 + i) % 11 == 0):
            d.ellipse((px - 16, py - 16, px + 16, py + 16), outline=GOLD, width=2)
            hits += 1
    d.text((x0 + 24, y0 + 16), title or ("Higher temperature" if temp == "high" else "Lower temperature"), font=font("bold", 20), fill=WHITE)
    d.text((x1 - 24, y0 + 18), "faster particles" if temp == "high" else "slower particles", font=font("semibold", 16), fill=TEAL_BAR if temp == "high" else ORANGE, anchor="rt")


def energy_profile(d, box, *, catalysed: bool, progress: float = 1.0, ea_uncat: float = 85, ea_cat: float = 52):
    x0, y0, x1, y1 = box
    card(d, box, fill=NAVY_ROW, accent=GREEN if catalysed else GOLD)
    plot = (x0 + 70, y0 + 70, x1 - 40, y1 - 50)
    px0, py0, px1, py1 = plot
    d.line((px0, py1, px1, py1), fill=LINE, width=3)
    d.line((px0, py0, px0, py1), fill=LINE, width=3)
    d.text((px1, py1 + 16), "reaction progress →", font=font("semibold", 16), fill=MUTED, anchor="rt")
    d.text((px0 - 12, py0), "energy", font=font("semibold", 16), fill=MUTED, anchor="rb")

    def curve(ea, colour, label):
        height = max(80, py1 - py0)
        peak_x = px0 + 0.42 * (px1 - px0)
        start_y = py1 - height * 0.22
        end_y = py1 - height * 0.38
        peak_span = height * (0.22 + 0.55 * (ea / max(ea_uncat, ea_cat, 1)))
        peak_y = max(py0 + 20, py1 - peak_span)
        pts = []
        for i in range(90):
            u = i / 89
            if u < 0.42:
                p = min(1.0, max(0.0, u / 0.42))
                x = px0 + p * (peak_x - px0)
                y = start_y + (peak_y - start_y) * (p ** 1.15)
            else:
                p = min(1.0, max(0.0, (u - 0.42) / 0.58))
                x = peak_x + p * (px1 - peak_x)
                ease = 1 - (1 - p) ** 1.4
                y = peak_y + (end_y - peak_y) * ease
            pts.append((int(x), int(y)))
        d.line(pts, fill=colour, width=5)
        mid_x = (px0 + 40 + peak_x) / 2
        mid_y = (start_y + peak_y) / 2
        d.text((mid_x, mid_y - 6), label, font=font("bold", 20), fill=colour, anchor="mm")
        d.text((px0 + 8, start_y - 8), "reactants", font=font("semibold", 16), fill=MUTED, anchor="lb")
        d.text((px1 - 8, end_y - 8), "products", font=font("semibold", 16), fill=MUTED, anchor="rb")

    curve(ea_uncat, GOLD, f"Ea {ea_uncat:g}")
    if catalysed:
        curve(ea_cat, GREEN, f"Ea {ea_cat:g}")
    d.text((x0 + 24, y0 + 16), "Energy profile", font=font("semibold", 20), fill=WHITE)
    d.text((x1 - 24, y0 + 18), "alternative lower-Ea pathway" if catalysed else "uncatalysed pathway", font=font("bold", 16), fill=GREEN if catalysed else GOLD, anchor="rt")


def causal_pills(d, box, items: list[tuple[str, str, bool]]):
    x0, y0, x1, y1 = box
    n = len(items)
    gap = 16
    w = (x1 - x0 - gap * (n - 1)) // n
    for i, (title, body, show) in enumerate(items):
        x = x0 + i * (w + gap)
        card(d, (x, y0, x + w, y1), accent=TEAL if show else LINE)
        if show:
            d.text((x + 18, y0 + 22), f"{i + 1}", font=font("bold", 22), fill=TEAL_BAR)
            d.text((x + 18, y0 + 56), title, font=font("bold", 22), fill=WHITE)
            text_block(d, (x + 18, y0 + 100), body, font("regular", 18), MUTED, w - 36)
        if i < n - 1 and show:
            d.polygon([(x + w + 2, (y0 + y1) / 2 - 8), (x + w + 14, (y0 + y1) / 2), (x + w + 2, (y0 + y1) / 2 + 8)], fill=TEAL_BAR)
