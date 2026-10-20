"""Render the 1920×1080 30 fps empirical-formulae video from the timing map."""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from . import timing
from .slides import render_slide
from .theme import BG, CURSOR, CURSOR_EDGE, FPS, GOLD, H, TRANSITION, W, font

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "content/videos/empirical-formula"
QA_DIR = OUT_DIR / "qa"
SLIDE_DIR = OUT_DIR / "build" / "slides"


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


class SlideCache:
    def __init__(self) -> None:
        self._cache: dict[tuple, tuple[Image.Image, dict]] = {}

    def get(self, slide_id: str, revealed: list[str]) -> tuple[Image.Image, dict]:
        key = (slide_id, tuple(revealed))
        if key not in self._cache:
            img, spots = render_slide(slide_id, revealed)
            self._cache[key] = (img, spots)
        return self._cache[key]


def cursor_state(t: float) -> tuple[str | None, float]:
    """Return (target_id or None, opacity)."""
    events = timing.CURSOR
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
    # fade out if next is hide and we are close
    opacity = 1.0 if target else 0.0
    if nxt is not None:
        dt = t - current["t"]
        move = 0.38
        if dt < move:
            # arriving
            if target:
                opacity = ease(dt / move)
            else:
                opacity = 1.0 - ease(dt / move)
    return target, max(0.0, min(1.0, opacity))


def cursor_xy(t: float, spots: dict) -> tuple[float, float, float, str | None]:
    """Interpolate cursor position. Returns x, y, opacity, target id."""
    events = timing.CURSOR
    pts = []
    for ev in events:
        pts.append((ev["t"], ev.get("target")))

    def pos_for(target, spots):
        if not target or target not in spots:
            return None
        hs = spots[target]
        # Sit fully below the content so the pointer never covers numbers or formulae.
        return hs["cx"], hs["y1"] + 6

    # find surrounding events that have a locatable target, else keep last known
    last_pos = (W * 0.72, H * 0.55)
    last_t = 0.0
    last_target = None
    next_pos = None
    next_t = None
    next_target = None
    known = last_pos
    for ev in events:
        p = pos_for(ev.get("target"), spots)
        if p is not None:
            known = p
        if ev["t"] <= t:
            last_t = ev["t"]
            last_target = ev.get("target")
            if p is not None:
                last_pos = p
            else:
                last_pos = known
        else:
            next_t = ev["t"]
            next_target = ev.get("target")
            next_pos = p if p is not None else last_pos
            break

    target, opacity = cursor_state(t)
    if next_t is None:
        return last_pos[0], last_pos[1], opacity, last_target

    move = 0.38
    dt = t - last_t
    if dt >= move:
        x, y = last_pos
    else:
        # If the next event is still ahead of the move window, we stay on last_pos
        # Movement happens at the start of each event toward that event's target.
        x, y = last_pos
        if dt < move:
            # ease from previous last_pos... we already set last_pos to current target
            # Reconstruct previous position
            prev_pos = last_pos
            prev_known = (W * 0.72, H * 0.55)
            cur_pos = last_pos
            seen = prev_known
            prev = prev_known
            for ev in events:
                p = pos_for(ev.get("target"), spots)
                if p is not None:
                    seen = p
                if ev["t"] < last_t - 1e-9:
                    prev = p if p is not None else seen
                elif abs(ev["t"] - last_t) < 1e-9:
                    cur_pos = p if p is not None else seen
                    break
            k = ease(dt / move)
            x = lerp(prev[0], cur_pos[0], k)
            y = lerp(prev[1], cur_pos[1], k)
    return x, y, opacity, last_target


def draw_highlight(base: Image.Image, spots: dict, target: str | None, alpha: float) -> Image.Image:
    if not target or target not in spots or alpha < 0.05:
        return base
    hs = spots[target]
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    pad = 8
    box = (hs["x0"] - pad, hs["y0"] - pad, hs["x1"] + pad, hs["y1"] + pad)
    fill = (232, 194, 71, int(28 * alpha))
    outline = (232, 194, 71, int(210 * alpha))
    d.rounded_rectangle(box, 12, fill=fill, outline=outline, width=2)
    rgb = base.convert("RGBA")
    return Image.alpha_composite(rgb, overlay).convert("RGB")


def draw_cursor(base: Image.Image, x: float, y: float, alpha: float) -> Image.Image:
    if alpha < 0.04:
        return base
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    a = int(255 * alpha)
    # Small map-pin sitting under the target, tip pointing up at the content.
    tip = (x, y)
    left = (x - 11, y + 20)
    right = (x + 11, y + 20)
    d.polygon([(tip[0] + 2, tip[1] + 3), (left[0] + 2, left[1] + 3), (right[0] + 2, right[1] + 3)],
              fill=(0, 0, 0, int(80 * alpha)))
    d.polygon([tip, left, right], fill=(*CURSOR, a), outline=(*CURSOR_EDGE, a))
    d.ellipse((x - 7, y + 14, x + 7, y + 28), fill=(*CURSOR, a), outline=(*CURSOR_EDGE, a))
    d.ellipse((x - 3, y + 18, x + 3, y + 24), fill=(255, 255, 255, a))
    rgb = base.convert("RGBA")
    return Image.alpha_composite(rgb, overlay).convert("RGB")


