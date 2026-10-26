#!/usr/bin/env python3
"""Render silent visual-draft MP4s for remaining GCSE Biology lessons.

Uses existing storyboards, timing maps and the production encoder.
Does not call ElevenLabs. Does not use a generic voice.
Does not alter 1.1 / 1.2 masters. Does not publish drafts to the site.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import traceback
import urllib.error
import urllib.request
from copy import deepcopy
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import gcse_foundations.render as foundations_render
from gcse_biology import align as bio_align
from gcse_biology import draw as bio_draw
from gcse_biology.lessons import LESSONS
from gcse_biology.narration import BY_SLUG, LESSONS as SCRIPTS
from gcse_foundations.render import encode_lesson
from jdscience_video.theme import FPS, H, W, WHITE, font

HOSTED = ("1-1-cell-division", "1-2-bacterial-growth")
ARTIFACTS = Path("/opt/cursor/artifacts")
DRAFTS = ROOT / "content/gcse-biology/visual-drafts"
BUCKET = "resources"
PUBLIC_BASE = "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources"
SUPABASE_URL = (
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    or os.environ.get("VITE_SUPABASE_URL")
    or "https://xugsznxfvpbifpzpuoek.supabase.co"
)


def remaining_slugs() -> list[str]:
    return [script.slug for script in SCRIPTS if script.slug not in HOSTED]


def stamp_visual_draft(img: Image.Image) -> Image.Image:
    d = ImageDraw.Draw(img)
    y0 = img.height - 90
    d.rectangle((0, y0, W, img.height - 56), fill=(153, 28, 36))
    d.text(
        (56, y0 + 6),
        "VISUAL DRAFT  ·  cloned-voice narration pending  ·  not a completed teaching video",
        font=font("semibold", 18),
        fill=WHITE,
    )
    return img


def render_slide_draft(lesson: dict, slide_id: str, revealed, t: float) -> Image.Image:
    return stamp_visual_draft(bio_draw.render_slide(lesson, slide_id, revealed, t))


def lesson_from_timing(slug: str) -> dict:
    lesson = deepcopy(LESSONS[slug])
    timing_path = ROOT / "content/gcse-biology/timing" / f"{slug}.json"
    timing = json.loads(timing_path.read_text())
    times = {row["id"]: row for row in timing["slides"]}
    missing = [slide["id"] for slide in lesson["slides"] if slide["id"] not in times]
    if missing:
        raise SystemExit(f"{slug}: timing map missing slides {missing}")
    for slide in lesson["slides"]:
        row = times[slide["id"]]
        slide["t"] = row["t"]
        slide["aligned"] = True
    lesson["animate"] = {row["id"] for row in timing["slides"] if row.get("animate")}
    lesson["reveals"] = [{**event, "aligned": True} for event in timing["reveals"]]
    lesson["duration"] = float(timing["duration"])
    lesson["audio"] = "silent-visual-draft"
    lesson["words"] = []
    return lesson, timing


def silent_audio(duration: float, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "lavfi", "-i", "anullsrc=channel_layout=mono:sample_rate=44100",
        "-t", f"{duration:.3f}",
        "-c:a", "aac", "-b:a", "64k",
        str(dest),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise SystemExit(f"silent audio failed: {proc.stderr[-1000:]}")
    return dest


def md5_file(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe(path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,avg_frame_rate,codec_name",
        "-show_entries", "format=duration,size",
        "-of", "json",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr[-1000:])
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
    }


def extract_frame(src: Path, dest: Path, seconds: float) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{max(0.0, seconds):.3f}", "-i", str(src),
        "-frames:v", "1", "-q:v", "3",
        str(dest),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr[-1000:])
    return dest


def mean_luma(path: Path) -> float:
    img = Image.open(path).convert("L")
    return float(ImageStat.Stat(img).mean[0])


def qa_mp4(path: Path, expected: float, qa_dir: Path) -> dict:
    info = probe(path)
    checks = []
    checks.append(("resolution", info["width"] == W and info["height"] == H, f"{info['width']}x{info['height']}"))
    checks.append(("codec", info["codec"] == "h264", info["codec"]))
    checks.append(("fps", abs(info["fps"] - FPS) < 0.05, str(info["fps"])))
    checks.append(("duration", abs(info["duration"] - expected) < 0.6, f"{info['duration']:.3f}s vs {expected:.3f}s"))
    samples = {
        "start": 0.4,
        "early": min(8.0, max(1.0, expected * 0.12)),
        "mid": expected * 0.45,
        "late": max(1.0, expected - 2.5),
    }
    luma = {}
    for name, t in samples.items():
        frame = extract_frame(path, qa_dir / f"{name}.jpg", t)
        value = mean_luma(frame)
        luma[name] = round(value, 1)
        checks.append((f"not_black_{name}", value > 12, f"luma={value:.1f}"))
        img = Image.open(frame)
        checks.append((f"frame_size_{name}", img.size == (W, H), str(img.size)))
    failed = [name for name, ok, _ in checks if not ok]
    return {
        "pass": not failed,
        "failed": failed,
        "probe": info,
        "luma": luma,
        "checks": [{"name": name, "ok": ok, "detail": detail} for name, ok, detail in checks],
    }


def upload_draft(local: Path, storage_path: str, content_type: str) -> str:
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is missing")
    endpoint = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{BUCKET}/{storage_path}"
    body = local.read_bytes()
    req = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": content_type,
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:400]
        if exc.code not in {409}:
            raise RuntimeError(f"upload failed HTTP {exc.code}: {detail}") from exc
    public = f"{PUBLIC_BASE}/{storage_path}"
    head = urllib.request.Request(public, method="HEAD")
    with urllib.request.urlopen(head, timeout=60) as resp:
        status = resp.status
        ctype = resp.headers.get("content-type", "")
    if status >= 400:
        raise RuntimeError(f"public HEAD failed HTTP {status}")
    if "mp4" not in ctype and "octet" not in ctype and "video" not in ctype:
        raise RuntimeError(f"public type was {ctype}")
    return public


def write_register(rows: list[dict]) -> Path:
    path = ROOT / "content/gcse-biology/VISUAL_DRAFT_REGISTER.md"
    lines = [
        "# GCSE Biology visual-draft register",
        "",
        "These MP4s are **silent visual-only drafts**. They are not completed teaching videos.",
        "Cloned-voice narration is still blocked on ElevenLabs quota (`52` credits remaining vs `825` required per request).",
        "Do not publish these drafts to jdscience.co.uk or YouTube.",
        "Do not alter completed 1.1 Cell Division or 1.2 Bacterial Growth.",
        "When cloned-voice MP3s exist, re-encode from `1-3-transport-in-cells` using the existing cloned voice only.",
        "Keep future YouTube uploads Unlisted until approved for Public.",
        "",
        "| Spec | Lesson | Filename | Duration | Narration | QA | Download |",
        "| --- | --- | --- | ---: | --- | --- | --- |",
    ]
    for row in rows:
        duration = f"{row['duration']:.1f}s" if row.get("duration") else "—"
        qa = "pass" if row.get("qa_pass") else ("fail" if row.get("error") or row.get("qa") else "pending")
        url = row.get("download_url") or "local only"
        lines.append(
            f"| {row['spec']} | {row['title']} | `{row['filename']}` | {duration} "
            f"| visual-only draft | {qa} | {url} |"
        )
    lines += [
        "",
        "Local copies: `content/gcse-biology/visual-drafts/{slug}/`.",
        "Timing maps used for these drafts remain in `content/gcse-biology/timing/`.",
        "",
    ]
    path.write_text("\n".join(lines) + "\n")
    (ROOT / "content/gcse-biology/visual-draft-register.json").write_text(json.dumps(rows, indent=2) + "\n")
    return path


def render_one(slug: str, artifacts: Path) -> dict:
    if slug in HOSTED:
        raise SystemExit(f"refusing to re-encode hosted lesson {slug}")
    script = BY_SLUG[slug]
    lesson, timing = lesson_from_timing(slug)
    dest_dir = DRAFTS / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    artifacts.mkdir(parents=True, exist_ok=True)
    filename = script.filename.replace("-1080p.mp4", "-visual-draft-1080p.mp4")
    dest = dest_dir / filename
    art = artifacts / filename
    work = Path("/tmp/jdscience_biology") / f"{slug}-visual-draft"
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True, exist_ok=True)
    audio = silent_audio(lesson["duration"], work / "silent.m4a")
    (dest_dir / "timing.json").write_text(json.dumps(timing, indent=2) + "\n")

    bio_align.install()
    foundations_render.render_slide = render_slide_draft
    try:
        encode_lesson(lesson, audio, dest, work / "frames")
    finally:
        foundations_render.render_slide = bio_draw.render_slide
        shutil.rmtree(work, ignore_errors=True)

    if dest.resolve() != art.resolve():
        shutil.copy2(dest, art)

    qa = qa_mp4(dest, lesson["duration"], artifacts / "biology-visual-draft-qa" / slug)
    storage_path = f"gcse-igcse/biology/visual-drafts/{slug}/{filename}"
    download_url = None
    upload_error = None
    try:
        download_url = upload_draft(dest, storage_path, "video/mp4")
    except Exception as exc:
        upload_error = str(exc)

    row = {
        "slug": slug,
        "spec": script.spec,
        "title": script.title,
        "filename": filename,
        "kind": "visual_only_draft",
        "narration": "pending_cloned_voice",
        "youtube": "not_uploaded",
        "site": "not_published",
        "duration": lesson["duration"],
        "bytes": dest.stat().st_size,
        "md5": md5_file(dest),
        "local_path": str(dest.relative_to(ROOT)),
        "artifact_path": str(art),
        "download_url": download_url,
        "upload_error": upload_error,
        "qa_pass": qa["pass"],
        "qa": qa,
        "timing": str((ROOT / "content/gcse-biology/timing" / f"{slug}.json").relative_to(ROOT)),
        "resume_note": "Re-encode against cloned-voice MP3. Do not stretch narration to this estimated clock.",
    }
    (dest_dir / "report.json").write_text(json.dumps(row, indent=2) + "\n")
    (artifacts / f"{slug}-visual-draft-report.json").write_text(json.dumps(row, indent=2) + "\n")
    return row


def load_existing_rows() -> list[dict]:
    path = ROOT / "content/gcse-biology/visual-draft-register.json"
    if not path.exists():
        return []
    return json.loads(path.read_text())


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", choices=remaining_slugs())
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--skip-done", action="store_true")
    parser.add_argument("--out", type=Path, default=ARTIFACTS)
    args = parser.parse_args(argv)
    slugs = [args.slug] if args.slug else remaining_slugs()
    if not args.slug and not args.all:
        slugs = remaining_slugs()[:1]
    rows_by_slug = {row["slug"]: row for row in load_existing_rows()}
    for slug in slugs:
        existing = rows_by_slug.get(slug) or {}
        done = Path(ROOT / existing.get("local_path", "missing"))
        if args.skip_done and existing.get("qa_pass") and done.exists():
            print(f"=== skip done {slug} ===", flush=True)
            continue
        print(f"=== visual draft {slug} ===", flush=True)
        try:
            row = render_one(slug, args.out)
        except Exception as exc:
            traceback.print_exc()
            row = {
                "slug": slug,
                "spec": BY_SLUG[slug].spec,
                "title": BY_SLUG[slug].title,
                "filename": BY_SLUG[slug].filename.replace("-1080p.mp4", "-visual-draft-1080p.mp4"),
                "kind": "visual_only_draft",
                "narration": "pending_cloned_voice",
                "error": str(exc),
                "qa_pass": False,
            }
        rows_by_slug[slug] = row
        ordered = [rows_by_slug[item] for item in remaining_slugs() if item in rows_by_slug]
        write_register(ordered)
        print(json.dumps({k: row.get(k) for k in (
            "slug", "filename", "duration", "bytes", "download_url", "qa_pass", "error", "upload_error"
        ) if k in row}, indent=2), flush=True)


if __name__ == "__main__":
    main()
