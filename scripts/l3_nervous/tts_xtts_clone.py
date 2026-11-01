#!/usr/bin/env python3
"""Clone narration from the uploaded JD Science speaker sample with XTTS v2.

Accent and timbre come from the uploaded recording. Difficult science words
are given a spoken form so the clone stays intelligible. ElevenLabs still
cannot clone or synthesise.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

os.environ.setdefault("COQUI_TOS_AGREED", "1")

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from l3_nervous.audio_clarity import CLARITY_AF
from l3_nervous.narration import BY_SLUG, LESSONS

SPEAKER = Path("/tmp/joe_voice/joe_speaker.wav")
WORK = Path("/tmp/joe_voice/xtts3")
MAX_CHARS = 170
MIN_CHARS = 55

# Spoken forms only — on-screen scripts stay in British English.
# Accent and timbre come from the uploaded teaching sample, not RyanNeural.
# Keep respelling light: short phonetic crumbs make XTTS invent extra words.
SPOKEN = [
    (r"jdscience\.co\.uk", "jay dee science dot co dot you kay"),
    (r"acetylcholinesterase", "acetyl choline esterase"),
    (r"Acetylcholinesterase", "Acetyl choline esterase"),
    (r"acetylcholine", "acetyl choline"),
    (r"Acetylcholine", "Acetyl choline"),
    (r"depolarisation", "depolarization"),
    (r"Depolarisation", "Depolarization"),
    (r"repolarisation", "repolarization"),
    (r"Repolarisation", "Repolarization"),
    (r"hyperpolarisation", "hyperpolarization"),
    (r"Hyperpolarisation", "Hyperpolarization"),
    (r"depolarised", "depolarized"),
    (r"Depolarised", "Depolarized"),
    (r"depolarises", "depolarizes"),
    (r"depolarise", "depolarize"),
    (r"polarised", "polarized"),
    (r"Polarised", "Polarized"),
    (r"recognise", "recognize"),
    (r"fibres", "fibers"),
    (r"fibre", "fiber"),
    (r"specialised", "specialized"),
    (r"Specialised", "Specialized"),
    (r"labelled", "labeled"),
    (r"Labelled", "Labeled"),
    (r"neighbouring", "neighboring"),
    (r"neurones", "neurons"),
    (r"Neurones", "Neurons"),
    (r"neurone", "neuron"),
    (r"Neurone", "Neuron"),
    (r"unmyelinated", "unmyelinated"),
    (r"saltatory", "saltatory"),
    (r"exocytosis", "exocytosis"),
    (r"nodes of Ranvier", "nodes of Ranvier"),
    (r"node of Ranvier", "node of Ranvier"),
    (r"nanometres", "nanometers"),
    (r"ligand-gated", "ligand gated"),
    (r"Ligand-gated", "Ligand gated"),
    (r"voltage-gated", "voltage gated"),
    (r"Voltage-gated", "Voltage gated"),
    (r"Level 3", "level three"),
]


def spoken_form(text: str) -> str:
    out = text
    for pat, repl in SPOKEN:
        out = re.sub(pat, repl, out)
    return out


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    )
    return float(out.strip())


def _clauses(sentence: str) -> list[str]:
    if len(sentence) <= MAX_CHARS:
        return [sentence]
    parts = [p.strip() for p in re.split(r"(?<=[,;:])\s+", sentence) if p.strip()]
    if len(parts) == 1:
        words = sentence.split()
        mid = max(8, len(words) // 2)
        return [" ".join(words[:mid]), " ".join(words[mid:])]
    out: list[str] = []
    buf = ""
    for part in parts:
        if buf and len(buf) + 1 + len(part) > MAX_CHARS:
            out.append(buf)
            buf = part
        else:
            buf = f"{buf} {part}".strip() if buf else part
    if buf:
        out.append(buf)
    return out


def _merge_short(chunks: list[str]) -> list[str]:
    if not chunks:
        return []
    merged: list[str] = [chunks[0]]
    for chunk in chunks[1:]:
        if len(merged[-1]) < MIN_CHARS or len(chunk) < MIN_CHARS:
            joined = f"{merged[-1]} {chunk}".strip()
            if len(joined) <= MAX_CHARS + 40:
                merged[-1] = joined
                continue
        merged.append(chunk)
    return merged


def split_spoken(text: str) -> list[str]:
    chunks: list[str] = []
    for para in [p.strip() for p in text.split("\n\n") if p.strip()]:
        bits = [b.strip() for b in re.split(r"(?<=[.!?])\s+", para) if b.strip()]
        buf = ""
        for bit in bits:
            pieces = _clauses(bit)
            for piece in pieces:
                if buf and len(buf) + 1 + len(piece) > MAX_CHARS:
                    chunks.append(buf)
                    buf = piece
                else:
                    buf = f"{buf} {piece}".strip() if buf else piece
        if buf:
            chunks.append(buf)
    return _merge_short(chunks)


def content_words(text: str) -> set[str]:
    stop = {"the", "a", "an", "and", "or", "of", "to", "in", "is", "that", "this", "for", "on", "at", "as", "by", "it", "we", "be"}
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in stop and len(w) > 2}


def silence(path: Path, seconds: float) -> None:
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
        "-t", f"{seconds:.3f}", "-c:a", "pcm_s16le", str(path),
    ])


def write_wavs(paths: list[Path], dest: Path) -> None:
    lst = dest.with_suffix(".txt")
    lst.write_text("".join(f"file '{p}'\n" for p in paths))
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(dest)])


def transcribe_chunk(model, path: Path) -> str:
    result = model.transcribe(str(path), language="en", fp16=False)
    return str(result.get("text") or "")


def synth_chunk(tts, text: str, dest: Path, temperature: float) -> None:
    spoken = spoken_form(text)
    last_error = None
    for attempt, temp in enumerate((temperature, 0.15, 0.45), start=1):
        try:
            tts.tts_to_file(
                text=spoken,
                speaker_wav=str(SPEAKER),
                language="en",
                file_path=str(dest),
                speed=0.96,
                temperature=temp,
                repetition_penalty=8.0,
            )
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            print(f"    retry {attempt} after {type(exc).__name__}", flush=True)
            continue
        if dest.exists() and dest.stat().st_size > 8000 and duration(dest) >= 0.45:
            return
        print(f"    retry {attempt}: short audio {dest.stat().st_size if dest.exists() else 0}b", flush=True)
    if last_error:
        raise last_error
    raise RuntimeError(f"failed to synthesise: {spoken[:80]}")


def words_from_whisper(model, audio: Path) -> list[dict]:
    result = model.transcribe(str(audio), language="en", fp16=False, word_timestamps=True)
    words: list[dict] = []
    for seg in result.get("segments") or []:
        for w in seg.get("words") or []:
            token = str(w.get("word") or "").strip()
            if not token:
                continue
            words.append({
                "word": token,
                "start": round(float(w["start"]), 3),
                "end": round(float(w["end"]), 3),
            })
    return words


def generate_lesson(tts, whisper_model, slug: str) -> dict:
    lesson = BY_SLUG[slug]
    dest = ROOT / "content/videos" / slug / "source"
    dest.mkdir(parents=True, exist_ok=True)
    work = WORK / slug
    work.mkdir(parents=True, exist_ok=True)
    chunks = split_spoken(lesson.spoken)
    print(f"{slug}: {len(lesson.spoken)} chars -> {len(chunks)} xtts chunks", flush=True)
    parts: list[Path] = []
    gap = work / "gap.wav"
    silence(gap, 0.18)
    t0 = time.time()
    for i, chunk in enumerate(chunks):
        wav = work / f"p{i:03d}.wav"
        print(f"  {i + 1}/{len(chunks)} chars={len(chunk)} spoken={len(spoken_form(chunk))}", flush=True)
        synth_chunk(tts, chunk, wav, 0.22)
        parts.append(wav)
        if i + 1 < len(chunks):
            parts.append(gap)
    joined = work / "joined.wav"
    write_wavs(parts, joined)
    wav44 = dest / "narration_master_xtts.wav"
    # Clarity EQ: XTTS clones are mud-heavy; cut <300 Hz and lift presence.
    run([
        "ffmpeg", "-y", "-i", str(joined),
        "-af", CLARITY_AF,
        "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le",
        str(wav44),
    ])
    m4a = dest / "narration_master.m4a"
    mp3 = dest / "narration_master.mp3"
    run(["ffmpeg", "-y", "-i", str(wav44), "-c:a", "aac", "-b:a", "192k", str(m4a)])
    run(["ffmpeg", "-y", "-i", str(wav44), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)])
    print(f"{slug}: whisper align", flush=True)
    words = words_from_whisper(whisper_model, wav44)
    dur = duration(m4a)
    transcript = {
        "slug": slug,
        "title": lesson.title,
        "audio": str(m4a),
        "duration": round(dur, 3),
        "full_text": lesson.spoken,
        "tts_text": lesson.spoken,
        "words": words,
        "chunks": len(chunks),
        "model": "xtts_v2",
        "voice": "uploaded-joes-voice-xtts",
        "temporary_voice": False,
        "elevenlabs_blocker": (
            "ElevenLabs quota_exceeded (4 credits remaining) and voices_write "
            "denied. Narration synthesised from the uploaded speaker sample "
            "with XTTS v2 so accent and timbre come from that recording."
        ),
    }
    (dest / "transcript.json").write_text(json.dumps(transcript, indent=2) + "\n")
    (dest / "voice.json").write_text(json.dumps({
        "engine": "xtts_v2",
        "speaker": "uploaded joes_voice teaching sample",
        "language": "en",
        "temporary": False,
        "clarity_eq": CLARITY_AF,
        "notes": (
            "Zero-shot clone of the uploaded JD Science sample. Accent comes "
            "from that recording, not from a British stock voice. Clarity EQ "
            "cuts sub-300 Hz mud and lifts 2.5–4.5 kHz presence."
        ),
    }, indent=2) + "\n")
    print(f"{slug}: finished {dur:.2f}s words={len(words)} in {time.time() - t0:.1f}s", flush=True)
    return transcript


def main() -> None:
    if not SPEAKER.exists():
        raise SystemExit(f"missing speaker {SPEAKER}")
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", choices=[lesson.slug for lesson in LESSONS], default=None)
    args = parser.parse_args()
    import whisper
    from TTS.api import TTS
    print("loading xtts_v2", flush=True)
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")
    print("loading whisper", flush=True)
    whisper_model = whisper.load_model("base")
    slugs = [args.slug] if args.slug else [lesson.slug for lesson in LESSONS]
    for slug in slugs:
        generate_lesson(tts, whisper_model, slug)


if __name__ == "__main__":
    main()
