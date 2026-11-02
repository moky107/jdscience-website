"""Render one Level 3 nervous-system slide at time t."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from gcse_foundations.diagrams import bullet_card, card, text_block
from jdscience_video.theme import (
    GOLD,
    GREEN,
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
from l3_nervous.diagrams import DIAGRAMS, paste_micrograph


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _chrome(page: int, total: int, topic: str, part: str = "") -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 10), fill=TEAL_BAR)
    mark = logo()
    img.paste(mark, (56, 28), mark)
    d.text((122, 38), "JD", font=font("bold", 22), fill=TEAL_BAR)
    d.text((156, 38), "SCIENCE", font=font("semibold", 22), fill=INK)
    if part:
        d.text((W - 56, 48), part, font=font("semibold", 18), fill=GOLD, anchor="rm")
    d.rounded_rectangle((48, 96, W - 48, img.height - 72), 28, fill=NAVY_CARD, outline=LINE, width=2)
    d.rectangle((0, img.height - 56, W, img.height), fill=(7, 16, 34))
    d.text((56, img.height - 40), f"LEVEL 3 SCIENCE   ·   {topic.upper()}", font=font("medium", 16), fill=MUTED, anchor="lm")
    d.text((W - 56, img.height - 40), f"{page:02d}  /  {total:02d}", font=font("semibold", 16), fill=INK, anchor="rm")
    return img, d


def exam_panel(d, box, question: str, marks: str, answer: str | None):
    x0, y0, x1, y1 = box
    card(d, (x0, y0, x1, y0 + 200), accent=GOLD)
    d.text((x0 + 28, y0 + 16), f"Level 3 examination-style question  ·  {marks}", font=font("semibold", 18), fill=GOLD)
    text_block(d, (x0 + 28, y0 + 50), question, font("regular", 22), WHITE, x1 - x0 - 56)
    if answer:
        card(d, (x0, y0 + 220, x1, y1), accent=GREEN)
        d.text((x0 + 28, y0 + 236), "Model answer", font=font("bold", 20), fill=GREEN)
        text_block(d, (x0 + 28, y0 + 276), answer, font("regular", 22), INK, x1 - x0 - 56)
    else:
        d.rounded_rectangle((x0, y0 + 220, x1, y1), 18, fill=(16, 34, 58), outline=LINE, width=1)
        d.text(((x0 + x1) / 2, (y0 + 220 + y1) / 2), "Pause the video, then check the model answer", font=font("medium", 22), fill=MUTED, anchor="mm")


def _run_diagram(d, name, box, t, revealed=None, **extra):
    fn = DIAGRAMS[name]
    try:
        fn(d, box, t=t, revealed=revealed, **extra)
    except TypeError:
        fn(d, box, t=t, revealed=revealed)


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    img, d = _chrome(slide["page"], lesson["pages"], lesson["title"], lesson.get("part") or "")
    kind = slide.get("kind")
    vis = lambda name: _vis(revealed, name)

    if kind == "intro":
        d.text((88, 150), "Level 3 Science", font=font("medium", 24), fill=TEAL_BAR)
        d.text((88, 196), lesson["title"], font=font("bold", 44), fill=WHITE)
        d.text((88, 262), lesson.get("subtitle") or "", font=font("regular", 26), fill=MUTED)
        d.text((88, 312), lesson.get("part") or "", font=font("semibold", 22), fill=GOLD)
        d.text((88, 860), STRAPLINE, font=font("medium", 22), fill=GOLD)
        diagram = slide.get("diagram")
        if diagram and diagram in DIAGRAMS:
            extra = {}
            if slide.get("phase") is not None:
                extra["phase"] = slide["phase"]
            _run_diagram(d, diagram, (720, 340, 1830, 830), t, ["*"], **extra)
        return img

    if kind == "micro":
        heading(d, slide["heading"], slide.get("sub") or "")
        paste_micrograph(img, (88, 240, W - 88, 900), slide["image"], slide["caption"], slide["credit"])
        return img

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
        return img

    if kind == "note":
        heading(d, slide["heading"], slide.get("sub") or "Take care with the wording")
        card(d, (88, 250, W - 88, 860), accent=GOLD)
        text_block(d, (128, 300), slide["body"], font("regular", 28), WHITE, 1640, line_gap=12)
        return img

    if kind == "diagram":
        heading(d, slide["heading"], slide.get("sub") or "")
        extra = {}
        if slide.get("phase") is not None:
            extra["phase"] = slide["phase"]
        _run_diagram(d, slide["diagram"], (88, 240, W - 88, 900), t, revealed, **extra)
        return img

    if kind == "split":
        heading(d, slide["heading"], slide.get("sub") or "")
        extra = {}
        if slide.get("phase") is not None:
            extra["phase"] = slide["phase"]
        _run_diagram(d, slide["diagram"], (88, 240, 900, 900), t, revealed)
        _run_diagram(d, slide["graph"], (920, 240, W - 88, 900), t, revealed, **extra)
        return img

    if kind == "worked":
        heading(d, slide["heading"], "Worked examination-style example")
        exam_panel(d, (88, 250, W - 88, 860), slide["question"], slide.get("marks") or "", None)
        return img

    if kind == "your_turn":
        heading(d, slide.get("heading") or "Pause the video", "Exam-style question  ·  pause before you check")
        exam_panel(d, (88, 250, W - 88, 860), slide["question"], slide.get("marks") or "", None)
        return img

    if kind == "model":
        heading(d, "Model answer", "Check your wording against this")
        exam = lesson.get("exam") or {}
        exam_panel(d, (88, 250, W - 88, 860), exam.get("question") or "", exam.get("marks") or "", slide.get("answer"))
        return img

    if kind == "outro":
        heading(d, "Subscribe to JD Science", "More lessons and practice questions")
        d.text((88, 320), "jdscience.co.uk", font=font("bold", 48), fill=TEAL_BAR)
        d.text((88, 420), STRAPLINE, font=font("medium", 24), fill=GOLD)
        d.text((88, 520), lesson.get("part") or "", font=font("regular", 26), fill=MUTED)
        d.text((88, 580), "Thank you for watching.", font=font("regular", 28), fill=MUTED)
        return img

    heading(d, lesson["title"], slide_id)
    return img
