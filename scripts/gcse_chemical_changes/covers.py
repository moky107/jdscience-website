#!/usr/bin/env python3
"""YouTube 1280×720 thumbnails for the chemical-changes series."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_chemical_changes.narration import LESSONS
from jdscience_video.theme import GOLD, MUTED, TEAL_BAR, WHITE, font, logo

NAVY = (10, 23, 49)


def youtube(dest: Path, spec: str, title: str, line: str, tier: str) -> None:
    img = Image.new("RGB", (1280, 720), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1280, 14), fill=TEAL_BAR)
    mark = logo().resize((56, 56))
    img.paste(mark, (48, 36), mark)
    d.text((118, 46), "JD SCIENCE", font=font("bold", 28), fill=WHITE)
    d.text((118, 84), "GCSE CHEMISTRY", font=font("semibold", 18), fill=TEAL_BAR)
    d.text((48, 190), spec, font=font("bold", 28), fill=GOLD)
    size = 44 if len(title) > 32 else 54
    d.text((48, 240), title, font=font("bold", size), fill=WHITE)
    d.text((48, 360), line, font=font("regular", 22), fill=MUTED)
    if (tier or "") == "Higher Tier":
        d.rounded_rectangle((48, 430, 280, 478), 10, outline=GOLD, width=2)
        d.text((164, 454), "HIGHER TIER", font=font("bold", 16), fill=GOLD, anchor="mm")
    d.text((48, 640), "jdscience.co.uk", font=font("semibold", 22), fill=TEAL_BAR)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=92)


def write_all(art: Path) -> list[Path]:
    written = []
    for script in LESSONS:
        dest = art / f"{script.slug}-youtube-cover.jpg"
        youtube(dest, script.spec_label, script.title, script.subtitle, script.tier)
        repo = ROOT / "content/videos" / script.slug / "youtube-thumbnail.jpg"
        youtube(repo, script.spec_label, script.title, script.subtitle, script.tier)
        written.append(dest)
    return written


def main() -> None:
    art = Path("/opt/cursor/artifacts")
    for path in write_all(art):
        print("wrote", path)


if __name__ == "__main__":
    main()
