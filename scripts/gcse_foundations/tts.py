#!/usr/bin/env python3
"""Generate cloned-voice narration with ElevenLabs timestamps. Never print secrets."""

from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_foundations.narration import BY_SLUG, LESSONS

CHUNK_LIMIT = 3800
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {
    "stability": 0.50,
    "similarity_boost": 0.82,
    "style": 0.0,
    "use_speaker_boost": True,
    "speed": 0.98,
}


def _secrets() -> tuple[str, str]:
    key = (os.environ.get("ELEVENLABS_API_KEY") or "").strip()
    voice = (os.environ.get("ELEVENLABS_VOICE_ID") or "").strip()
    if not key or not voice:
        raise SystemExit("ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is missing.")
    return key, voice


def sanitize(text: str, key: str, voice: str) -> str:
    for secret in (key, voice):
        if secret:
            text = text.replace(secret, "[REDACTED]")
    return text


def chunk_text(text: str, limit: int = CHUNK_LIMIT) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current: list[str] = []
    size = 0
    for para in paragraphs:
        extra = len(para) + (2 if current else 0)
        if current and size + extra > limit:
            chunks.append("\n\n".join(current))
            current = [para]
            size = len(para)
        else:
            current.append(para)
            size += extra
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def _request_id(headers) -> str | None:
    for name in ("request-id", "xi-request-id", "x-request-id"):
        value = headers.get(name)
        if value:
            return value
    return None


def tts_chunk(key: str, voice: str, text: str, previous: list[str], previous_text: str, next_text: str) -> dict:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
    payload = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": VOICE_SETTINGS,
        "apply_text_normalization": "on",
    }
    if previous:
        payload["previous_request_ids"] = previous[-3:]
    elif previous_text:
        payload["previous_text"] = previous_text
    if next_text:
        payload["next_text"] = next_text
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "xi-api-key": key,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    last_error = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                raw = resp.read()
                request_id = _request_id(resp.headers)
            data = json.loads(raw)
            audio_b64 = data.get("audio_base64")
            if not audio_b64:
                raise RuntimeError("TTS response had no audio_base64")
            audio = base64.b64decode(audio_b64)
            alignment = data.get("normalized_alignment") or data.get("alignment") or {}
            if not request_id:
                request_id = data.get("request_id")
            return {
                "audio": audio,
                "alignment": alignment,
                "request_id": request_id,
                "text": text,
            }
        except urllib.error.HTTPError as exc:
            err = sanitize(exc.read().decode("utf-8", errors="replace"), key, voice)
            last_error = f"HTTP {exc.code}: {err[:500]}"
            if exc.code in {429, 500, 502, 503} and attempt < 3:
                time.sleep(4 * (2 ** attempt))
                continue
            raise RuntimeError(last_error) from exc
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = sanitize(str(exc), key, voice)
            if attempt < 3:
                time.sleep(4 * (2 ** attempt))
                continue
            raise RuntimeError(last_error) from exc
    raise RuntimeError(last_error or "TTS failed")


def words_from_alignment(alignment: dict, offset: float) -> list[dict]:
    chars = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    words: list[dict] = []
    buf = []
    w_start = None
    w_end = None
    for ch, start, end in zip(chars, starts, ends):
        if ch.isspace() or ch == "\n":
            if buf:
                words.append({
                    "word": "".join(buf),
                    "start": round(offset + (w_start or 0), 3),
                    "end": round(offset + (w_end or 0), 3),
                })
                buf, w_start, w_end = [], None, None
            continue
        if w_start is None:
            w_start = float(start)
        w_end = float(end)
        buf.append(ch)
    if buf:
        words.append({
            "word": "".join(buf),
            "start": round(offset + (w_start or 0), 3),
            "end": round(offset + (w_end or 0), 3),
        })
    return words


def audio_duration(path: Path) -> float:
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(proc.stdout.strip())


def concat_mp3(parts: list[Path], dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    wavs = []
    work = dest.parent / f"{dest.stem}_parts"
    work.mkdir(exist_ok=True)
    for i, part in enumerate(parts):
        wav = work / f"{i:02d}.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(part), "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", str(wav)],
            check=True,
            capture_output=True,
        )
        wavs.append(wav)
    list_path = work / "concat.txt"
    list_path.write_text("".join(f"file '{wav}'\n" for wav in wavs))
    wav_out = work / "joined.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_path), "-c", "copy", str(wav_out)],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(wav_out), "-c:a", "libmp3lame", "-b:a", "128k", str(dest)],
        check=True,
        capture_output=True,
    )
    m4a = dest.with_suffix(".m4a")
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(wav_out), "-c:a", "aac", "-b:a", "192k", str(m4a)],
        check=True,
        capture_output=True,
    )


def generate_lesson(slug: str, dest_dir: Path) -> dict:
    key, voice = _secrets()
    lesson = BY_SLUG[slug]
    dest_dir.mkdir(parents=True, exist_ok=True)
    chunks = chunk_text(lesson.spoken)
    print(f"{slug}: {len(lesson.spoken)} chars -> {len(chunks)} chunks")
    parts: list[Path] = []
    words: list[dict] = []
    request_ids: list[str] = []
    offset = 0.0
    previous_text = ""
    for i, chunk in enumerate(chunks):
        next_text = chunks[i + 1] if i + 1 < len(chunks) else ""
        print(f"  chunk {i + 1}/{len(chunks)} chars={len(chunk)}")
        result = tts_chunk(key, voice, chunk, request_ids, previous_text, next_text)
        part = dest_dir / f"chunk_{i:02d}.mp3"
        part.write_bytes(result["audio"])
        if part.read_bytes()[:3] != b"ID3" and part.read_bytes()[:2] not in {b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"}:
            raise RuntimeError(f"{slug} chunk {i} is not MP3")
        duration = audio_duration(part)
        words.extend(words_from_alignment(result["alignment"], offset))
        offset += duration
        parts.append(part)
        if result["request_id"]:
            request_ids.append(result["request_id"])
        previous_text = chunk
        print(f"    ok duration={duration:.2f}s words={len(result['alignment'].get('characters') or [])} request_id={'yes' if result['request_id'] else 'no'}")
        time.sleep(0.4)
    mp3 = dest_dir / "narration_master.mp3"
    concat_mp3(parts, mp3)
    duration = audio_duration(mp3)
    transcript = {
        "slug": slug,
        "title": lesson.title,
        "audio": str(mp3),
        "duration": round(duration, 3),
        "full_text": lesson.spoken,
        "words": words,
        "chunks": len(chunks),
        "model": MODEL,
    }
    (dest_dir / "transcript.json").write_text(json.dumps(transcript, indent=2))
    print(f"{slug}: finished {duration:.2f}s -> {mp3}")
    return transcript


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=sorted(BY_SLUG), default=None)
    parser.add_argument("--out", type=Path, default=ROOT / "content/videos")
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    for slug in slugs:
        generate_lesson(slug, args.out / slug / "source")


if __name__ == "__main__":
    main()
