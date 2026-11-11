#!/usr/bin/env python3
"""YouTube 1280×720 covers for GCSE Biology lessons."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.diagrams import DIAGRAMS
from gcse_biology.lessons import LESSONS
from gcse_biology.narration import LESSONS as SCRIPTS
from jdscience_video.theme import GOLD, MUTED, NAVY_CARD, TEAL_BAR, WHITE, font, logo

NAVY = (10, 23, 49)


def wrap_words(text: str, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if len(trial) <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def youtube(dest: Path, spec: str, title: str, line: str, diagram: str | None = None) -> None:
    img = Image.new("RGB", (1280, 720), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1280, 14), fill=TEAL_BAR)
    mark = logo().resize((56, 56))
    img.paste(mark, (48, 36), mark)
    d.text((118, 46), "JD SCIENCE", font=font("bold", 28), fill=WHITE)
    d.text((118, 84), "GCSE BIOLOGY", font=font("semibold", 18), fill=TEAL_BAR)

    title_width = 22 if len(title) > 36 else 28
    lines = wrap_words(title, title_width)[:4]
    size = 56 if len(lines) == 1 else 40 if len(lines) == 2 else 32
    d.text((48, 188), spec, font=font("bold", 36), fill=GOLD)
    y = 240
    for row in lines:
        d.text((48, y), row, font=font("bold", size), fill=WHITE)
        y += size + 6
    d.text((48, min(y + 18, 470)), line, font=font("regular", 22), fill=MUTED)
    d.text((48, 640), "jdscience.co.uk", font=font("semibold", 22), fill=TEAL_BAR)

    if diagram and diagram in DIAGRAMS:
        work = Image.new("RGB", (900, 520), NAVY_CARD)
        DIAGRAMS[diagram](ImageDraw.Draw(work), (12, 12, 888, 508), 4.0)
        img.paste(work.resize((500, 289), Image.Resampling.LANCZOS), (740, 200))

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=92)


def first_diagram(lesson: dict) -> str | None:
    return next((slide.get("diagram") for slide in lesson["slides"] if slide.get("diagram")), None)


def main() -> None:
    art = Path("/opt/cursor/artifacts")
    for script in SCRIPTS:
        lesson = LESSONS[script.slug]
        dest = art / f"{script.slug}-youtube-cover.jpg"
        youtube(dest, script.spec, script.title, lesson["subtitle"], first_diagram(lesson))
        print("wrote", dest)


if __name__ == "__main__":
    main()
