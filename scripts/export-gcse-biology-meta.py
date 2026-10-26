#!/usr/bin/env python3
"""Write JS metadata from the Python narration register so Node catalog tests stay in sync."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_biology.narration import LESSONS

rows = [
    {
        "slug": lesson.slug,
        "spec": lesson.spec,
        "title": lesson.title,
        "subtitle": lesson.subtitle,
        "filename": lesson.filename,
        "youtube_filename": lesson.youtube_filename,
        "tier": lesson.tier,
        "description": lesson.description,
        "opening": lesson.spoken.startswith("Hello and welcome back to JD Science."),
        "has_jdscience_co_uk": "jdscience.co.uk" in lesson.spoken,
        "has_in_domain": "JDScience.in" in lesson.spoken or "jdscience.in" in lesson.spoken,
    }
    for lesson in LESSONS
]

dest = ROOT / "src/gcseBiologyLessonMeta.js"
body = "export const LESSONS = " + json.dumps(rows, indent=2) + ";\n\n"
body += "export const BY_SLUG = Object.fromEntries(LESSONS.map((item) => [item.slug, item]));\n"
dest.write_text(body)
print("wrote", dest, "lessons", len(rows))
