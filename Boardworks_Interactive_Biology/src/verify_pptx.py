#!/usr/bin/env python3
"""Structural checks for rebuilt presentations. Does not execute macros."""

from __future__ import annotations

import os
import zipfile
from collections import Counter

from lxml import etree

A_HLINK = "{http://schemas.openxmlformats.org/drawingml/2006/main}hlinkClick"
P_SLD = "{http://schemas.openxmlformats.org/presentationml/2006/main}sld"
R_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def inspect(path: str) -> dict:
    z = zipfile.ZipFile(path)
    names = z.namelist()
    slides = sorted(n for n in names if n.startswith("ppt/slides/slide") and n.endswith(".xml"))
    hidden = 0
    hlinks = 0
    notes = 0
    flash = []
    vba = [n for n in names if "vba" in n.lower() or n.endswith(".bin") and "vba" in n.lower()]
    ole = [n for n in names if "ole" in n.lower() or n.startswith("ppt/embeddings/")]
    swf = [n for n in names if n.lower().endswith(".swf")]
    activex = [n for n in names if "activeX" in n or "activeX" in n]
    rel_targets = Counter()
    broken = []
    for sld in slides:
        root = etree.fromstring(z.read(sld))
        if root.get("show") == "0":
            hidden += 1
        hlinks += len(root.findall(".//" + A_HLINK))
        rels_name = sld.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
        rel_map = {}
        if rels_name in names:
            rels = etree.fromstring(z.read(rels_name))
            for rel in rels:
                rel_map[rel.get("Id")] = rel.get("Target")
                rel_targets[rel.get("Type", "").split("/")[-1]] += 1
        for hl in root.findall(".//" + A_HLINK):
            rid = hl.get(R_ID)
            tgt = rel_map.get(rid)
            if not tgt:
                broken.append((sld, rid))
        if sld.replace("ppt/slides/", "ppt/notesSlides/notesSlide") in names:
            notes += 1
        xml = z.read(sld).decode("utf-8", "ignore").lower()
        if "shockwave" in xml or ".swf" in xml or "flash" in xml:
            flash.append(sld)
    notes = len([n for n in names if n.startswith("ppt/notesSlides/notesSlide")])
    return {
        "file": os.path.basename(path),
        "bytes": os.path.getsize(path),
        "slides": len(slides),
        "hidden_slides": hidden,
        "hyperlinks": hlinks,
        "broken_hyperlinks": broken,
        "notes_slides": notes,
        "has_vba": bool(vba) or "[Content_Types].xml" in names
        and "vba" in z.read("[Content_Types].xml").decode("utf-8", "ignore").lower(),
        "ole_or_embeddings": ole,
        "swf": swf,
        "activex": activex,
        "flash_mentions": flash,
        "rel_types": dict(rel_targets),
        "content_types": z.read("[Content_Types].xml").decode("utf-8", "ignore")[:500],
    }


def main():
    root = os.path.join(os.path.dirname(__file__), "..")
    for name in sorted(os.listdir(root)):
        if name.endswith(".pptx"):
            info = inspect(os.path.join(root, name))
            print("=" * 60)
            for k, v in info.items():
                if k == "content_types":
                    continue
                print(f"{k}: {v}")


if __name__ == "__main__":
    main()
