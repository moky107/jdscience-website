"""Narration-driven timing map for the empirical-formulae video.

Timestamps come from faster-whisper word alignment of the master narration.
Cursor targets are omitted when a number cannot be aligned confidently.
"""

from __future__ import annotations

import json
from pathlib import Path

DURATION = 380.46
FPS = 30
TRANSITION = 0.40

# Slide changes — fired when the spoken topic changes, never on a fixed clock.
SLIDES = [
    {"t": 0.00, "id": "title", "note": "In today's video, we want to look at empirical formulae"},
    {"t": 28.12, "id": "definition", "note": "What is an empirical formula?"},
    {"t": 62.04, "id": "key_idea", "note": "Notice that an empirical formula shows the simplest ratio"},
    {"t": 71.04, "id": "method", "note": "How do we calculate an empirical formula?"},
    {"t": 96.94, "id": "example1", "note": "Example 1. Calculating empirical formula from masses"},
    {"t": 145.64, "id": "practice1_q", "note": "Practice question 1. Now it's your turn"},
    {"t": 165.84, "id": "practice1_ans", "note": "Let's check your answer"},
    {"t": 208.40, "id": "example2", "note": "Example 2. Calculating empirical formula from percentages"},
    {"t": 254.26, "id": "example2_work", "note": "Now, divide each mass by its relative atomic mass"},
    {"t": 296.30, "id": "practice2_q", "note": "Practice question 2"},
    {"t": 320.40, "id": "practice2_ans", "note": "Let's check your answer"},
    {"t": 378.02, "id": "close", "note": "Well done if you got that correct"},
]

