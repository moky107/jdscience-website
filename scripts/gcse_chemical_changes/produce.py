#!/usr/bin/env python3
"""Produce six-stage GCSE Chemistry chemical-changes lessons.

Cloned-voice audio is the master clock. A short pause is inserted before the
model answer. Videos are 1920×1080, 30 fps, H.264/AAC. Silent drafts are never
published as completed lessons.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import gcse_foundations.render as foundations_render
from gcse_chemical_changes import draw as chem_draw
from gcse_chemical_changes.lessons import LESSONS
from gcse_chemical_changes.narration import BY_SLUG
from gcse_chemical_changes.spec import outcomes_for
from gcse_foundations import tts as foundations_tts
from gcse_foundations.render import align, write_srt
from jdscience_video.six_stage import evaluate_lesson, report_to_dict

foundations_render.render_slide = chem_draw.render_slide

PAUSE_SECONDS = 2.0
ART = Path("/opt/cursor/artifacts")
REPORTS = ROOT / "content/gcse-chemical-changes"


def probe(path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,avg_frame_rate,codec_name",
        "-show_entries", "format=duration,size",
        "-of", "json",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(proc.stdout)
    stream = data["streams"][0]
    rate = stream.get("avg_frame_rate") or "0/1"
    num, den = rate.split("/")
    fps = float(num) / float(den or 1)
    audio = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=codec_name,sample_rate", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    astream = (json.loads(audio.stdout).get("streams") or [{}])[0]
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "codec": stream["codec_name"],
        "vcodec": stream["codec_name"],
        "acodec": astream.get("codec_name"),
        "fps": round(fps, 3),
        "duration": float(data["format"]["duration"]),
        "size": int(data["format"]["size"]),
    }


def insert_pause(audio: Path, transcript: dict, pause_at: float, seconds: float = PAUSE_SECONDS) -> tuple[Path, dict]:
    """Insert a brief silence before the model answer and shift later word times."""
    wav = audio.parent / "narration_paused.wav"
    out_m4a = audio.parent / "narration_master.m4a"
    out_mp3 = audio.parent / "narration_master.mp3"
    # split, insert silence, concat
    before = audio.parent / "_before.wav"
    after = audio.parent / "_after.wav"
    silence = audio.parent / "_silence.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(audio), "-t", f"{pause_at:.3f}", "-ac", "1", "-ar", "44100", str(before)],
        check=True, capture_output=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(audio), "-ss", f"{pause_at:.3f}", "-ac", "1", "-ar", "44100", str(after)],
        check=True, capture_output=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono", "-t", f"{seconds:.3f}", str(silence)],
        check=True, capture_output=True,
    )
    concat = audio.parent / "_pause.txt"
    concat.write_text(f"file '{before}'\nfile '{silence}'\nfile '{after}'\n")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c:a", "pcm_s16le", str(wav)],
        check=True, capture_output=True,
    )
    subprocess.run(["ffmpeg", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "192k", str(out_m4a)], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "128k", str(out_mp3)], check=True, capture_output=True)
    words = []
    for w in transcript.get("words") or []:
        start = float(w["start"])
        end = float(w["end"])
        if start >= pause_at - 0.01:
            start += seconds
            end += seconds
        words.append({**w, "start": round(start, 3), "end": round(end, 3)})
    duration = float(transcript["duration"]) + seconds
    updated = {
        **transcript,
        "audio": str(out_m4a),
        "duration": round(duration, 3),
        "words": words,
        "pause_inserted_s": seconds,
        "pause_at": pause_at,
    }
    return out_m4a, updated


def generate_tts(slug: str, dest: Path) -> dict:
    original = foundations_tts.BY_SLUG
    try:
        foundations_tts.BY_SLUG = BY_SLUG
        return foundations_tts.generate_lesson(slug, dest)
    finally:
        foundations_tts.BY_SLUG = original


def produce(slug: str, artifacts: Path, skip_tts: bool = False, video: bool = True) -> dict:
    script = BY_SLUG[slug]
    lesson = LESSONS[slug]
    source = ROOT / "content/videos" / slug / "source"
    source.mkdir(parents=True, exist_ok=True)
    transcript_path = source / "transcript.json"
    if skip_tts and transcript_path.exists():
        transcript = json.loads(transcript_path.read_text())
    else:
        transcript = generate_tts(slug, source)
        transcript_path.write_text(json.dumps(transcript, indent=2))

    aligned = align(lesson, transcript)
    model_t = next((s["t"] for s in aligned["slides"] if s["id"] == "model"), None)
    audio = Path(transcript.get("audio") or (source / "narration_master.m4a"))
    if not audio.exists():
        audio = source / "narration_master.mp3"
    if model_t is not None and not transcript.get("pause_inserted_s"):
        audio, transcript = insert_pause(audio, transcript, model_t, PAUSE_SECONDS)
        transcript_path.write_text(json.dumps(transcript, indent=2))
        aligned = align(lesson, transcript)

    out_dir = ROOT / "content/videos" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "timing_map.json").write_text(json.dumps({
        "slug": slug,
        "duration": aligned["duration"],
        "slides": [{k: s[k] for k in ("id", "t", "aligned", "cue", "kind") if k in s} for s in aligned["slides"]],
        "reveals": [{k: e[k] for k in ("slide", "item", "t", "aligned", "cue") if k in e} for e in aligned["reveals"]],
    }, indent=2))
    srt = artifacts / f"jdscience-{slug}.srt"
    artifacts.mkdir(parents=True, exist_ok=True)
    write_srt(aligned["words"], srt)
    write_srt(aligned["words"], out_dir / f"jdscience-{slug}.srt")

    dest = artifacts / script.filename
    if video:
        work = Path("/tmp/jdscience_chemical_changes") / slug
        foundations_render.encode_lesson(aligned, audio, dest, work)
        info = probe(dest)
    else:
        info = {}

    aligned_slides = sum(1 for s in aligned["slides"] if s.get("aligned"))
    outcomes = outcomes_for(slug, script.spoken)
    report = evaluate_lesson(
        aligned,
        spoken=script.spoken,
        duration_s=float(aligned["duration"]),
        outcomes=outcomes,
        probe=info,
        aligned_slides=aligned_slides,
        aligned_total=len(aligned["slides"]),
    )
    payload = {
        **report_to_dict(report),
        "probe": info,
        "aligned_slides": aligned_slides,
        "aligned_total": len(aligned["slides"]),
        "aligned_reveals": sum(1 for e in aligned["reveals"] if e.get("aligned")),
        "reveals_total": len(aligned["reveals"]),
        "filename": script.filename,
        "tier": script.tier,
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "qa").mkdir(exist_ok=True)
    (REPORTS / "spec").mkdir(exist_ok=True)
    (REPORTS / "qa" / f"{slug}.json").write_text(json.dumps(payload, indent=2))
    (REPORTS / "spec" / f"{slug}.json").write_text(json.dumps({
        "slug": slug,
        "title": script.title,
        "spec_label": script.spec_label,
        "tier": script.tier,
        "outcomes": payload["spec"],
        "complete": report.complete,
    }, indent=2))
    print(json.dumps({"slug": slug, "complete": report.complete, "duration": aligned["duration"], "failures": report.failures}, indent=2))
    return payload


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(LESSONS), default=None)
    parser.add_argument("--skip-tts", action="store_true")
    parser.add_argument("--no-video", action="store_true")
    parser.add_argument("--out", type=Path, default=ART)
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else list(LESSONS)
    for slug in slugs:
        produce(slug, args.out, skip_tts=args.skip_tts, video=not args.no_video)


if __name__ == "__main__":
    main()
