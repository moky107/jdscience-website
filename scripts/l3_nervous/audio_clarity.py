#!/usr/bin/env python3
"""Clarity EQ for muffled XTTS / OpenVoice clones on L3 nervous videos.

Raw zero-shot clones put most energy below 300 Hz and almost none in the
presence band, so consonants sound covered. This chain:
  - high-passes rumble
  - cuts mud around 200 Hz
  - restores body near 700 Hz
  - lifts presence (2.5–4.5 kHz)
  - light compress + loudnorm to -16 LUFS

Duration is preserved (no atempo) so slide cues stay valid.
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

from l3_nervous.narration import LESSONS

# Tuned against nerve-impulse-part-2 vs the clearer British fallback spectrum.
CLARITY_AF = (
    "highpass=f=110,"
    "equalizer=f=200:t=q:w=0.9:g=-8,"
    "equalizer=f=700:t=q:w=1.0:g=4,"
    "equalizer=f=2500:t=q:w=0.9:g=6,"
    "equalizer=f=4500:t=q:w=1.1:g=4,"
    "acompressor=threshold=-18dB:ratio=2.8:attack=4:release=70:makeup=2.5,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    )
    return float(out.strip())


def clarify_file(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Keep container/codec choices simple for remux sources.
    if dest.suffix.lower() in {".m4a", ".aac", ".mp4"}:
        run([
            "ffmpeg", "-y", "-i", str(src),
            "-af", CLARITY_AF,
            "-c:a", "aac", "-b:a", "192k", "-ac", "1", "-ar", "44100",
            str(dest),
        ])
    elif dest.suffix.lower() == ".mp3":
        run([
            "ffmpeg", "-y", "-i", str(src),
            "-af", CLARITY_AF,
            "-c:a", "libmp3lame", "-b:a", "192k", "-ac", "1", "-ar", "44100",
            str(dest),
        ])
    else:
        run([
            "ffmpeg", "-y", "-i", str(src),
            "-af", CLARITY_AF,
            "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le",
            str(dest),
        ])


def remux_lesson(slug: str, artifacts: Path | None = None) -> dict:
    lesson = next(lesson for lesson in LESSONS if lesson.slug == slug)
    video = ROOT / "content/videos" / slug / lesson.filename
    if not video.exists():
        raise FileNotFoundError(video)

    work = Path("/tmp/l3_clarity") / slug
    work.mkdir(parents=True, exist_ok=True)
    raw_wav = work / "raw.wav"
    clear_m4a = work / "clear.m4a"
    out_mp4 = work / lesson.filename

    run([
        "ffmpeg", "-y", "-i", str(video),
        "-vn", "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le",
        str(raw_wav),
    ])
    before = duration(raw_wav)
    clarify_file(raw_wav, clear_m4a)
    after = duration(clear_m4a)

    run([
        "ffmpeg", "-y",
        "-i", str(video),
        "-i", str(clear_m4a),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ac", "1", "-ar", "44100",
        "-shortest",
        str(out_mp4),
    ])
    video.write_bytes(out_mp4.read_bytes())

    source_dir = ROOT / "content/videos" / slug / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    master = source_dir / "narration_master.m4a"
    clarify_file(raw_wav, master)
    mp3 = source_dir / "narration_master.mp3"
    run(["ffmpeg", "-y", "-i", str(master), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)])

    voice_path = source_dir / "voice.json"
    if voice_path.exists():
        voice = json.loads(voice_path.read_text())
    else:
        voice = {}
    voice["clarity_eq"] = CLARITY_AF
    voice["clarity_notes"] = (
        "Post-process on the XTTS/OpenVoice clone: cut sub-300 Hz mud and "
        "lift 2.5–4.5 kHz presence so narration is intelligible."
    )
    voice_path.write_text(json.dumps(voice, indent=2) + "\n")

    if artifacts is not None:
        artifacts.mkdir(parents=True, exist_ok=True)
        (artifacts / lesson.filename).write_bytes(out_mp4.read_bytes())
        if lesson.youtube_filename != lesson.filename:
            (artifacts / lesson.youtube_filename).write_bytes(out_mp4.read_bytes())

    return {
        "slug": slug,
        "before_s": round(before, 3),
        "after_s": round(after, 3),
        "mp4": str(video),
        "master": str(master),
    }


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=[lesson.slug for lesson in LESSONS], default=None)
    parser.add_argument("--out", type=Path, default=Path("/opt/cursor/artifacts"))
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    reports = [remux_lesson(slug, args.out) for slug in slugs]
    (args.out / "clarity-eq-report.json").write_text(json.dumps(reports, indent=2) + "\n")
    print(json.dumps(reports, indent=2))


if __name__ == "__main__":
    main()
