"""JDScience GCSE Chemistry video theme — navy board, teal identity, 1920×1080."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "content/lessons/_media"
LOGO_PATH = MEDIA / "jdscience-footer-logo.png"
FONT_DIR = Path("/usr/share/fonts/truetype/macos")

W, H = 1920, 1080
FPS = 30
TRANSITION = 0.40

BG = (10, 23, 49)
TEAL = (46, 196, 206)
TEAL_BAR = (69, 208, 216)
TEAL_MID = (0, 150, 136)
NAVY_CARD = (18, 42, 72)
NAVY_ROW = (23, 52, 86)
INK = (244, 247, 251)
MUTED = (155, 180, 201)
GOLD = (232, 194, 71)
WHITE = (255, 255, 255)
LINE = (42, 92, 128)
GREEN = (94, 214, 165)
CURSOR = (255, 196, 64)
CURSOR_EDGE = (255, 248, 230)
STRAPLINE = "Learn Smarter. Revise Better. Achieve More."

SUB = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
SUP = str.maketrans("0123456789+-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻")


def subnum(n: str | int) -> str:
    return str(n).translate(SUB)


def supnum(n: str | int) -> str:
    return str(n).translate(SUP)


def chem(text: str) -> str:
    out: list[str] = []
    i = 0
    while i < len(text):
        if text[i].isdigit():
            j = i
            while j < len(text) and text[j].isdigit():
                j += 1
            out.append(subnum(text[i:j]))
            i = j
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


@lru_cache(maxsize=32)
def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    names = {
        "regular": "Inter-Regular.ttf",
        "medium": "Inter-Medium.ttf",
        "semibold": "Inter-SemiBold.ttf",
        "bold": "Inter-Bold.ttf",
    }
    path = FONT_DIR / names.get(weight, names["regular"])
    return ImageFont.truetype(str(path), size)


@lru_cache(maxsize=1)
def logo() -> Image.Image:
    if LOGO_PATH.exists():
        im = Image.open(LOGO_PATH).convert("RGBA")
        return im.resize((52, 52), Image.Resampling.LANCZOS)
    im = Image.new("RGBA", (52, 52), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 51, 51), 12, fill=TEAL_MID)
    d.text((26, 26), "JD", font=font("bold", 18), fill=WHITE, anchor="mm")
    return im


def new_canvas() -> Image.Image:
    return Image.new("RGB", (W, H), BG)


def draw_chrome(img: Image.Image, page: int, total: int, topic: str) -> ImageDraw.ImageDraw:
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 10), fill=TEAL_BAR)
    img.paste(logo(), (56, 28), logo())
    d.text((122, 38), "JD", font=font("bold", 22), fill=TEAL_BAR)
    d.text((156, 38), "SCIENCE", font=font("semibold", 22), fill=INK)
    d.rounded_rectangle((48, 96, W - 48, H - 72), 28, fill=NAVY_CARD, outline=LINE, width=2)
    d.rectangle((0, H - 56, W, H), fill=(7, 16, 34))
    d.text((56, H - 40), f"GCSE CHEMISTRY   ·   {topic.upper()}", font=font("medium", 16), fill=MUTED, anchor="lm")
    d.text((W - 56, H - 40), f"{page:02d}  /  {total:02d}", font=font("semibold", 16), fill=INK, anchor="rm")
    return d


def heading(d: ImageDraw.ImageDraw, title: str, subtitle: str) -> None:
    d.text((88, 124), title, font=font("bold", 48), fill=WHITE)
    d.text((88, 186), subtitle, font=font("regular", 24), fill=MUTED)


def row_rect(index: int, n: int = 4) -> tuple[int, int, int, int]:
    top = 240
    gap = 18
    available = (H - 72) - top - 28
    h = min(108, (available - gap * (n - 1)) // n)
    y = top + index * (h + gap)
    return 88, y, W - 88, y + h


def draw_row(d: ImageDraw.ImageDraw, box, fill=NAVY_ROW, accent=None) -> None:
    d.rounded_rectangle(box, 18, fill=fill)
    if accent:
        d.rectangle((box[0] + 6, box[1] + 14, box[0] + 14, box[3] - 14), fill=accent)


def hotspot(box, pad=8) -> dict:
    x0, y0, x1, y1 = box
    return {
        "x0": x0 - pad,
        "y0": y0 - pad,
        "x1": x1 + pad,
        "y1": y1 + pad,
        "cx": (x0 + x1) / 2,
        "cy": (y0 + y1) / 2,
    }


def measure_run(d, text, fnt):
    bbox = d.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]
