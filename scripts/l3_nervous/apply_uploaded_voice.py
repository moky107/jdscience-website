#!/usr/bin/env python3
"""Map existing British narration onto the uploaded JD Science voice sample.

ElevenLabs cannot clone (voices_write denied) or synthesise (quota_exceeded).
OpenVoice v2 converts the authorised British track using the uploaded 59 s
teaching sample as the target speaker. Duration is preserved so slide cues stay.
Never print secrets.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from l3_nervous.audio_clarity import CLARITY_AF
from l3_nervous.narration import BY_SLUG, LESSONS

SPEAKER = Path("/tmp/joe_voice/joe_speaker.wav")
WORK = Path("/tmp/joe_voice/convert")
SLUGS = [lesson.slug for lesson in LESSONS]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    )
    return float(out.strip())


def to_wav(src: Path, dest: Path, rate: int = 24000) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-i", str(src), "-ac", "1", "-ar", str(rate), "-c:a", "pcm_s16le", str(dest)])


def match_duration(src: Path, dest: Path, target: float) -> None:
    got = duration(src)
    if got <= 0:
        raise RuntimeError(f"empty audio {src}")
    ratio = got / target
    filters = [CLARITY_AF]
    if abs(ratio - 1.0) > 0.004:
        # Keep words on the original cue clock.
        filters.append(f"atempo={min(max(ratio, 0.5), 2.0):.6f}")
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-af", ",".join(filters),
        "-t", f"{target:.3f}",
        "-c:a", "aac", "-b:a", "192k",
        str(dest),
    ])


CHUNK = 16.0


def convert_lesson(vc, slug: str) -> dict:
    source_dir = ROOT / "content/videos" / slug / "source"
    src = source_dir / "narration_master.m4a"
    if not src.exists():
        src = source_dir / "narration_master.mp3"
    if not src.exists():
        raise FileNotFoundError(src)
    work = WORK / slug
    work.mkdir(parents=True, exist_ok=True)
    src_wav = work / "source.wav"
    conv_wav = work / "converted.wav"
    to_wav(src, src_wav)
    target = duration(src_wav)
    n = max(1, int((target + CHUNK - 0.01) // CHUNK))
    print(f"{slug}: converting {target:.1f}s in {n} chunks", flush=True)
    t0 = time.time()
    parts: list[Path] = []
    for i in range(n):
        start = i * CHUNK
        part_src = work / f"src_{i:03d}.wav"
        part_out = work / f"out_{i:03d}.wav"
        run([
            "ffmpeg", "-y", "-ss", f"{start:.3f}", "-t", f"{CHUNK:.3f}",
            "-i", str(src_wav), "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le",
            str(part_src),
        ])
        if duration(part_src) < 0.2:
            continue
        vc.voice_conversion_to_file(
            source_wav=str(part_src),
            target_wav=str(SPEAKER),
            file_path=str(part_out),
        )
        parts.append(part_out)
        part_src.unlink(missing_ok=True)
        print(f"  chunk {i + 1}/{n}", flush=True)
    concat_list = work / "concat.txt"
    concat_list.write_text("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-c", "copy", str(conv_wav)])
    elapsed = time.time() - t0
    out_m4a = source_dir / "narration_master.m4a"
    backup = source_dir / "narration_master_previous.m4a"
    if out_m4a.exists() and not backup.exists():
        out_m4a.replace(backup)
    match_duration(conv_wav, out_m4a, target)
    out_mp3 = source_dir / "narration_master.mp3"
    run(["ffmpeg", "-y", "-i", str(out_m4a), "-c:a", "libmp3lame", "-b:a", "192k", str(out_mp3)])
    got = duration(out_m4a)
    print(f"{slug}: done in {elapsed:.1f}s  {got:.2f}s (target {target:.2f}s)", flush=True)
    voice = {
        "engine": "openvoice_v2",
        "source_track": "en-GB-RyanNeural British teaching narration",
        "target": "uploaded joes_voice sample",
        "temporary": False,
        "clarity_eq": CLARITY_AF,
        "notes": (
            "ElevenLabs could not clone (voices_write denied) or synthesise "
            "(quota_exceeded, 4 credits remaining). The uploaded 59 s JD Science "
            "teaching sample was used as the OpenVoice v2 target speaker. "
            "Clarity EQ cuts mud and lifts presence."
        ),
    }
    (source_dir / "voice.json").write_text(json.dumps(voice, indent=2) + "\n")
    transcript_path = source_dir / "transcript.json"
    if transcript_path.exists():
        data = json.loads(transcript_path.read_text())
        data["audio"] = str(out_m4a)
        data["duration"] = round(got, 3)
        data["voice"] = "uploaded-joes-voice-openvoice-v2"
        data["temporary_voice"] = False
        data["model"] = "openvoice_v2"
        data["elevenlabs_blocker"] = voice["notes"]
        transcript_path.write_text(json.dumps(data, indent=2) + "\n")
    return {"slug": slug, "duration": got, "elapsed": elapsed}


def remux(slug: str, artifacts: Path) -> Path:
    from l3_nervous.narration import BY_SLUG as scripts
    script = scripts[slug]
    video = ROOT / "content/videos" / slug / script.filename
    audio = ROOT / "content/videos" / slug / "source" / "narration_master.m4a"
    if not video.exists():
        raise FileNotFoundError(video)
    tmp = Path("/tmp/joe_voice/remux") / script.filename
    tmp.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y",
        "-i", str(video),
        "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ac", "1", "-ar", "44100",
        str(tmp),
    ])
    video.write_bytes(tmp.read_bytes())
    artifacts.mkdir(parents=True, exist_ok=True)
    (artifacts / script.filename).write_bytes(tmp.read_bytes())
    yt = artifacts / script.youtube_filename
    if yt.resolve() != (artifacts / script.filename).resolve():
        yt.write_bytes(tmp.read_bytes())
    print(f"{slug}: remuxed {video}", flush=True)
    return video


def main() -> None:
    if not SPEAKER.exists():
        raise SystemExit(f"missing speaker reference {SPEAKER}")
    from TTS.api import TTS
    print("loading openvoice_v2", flush=True)
    vc = TTS(model_name="voice_conversion_models/multilingual/multi-dataset/openvoice_v2")
    artifacts = Path("/opt/cursor/artifacts")
    reports = []
    for slug in SLUGS:
        reports.append(convert_lesson(vc, slug))
        remux(slug, artifacts)
    (artifacts / "voice-conversion-report.json").write_text(json.dumps(reports, indent=2) + "\n")
    print(json.dumps(reports, indent=2))


if __name__ == "__main__":
    main()
