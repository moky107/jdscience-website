"""Six-mark exam-technique scenes — boards, collision theory, evaluation, mistakes."""

from __future__ import annotations

import math
from typing import Iterable

from PIL import Image, ImageDraw

from .theme import (
    BG,
    GOLD,
    GREEN,
    H,
    INK,
    MUTED,
    NAVY_ROW,
    RED,
    STRAPLINE,
    TEAL,
    TEAL_BAR,
    W,
    WHITE,
    draw_chrome,
    draw_row,
    font,
    heading,
    hotspot,
    measure_run,
    new_canvas,
)

Hotspots = dict[str, dict]
TOPIC = "Six-mark questions"
PAGES = 13


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _base(page: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    return img, draw_chrome(img, page, PAGES, TOPIC)


def _chip(d, box, text, fill, ink=WHITE, size=22):
    d.rounded_rectangle(box, 16, fill=fill)
    d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), text, font=font("bold", size), fill=ink, anchor="mm")


def _paper(d, x, y, w=420, h=520, mark=None):
    d.rounded_rectangle((x, y, x + w, y + h), 8, fill=(248, 246, 238), outline=(210, 200, 170), width=2)
    d.rectangle((x, y, x + 18, y + h), fill=(196, 48, 58))
    d.text((x + 36, y + 22), "GCSE Chemistry", font=font("bold", 22), fill=(30, 40, 60))
    d.text((x + 36, y + 52), "Paper 1  ·  Higher", font=font("medium", 16), fill=(90, 100, 120))
    d.line((x + 36, y + 78, x + w - 24, y + 78), fill=(210, 200, 170), width=2)
    q = "Explain how increasing temperature\naffects the rate of a chemical\nreaction. Use collision theory\nin your answer."
    d.multiline_text((x + 36, y + 96), q, font=font("medium", 18), fill=(30, 40, 60), spacing=6)
    d.text((x + 36, y + 230), "(6 marks)", font=font("bold", 18), fill=(196, 48, 58))
    for i in range(7):
        yy = y + 270 + i * 28
        d.line((x + 36, yy, x + w - 28, yy), fill=(220, 214, 196), width=1)
    if mark is not None:
        colour = RED if mark < 6 else GREEN
        d.rounded_rectangle((x + w - 132, y + 16, x + w - 20, y + 70), 12, fill=colour)
        d.text((x + w - 76, y + 43), f"{mark}/6", font=font("bold", 28), fill=WHITE, anchor="mm")


def _curve(ax, ay, bx, u0, width, height):
    pts = []
    for i in range(48):
        u = i / 47
        x = ax + 20 + u * (bx - ax - 40)
        y = ay - 12 - math.exp(-((u - u0) ** 2) / width) * height
        pts.append((x, y))
    return pts


def _particles_box(d, box, t, speed, n=16, label=None, energetic=False):
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, 16, fill=(12, 28, 52), outline=(42, 92, 128), width=2)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    rw, rh = (x1 - x0) / 2 - 22, (y1 - y0) / 2 - 22
    positions = []
    for i in range(n):
        seed = i * 17.3
        ang = seed + t * speed * (0.7 + (i % 5) * 0.18)
        rx = rw * (0.35 + 0.6 * ((i * 3) % 7) / 7)
        ry = rh * (0.35 + 0.6 * ((i * 5) % 11) / 11)
        x = cx + math.cos(ang) * rx
        y = cy + math.sin(ang * 1.15) * ry
        positions.append((x, y, i))
    if energetic:
        for i, (x1p, y1p, _) in enumerate(positions):
            for x2p, y2p, _ in positions[i + 1 :]:
                if (x1p - x2p) ** 2 + (y1p - y2p) ** 2 < 420:
                    mx, my = (x1p + x2p) / 2, (y1p + y2p) / 2
                    d.ellipse((mx - 7, my - 7, mx + 7, my + 7), outline=GOLD, width=2)
    for x, y, i in positions:
        if energetic and i % 3 == 0:
            col = GOLD
        elif i % 3 == 0:
            col = TEAL_BAR
        elif i % 5 == 0:
            col = GOLD
        else:
            col = (90, 170, 210)
        r = 7
        d.ellipse((x - r, y - r, x + r, y + r), fill=col)
    if label:
        d.text(((x0 + x1) / 2, y0 + 22), label, font=font("semibold", 18), fill=MUTED, anchor="mm")