def frame_image(t: float, cache: SlideCache) -> Image.Image:
    slide_id = timing.slide_at(t)
    revealed = timing.revealed_at(t, slide_id)
    img, spots = cache.get(slide_id, revealed)

    # Crossfade from previous slide
    prev_t = None
    prev_id = None
    for s in timing.SLIDES:
        if s["id"] == slide_id:
            prev_t = s["t"]
            break
        prev_id = s["id"]
    if prev_id is not None and prev_t is not None:
        dt = t - prev_t
        if 0 <= dt < TRANSITION:
            prev_revealed = timing.revealed_at(prev_t - 0.01, prev_id)
            prev_img, _ = cache.get(prev_id, prev_revealed)
            k = ease(dt / TRANSITION)
            navy = Image.new("RGB", (W, H), BG)
            # Fade through navy so titles never stack during a cut.
            if k < 0.5:
                img = Image.blend(prev_img, navy, k * 2)
            else:
                img = Image.blend(navy, img, (k - 0.5) * 2)

    target, opacity = cursor_state(t)
    x, y, opacity2, tgt = cursor_xy(t, spots)
    opacity = min(opacity, opacity2)
    # If target hotspot missing, do not invent a position — hide.
    if tgt and tgt not in spots:
        opacity = 0.0
        tgt = None
    img = draw_highlight(img, spots, tgt if opacity > 0.15 else None, opacity)
    img = draw_cursor(img, x, y, opacity)
    return img


def preview(times: list[float], dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    cache = SlideCache()
    for t in times:
        img = frame_image(t, cache)
        path = dest / f"t_{t:07.2f}.png".replace(".", "p", 1)
        img.save(path)
        print("wrote", path)


DEFAULT_PREVIEW = [
    1.0, 12.0, 21.0, 29.0, 38.0, 51.0, 58.0, 63.0, 76.0, 86.0, 91.0,
    101.5, 110.0, 120.0, 121.0, 127.0, 134.5, 139.5, 143.0,
    149.0, 162.5, 168.0, 172.0, 188.0, 203.0,
    220.0, 228.0, 247.5, 259.0, 270.0, 282.0, 286.5,
    301.0, 318.0, 326.0, 338.0, 355.0, 361.0, 375.0, 379.0,
]


def encode_video(audio: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cache = SlideCache()
    nframes = int(round(timing.DURATION * FPS))
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
        "-i", "pipe:0",
        "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
        "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(dest),
    ]
    print("encoding", nframes, "frames ->", dest)
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None
    try:
        for i in range(nframes):
            t = i / FPS
            img = frame_image(t, cache)
            proc.stdin.write(img.tobytes())
            if i % 300 == 0:
                print(f"  frame {i}/{nframes}  t={t:7.2f}s  slide={timing.slide_at(t)}")
        proc.stdin.close()
        stderr = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr else ""
        rc = proc.wait()
        if rc != 0:
            print(stderr[-4000:])
            raise SystemExit(f"ffmpeg failed with {rc}")
        print("ffmpeg done")
        if "error" in stderr.lower():
            print(stderr[-2000:])
    except BrokenPipeError:
        stderr = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr else ""
        print(stderr[-4000:])
        raise


def export_slide_stills(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    cache = SlideCache()
    for s in timing.SLIDES:
        # completed state just before next slide
        nxt = timing.DURATION
        for other in timing.SLIDES:
            if other["t"] > s["t"]:
                nxt = other["t"]
                break
        t = max(s["t"], nxt - 0.05)
        img, _ = cache.get(s["id"], timing.revealed_at(t, s["id"]))
        path = dest / f"{s['id']}.png"
        img.save(path)
        print("slide still", path)


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--preview", action="store_true")
    p.add_argument("--video", action="store_true")
    p.add_argument("--stills", action="store_true")
    p.add_argument("--timing-json", action="store_true")
    args = p.parse_args(argv)
    if args.timing_json:
        path = timing.write_map(OUT_DIR / "timing_map.json")
        print("wrote", path)
    if args.stills:
        export_slide_stills(SLIDE_DIR)
    if args.preview:
        preview(DEFAULT_PREVIEW, QA_DIR)
    if args.video:
        audio = OUT_DIR / "source" / "narration_master.wav"
        if not audio.exists():
            audio = OUT_DIR / "source" / "narration_master.mp3"
        encode_video(audio, OUT_DIR / "jdscience-empirical-formulae-1080p.mp4")
    if not any([args.preview, args.video, args.stills, args.timing_json]):
        p.print_help()


if __name__ == "__main__":
    main()
