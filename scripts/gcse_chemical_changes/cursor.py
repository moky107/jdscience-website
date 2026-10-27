"""Gold pointer targets aligned to chemical-changes slides and reveals."""

from __future__ import annotations

from gcse_foundations.render import find_cue
from jdscience_video.theme import H, W, hotspot


def _spot(x0, y0, x1, y1, pad=8) -> dict:
    return hotspot((x0, y0, x1, y1), pad=pad)


def spots_for_slide(slide: dict) -> dict:
    """Named boxes the gold pointer sits under. Coordinates match draw.py."""
    spots = {
        "title": _spot(88, 200, 980, 420),
        "heading": _spot(88, 118, 1500, 220),
        "diagram": _spot(88, 250, W - 88, 900),
        "equation": _spot(88, 260, W - 88, 520),
        "question": _spot(88, 250, W - 88, 400),
        "pause": _spot(88, 400, W - 88, 860),
        "answer": _spot(88, 250, W - 88, 520),
        "subscribe": _spot(480, 250, 1440, 400),
        "website": _spot(480, 330, 1440, 470),
        "r1": _spot(88, 260, 520, 860),
        "r2": _spot(540, 260, 970, 860),
        "r3": _spot(990, 260, 1420, 860),
        "r4": _spot(1440, 260, W - 88, 860),
        "p1": _spot(120, 590, 500, 680),
        "p2": _spot(530, 590, 910, 680),
        "p3": _spot(940, 590, 1320, 680),
        "p4": _spot(1350, 590, 1730, 680),
        "p5": _spot(120, 590, 500, 680),
        "cathode": _spot(240, 340, 420, 820),
        "anode": _spot(1500, 340, 1680, 820),
        "burette": _spot(200, 280, 360, 620),
        "flask": _spot(180, 620, 380, 860),
        "pipette": _spot(420, 300, 900, 520),
    }
    kind = slide.get("kind")
    if kind == "intro":
        spots["title"] = _spot(88, 150, 960, 420)
        spots["diagram"] = _spot(980, 240, 1830, 820)
    if kind == "aims":
        y = 250
        for key, _label in slide.get("items") or []:
            spots[key] = _spot(88, y, W - 88, y + 110)
            y += 130
    if kind == "bullets":
        items = slide.get("items") or []
        n = max(1, len(items))
        h = min(140, (620 - 16 * (n - 1)) // n)
        y = 250
        for key, _title, _body in items:
            spots[key] = _spot(88, y, W - 88, y + h)
            y += h + 16
    if kind == "worked":
        spots["question"] = _spot(88, 250, W - 88, 400)
        y = 430
        for key, _line in slide.get("steps") or []:
            spots[key] = _spot(88, y, W - 88, y + 110)
            y += 122
    if kind == "your_turn":
        spots["question"] = _spot(88, 250, W - 88, 360)
        spots["pause"] = _spot(88, 400, W - 88, 860)
    if kind == "model":
        spots["answer"] = _spot(88, 250, W - 88, 520)
        points = slide.get("points") or []
        n = max(1, len(points))
        width = min(400, (W - 200 - 16 * (n - 1)) // n)
        x = 120
        for i, _point in enumerate(points):
            spots[f"p{i + 1}"] = _spot(x, 590, x + width, 680)
            x += width + 16
    if kind == "recap":
        items = slide.get("items") or []
        n = max(1, len(items))
        w = (W - 176 - 20 * (n - 1)) // n
        for i in range(n):
            x = 88 + i * (w + 20)
            spots[f"r{i + 1}"] = _spot(x, 260, x + w, 860)
    if kind == "outro":
        spots["subscribe"] = _spot(400, 240, 1520, 380)
        spots["website"] = _spot(400, 340, 1520, 470)
    diagram = slide.get("diagram")
    if diagram in {"cell", "lead_bromide", "brine", "cuso4_inert", "copper_cell"}:
        spots["cathode"] = _spot(240, 340, 460, 820)
        spots["anode"] = _spot(1460, 340, 1680, 820)
        spots["diagram"] = _spot(160, 250, W - 160, 900)
    if diagram == "titration":
        spots["burette"] = _spot(200, 280, 360, 620)
        spots["flask"] = _spot(180, 620, 380, 860)
        spots["pipette"] = _spot(420, 300, 920, 540)
    if diagram == "ph_scale":
        spots["diagram"] = _spot(88, 250, W - 88, 900)
    if diagram == "acid_alkali":
        spots["diagram"] = _spot(88, 250, 900, 900)
    return spots


def _target_for_slide(slide: dict) -> str:
    kind = slide.get("kind")
    diagram = slide.get("diagram") or ""
    if kind == "intro":
        return "title"
    if kind == "equation":
        return "equation"
    if kind == "diagram":
        if diagram in {"cell", "lead_bromide", "brine", "cuso4_inert", "copper_cell"}:
            return "cathode"
        if diagram == "titration":
            return "burette"
        return "diagram"
    if kind == "worked":
        return "question"
    if kind == "your_turn":
        return "question"
    if kind == "model":
        return "answer"
    if kind == "outro":
        return "subscribe"
    return "heading"


def cursor_from_aligned(aligned: dict) -> list[dict]:
    """Build pointer events from already-aligned slide and reveal times."""
    events: list[dict] = []
    for slide in aligned.get("slides") or []:
        events.append({
            "t": float(slide["t"]),
            "target": _target_for_slide(slide),
            "aligned": bool(slide.get("aligned")),
            "cue": slide.get("cue"),
            "slide": slide["id"],
        })
    for ev in aligned.get("reveals") or []:
        events.append({
            "t": float(ev["t"]),
            "target": ev["item"],
            "aligned": bool(ev.get("aligned")),
            "cue": ev.get("cue"),
            "slide": ev["slide"],
        })
    words = aligned.get("words") or []
    extras = (
        ("Pause the video", "pause"),
        ("subscribe to JD Science", "subscribe"),
        ("j d science", "website"),
    )
    last_t = 0.0
    for cue, target in extras:
        t = find_cue(words, cue, after=max(0.0, last_t - 0.2))
        if t is None:
            continue
        last_t = t
        events.append({"t": round(t, 3), "target": target, "aligned": True, "cue": cue})
    events.sort(key=lambda e: (e["t"], e.get("target") or ""))
    return events
