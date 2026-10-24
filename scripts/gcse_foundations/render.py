#!/usr/bin/env python3
"""Align cues to cloned-voice audio and encode 1080p30 H.264/AAC videos plus SRT."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_foundations.draw import render_slide
from gcse_foundations.lessons import LESSONS
from jdscience_video.theme import BG, FPS, H, TRANSITION, W

ANIM_FPS = 12


def _pieces(text: str) -> list[str]:
    text = text.lower().replace("×", "x").replace("ᵩ", "f").replace("₂", "2")
    out: list[str] = []
    for part in re.split(r"[^a-z0-9]+", text):
        if not part:
            continue
        if part == "jd":
            out.extend(["j", "d"])
        elif part == "gcse":
            out.extend(["g", "c", "s", "e"])
        elif part in {"h2o", "htwo", "htwoo"}:
            out.extend(["h", "two", "o"])
        elif part in {"o2", "otwo"}:
            out.extend(["o", "two"])
        else:
            out.append(part)
    return out


def _needles(cue: str) -> list[str]:
    return _pieces(cue)


def flatten_words(words: list[dict]) -> list[dict]:
    flat = []
    for w in words:
        parts = _pieces(w["word"])
        for part in parts or [_norm_fallback(w["word"])]:
            if not part:
                continue
            flat.append({"word": part, "start": w["start"], "end": w["end"]})
    return flat


def _norm_fallback(token: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", token.lower())


def find_cue(words: list[dict], cue: str | None, after: float = 0.0) -> float | None:
    if not cue:
        return None
    needles = _needles(cue)
    if not needles:
        return None
    words = flatten_words(words)
    toks = [w["word"] for w in words]
    n = len(needles)
    for i in range(len(toks) - n + 1):
        if float(words[i]["start"]) + 0.02 < after:
            continue
        if toks[i:i + n] == needles:
            return float(words[i]["start"])
        if "".join(toks[i:i + n]) == "".join(needles):
            return float(words[i]["start"])
    for i in range(len(toks)):
        if float(words[i]["start"]) + 0.02 < after:
            continue
        j = 0
        k = i
        while j < n and k < len(toks) and k - i < n + 3:
            if toks[k] == needles[j]:
                j += 1
            k += 1
        if j == n:
            return float(words[i]["start"])
    return None


def align(lesson: dict, transcript: dict) -> dict:
    words = transcript["words"]
    slides = []
    last_t = 0.0
    for i, slide in enumerate(lesson["slides"]):
        t = find_cue(words, slide.get("cue"), after=max(0.0, last_t - 0.2))
        if t is None:
            t = last_t + (4.0 if i else 0.0)
            aligned = False
        else:
            aligned = True
        last_t = t
        slides.append({**slide, "t": round(t, 3), "aligned": aligned})
    reveals = []
    for ev in lesson["reveals"]:
        slide_t = next(s["t"] for s in slides if s["id"] == ev["slide"])
        t = find_cue(words, ev.get("cue"), after=slide_t)
        if t is None:
            t = slide_t + 1.2
            aligned = False
        else:
            t = max(t, slide_t + 0.12)
            aligned = True
        reveals.append({**ev, "t": round(t, 3), "aligned": aligned})
    return {
        **lesson,
        "duration": float(transcript["duration"]),
        "audio": transcript["audio"],
        "words": words,
        "full_text": transcript.get("full_text", ""),
        "slides": slides,
        "reveals": reveals,
    }


def slide_at(lesson: dict, t: float) -> str:
    current = lesson["slides"][0]["id"]
    for slide in lesson["slides"]:
        if t + 1e-9 >= slide["t"]:
            current = slide["id"]
        else:
            break
    return current


def revealed_at(lesson: dict, t: float, slide_id: str) -> list[str]:
    return [ev["item"] for ev in lesson["reveals"] if ev["slide"] == slide_id and t + 1e-9 >= ev["t"]]


def build_segments(lesson: dict) -> list[dict]:
    times = {0.0, lesson["duration"]}
    for slide in lesson["slides"]:
        times.add(float(slide["t"]))
    for ev in lesson["reveals"]:
        times.add(float(ev["t"]))
    marks = sorted(t for t in times if 0 <= t <= lesson["duration"] + 1e-6)
    segs = []
    for a, b in zip(marks, marks[1:]):
        if b - a < 0.04:
            continue
        sid = slide_at(lesson, a + 1e-3)
        segs.append({
            "t0": a,
            "t1": b,
            "slide": sid,
            "revealed": revealed_at(lesson, a + 1e-3, sid),
            "animated": sid in lesson.get("animate", set()),
        })
    return segs


def write_srt(words: list[dict], dest: Path) -> None:
    cues = []
    buf = []
    start = None
    for w in words:
        if start is None:
            start = float(w["start"])
        buf.append(w)
        long = float(w["end"]) - start >= 3.6
        many = len(buf) >= 12
        punct = w["word"].endswith((".", "?", "!"))
        if long or many or punct:
            cues.append((start, float(w["end"]), " ".join(x["word"] for x in buf)))
            buf, start = [], None
    if buf and start is not None:
        cues.append((start, float(buf[-1]["end"]), " ".join(x["word"] for x in buf)))

    def ts(sec: float) -> str:
        sec = max(0.0, sec)
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = sec % 60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

    lines = []
    for i, (a, b, text) in enumerate(cues, 1):
        if b <= a:
            b = a + 0.4
        lines.append(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n")
    dest.write_text("\n".join(lines) + "\n")


def navy() -> Image.Image:
    return Image.new("RGB", (W, H), BG)


def encode_lesson(lesson: dict, audio: Path, dest: Path, work: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    work.mkdir(parents=True, exist_ok=True)
    segs = build_segments(lesson)
    concat = work / "concat.txt"
    entries = []
    fade = navy()
    for i, seg in enumerate(segs):
        t0, t1 = seg["t0"], seg["t1"]
        duration = t1 - t0
        sid = seg["slide"]
        revealed = seg["revealed"]
        prev = segs[i - 1]["slide"] if i else sid
        if i and prev != sid and duration > TRANSITION:
            # short navy beat at the cut
            fade_path = work / "navy.png"
            if not fade_path.exists():
                fade.save(fade_path)
            entries.append((fade_path, min(TRANSITION, 0.35)))
            duration -= min(TRANSITION, 0.35)
        if not seg["animated"]:
            img = render_slide(lesson, sid, revealed, t0)
            path = work / f"still_{i:03d}.png"
            img.save(path)
            entries.append((path, duration))
            continue
        n = max(2, int(round(duration * ANIM_FPS)))
        for f in range(n):
            local = t0 + f / ANIM_FPS
            img = render_slide(lesson, sid, revealed, local)
            path = work / f"anim_{i:03d}_{f:04d}.png"
            img.save(path)
            entries.append((path, duration / n))
    covered = sum(dur for _, dur in entries)
    if entries and covered < lesson["duration"]:
        path, dur = entries[-1]
        entries[-1] = (path, dur + (lesson["duration"] - covered) + 0.25)
    # concat demuxer needs the last file repeated
    lines = []
    for path, dur in entries:
        lines.append(f"file '{path}'")
        lines.append(f"duration {dur:.4f}")
    if entries:
        lines.append(f"file '{entries[-1][0]}'")
    concat.write_text("\n".join(lines) + "\n")
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "17",
        "-r", str(FPS), "-vsync", "cfr",
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


def load_transcript(slug: str) -> dict:
    path = ROOT / "content/videos" / slug / "source" / "transcript.json"
    return json.loads(path.read_text())


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(LESSONS), default=None)
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--video", action="store_true")
    parser.add_argument("--out", type=Path, default=Path("/opt/cursor/artifacts"))
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else list(LESSONS)
    for slug in slugs:
        lesson = LESSONS[slug]
        transcript = load_transcript(slug)
        aligned = align(lesson, transcript)
        out_dir = ROOT / "content/videos" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "timing_map.json").write_text(json.dumps({
            "slug": slug,
            "duration": aligned["duration"],
            "slides": [{k: s[k] for k in ("id", "t", "aligned", "cue") if k in s} for s in aligned["slides"]],
            "reveals": [{k: e[k] for k in ("slide", "item", "t", "aligned", "cue") if k in e} for e in aligned["reveals"]],
        }, indent=2))
        write_srt(aligned["words"], args.out / f"jdscience-{slug}.srt")
        write_srt(aligned["words"], out_dir / f"jdscience-{slug}.srt")
        if args.preview:
            qa = out_dir / "qa"
            qa.mkdir(exist_ok=True)
            for slide in aligned["slides"]:
                img = render_slide(aligned, slide["id"], ["*"], slide["t"])
                img.save(qa / f"{slide['id']}.png")
                print("preview", qa / f"{slide['id']}.png")
        if args.video:
            audio = Path(transcript["audio"])
            if not audio.exists():
                audio = out_dir / "source" / "narration_master.m4a"
            work = Path("/tmp/jdscience_foundations") / slug
            dest = args.out / lesson["filename"]
            encode_lesson(aligned, audio, dest, work)
            # also keep a copy next to source metadata, not the huge working PNGs
            print("aligned slides", sum(1 for s in aligned["slides"] if s["aligned"]), "/", len(aligned["slides"]))
            print("aligned reveals", sum(1 for e in aligned["reveals"] if e["aligned"]), "/", len(aligned["reveals"]))


if __name__ == "__main__":
    main()