def _ea_diagram(d, box, highlight_ea=False, highlight_ok=False, show_hot=False):
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, 16, fill=(12, 28, 52), outline=(42, 92, 128), width=2)
    ax, ay, bx, by = x0 + 70, y1 - 40, x1 - 28, y0 + 28
    d.line((ax, by, ax, ay), fill=MUTED, width=2)
    d.line((ax, ay, bx, ay), fill=MUTED, width=2)
    d.text((ax - 10, (by + ay) / 2), "Number of\nparticles", font=font("medium", 13), fill=MUTED, anchor="rm")
    d.text(((ax + bx) / 2, ay + 18), "Energy", font=font("medium", 15), fill=MUTED, anchor="mm")
    height = max(90, ay - by - 28)
    cold = _curve(ax, ay, bx, 0.28, 0.030, height)
    d.line(cold, fill=TEAL_BAR, width=3)
    hot = _curve(ax, ay, bx, 0.40, 0.055, height * 0.78)
    if show_hot:
        d.line(hot, fill=GOLD, width=3)
        d.text((ax + 36, by + 8), "Lower T", font=font("medium", 14), fill=TEAL_BAR)
        d.text((bx - 8, by + 8), "Higher T", font=font("medium", 14), fill=GOLD, anchor="rm")
    ea_x = ax + 20 + 0.62 * (bx - ax - 40)
    ea_col = GOLD if highlight_ea else MUTED
    d.line((ea_x, ay - 6, ea_x, by + 6), fill=ea_col, width=3)
    d.text((ea_x, by + 16), "Ea", font=font("bold", 18), fill=ea_col, anchor="mm")
    if highlight_ok:
        shade = [(x, y) for x, y in (hot if show_hot else cold) if x >= ea_x]
        if len(shade) > 1:
            poly = [(ea_x, ay - 6)] + shade + [(shade[-1][0], ay - 6)]
            d.polygon(poly, fill=(70, 90, 40))
            d.line(shade, fill=GOLD, width=3)


def slide_intro(revealed, t=0.0):
    img, d = _base(1)
    heading(d, "How to get full marks", "GCSE Chemistry six-mark questions")
    mark = None
    if _vis(revealed, "full"):
        mark = 6
    elif _vis(revealed, "low"):
        mark = 2
    _paper(d, 88, 240, mark=mark)
    if _vis(revealed, "hook"):
        d.rounded_rectangle((560, 260, W - 88, 430), 18, fill=NAVY_ROW)
        d.text((592, 300), "Half a page… still only 2 or 3 marks.", font=font("semibold", 28), fill=WHITE)
        d.text((592, 350), "Understanding the chemistry is not enough.", font=font("regular", 22), fill=MUTED)
    if _vis(revealed, "title"):
        d.rounded_rectangle((560, 454, W - 88, 700), 18, fill=NAVY_ROW)
        d.text((592, 500), "HOW TO GET FULL MARKS", font=font("bold", 34), fill=GOLD)
        d.text((592, 552), "IN GCSE CHEMISTRY", font=font("bold", 28), fill=WHITE)
        d.text((592, 600), "SIX-MARK QUESTIONS", font=font("bold", 28), fill=WHITE)
        d.text((592, 656), STRAPLINE, font=font("regular", 18), fill=MUTED)
    if _vis(revealed, "sub"):
        d.rounded_rectangle((560, 724, 980, 800), 16, fill=TEAL)
        d.text((770, 762), "Subscribe  ·  JD Science", font=font("bold", 22), fill=WHITE, anchor="mm")
    if _vis(revealed, "web"):
        d.rounded_rectangle((1000, 724, W - 88, 800), 16, fill=(12, 28, 52), outline=GOLD, width=2)
        d.text((1360, 762), "jdscience.co.uk", font=font("bold", 24), fill=GOLD, anchor="mm")
    spots = {
        "low": hotspot((88 + 420 - 132, 240 + 16, 88 + 420 - 20, 240 + 70)),
        "full": hotspot((88 + 420 - 132, 240 + 16, 88 + 420 - 20, 240 + 70)),
        "title": hotspot((560, 454, W - 88, 700)),
        "web": hotspot((1000, 724, W - 88, 800)),
    }
    return img, spots


