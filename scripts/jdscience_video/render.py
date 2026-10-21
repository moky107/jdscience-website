#!/usr/bin/env python3
"""Render JDScience lesson videos. Original ElevenLabs audio is the master clock."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from copy import deepcopy
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video import transcribe as transcribe_mod
from jdscience_video.theme import BG, CURSOR, CURSOR_EDGE, FPS, H, TRANSITION, W
from jdscience_video.video_data import LESSONS, render_slide, revealed_at, slide_at

STUDIO_AUDIO = ROOT / "content/videos/studio/audio"


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def load_lesson(topic: str, duration_cap: float | None = None) -> dict:
    """Always use video_data.py — do not prefer a stale timing_map.json."""
    base = deepcopy(LESSONS[topic])
    if duration_cap is not None:
        base["duration"] = min(float(base["duration"]), duration_cap)
        base["slides"] = [s for s in base["slides"] if s["t"] < base["duration"]]
        base["reveals"] = [e for e in base["reveals"] if e["t"] < base["duration"]]
        base["cursor"] = [e for e in base["cursor"] if e["t"] < base["duration"]]
    return base


def write_timing_map(topic: str, lesson: dict, audio: Path | None, dest: Path) -> None:
    dest.write_text(json.dumps({
        "topic": topic,
        "title": lesson["title"],
        "audio": str(audio) if audio else None,
        "duration": lesson["duration"],
        "slides": lesson["slides"],
        "reveals": lesson["reveals"],
        "cursor": lesson["cursor"],
        "notes": (
            "Master clock is the original ElevenLabs narration. "
            "Slide cuts, reveals and cursor events use word-level timestamps."
        ),
    }, indent=2))
    print("wrote", dest)


class SlideCache:
    def __init__(self, lesson: dict) -> None:
        self.lesson = lesson
        self._cache: dict[tuple, tuple[Image.Image, dict]] = {}

    def get(self, slide_id: str, revealed: list[str], t: float) -> tuple[Image.Image, dict]:
        animate = slide_id in self.lesson.get("animate", {"intro", "concept"})
        key_t = round(t * 8) / 8 if animate else 0
        key = (slide_id, tuple(revealed), key_t)
        if key not in self._cache:
            self._cache[key] = render_slide(self.lesson, slide_id, revealed, t)
        return self._cache[key]


def cursor_state(lesson: dict, t: float) -> tuple[str | None, float]:
    events = lesson["cursor"]
    if not events:
        return None, 0.0
    current = events[0]
    nxt = None
    for i, ev in enumerate(events):
        if t + 1e-9 >= ev["t"]:
            current = ev
            nxt = events[i + 1] if i + 1 < len(events) else None
        else:
            nxt = ev
            break
    target = current.get("target")
    opacity = 1.0 if target else 0.0
    if nxt is not None:
        dt = t - current["t"]
        move = 0.38
        if dt < move:
            if target:
                opacity = ease(dt / move)
            else:
                opacity = 1.0 - ease(dt / move)
    return target, max(0.0, min(1.0, opacity))


def cursor_xy(lesson: dict, t: float, spots: dict) -> tuple[float, float, float, str | None]:
    events = lesson["cursor"]

    def pos_for(target, spots):
        if not target or target not in spots:
            return None
        hs = spots[target]
        return hs["cx"], hs["y1"] + 6

    last_pos = (W * 0.72, H * 0.62)
    last_t = 0.0
    last_target = None
    next_t = None
    known = last_pos
    for ev in events:
        p = pos_for(ev.get("target"), spots)
        if p is not None:
            known = p
        if ev["t"] <= t:
            last_t = ev["t"]
            last_target = ev.get("target")
            last_pos = p if p is not None else known
        else:
            next_t = ev["t"]
            break
    target, opacity = cursor_state(lesson, t)
    if next_t is None:
        return last_pos[0], last_pos[1], opacity, last_target
    dt = t - last_t
    move = 0.38
    if dt >= move:
        return last_pos[0], last_pos[1], opacity, last_target
    prev = last_pos
    seen = last_pos
    cur_pos = last_pos
    prev_had = False
    for ev in events:
        p = pos_for(ev.get("target"), spots)
        if p is not None:
            seen = p
        if ev["t"] < last_t - 1e-9:
            if p is not None:
                prev = p
                prev_had = True
            elif ev.get("target"):
                prev = seen
                prev_had = True
            else:
                prev_had = False
        elif abs(ev["t"] - last_t) < 1e-9:
            cur_pos = p if p is not None else seen
            break
    if not prev_had:
        return cur_pos[0], cur_pos[1], opacity, last_target
    k = ease(max(0.0, dt) / move)
    return lerp(prev[0], cur_pos[0], k), lerp(prev[1], cur_pos[1], k), opacity, last_target


def draw_highlight(base: Image.Image, spots: dict, target: str | None, alpha: float) -> Image.Image:
    if not target or target not in spots or alpha < 0.05:
        return base
    hs = spots[target]
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    pad = 8
    box = (hs["x0"] - pad, hs["y0"] - pad, hs["x1"] + pad, hs["y1"] + pad)
    d.rounded_rectangle(box, 12, fill=(232, 194, 71, int(28 * alpha)), outline=(232, 194, 71, int(210 * alpha)), width=2)
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def draw_cursor(base: Image.Image, x: float, y: float, alpha: float) -> Image.Image:
    if alpha < 0.04:
        return base
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    a = int(255 * alpha)
    tip, left, right = (x, y), (x - 11, y + 20), (x + 11, y + 20)
    d.polygon([(tip[0] + 2, tip[1] + 3), (left[0] + 2, left[1] + 3), (right[0] + 2, right[1] + 3)],
              fill=(0, 0, 0, int(80 * alpha)))
    d.polygon([tip, left, right], fill=(*CURSOR, a), outline=(*CURSOR_EDGE, a))
    d.ellipse((x - 7, y + 14, x + 7, y + 28), fill=(*CURSOR, a), outline=(*CURSOR_EDGE, a))
    d.ellipse((x - 3, y + 18, x + 3, y + 24), fill=(255, 255, 255, a))
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def frame_image(lesson: dict, t: float, cache: SlideCache) -> Image.Image:
    slide_id = slide_at(lesson, t)
    revealed = revealed_at(lesson, t, slide_id)
    img, spots = cache.get(slide_id, revealed, t)
    prev_t = None
    prev_id = None
    for s in lesson["slides"]:
        if s["id"] == slide_id:
            prev_t = s["t"]
            break
        prev_id = s["id"]
    if prev_id is not None and prev_t is not None:
        dt = t - prev_t
        if 0 <= dt < TRANSITION:
            prev_revealed = revealed_at(lesson, prev_t - 0.01, prev_id)
            prev_img, _ = cache.get(prev_id, prev_revealed, prev_t - 0.01)
            k = ease(dt / TRANSITION)
            navy = Image.new("RGB", (W, H), BG)
            img = Image.blend(prev_img, navy, k * 2) if k < 0.5 else Image.blend(navy, img, (k - 0.5) * 2)
            _, spots = cache.get(slide_id, revealed, t)
    target, opacity = cursor_state(lesson, t)
    x, y, opacity2, tgt = cursor_xy(lesson, t, spots)
    opacity = min(opacity, opacity2)
    if tgt and tgt not in spots:
        opacity = 0.0
        tgt = None
    img = draw_highlight(img, spots, tgt if opacity > 0.15 else None, opacity)
    if lesson.get("pointer", True):
        return draw_cursor(img, x, y, opacity)
    return img


def preview(lesson: dict, times: list[float], dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    cache = SlideCache(lesson)
    for t in times:
        t = min(t, lesson["duration"] - 0.05)
        img = frame_image(lesson, t, cache)
        path = dest / f"t_{t:07.2f}.png".replace(".", "p", 1)
        img.save(path)
        print("wrote", path)


def encode_video(lesson: dict, audio: Path | None, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cache = SlideCache(lesson)
    nframes = int(round(lesson["duration"] * FPS))
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
        "-i", "pipe:0",
    ]
    if audio and audio.exists():
        cmd += ["-i", str(audio), "-map", "0:v:0", "-map", "1:a:0"]
        if audio.suffix.lower() in {".m4a", ".aac", ".mp4"}:
            cmd += ["-c:a", "copy"]
        else:
            cmd += ["-c:a", "aac", "-b:a", "192k"]
    else:
        raise SystemExit(
            "Original ElevenLabs narration not found — refusing to encode a silent or placeholder track."
        )
    cmd += [
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
        "-t", f"{lesson['duration']:.3f}",
        "-movflags", "+faststart", "-shortest", str(dest),
    ]
    print("encoding", nframes, "frames ->", dest, "audio", audio)
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None
    try:
        for i in range(nframes):
            t = i / FPS
            proc.stdin.write(frame_image(lesson, t, cache).tobytes())
            if i % 300 == 0:
                print(f"  frame {i}/{nframes}  t={t:7.2f}s  slide={slide_at(lesson, t)}")
        proc.stdin.close()
        stderr = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr else ""
        rc = proc.wait()
        if rc != 0:
            print(stderr[-4000:])
            raise SystemExit(f"ffmpeg failed with {rc}")
        print("ffmpeg done")
    except BrokenPipeError:
        stderr = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr else ""
        print(stderr[-4000:])
        raise


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--topic", default="moles", choices=sorted(LESSONS))
    p.add_argument("--sample", action="store_true", help="render the first 60 seconds")
    p.add_argument("--video", action="store_true")
    p.add_argument("--preview", action="store_true")
    p.add_argument("--transcribe", action="store_true")
    args = p.parse_args(argv)
    topic = args.topic
    out = ROOT / "content/videos" / topic
    out.mkdir(parents=True, exist_ok=True)
    audio = transcribe_mod.find_audio(topic)
    if args.transcribe:
        if audio is None:
            raise SystemExit("Original ElevenLabs MP3 not found — cannot transcribe.")
        transcribe_mod.main(["--topic", topic, "--audio", str(audio)])
    if audio is None:
        raise SystemExit(
            f"Original ElevenLabs narration not found for {topic}. "
            f"Expected content/videos/{topic}/source/narration_master.m4a"
        )
    cap = 60.0 if args.sample else None
    lesson = load_lesson(topic, duration_cap=cap)
    map_path = out / "timing_map.json"
    write_timing_map(topic, load_lesson(topic), audio, map_path)
    if args.preview or args.video or args.sample:
        times = lesson.get("sample_qa_times" if args.sample else "qa_times") or [
            1.0, 6.0, 16.5, 21.0, 32.5, 50.0, 56.8,
        ]
        preview(lesson, times, out / "qa")
    if args.video or args.sample:
        name = f"jdscience-{topic}-60s-sample.mp4" if args.sample else f"jdscience-{topic}-1080p.mp4"
        encode_video(lesson, audio, out / name)
        print("wrote", out / name)


if __name__ == "__main__":
    main()
