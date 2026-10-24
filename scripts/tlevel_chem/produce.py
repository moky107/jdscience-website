#!/usr/bin/env python3
"""Produce the A11.1 cloned-voice 1080p lesson from the original PDFs."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import gcse_foundations.render as foundations_render
from gcse_foundations.render import align, encode_lesson, write_srt
from gcse_foundations import tts as foundations_tts
from tlevel_chem import draw as tlevel_draw
from tlevel_chem.lessons import LESSONS
from tlevel_chem.narration import BY_SLUG

foundations_render.render_slide = tlevel_draw.render_slide


def generate_audio(slug: str, dest_dir: Path) -> dict:
    original = foundations_tts.BY_SLUG
    try:
        foundations_tts.BY_SLUG = BY_SLUG
        return foundations_tts.generate_lesson(slug, dest_dir)
    finally:
        foundations_tts.BY_SLUG = original


def srt_to_vtt(srt_text: str) -> str:
    body = srt_text.replace("\r\n", "\n").replace(",", ".", 0)
    body = srt_text.replace("\r\n", "\n")
    body = body.replace(",", ".")
    # Only convert timestamp commas, not caption commas: restore after a coarse pass.
    # Safer: convert HH:MM:SS,mmm only.
    import re
    body = srt_text.replace("\r\n", "\n")
    body = re.sub(r"(\d{2}:\d{2}:\d{2}),(\d{3})", r"\1.\2", body)
    return f"WEBVTT\n\n{body.strip()}\n"


def produce(slug: str, artifacts: Path, skip_tts: bool = False, video: bool = True) -> dict:
    script = BY_SLUG[slug]
    lesson = LESSONS[slug]
    source_dir = ROOT / "content/videos" / slug / "source"
    out_dir = ROOT / "content/videos" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    artifacts.mkdir(parents=True, exist_ok=True)

    transcript_path = source_dir / "transcript.json"
    if skip_tts and transcript_path.exists():
        transcript = json.loads(transcript_path.read_text())
    else:
        transcript = generate_audio(slug, source_dir)

    aligned = align(lesson, transcript)
    (out_dir / "timing_map.json").write_text(json.dumps({
        "slug": slug,
        "duration": aligned["duration"],
        "slides": [{k: s[k] for k in ("id", "t", "aligned", "cue") if k in s} for s in aligned["slides"]],
        "reveals": [{k: e[k] for k in ("slide", "item", "t", "aligned", "cue") if k in e} for e in aligned["reveals"]],
    }, indent=2))

    srt_name = script.filename.replace("-1080p.mp4", ".srt")
    srt_art = artifacts / srt_name
    srt_repo = out_dir / srt_name
    write_srt(aligned["words"], srt_art)
    write_srt(aligned["words"], srt_repo)
    vtt = srt_to_vtt(srt_repo.read_text())
    (out_dir / "captions.vtt").write_text(vtt)
    (artifacts / srt_name.replace(".srt", ".vtt")).write_text(vtt)

    qa = out_dir / "qa"
    qa.mkdir(exist_ok=True)
    for slide in aligned["slides"]:
        img = tlevel_draw.render_slide(aligned, slide["id"], ["*"], slide["t"])
        img.save(qa / f"{slide['id']}.png")

    dest = artifacts / script.filename
    if video:
        audio = Path(transcript["audio"])
        if not audio.exists():
            audio = source_dir / "narration_master.m4a"
        work = Path("/tmp/jdscience_tlevel") / slug
        encode_lesson(aligned, audio, dest, work)

    report = {
        "slug": slug,
        "title": script.title,
        "spec": script.spec,
        "duration": aligned["duration"],
        "aligned_slides": sum(1 for s in aligned["slides"] if s["aligned"]),
        "total_slides": len(aligned["slides"]),
        "aligned_reveals": sum(1 for e in aligned["reveals"] if e["aligned"]),
        "total_reveals": len(aligned["reveals"]),
        "opening": script.spoken.startswith("Hello and welcome back to JD Science."),
        "mp4": str(dest) if dest.exists() else None,
        "srt": str(srt_art),
    }
    (artifacts / f"{slug}-production-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    if report["aligned_slides"] < report["total_slides"]:
        print("WARNING: some slides did not align to audio cues")
    return report


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(LESSONS), default="a12-1-factors-affecting-rates")
    parser.add_argument("--out", type=Path, default=Path("/opt/cursor/artifacts"))
    parser.add_argument("--skip-tts", action="store_true")
    parser.add_argument("--no-video", action="store_true")
    args = parser.parse_args(argv)
    produce(args.slug, args.out, skip_tts=args.skip_tts, video=not args.no_video)


if __name__ == "__main__":
    main()
