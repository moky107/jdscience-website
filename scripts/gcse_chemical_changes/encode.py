"""Duration-correct 1080p30 encoder for narrated chemical-changes lessons."""

from __future__ import annotations

import subprocess
from pathlib import Path

from gcse_chemical_changes import draw as chem_draw
from gcse_foundations.render import build_segments, navy
from jdscience_video.theme import FPS, TRANSITION

ANIM_FPS = 10


def _has_cursor(lesson: dict, t0: float, t1: float) -> bool:
    events = lesson.get("cursor") or []
    for ev in events:
        t = float(ev.get("t") or 0)
        if t0 - 0.05 <= t < t1 + 0.42 and ev.get("target"):
            return True
    return False


def encode_narrated(lesson: dict, audio: Path, dest: Path, work: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    work.mkdir(parents=True, exist_ok=True)
    segs = build_segments(lesson)
    fade_path = work / "navy.jpg"
    navy().save(fade_path, quality=90)
    entries: list[tuple[Path, float]] = []
    for i, seg in enumerate(segs):
        t0, t1 = seg["t0"], seg["t1"]
        duration = t1 - t0
        sid = seg["slide"]
        prev = segs[i - 1]["slide"] if i else sid
        if i and prev != sid and duration > TRANSITION:
            entries.append((fade_path, TRANSITION))
            duration -= TRANSITION
        animated = bool(seg["animated"] or _has_cursor(lesson, t0, t1))
        if animated:
            n = max(2, int(round(duration * ANIM_FPS)))
            for frame in range(n):
                local = t0 + frame * duration / n
                img = chem_draw.render_slide(lesson, sid, seg["revealed"], local)
                path = work / f"anim_{i:03d}_{frame:04d}.jpg"
                img.convert("RGB").save(path, quality=88)
                entries.append((path, duration / n))
            continue
        img = chem_draw.render_slide(lesson, sid, seg["revealed"], t0)
        path = work / f"still_{i:03d}.jpg"
        img.convert("RGB").save(path, quality=88)
        entries.append((path, duration))
    covered = sum(dur for _, dur in entries)
    if entries and covered < lesson["duration"]:
        path, dur = entries[-1]
        entries[-1] = (path, dur + (lesson["duration"] - covered))
    concat = work / "concat.txt"
    lines = []
    for path, dur in entries:
        lines.append(f"file '{path}'")
        lines.append(f"duration {dur:.4f}")
    lines.append(f"file '{entries[-1][0]}'")
    concat.write_text("\n".join(lines) + "\n")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-vf", f"fps={FPS},format=yuv420p",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{lesson['duration']:.3f}",
        "-movflags", "+faststart",
        str(dest),
    ]
    print("encoding", dest, "segments", len(segs), "duration", f"{lesson['duration']:.2f}s")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stderr[-4000:])
        raise SystemExit(f"ffmpeg failed for {dest.name}")
    print("wrote", dest)
