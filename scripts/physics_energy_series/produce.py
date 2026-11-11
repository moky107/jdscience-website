#!/usr/bin/env python3
"""Build the 12 narrated GCSE Physics conservation-of-energy videos.

Narration uses the ElevenLabs cloned voice unchanged when ELEVENLABS_API_KEY
and ELEVENLABS_VOICE_ID are set. No accent conversion is applied. If those
variables are absent, speech uses the West African English voice
en-NG-AbeoNeural. British en-GB voices are never used.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "JDScience_GCSE_Physics_Energy_Video_Series"
AUDIO = OUT / "project" / "audio"
BUILD = OUT / "project" / "build"

from .render import CUES, fake_words, flag_times_from_words, render_frame  # noqa: E402
from .scenes import assert_coverage, build_scenes  # noqa: E402
from .scripts_text import VIDEOS  # noqa: E402
from .ui import BG, H, W  # noqa: E402

# West African English, male. Do not switch this to an en-GB voice.
VOICE = "en-NG-AbeoNeural"
RATE = "-4%"
FPS = 30
INTRO = 0.45
GAP = 0.30
TAIL = 0.70
SR = 48000


def speakable(text: str) -> str:
    text = text.replace("jdscience.co.uk", "JD Science dot co dot UK")
    text = re.sub(r"\bGPE\b", "G P E", text)
    return text


def norm_tok(token: str) -> str:
    token = token.lower().replace("’", "'").replace(",", "")
    return token.strip(".,;:!?\"'()[]")


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    ).strip()
    return float(out)


async def _edge(text: str, dest: Path) -> list[dict]:
    import edge_tts

    if VOICE.lower().startswith("en-gb"):
        raise RuntimeError("British en-GB voices are disabled for this series")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    audio = bytearray()
    words = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            offset = float(chunk["offset"])
            duration = float(chunk["duration"])
            if offset > 1000:
                offset /= 1e7
                duration /= 1e7
            words.append({"text": chunk["text"], "start": offset, "end": offset + duration})
    dest.write_bytes(audio)
    return words


def _eleven_once(text: str, dest: Path, key: str, voice: str) -> list[dict]:
    import base64
    import urllib.error
    import urllib.request

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps"
    payload = json.dumps({
        "text": text,
        "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.85, "style": 0.0, "use_speaker_boost": True},
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "xi-api-key": key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")[:500]
        raise RuntimeError(f"ElevenLabs HTTP {exc.code}: {detail}") from exc
    dest.write_bytes(base64.b64decode(data["audio_base64"]))
    alignment = data.get("alignment") or data.get("normalized_alignment") or {}
    chars = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    words = []
    buf = ""
    wstart = None
    wend = None
    for ch, st, en in zip(chars, starts, ends):
        if ch.isspace():
            if buf:
                words.append({"text": buf, "start": wstart, "end": wend})
                buf = ""
                wstart = None
            continue
        if wstart is None:
            wstart = st
        buf += ch
        wend = en
    if buf:
        words.append({"text": buf, "start": wstart, "end": wend})
    return words


def _eleven(text: str, dest: Path) -> list[dict] | None:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
    if not key or not voice:
        return None
    last = None
    for attempt in range(5):
        try:
            return _eleven_once(text, dest, key, voice)
        except Exception as exc:  # transient auth / rate-limit / network
            last = exc
            detail = str(exc)
            if "quota_exceeded" in detail:
                raise RuntimeError(
                    f"ElevenLabs quota exceeded while narrating {dest.name}. "
                    f"Top up characters at https://elevenlabs.io/app/subscription/api then re-run "
                    f"with --force-audio. Detail: {detail}"
                ) from exc
            wait = 2.0 * (attempt + 1)
            print(f"    elevenlabs retry {attempt + 1}/5 after {wait:.0f}s: {exc}", flush=True)
            import time
            time.sleep(wait)
    raise RuntimeError(f"ElevenLabs narration failed for {dest.name}: {last}")


async def synthesize(text: str, dest: Path) -> list[dict]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
    if key and voice:
        return _eleven(text, dest)
    last = None
    for attempt in range(4):
        try:
            return await _edge(text, dest)
        except Exception as exc:  # network hiccup
            last = exc
            await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Narration failed for {dest.name}: {last}")


def expand_tokens(raw: list[dict]) -> list[tuple[str, float, float]]:
    out = []
    for word in raw:
        parts = str(word["text"]).split()
        if not parts:
            continue
        start, end = float(word["start"]), float(word["end"])
        if len(parts) == 1:
            out.append((parts[0], start, max(end, start + 0.01)))
            continue
        weights = [max(len(p), 1) for p in parts]
        total = sum(weights)
        cursor = start
        span = max(0.01, end - start)
        for part, weight in zip(parts, weights):
            step = span * weight / total
            out.append((part, cursor, cursor + step))
            cursor += step
    return out


def align_words(original: str, raw_words: list[dict], duration: float) -> list[tuple[str, float]]:
    expected = speakable(original).split()
    spoken = expand_tokens(raw_words)
    times: list[float | None] = [None] * len(expected)
    cursor = 0
    misses = 0
    for i, exp in enumerate(expected):
        target = norm_tok(exp)
        found = None
        if target:
            for k in range(cursor, min(len(spoken), cursor + 8)):
                if norm_tok(spoken[k][0]) == target:
                    found = k
                    break
        if found is None:
            misses += 1
            continue
        times[i] = spoken[found][1]
        cursor = found + 1
    known = [i for i, t in enumerate(times) if t is not None]
    if not known:
        step = duration / max(len(expected), 1)
        return [(w, i * step) for i, w in enumerate(original.split())]
    for i in range(len(times)):
        if times[i] is not None:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        if prev is None and nxt is not None:
            times[i] = max(0.0, times[nxt] - 0.04 * (nxt - i))
        elif nxt is None and prev is not None:
            times[i] = min(duration, times[prev] + 0.04 * (i - prev))
        elif prev is not None and nxt is not None:
            times[i] = times[prev] + (times[nxt] - times[prev]) * (i - prev) / (nxt - prev)
        else:
            times[i] = 0.0
    orig = original.split()
    groups = [len(speakable(w).split()) or 1 for w in orig]
    aligned = []
    index = 0
    for word, count in zip(orig, groups):
        aligned.append((word, float(times[min(index, len(times) - 1)])))
        index += count
    if expected:
        print(f"    alignment misses {misses}/{len(expected)}", flush=True)
    return aligned


def to_wav(mp3: Path, wav: Path) -> None:
    subprocess.check_call(
        ["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ac", "1", "-ar", str(SR), str(wav)],
    )


def silence(seconds: float) -> bytes:
    n = int(SR * seconds)
    return b"\x00" * n * 2


def write_wav(path: Path, pcm: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm)


def load_wav(path: Path) -> bytes:
    with wave.open(str(path), "r") as handle:
        if handle.getframerate() != SR or handle.getnchannels() != 1:
            raise RuntimeError(f"Unexpected wav format: {path}")
        return handle.readframes(handle.getnframes())


async def ensure_scene_audio(video_n: int, index: int, text: str, force: bool) -> tuple[list[tuple[str, float]], float]:
    folder = AUDIO / f"{video_n:02d}"
    folder.mkdir(parents=True, exist_ok=True)
    mp3 = folder / f"s{index:02d}.mp3"
    meta = folder / f"s{index:02d}.json"
    spoken = speakable(text)
    signature = json.dumps({"text": spoken, "voice": VOICE, "rate": RATE, "eleven": bool(os.environ.get("ELEVENLABS_API_KEY"))})
    if mp3.exists() and meta.exists() and not force:
        saved = json.loads(meta.read_text())
        if saved.get("signature") == signature:
            return [(a, b) for a, b in saved["words"]], float(saved["duration"])
    print(f"  narrating video {video_n} scene {index + 1}", flush=True)
    raw = await synthesize(spoken, mp3)
    duration = ffprobe_duration(mp3)
    words = align_words(text, raw, duration)
    meta.write_text(json.dumps({
        "signature": signature,
        "duration": duration,
        "words": words,
        "raw": raw,
    }))
    return words, duration


def render_video(video: dict, scenes, timed, force: bool) -> Path:
    from PIL import Image

    out = OUT / video["file"]
    work = BUILD / f"{video['n']:02d}"
    if work.exists() and force:
        for child in work.glob("*"):
            child.unlink()
    work.mkdir(parents=True, exist_ok=True)
    frames = work / "frames"
    if frames.exists():
        for child in frames.glob("*.png"):
            child.unlink()
    frames.mkdir(parents=True, exist_ok=True)

    pcm = bytearray()
    pcm += silence(INTRO)
    cursor = INTRO
    schedule = []
    for scene, (words, duration) in zip(scenes, timed):
        flags = flag_times_from_words(scene.diagram, words)
        schedule.append({
            "scene": scene,
            "start": cursor,
            "duration": duration,
            "words": words,
            "flags": flags,
            "pause": scene.pause,
        })
        wav = work / f"s{scene.index:02d}.wav"
        to_wav(AUDIO / f"{video['n']:02d}" / f"s{scene.index:02d}.mp3", wav)
        pcm += load_wav(wav)
        cursor += duration
        if scene.pause:
            pcm += silence(scene.pause)
            cursor += scene.pause
        if scene.index != scenes[-1].index:
            pcm += silence(GAP)
            cursor += GAP
    pcm += silence(TAIL)
    total = cursor + TAIL
    master = work / "narration.wav"
    write_wav(master, bytes(pcm))

    concat = ["ffconcat version 1.0"]
    counter = 0

    def hold(image: Image.Image, duration: float) -> None:
        nonlocal counter
        if duration <= 0.001:
            return
        path = frames / f"f{counter:05d}.png"
        image.save(path, compress_level=1)
        concat.append(f"file '{path}'")
        concat.append(f"duration {duration:.4f}")
        counter += 1

    def blend(a: Image.Image, b: Image.Image, duration: float, steps: int = 6) -> None:
        for step in range(1, steps + 1):
            hold(Image.blend(a, b, step / steps), duration / steps)

    blank = Image.new("RGB", (W, H), BG)
    first = render_frame(scenes[0], 0.0, timed[0][0], flag_times_from_words(scenes[0].diagram, timed[0][0]), None, 0.0)
    blend(blank, first, INTRO, 8)
    previous = first

    for item in schedule:
        scene = item["scene"]
        words = item["words"]
        flags = item["flags"]
        duration = item["duration"]
        stamps = {0.0, max(0.0, duration - 0.04)}
        for _word, ts in words:
            if 0 <= ts < duration:
                stamps.add(round(ts, 3))
        for times in flags.values():
            for ts in times:
                if 0 <= ts < duration:
                    stamps.add(round(ts, 3))
        if scene.ambient:
            t = 0.0
            while t < duration:
                stamps.add(round(t, 3))
                t += 0.18
        ordered = sorted(stamps)
        if ordered[0] > 0:
            ordered = [0.0] + ordered
        if ordered[-1] < duration:
            ordered.append(duration)
        image = previous
        for left, right in zip(ordered, ordered[1:]):
            progress = (item["start"] + left) / total
            image = render_frame(scene, left, words, flags, None, progress)
            hold(image, right - left)
        if item["pause"]:
            for second in range(5, 0, -1):
                progress = (item["start"] + duration + (5 - second)) / total
                paused = render_frame(scene, duration, words, flags, second, progress)
                hold(paused, 1.0)
            image = render_frame(scene, duration, words, flags, 1, (item["start"] + duration + 4) / total)
        if scene.index != scenes[-1].index:
            nxt = scenes[scene.index + 1]
            nxt_words, _nxt_dur = timed[scene.index + 1]
            nxt_img = render_frame(nxt, 0.0, nxt_words, flag_times_from_words(nxt.diagram, nxt_words), None, (item["start"] + duration + item["pause"]) / total)
            blend(image, nxt_img, GAP, 6)
            previous = nxt_img
        else:
            hold(image, TAIL)
            previous = image

    # Concat demuxer ignores the final duration unless the last file is repeated.
    last = frames / f"f{counter - 1:05d}.png"
    concat.append(f"file '{last}'")
    list_path = work / "frames.txt"
    list_path.write_text("\n".join(concat) + "\n")
    silent = work / "silent.mp4"
    print(f"  encoding {video['file']} ({counter} frames, {total:.1f}s)", flush=True)
    subprocess.check_call([
        "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(list_path),
        "-t", f"{total:.3f}", "-r", str(FPS),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "18",
        "-movflags", "+faststart", "-an", str(silent),
    ])
    subprocess.check_call([
        "ffmpeg", "-y", "-v", "error", "-i", str(silent), "-i", str(master),
        "-map", "0:v:0", "-map", "1:a:0", "-t", f"{total:.3f}",
        "-c:v", "copy",
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,aformat=channel_layouts=stereo",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        "-metadata", f"title={video['title']}",
        "-metadata", "artist=JD Science",
        "-metadata", "comment=GCSE Physics Unit 3 Conservation of Energy. jdscience.co.uk",
        str(out),
    ])
    timing = {
        "title": video["title"],
        "file": video["file"],
        "duration": total,
        "voice": "elevenlabs" if os.environ.get("ELEVENLABS_API_KEY") else VOICE,
        "scenes": [
            {
                "index": item["scene"].index,
                "layout": item["scene"].layout,
                "diagram": item["scene"].diagram,
                "title": item["scene"].title,
                "start": item["start"],
                "duration": item["duration"],
                "pause": item["pause"],
                "text": item["scene"].text,
            }
            for item in schedule
        ],
    }
    (OUT / "project" / "timing" ).mkdir(parents=True, exist_ok=True)
    (OUT / "project" / "timing" / f"{video['n']:02d}.json").write_text(json.dumps(timing, indent=2))
    for child in frames.glob("*.png"):
        child.unlink()
    silent.unlink(missing_ok=True)
    master.unlink(missing_ok=True)
    for wav in work.glob("s*.wav"):
        wav.unlink()
    return out


def qa(path: Path) -> None:
    info = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=codec_name,width,height,r_frame_rate,channels,sample_rate",
        "-of", "json", str(path),
    ], text=True)
    data = json.loads(info)
    streams = data["streams"]
    video = next(s for s in streams if s.get("width"))
    audio = next(s for s in streams if s.get("codec_name") == "aac" or s.get("sample_rate"))
    duration = float(data["format"]["duration"])
    if video.get("codec_name") != "h264" or video.get("width") != 1920 or video.get("height") != 1080:
        raise SystemExit(f"Video stream check failed for {path.name}: {video}")
    if audio.get("codec_name") != "aac":
        raise SystemExit(f"Audio stream check failed for {path.name}")
    vol = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    mean = re.search(r"mean_volume:\s*(-?\d+(?:\.\d+)?) dB", vol)
    maxv = re.search(r"max_volume:\s*(-?\d+(?:\.\d+)?) dB", vol)
    if not mean or not maxv:
        raise SystemExit(f"No audio levels for {path.name}")
    if float(maxv.group(1)) > -0.1:
        raise SystemExit(f"Audio may be clipping in {path.name}: max {maxv.group(1)} dB")
    if float(mean.group(1)) < -30 or float(mean.group(1)) > -10:
        print(f"  warning: mean volume {mean.group(1)} dB in {path.name}")
    print(f"  QA {path.name}: {duration:.1f}s  {video['width']}x{video['height']} {video['r_frame_rate']}  mean {mean.group(1)} dB", flush=True)


async def build(numbers: list[int], force_audio: bool, force_video: bool, stills: bool) -> None:
    assert_coverage()
    OUT.mkdir(parents=True, exist_ok=True)
    selected = [v for v in VIDEOS if v["n"] in numbers]
    for video in selected:
        scenes = build_scenes(video)
        print(f"Video {video['n']}: {video['title']} ({len(scenes)} scenes)", flush=True)
        timed = []
        for scene in scenes:
            words, duration = await ensure_scene_audio(video["n"], scene.index, scene.text, force_audio)
            if len(words) != len(scene.text.split()):
                raise SystemExit(f"Word map length mismatch in video {video['n']} scene {scene.index}")
            missing = []
            flags = flag_times_from_words(scene.diagram, words)
            for phrase, flag in CUES.get(scene.diagram, []):
                if flag not in flags:
                    # Cue phrases are allowed to be absent when a diagram is reused
                    # on a question scene that must not reveal the answer.
                    if phrase.lower() in scene.text.lower():
                        missing.append(phrase)
            if missing:
                print(f"    cue not aligned: {missing}", flush=True)
            timed.append((words, duration))
        if stills:
            still_dir = OUT / "project" / "stills" / f"{video['n']:02d}"
            still_dir.mkdir(parents=True, exist_ok=True)
            for scene, (words, duration) in zip(scenes, timed):
                flags = flag_times_from_words(scene.diagram, words)
                for label, t in (("a", 0.2), ("b", duration * 0.55), ("c", max(0.0, duration - 0.2))):
                    img = render_frame(scene, t, words, flags, 3 if scene.layout == "question" and label == "c" else None, 0.3)
                    img.save(still_dir / f"{scene.index:02d}_{scene.diagram}_{label}.png")
            print(f"  stills in {still_dir}", flush=True)
            continue
        path = render_video(video, scenes, timed, force_video)
        qa(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", type=int, action="append")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--force-audio", action="store_true")
    parser.add_argument("--force-video", action="store_true")
    parser.add_argument("--stills", action="store_true")
    args = parser.parse_args()
    numbers = list(range(1, 13)) if args.all or not args.video else args.video
    asyncio.run(build(numbers, args.force_audio, args.force_video, args.stills))


if __name__ == "__main__":
    main()
