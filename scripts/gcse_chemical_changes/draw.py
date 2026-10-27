"""Render six-stage chemical-changes slides at 1920×1080."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from gcse_chemical_changes.cursor import spots_for_slide
from gcse_chemical_changes.diagrams import DIAGRAMS
from gcse_foundations.diagrams import bullet_card, card, recap_cards, text_block
from gcse_foundations.draw import outro as foundations_outro
from jdscience_video.render import cursor_xy, draw_cursor, draw_highlight
from jdscience_video.theme import GOLD, INK, LINE, MUTED, TEAL, TEAL_BAR, W, WHITE, chem, font, heading, new_canvas, draw_chrome


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _base(lesson: dict, page: int):
    img = new_canvas()
    return img, draw_chrome(img, page, lesson["pages"], lesson["title"])


def intro(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    if lesson.get("tier") == "Higher Tier":
        d.text((88, 196), "HIGHER TIER", font=font("bold", 22), fill=GOLD)
        title_y = 240
    else:
        title_y = 200
    d.text((88, title_y), lesson["title"], font=font("bold", 48), fill=WHITE)
    d.text((88, title_y + 80), lesson["subtitle"], font=font("regular", 26), fill=MUTED)
    d.text((88, title_y + 130), lesson.get("spec_label") or "AQA 4.4 / Edexcel Topic 3", font=font("regular", 20), fill=GOLD)
    d.text((88, 780), "Hello and welcome back to JD Science.", font=font("medium", 22), fill=TEAL_BAR)
    if "indicator" in lesson["slug"] or "strong" in lesson["slug"]:
        DIAGRAMS["ph_scale"](d, (980, 240, 1830, 820), t)
    elif "electro" in lesson["slug"] or "copper" in lesson["slug"] or "chemical-changes" in lesson["slug"]:
        DIAGRAMS["cell"](d, (980, 240, 1830, 820), t)
    else:
        DIAGRAMS["acid_alkali"](d, (980, 240, 1830, 820), t)
    return img


def aims(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "In this lesson", "What you should be able to do by the end")
    y = 250
    for key, label in slide.get("items") or []:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            card(d, box, accent=TEAL)
            d.text((120, y + 38), label, font=font("semibold", 28), fill=WHITE)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 130
    return img


def bullets(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, slide.get("heading") or "", slide.get("sub") or "")
    items = slide.get("items") or []
    n = max(1, len(items))
    h = min(140, (620 - 16 * (n - 1)) // n)
    y = 250
    for key, title, body in items:
        box = (88, y, W - 88, y + h)
        bullet_card(d, box, title, body, TEAL, show=_vis(revealed, key))
        y += h + 16
    return img


def note(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, slide.get("heading") or "", "")
    card(d, (88, 250, W - 88, 860), accent=GOLD)
    text_block(d, (130, 310), slide.get("body") or "", font("regular", 28), INK, W - 260, line_gap=14)
    return img


def equation(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, slide.get("heading") or "Equation", "")
    card(d, (88, 260, W - 88, 520), accent=GOLD)
    d.text((W / 2, 370), chem(slide.get("equation") or ""), font=font("bold", 36), fill=GOLD, anchor="mm")
    text_block(d, (130, 580), slide.get("body") or "", font("regular", 24), MUTED, W - 260)
    return img


def diagram(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, slide.get("heading") or "", slide.get("sub") or "")
    name = slide.get("diagram")
    fn = DIAGRAMS.get(name)
    if fn:
        fn(d, (88, 250, W - 88, 900), t)
    return img


def worked(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Worked example", "Stage 3  ·  Watch how a full-mark answer is built")
    card(d, (88, 250, W - 88, 400), accent=GOLD)
    text_block(d, (120, 270), slide.get("question") or "", font("regular", 22), WHITE, W - 240)
    y = 430
    for key, line in slide.get("steps") or []:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            card(d, box, accent=TEAL)
            d.text((130, y + 36), chem(line), font=font("semibold", 24), fill=WHITE)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 122
    return img


def your_turn(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Your turn", "Stage 4  ·  Pause before the model answer")
    card(d, (88, 250, W - 88, 360), accent=GOLD)
    d.text((120, 270), slide.get("source") or "Specification-aligned examination-style question", font=font("semibold", 18), fill=GOLD)
    d.text((W - 140, 270), slide.get("marks") or "", font=font("bold", 20), fill=GOLD, anchor="ra")
    text_block(d, (120, 310), slide.get("question") or "", font("regular", 24), WHITE, W - 260)
    d.rounded_rectangle((88, 400, W - 88, 860), 18, fill=(16, 34, 58), outline=LINE, width=2)
    d.text((W / 2, 600), "Pause the video and try this yourself.", font=font("bold", 32), fill=TEAL_BAR, anchor="mm")
    d.text((W / 2, 660), "The model answer follows after a short pause.", font=font("regular", 22), fill=MUTED, anchor="mm")
    return img


def model(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Model answer", "Stage 5  ·  Marking points and misconceptions")
    card(d, (88, 250, W - 88, 520), accent=TEAL)
    d.text((120, 270), "Complete answer", font=font("bold", 20), fill=TEAL_BAR)
    text_block(d, (120, 310), chem(slide.get("answer") or ""), font("regular", 22), WHITE, W - 260)
    points = slide.get("points") or []
    if points:
        d.text((120, 550), "Marking points", font=font("semibold", 20), fill=GOLD)
        n = len(points)
        width = min(400, (W - 200 - 16 * (n - 1)) // max(1, n))
        x = 120
        for i, point in enumerate(points):
            show = _vis(revealed, f"p{i + 1}") or _vis(revealed, "*")
            fill = GOLD if show else LINE
            d.rounded_rectangle((x, 590, x + width, 680), 12, outline=fill, width=2)
            text_block(d, (x + 12, 608), point, font("medium", 15), WHITE if show else MUTED, width - 24, line_gap=4)
            x += width + 16
    if slide.get("misconception"):
        card(d, (88, 710, W - 88, 860), accent=GOLD)
        d.text((120, 730), "Avoid this misconception", font=font("bold", 18), fill=GOLD)
        text_block(d, (120, 770), slide["misconception"], font("regular", 20), INK, W - 260)
    return img


def recap(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Recap", "Stage 6  ·  The ideas to take into the exam")
    items = slide.get("items") or []
    keys = [f"r{i + 1}" for i in range(len(items))]
    recap_cards(d, (88, 260, W - 88, 860), items, set(revealed), keys)
    return img


def outro(lesson, revealed, t, page):
    return foundations_outro(lesson, revealed, t, page)


def _with_pointer(lesson: dict, slide: dict, img: Image.Image, t: float) -> Image.Image:
    if not lesson.get("cursor"):
        return img
    spots = spots_for_slide(slide)
    x, y, opacity, target = cursor_xy(lesson, t, spots)
    img = draw_highlight(img, spots, target, opacity)
    return draw_cursor(img, x, y, opacity)


KIND = {
    "intro": lambda lesson, slide, revealed, t, page: intro(lesson, revealed, t, page),
    "aims": aims,
    "bullets": bullets,
    "note": note,
    "equation": equation,
    "diagram": diagram,
    "worked": worked,
    "your_turn": your_turn,
    "model": model,
    "recap": recap,
    "outro": lambda lesson, slide, revealed, t, page: outro(lesson, revealed, t, page),
}


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float = 0.0) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    kind = slide["kind"]
    page = slide.get("page", 1)
    img = KIND[kind](lesson, slide, list(revealed), t, page)
    return _with_pointer(lesson, slide, img, t)
