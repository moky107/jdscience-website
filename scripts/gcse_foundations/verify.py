#!/usr/bin/env python3
"""Check exported MP4/SRT deliverables without printing secrets."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from gcse_foundations.lessons import LESSONS


def probe(path: Path) -> dict:
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(proc.stdout)


def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/opt/cursor/artifacts")
    ok = True
    for slug, lesson in LESSONS.items():
        mp4 = root / lesson["filename"]
        srt = root / f"jdscience-{slug}.srt"
        print(f"== {slug} ==")
        if not mp4.exists():
            print("  MISSING", mp4)
            ok = False
            continue
        info = probe(mp4)
        streams = {s["codec_type"]: s for s in info.get("streams", [])}
        fmt = info.get("format", {})
        v = streams.get("video", {})
        a = streams.get("audio", {})
        width, height = int(v.get("width", 0)), int(v.get("height", 0))
        duration = float(fmt.get("duration", 0))
        print(f"  video {v.get('codec_name')} {width}x{height} fps={v.get('r_frame_rate')}")
        print(f"  audio {a.get('codec_name')} {a.get('sample_rate')}Hz {a.get('channels')}ch")
        print(f"  duration {duration:.2f}s size={fmt.get('size')}")
        if (width, height) != (1920, 1080) or v.get("codec_name") != "h264":
            print("  FAIL video format")
            ok = False
        if a.get("codec_name") != "aac":
            print("  FAIL audio codec")
            ok = False
        if duration < 60:
            print("  FAIL duration too short")
            ok = False
        if not srt.exists() or srt.stat().st_size < 200:
            print("  FAIL srt", srt)
            ok = False
        else:
            print("  srt bytes", srt.stat().st_size)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
