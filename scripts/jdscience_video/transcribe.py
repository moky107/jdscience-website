#!/usr/bin/env python3
"""Word-level Whisper transcription and cue alignment for a lesson MP3."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.video_data import LESSONS  # noqa: E402

AUDIO_DIRS = [
    ROOT / "content/videos/studio/audio",
    ROOT / "jdscience-video-studio/audio",
    ROOT / "audio",
]


def find_audio(topic: str) -> Path | None:
    """Prefer the original AAC extracted from the voice-verified MP4."""
    source = ROOT / "content/videos" / topic / "source"
    preferred = [
        source / "narration_master.m4a",
        source / "narration_master.mp3",
        ROOT / "content/videos/studio/audio" / f"{topic}.mp3",
    ]
    for path in preferred:
        if path.is_file():
            return path
    lesson = LESSONS[topic]
    names = lesson["audio_names"] + ("narration_master.mp3", "narration_master.m4a")
    extra = [
        source,
        ROOT / "content/videos/_inbox",
    ]
    search: list[Path] = []
    for folder in AUDIO_DIRS + extra:
        if folder.is_file():
            search.append(folder)
            continue
        if not folder.is_dir():
            continue
        for name in names:
            search.append(folder / name)
        search.extend(sorted(folder.glob("*.m4a")))
        search.extend(sorted(folder.glob("*.mp3")))
        search.extend(sorted(folder.glob("*.bin")))
    seen: set[Path] = set()
    needle = topic.replace("-", "")
    for path in search:
        if path in seen or not path.is_file():
            continue
        seen.add(path)
        lowered = path.name.lower().replace("-", "").replace("_", "")
        if needle in lowered or path.name in names:
            return path
        if topic == "moles" and "mole" in lowered:
            return path
    return None


def load_wav_16k(path: Path) -> np.ndarray:
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(path),
        "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1",
    ]
    proc = subprocess.run(cmd, check=True, capture_output=True)
    return np.frombuffer(proc.stdout, dtype=np.float32)


def transcribe(path: Path) -> dict:
    from faster_whisper import WhisperModel

    audio = load_wav_16k(path)
    duration = len(audio) / 16000.0
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    words: list[dict] = []
    full = []
    # Overlapping 25 s windows so VAD-less chunks do not drop mid-lesson speech.
    win, hop = 25.0, 20.0
    t0 = 0.0
    while t0 < duration:
        t1 = min(duration, t0 + win)
        a0, a1 = int(t0 * 16000), int(t1 * 16000)
        segments, _ = model.transcribe(
            audio[a0:a1],
            language="en",
            word_timestamps=True,
            vad_filter=False,
            beam_size=5,
        )
        for seg in segments:
            full.append(seg.text.strip())
            for w in seg.words or []:
                token = (w.word or "").strip()
                if not token:
                    continue
                words.append({
                    "word": token,
                    "start": round(t0 + float(w.start), 2),
                    "end": round(t0 + float(w.end), 2),
                    "prob": round(float(getattr(w, "probability", 0) or 0), 3),
                })
        t0 += hop
        if t1 >= duration:
            break
    words = _dedupe(words)
    return {
        "audio": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
        "duration": round(duration, 2),
        "full_text": " ".join(full),
        "words": words,
    }


def _dedupe(words: list[dict]) -> list[dict]:
    out = []
    for w in words:
        if out and abs(w["start"] - out[-1]["start"]) < 0.05 and _norm(w["word"]) == _norm(out[-1]["word"]):
            continue
        out.append(w)
    return out


def _norm(token: str) -> str:
    token = token.lower().replace("×", "x")
    token = re.sub(r"[^a-z0-9.]+", "", token)
    aliases = {
        "twelve": "12",
        "twentyfour": "24",
        "zero": "0",
        "point": ".",
        "five": "5",
        "na": "avogadro",
    }
    return aliases.get(token, token)


def find_cue(words: list[dict], cue: str | None) -> float | None:
    if not cue:
        return None
    needles = [_norm(p) for p in cue.replace("-", " ").split() if _norm(p)]
    if not needles:
        return None
    toks = [_norm(w["word"]) for w in words]
    n = len(needles)
    best = None
    for i in range(len(toks) - n + 1):
        if toks[i:i + n] == needles:
            return words[i]["start"]
        # Allow glued decimals: 0 . 5  vs 0.5
        joined = "".join(toks[i:i + n])
        if joined == "".join(needles):
            return words[i]["start"]
    # Fallback: first token only if unique-ish
    hits = [words[i]["start"] for i, tok in enumerate(toks) if tok == needles[0]]
    return hits[0] if len(hits) == 1 else best


def align_lesson(topic: str, transcript: dict) -> dict:
    lesson = LESSONS[topic]
    words = transcript["words"]
    slides = []
    for s in lesson["slides"]:
        t = find_cue(words, s.get("cue")) if s.get("cue") else s["t"]
        slides.append({**s, "t": t if t is not None else s["t"], "aligned": t is not None})
    slides = sorted(slides, key=lambda s: s["t"])
    reveals = []
    for ev in lesson["reveals"]:
        item = {**ev}
        # Reveals stay on their slide; keep relative order if cue missing.
        reveals.append(item)
    cursor = []
    for ev in lesson["cursor"]:
        t = find_cue(words, ev.get("cue")) if ev.get("cue") else ev["t"]
        cursor.append({**ev, "t": t if t is not None else ev["t"], "aligned": bool(ev.get("cue")) and t is not None})
    cursor = sorted(cursor, key=lambda e: e["t"])
    return {
        "topic": topic,
        "title": lesson["title"],
        "audio": transcript["audio"],
        "duration": transcript["duration"],
        "slides": slides,
        "reveals": reveals,
        "cursor": cursor,
        "full_text": transcript["full_text"],
        "words": words,
        "notes": (
            "Master clock is the original ElevenLabs recording. "
            "Slide cuts and cursor events use word-level timestamps. "
            "Unaligned cues keep their spoken-rate placeholder and the pointer stays hidden if the target is missing."
        ),
    }


def write_outputs(topic: str, data: dict) -> Path:
    dest = ROOT / "content/videos" / topic
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / "timing_map.json"
    path.write_text(json.dumps(data, indent=2))
    (dest / "source").mkdir(exist_ok=True)
    (dest / "source" / "transcript.json").write_text(json.dumps({
        "audio": data["audio"],
        "duration": data["duration"],
        "full_text": data["full_text"],
        "words": data["words"],
    }, indent=2))
    return path


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--topic", default="moles", choices=sorted(LESSONS))
    p.add_argument("--audio", type=Path, default=None)
    args = p.parse_args(argv)
    audio = args.audio or find_audio(args.topic)
    if audio is None:
        raise SystemExit(
            f"No {args.topic} MP3 found. Put the original ElevenLabs file in "
            "content/videos/studio/audio/ (moles.mp3) or content/videos/moles/source/."
        )
    print("audio", audio)
    tr = transcribe(audio)
    print("duration", tr["duration"], "words", len(tr["words"]))
    aligned = align_lesson(args.topic, tr)
    path = write_outputs(args.topic, aligned)
    print("timing map", path)


if __name__ == "__main__":
    main()
