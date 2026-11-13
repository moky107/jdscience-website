#!/usr/bin/env python3
"""Clear, slower British English narration for the rates lesson.

ElevenLabs is configured but currently returns HTTP 401, so this uses the
authorised JD Science fallback voice. Word timestamps drive the slides.
The greeting is its own chunk so 'JD Science' is spoken as two words.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_foundations.tts import audio_duration, concat_mp3
from gcse_rates.narration import BY_SLUG, LESSONS

VOICE = "en-GB-RyanNeural"
RATE = "-12%"
ENGINE = "edge-tts"


async def _stream_chunk(text: str, dest: Path) -> list[dict]:
    import edge_tts

    dest.parent.mkdir(parents=True, exist_ok=True)
    last_error = None
    for attempt in range(4):
        audio = bytearray()
        words: list[dict] = []
        try:
            communicate = edge_tts.Communicate(
                text,
                VOICE,
                rate=RATE,
                boundary="WordBoundary",
            )
            async for chunk in communicate.stream():
                kind = chunk.get("type")
                if kind == "audio":
                    audio.extend(chunk["data"])
                elif kind == "WordBoundary":
                    start = float(chunk["offset"]) / 1e7
                    end = start + float(chunk["duration"]) / 1e7
                    token = str(chunk.get("text") or "").strip()
                    if token:
                        words.append({
                            "word": token,
                            "start": round(start, 3),
                            "end": round(end, 3),
                        })
            if len(audio) < 400:
                raise RuntimeError(f"TTS wrote {len(audio)} bytes")
            dest.write_bytes(bytes(audio))
            return words
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            if attempt < 3:
                await asyncio.sleep(2 * (2 ** attempt))
                continue
            raise RuntimeError(last_error) from exc
    raise RuntimeError(last_error or "TTS failed")


def synthesise_chunk(text: str, dest: Path) -> list[dict]:
    return asyncio.run(_stream_chunk(text, dest))


def generate_lesson(slug: str, dest_dir: Path) -> dict:
    lesson = BY_SLUG[slug]
    dest_dir.mkdir(parents=True, exist_ok=True)
    chunks = [p.strip() for p in lesson.spoken.split("\n\n") if p.strip()]
    print(f"{slug}: {VOICE} {len(lesson.spoken)} chars -> {len(chunks)} chunks, rate={RATE}")
    parts: list[Path] = []
    words: list[dict] = []
    offset = 0.0
    for i, chunk in enumerate(chunks):
        part = dest_dir / f"chunk_{i:02d}.mp3"
        print(f"  {i + 1}/{len(chunks)} chars={len(chunk)}")
        chunk_words = synthesise_chunk(chunk, part)
        duration = audio_duration(part)
        for w in chunk_words:
            words.append({
                "word": w["word"],
                "start": round(offset + w["start"], 3),
                "end": round(offset + w["end"], 3),
            })
        offset += duration
        parts.append(part)
        gap = 0.45 if i == 0 else 0.18
        silence = dest_dir / f"gap_{i:02d}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
             "-t", f"{gap:.2f}", "-c:a", "libmp3lame", "-q:a", "4", str(silence)],
            check=True, capture_output=True,
        )
        parts.append(silence)
        offset += gap
        print(f"    {duration:.2f}s words={len(chunk_words)}")
        time.sleep(0.12)
    mp3 = dest_dir / "narration_master.mp3"
    concat_mp3(parts, mp3)
    m4a = dest_dir / "narration_master.m4a"
    audio = m4a if m4a.exists() else mp3
    duration = audio_duration(audio)
    transcript = {
        "slug": slug,
        "title": lesson.title,
        "audio": str(audio),
        "duration": round(duration, 3),
        "full_text": lesson.spoken,
        "tts_text": lesson.spoken,
        "words": words,
        "chunks": len(chunks),
        "model": ENGINE,
        "voice": VOICE,
        "rate": RATE,
        "temporary_voice": True,
        "notes": "Slower British English so the intro and units are clear. Replace with the JD Science clone when ElevenLabs quota returns.",
    }
    (dest_dir / "transcript.json").write_text(json.dumps(transcript, indent=2) + "\n")
    (dest_dir / "voice.json").write_text(json.dumps({
        "engine": ENGINE,
        "voice": VOICE,
        "rate": RATE,
        "temporary": True,
        "notes": "Clearer, slower narration. Opening is a separate sentence: Hello and welcome back to JD Science.",
    }, indent=2) + "\n")
    print(f"{slug}: finished {duration:.2f}s -> {audio}")
    return transcript


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=[lesson.slug for lesson in LESSONS], default="rates-of-reaction")
    args = parser.parse_args(argv)
    dest = ROOT / "content/videos" / args.slug / "source"
    generate_lesson(args.slug, dest)


if __name__ == "__main__":
    main()
