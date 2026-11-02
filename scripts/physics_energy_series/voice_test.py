#!/usr/bin/env python3
"""Build one short MP4 to approve the ElevenLabs cloned voice before a full rebuild.

Uses ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID only. Does not print secrets.
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "JDScience_GCSE_Physics_Energy_Video_Series"
ARTIFACT = Path("/opt/cursor/artifacts")
TEST_N = 99  # dedicated audio folder; not one of the lesson videos

TEST_SCRIPT = (
    "Hello and welcome back to JD Science. This is a short voice check of my "
    "cloned narration for the GCSE Physics energy series. If this sounds like "
    "me, we will rebuild all twelve lessons with this same voice. Thank you "
    "for watching, and keep practising."
)

from .produce import FPS, INTRO, SR, TAIL, ensure_scene_audio  # noqa: E402
from .render import flag_times_from_words, render_frame  # noqa: E402
from .scenes import Scene  # noqa: E402


def require_eleven() -> None:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
    if not key:
        raise SystemExit(
            "ELEVENLABS_API_KEY is missing. Add it in Cursor Cloud Agent secrets, then retry."
        )
    if not voice:
        raise SystemExit(
            "ELEVENLABS_VOICE_ID is missing. Paste your Instant Clone Voice ID from "
            "ElevenLabs → Voices into Cursor Cloud Agent secrets, then retry."
        )


def make_scene() -> Scene:
    return Scene(
        video_n=TEST_N,
        index=0,
        total=1,
        layout="title",
        diagram="title",
        title="Cloned voice check",
        subtitle="JD Science  ·  listen before rebuild",
        footer="CLONED VOICE TEST",
        video_title="Cloned Voice Check",
        text=TEST_SCRIPT,
        sentences=[TEST_SCRIPT],
        roles=[],
        pause=0.0,
        ambient=False,
    )


def encode(scene: Scene, words, duration: float, audio_mp3: Path, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    work = OUT / "project" / "build" / "voice_test"
    if work.exists():
        for child in work.glob("*"):
            child.unlink()
    work.mkdir(parents=True, exist_ok=True)

    flags = flag_times_from_words(scene.diagram, words)
    total = INTRO + duration + TAIL
    frames = max(1, int(round(total * FPS)))

    wav = work / "narration.wav"
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(audio_mp3),
            "-af", f"adelay={int(INTRO * 1000)}|{int(INTRO * 1000)},apad=pad_dur={TAIL}",
            "-ar", str(SR), "-ac", "1", str(wav),
        ]
    )

    print(f"  encoding {dest.name} ({frames} frames, {total:.1f}s)", flush=True)
    for i in range(frames):
        t = i / FPS
        local = max(0.0, t - INTRO)
        img = render_frame(scene, local, words, flags, None, min(1.0, t / max(total, 0.01)))
        img.save(work / f"f{i:06d}.png")

    list_file = work / "frames.txt"
    with list_file.open("w") as handle:
        for i in range(frames):
            handle.write(f"file 'f{i:06d}.png'\nduration {1 / FPS:.6f}\n")
        handle.write(f"file 'f{frames - 1:06d}.png'\n")

    tmp = dest.with_suffix(".tmp.mp4")
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-i", str(list_file),
            "-i", str(wav),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-shortest",
            "-movflags", "+faststart",
            str(tmp),
        ],
        cwd=str(work),
    )
    tmp.replace(dest)
    return dest


def qa(path: Path) -> None:
    probe = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "stream=codec_type,codec_name,width,height:format=duration",
            "-of", "json", str(path),
        ],
        text=True,
    )
    info = json.loads(probe)
    streams = {s["codec_type"]: s for s in info.get("streams", [])}
    if "video" not in streams:
        raise SystemExit("Test video has no video stream — will not play.")
    if "audio" not in streams:
        raise SystemExit("Test video has no audio stream — narration missing.")
    if streams["video"].get("codec_name") != "h264":
        raise SystemExit(f"Unexpected video codec: {streams['video'].get('codec_name')}")
    if streams["audio"].get("codec_name") not in {"aac", "mp3"}:
        raise SystemExit(f"Unexpected audio codec: {streams['audio'].get('codec_name')}")
    dur = float(info["format"]["duration"])
    if dur < 5:
        raise SystemExit(f"Test video too short ({dur:.1f}s)")
    vol = subprocess.check_output(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        stderr=subprocess.STDOUT,
        text=True,
    )
    mean_line = next(line for line in vol.splitlines() if "mean_volume:" in line)
    mean = float(mean_line.split("mean_volume:")[1].split("dB")[0].strip())
    if mean < -35:
        raise SystemExit(f"Audio too quiet (mean {mean} dB) — likely silent.")
    print(
        f"  QA {path.name}: {dur:.1f}s  "
        f"{streams['video'].get('width')}x{streams['video'].get('height')}  "
        f"mean {mean} dB",
        flush=True,
    )


async def main() -> None:
    require_eleven()
    scene = make_scene()
    print("Building short cloned-voice test video…", flush=True)
    words, duration = await ensure_scene_audio(TEST_N, 0, scene.text, force=True)
    audio_mp3 = OUT / "project" / "audio" / f"{TEST_N:02d}" / "s00.mp3"
    if not audio_mp3.exists():
        raise SystemExit("Narration MP3 was not written.")

    dest = OUT / "VOICE_CHECK_ElevenLabs_Clone.mp4"
    encode(scene, words, duration, audio_mp3, dest)
    qa(dest)

    ARTIFACT.mkdir(parents=True, exist_ok=True)
    artifact = ARTIFACT / dest.name
    artifact.write_bytes(dest.read_bytes())
    print(f"Wrote {dest}")
    print(f"Wrote {artifact}")
    print(f"SIZE_BYTES {artifact.stat().st_size}")


if __name__ == "__main__":
    asyncio.run(main())
