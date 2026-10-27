"""Cue matching for biology TTS, which spells DNA and reads numerals as words."""

from __future__ import annotations

import re

from gcse_foundations import render as foundations_render

ONES = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

ACRONYMS = {
    "dna": ["d", "n", "a"],
    "rna": ["r", "n", "a"],
    "atp": ["a", "t", "p"],
    "adh": ["a", "d", "h"],
    "fsh": ["f", "s", "h"],
    "lh": ["l", "h"],
    "hiv": ["h", "i", "v"],
    "co2": ["c", "o", "two"],
    "o2": ["o", "two"],
    "h2o": ["h", "two", "o"],
}


def _int_words(n: int) -> list[str]:
    if n < 20:
        return [ONES[n]]
    if n < 100:
        tens, ones = divmod(n, 10)
        return [TENS[tens]] + ([ONES[ones]] if ones else [])
    if n == 100:
        return ["one", "hundred"]
    return [str(n)]


def pieces(text: str) -> list[str]:
    text = text.lower().replace("×", "x").replace("°c", " degrees celsius ").replace("°", " degrees ")
    out: list[str] = []
    for part in re.split(r"[^a-z0-9]+", text):
        if not part:
            continue
        if part in {"neurones", "neurons"}:
            out.append("neurons")
        elif part in {"ethene", "etheen"}:
            out.append("ethene")
        elif part == "jd":
            out.extend(["j", "d"])
        elif part == "gcse":
            out.extend(["g", "c", "s", "e"])
        elif part in ACRONYMS:
            out.extend(ACRONYMS[part])
        elif part.isdigit():
            out.extend(_int_words(int(part)))
        else:
            out.append(part)
    return out


def install() -> None:
    foundations_render._pieces = pieces
