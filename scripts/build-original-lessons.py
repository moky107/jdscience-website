#!/usr/bin/env python3
"""Build the first 10 original BTEC Unit 1 lessons and companion worksheets."""

from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from original_lessons import diagrams as dg
from original_lessons.lessons_biology import build_cell_structure, build_microscopy, build_prokaryotes
from original_lessons.lessons_chemistry import (
    build_atomic_structure,
    build_covalent_bonding,
    build_electron_configuration,
    build_ionic_bonding,
    build_metallic_bonding,
)
from original_lessons.lessons_physics import build_progressive_waves, build_wave_properties
from original_lessons.covers import build_covers
from original_lessons.worksheets import build_all as build_worksheets

ROOT = HERE.parent
OUT = ROOT / "content/lessons"

LESSONS = [
    ("atomic-structure", "btec-unit-1-chemistry-atomic-structure", build_atomic_structure),
    ("electron-configuration", "btec-unit-1-chemistry-electron-configuration", build_electron_configuration),
    ("ionic-bonding", "btec-unit-1-chemistry-ionic-bonding", build_ionic_bonding),
    ("covalent-bonding", "btec-unit-1-chemistry-covalent-bonding", build_covalent_bonding),
    ("metallic-bonding", "btec-unit-1-chemistry-metallic-bonding", build_metallic_bonding),
    ("cell-structure", "btec-unit-1-biology-cell-structure", build_cell_structure),
    ("prokaryotic-and-eukaryotic-cells", "btec-unit-1-biology-prokaryotic-and-eukaryotic-cells", build_prokaryotes),
    ("microscopy", "btec-unit-1-biology-microscopy", build_microscopy),
    ("progressive-waves", "btec-unit-1-physics-progressive-waves", build_progressive_waves),
    ("wave-properties", "btec-unit-1-physics-wave-properties", build_wave_properties),
]


def main():
    dg.all_diagrams()
    results = []
    for slug, filename, builder in LESSONS:
        ppt = OUT / slug / f"{filename}.pptx"
        title, n = builder(ppt)
        results.append((title, slug, n, ppt))
        print(f"PPT  {n:3d} slides  {title}  -> {ppt}")
    for title, q, a in build_worksheets(OUT):
        print(f"WS   {title}  -> {q.name} / {a.name}")
    for path in build_covers():
        print(f"COVER {path}")
    print(f"\nBuilt {len(results)} presentations.")
    return results


if __name__ == "__main__":
    main()
