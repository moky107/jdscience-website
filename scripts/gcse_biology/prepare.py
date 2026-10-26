#!/usr/bin/env python3
"""Prepare remaining GCSE Biology visuals without cloned-voice TTS.

Does not call ElevenLabs. Does not encode incomplete silent MP4s.
Does not replace 1.1 / 1.2 hosted lessons or their MP3/MP4 masters.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology import align as bio_align
from gcse_biology.covers import first_diagram, youtube
from gcse_biology.diagrams import DIAGRAMS
from gcse_biology.draw import render_slide
from gcse_biology.lessons import LESSONS
from gcse_biology.narration import LESSONS as SCRIPTS
from gcse_foundations.render import align
from jdscience_video.theme import FPS, TRANSITION, W, H

HOSTED = ("1-1-cell-division", "1-2-bacterial-growth")
# Cloned-voice clock from encoded 1.1 (127.7 s / 1672 chars) and 1.2 (118.0 s / 1788 chars).
SECONDS_PER_CHAR = ((127.7 / 1672) + (118.0 / 1788)) / 2
COMMON_TAGS = [
    "GCSE Biology",
    "AQA GCSE Biology",
    "JD Science",
    "GCSE revision",
    "science",
    "biology",
    "jdscience.co.uk",
]


def remaining_scripts():
    return [script for script in SCRIPTS if script.slug not in HOSTED]


def fake_transcript(spoken: str, duration: float) -> dict:
    tokens = re.findall(r"\S+", spoken)
    weights = [max(len(re.sub(r"[^A-Za-z0-9]+", "", tok)), 1) for tok in tokens]
    total = sum(weights) or 1
    t = 0.0
    words = []
    for tok, weight in zip(tokens, weights):
        dur = duration * weight / total
        words.append({"word": tok, "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur
    return {"words": words, "duration": round(duration, 3), "full_text": spoken, "audio": "pending-cloned-mp3"}


def aligned_plan(script) -> dict:
    bio_align.install()
    lesson = LESSONS[script.slug]
    duration = len(script.spoken) * SECONDS_PER_CHAR
    aligned = align(lesson, fake_transcript(script.spoken, duration))
    missed = [slide["id"] for slide in aligned["slides"] if not slide["aligned"]]
    missed += [f"{ev['slide']}:{ev['item']}" for ev in aligned["reveals"] if not ev["aligned"]]
    if missed:
        raise SystemExit(f"{script.slug}: cues did not match spoken script: {missed}")
    return aligned


def ts(seconds: float) -> str:
    seconds = max(0, int(seconds))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def youtube_record(script, aligned: dict) -> dict:
    chapters = "\n".join(
        f"{ts(slide['t'])} {slide.get('heading') or slide['kind'].title()}"
        for slide in aligned["slides"]
    )
    description = (
        f"{script.description}\n\n"
        f"Chapters (estimated from the teaching-edition script; lock to cloned-voice word times after TTS):\n"
        f"{chapters}\n\n"
        f"Exam-style question: {aligned['exam']['question']} [{aligned['exam']['marks']}]\n\n"
        "Subscribe to JD Science for more lessons.\n"
        "Further resources: https://www.jdscience.co.uk\n\n"
        "This lesson is part of the JD Science GCSE Biology series.\n"
        "Visibility: Unlisted until approved for Public."
    )
    tags = list(COMMON_TAGS)
    for extra in (script.title, script.subtitle, script.spec, aligned.get("tier") or ""):
        if extra and extra not in tags:
            tags.append(extra)
    return {
        "slug": script.slug,
        "youtube_title": f"GCSE Biology {script.spec} {script.title} | JD Science",
        "filename": script.youtube_filename,
        "privacy": "unlisted",
        "description": description,
        "tags": tags,
        "thumbnail": f"content/gcse-biology/covers/{script.slug}-youtube.jpg",
    }


def storyboard_for(script, aligned: dict) -> dict:
    source = ROOT / "content/videos" / script.slug / "source"
    has_mp3 = (source / "narration_master.mp3").exists()
    slides = []
    for i, slide in enumerate(aligned["slides"]):
        nxt = aligned["slides"][i + 1]["t"] if i + 1 < len(aligned["slides"]) else aligned["duration"]
        diagram = slide.get("diagram")
        if diagram and diagram not in DIAGRAMS:
            raise SystemExit(f"{script.slug}: missing diagram {diagram}")
        slides.append({
            "id": slide["id"],
            "page": slide["page"],
            "kind": slide["kind"],
            "cue": slide.get("cue"),
            "heading": slide.get("heading") or slide["kind"],
            "diagram": diagram,
            "t": slide["t"],
            "t_end": round(float(nxt), 3),
            "aligned": True,
            "animate": slide["id"] in aligned.get("animate", set()),
            "transition_in_s": 0.0 if i == 0 else TRANSITION,
            "highlights": [
                {"id": ev["item"], "cue": ev.get("cue"), "t": ev["t"]}
                for ev in aligned["reveals"] if ev["slide"] == slide["id"]
            ],
            "items": [
                {"id": key, "title": title, "body": body}
                for key, title, body in (slide.get("items") or [])
            ],
        })
    exam = aligned["exam"]
    answer = aligned["answer"]
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
        "estimated_duration_s": round(aligned["duration"], 1),
        "fps": FPS,
        "frame_size": [W, H],
        "transition_s": TRANSITION,
        "slide_count": len(slides),
        "slides": slides,
        "exam": {"marks": exam["marks"], "question": exam["question"]},
        "model_answer": answer["answer"],
        "opening": script.spoken.startswith("Hello and welcome back to JD Science."),
        "close_jdscience_co_uk": "jdscience.co.uk" in script.spoken,
        "gcse_spoken_as": "G C S E",
        "narration": "cloned_mp3" if has_mp3 else "ready_for_cloned_voice",
        "mp4": "not_rendered",
        "publication": "not_live",
        "sync": "cues match teaching-edition script via production aligner; swap fake clock for cloned-voice word times after TTS",
    }


def render_stills(script, dest: Path) -> list[Path]:
    lesson = LESSONS[script.slug]
    dest.mkdir(parents=True, exist_ok=True)
    written = []
    for slide in lesson["slides"]:
        img = render_slide(lesson, slide["id"], ["*"], 4.0)
        if img.size != (W, H):
            raise SystemExit(f"{script.slug} {slide['id']} is {img.size}, not {W}x{H}")
        path = dest / f"{slide['page']:02d}-{slide['id']}.jpg"
        img.convert("RGB").save(path, quality=86, optimize=True)
        written.append(path)
    return written


def contact_sheet(paths: list[Path], dest: Path) -> None:
    cols = 4
    rows = (len(paths) + cols - 1) // cols
    thumb_w, thumb_h = 480, 270
    sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h), (10, 23, 49))
    for i, path in enumerate(paths):
        im = Image.open(path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(im, ((i % cols) * thumb_w, (i // cols) * thumb_h))
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, quality=84, optimize=True)


def write_cover(script, dests: list[Path]) -> None:
    lesson = LESSONS[script.slug]
    diagram = first_diagram(lesson)
    for dest in dests:
        youtube(dest, script.spec, script.title, lesson["subtitle"], diagram)


def write_register(boards: list[dict], still_count: int) -> Path:
    lines = [
        "# GCSE Biology production register",
        "",
        "Remaining lessons are **ready for cloned-voice narration**. They are not complete videos until a 1080p MP4 is encoded against the cloned MP3.",
        "",
        "| Spec | Lesson | Slides | Cue sync | Narration | MP4 | YouTube | Site | Status |",
        "| --- | --- | ---: | --- | --- | --- | --- | --- | --- |",
        "| 1.1 | Cell Division | 12 | locked to cloned MP3 | cloned MP3 | 1080p checked | metadata unlisted | live | complete |",
        "| 1.2 | Bacterial Growth | 10 | locked to cloned MP3 | cloned MP3 | 1080p checked | metadata unlisted | live | complete |",
    ]
    for item in boards:
        lines.append(
            f"| {item['spec']} | {item['title']} | {item['slide_count']} | ready "
            f"| waiting for credits | not rendered | unlisted pack | unpublished | ready for narration |"
        )
    lines += [
        "",
        f"Prepared stills: {still_count} at 1920×1080. Transition: {TRANSITION:.2f}s. Frame rate: {FPS} fps.",
        "Do not publish unfinished videos. Keep YouTube Unlisted until approved for Public.",
        "Resume order after credits: start at `1-3-transport-in-cells`.",
        "",
        "YouTube titles stay under 100 characters. Tags and chapter lists are in `content/gcse-biology/youtube-metadata.json`.",
    ]
    path = ROOT / "content/gcse-biology/PRODUCTION_REGISTER.md"
    path.write_text("\n".join(lines) + "\n")
    return path


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifacts", type=Path, default=Path("/opt/cursor/artifacts"))
    parser.add_argument("--skip-stills", action="store_true")
    args = parser.parse_args(argv)

    remaining = remaining_scripts()
    boards = []
    youtube_rows = []
    still_count = 0
    timing_dir = ROOT / "content/gcse-biology/timing"
    timing_dir.mkdir(parents=True, exist_ok=True)

    for script in remaining:
        aligned = aligned_plan(script)
        board = storyboard_for(script, aligned)
        boards.append(board)
        youtube_rows.append(youtube_record(script, aligned))
        (timing_dir / f"{script.slug}.json").write_text(json.dumps({
            "slug": script.slug,
            "clock": "estimated_from_teaching_edition_until_cloned_mp3",
            "duration": aligned["duration"],
            "transition_s": TRANSITION,
            "fps": FPS,
            "slides": [{"id": s["id"], "t": s["t"], "t_end": nxt, "cue": s.get("cue"), "animate": s["id"] in aligned.get("animate", set())}
                       for s, nxt in zip(board["slides"], [x["t_end"] for x in board["slides"]])],
            "reveals": [{"slide": e["slide"], "item": e["item"], "t": e["t"], "cue": e.get("cue")} for e in aligned["reveals"]],
        }, indent=2) + "\n")
        if not args.skip_stills:
            stills = render_stills(script, args.artifacts / "biology-previs" / script.slug)
            still_count += len(stills)
            contact_sheet(stills, args.artifacts / "biology-contact" / f"{script.slug}.jpg")
            write_cover(
                script,
                [
                    args.artifacts / f"{script.slug}-youtube-cover.jpg",
                    ROOT / "content/gcse-biology/covers" / f"{script.slug}-youtube.jpg",
                ],
            )

    story_path = ROOT / "content/gcse-biology/storyboards.json"
    story_path.write_text(json.dumps({
        "series": "GCSE Biology",
        "hosted_cloned_voice_mp4": list(HOSTED),
        "remaining_ready_for_cloned_voice": [item["slug"] for item in boards],
        "lessons": boards,
    }, indent=2) + "\n")
    (ROOT / "content/gcse-biology/youtube-metadata.json").write_text(json.dumps(youtube_rows, indent=2) + "\n")
    register = write_register(boards, still_count)

    status = {
        "cloned_voice_can_generate_without_extra_credits": False,
        "elevenlabs_calls_this_run": 0,
        "hosted_live": list(HOSTED),
        "remaining_ready_for_cloned_voice": [item["slug"] for item in boards],
        "remaining_chars": sum(item["chars"] for item in boards),
        "cue_sync": "all remaining slide and reveal cues match the teaching-edition script",
        "storyboards": str(story_path),
        "youtube_metadata": str(ROOT / "content/gcse-biology/youtube-metadata.json"),
        "register": str(register),
        "previs_stills": still_count,
        "youtube_covers": 0 if args.skip_stills else len(remaining),
        "mp4s_rendered_this_run": [],
        "preserved_mp3": [
            "content/videos/1-1-cell-division/source/narration_master.mp3",
            "content/videos/1-2-bacterial-growth/source/narration_master.mp3",
        ],
    }
    (ROOT / "content/gcse-biology/production-status.json").write_text(json.dumps(status, indent=2) + "\n")
    (args.artifacts / "gcse-biology-remaining-status.json").write_text(json.dumps(status, indent=2) + "\n")
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
