#!/usr/bin/env python3
"""Produce the GCSE rates-of-reaction 1080p lesson."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import gcse_foundations.render as foundations_render
from gcse_foundations.render import align, encode_lesson
from gcse_rates import draw as rates_draw
from gcse_rates import tts_edge
from gcse_rates.lessons import LESSONS
from gcse_rates.narration import BY_SLUG

foundations_render.render_slide = rates_draw.render_slide
foundations_render.W = rates_draw.W
foundations_render.H = rates_draw.H


def _white_canvas():
    from PIL import Image
    return Image.new("RGB", (rates_draw.W, rates_draw.H), rates_draw.BG)


foundations_render.navy = _white_canvas


def srt_to_vtt(srt_text: str) -> str:
    body = re.sub(r"(\d{2}:\d{2}:\d{2}),(\d{3})", r"\1.\2", srt_text.replace("\r\n", "\n"))
    return f"WEBVTT\n\n{body.strip()}\n"


def write_srt(words: list[dict], dest: Path) -> None:
    """Caption cues follow spoken pauses so sentences are not split mid-thought."""

    def ts(sec: float) -> str:
        sec = max(0.0, sec)
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = sec % 60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

    cues: list[tuple[float, float, str]] = []
    buf: list[dict] = []
    start: float | None = None
    prev_end: float | None = None
    for w in words:
        gap = (float(w["start"]) - prev_end) if prev_end is not None else 0.0
        long = start is not None and float(w["end"]) - start >= 5.2
        many = len(buf) >= 12
        if buf and (gap >= 0.28 or long or many):
            cues.append((start or 0.0, float(buf[-1]["end"]), " ".join(x["word"] for x in buf)))
            buf, start = [], None
        if start is None:
            start = float(w["start"])
        buf.append(w)
        prev_end = float(w["end"])
    if buf and start is not None:
        cues.append((start, float(buf[-1]["end"]), " ".join(x["word"] for x in buf)))

    lines = []
    for i, (a, b, text) in enumerate(cues, 1):
        if b <= a:
            b = a + 0.4
        lines.append(f"{i}\n{ts(a)} --> {ts(b)}\n{text.strip()}\n")
    dest.write_text("\n".join(lines) + "\n")


def _hold_last_frame(path: Path, duration: float) -> None:
    """Image concat can drop the last still; freeze the final frame through the audio."""
    tmp = path.with_suffix(".padded.mp4")
    proc = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(path),
            "-vf", "tpad=stop_mode=clone:stop_duration=15",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "17", "-r", "30",
            "-c:a", "copy", "-t", f"{duration:.3f}", "-movflags", "+faststart",
            str(tmp),
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise SystemExit(proc.stderr[-2000:])
    tmp.replace(path)


def loudnorm_audio(src: Path) -> Path:
    dest = src.with_name(src.stem + "_loudnorm.m4a")
    proc = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
            "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "1",
            str(dest),
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise SystemExit(proc.stderr[-2000:])
    return dest


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
        transcript = tts_edge.generate_lesson(slug, source_dir)

    aligned = align(lesson, transcript)
    (out_dir / "timing_map.json").write_text(json.dumps({
        "slug": slug,
        "duration": aligned["duration"],
        "slides": [{k: s[k] for k in ("id", "t", "aligned", "cue") if k in s} for s in aligned["slides"]],
        "reveals": [{k: e[k] for k in ("slide", "item", "t", "aligned", "cue") if k in e} for e in aligned["reveals"]],
    }, indent=2) + "\n")

    srt_name = script.filename.replace("-1080p.mp4", ".srt")
    write_srt(aligned["words"], artifacts / srt_name)
    write_srt(aligned["words"], out_dir / srt_name)
    vtt = srt_to_vtt((out_dir / srt_name).read_text())
    (out_dir / "captions.vtt").write_text(vtt)
    (artifacts / srt_name.replace(".srt", ".vtt")).write_text(vtt)
    (out_dir / "narration-script.md").write_text(
        "# " + script.title + "\n\n" + script.spoken + "\n"
    )
    (out_dir / "transcript.txt").write_text(script.spoken + "\n")

    qa = out_dir / "qa"
    qa.mkdir(exist_ok=True)
    for slide in aligned["slides"]:
        img = rates_draw.render_slide(aligned, slide["id"], ["*"], slide["t"])
        img.save(qa / f"{slide['id']}.png")

    dest = artifacts / script.filename
    yt = artifacts / script.youtube_filename
    repo_mp4 = out_dir / script.filename
    if video:
        audio = Path(transcript["audio"])
        if not audio.exists():
            audio = source_dir / "narration_master.m4a"
        audio = loudnorm_audio(audio)
        work = Path("/tmp/jdscience_gcse_rates") / slug
        encode_lesson(aligned, audio, dest, work)
        _hold_last_frame(dest, aligned["duration"])
        if dest.exists():
            repo_mp4.write_bytes(dest.read_bytes())
            if dest.resolve() != yt.resolve():
                yt.write_bytes(dest.read_bytes())

    report = {
        "slug": slug,
        "title": script.title,
        "duration": aligned["duration"],
        "aligned_slides": sum(1 for s in aligned["slides"] if s["aligned"]),
        "total_slides": len(aligned["slides"]),
        "aligned_reveals": sum(1 for e in aligned["reveals"] if e["aligned"]),
        "total_reveals": len(aligned["reveals"]),
        "opening": script.spoken.startswith("Hello and welcome back to JD Science."),
        "jdscience_co_uk": "jdscience.co.uk" in script.spoken,
        "voice": transcript.get("voice"),
        "mp4": str(dest) if dest.exists() else None,
    }
    (artifacts / f"{slug}-production-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    if report["aligned_slides"] < report["total_slides"]:
        print("WARNING: some slides did not align to audio cues")
    return report


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", default="rates-of-reaction")
    parser.add_argument("--out", type=Path, default=Path("/opt/cursor/artifacts"))
    parser.add_argument("--skip-tts", action="store_true")
    parser.add_argument("--no-video", action="store_true")
    args = parser.parse_args(argv)
    produce(args.slug, args.out, skip_tts=args.skip_tts, video=not args.no_video)


if __name__ == "__main__":
    main()
