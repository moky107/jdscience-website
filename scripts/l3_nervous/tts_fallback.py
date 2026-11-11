#!/usr/bin/env python3
"""Temporary British English narration after the ElevenLabs quota blocker.

Voice: Microsoft en-GB-RyanNeural (the authorised fallback already used on
JD Science chemical-changes lessons). Word timestamps drive slides.

Do not expand JD Science or GCSE into spelled letters. Keep the greeting
natural. Audio masters stay separate so the cloned voice can replace them.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_foundations.tts import audio_duration, chunk_text, concat_mp3
from l3_nervous.narration import BY_SLUG, LESSONS

VOICE = "en-GB-RyanNeural"
RATE = "-18%"
ENGINE = "edge-tts"
CHUNK_LIMIT = 2800


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
    chunks = chunk_text(lesson.spoken, CHUNK_LIMIT)
    print(f"{slug}: fallback-voice {VOICE} {len(lesson.spoken)} chars -> {len(chunks)} chunks")
    parts: list[Path] = []
    words: list[dict] = []
    offset = 0.0
    for i, chunk in enumerate(chunks):
        part = dest_dir / f"chunk_{i:02d}.mp3"
        print(f"  chunk {i + 1}/{len(chunks)} chars={len(chunk)}")
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
        print(f"    ok duration={duration:.2f}s words={len(chunk_words)}")
        time.sleep(0.2)
    mp3 = dest_dir / "narration_master.mp3"
    concat_mp3(parts, mp3)
    m4a = dest_dir / "narration_master.m4a"
    duration = audio_duration(m4a if m4a.exists() else mp3)
    transcript = {
        "slug": slug,
        "title": lesson.title,
        "audio": str(m4a if m4a.exists() else mp3),
        "duration": round(duration, 3),
        "full_text": lesson.spoken,
        "tts_text": lesson.spoken,
        "words": words,
        "chunks": len(chunks),
        "model": ENGINE,
        "voice": VOICE,
        "rate": RATE,
        "temporary_voice": True,
        "replace_with": "cloned-voice",
        "elevenlabs_blocker": (
            "Configured ELEVENLABS_VOICE_ID accepted a 2.6 s greeting, then "
            "HTTP 401 quota_exceeded: 4 credits remaining, 1545 required for "
            "the first lesson chunk. Documented clone id returned voice_not_found. "
            "voices_read is not permitted on the API key."
        ),
    }
    (dest_dir / "transcript.json").write_text(json.dumps(transcript, indent=2))
    (dest_dir / "voice.json").write_text(json.dumps({
        "engine": ENGINE,
        "voice": VOICE,
        "rate": RATE,
        "temporary": True,
        "notes": (
            "Authorised temporary British English male voice after ElevenLabs "
            "quota_exceeded. Replace with the JD Science clone without rebuilding cues."
        ),
    }, indent=2))
    print(f"{slug}: finished {duration:.2f}s -> {m4a if m4a.exists() else mp3}")
    return transcript


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(BY_SLUG), default=None)
    parser.add_argument("--out", type=Path, default=ROOT / "content/videos")
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    for slug in slugs:
        dest = args.out / slug / "source"
        if (dest / "transcript.json").exists() and (dest / "narration_master.mp3").exists():
            print(f"{slug}: already has transcript, skipping")
            continue
        generate_lesson(slug, dest)


if __name__ == "__main__":
    main()
