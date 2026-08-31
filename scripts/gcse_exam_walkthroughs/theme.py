"""JDScience PDF theme for GCSE exam walkthrough packs."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "content/lessons/_media"
OUT = ROOT / "content/shop/gcse-exam-walkthroughs"

TEAL = HexColor("#009688")
TEAL_DARK = HexColor("#004D40")
TEAL_MID = HexColor("#00796B")
INK = HexColor("#0F172A")
MUTED = HexColor("#475569")
CREAM = HexColor("#F0FDFA")
LINE = HexColor("#CBD5E1")
AMBER = HexColor("#B45309")
GREEN = HexColor("#047857")
NAVY = HexColor("#1E3A5F")

PAGE_W, PAGE_H = A4


def ensure_logo() -> Path:
    logo = MEDIA / "jdscience-footer-logo.png"
    if logo.exists():
        return logo
    MEDIA.mkdir(parents=True, exist_ok=True)
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, 159, 159), radius=28, fill=(0, 150, 136, 255))
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58)
    except OSError:
        font = ImageFont.load_default()
    d.text((80, 78), "JD", fill="white", font=font, anchor="mm")
    img.save(logo)
    return logo


def styles():
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "kicker", parent=base["Normal"], textColor=TEAL, fontName="Helvetica-Bold", fontSize=9, spaceAfter=2
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            textColor=TEAL_DARK,
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=30,
            spaceAfter=6,
            alignment=TA_LEFT,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            textColor=MUTED,
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            spaceAfter=8,
        ),
        "section": ParagraphStyle(
            "section",
            parent=base["Heading1"],
            textColor=TEAL_DARK,
            fontName="Helvetica-Bold",
            fontSize=16,
            spaceBefore=10,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], textColor=TEAL_DARK, fontName="Helvetica-Bold", fontSize=13, spaceBefore=8, spaceAfter=4
        ),
        "h3": ParagraphStyle(
            "h3", parent=base["Heading3"], textColor=TEAL_MID, fontName="Helvetica-Bold", fontSize=11, spaceBefore=6, spaceAfter=3
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"], textColor=INK, fontName="Helvetica", fontSize=10, leading=13, spaceAfter=4
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            textColor=INK,
            fontName="Helvetica",
            fontSize=10,
            leading=13,
            leftIndent=12,
            spaceAfter=2,
        ),
        "note": ParagraphStyle(
            "note", parent=base["Normal"], textColor=MUTED, fontName="Helvetica-Oblique", fontSize=9, leading=12, spaceAfter=4
        ),
        "label": ParagraphStyle(
            "label", parent=base["Normal"], textColor=TEAL_DARK, fontName="Helvetica-Bold", fontSize=10, spaceAfter=2
        ),
        "meta": ParagraphStyle(
            "meta", parent=base["Normal"], textColor=MUTED, fontName="Helvetica", fontSize=9, leading=12, spaceAfter=2
        ),
        "question": ParagraphStyle(
            "question",
            parent=base["Normal"],
            textColor=INK,
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            spaceBefore=4,
            spaceAfter=6,
            backColor=CREAM,
            borderPadding=6,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"], textColor=white, fontName="Helvetica", fontSize=7, alignment=TA_CENTER
        ),
    }


def page_margins():
    return {
        "leftMargin": 16 * mm,
        "rightMargin": 16 * mm,
        "topMargin": 20 * mm,
        "bottomMargin": 18 * mm,
    }


def draw_branded_page(canvas, doc, pack_title: str, section_hint: str = ""):
    canvas.saveState()
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, PAGE_H - 11 * mm, PAGE_W, 11 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(14 * mm, PAGE_H - 7.5 * mm, "JDScience")
    canvas.setFont("Helvetica", 7)
    canvas.drawString(32 * mm, PAGE_H - 7.5 * mm, "jdscience.co.uk")
    if section_hint:
        canvas.drawCentredString(PAGE_W / 2, PAGE_H - 7.5 * mm, section_hint[:80])
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, 0, PAGE_W, 9 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(14 * mm, 3.2 * mm, pack_title[:70])
    canvas.drawRightString(PAGE_W - 14 * mm, 3.2 * mm, f"Page {doc.page}")
    canvas.drawCentredString(PAGE_W / 2, 3.2 * mm, "Produced by JDScience")
    canvas.restoreState()


def draw_cover_page(canvas, doc, subject: str):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, 0, 8 * mm, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, PAGE_H - 14 * mm, PAGE_W, 14 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(14 * mm, PAGE_H - 9 * mm, "JDScience  ·  jdscience.co.uk")
    canvas.setFillColor(TEAL_DARK)
    canvas.setFont("Helvetica-Bold", 28)
    canvas.drawString(18 * mm, PAGE_H - 80 * mm, f"GCSE {subject}")
    canvas.drawString(18 * mm, PAGE_H - 95 * mm, "Exam Walkthrough Pack")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 14)
    canvas.drawString(
        18 * mm,
        PAGE_H - 108 * mm,
        "Step-by-step worked exam-style questions with full explanations",
    )
    canvas.setFont("Helvetica-Oblique", 10)
    canvas.drawString(
        18 * mm,
        PAGE_H - 125 * mm,
        "Original JDScience exam-style questions — not copied from past papers",
    )
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, 0, PAGE_W, 9 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 7)
    canvas.drawCentredString(PAGE_W / 2, 3.2 * mm, "Produced by JDScience  ·  jdscience.co.uk")
    canvas.restoreState()
