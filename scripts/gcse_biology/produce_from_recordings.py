#!/usr/bin/env python3
"""Identify uploaded narration files and produce narrated 1080p Biology lessons."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.cursor import SIGNATURES
from gcse_biology.lessons import LESSONS
from gcse_biology.narration import BY_SLUG
from gcse_biology.produce import HOSTED, produce

TRANSCRIPTS = Path("/tmp/bio-transcripts")
AUDIO_DIR = Path("/tmp/bio-narration")
IDENTIFY = ROOT / "content/gcse-biology/narration-identify.json"

# Duplicate 1.3 review shares audio with the pointer-review file.
ALIASES = {
    "JDScience_1_3_Transport_in_Cells_Review_6415": "JDScience_1_3_Transport_in_Cells_Pointer_Review_110b",
}


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def score_text(text: str) -> list[tuple[int, str]]:
    blob = _norm(text)
    ranked = []
    for slug, words in SIGNATURES.items():
        if slug in HOSTED:
            continue
        hits = sum(1 for word in words if _norm(word) in blob)
        ranked.append((hits, slug))
    ranked.sort(reverse=True)
    return ranked


def load_transcript(stem: str) -> dict:
    alias = ALIASES.get(stem, stem)
    path = TRANSCRIPTS / f"{alias}.json"
    return json.loads(path.read_text())


def identify() -> dict:
    rows = []
    used: dict[str, str] = {}
    files = sorted(AUDIO_DIR.glob("*.m4a"))
    for audio in files:
        stem = audio.stem
        data = load_transcript(stem)
        text = data.get("full_text") or ""
        ranked = score_text(text)
        best_hits, best_slug = ranked[0] if ranked else (0, "")
        second = ranked[1][0] if len(ranked) > 1 else 0
        usable = best_hits >= 2 and best_hits > second
        if usable and best_slug in used:
            usable = False
            reason = f"duplicate of {used[best_slug]}"
        elif usable:
            used[best_slug] = stem
            reason = "matched"
        else:
            reason = "awaiting_audio_or_ambiguous"
        rows.append({
            "file": audio.name,
            "duration": data.get("duration"),
            "words": len(data.get("words") or []),
            "preview": " ".join(text.split()[:28]),
            "best_slug": best_slug,
            "best_hits": best_hits,
            "second_hits": second,
            "usable": usable,
            "reason": reason,
        })
    report = {
        "recordings": rows,
        "matched": {row["best_slug"]: row["file"] for row in rows if row["usable"]},
        "awaiting": [slug for slug in LESSONS if slug not in HOSTED and slug not in {r["best_slug"] for r in rows if r["usable"]}],
    }
    IDENTIFY.parent.mkdir(parents=True, exist_ok=True)
    IDENTIFY.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    return report


def install_source(slug: str, stem: str) -> Path:
    data = load_transcript(stem)
    audio_src = AUDIO_DIR / f"{stem}.m4a"
    if not audio_src.exists():
        audio_src = AUDIO_DIR / f"{ALIASES.get(stem, stem)}.m4a"
    source = ROOT / "content/videos" / slug / "source"
    source.mkdir(parents=True, exist_ok=True)
    dest_audio = source / "narration_master.m4a"
    shutil.copy2(audio_src, dest_audio)
    rel = dest_audio.relative_to(ROOT)
    data["audio"] = str(rel)
    data["voice"] = "original-uploaded-narration"
    (source / "transcript.json").write_text(json.dumps(data, indent=2))
    return dest_audio


def probe(path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,avg_frame_rate,codec_name,nb_frames",
        "-show_entries", "format=duration,size",
        "-of", "json",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(proc.stdout)
    stream = data["streams"][0]
    rate = stream.get("avg_frame_rate") or "0/1"
    num, den = rate.split("/")
    fps = float(num) / float(den or 1)
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "codec": stream["codec_name"],
        "fps": round(fps, 3),
        "duration": float(data["format"]["duration"]),
        "size": int(data["format"]["size"]),
        "nb_frames": int(stream.get("nb_frames") or 0),
    }


def produce_slug(slug: str, artifacts: Path) -> dict:
    script = BY_SLUG[slug]
    report = produce(slug, artifacts, skip_tts=True, video=True)
    dest = artifacts / script.filename
    yt = artifacts / script.youtube_filename
    if dest.exists() and dest.resolve() != yt.resolve():
        yt.write_bytes(dest.read_bytes())
    info = probe(dest)
    qa = {
        **report,
        "probe": info,
        "qa_1080p": info["width"] == 1920 and info["height"] == 1080,
        "qa_fps": abs(info["fps"] - 30) < 0.2,
        "qa_h264": info["codec"] == "h264",
        "qa_duration": abs(info["duration"] - report["duration"]) < 1.0,
        "qa_frames": info["nb_frames"] >= int(report["duration"] * 28),
        "voice": "original-uploaded-narration",
    }
    qa["qa_pass"] = all(qa[k] for k in ("qa_1080p", "qa_fps", "qa_h264", "qa_duration", "qa_frames"))
    (artifacts / f"{slug}-qa.json").write_text(json.dumps(qa, indent=2))
    print(json.dumps({k: qa[k] for k in ("slug", "duration", "qa_pass", "probe")}, indent=2))
    return qa


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--identify-only", action="store_true")
    parser.add_argument("--slug", default=None)
    parser.add_argument("--out", type=Path, default=Path("/opt/cursor/artifacts"))
    args = parser.parse_args(argv)
    report = identify()
    if args.identify_only:
        return
    slugs = [args.slug] if args.slug else list(report["matched"])
    if args.slug and args.slug not in report["matched"]:
        raise SystemExit(f"{args.slug} has no matched original narration")
    # Preferred first-batch order.
    order = [
        "1-3-transport-in-cells",
        "2-1-principles-of-organisation",
        "2-2-animal-tissues-organs-systems",
        "2-3-plant-tissues-organs-systems",
    ]
    slugs = [s for s in order if s in slugs] + [s for s in slugs if s not in order]
    results = []
    for slug in slugs:
        stem = Path(report["matched"][slug]).stem
        install_source(slug, stem)
        results.append(produce_slug(slug, args.out))
    (args.out / "biology-narrated-batch.json").write_text(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