def slide_quality(revealed, t=0.0):
    img, d = _base(2)
    heading(d, "A long answer is not enough", "Accuracy, relevance and quality matter more than length")
    cards = [
        ("accuracy", "Accuracy", "Use the correct science."),
        ("relevance", "Relevance", "Answer this question."),
        ("quality", "Quality", "Organise a clear explanation."),
    ]
    for i, (key, title, text) in enumerate(cards):
        x0 = 88 + i * 590
        box = (x0, 280, x0 + 560, 620)
        d.rounded_rectangle(box, 22, fill=NAVY_ROW)
        d.rounded_rectangle((x0 + 36, 320, x0 + 120, 404), 16, fill=TEAL if _vis(revealed, key) else (30, 60, 90))
        d.text((x0 + 78, 362), str(i + 1), font=font("bold", 36), fill=WHITE, anchor="mm")
        d.text((x0 + 36, 440), title, font=font("bold", 36), fill=GOLD if _vis(revealed, key) else MUTED)
        if _vis(revealed, key):
            d.text((x0 + 36, 510), text, font=font("regular", 24), fill=INK)
    spots = {
        "accuracy": hotspot((88, 280, 648, 620)),
        "relevance": hotspot((678, 280, 1238, 620)),
        "quality": hotspot((1268, 280, 1828, 620)),
    }
    return img, spots


def slide_levels(revealed, t=0.0):
    img, d = _base(3)
    heading(d, "Levels of response", "Many six-mark questions judge the whole answer")
    d.rounded_rectangle((88, 240, W - 88, 330), 16, fill=NAVY_ROW)
    d.text((112, 285), "Scientific knowledge  ·  Detail of explanation  ·  Logical organisation", font=font("medium", 24), fill=INK)
    levels = [
        ("l1", "Level 1", "1–2 marks", "Simple statements, limited science."),
        ("l2", "Level 2", "3–4 marks", "Some linked ideas and relevant chemistry."),
        ("l3", "Level 3", "5–6 marks", "A developed, logical scientific explanation."),
    ]
    for i, (key, title, marks, text) in enumerate(levels):
        x0 = 88 + i * 590
        fill = (28, 70, 90) if _vis(revealed, key) else NAVY_ROW
        d.rounded_rectangle((x0, 360, x0 + 560, 700), 22, fill=fill)
        d.text((x0 + 36, 400), title, font=font("bold", 36), fill=WHITE)
        d.text((x0 + 36, 460), marks, font=font("bold", 32), fill=GOLD)
        if _vis(revealed, key):
            d.text((x0 + 36, 540), text, font=font("regular", 22), fill=INK)
    if _vis(revealed, "points"):
        d.rounded_rectangle((88, 730, W - 88, 820), 16, fill=(52, 28, 36), outline=RED, width=2)
        d.text((112, 775), "Not every six-mark question uses levels — some are marked as individual marking points.", font=font("semibold", 24), fill=WHITE)
    spots = {
        "l1": hotspot((88, 360, 648, 700)),
        "l2": hotspot((678, 360, 1238, 700)),
        "l3": hotspot((1268, 360, 1828, 700)),
        "points": hotspot((88, 730, W - 88, 820)),
    }
    return img, spots


