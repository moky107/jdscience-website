"""Render one GCSE Biology slide at time t."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from gcse_biology.cursor import spots_for_slide
from gcse_biology.diagrams import DIAGRAMS
from gcse_foundations.diagrams import bullet_card, card, exam_panel, text_block
from jdscience_video.render import cursor_xy, draw_cursor, draw_highlight
from jdscience_video.theme import (
    GOLD,
    INK,
    LINE,
    MUTED,
    NAVY_CARD,
    STRAPLINE,
    TEAL,
    TEAL_BAR,
    W,
    WHITE,
    font,
    heading,
    logo,
    new_canvas,
)


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _chrome(page: int, total: int, topic: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 10), fill=TEAL_BAR)
    mark = logo()
    img.paste(mark, (56, 28), mark)
    d.text((122, 38), "JD", font=font("bold", 22), fill=TEAL_BAR)
    d.text((156, 38), "SCIENCE", font=font("semibold", 22), fill=INK)
    d.rounded_rectangle((48, 96, W - 48, img.height - 72), 28, fill=NAVY_CARD, outline=LINE, width=2)
    d.rectangle((0, img.height - 56, W, img.height), fill=(7, 16, 34))
    d.text((56, img.height - 40), f"GCSE BIOLOGY   ·   {topic.upper()}", font=font("medium", 16), fill=MUTED, anchor="lm")
    d.text((W - 56, img.height - 40), f"{page:02d}  /  {total:02d}", font=font("semibold", 16), fill=INK, anchor="rm")
    return img, d


def _with_pointer(lesson: dict, slide: dict, img: Image.Image, t: float) -> Image.Image:
    if not lesson.get("cursor"):
        return img
    spots = spots_for_slide(slide)
    x, y, opacity, target = cursor_xy(lesson, t, spots)
    img = draw_highlight(img, spots, target, opacity)
    return draw_cursor(img, x, y, opacity)


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    img, d = _chrome(slide["page"], lesson["pages"], lesson["title"])
    kind = slide.get("kind")
    vis = lambda name: _vis(revealed, name)
    tier = lesson.get("tier") or "GCSE Biology"

    if kind == "intro":
        d.text((88, 160), "GCSE Biology", font=font("medium", 24), fill=TEAL_BAR)
        d.text((88, 210), lesson["spec"], font=font("bold", 40), fill=GOLD)
        title = lesson["title"]
        width = 22 if len(title) > 28 else 40
        words, lines, current = title.split(), [], ""
        for word in words:
            trial = f"{current} {word}".strip()
            if len(trial) <= width or not current:
                current = trial
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        size = 52 if len(lines) == 1 else 40 if len(lines) == 2 else 34
        y = 270
        for row in lines[:4]:
            d.text((88, y), row, font=font("bold", size), fill=WHITE)
            y += size + 6
        d.text((88, min(y + 12, 520)), lesson.get("subtitle") or "", font=font("regular", 26), fill=MUTED)
        d.text((88, min(y + 56, 560)), tier, font=font("semibold", 22), fill=GOLD)
        d.text((88, 860), STRAPLINE, font=font("medium", 22), fill=GOLD)
        diagram = next((s.get("diagram") for s in lesson["slides"] if s.get("diagram")), None)
        if diagram and diagram in DIAGRAMS:
            panel = (1020, 250, 1840, 820)
            pw, ph = panel[2] - panel[0], panel[3] - panel[1]
            work = Image.new("RGB", (1600, 700), NAVY_CARD)
            DIAGRAMS[diagram](ImageDraw.Draw(work), (8, 8, 1592, 692), t)
            img.paste(work.resize((pw, ph), Image.Resampling.LANCZOS), (panel[0], panel[1]))
        return _with_pointer(lesson, slide, img, t)

    if kind == "bullets":
        heading(d, slide["heading"], slide.get("sub") or "")
        items = slide.get("items") or []
        y = 250
        for key, title, body in items:
            box = (88, y, W - 88, y + 140)
            if vis(key):
                card(d, box, accent=TEAL)
                d.text((128, y + 24), title, font=font("bold", 28), fill=WHITE)
                text_block(d, (128, y + 72), body, font("regular", 22), MUTED, 1640)
            else:
                d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
            y += 160
        return _with_pointer(lesson, slide, img, t)

    if kind == "note":
        heading(d, slide["heading"], slide.get("sub") or "Take care with the wording")
        card(d, (88, 250, W - 88, 860), accent=GOLD)
        text_block(d, (128, 300), slide["body"], font("regular", 28), WHITE, 1640, line_gap=12)
        return _with_pointer(lesson, slide, img, t)

    if kind == "diagram":
        heading(d, slide["heading"], slide.get("sub") or "")
        fn = DIAGRAMS[slide["diagram"]]
        fn(d, (88, 240, W - 88, 900), t)
        return _with_pointer(lesson, slide, img, t)

    if kind == "revise":
        heading(d, "Explain it in your own words", "What  ·  why  ·  how the structures help")
        rows = [
            ("r1", "What happens?", "Describe the process in order."),
            ("r2", "Why does it happen?", "Give the scientific reason."),
            ("r3", "How do the structures help?", "Link each structure to its job."),
        ]
        y = 260
        for key, title, body in rows:
            bullet_card(d, (88, y, W - 88, y + 140), title, body, show=vis(key))
            y += 160
        return _with_pointer(lesson, slide, img, t)

    if kind == "exam":
        heading(d, "Pause the video", "Exam-style question")
        exam_panel(d, (88, 250, W - 88, 860), slide["question"], slide["marks"], None)
        return _with_pointer(lesson, slide, img, t)

    if kind == "answer":
        heading(d, "Model answer", "Check your wording against this")
        exam_panel(d, (88, 250, W - 88, 860), lesson["exam"]["question"], lesson["exam"]["marks"], slide["answer"])
        return _with_pointer(lesson, slide, img, t)

    if kind == "outro":
        heading(d, "Subscribe to JD Science", "More lessons and practice questions")
        d.text((88, 320), "jdscience.co.uk", font=font("bold", 48), fill=TEAL_BAR)
        d.text((88, 420), STRAPLINE, font=font("medium", 24), fill=GOLD)
        d.text((88, 520), "Thank you for watching.", font=font("regular", 28), fill=MUTED)
        return _with_pointer(lesson, slide, img, t)

    heading(d, lesson["title"], slide_id)
    return _with_pointer(lesson, slide, img, t)
