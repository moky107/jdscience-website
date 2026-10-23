"""JD Science 1920×1080 drawing helpers for the physics energy series."""

from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.theme import (  # noqa: E402
    BG,
    GOLD,
    GREEN,
    INK,
    LINE,
    MUTED,
    NAVY_CARD,
    NAVY_ROW,
    TEAL,
    TEAL_BAR,
    TEAL_MID,
    WHITE,
    font,
    logo,
)

W, H = 1920, 1080
CORAL = (255, 150, 122)
BLUE = (126, 182, 236)
PURPLE = (186, 156, 236)
AMBER = (242, 186, 96)
RED = (232, 104, 112)
NAVY_DEEP = (12, 32, 58)

STORE_COLORS = {
    "chemical": AMBER,
    "kinetic": TEAL,
    "gpe": BLUE,
    "elastic": GREEN,
    "internal": CORAL,
    "magnetic": PURPLE,
    "electrostatic": (244, 214, 120),
    "nuclear": (255, 122, 154),
}


def new_canvas() -> Image.Image:
    return Image.new("RGB", (W, H), BG)


def text_width(text: str, fnt) -> float:
    return fnt.getlength(text)


def wrap(text: str, fnt, width: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    cur = words[0]
    for word in words[1:]:
        trial = f"{cur} {word}"
        if text_width(trial, fnt) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def rounded(d: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=2):
    d.rounded_rectangle(box, radius, fill=fill, outline=outline, width=width if outline else 1)


def chrome(
    img: Image.Image,
    footer: str,
    page: int,
    total: int,
    progress: float,
    video_n: int | None = None,
) -> ImageDraw.ImageDraw:
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 10), fill=(18, 70, 82))
    pw = int(max(0.0, min(1.0, progress)) * W)
    if pw > 0:
        d.rectangle((0, 0, pw, 10), fill=TEAL_BAR)
    img.paste(logo(), (56, 28), logo())
    d.text((122, 42), "JD", font=font("bold", 22), fill=TEAL_BAR, anchor="lm")
    d.text((158, 42), "SCIENCE", font=font("semibold", 22), fill=INK, anchor="lm")
    badge = f"UNIT 3  ·  VIDEO {video_n:02d}/12" if video_n else "UNIT 3  ·  ENERGY"
    d.rounded_rectangle((1390, 26, 1864, 62), 16, fill=NAVY_DEEP, outline=LINE, width=2)
    d.text((1627, 44), badge, font=font("semibold", 16), fill=TEAL_BAR, anchor="mm")
    rounded(d, (48, 96, W - 48, H - 72), 28, NAVY_CARD, LINE, 2)
    d.rectangle((0, H - 56, W, H), fill=(7, 16, 34))
    d.text((56, H - 28), f"GCSE PHYSICS   ·   {footer}", font=font("medium", 16), fill=MUTED, anchor="lm")
    d.text((W - 56, H - 28), f"{page:02d}  /  {total:02d}", font=font("semibold", 16), fill=INK, anchor="rm")
    return d


def heading(d, title: str, subtitle: str) -> int:
    fnt = font("bold", 44)
    lines = wrap(title, fnt, 1680)
    y = 118
    for line in lines[:2]:
        d.text((88, y), line, font=fnt, fill=WHITE)
        y += 52
    if subtitle:
        d.text((88, y + 4), subtitle, font=font("regular", 24), fill=MUTED)
        y += 40
    return y + 18


def card(d, box, fill=NAVY_ROW, accent=None, outline=None, radius=18, width=2):
    rounded(d, box, radius, fill, outline, width)
    if accent:
        d.rectangle((box[0] + 8, box[1] + 16, box[0] + 16, box[3] - 16), fill=accent)


def pill(d, xy, label, fill, text_fill=BG, size=18):
    fnt = font("bold", size)
    tw = text_width(label, fnt)
    x, y = xy
    box = (x, y, x + tw + 28, y + size + 16)
    rounded(d, box, 14, fill)
    d.text((x + 14, y + (size + 16) / 2), label, font=fnt, fill=text_fill, anchor="lm")
    return box


def draw_words(d, x, y, words, width, size, spoken_fill, future_fill, weight="regular", line_h=None):
    """Draw whitespace-separated tokens. `words` is a list of (token, spoken)."""
    fnt = font(weight, size)
    line_h = line_h or int(size * 1.35)
    cx, cy = x, y
    space = text_width(" ", fnt)
    max_y = y
    for token, spoken in words:
        tw = text_width(token, fnt)
        if cx > x and cx + tw > x + width:
            cx = x
            cy += line_h
        d.text((cx, cy), token, font=fnt, fill=spoken_fill if spoken else future_fill)
        cx += tw + space
        max_y = cy + line_h
    return max_y


def wrap_count(text: str, size: int, width: int, weight="regular") -> int:
    return max(1, len(wrap(text, font(weight, size), width)))


