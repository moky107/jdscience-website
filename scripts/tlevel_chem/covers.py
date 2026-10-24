#!/usr/bin/env python3
"""YouTube 1280×720 and TikTok 1080×1920 covers for A11.1."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.theme import GOLD, INK, MUTED, TEAL_BAR, WHITE, font, logo
from tlevel_chem.diagrams import collision_frame

TEAL_DARK = (0, 77, 64)
NAVY = (10, 23, 49)


def youtube(dest: Path) -> None:
    img = Image.new("RGB", (1280, 720), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1280, 14), fill=TEAL_BAR)
    mark = logo().resize((56, 56))
    img.paste(mark, (48, 36), mark)
    d.text((118, 46), "JD SCIENCE", font=font("bold", 28), fill=WHITE)
    d.text((118, 84), "T-LEVEL CHEMISTRY", font=font("semibold", 18), fill=TEAL_BAR)
    d.text((48, 200), "A11.1", font=font("bold", 36), fill=GOLD)
    d.text((48, 250), "Collision Theory", font=font("bold", 64), fill=WHITE)
    d.text((48, 340), "Activation energy  ·  orientation  ·  successful collisions", font=font("regular", 24), fill=MUTED)
    collision_frame(d, (720, 180, 1230, 640), 1.4, "right_orient")
    d.text((48, 640), "jdscience.co.uk", font=font("semibold", 22), fill=TEAL_BAR)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=92)
    print("wrote", dest)


def tiktok(dest: Path) -> None:
    img = Image.new("RGB", (1080, 1920), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1080, 18), fill=TEAL_BAR)
    mark = logo().resize((72, 72))
    img.paste(mark, (72, 80), mark)
    d.text((164, 92), "JD SCIENCE", font=font("bold", 36), fill=WHITE)
    d.text((164, 140), "T-LEVEL CHEMISTRY", font=font("semibold", 22), fill=TEAL_BAR)
    d.text((72, 280), "A11.1", font=font("bold", 48), fill=GOLD)
    d.text((72, 350), "Collision", font=font("bold", 88), fill=WHITE)
    d.text((72, 450), "Theory", font=font("bold", 88), fill=WHITE)
    d.text((72, 570), "Why most collisions fail", font=font("regular", 32), fill=MUTED)
    collision_frame(d, (80, 700, 1000, 1400), 1.4, "right_orient")
    d.rounded_rectangle((80, 1480, 1000, 1680), 24, fill=TEAL_DARK)
    d.text((540, 1540), "Energy + orientation", font=font("bold", 36), fill=WHITE, anchor="mm")
    d.text((540, 1600), "Watch the full lesson", font=font("regular", 26), fill=TEAL_BAR, anchor="mm")
    d.text((540, 1800), "jdscience.co.uk", font=font("semibold", 28), fill=GOLD, anchor="mm")
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, quality=92)
    print("wrote", dest)


def main() -> None:
    art = Path("/opt/cursor/artifacts")
    repo = ROOT / "content/tlevel-chemistry/a11-1"
    youtube(art / "a11-1-youtube-thumbnail.jpg")
    tiktok(art / "a11-1-tiktok-cover.jpg")
    youtube(repo / "youtube-thumbnail.jpg")
    tiktok(repo / "tiktok-cover.jpg")


if __name__ == "__main__":
    main()
