#!/usr/bin/env python3
"""Build timing map, preview stills, PowerPoint and the 1080p video."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from empirical_formula_video import pptx_export, render, timing


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--video", action="store_true", help="encode the full 1080p mp4")
    args = p.parse_args()
    out = ROOT / "content/videos/empirical-formula"
    out.mkdir(parents=True, exist_ok=True)
    timing.write_map(out / "timing_map.json")
    print("timing map written")
    pptx = pptx_export.build()
    print("pptx", pptx)
    render.main(["--stills", "--preview"])
    if args.video:
        render.main(["--video"])


if __name__ == "__main__":
    main()
