"""Shared JDScience lesson theme: topic titles, discreet footer logo only."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "content/lessons/_media"
MEDIA.mkdir(parents=True, exist_ok=True)
LOGO_PATH = MEDIA / "jdscience-footer-logo.png"

W, H = Inches(13.333), Inches(7.5)
FOOTER_H = Inches(0.46)

TEAL = RGBColor(0x00, 0x96, 0x88)
TEAL_DARK = RGBColor(0x00, 0x4D, 0x40)
TEAL_MID = RGBColor(0x00, 0x79, 0x6B)
INK = RGBColor(0x0F, 0x17, 0x2A)
MUTED = RGBColor(0x47, 0x55, 0x69)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CREAM = RGBColor(0xF0, 0xFD, 0xFA)
CARD = RGBColor(0xF8, 0xFA, 0xFC)
LINE = RGBColor(0xCC, 0xFB, 0xF1)
AMBER = RGBColor(0xB4, 0x53, 0x09)
AMBER_BG = RGBColor(0xFF, 0xF7, 0xED)
ROSE = RGBColor(0x9F, 0x12, 0x39)
ROSE_BG = RGBColor(0xFF, 0xF1, 0xF2)
GREEN = RGBColor(0x04, 0x78, 0x57)
GREEN_BG = RGBColor(0xEC, 0xFD, 0xF5)
NAVY = RGBColor(0x1E, 0x3A, 0x5F)
PURPLE = RGBColor(0x5B, 0x21, 0xB6)
PURPLE_BG = RGBColor(0xF5, 0xF3, 0xFF)


def ensure_logo() -> Path:
    if LOGO_PATH.exists():
        return LOGO_PATH
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, 159, 159), radius=28, fill=(0, 150, 136, 255))
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58)
    except OSError:
        font = ImageFont.load_default()
    d.text((80, 78), "JD", fill="white", font=font, anchor="mm")
    img.save(LOGO_PATH)
    return LOGO_PATH


def new_presentation() -> Presentation:
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    return prs


def add_rect(slide, l, t, w, h, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1)
    return shape


def add_round(slide, l, t, w, h, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1.25)
    return shape


def set_run(run, size=18, bold=False, color=INK, name="Calibri", italic=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = name
    run.font._element.set(qn("a:ea"), name)


def add_text(slide, l, t, w, h, text, size=18, bold=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    try:
        tf._txBody.bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}.get(anchor, "t"))
    except Exception:
        pass
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    set_run(run, size=size, bold=bold, color=color)
    return box


def add_bullets(slide, l, t, w, h, items, size=18, color=INK, spacing=10):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(spacing)
        p.level = 0
        run = p.add_run()
        run.text = "•  " + item
        set_run(run, size=size, color=color)
    return box


def add_rich_line(paragraph, chunks, size=18, color=INK, bold=False):
    """chunks: list of str or (str, dict) with keys sub, sup, bold, italic, color, size."""
    for chunk in chunks:
        if isinstance(chunk, str):
            run = paragraph.add_run()
            run.text = chunk
            set_run(run, size=size, bold=bold, color=color)
        else:
            text, opts = chunk
            run = paragraph.add_run()
            run.text = text
            set_run(
                run,
                size=opts.get("size", size),
                bold=opts.get("bold", bold),
                color=opts.get("color", color),
                italic=opts.get("italic", False),
            )
            if opts.get("sub"):
                run.font._element.set("baseline", "-25000")
            if opts.get("sup"):
                run.font._element.set("baseline", "30000")


def footer(slide, page: int, total: int, kicker: str = ""):
    add_rect(slide, 0, H - FOOTER_H, W, FOOTER_H, TEAL_DARK)
    logo = str(ensure_logo())
    slide.shapes.add_picture(logo, Inches(0.22), H - FOOTER_H + Inches(0.07), Inches(0.32), Inches(0.32))
    add_text(
        slide,
        Inches(0.62),
        H - FOOTER_H + Inches(0.08),
        Inches(2.4),
        Inches(0.30),
        "jdscience.co.uk",
        11,
        True,
        WHITE,
        PP_ALIGN.LEFT,
    )
    if kicker:
        add_text(
            slide,
            Inches(3.2),
            H - FOOTER_H + Inches(0.08),
            Inches(7.4),
            Inches(0.30),
            kicker,
            11,
            False,
            RGBColor(0xCC, 0xFB, 0xF1),
            PP_ALIGN.LEFT,
        )
    add_text(
        slide,
        Inches(11.2),
        H - FOOTER_H + Inches(0.08),
        Inches(1.9),
        Inches(0.30),
        f"{page}  /  {total}",
        11,
        True,
        WHITE,
        PP_ALIGN.RIGHT,
    )


def blank(prs, fill=WHITE):
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    add_rect(slide, 0, 0, W, H, fill)
    return slide


def heading(slide, title, y=Inches(0.28), size=30):
    add_text(slide, Inches(0.55), y, Inches(12.2), Inches(0.62), title, size, True, TEAL_DARK)


def chip(slide, l, t, w, h, text, fill=TEAL, color=WHITE):
    add_round(slide, l, t, w, h, fill)
    add_text(slide, l, t + Inches(0.04), w, h - Inches(0.04), text, 12, True, color, PP_ALIGN.CENTER)


def card(slide, l, t, w, h, fill=CARD, accent=None):
    add_round(slide, l, t, w, h, fill)
    if accent:
        add_rect(slide, l, t, Inches(0.10), h, accent)


def title_slide(prs, title, subtitle, kicker, visual=None):
    s = blank(prs, CREAM)
    add_rect(s, 0, 0, Inches(0.18), H, TEAL)
    add_text(s, Inches(0.7), Inches(1.55), Inches(8.6), Inches(0.4), kicker, 16, True, TEAL_MID)
    add_text(s, Inches(0.7), Inches(2.05), Inches(8.8), Inches(2.2), title, 40, True, TEAL_DARK)
    add_text(s, Inches(0.7), Inches(4.4), Inches(8.6), Inches(1.4), subtitle, 18, False, MUTED)
    add_text(s, Inches(0.7), Inches(6.15), Inches(8.6), Inches(0.35), "PowerPoint teaching resource", 13, True, TEAL)
    if visual and Path(visual).exists():
        s.shapes.add_picture(str(visual), Inches(9.55), Inches(1.7), Inches(3.2), Inches(3.2))
    else:
        add_round(s, Inches(9.55), Inches(1.85), Inches(3.15), Inches(3.15), TEAL)
        add_text(s, Inches(9.55), Inches(3.05), Inches(3.15), Inches(0.8), "Unit 1", 28, True, WHITE, PP_ALIGN.CENTER)
    return s


def objectives_slide(prs, items):
    s = blank(prs)
    heading(s, "Learning objectives")
    add_text(s, Inches(0.55), Inches(0.95), Inches(12.2), Inches(0.4), "By the end of this lesson you should be able to:", 16, False, MUTED)
    colours = [TEAL, TEAL_MID, NAVY, PURPLE, AMBER, ROSE]
    for i, item in enumerate(items):
        y = Inches(1.5) + Inches(i * 0.85)
        add_round(s, Inches(0.55), y, Inches(12.2), Inches(0.74), CREAM)
        add_round(s, Inches(0.72), y + Inches(0.16), Inches(0.42), Inches(0.42), colours[i % len(colours)])
        add_text(s, Inches(0.72), y + Inches(0.20), Inches(0.42), Inches(0.36), str(i + 1), 14, True, WHITE, PP_ALIGN.CENTER)
        add_text(s, Inches(1.35), y + Inches(0.18), Inches(11.1), Inches(0.46), item, 18, False, INK)
    return s


def section_slide(prs, title, subtitle=""):
    s = blank(prs, TEAL_DARK)
    add_text(s, Inches(0.8), Inches(2.7), Inches(11.7), Inches(1.4), title, 36, True, WHITE)
    if subtitle:
        add_text(s, Inches(0.8), Inches(4.2), Inches(11.7), Inches(1.0), subtitle, 20, False, LINE)
    return s


def content_slide(prs, title, bullets, aside=None, aside_title="Remember"):
    s = blank(prs)
    heading(s, title)
    if aside:
        add_bullets(s, Inches(0.55), Inches(1.15), Inches(7.7), Inches(5.5), bullets, 18)
        card(s, Inches(8.5), Inches(1.2), Inches(4.3), Inches(5.3), CREAM, TEAL)
        add_text(s, Inches(8.8), Inches(1.4), Inches(3.8), Inches(0.4), aside_title, 14, True, TEAL_DARK)
        add_bullets(s, Inches(8.8), Inches(1.95), Inches(3.8), Inches(4.2), aside, 15, MUTED, 8)
    else:
        add_bullets(s, Inches(0.55), Inches(1.15), Inches(12.2), Inches(5.5), bullets, 19)
    return s


def two_col(prs, title, left_title, left, right_title, right, left_fill=CREAM, right_fill=CARD):
    s = blank(prs)
    heading(s, title)
    card(s, Inches(0.5), Inches(1.15), Inches(6.05), Inches(5.4), left_fill, TEAL)
    add_text(s, Inches(0.8), Inches(1.35), Inches(5.5), Inches(0.4), left_title, 18, True, TEAL_DARK)
    add_bullets(s, Inches(0.8), Inches(1.9), Inches(5.5), Inches(4.4), left, 16)
    card(s, Inches(6.75), Inches(1.15), Inches(6.05), Inches(5.4), right_fill, NAVY)
    add_text(s, Inches(7.05), Inches(1.35), Inches(5.5), Inches(0.4), right_title, 18, True, NAVY)
    add_bullets(s, Inches(7.05), Inches(1.9), Inches(5.5), Inches(4.4), right, 16)
    return s


def question_slide(prs, title, questions, kind="Check your understanding"):
    s = blank(prs, ROSE_BG)
    chip(s, Inches(0.55), Inches(0.28), Inches(3.4), Inches(0.36), kind.upper(), ROSE)
    heading(s, title, Inches(0.75), 28)
    add_bullets(s, Inches(0.55), Inches(1.55), Inches(12.2), Inches(5.1), questions, 18)
    add_text(s, Inches(0.55), Inches(6.55), Inches(12.2), Inches(0.28), "Think first — answers are on the next slide.", 13, True, ROSE)
    return s


def answer_slide(prs, title, answers):
    s = blank(prs, GREEN_BG)
    chip(s, Inches(0.55), Inches(0.28), Inches(2.4), Inches(0.36), "ANSWERS", GREEN)
    heading(s, title, Inches(0.75), 28)
    add_bullets(s, Inches(0.55), Inches(1.55), Inches(12.2), Inches(5.2), answers, 18, INK)
    return s


def activity_slide(prs, title, steps, minutes="8 minutes"):
    s = blank(prs, AMBER_BG)
    chip(s, Inches(0.55), Inches(0.28), Inches(3.1), Inches(0.36), "STUDENT ACTIVITY", AMBER)
    heading(s, title, Inches(0.75), 28)
    add_text(s, Inches(10.1), Inches(0.78), Inches(2.6), Inches(0.35), minutes, 14, True, AMBER, PP_ALIGN.RIGHT)
    add_bullets(s, Inches(0.55), Inches(1.55), Inches(12.2), Inches(5.2), steps, 18)
    return s


def misconception_slide(prs, pairs):
    s = blank(prs)
    heading(s, "Common misconceptions")
    for i, (wrong, right) in enumerate(pairs):
        y = Inches(1.15) + Inches(i * 1.45)
        card(s, Inches(0.5), y, Inches(6.05), Inches(1.30), ROSE_BG, ROSE)
        add_text(s, Inches(0.75), y + Inches(0.12), Inches(5.6), Inches(0.28), "Not quite", 12, True, ROSE)
        add_text(s, Inches(0.75), y + Inches(0.42), Inches(5.6), Inches(0.75), wrong, 15, False, INK)
        card(s, Inches(6.75), y, Inches(6.05), Inches(1.30), GREEN_BG, GREEN)
        add_text(s, Inches(7.0), y + Inches(0.12), Inches(5.6), Inches(0.28), "Instead", 12, True, GREEN)
        add_text(s, Inches(7.0), y + Inches(0.42), Inches(5.6), Inches(0.75), right, 15, False, INK)
    return s


def table_slide(prs, title, headers, rows):
    s = blank(prs)
    heading(s, title)
    cols = len(headers)
    table_w = Inches(12.2)
    left = Inches(0.55)
    top = Inches(1.2)
    row_h = Inches(0.62)
    col_w = int(table_w) // cols
    # header
    add_rect(s, left, top, table_w, row_h, TEAL_DARK)
    for i, h in enumerate(headers):
        add_text(s, left + Emu(i * (table_w // cols)), top + Inches(0.12), Emu(table_w // cols), Inches(0.42), h, 14, True, WHITE, PP_ALIGN.CENTER)
    for r, row in enumerate(rows):
        y = top + row_h * (r + 1)
        bg = CREAM if r % 2 == 0 else CARD
        add_rect(s, left, y, table_w, row_h, bg)
        for i, cell in enumerate(row):
            add_text(s, left + Emu(i * (table_w // cols)), y + Inches(0.12), Emu(table_w // cols), Inches(0.42), cell, 14, False, INK, PP_ALIGN.CENTER)
    return s


def diagram_slide(prs, title, image_path, caption="", bullets=None):
    s = blank(prs)
    heading(s, title)
    if bullets:
        if Path(image_path).exists():
            s.shapes.add_picture(str(image_path), Inches(0.45), Inches(1.15), Inches(6.6), Inches(5.0))
        add_bullets(s, Inches(7.3), Inches(1.25), Inches(5.5), Inches(5.0), bullets, 17)
    else:
        if Path(image_path).exists():
            s.shapes.add_picture(str(image_path), Inches(2.4), Inches(1.1), Inches(8.5), Inches(5.0))
        if caption:
            add_text(s, Inches(0.55), Inches(6.2), Inches(12.2), Inches(0.4), caption, 14, False, MUTED, PP_ALIGN.CENTER)
    if caption and bullets:
        add_text(s, Inches(0.45), Inches(6.25), Inches(6.6), Inches(0.4), caption, 13, False, MUTED)
    return s


def apply_footers(prs, kicker: str):
    total = len(prs.slides)
    for i, slide in enumerate(prs.slides, 1):
        footer(slide, i, total, kicker)


def set_core(prs, title: str, subject: str):
    prs.core_properties.title = title
    prs.core_properties.author = "JDScience"
    prs.core_properties.subject = subject
    prs.core_properties.keywords = subject
    prs.core_properties.category = "Teaching resource"


def save_prs(prs, path: Path, title: str, subject: str, kicker: str):
    set_core(prs, title, subject)
    apply_footers(prs, kicker)
    path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(path))
    return path
