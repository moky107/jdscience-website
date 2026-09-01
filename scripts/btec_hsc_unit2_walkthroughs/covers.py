"""Shop cover images for BTEC Health and Social Care Unit 2 walkthroughs."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "content/lessons/_media"
OUT = ROOT / "content/shop/btec-hsc-unit2-walkthroughs"

COVER_W = 1600
COVER_H = 900
NAVY = (15, 23, 42)
CREAM = (248, 250, 252)
GOLD = (212, 175, 55)
PALE = (204, 251, 241)
WHITE = (255, 255, 255)
INK = (15, 23, 42)
TEAL = (0, 150, 136)
TEAL_DARK = (0, 77, 64)
MARK_COLOUR = (126, 34, 68)

COVERS = [
    ("june-2017", "June 2017", "Exam Walkthrough", TEAL_DARK),
    ("june-2018", "June 2018", "Exam Walkthrough", (0, 105, 92)),
    ("june-2019", "June 2019", "Exam Walkthrough", (6, 95, 70)),
    ("june-2022", "June 2022", "Exam Walkthrough", (15, 76, 92)),
    ("june-2023", "June 2023", "Exam Walkthrough", (30, 58, 95)),
    ("june-2024", "June 2024", "Exam Walkthrough", (0, 77, 64)),
    ("june-2025", "June 2025", "Exam Walkthrough", (0, 105, 92)),
    ("june-2025-mark-scheme", "June 2025", "Mark Scheme", MARK_COLOUR),
    ("january-2026", "January 2026", "Exam Walkthrough", (6, 95, 70)),
]


def _font(size: int, bold: bool = False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def ensure_logo() -> Path:
    logo = MEDIA / "jdscience-footer-logo.png"
    if logo.exists():
        return logo
    MEDIA.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, 159, 159), radius=28, fill=(0, 150, 136, 255))
    draw.text((80, 78), "JD", fill="white", font=_font(58, True), anchor="mm")
    img.save(logo)
    return logo


def draw_cover(folder: str, session: str, resource_type: str, colour: tuple[int, int, int]) -> Path:
    img = Image.new("RGB", (COVER_W, COVER_H), CREAM)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 18, COVER_H), fill=colour)
    draw.rectangle((0, 0, COVER_W, 96), fill=NAVY)
    draw.text((48, 28), "JDScience", font=_font(34, True), fill=GOLD)
    draw.text(
        (280, 38),
        "BTEC Level 3  ·  Health and Social Care  ·  Unit 2",
        font=_font(22),
        fill=PALE,
    )
    draw.text((48, 140), "Working in Health\nand Social Care", font=_font(52, True), fill=INK)
    draw.text((48, 300), f"{resource_type}  ·  {session}", font=_font(32, True), fill=colour)
    draw.text(
        (48, 360),
        "Paper 31491H  ·  Step-by-step command-word answers",
        font=_font(24),
        fill=TEAL,
    )
    draw.rounded_rectangle((48, COVER_H - 230, 760, COVER_H - 90), 16, fill=WHITE, outline=colour, width=3)
    draw.text((68, COVER_H - 210), "Digital download  ·  £10", font=_font(22, True), fill=colour)
    draw.text((68, COVER_H - 172), "Original JDScience exam walkthrough", font=_font(18), fill=INK)
    draw.text((68, COVER_H - 138), "Not the official Pearson paper or mark scheme", font=_font(16), fill=(71, 85, 105))
    draw.rectangle((0, COVER_H - 70, COVER_W, COVER_H), fill=NAVY)
    logo = Image.open(ensure_logo()).convert("RGBA").resize((46, 46))
    img.paste(logo, (40, COVER_H - 58), logo)
    draw.text(
        (98, COVER_H - 48),
        "jdscience.co.uk  ·  Produced by JDScience  ·  BTEC Health and Social Care",
        font=_font(18, True),
        fill=WHITE,
    )
    dest = OUT / folder
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / "cover.png"
    img.save(path, "PNG")
    return path


def build_all_covers() -> list[Path]:
    return [draw_cover(*item) for item in COVERS]


if __name__ == "__main__":
    for path in build_all_covers():
        print(path)