def slide_command(revealed, t=0.0):
    img, d = _base(4)
    heading(d, "Command words", "Knowing the chemistry is not enough if you miss the demand")
    cards = [
        ("describe", "DESCRIBE", "State what happens.", "Give an account of what you observe or what takes place."),
        ("explain", "EXPLAIN", "Give scientific reasons.", "Show why something happens and how the ideas connect."),
        ("compare", "COMPARE", "Identify similarities and differences.", "Identify relevant similarities and differences."),
        ("evaluate", "EVALUATE", "Consider evidence and a judgement.", "Weigh the evidence and reach a justified conclusion."),
    ]
    for i, (key, title, short, long) in enumerate(cards):
        col = i % 2
        row = i // 2
        x0 = 88 + col * 900
        y0 = 250 + row * 300
        active = _vis(revealed, key)
        d.rounded_rectangle((x0, y0, x0 + 860, y0 + 270), 22, fill=NAVY_ROW, outline=GOLD if active else None, width=3)
        d.text((x0 + 36, y0 + 36), title, font=font("bold", 36), fill=GOLD if active else MUTED)
        d.text((x0 + 36, y0 + 100), short, font=font("semibold", 26), fill=WHITE)
        if active:
            d.text((x0 + 36, y0 + 160), long, font=font("regular", 22), fill=INK)
    spots = {
        "describe": hotspot((88, 250, 948, 520)),
        "explain": hotspot((988, 250, 1848, 520)),
        "compare": hotspot((88, 550, 948, 820)),
        "evaluate": hotspot((988, 550, 1848, 820)),
    }
    return img, spots


def slide_structure(revealed, t=0.0):
    img, d = _base(5)
    heading(d, "The JD Science structure", "A planning technique — adapt it to the question")
    steps = [
        ("point", "POINT", "Answer the question\ndirectly."),
        ("science", "SCIENCE", "Introduce the relevant\nscientific concepts."),
        ("explain", "EXPLAIN", "Develop the scientific\nreasoning."),
        ("link", "LINK", "Connect the explanation\nto the question."),
        ("check", "CHECK", "Review accuracy\nand completeness."),
    ]
    for i, (key, title, text) in enumerate(steps):
        x0 = 80 + i * 368
        active = _vis(revealed, key)
        d.rounded_rectangle((x0, 280, x0 + 348, 620), 22, fill=NAVY_ROW, outline=GOLD if active else None, width=3)
        d.ellipse((x0 + 134, 310, x0 + 214, 390), fill=TEAL if active else (30, 60, 90))
        d.text((x0 + 174, 350), str(i + 1), font=font("bold", 36), fill=WHITE, anchor="mm")
        d.text((x0 + 174, 430), title, font=font("bold", 28), fill=GOLD if active else MUTED, anchor="mm")
        if active:
            d.multiline_text((x0 + 174, 500), text, font=font("regular", 18), fill=INK, anchor="ma", align="center", spacing=4)
        if i < 4:
            d.polygon([(x0 + 352, 430), (x0 + 368, 440), (x0 + 352, 450)], fill=TEAL_BAR)
    if _vis(revealed, "banner"):
        d.rounded_rectangle((88, 660, W - 88, 780), 20, fill=(20, 56, 64), outline=GOLD, width=2)
        d.text((W / 2, 720), "POINT  →  SCIENCE  →  EXPLAIN  →  LINK  →  CHECK", font=font("bold", 36), fill=GOLD, anchor="mm")
    if _vis(revealed, "note"):
        d.text((W / 2, 820), "This is a planning technique, not an official marking formula.", font=font("medium", 22), fill=MUTED, anchor="mm")
    spots = {k: hotspot((80 + i * 368, 280, 80 + i * 368 + 348, 620)) for i, (k, *_r) in enumerate(steps)}
    spots["banner"] = hotspot((88, 660, W - 88, 780))
    return img, spots