# Progressive reveals. Each item appears at the moment it is spoken.
REVEALS = [
    # Title agenda
    {"t": 10.86, "slide": "title", "item": "a1"},
    {"t": 14.56, "slide": "title", "item": "a2"},
    {"t": 17.48, "slide": "title", "item": "a3"},
    {"t": 20.88, "slide": "title", "item": "a4"},
    # Definition
    {"t": 28.12, "slide": "definition", "item": "def"},
    {"t": 37.50, "slide": "definition", "item": "glucose"},
    {"t": 50.86, "slide": "definition", "item": "ratio"},
    {"t": 57.54, "slide": "definition", "item": "ch2o"},
    # Key idea
    {"t": 62.04, "slide": "key_idea", "item": "mol"},
    {"t": 62.50, "slide": "key_idea", "item": "emp"},
    {"t": 66.56, "slide": "key_idea", "item": "same"},
    # Method
    {"t": 73.98, "slide": "method", "item": "s1"},
    {"t": 75.84, "slide": "method", "item": "s1"},
    {"t": 79.02, "slide": "method", "item": "s2"},
    {"t": 85.14, "slide": "method", "item": "s3"},
    {"t": 89.26, "slide": "method", "item": "s4"},
    # Example 1 — masses first, then working
    {"t": 100.90, "slide": "example1", "item": "mg"},
    {"t": 100.90, "slide": "example1", "item": "mg_mass"},
    {"t": 103.50, "slide": "example1", "item": "o"},
    {"t": 103.50, "slide": "example1", "item": "o_mass"},
    {"t": 109.12, "slide": "example1", "item": "mg_ar"},
    {"t": 112.40, "slide": "example1", "item": "o_ar"},
    {"t": 119.32, "slide": "example1", "item": "mg_mol"},
    {"t": 123.92, "slide": "example1", "item": "o_mol"},
    {"t": 129.62, "slide": "example1", "item": "smallest"},
    {"t": 133.98, "slide": "example1", "item": "mg_ratio"},
    {"t": 136.42, "slide": "example1", "item": "o_ratio"},
    {"t": 139.10, "slide": "example1", "item": "overall"},
    {"t": 142.28, "slide": "example1", "item": "formula"},
    # Practice 1 question — no answer
    {"t": 148.54, "slide": "practice1_q", "item": "masses"},
    {"t": 154.02, "slide": "practice1_q", "item": "ar"},
    {"t": 159.64, "slide": "practice1_q", "item": "ask"},
    {"t": 161.96, "slide": "practice1_q", "item": "pause"},
    # Practice 1 answer
    {"t": 167.44, "slide": "practice1_ans", "item": "na"},
    {"t": 167.44, "slide": "practice1_ans", "item": "na_mass"},
    {"t": 167.44, "slide": "practice1_ans", "item": "na_ar"},
    {"t": 171.50, "slide": "practice1_ans", "item": "na_mol"},
    {"t": 176.56, "slide": "practice1_ans", "item": "o"},
    {"t": 176.56, "slide": "practice1_ans", "item": "o_mass"},
    {"t": 176.56, "slide": "practice1_ans", "item": "o_ar"},
    {"t": 176.56, "slide": "practice1_ans", "item": "o_mol"},
    {"t": 182.78, "slide": "practice1_ans", "item": "smallest"},
    {"t": 187.44, "slide": "practice1_ans", "item": "na_ratio"},
    {"t": 192.40, "slide": "practice1_ans", "item": "o_ratio"},
    {"t": 197.64, "slide": "practice1_ans", "item": "overall"},
    {"t": 202.56, "slide": "practice1_ans", "item": "formula"},
    # Example 2 setup
    {"t": 219.24, "slide": "example2", "item": "assume"},
    {"t": 227.18, "slide": "example2", "item": "pct"},
    {"t": 237.02, "slide": "example2", "item": "ar"},
    {"t": 243.34, "slide": "example2", "item": "assume"},
    {"t": 246.94, "slide": "example2", "item": "grams"},
    # Example 2 working
    {"t": 258.16, "slide": "example2_work", "item": "c"},
    {"t": 258.16, "slide": "example2_work", "item": "c_mass"},
    {"t": 258.16, "slide": "example2_work", "item": "c_ar"},
    {"t": 258.16, "slide": "example2_work", "item": "c_mol"},
    {"t": 264.04, "slide": "example2_work", "item": "h"},
    {"t": 264.04, "slide": "example2_work", "item": "h_mass"},
    {"t": 264.04, "slide": "example2_work", "item": "h_ar"},
    {"t": 264.04, "slide": "example2_work", "item": "h_mol"},
    {"t": 269.16, "slide": "example2_work", "item": "o"},
    {"t": 269.16, "slide": "example2_work", "item": "o_mass"},
    {"t": 269.16, "slide": "example2_work", "item": "o_ar"},
    {"t": 269.16, "slide": "example2_work", "item": "o_mol"},
    {"t": 276.08, "slide": "example2_work", "item": "c_ratio"},
    {"t": 276.08, "slide": "example2_work", "item": "h_ratio"},
    {"t": 276.08, "slide": "example2_work", "item": "o_ratio"},
    {"t": 281.48, "slide": "example2_work", "item": "overall"},
    {"t": 285.68, "slide": "example2_work", "item": "formula"},
    # Practice 2 question
    {"t": 300.52, "slide": "practice2_q", "item": "c"},
    {"t": 303.20, "slide": "practice2_q", "item": "h"},
    {"t": 306.26, "slide": "practice2_q", "item": "o"},
    {"t": 308.90, "slide": "practice2_q", "item": "ar"},
    {"t": 317.74, "slide": "practice2_q", "item": "pause"},
    # Practice 2 answer
    {"t": 322.08, "slide": "practice2_ans", "item": "c"},
    {"t": 325.56, "slide": "practice2_ans", "item": "c_mass"},
    {"t": 327.40, "slide": "practice2_ans", "item": "h"},
    {"t": 327.40, "slide": "practice2_ans", "item": "h_mass"},
    {"t": 329.40, "slide": "practice2_ans", "item": "o"},
    {"t": 329.40, "slide": "practice2_ans", "item": "o_mass"},
    {"t": 337.00, "slide": "practice2_ans", "item": "c_ar"},
    {"t": 337.00, "slide": "practice2_ans", "item": "c_mol"},
    {"t": 342.70, "slide": "practice2_ans", "item": "h_ar"},
    {"t": 342.70, "slide": "practice2_ans", "item": "h_mol"},
    {"t": 347.72, "slide": "practice2_ans", "item": "o_ar"},
    {"t": 347.72, "slide": "practice2_ans", "item": "o_mol"},
    {"t": 354.82, "slide": "practice2_ans", "item": "smallest"},
    {"t": 360.26, "slide": "practice2_ans", "item": "c_ratio"},
    {"t": 363.12, "slide": "practice2_ans", "item": "h_ratio"},
    {"t": 366.56, "slide": "practice2_ans", "item": "o_ratio"},
    {"t": 369.38, "slide": "practice2_ans", "item": "overall"},
    {"t": 374.50, "slide": "practice2_ans", "item": "formula"},
    # Close
    {"t": 378.02, "slide": "close", "item": "na2o"},
    {"t": 378.20, "slide": "close", "item": "c2h6o"},
    {"t": 378.40, "slide": "close", "item": "brand"},
]

