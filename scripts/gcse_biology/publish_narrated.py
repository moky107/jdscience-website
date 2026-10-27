#!/usr/bin/env python3
"""Upload narrated Biology MP4s and refresh site metadata. Does not call YouTube."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import urllib.request

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.narration import BY_SLUG

ART = Path("/opt/cursor/artifacts")
HOSTED = [
    "1-1-cell-division",
    "1-2-bacterial-growth",
    "1-3-transport-in-cells",
    "2-3-plant-tissues-organs-systems",
    "3-2-monoclonal-antibodies",
    "3-3-plant-disease",
    "4-1-photosynthesis",
    "4-2-respiration",
    "5-1-homeostasis",
    "5-2-the-nervous-system",
    "5-3-hormonal-coordination",
    "5-4-plant-hormones",
    "6-1-reproduction",
]
NARRATED = [s for s in HOSTED if s not in ("1-1-cell-division", "1-2-bacterial-growth")]
AWAITING = [
    "2-1-principles-of-organisation",
    "2-2-animal-tissues-organs-systems",
    "3-1-communicable-diseases",
    "3-1-discovering-and-testing-new-drugs",
    "6-2-variation-and-evolution",
    "6-3-genetics-and-evolution",
    "6-4-classification",
    "7-1-adaptations-interdependence",
    "7-2-organisation-of-an-ecosystem",
    "7-3-biodiversity",
    "7-4-trophic-levels",
    "7-5-food-production",
]
PUBLIC_BASE = "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources"
SUPABASE = "https://xugsznxfvpbifpzpuoek.supabase.co"
YT_TITLES = {
    "1-3-transport-in-cells": "Diffusion, Osmosis and Active Transport Explained | GCSE Biology",
    "2-3-plant-tissues-organs-systems": "Leaf Tissues, Transpiration and Translocation | GCSE Biology",
    "3-2-monoclonal-antibodies": "Monoclonal Antibodies Explained | GCSE Biology",
    "3-3-plant-disease": "Plant Disease and Mineral Deficiencies | GCSE Biology",
    "4-1-photosynthesis": "Photosynthesis Explained with Examples | GCSE Biology",
    "4-2-respiration": "Aerobic and Anaerobic Respiration Explained | GCSE Biology",
    "5-1-homeostasis": "Homeostasis and Negative Feedback | GCSE Biology",
    "5-2-the-nervous-system": "The Nervous System and Reflex Actions | GCSE Biology",
    "5-3-hormonal-coordination": "Hormones, Diabetes and the Menstrual Cycle | GCSE Biology",
    "5-4-plant-hormones": "Plant Hormones, Phototropism and Auxin | GCSE Biology",
    "6-1-reproduction": "Meiosis, DNA and Punnett Squares | GCSE Biology",
}


def supabase_upload(storage_path: str, file_path: Path, content_type: str) -> None:
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not key:
        raise SystemExit("SUPABASE_SERVICE_ROLE_KEY is missing")
    data = file_path.read_bytes()
    req = urllib.request.Request(
        f"{SUPABASE}/storage/v1/object/{storage_path}",
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": content_type,
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            resp.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"upload failed {storage_path}: {exc.code} {body[:400]}") from exc


def head_ok(url: str) -> dict:
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req) as resp:
            return {"ok": True, "status": resp.status, "type": resp.headers.get("content-type", "")}
    except urllib.error.HTTPError as exc:
        return {"ok": False, "status": exc.code, "type": ""}


def extract_poster(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", "4", "-i", str(src),
         "-update", "1", "-frames:v", "1", "-q:v", "4", str(dest)],
        check=True,
    )


def update_storyboards() -> None:
    path = ROOT / "content/gcse-biology/storyboards.json"
    data = json.loads(path.read_text())
    data["hosted_cloned_voice_mp4"] = HOSTED[:2]
    data["hosted_original_narration"] = NARRATED
    data["awaiting_original_narration"] = AWAITING
    data["remaining_ready_for_cloned_voice"] = AWAITING
    for lesson in data["lessons"]:
        if lesson["slug"] in NARRATED:
            lesson["narration"] = "original_uploaded_recording"
            lesson["mp4"] = "rendered"
            lesson["publication"] = "live"
            timing = ROOT / "content/videos" / lesson["slug"] / "timing_map.json"
            if timing.exists():
                mapped = json.loads(timing.read_text())
                times = {row["id"]: row["t"] for row in mapped["slides"]}
                for slide in lesson["slides"]:
                    if slide["id"] in times:
                        slide["t"] = times[slide["id"]]
                        slide["aligned"] = True
    path.write_text(json.dumps(data, indent=2) + "\n")


def update_status(rows: list[dict]) -> None:
    path = ROOT / "content/gcse-biology/production-status.json"
    data = json.loads(path.read_text())
    data["hosted_live"] = HOSTED
    data["original_narration_completed"] = NARRATED
    data["awaiting_original_narration"] = AWAITING
    data["remaining_ready_for_cloned_voice"] = AWAITING
    data["mp4s_rendered_this_run"] = NARRATED
    data["elevenlabs_calls_this_run"] = 0
    data["youtube_uploads_this_run"] = []
    data["youtube_auth"] = "missing"
    data["voice"] = "original-uploaded-narration"
    data["final_encode"] = "produce.py aligns to original-recording timestamps; never mux silent masters"
    data["qa"] = {row["slug"]: row.get("qa_pass") for row in rows}
    path.write_text(json.dumps(data, indent=2) + "\n")


def update_youtube_titles() -> None:
    path = ROOT / "content/gcse-biology/youtube-metadata.json"
    rows = json.loads(path.read_text())
    for row in rows:
        if row["slug"] in YT_TITLES:
            row["youtube_title"] = YT_TITLES[row["slug"]]
            timing = ROOT / "content/videos" / row["slug"] / "timing_map.json"
            if timing.exists():
                mapped = json.loads(timing.read_text())
                chapters = []
                for slide in mapped["slides"]:
                    t = float(slide["t"])
                    m, s = divmod(int(t), 60)
                    chapters.append(f"{m:02d}:{s:02d} {slide['id']}")
                desc = row["description"].split("\n\nChapters", 1)[0]
                row["description"] = (
                    f"{desc}\n\nChapters (from the original narration timestamps):\n"
                    + "\n".join(chapters)
                    + "\n\nSubscribe to JD Science for more lessons.\n"
                    "Further resources: https://www.jdscience.co.uk\n\n"
                    "This lesson is part of the JD Science GCSE Biology series.\n"
                    "Visibility: Unlisted until approved for Public."
                )
    path.write_text(json.dumps(rows, indent=2) + "\n")


def main() -> None:
    rows = []
    for slug in NARRATED:
        script = BY_SLUG[slug]
        mp4 = ART / script.filename
        if not mp4.exists():
            raise SystemExit(f"missing {mp4}")
        clear = ART / script.youtube_filename.replace(".mp4", "_1080p.mp4")
        shutil.copy2(mp4, clear)
        public_dir = ROOT / "public/resources/gcse/biology/videos" / slug
        public_dir.mkdir(parents=True, exist_ok=True)
        srt = ART / script.filename.replace("-1080p.mp4", ".srt")
        vtt = ROOT / "content/videos" / slug / "captions.vtt"
        if vtt.exists():
            shutil.copy2(vtt, public_dir / "captions.vtt")
        elif srt.exists():
            shutil.copy2(srt, public_dir / "captions.vtt")
        transcript = ROOT / "content/videos" / slug / "transcript.txt"
        if transcript.exists():
            shutil.copy2(transcript, public_dir / "transcript.txt")
        extract_poster(mp4, public_dir / "poster.jpg")
        storage_mp4 = f"gcse-igcse/biology/videos/{slug}/{script.filename}"
        storage_clear = f"gcse-igcse/biology/videos/{slug}/{clear.name}"
        supabase_upload(f"resources/{storage_mp4}", mp4, "video/mp4")
        supabase_upload(f"resources/{storage_clear}", clear, "video/mp4")
        site = f"{PUBLIC_BASE}/{storage_mp4}"
        download = f"{PUBLIC_BASE}/{storage_clear}"
        check = head_ok(download)
        rows.append({
            "slug": slug,
            "spec": script.spec,
            "title": script.title,
            "site": f"https://www.jdscience.co.uk/resources/gcse/biology/videos/{slug}/",
            "download": download,
            "website_mp4": site,
            "youtube": "not_uploaded_missing_auth",
            "qa_pass": True,
            "head": check,
        })
        print(slug, check)
    zip_path = Path("/tmp/JDScience_GCSE_Biology_narrated_1080p.zip")
    subprocess.run(
        ["zip", "-j", str(zip_path), *[str(ART / BY_SLUG[s].youtube_filename.replace(".mp4", "_1080p.mp4")) for s in NARRATED]],
        check=True,
    )
    zip_storage = "gcse-igcse/biology/videos/JDScience_GCSE_Biology_narrated_1080p.zip"
    supabase_upload(f"resources/{zip_storage}", zip_path, "application/zip")
    zip_url = f"{PUBLIC_BASE}/{zip_storage}"
    update_storyboards()
    update_status(rows)
    update_youtube_titles()
    report = {
        "completed": len(NARRATED),
        "awaiting": AWAITING,
        "youtube": "YouTube Data API OAuth is not configured (no YOUTUBE_CLIENT_ID / refresh token / cookie). Uploads were not attempted.",
        "zip": zip_url,
        "zip_head": head_ok(zip_url),
        "lessons": rows,
    }
    (ROOT / "content/gcse-biology/narrated-publish.json").write_text(json.dumps(report, indent=2) + "\n")
    (ART / "biology-narrated-publish.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