def slide_question(revealed, t=0.0):
    img, d = _base(6)
    heading(d, "Worked example", "Apply the structure to a collision-theory question")
    _paper(d, 88, 240, w=520, h=560, mark=6 if _vis(revealed, "six") else None)
    d.rounded_rectangle((660, 250, W - 88, 800), 22, fill=NAVY_ROW)
    d.text((700, 290), "Examination-style question", font=font("semibold", 22), fill=MUTED)
    d.text((700, 350), "Explain how increasing temperature", font=font("bold", 32), fill=WHITE)
    d.text((700, 400), "affects the rate of a chemical reaction.", font=font("bold", 32), fill=WHITE)
    if _vis(revealed, "collision"):
        d.text((700, 470), "Use collision theory in your answer.", font=font("semibold", 28), fill=GOLD)
    if _vis(revealed, "six"):
        d.rounded_rectangle((700, 530, 920, 600), 14, fill=TEAL)
        d.text((810, 565), "(6 marks)", font=font("bold", 26), fill=WHITE, anchor="mm")
    if _vis(revealed, "cmd"):
        d.rounded_rectangle((700, 640, 1180, 760), 16, fill=(20, 56, 64), outline=GOLD, width=2)
        d.text((740, 670), "Command word", font=font("medium", 20), fill=MUTED)
        d.text((740, 710), "EXPLAIN  —  give scientific reasons", font=font("bold", 26), fill=GOLD)
    spots = {
        "q": hotspot((660, 250, W - 88, 500)),
        "collision": hotspot((700, 470, 1500, 520)),
        "six": hotspot((700, 530, 920, 600)),
        "cmd": hotspot((700, 640, 1180, 760)),
        "explain": hotspot((700, 640, 1180, 760)),
    }
    return img, spots


def slide_weak(revealed, t=0.0):
    img, d = _base(7)
    heading(d, "A weak answer", "Correct facts, but not enough scientific reasoning")
    d.rounded_rectangle((88, 250, W - 88, 520), 22, fill=(52, 28, 36), outline=RED, width=3)
    d.text((120, 290), "INCOMPLETE", font=font("bold", 22), fill=RED)
    d.text((120, 350), "“When temperature increases, particles move faster", font=font("semibold", 34), fill=WHITE)
    d.text((120, 410), "and the reaction becomes faster.”", font=font("semibold", 34), fill=WHITE)
    if _vis(revealed, "why"):
        d.rounded_rectangle((88, 560, W - 88, 800), 22, fill=NAVY_ROW)
        d.text((120, 620), "This contains some correct information.", font=font("regular", 28), fill=INK)
        d.text((120, 690), "It does not explain the chemistry in enough detail.", font=font("bold", 28), fill=GOLD)
    spots = {
        "weak": hotspot((88, 250, W - 88, 520)),
        "why": hotspot((88, 560, W - 88, 800)),
    }
    return img, spots


def slide_strong(revealed, t=0.0):
    img, d = _base(8)
    heading(d, "A stronger answer", "Collision theory, developed step by step")
    fast = _vis(revealed, "fast")
    _particles_box(d, (88, 250, 344, 560), t, speed=0.16, n=14, label="Lower temperature")
    _particles_box(
        d, (364, 250, 620, 560), t,
        speed=0.72 if fast else 0.16,
        n=14,
        label="Higher temperature",
        energetic=fast,
    )
    _ea_diagram(
        d, (88, 600, 620, 860),
        highlight_ea=_vis(revealed, "ea"),
        highlight_ok=_vis(revealed, "success"),
        show_hot=fast or _vis(revealed, "ea"),
    )
    lines = [
        ("ke", "Particles gain kinetic energy."),
        ("fast", "They move faster and collide more frequently."),
        ("ea", "A greater proportion have energy ≥ Ea."),
        ("success", "More collisions are successful."),
        ("rate", "Successful collisions per second increase — faster rate."),
    ]
    y = 250
    for key, text in lines:
        if _vis(revealed, key):
            d.rounded_rectangle((660, y, W - 88, y + 100), 16, fill=NAVY_ROW)
            d.text((700, y + 50), text, font=font("semibold", 26), fill=WHITE, anchor="lm")
        y += 112
    spots = {
        "ke": hotspot((660, 250, W - 88, 350)),
        "fast": hotspot((660, 362, W - 88, 462)),
        "ea": hotspot((88, 600, 620, 860)),
        "success": hotspot((660, 586, W - 88, 686)),
        "rate": hotspot((660, 698, W - 88, 798)),
        "particles": hotspot((88, 250, 620, 560)),
    }
    return img, spots


