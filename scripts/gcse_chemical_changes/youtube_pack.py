#!/usr/bin/env python3
"""Write Unlisted YouTube titles, descriptions and a machine-readable upload pack.

Does not upload. Does not re-encode MP4s. Thumbnails are 1280×720 JPEG.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_chemical_changes.covers import write_all
from gcse_chemical_changes.narration import LESSONS

PUBLISH = ROOT / "content/gcse-chemical-changes/publish.json"
OUT_DIR = ROOT / "content/gcse-chemical-changes/youtube"
SITE = "https://www.jdscience.co.uk"


def website_url(slug: str) -> str:
    return f"{SITE}/resources/gcse/chemistry/videos/{slug}/"


def title_for(script) -> str:
    if script.tier == "Higher Tier":
        return f"GCSE Chemistry | {script.title} (Higher Tier) | JD Science"
    return f"GCSE Chemistry | {script.title} | JD Science"


def description_for(script, download_url: str) -> str:
    ht_line = ""
    if script.tier == "Higher Tier":
        ht_line = "This lesson is labelled Higher Tier.\n\n"
    return (
        f"{script.description}\n\n"
        f"{ht_line}"
        "This GCSE Chemistry lesson follows the JD Science six-stage format: "
        "introduction, detailed explanation, worked example, your turn, model answer and recap.\n\n"
        f"Specification: {script.spec_label}\n"
        f"Tier: {script.tier}\n\n"
        "In this lesson you will:\n"
        "- Learn the required GCSE ideas with accurate 2D diagrams\n"
        "- Work through an examination-style example\n"
        "- Pause and attempt a practice question\n"
        "- Check the model answer and marking points\n\n"
        f"Watch on the JD Science website: {website_url(script.slug)}\n"
        f"Download the MP4: {download_url}\n"
        "More lessons: https://jdscience.co.uk\n\n"
        f"Keywords: GCSE Chemistry, Chemical Changes, AQA Chemistry, Edexcel Chemistry, "
        f"{script.title}, acids, salts, electrolysis, JD Science\n\n"
        "#GCSEChemistry #ChemicalChanges #JDScience #AQA #Edexcel\n"
    )


def main() -> None:
    published = {row["slug"]: row for row in json.loads(PUBLISH.read_text())}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_all(Path("/opt/cursor/artifacts"))
    pack = []
    for script in LESSONS:
        row = published[script.slug]
        title = title_for(script)
        desc = description_for(script, row["url"])
        (OUT_DIR / f"{script.slug}.txt").write_text(f"TITLE: {title}\nPRIVACY: Unlisted\n\n{desc}")
        thumb = ROOT / "content/videos" / script.slug / "youtube-thumbnail.jpg"
        pack.append({
            "slug": script.slug,
            "title": title,
            "description": desc.strip(),
            "privacyStatus": "unlisted",
            "categoryId": "27",
            "tags": [
                "GCSE Chemistry", "Chemical Changes", "AQA", "Edexcel", "JD Science",
                script.title, "acids", "salts", "electrolysis",
            ],
            "thumbnail": str(thumb),
            "source_mp4": f"/opt/cursor/artifacts/{script.filename}",
            "download_url": row["url"],
            "website_url": website_url(script.slug),
            "narration_url": row.get("narration_url"),
        })
    (OUT_DIR / "upload-pack.json").write_text(json.dumps(pack, indent=2) + "\n")
    print(f"wrote {len(pack)} YouTube packs")


if __name__ == "__main__":
    main()
