#!/usr/bin/env python3
"""Deep structural checks for the combined course PPTX."""

from __future__ import annotations

import json
import os
import re
import zipfile
from collections import defaultdict

from lxml import etree

from verify_pptx import inspect

A_HLINK = "{http://schemas.openxmlformats.org/drawingml/2006/main}hlinkClick"
A_T = "{http://schemas.openxmlformats.org/drawingml/2006/main}t"
R_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def slide_index(name: str) -> int:
    return int(re.search(r"slide(\d+)\.xml", name).group(1))


def shape_label(sp) -> str:
    texts = [t.text or "" for t in sp.findall(".//" + A_T)]
    return " ".join(t.strip() for t in texts if t and t.strip())


def graph(path: str) -> dict:
    z = zipfile.ZipFile(path)
    names = z.namelist()
    slides = sorted(
        (n for n in names if n.startswith("ppt/slides/slide") and n.endswith(".xml")),
        key=slide_index,
    )
    hidden = set()
    titles = {}
    outgoing = defaultdict(list)  # slide xml -> list of target slide xml
    incoming = defaultdict(list)
    missing = []
    labelled = []  # (src, label, dest, dest_hidden)
    timing = 0
    home_hits = 0
    try_again = 0
    reset = 0
    check = 0
    back = 0

    for sld in slides:
        root = etree.fromstring(z.read(sld))
        if root.get("show") == "0":
            hidden.add(sld)
        texts = [t.text or "" for t in root.findall(".//" + A_T)]
        blob = " ".join(texts)
        titles[sld] = (texts[0] if texts else "").strip()
        low = blob.lower()
        if "home" in low:
            home_hits += 1
        if "try again" in low:
            try_again += 1
        if re.search(r"\breset\b", low):
            reset += 1
        if re.search(r"\bcheck\b", low) or "show all" in low or "show answer" in low:
            check += 1
        if "back" in low or "try again" in low:
            back += 1
        if root.find("{http://schemas.openxmlformats.org/presentationml/2006/main}timing") is not None:
            timing += 1
        rels_name = sld.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
        rel_map = {}
        if rels_name in names:
            rels = etree.fromstring(z.read(rels_name))
            for rel in rels:
                rel_map[rel.get("Id")] = rel.get("Target")
        for hl in root.findall(".//" + A_HLINK):
            rid = hl.get(R_ID)
            tgt = rel_map.get(rid)
            if not tgt:
                missing.append((sld, rid, None))
                continue
            dest = os.path.normpath(os.path.join(os.path.dirname(sld), tgt)).replace("\\", "/")
            if dest not in slides and dest not in names:
                missing.append((sld, rid, dest))
            else:
                outgoing[sld].append(dest)
                incoming[dest].append(sld)
                sp = hl.getparent()
                while sp is not None and not sp.tag.endswith("}sp"):
                    sp = sp.getparent()
                label = shape_label(sp) if sp is not None else ""
                labelled.append((sld, label, dest))
    labelled = [
        (src, label, dest, dest in hidden if dest in slides else None)
        for src, label, dest in labelled
    ]

    visible = [s for s in slides if s not in hidden]
    orphans_hidden = [s for s in hidden if s not in incoming]
    return {
        "slides": slides,
        "hidden": hidden,
        "visible": visible,
        "titles": titles,
        "outgoing": outgoing,
        "incoming": incoming,
        "missing": missing,
        "labelled": labelled,
        "home_hits": home_hits,
        "try_again": try_again,
        "reset": reset,
        "check": check,
        "back": back,
        "orphans_hidden": orphans_hidden,
        "timing": timing,
    }


def classify(g: dict) -> dict:
    menu = g["slides"][0]
    issues = []
    home_wrong = []
    try_again_wrong = []
    check_not_hidden = []
    reset_to_hidden = []
    sequential_next = {}
    sequential_prev = {}

    for src, label, dest, dest_hidden in g["labelled"]:
        low = label.lower().strip()
        if low == "home":
            if dest != menu:
                home_wrong.append((src, dest, g["titles"].get(dest, "")))
        elif low == "try again":
            if dest_hidden:
                try_again_wrong.append((src, dest, g["titles"].get(dest, "")))
        elif low in {"check", "show all", "show all answers", "show answer"}:
            if dest_hidden is False:
                check_not_hidden.append((src, label, dest, g["titles"].get(dest, "")))
        elif low == "reset":
            if dest_hidden:
                reset_to_hidden.append((src, dest, g["titles"].get(dest, "")))
        elif label.strip() == "▶":
            sequential_next[src] = dest
        elif label.strip() == "◀":
            sequential_prev[src] = dest

    # Visible teaching chain: each visible slide (except last) should have ▶ to the next visible.
    vis = g["visible"]
    chain_breaks = []
    for i, s in enumerate(vis[:-1]):
        dest = sequential_next.get(s)
        expected = vis[i + 1]
        if dest != expected:
            chain_breaks.append(
                {
                    "from": s,
                    "from_title": g["titles"].get(s, ""),
                    "got": dest,
                    "got_title": g["titles"].get(dest, "") if dest else None,
                    "expected": expected,
                    "expected_title": g["titles"].get(expected, ""),
                }
            )

    # Menu targets should include the four part titles.
    menu_titles = [g["titles"].get(d, "") for d in g["outgoing"][menu]]
    part_hits = {
        "part1": any("Part 1" in t for t in menu_titles),
        "part2": any("Part 2" in t for t in menu_titles),
        "part3": any("Part 3" in t for t in menu_titles),
        "part4": any("Part 4" in t for t in menu_titles),
    }
    if not all(part_hits.values()):
        issues.append("menu missing a part title target")

    home_src = {src for src, label, dest, _ in g["labelled"] if label.lower().strip() == "home"}
    missing_home_btn = [s for s in g["slides"][1:] if s not in home_src]

    # Continue / Back to quiz from hidden should land on a real slide
    continue_from_hidden = 0
    continue_broken = []
    for src, label, dest, dest_hidden in g["labelled"]:
        if src not in g["hidden"]:
            continue
        low = label.lower().strip()
        if low in {"continue", "try again", "back", "back to quiz", "home"}:
            continue_from_hidden += 1
            if dest not in g["slides"]:
                continue_broken.append((src, label, dest))

    return {
        "home_wrong": home_wrong,
        "try_again_wrong": try_again_wrong,
        "check_not_hidden": check_not_hidden,
        "reset_to_hidden": reset_to_hidden,
        "chain_breaks": chain_breaks,
        "part_hits": part_hits,
        "missing_home_btn": missing_home_btn,
        "home_button_count": len(home_src),
        "continue_from_hidden": continue_from_hidden,
        "continue_broken": continue_broken,
        "issues": issues,
        "menu_titles": menu_titles,
        "seq_next_count": len(sequential_next),
        "seq_prev_count": len(sequential_prev),
    }