def slide_why(revealed, t=0.0):
    img, d = _base(9)
    heading(d, "Why this scores highly", "Each idea supports the next")
    steps = [
        ("ke", "1", "Temperature → kinetic energy"),
        ("freq", "2", "Faster movement → more collisions"),
        ("ea", "3", "Activation energy is the minimum energy needed"),
        ("ok", "4", "More collisions have energy ≥ Ea"),
        ("link", "5", "Link the science to a faster rate"),
    ]
    for i, (key, n, text) in enumerate(steps):
        y = 250 + i * 110
        d.rounded_rectangle((88, y, W - 88, y + 96), 16, fill=NAVY_ROW)
        d.ellipse((120, y + 16, 192, y + 80), fill=TEAL if _vis(revealed, key) else (30, 60, 90))
        d.text((156, y + 48), n, font=font("bold", 28), fill=WHITE, anchor="mm")
        d.text((220, y + 48), text, font=font("semibold", 28), fill=WHITE if _vis(revealed, key) else MUTED, anchor="lm")
    spots = {k: hotspot((88, 250 + i * 110, W - 88, 346 + i * 110)) for i, (k, *_r) in enumerate(steps)}
    return img, spots


def slide_evaluate(revealed, t=0.0):
    img, d = _base(10)
    heading(d, "Evaluation questions", "Compare evidence, then justify a conclusion")
    d.text((88, 236), "Hypothetical data — for illustration only", font=font("medium", 18), fill=MUTED)
    headers = ["", "Method A", "Method B"]
    rows = [
        ("yield", "Percentage yield", "92%", "74%"),
        ("atom", "Atom economy", "56%", "88%"),
        ("energy", "Energy requirement", "High", "Lower"),
        ("cost", "Production cost", "Lower", "Higher"),
        ("env", "Environmental impact", "More waste heat", "Less waste"),
    ]
    col_x = [88, 820, 1320]
    d.rounded_rectangle((88, 270, W - 88, 340), 12, fill=(20, 56, 64))
    for i, h in enumerate(headers):
        d.text((col_x[i] + 20, 305), h, font=font("bold", 24), fill=GOLD, anchor="lm")
    for i, (key, label, a, b) in enumerate(rows):
        y = 352 + i * 78
        fill = (28, 70, 90) if _vis(revealed, key) else NAVY_ROW
        d.rounded_rectangle((88, y, W - 88, y + 70), 12, fill=fill)
        d.text((108, y + 35), label, font=font("semibold", 24), fill=WHITE, anchor="lm")
        if _vis(revealed, key):
            d.text((840, y + 35), a, font=font("bold", 24), fill=INK, anchor="lm")
            d.text((1340, y + 35), b, font=font("bold", 24), fill=INK, anchor="lm")
    if _vis(revealed, "judge"):
        d.rounded_rectangle((88, 760, W - 88, 850), 16, fill=NAVY_ROW, outline=GOLD, width=2)
        d.text((112, 805), "A strong evaluation explains the differences and reaches a justified conclusion.", font=font("semibold", 24), fill=WHITE)
    spots = {k: hotspot((88, 352 + i * 78, W - 88, 422 + i * 78)) for i, (k, *_r) in enumerate(rows)}
    spots["judge"] = hotspot((88, 760, W - 88, 850))
    return img, spots


def slide_mistakes(revealed, t=0.0):
    img, d = _base(11)
    heading(d, "Common examination mistakes", "Be precise, relevant and connected")
    pairs = [
        ("rep", "Repeating the question", "“Temperature makes it faster.”", "Explain why, using collision theory."),
        ("vague", "Vague language", "“Particles become more excited.”", "“Particles gain kinetic energy.”"),
        ("list", "Listing without links", "Facts in any order", "because  ·  therefore  ·  consequently  ·  as a result"),
        ("off", "Irrelevant science", "Catalysts or surface area", "Stay on temperature and rate."),
    ]
    for i, (key, title, bad, good) in enumerate(pairs):
        y = 240 + i * 150
        d.rounded_rectangle((88, y, W - 88, y + 136), 16, fill=NAVY_ROW)
        d.text((120, y + 28), title, font=font("bold", 24), fill=GOLD)
        if _vis(revealed, key):
            d.text((120, y + 78), "✗  " + bad, font=font("medium", 22), fill=RED)
            d.text((980, y + 78), "✓  " + good, font=font("medium", 22), fill=GREEN)
    spots = {k: hotspot((88, 240 + i * 150, W - 88, 376 + i * 150)) for i, (k, *_r) in enumerate(pairs)}
    spots["because"] = hotspot((980, 240 + 2 * 150, W - 88, 376 + 2 * 150))
    spots["excited"] = hotspot((88, 240 + 150, 900, 376 + 150))
    spots["ke"] = hotspot((980, 240 + 150, W - 88, 376 + 150))
    return img, spots


