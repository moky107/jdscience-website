#!/usr/bin/env python3
"""YouTube 1280×720 covers for GCSE Biology lessons."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.lessons import LESSONS
from gcse_biology.narration import LESSONS as SCRIPTS
from jdscience_video.theme import GOLD, MUTED, TEAL_BAR, WHITE, font, logo

NAVY = (10, 23, 49)


def youtube(dest: Path, spec: str, title: str, line: str) -> None:
    img = Image.new("RGB", (1280, 720), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1280, 14), fill=TEAL_BAR)
    mark = logo().resize((56, 56))
    img.paste(mark, (48, 36), mark)
    d.text((118, 46), "JD SCIENCE", font=font("bold", 28), fill=WHITE)
    d.text((118, 84), "GCSE BIOLOGY", font=font("semibold", 18), fill=TEAL_BAR)
    d.text((48, 200), spec, font=font("bold", 36), fill=GOLD)
    d.text((48, 250), title[:42], font=font("bold", 48 if len(title) > 28 else 56), fill=WHITE)
    d.text((48, 360), line, font=font("regular", 22), fill=MUTED)
    d.text((48, 640), "jdscience.co.uk", font=font("semibold", 22), fill=TEAL_BAR)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=92)


def main() -> None:
    art = Path("/opt/cursor/artifacts")
    for script in SCRIPTS:
        lesson = LESSONS[script.slug]
        dest = art / f"{script.slug}-youtube-cover.jpg"
        youtube(dest, script.spec, script.title, lesson["subtitle"])
        print("wrote", dest)


if __name__ == "__main__":
    main()