def arrow(d, x0, y0, x1, y1, color=TEAL, width=6):
    d.line((x0, y0, x1, y1), fill=color, width=width)
    ang = math.atan2(y1 - y0, x1 - x0)
    length = 16
    a1 = ang + 2.6
    a2 = ang - 2.6
    d.polygon(
        [
            (x1, y1),
            (x1 + length * math.cos(a1), y1 + length * math.sin(a1)),
            (x1 + length * math.cos(a2), y1 + length * math.sin(a2)),
        ],
        fill=color,
    )


def flow_dots(d, x0, y0, x1, y1, t, color=TEAL_BAR, n=3, radius=6):
    for i in range(n):
        p = (t * 0.45 + i / n) % 1.0
        x = x0 + (x1 - x0) * p
        y = y0 + (y1 - y0) * p
        d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)


def meter(d, x, y, w, h, frac, fill, label, value):
    frac = max(0.0, min(1.0, frac))
    rounded(d, (x, y, x + w, y + h), 10, (10, 28, 52))
    if frac > 0.01:
        rounded(d, (x, y, x + max(16, int(w * frac)), y + h), 10, fill)
    d.text((x, y - 28), label, font=font("medium", 18), fill=MUTED)
    d.text((x + w, y - 28), value, font=font("bold", 18), fill=WHITE, anchor="rt")


def pointer(d, x, y):
    d.ellipse((x - 16, y - 16, x + 16, y + 16), outline=GOLD, width=4)
    d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=GOLD)


def countdown(d, n: int):
    # Lower-right of the left panel: clear of lift diagrams and of the question text.
    cx, cy, r = 660, 840, 54
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=NAVY_DEEP, outline=GOLD, width=6)
    d.text((cx, cy - 6), str(n), font=font("bold", 42), fill=GOLD, anchor="mm")
    d.text((cx, cy + 78), "YOUR TURN", font=font("bold", 16), fill=GOLD, anchor="mm")


def spring(d, x, y, h, color=GREEN):
    pts = []
    coils = 5
    for i in range(coils * 2 + 1):
        px = x + (10 if i % 2 else -10)
        py = y + h * i / (coils * 2)
        pts.append((px, py))
    d.line(pts, fill=color, width=4)


def wheel(d, x, y, r=16, color=WHITE):
    d.ellipse((x - r, y - r, x + r, y + r), outline=color, width=4)
    d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=color)


def car(d, x, y, scale=1.0, color=TEAL):
    s = scale
    body = (x, y, x + 150 * s, y + 36 * s)
    rounded(d, body, int(12 * s), color)
    d.polygon(
        [
            (x + 28 * s, y),
            (x + 48 * s, y - 28 * s),
            (x + 108 * s, y - 28 * s),
            (x + 124 * s, y),
        ],
        fill=color,
    )
    d.polygon(
        [
            (x + 52 * s, y - 6 * s),
            (x + 64 * s, y - 22 * s),
            (x + 100 * s, y - 22 * s),
            (x + 112 * s, y - 6 * s),
        ],
        fill=(214, 240, 246),
    )
    wheel(d, x + 36 * s, y + 36 * s, 12 * s, WHITE)
    wheel(d, x + 116 * s, y + 36 * s, 12 * s, WHITE)


def turbine(d, cx, cy, t, r=70, color=TEAL):
    d.line((cx, cy + 18, cx, cy + r + 46), fill=MUTED, width=8)
    d.polygon([(cx - 28, cy + r + 46), (cx + 28, cy + r + 46), (cx + 14, cy + r + 18), (cx - 14, cy + r + 18)], fill=MUTED)
    ang = t * 2.4
    for i in range(3):
        a = ang + i * math.tau / 3
        x2 = cx + math.cos(a) * r
        y2 = cy + math.sin(a) * r * 0.92
        d.line((cx, cy, x2, y2), fill=color, width=10)
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=WHITE)


def sun(d, cx, cy, t, r=36):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=AMBER)
    for i in range(10):
        a = t * 0.6 + i * math.tau / 10
        x0 = cx + math.cos(a) * (r + 8)
        y0 = cy + math.sin(a) * (r + 8)
        x1 = cx + math.cos(a) * (r + 24)
        y1 = cy + math.sin(a) * (r + 24)
        d.line((x0, y0, x1, y1), fill=AMBER, width=4)


def flask(d, x, y, color=AMBER):
    d.polygon([(x, y), (x + 28, y), (x + 22, y + 18), (x + 36, y + 48), (x - 8, y + 48), (x + 6, y + 18)], outline=color, width=3)
    d.rectangle((x + 8, y - 8, x + 20, y + 2), outline=color, width=3)


def nucleus(d, x, y, color=(255, 122, 154)):
    d.ellipse((x, y, x + 34, y + 34), outline=color, width=3)
    d.ellipse((x + 8, y + 10, x + 16, y + 18), fill=color)
    d.ellipse((x + 16, y + 16, x + 24, y + 24), fill=TEAL)
    d.ellipse((x + 12, y + 20, x + 18, y + 26), fill=AMBER)