def slide_checklist(revealed, t=0.0):
    img, d = _base(12)
    heading(d, "Check before you move on", "There is no single paragraph that guarantees 6/6")
    items = [
        ("cmd", "Have you addressed the command word?"),
        ("sci", "Have you included the relevant scientific concepts?"),
        ("rel", "Have you explained the relationships between them?"),
        ("term", "Have you used accurate scientific terminology?"),
        ("all", "Have you answered every part of the question?"),
    ]
    for i, (key, text) in enumerate(items):
        y = 250 + i * 92
        d.rounded_rectangle((88, y, W - 88, y + 80), 16, fill=NAVY_ROW)
        mark = GREEN if _vis(revealed, key) else (40, 70, 90)
        d.rounded_rectangle((112, y + 18, 176, y + 62), 10, fill=mark)
        d.text((144, y + 40), "✓" if _vis(revealed, key) else "", font=font("bold", 28), fill=WHITE, anchor="mm")
        d.text((208, y + 40), text, font=font("semibold", 26), fill=WHITE, anchor="lm")
    spots = {k: hotspot((88, 250 + i * 92, W - 88, 330 + i * 92)) for i, (k, *_r) in enumerate(items)}
    return img, spots


def slide_close(revealed, t=0.0):
    img, d = _base(13)
    heading(d, "Don't panic", "Read the question. Organise the chemistry. Practise.")
    if _vis(revealed, "banner"):
        d.rounded_rectangle((88, 270, W - 88, 430), 22, fill=(20, 56, 64), outline=GOLD, width=3)
        d.text((W / 2, 350), "POINT  →  SCIENCE  →  EXPLAIN  →  LINK  →  CHECK", font=font("bold", 40), fill=GOLD, anchor="mm")
    tips = [
        ("read", "Read the question carefully."),
        ("org", "Identify the relevant chemistry and organise it logically."),
        ("prac", "Practise past papers and compare with official mark schemes."),
    ]
    y = 470
    for key, text in tips:
        if _vis(revealed, key):
            d.rounded_rectangle((88, y, W - 88, y + 80), 16, fill=NAVY_ROW)
            d.text((120, y + 40), text, font=font("semibold", 26), fill=WHITE, anchor="lm")
        y += 92
    if _vis(revealed, "sub"):
        d.rounded_rectangle((88, 760, 900, 850), 16, fill=TEAL)
        d.text((494, 805), "Subscribe to JD Science", font=font("bold", 28), fill=WHITE, anchor="mm")
    if _vis(revealed, "web"):
        d.rounded_rectangle((930, 760, W - 88, 850), 16, fill=NAVY_ROW, outline=GOLD, width=2)
        d.text((1370, 805), "jdscience.co.uk", font=font("bold", 30), fill=GOLD, anchor="mm")
    spots = {
        "banner": hotspot((88, 270, W - 88, 430)),
        "sub": hotspot((88, 760, 900, 850)),
        "web": hotspot((930, 760, W - 88, 850)),
    }
    return img, spots


SCENES = {
    "intro": slide_intro,
    "quality": slide_quality,
    "levels": slide_levels,
    "command": slide_command,
    "structure": slide_structure,
    "question": slide_question,
    "weak": slide_weak,
    "strong": slide_strong,
    "why": slide_why,
    "evaluate": slide_evaluate,
    "mistakes": slide_mistakes,
    "checklist": slide_checklist,
    "close": slide_close,
}
