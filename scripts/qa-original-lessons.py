#!/usr/bin/env python3
"""Quality checks for the original Unit 1 lesson batch."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "content/lessons"
BANNED = (
    "boardworks",
    "chemsheets",
    "pixl",
    "tes.com",
    "kashmir mangat",
    "sebastian male",
    "shauna mcsweeney",
    "marcus wesley",
    "claire cramer",
    "jdscience btec",
    "jdscience –",
    "jdscience -",
)

SLUGS = [
    "atomic-structure",
    "electron-configuration",
    "ionic-bonding",
    "covalent-bonding",
    "metallic-bonding",
    "cell-structure",
    "prokaryotic-and-eukaryotic-cells",
    "microscopy",
    "progressive-waves",
    "wave-properties",
]


def slide_text(pptx: Path) -> tuple[int, str, str]:
    z = zipfile.ZipFile(pptx)
    core = z.read("docProps/core.xml").decode("utf-8", "ignore")
    title = ""
    if "<dc:title>" in core:
        title = core.split("<dc:title>", 1)[1].split("</dc:title>", 1)[0]
    slides = sorted(
        [n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")],
        key=lambda n: int("".join(ch for ch in n if ch.isdigit()) or 0),
    )
    bits = []
    for name in slides:
        root = ET.fromstring(z.read(name))
        for node in root.iter():
            if node.tag.endswith("}t") and node.text:
                bits.append(node.text)
    z.close()
    return len(slides), title, "\n".join(bits)


def main() -> int:
    failed = 0
    for slug in SLUGS:
        folder = ROOT / slug
        pptxes = list(folder.glob("btec-unit-1-*.pptx"))
        pptx = pptxes[0] if pptxes else folder / f"{slug}.pptx"
        worksheets = list(folder.glob("btec-unit-1-*worksheet.pdf"))
        answers = list(folder.glob("btec-unit-1-*answers.pdf"))
        ws = worksheets[0] if worksheets else folder / f"{slug}-worksheet.pdf"
        ans = answers[0] if answers else folder / f"{slug}-answers.pdf"
        print(f"\n== {slug} ==")
        if not pptx.exists():
            print("  FAIL missing pptx")
            failed += 1
            continue
        n, title, text = slide_text(pptx)
        low = (title + "\n" + text).lower()
        print(f"  title: {title}")
        print(f"  slides: {n}")
        print(f"  worksheet: {ws.exists()}  answers: {ans.exists()}")
        if "jdscience" in title.lower():
            print("  FAIL JDScience in title")
            failed += 1
        if n < 20:
            print(f"  FAIL too few slides ({n})")
            failed += 1
        hits = [b for b in BANNED if b in low]
        if hits:
            print(f"  FAIL banned phrases: {hits}")
            failed += 1
        if "jdscience.co.uk" not in low:
            print("  FAIL missing footer domain")
            failed += 1
        if "learning objectives" not in low:
            print("  FAIL missing learning objectives")
            failed += 1
        if "exam-style" not in low:
            print("  FAIL missing exam-style practice")
            failed += 1
        if not ws.exists() or not ans.exists():
            print("  FAIL missing worksheet or answers")
            failed += 1
        if ws.exists() and ws.stat().st_size < 8000:
            print("  FAIL worksheet too small for a multi-page resource")
            failed += 1
        banned_plain = ("Al3+", "1s2 2s2 2p4", "m s-1", "10-4 s", "Ar is the weighted")
        for phrase in banned_plain:
            if phrase in text:
                print(f"  FAIL plain-text notation: {phrase}")
                failed += 1
        if failed == 0 or True:
            print("  text chars", len(text))
    print("\nFAILED checks:" , failed)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