# Cursor: only when a specific value, formula or step is spoken.
# target None hides the pointer. Hold times keep it still during the explanation.
CURSOR = [
    # Intro — hidden
    {"t": 0.00, "target": None},
    # Glucose formula
    {"t": 37.50, "target": "glucose", "hold": 5.0},
    {"t": 43.36, "target": "c6", "hold": 3.5},
    {"t": 47.34, "target": "h12", "hold": 2.0},
    {"t": 49.20, "target": "o6", "hold": 1.5},
    {"t": 50.86, "target": "r6a", "hold": 1.2},
    {"t": 52.40, "target": "r6b", "hold": 1.0},
    {"t": 53.48, "target": "out1", "hold": 0.8},
    {"t": 54.40, "target": "out2", "hold": 0.8},
    {"t": 55.40, "target": "out3", "hold": 1.2},
    {"t": 57.54, "target": "ch2o", "hold": 4.0},
    {"t": 62.04, "target": "mol", "hold": 3.0},
    {"t": 64.50, "target": "emp", "hold": 5.0},
    {"t": 71.00, "target": None},
    {"t": 75.84, "target": "s1", "hold": 3.0},
    {"t": 79.02, "target": "s2", "hold": 5.5},
    {"t": 85.14, "target": "s3", "hold": 4.0},
    {"t": 89.26, "target": "s4", "hold": 5.0},
    {"t": 94.22, "target": None},
    # Example 1 numbers — aligned to word timestamps
    {"t": 100.90, "target": "mg_mass", "hold": 2.2},
    {"t": 103.50, "target": "o_mass", "hold": 3.0},
    {"t": 109.12, "target": "mg_ar", "hold": 2.5},
    {"t": 112.40, "target": "o_ar", "hold": 2.2},
    {"t": 114.82, "target": None},
    {"t": 119.32, "target": "mg_mass", "hold": 0.7},
    {"t": 120.68, "target": "mg_ar", "hold": 0.7},
    {"t": 121.74, "target": "mg_mol", "hold": 1.8},
    {"t": 123.92, "target": "o_mass", "hold": 0.9},
    {"t": 126.24, "target": "o_ar", "hold": 0.8},
    {"t": 127.70, "target": "o_mol", "hold": 1.6},
    {"t": 129.62, "target": "small_01", "hold": 3.8},
    {"t": 134.16, "target": "mg_ratio", "hold": 2.0},
    {"t": 136.64, "target": "o_ratio", "hold": 2.2},
    {"t": 139.10, "target": "overall", "hold": 3.0},
    {"t": 142.28, "target": "mgo", "hold": 3.2},
    {"t": 145.50, "target": None},
    # Practice 1 question — point at given data, hide during pause
    {"t": 148.54, "target": "na_mass", "hold": 2.4},
    {"t": 151.50, "target": "o_mass", "hold": 2.2},
    {"t": 154.02, "target": "na_ar", "hold": 2.4},
    {"t": 157.20, "target": "o_ar", "hold": 2.0},
    {"t": 159.64, "target": "ask", "hold": 2.0},
    {"t": 161.90, "target": None},
    # Practice 1 answer
    {"t": 171.50, "target": "na_mass", "hold": 0.9},
    {"t": 173.10, "target": "na_ar", "hold": 0.9},
    {"t": 174.40, "target": "na_mol", "hold": 2.0},
    {"t": 176.56, "target": "o_mass", "hold": 1.0},
    {"t": 178.80, "target": "o_ar", "hold": 1.0},
    {"t": 180.40, "target": "o_mol", "hold": 2.0},
    {"t": 182.78, "target": "smallest", "hold": 4.4},
    {"t": 187.44, "target": "na_ratio", "hold": 4.6},
    {"t": 192.40, "target": "o_ratio", "hold": 4.8},
    {"t": 197.64, "target": "overall", "hold": 4.6},
    {"t": 202.56, "target": "na2o", "hold": 3.2},
    {"t": 205.92, "target": None},
    # Example 2
    {"t": 219.24, "target": "assume", "hold": 6.0},
    {"t": 227.18, "target": "c_pct", "hold": 2.2},
    {"t": 229.80, "target": "h_pct", "hold": 2.2},
    {"t": 232.06, "target": "o_pct", "hold": 2.5},
    {"t": 237.02, "target": "c_ar", "hold": 2.0},
    {"t": 240.50, "target": "h_ar", "hold": 1.8},
    {"t": 242.00, "target": "o_ar", "hold": 1.3},
    {"t": 243.34, "target": "assume", "hold": 3.3},
    {"t": 246.94, "target": "c_g", "hold": 2.2},
    {"t": 249.40, "target": "h_g", "hold": 2.0},
    {"t": 251.50, "target": "o_g", "hold": 2.5},
    {"t": 254.20, "target": None},
    {"t": 258.16, "target": "c_mass", "hold": 1.2},
    {"t": 259.80, "target": "c_ar", "hold": 1.2},
    {"t": 261.40, "target": "c_mol", "hold": 2.4},
    {"t": 264.04, "target": "h_mass", "hold": 1.2},
    {"t": 265.70, "target": "h_ar", "hold": 1.0},
    {"t": 267.00, "target": "h_mol", "hold": 2.0},
    {"t": 269.16, "target": "o_mass", "hold": 1.4},
    {"t": 271.40, "target": "o_ar", "hold": 1.2},
    {"t": 273.20, "target": "o_mol", "hold": 2.6},
    {"t": 276.08, "target": "c_ratio", "hold": 2.0},
    {"t": 279.40, "target": "h_ratio", "hold": 2.0},
    {"t": 281.48, "target": "overall", "hold": 4.0},
    {"t": 285.68, "target": "ch2o", "hold": 3.8},
    {"t": 289.68, "target": "assume", "hold": 0.0},  # assume is on previous slide; hide
    {"t": 289.70, "target": None},
    # Practice 2 question
    {"t": 300.52, "target": "c", "hold": 2.5},
    {"t": 303.20, "target": "h", "hold": 2.8},
    {"t": 306.26, "target": "o", "hold": 2.4},
    {"t": 308.90, "target": "ar", "hold": 6.0},
    {"t": 315.32, "target": None},
    # Practice 2 answer
    {"t": 322.08, "target": None},
    {"t": 325.56, "target": "c_mass", "hold": 1.8},
    {"t": 327.40, "target": "h_mass", "hold": 1.8},
    {"t": 329.40, "target": "o_mass", "hold": 3.0},
    {"t": 337.00, "target": "c_mass", "hold": 1.2},
    {"t": 338.80, "target": "c_ar", "hold": 1.0},
    {"t": 340.20, "target": "c_mol", "hold": 2.2},
    {"t": 342.70, "target": "h_mass", "hold": 1.2},
    {"t": 344.40, "target": "h_ar", "hold": 1.0},
    {"t": 345.50, "target": "h_mol", "hold": 2.0},
    {"t": 347.72, "target": "o_mass", "hold": 1.4},
    {"t": 350.20, "target": "o_ar", "hold": 1.2},
    {"t": 351.80, "target": "o_mol", "hold": 2.8},
    {"t": 354.82, "target": "small", "hold": 4.6},
    {"t": 360.26, "target": "c_ratio", "hold": 2.6},
    {"t": 363.12, "target": "h_ratio", "hold": 3.2},
    {"t": 366.56, "target": "o_ratio", "hold": 2.6},
    {"t": 369.38, "target": "overall", "hold": 4.8},
    {"t": 374.50, "target": "c2h6o", "hold": 3.4},
    {"t": 378.00, "target": None},
]


def revealed_at(t: float, slide_id: str) -> list[str]:
    items = []
    for ev in REVEALS:
        if ev["t"] <= t + 1e-6 and ev["slide"] == slide_id:
            if ev["item"] not in items:
                items.append(ev["item"])
    return items


def slide_at(t: float) -> str:
    current = SLIDES[0]["id"]
    for s in SLIDES:
        if t + 1e-6 >= s["t"]:
            current = s["id"]
        else:
            break
    return current


def build_map() -> dict:
    return {
        "duration": DURATION,
        "fps": FPS,
        "width": 1920,
        "height": 1080,
        "transition_s": TRANSITION,
        "audio": "source/narration_master.mp3",
        "slides": SLIDES,
        "reveals": REVEALS,
        "cursor": CURSOR,
        "notes": (
            "Master clock is the extracted ElevenLabs narration. "
            "Slide cuts follow spoken topic changes. "
            "Cursor events use word-level timestamps from faster-whisper small.en. "
            "If a number could not be aligned confidently the cursor is left hidden."
        ),
    }


def write_map(path: Path) -> Path:
    path.write_text(json.dumps(build_map(), indent=2) + "\n")
    return path