def main():
    root = os.path.join(os.path.dirname(__file__), "..")
    path = os.path.join(root, "JD_Science_Complete_Interactive_Nervous_System_Course.pptx")
    info = inspect(path)
    g = graph(path)
    c = classify(g)
    print("=== package ===")
    for k, v in info.items():
        if k == "content_types":
            continue
        print(f"{k}: {v}")
    print("\n=== graph ===")
    print("visible", len(g["visible"]), "hidden", len(g["hidden"]))
    print("broken/missing rels", g["missing"])
    print("hidden slides with no inbound link", len(g["orphans_hidden"]))
    if g["orphans_hidden"]:
        for s in g["orphans_hidden"][:12]:
            print("  orphan", s, g["titles"].get(s, "")[:60])
    print("slides containing 'Home'", g["home_hits"])
    print("slides containing Try again", g["try_again"])
    print("slides containing Reset", g["reset"])
    print("slides containing Check/Show", g["check"])
    print("slides containing Back/Try again", g["back"])
    print("slides with p:timing", g["timing"])
    print("\n=== labelled hyperlink checks ===")
    print("Home buttons", c["home_button_count"], "wrong targets", c["home_wrong"][:5])
    print("missing Home on slides", len(c["missing_home_btn"]))
    if c["missing_home_btn"]:
        for s in c["missing_home_btn"][:8]:
            print("  no Home", s, g["titles"].get(s, "")[:50])
    print("Try again -> hidden (should be 0)", c["try_again_wrong"])
    print("Check/Show -> visible (should be 0 unless Show all jumps to last tree level)", c["check_not_hidden"])
    print("Reset -> hidden (should be 0)", c["reset_to_hidden"])
    print("seq ▶ count", c["seq_next_count"], "◀ count", c["seq_prev_count"], "chain breaks", len(c["chain_breaks"]))
    if c["chain_breaks"]:
        for b in c["chain_breaks"][:8]:
            print("  break", b)
    print("return-from-hidden buttons", c["continue_from_hidden"], "broken", c["continue_broken"])
    print("\n=== visible teaching order (markers) ===")
    for i, s in enumerate(g["visible"], 1):
        t = g["titles"][s][:70]
        if i <= 12 or "Part" in t or "menu" in t.lower() or "End of" in t or "Course" in t:
            print(f"{i:3d} {t}")
    print("last visible", g["titles"][g["visible"][-1]][:70])
    first = g["slides"][0]
    print("\nmenu slide", first, "hidden?", first in g["hidden"], "out", len(g["outgoing"][first]))
    print("menu targets:")
    for dest in g["outgoing"][first]:
        print(" ", dest, g["titles"].get(dest, "")[:70])
    print("part hits", c["part_hits"])

    summary = {
        "slides": len(g["slides"]),
        "visible": len(g["visible"]),
        "hidden": len(g["hidden"]),
        "broken": info["broken_hyperlinks"],
        "missing_rels": g["missing"],
        "orphans_hidden": len(g["orphans_hidden"]),
        "home_wrong": c["home_wrong"],
        "missing_home_btn": len(c["missing_home_btn"]),
        "try_again_wrong": c["try_again_wrong"],
        "check_not_hidden": [(a, b, d) for a, b, _c, d in c["check_not_hidden"]],
        "reset_to_hidden": c["reset_to_hidden"],
        "chain_breaks": len(c["chain_breaks"]),
        "continue_broken": c["continue_broken"],
        "part_hits": c["part_hits"],
        "timing": g["timing"],
        "vba": info["has_vba"],
        "swf": info["swf"],
        "ole": info["ole_or_embeddings"],
    }
    out = os.path.join(root, "reports", "combined_verify.json")
    with open(out, "w") as f:
        json.dump(summary, f, indent=2, default=str)
    print("wrote", out)


if __name__ == "__main__":
    main()
