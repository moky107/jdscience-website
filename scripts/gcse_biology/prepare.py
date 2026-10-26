#!/usr/bin/env python3
"""Prepare remaining GCSE Biology visuals without cloned-voice TTS.

Does not call ElevenLabs. Does not encode incomplete silent MP4s.
Does not replace 1.1 / 1.2 hosted lessons.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.covers import youtube
from gcse_biology.diagrams import DIAGRAMS
from gcse_biology.draw import render_slide
from gcse_biology.lessons import LESSONS
from gcse_biology.narration import BY_SLUG, LESSONS as SCRIPTS

HOSTED = ("1-1-cell-division", "1-2-bacterial-growth")
# Cloned-voice clock from encoded 1.1 (127.7 s / 1672 chars) and 1.2 (118.0 s / 1788 chars).
SECONDS_PER_CHAR = ((127.7 / 1672) + (118.0 / 1788)) / 2


def remaining_scripts():
    return [script for script in SCRIPTS if script.slug not in HOSTED]


def estimated_cue_time(spoken: str, cue: str) -> float | None:
    if not cue:
        return None
    hay = spoken.lower()
    needle = cue.lower().strip()
    idx = hay.find(needle)
    if idx < 0:
        words = needle.split()
        for n in range(min(6, len(words)), 2, -1):
            idx = hay.find(" ".join(words[:n]))
            if idx >= 0:
                break
    if idx < 0:
        return None
    return round(idx * SECONDS_PER_CHAR, 2)


def storyboard_for(script) -> dict:
    lesson = LESSONS[script.slug]
    source = ROOT / "content/videos" / script.slug / "source"
    has_mp3 = (source / "narration_master.mp3").exists()
    has_transcript = (source / "transcript.json").exists()
    slides = []
    missing_diagrams = []
    for slide in lesson["slides"]:
        diagram = slide.get("diagram")
        if diagram and diagram not in DIAGRAMS:
            missing_diagrams.append(diagram)
        slides.append({
            "id": slide["id"],
            "page": slide["page"],
            "kind": slide["kind"],
            "cue": slide.get("cue"),
            "heading": slide.get("heading") or slide["kind"],
            "diagram": diagram,
            "estimated_t": estimated_cue_time(script.spoken, slide.get("cue") or ""),
            "items": [
                {"id": key, "title": title, "body": body}
                for key, title, body in (slide.get("items") or [])
            ],
        })
    if missing_diagrams:
        raise SystemExit(f"{script.slug}: missing diagrams {missing_diagrams}")
    exam = lesson["exam"]
    answer = lesson["answer"]
    return {
        "slug": script.slug,
        "spec": script.spec,
        "title": script.title,
        "subtitle": script.subtitle,
        "tier": script.tier or "GCSE Biology",
        "filename": script.filename,
        "youtube_filename": script.youtube_filename,
        "youtube_title": f"GCSE Biology {script.spec} {script.title} | JD Science",
        "youtube_privacy": "unlisted",
        "description": script.description,
        "chars": len(script.spoken),
        "estimated_duration_s": round(len(script.spoken) * SECONDS_PER_CHAR, 1),
        "slide_count": len(slides),
        "slides": slides,
        "exam": {"marks": exam["marks"], "question": exam["question"]},
        "model_answer": answer["answer"],
        "opening": script.spoken.startswith("Hello and welcome back to JD Science."),
        "close_jdscience_co_uk": "jdscience.co.uk" in script.spoken,
        "narration": "cloned_mp3" if has_mp3 and has_transcript else "missing",
        "mp4": "not_rendered",
        "publication": "not_live",
    }


def render_stills(script, dest: Path) -> list[str]:
    lesson = LESSONS[script.slug]
    dest.mkdir(parents=True, exist_ok=True)
    written = []
    for slide in lesson["slides"]:
        img = render_slide(lesson, slide["id"], ["*"], 4.0)
        if img.size != (1920, 1080):
            raise SystemExit(f"{script.slug} {slide['id']} is {img.size}, not 1920x1080")
        path = dest / f"{slide['page']:02d}-{slide['id']}.jpg"
        img.convert("RGB").save(path, quality=86, optimize=True)
        written.append(str(path))
    return written


def write_cover(script, dests: list[Path]) -> None:
    lesson = LESSONS[script.slug]
    for dest in dests:
        dest.parent.mkdir(parents=True, exist_ok=True)
        youtube(dest, script.spec, script.title, lesson["subtitle"])


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifacts", type=Path, default=Path("/opt/cursor/artifacts"))
    parser.add_argument("--skip-stills", action="store_true")
    args = parser.parse_args(argv)

    remaining = remaining_scripts()
    boards = [storyboard_for(script) for script in remaining]
    story_path = ROOT / "content/gcse-biology/storyboards.json"
    story_path.write_text(json.dumps({
        "series": "GCSE Biology",
        "hosted_cloned_voice_mp4": list(HOSTED),
        "remaining_without_narration": [item["slug"] for item in boards],
        "lessons": boards,
    }, indent=2) + "\n")

    still_count = 0
    if not args.skip_stills:
        for script in remaining:
            stills = render_stills(script, args.artifacts / "biology-previs" / script.slug)
            still_count += len(stills)
            write_cover(
                script,
                [
                    args.artifacts / f"{script.slug}-youtube-cover.jpg",
                    ROOT / "content/gcse-biology/covers" / f"{script.slug}-youtube.jpg",
                ],
            )

    status = {
        "cloned_voice_can_generate_without_extra_credits": False,
        "reason": "ElevenLabs quota_exceeded on cloned-voice TTS; remaining credits cannot cover one lesson chunk.",
        "hosted_live": list(HOSTED),
        "remaining_missing_narration": [item["slug"] for item in boards],
        "remaining_chars": sum(item["chars"] for item in boards),
        "storyboards": str(story_path),
        "previs_stills": still_count,
        "youtube_covers": 0 if args.skip_stills else len(remaining),
        "mp4s_rendered_this_run": [],
    }
    (ROOT / "content/gcse-biology/production-status.json").write_text(json.dumps(status, indent=2) + "\n")
    (args.artifacts / "gcse-biology-remaining-status.json").write_text(json.dumps(status, indent=2) + "\n")
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
