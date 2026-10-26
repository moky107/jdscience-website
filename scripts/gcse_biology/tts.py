#!/usr/bin/env python3
"""Generate cloned-voice GCSE Biology narration. Never print secrets."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.narration import BY_SLUG, LESSONS
from gcse_foundations import tts as foundations_tts


def generate_lesson(slug: str, dest_dir: Path) -> dict:
    original = foundations_tts.BY_SLUG
    try:
        foundations_tts.BY_SLUG = BY_SLUG
        return foundations_tts.generate_lesson(slug, dest_dir)
    finally:
        foundations_tts.BY_SLUG = original


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(BY_SLUG), default=None)
    parser.add_argument("--out", type=Path, default=ROOT / "content/videos")
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    for slug in slugs:
        dest = args.out / slug / "source"
        transcript = dest / "transcript.json"
        mp3 = dest / "narration_master.mp3"
        if transcript.exists() and mp3.exists():
            print(f"{slug}: already has transcript, skipping")
            continue
        generate_lesson(slug, dest)


if __name__ == "__main__":
    main()
