#!/usr/bin/env python3
"""Generate shop covers and worksheet download packs without rebuilding the decks."""

from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from original_lessons.covers import build_covers
from original_lessons.worksheets import build_shop_packs

ROOT = HERE.parent
OUT = ROOT / "content/lessons"


def main():
    for path in build_covers():
        print(f"COVER {path}")
    for path in build_shop_packs(OUT):
        print(f"PACK  {path}")


if __name__ == "__main__":
    main()
