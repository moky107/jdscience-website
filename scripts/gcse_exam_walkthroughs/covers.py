"""Shop cover images for GCSE exam walkthrough packs."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .theme import OUT, TEAL, TEAL_DARK, ensure_logo

COVER_W = 1600
COVER_H = 900
NAVY = (15, 23, 42)
CREAM = (248, 250, 252)
GOLD = (212, 175, 55)
PALE = (204, 251, 241)
WHITE = (255, 255, 255)
INK = (15, 23, 42)

SUBJECT_COLOURS = {
    "Chemistry": (0, 77, 64),
    "Biology": (6, 95, 70),
    "Physics": (30, 58, 95),
    "Bundle": (0, 105, 92),
}


def _font(size: int, bold: bool = False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def draw_cover(subject: str, slug: str) -> Path:
    colour = SUBJECT_COLOURS.get(subject, (0, 105, 92))
    img = Image.new("RGB", (COVER_W, COVER_H), CREAM)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 18, COVER_H), fill=colour)
    draw.rectangle((0, 0, COVER_W, 96), fill=NAVY)
    draw.text((48, 28), "JDScience", font=_font(34, True), fill=GOLD)
    draw.text(
        (280, 38),
        f"GCSE/IGCSE  ·  {subject}  ·  Exam Walkthrough",
        font=_font(22),
        fill=PALE,
    )
    title = f"GCSE {subject}\nExam Walkthrough Pack" if subject != "Bundle" else "GCSE Science\nExam Walkthrough Bundle"
    draw.text((48, 140), title, font=_font(52, True), fill=INK)
    draw.text(
        (48, 320 if subject == "Bundle" else 280),
        "Step-by-step worked exam-style questions with full explanations",
        font=_font(26),
        fill=colour,
    )
    draw.rounded_rectangle((48, COVER_H - 230, 720, COVER_H - 90), 16, fill=WHITE, outline=colour, width=3)
    draw.text((68, COVER_H - 210), "Digital download", font=_font(22, True), fill=colour)
    draw.text((68, COVER_H - 172), "Original JDScience exam-style questions", font=_font(18), fill=INK)
    draw.text((68, COVER_H - 138), "Not copied from past papers", font=_font(16), fill=(71, 85, 105))
    draw.rectangle((0, COVER_H - 70, COVER_W, COVER_H), fill=NAVY)
    logo = Image.open(ensure_logo()).convert("RGBA").resize((46, 46))
    img.paste(logo, (40, COVER_H - 58), logo)
    draw.text(
        (98, COVER_H - 48),
        "jdscience.co.uk  ·  Produced by JDScience  ·  Specification-neutral GCSE Science",
        font=_font(18, True),
        fill=WHITE,
    )
    folder = OUT / slug
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "cover.png"
    img.save(path, "PNG")
    return path


def build_all_covers() -> list[Path]:
    return [
        draw_cover("Chemistry", "chemistry"),
        draw_cover("Biology", "biology"),
        draw_cover("Physics", "physics"),
        draw_cover("Bundle", "bundle"),
    ]
