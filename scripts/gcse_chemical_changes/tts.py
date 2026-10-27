#!/usr/bin/env python3
"""Generate cloned-voice GCSE Chemistry narration. Never print secrets."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_chemical_changes.narration import BY_SLUG, LESSONS
from gcse_foundations import tts as foundations_tts


def generate_lesson(slug: str, dest_dir: Path) -> dict:
    original = foundations_tts.BY_SLUG
    try:
        foundations_tts.BY_SLUG = BY_SLUG
        transcript = foundations_tts.generate_lesson(slug, dest_dir)
    finally:
        foundations_tts.BY_SLUG = original
    transcript["temporary_voice"] = False
    transcript["voice"] = "jd-science-clone"
    transcript["engine"] = foundations_tts.MODEL
    transcript.pop("replace_with", None)
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / "transcript.json").write_text(json.dumps(transcript, indent=2))
    (dest_dir / "voice.json").write_text(json.dumps({
        "engine": foundations_tts.MODEL,
        "voice": "jd-science-clone",
        "temporary": False,
        "notes": "JD Science cloned ElevenLabs voice. Ryan Neural masters stay under source/ryan-neural/.",
    }, indent=2))
    return transcript


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(BY_SLUG), default=None)
    parser.add_argument("--out", type=Path, default=ROOT / "content/videos")
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    for slug in slugs:
        generate_lesson(slug, args.out / slug / "source")


if __name__ == "__main__":
    main()
