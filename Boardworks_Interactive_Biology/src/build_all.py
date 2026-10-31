#!/usr/bin/env python3
"""Build all four reconstructed presentations."""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from diagrams import generate_all
import build_part1
import build_part2
import build_part3
import build_part4

if __name__ == "__main__":
    generate_all()
    for mod in (build_part1, build_part2, build_part3, build_part4):
        path, deck = mod.build()
        print(path, "slides", len(deck.prs.slides))
