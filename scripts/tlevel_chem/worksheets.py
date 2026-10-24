#!/usr/bin/env python3
"""JD Science branded A11.1 student worksheet and private teacher mark scheme."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.theme import GOLD, GREEN, MUTED, NAVY_CARD, TEAL, TEAL_BAR, WHITE, font, logo

PAGE = (1240, 1754)  # A4 at ~150 dpi
MARGIN = 56
INK = (15, 23, 42)
RULE = (203, 213, 225)
TEAL_DARK = (0, 77, 64)
LIGHT = (248, 250, 252)


def _page(title: str, subtitle: str, page_no: int, total: int, confidential: bool = False) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", PAGE, LIGHT)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, PAGE[0], 92), fill=TEAL_DARK)
    mark = logo().resize((48, 48))
    img.paste(mark, (MARGIN, 22), mark)
    d.text((MARGIN + 64, 28), "JD SCIENCE", font=font("bold", 22), fill=WHITE)
    d.text((MARGIN + 64, 56), title, font=font("semibold", 16), fill=TEAL_BAR)
    if confidential:
        d.rounded_rectangle((PAGE[0] - 340, 22, PAGE[0] - MARGIN, 70), 8, fill=(180, 40, 50))
        d.text((PAGE[0] - 198, 46), "TEACHER ONLY", font=font("bold", 16), fill=WHITE, anchor="mm")
    d.text((MARGIN, 118), subtitle, font=font("regular", 16), fill=MUTED)
    d.text((PAGE[0] - MARGIN, PAGE[1] - 28), f"{page_no} / {total}", font=font("medium", 14), fill=MUTED, anchor="rm")
    d.text((MARGIN, PAGE[1] - 28), "jdscience.co.uk  ·  T-Level Science  ·  Chemistry  ·  A11.1", font=font("medium", 13), fill=MUTED, anchor="lm")
    return img, d


def _lines(d, y, n=4, x0=MARGIN, x1=PAGE[0] - MARGIN, gap=36):
    for i in range(n):
        yy = y + i * gap
        d.line((x0, yy, x1, yy), fill=RULE, width=2)
    return y + n * gap + 10


def _heading(d, y, text):
    d.text((MARGIN, y), text, font=font("bold", 22), fill=TEAL_DARK)
    return y + 40


def _para(d, y, text, size=16, fill=INK, width=1120):
    from gcse_foundations.diagrams import text_block
    used = text_block(d, (MARGIN, y), text, font("regular", size), fill, width)
    return y + max(used, 28) + 8


def student_pages() -> list[Image.Image]:
    pages = []

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 1, 6)
    d.text((MARGIN, 150), "Principles of Collision Theory", font=font("bold", 36), fill=INK)
    d.text((MARGIN, 200), "T-Level Technical Qualification in Science  ·  Chemistry  ·  A11.1", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 250), "Name: ________________________________    Date: ____________________    Class: ______________", font=font("regular", 16), fill=INK)
    y = _heading(d, 310, "Specification coverage")
    d.rounded_rectangle((MARGIN, y, PAGE[0] - MARGIN, y + 150), 12, fill=WHITE, outline=RULE, width=2)
    d.text((MARGIN + 20, y + 20), "A11.1.1  Particles must collide with enough energy to break and reform bonds (activation energy).", font=font("regular", 16), fill=INK)
    d.text((MARGIN + 20, y + 56), "A11.1.2  Particles must be in the correct spatial orientation.", font=font("regular", 16), fill=INK)
    d.text((MARGIN + 20, y + 92), "Use both conditions when you classify a collision as successful or unsuccessful.", font=font("regular", 16), fill=INK)
    y = _heading(d, y + 180, "1. Retrieval starter")
    y = _para(d, y, "1.1 Why might two reactant particles collide without producing products? Give two possible reasons.")
    y = _lines(d, y + 8, 5)
    y = _heading(d, y + 10, "2. Activation energy")
    y = _para(d, y, "2.1 Define activation energy.")
    y = _lines(d, y + 8, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 2, 6)
    y = _heading(d, 140, "2.2 Particle explanation")
    y = _para(d, y, "Explain why collision energy below the activation energy does not produce the specified reaction.")
    y = _lines(d, y + 8, 5)
    y = _para(d, y + 6, "Complete the table. Compare each collision energy with the activation energy.")
    rows = [
        ("Collision", "Ea / kJ mol⁻¹", "Collision energy / kJ mol⁻¹", "Energy requirement met?", "Reason"),
        ("A", "45", "30", "", ""),
        ("B", "45", "45", "", ""),
        ("C", "45", "52", "", ""),
        ("D", "62", "58", "", ""),
    ]
    x0, y0 = MARGIN, y + 8
    widths = [140, 180, 280, 260, 260]
    row_h = 56
    x = x0
    for i, row in enumerate(rows):
        x = x0
        fill = TEAL_DARK if i == 0 else WHITE
        ink = WHITE if i == 0 else INK
        for w, cell in zip(widths, row):
            d.rectangle((x, y0 + i * row_h, x + w, y0 + (i + 1) * row_h), fill=fill, outline=RULE, width=1)
            d.text((x + 10, y0 + i * row_h + 18), cell, font=font("semibold" if i == 0 else "regular", 14), fill=ink)
            x += w
    y = y0 + len(rows) * row_h + 24
    y = _para(d, y, "2.3 Explain why energy is required when bonds must break and reform during a reaction.")
    y = _lines(d, y + 8, 5)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 3, 6)
    y = _heading(d, 140, "3. Spatial orientation")
    y = _para(d, y, "3.1 Explain what ‘correct spatial orientation’ means in collision theory.")
    y = _lines(d, y + 8, 5)
    y = _para(d, y + 8, "3.2 A collision has more than the activation energy, but the reacting parts of the particles do not meet. Predict the outcome and explain.")
    y = _lines(d, y + 8, 5)
    y = _heading(d, y + 8, "4. Applying both conditions")
    y = _para(d, y, "These five scenarios are taken from the A11.1 student workbook. Decide whether each collision can be successful and justify both tests.")
    rows = [
        ("Scenario", "Ea", "Energy", "Orientation", "Successful?", "Justification"),
        ("1", "45", "30", "Correct", "", ""),
        ("2", "45", "55", "Incorrect", "", ""),
        ("3", "45", "50", "Correct", "", ""),
        ("4", "62", "70", "Correct", "", ""),
        ("5", "62", "61", "Correct", "", ""),
    ]
    widths = [130, 110, 140, 180, 180, 380]
    x0, y0 = MARGIN, y + 8
    row_h = 58
    for i, row in enumerate(rows):
        x = x0
        fill = TEAL_DARK if i == 0 else WHITE
        ink = WHITE if i == 0 else INK
        for w, cell in zip(widths, row):
            d.rectangle((x, y0 + i * row_h, x + w, y0 + (i + 1) * row_h), fill=fill, outline=RULE, width=1)
            d.text((x + 8, y0 + i * row_h + 18), cell, font=font("semibold" if i == 0 else "regular", 14), fill=ink)
            x += w
    pages.append(img)

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 4, 6)
    y = _heading(d, 140, "4.1 Decision rule")
    y = _para(d, y, "Write a two-step decision rule for deciding whether a collision is successful.")
    y = _lines(d, y + 8, 5)
    y = _heading(d, y + 8, "5. Error analysis")
    y = _para(d, y, "5.1 ‘Every collision produces a reaction.’ Correct the statement.")
    y = _lines(d, y + 8, 4)
    y = _para(d, y + 6, "5.2 ‘If collision energy is high enough, orientation does not matter.’ Correct the statement.")
    y = _lines(d, y + 8, 4)
    y = _para(d, y + 6, "5.3 ‘Correct orientation can make up for collision energy below activation energy.’ Correct the statement.")
    y = _lines(d, y + 8, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 5, 6)
    y = _heading(d, 140, "6. Unfamiliar collision challenge")
    y = _para(d, y, "6.1 Reaction X has Ea = 80 kJ mol⁻¹. A collision has 92 kJ mol⁻¹ and incorrect orientation. Decide whether it is successful and justify.")
    y = _lines(d, y + 8, 5)
    y = _para(d, y + 8, "6.2 Reaction Y has Ea = 35 kJ mol⁻¹. A collision has 35 kJ mol⁻¹ and correct orientation. Decide whether it can be successful and justify.")
    y = _lines(d, y + 8, 5)
    y = _heading(d, y + 8, "7. Exam-style questions")
    y = _para(d, y, "A reaction occurs when particles P and Q collide. The activation energy is 62 kJ mol⁻¹.")
    y = _para(d, y + 4, "7.1 [2] Collision 1 has 58 kJ mol⁻¹ and the correct orientation. Explain why it is unsuccessful.")
    y = _lines(d, y + 8, 4)
    y = _para(d, y + 6, "7.2 [2] Collision 2 has 70 kJ mol⁻¹ but incorrect orientation. Explain why it is unsuccessful.")
    y = _lines(d, y + 8, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.1 Principles of Collision Theory", 6, 6)
    y = _heading(d, 140, "7. Exam-style questions continued")
    y = _para(d, y, "7.3 [2] State the two conditions required for a successful collision.")
    y = _lines(d, y + 8, 4)
    y = _para(d, y + 6, "7.4 [2] Explain why many collisions between reactant particles do not form products.")
    y = _lines(d, y + 8, 4)
    y = _heading(d, y + 8, "8. Final knowledge check")
    for prompt in (
        "8.1 Define activation energy.",
        "8.2 What happens if collision energy is below activation energy?",
        "8.3 What is correct spatial orientation?",
        "8.4 Can sufficient energy alone guarantee reaction? Explain.",
        "8.5 State both requirements for a successful collision.",
    ):
        y = _para(d, y, prompt)
        y = _lines(d, y + 4, 3)
    pages.append(img)
    return pages


def mark_scheme_pages() -> list[Image.Image]:
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.1 Principles of Collision Theory", 1, 4, confidential=True)
    y = _heading(d, 140, "Source note — do not publish")
    y = _para(d, y, "The original A11.1 Teacher Answer Workbook was not supplied with this pilot package. Marks below are derived from the A11.1 Teacher PowerPoint answer slides and the A11.1 Student Workbook questions. Do not upload this file to the public website.")
    y = _heading(d, y + 8, "1. Retrieval starter")
    y = _para(d, y, "Award 1 mark for insufficient collision energy / energy below activation energy. Award 1 mark for unsuitable / incorrect spatial orientation. Accept ‘bonds cannot break / rearrange’. Do not award ‘they bounce off’ with no energy or orientation reason.")
    y = _heading(d, y + 8, "2. Activation energy")
    y = _para(d, y, "2.1 Activation energy is the minimum energy that colliding particles must have for a successful reaction. (2) Mention of ‘minimum’ and ‘successful reaction / required bond changes’.")
    y = _para(d, y, "2.2 There is insufficient energy for the required bonds to break and atoms to rearrange, so the specified products do not form. (2)")
    y = _para(d, y, "2.2 table (energy requirement only): A 30 < 45 → no, insufficient energy. B 45 = 45 → yes, energy requirement met. C 52 > 45 → yes. D 58 < 62 → no. This table is from the student workbook and tests energy only; orientation is assessed in section 4.")
    y = _para(d, y, "2.3 Energy is needed to break existing bonds / allow atoms to rearrange before new bonds form. (2)")
    y = _heading(d, y + 8, "3. Spatial orientation")
    y = _para(d, y, "3.1 Particles meet so the relevant atoms or reactive regions are positioned for the required bond changes. Orientation is how they meet, not simply whether they touch. (2)")
    y = _para(d, y, "3.2 Unsuccessful. Energy is sufficient but the orientation requirement is not met, so products do not form from that collision. (2)")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.1 Principles of Collision Theory", 2, 4, confidential=True)
    y = _heading(d, 140, "4. Applying both conditions")
    rows = [
        "1  45 / 30 / correct  → unsuccessful. 30 < 45, insufficient energy despite correct orientation.",
        "2  45 / 55 / incorrect → unsuccessful. Energy is sufficient but spatial orientation is incorrect.",
        "3  45 / 50 / correct  → successful collision possible. Energy exceeds Ea and orientation is correct.",
        "4  62 / 70 / correct  → successful collision possible. Energy exceeds Ea and orientation is correct.",
        "5  62 / 61 / correct  → unsuccessful. 61 < 62, insufficient energy despite correct orientation.",
    ]
    for row in rows:
        y = _para(d, y, row)
    y = _para(d, y + 6, "Award 1 mark for the correct successful/unsuccessful judgement and 1 mark for a justification that uses the failing or passing condition. These five rows match the student workbook. The lesson video works collisions A/B/C from the teacher PowerPoint (30/55/50 kJ mol⁻¹ at Ea 45), which are the same as scenarios 1–3.")
    y = _heading(d, y + 8, "4.1 Decision rule")
    y = _para(d, y, "Step 1: compare collision energy with activation energy. If energy < Ea, unsuccessful (insufficient energy). Step 2: if energy ≥ Ea, check spatial orientation. Both conditions required. (2)")
    y = _heading(d, y + 8, "5. Error analysis")
    y = _para(d, y, "5.1 Incorrect. Particles react only when energy and orientation conditions are both satisfied.")
    y = _para(d, y, "5.2 Incorrect. Enough energy does not guarantee reaction; spatial orientation must also be correct.")
    y = _para(d, y, "5.3 Incorrect. Correct orientation cannot compensate for collision energy below activation energy. Both conditions are required.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.1 Principles of Collision Theory", 3, 4, confidential=True)
    y = _heading(d, 140, "6. Unfamiliar collision challenge")
    y = _para(d, y, "6.1 Unsuccessful. 92 > 80 so the energy requirement is met, but incorrect orientation means the required interaction cannot occur. (2)")
    y = _para(d, y, "6.2 Successful collision is possible. 35 = 35, so energy is at least Ea, and orientation is correct. Accept ‘equal to Ea is sufficient’. (2)")
    y = _heading(d, y + 8, "7. Exam-style questions  [8]")
    y = _para(d, y, "7.1 [2] 58 kJ mol⁻¹ is below the 62 kJ mol⁻¹ activation energy; there is insufficient energy for the required bond changes. Do not award ‘it is unsuccessful’ alone.")
    y = _para(d, y, "7.2 [2] Energy exceeds activation energy, but the particles are not in the correct spatial orientation for the required interaction / bond rearrangement.")
    y = _para(d, y, "7.3 [2] Collision energy at least the activation energy AND correct spatial orientation.")
    y = _para(d, y, "7.4 [2] Many collisions fail one or both requirements: insufficient energy and/or incorrect orientation.")
    y = _heading(d, y + 8, "8. Final knowledge check")
    y = _para(d, y, "8.1 Minimum energy colliding particles must have for a successful reaction.")
    y = _para(d, y, "8.2 Insufficient energy for required bond breaking/rearrangement; unsuccessful collision.")
    y = _para(d, y, "8.3 Particles meet so relevant atoms/reactive regions can interact.")
    y = _para(d, y, "8.4 No. Spatial orientation must also be correct.")
    y = _para(d, y, "8.5 Sufficient collision energy (at least Ea) and correct spatial orientation.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.1 Principles of Collision Theory", 4, 4, confidential=True)
    y = _heading(d, 140, "Video worked examples (teacher PowerPoint A/B/C)")
    y = _para(d, y, "Reaction X, Ea = 45 kJ mol⁻¹. These values are from the teacher PowerPoint guided-application slide, not from student table 2.2.")
    y = _para(d, y, "A 30 kJ mol⁻¹, correct orientation → unsuccessful, energy below Ea.")
    y = _para(d, y, "B 55 kJ mol⁻¹, incorrect orientation → unsuccessful, orientation fails.")
    y = _para(d, y, "C 50 kJ mol⁻¹, correct orientation → successful collision possible.")
    y = _heading(d, y + 12, "Held source discrepancies (do not silently resolve)")
    y = _para(d, y, "A12.1 timing values remain flagged from the completed source audit: teacher slides use 95 s and 48 s, while the student workbook uses 96 s, 51 s and 29 s. Do not choose one set for A12.1 production until the original A12.1 PDFs are reconciled in a later review.")
    y = _para(d, y, "A11.1 student table 2.2 (energy-only: 30 / 45 / 52 / 58) is not the same as teacher guided A/B/C (30 / 55 / 50 with orientation). Both appear in this pack. The video teaches A/B/C; the worksheet assesses both tables.")
    y = _para(d, y, "A11.1 Teacher Answer Workbook is still missing. If it arrives later, compare every mark in this scheme against that booklet before batch-producing A11.2–A12.6.")
    pages.append(img)
    return pages


def save_pdf(pages: list[Image.Image], dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = [p.convert("RGB") for p in pages]
    rgb[0].save(dest, save_all=True, append_images=rgb[1:], resolution=150.0)
    print("wrote", dest, "pages", len(pages), "bytes", dest.stat().st_size)


def main() -> None:
    student = Path("/opt/cursor/artifacts/jdscience-a11-1-collision-theory-worksheet.pdf")
    teacher = Path("/opt/cursor/artifacts/PRIVATE-a11-1-teacher-marking-scheme.pdf")
    public_student = ROOT / "public/resources/t-level/science/videos/a11-1-collision-theory/jdscience-a11-1-collision-theory-worksheet.pdf"
    private_teacher = ROOT / "content/tlevel-chemistry/private/a11-1-teacher-marking-scheme.pdf"
    save_pdf(student_pages(), student)
    save_pdf(student_pages(), public_student)
    save_pdf(mark_scheme_pages(), teacher)
    save_pdf(mark_scheme_pages(), private_teacher)


if __name__ == "__main__":
    main()
