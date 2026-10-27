#!/usr/bin/env python3
"""Transcribe uploaded Biology narration MP4s with word timestamps."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.transcribe import load_wav_16k

AUDIO_DIR = Path("/tmp/bio-narration")
OUT_DIR = Path("/tmp/bio-transcripts")


def transcribe_once(path: Path) -> dict:
    """Single-pass word timestamps. Short uploaded recordings do not need overlapping windows."""
    from faster_whisper import WhisperModel

    audio = load_wav_16k(path)
    duration = len(audio) / 16000.0
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    words: list[dict] = []
    full: list[str] = []
    segments, _ = model.transcribe(
        audio,
        language="en",
        word_timestamps=True,
        vad_filter=False,
        beam_size=5,
    )
    for seg in segments:
        if seg.text.strip():
            full.append(seg.text.strip())
        for w in seg.words or []:
            token = (w.word or "").strip()
            if not token:
                continue
            words.append({
                "word": token,
                "start": round(float(w.start), 2),
                "end": round(float(w.end), 2),
                "prob": round(float(getattr(w, "probability", 0) or 0), 3),
            })
    return {
        "audio": str(path),
        "duration": round(duration, 2),
        "full_text": " ".join(full),
        "words": words,
        "method": "faster-whisper-small.en-single-pass",
    }

# Identical audio: only transcribe the pointer-review 1.3 file once.
SKIP = {"JDScience_1_3_Transport_in_Cells_Review_6415.m4a"}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in AUDIO_DIR.glob("*.m4a") if p.name not in SKIP)
    for path in files:
        dest = OUT_DIR / f"{path.stem}.json"
        print(f"transcribing {path.name}", flush=True)
        data = transcribe_once(path)
        dest.write_text(json.dumps(data, indent=2))
        preview = (data.get("full_text") or "")[:240].replace("\n", " ")
        print(f"  duration={data['duration']:.1f}s words={len(data['words'])} {preview}", flush=True)
    print("done", flush=True)


if __name__ == "__main__":
    main()
