#!/usr/bin/env python3
"""A11.2 and A11.3 student worksheets and private teacher mark schemes."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from gcse_foundations.diagrams import text_block
from jdscience_video.theme import MUTED, TEAL_BAR, WHITE, font, logo
from tlevel_chem.worksheets import PAGE, MARGIN, INK, RULE, TEAL_DARK, LIGHT, _page, _lines, _heading, _para, save_pdf


def _table(d, y, rows, widths, row_h=52):
    x0 = MARGIN
    for i, row in enumerate(rows):
        x = x0
        fill = TEAL_DARK if i == 0 else WHITE
        ink = WHITE if i == 0 else INK
        for w, cell in zip(widths, row):
            d.rectangle((x, y + i * row_h, x + w, y + (i + 1) * row_h), fill=fill, outline=RULE, width=1)
            d.text((x + 8, y + i * row_h + 16), cell, font=font("semibold" if i == 0 else "regular", 14), fill=ink)
            x += w
    return y + len(rows) * row_h + 20


def a11_2_student():
    pages = []
    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 1, 6)
    d.text((MARGIN, 150), "Temperature and Rate of Reaction", font=font("bold", 34), fill=INK)
    d.text((MARGIN, 200), "T-Level Science  ·  Chemistry  ·  A11.2.1–A11.2.3", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 250), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 310, "1. Retrieval")
    y = _para(d, y, "1.1 State the two requirements for a successful collision and define activation energy.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "2. Increasing temperature")
    y = _para(d, y, "Complete the table, then write the full causal chain.")
    y = _table(d, y, [
        ("Quantity", "Effect of increasing temperature", "Why"),
        ("Average kinetic energy", "", ""),
        ("Particle speed", "", ""),
        ("Collision frequency", "", ""),
        ("Proportion with E ≥ Ea", "", ""),
        ("Rate of reaction", "", ""),
    ], [260, 430, 430])
    pages.append(img)

    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 2, 6)
    y = _heading(d, 140, "2.1 Full explanation")
    y = _para(d, y, "Explain, step by step, why increasing temperature increases reaction rate. Include kinetic energy, collision frequency, activation energy and successful collisions.")
    y = _lines(d, y + 6, 6)
    y = _para(d, y + 6, "2.2 Does increasing temperature remove the need for correct spatial orientation? Explain.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "3. Decreasing temperature")
    y = _table(d, y, [
        ("Quantity", "Effect of decreasing temperature", "Consequence for rate"),
        ("Average kinetic energy", "", ""),
        ("Particle speed", "", ""),
        ("Collision frequency", "", ""),
        ("Proportion with E ≥ Ea", "", ""),
        ("Successful collisions / time", "", ""),
    ], [280, 410, 430])
    pages.append(img)

    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 3, 6)
    y = _heading(d, 140, "3.1 Low-temperature prediction")
    y = _para(d, y, "Explain why lowering temperature decreases the rate of reaction.")
    y = _lines(d, y + 6, 5)
    y = _heading(d, y + 8, "4. Maxwell–Boltzmann distributions")
    y = _para(d, y, "4.1 What do the x-axis and y-axis represent? What does a vertical Ea line represent?")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "4.2 Describe how a Maxwell–Boltzmann distribution changes when temperature increases.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "4.3 What does the area to the right of Ea represent, and why is it larger at higher temperature?")
    y = _lines(d, y + 6, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 4, 6)
    y = _heading(d, 140, "4.4 What stays constant")
    y = _para(d, y, "For the same uncatalysed reaction, does increasing temperature change Ea? Explain.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "5. Distribution interpretation")
    y = _para(d, y, "Curve A is tall and narrow. Curve B has a lower peak and is broader toward higher energies.")
    y = _para(d, y, "5.1 Identify the higher-temperature curve and justify.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "5.2 Use the curves to explain which sample has the greater reaction rate.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "6. Error detective")
    for q in (
        "6.1 ‘Heating lowers activation energy.’",
        "6.2 ‘The Maxwell–Boltzmann peak becomes higher when temperature increases.’",
        "6.3 ‘Only collision frequency changes when temperature increases.’",
        "6.4 ‘Every collision with energy above Ea must react.’",
    ):
        y = _para(d, y, q)
        y = _lines(d, y + 4, 3)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 5, 6)
    y = _heading(d, 140, "7. Exam-style questions")
    y = _para(d, y, "A reaction mixture is heated from 298 K to 318 K.")
    y = _para(d, y + 4, "7.1 [2] Explain the effect on average kinetic energy and collision frequency.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "7.2 [2] Explain why the proportion of successful collisions increases.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "7.3 [3] Describe the change in the Maxwell–Boltzmann distribution.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "7.4 [3] Explain why heating increases reaction rate using collision theory.")
    y = _lines(d, y + 6, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.2 Temperature and Rate of Reaction", 6, 6)
    y = _heading(d, 140, "8. Final knowledge check")
    for q in (
        "8.1 How does higher temperature affect average kinetic energy?",
        "8.2 How does it affect collision frequency?",
        "8.3 How does it affect the proportion with E ≥ Ea?",
        "8.4 What happens to the Maxwell–Boltzmann peak at higher temperature?",
        "8.5 What happens to rate when temperature decreases, and why?",
        "8.6 Does temperature alone change Ea for the same reaction?",
    ):
        y = _para(d, y, q)
        y = _lines(d, y + 4, 3)
    pages.append(img)
    return pages


def a11_2_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.2 Temperature and Rate", 1, 3, confidential=True)
    y = _heading(d, 140, "From the original A11.2 Teacher Answer Workbook")
    y = _para(d, y, "1.1 Successful collisions require energy ≥ Ea and correct spatial orientation. Ea is the minimum collision energy for a successful reaction.")
    y = _para(d, y, "2 Table: average KE increases; speed increases; collision frequency increases; proportion with E ≥ Ea increases; rate increases.")
    y = _para(d, y, "2.1 Higher T increases average KE, so particles move faster and collide more frequently. The Maxwell–Boltzmann distribution changes so a greater proportion have E ≥ Ea. Successful collisions occur more frequently and rate increases.")
    y = _para(d, y, "2.2 No. Correct spatial orientation is still required.")
    y = _para(d, y, "3 Table: all listed quantities decrease; successful collisions per unit time decrease, so rate decreases.")
    y = _para(d, y, "3.1 Lower T reduces average KE and speed. Collision frequency falls and a smaller proportion have E ≥ Ea, so rate decreases.")
    y = _para(d, y, "4.1 x-axis: particle energy. y-axis: number/fraction of particles. Ea line: activation-energy threshold.")
    y = _para(d, y, "4.2 Broader, extends further toward higher energies; peak becomes lower. Total area unchanged for the same sample.")
    y = _para(d, y, "4.3 Area to the right of Ea is the proportion with E ≥ Ea. Larger at higher T because more of the distribution is at high energy.")
    y = _para(d, y, "4.4 No. Temperature changes the energy distribution, not Ea for the same uncatalysed reaction.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.2 Temperature and Rate", 2, 3, confidential=True)
    y = _heading(d, 140, "Interpretation, errors and exam marks")
    y = _para(d, y, "5.1 Curve B is higher T: broader, lower peak, further toward higher energies.")
    y = _para(d, y, "5.2 Curve B has a larger E ≥ Ea proportion, plus faster motion and higher collision frequency, so greater rate.")
    y = _para(d, y, "6.1 Heating does not lower Ea for the same uncatalysed reaction.")
    y = _para(d, y, "6.2 At higher T the peak becomes lower and the distribution broader.")
    y = _para(d, y, "6.3 Both collision frequency and the E ≥ Ea proportion increase.")
    y = _para(d, y, "6.4 Energy above Ea is necessary but orientation is still required.")
    y = _para(d, y, "7.1 [2] Average KE increases (1); particles move faster / collide more frequently (1).")
    y = _para(d, y, "7.2 [2] Greater proportion have E ≥ Ea (1); more collisions can satisfy the energy requirement (1).")
    y = _para(d, y, "7.3 [3] Broader (1); lower peak / shift to higher energies (1); larger area to the right of Ea (1).")
    y = _para(d, y, "7.4 [3] Collision frequency increases (1); greater proportion E ≥ Ea (1); successful collisions more frequent so rate increases (1).")
    y = _para(d, y, "8.1 Increases.  8.2 Increases.  8.3 Increases.  8.4 Peak lower; distribution broader.  8.5 Rate decreases because frequency and the sufficient-energy proportion both fall.  8.6 No.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.2 Temperature and Rate", 3, 3, confidential=True)
    y = _heading(d, 140, "Do not publish")
    y = _para(d, y, "This scheme mirrors the original A11.2 Teacher Answer Workbook. Keep it off the public website.")
    pages.append(img)
    return pages


def a11_3_student():
    pages = []
    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 1, 6)
    d.text((MARGIN, 150), "Catalysts and Reaction Rate", font=font("bold", 34), fill=INK)
    d.text((MARGIN, 200), "T-Level Science  ·  Chemistry  ·  A11.3.1–A11.3.2", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 250), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 310, "1. Retrieval")
    y = _para(d, y, "1.1 Define activation energy and state the two conditions for a successful collision.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "2. Defining a catalyst")
    y = _para(d, y, "2.1 Write the complete definition of a catalyst.")
    y = _lines(d, y + 6, 4)
    y = _table(d, y, [
        ("Scenario", "Rate up?", "Permanent change?", "Catalyst?", "Justification"),
        ("X faster; recovered unchanged", "", "", "", ""),
        ("Y faster; converted to a product", "", "", "", ""),
        ("Z recovered; no rate effect", "", "", "", ""),
    ], [280, 160, 220, 160, 300], 64)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 2, 6)
    y = _heading(d, 140, "2.2 Evidence")
    y = _para(d, y, "What evidence would support the claim that an unknown substance is acting as a catalyst?")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "3. Alternative pathway")
    y = _para(d, y, "3.1 Explain how a catalyst increases rate using alternative pathway and activation energy.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "3.2 Explain why a lower activation energy increases the proportion of successful collisions.")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "4. Maxwell–Boltzmann distribution")
    y = _para(d, y, "4.1 At constant temperature, does adding a catalyst change the Maxwell–Boltzmann distribution? Explain.")
    y = _lines(d, y + 6, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 3, 6)
    y = _heading(d, 140, "4.2 Two activation energies")
    y = _para(d, y, "A reaction has Ea = 85 kJ mol⁻¹ without a catalyst and 52 kJ mol⁻¹ with a catalyst. Which Ea line should be further left, and why?")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "4.3 What does the area to the right of an Ea line represent? How does a catalyst affect this area?")
    y = _lines(d, y + 6, 4)
    y = _heading(d, y + 8, "5. Catalyst versus temperature")
    y = _table(d, y, [
        ("Change", "Maxwell–Boltzmann distribution", "Activation energy", "Why rate increases"),
        ("Increase temperature", "", "", ""),
        ("Add catalyst, same T", "", "", ""),
    ], [260, 320, 260, 280], 90)
    y = _heading(d, y + 8, "6. Error detective")
    for q in (
        "6.1 ‘A catalyst is any substance that speeds up a reaction.’",
        "6.2 ‘A catalyst gives the reacting particles more kinetic energy.’",
    ):
        y = _para(d, y, q)
        y = _lines(d, y + 4, 3)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 4, 6)
    y = _heading(d, 140, "6. Error detective continued")
    for q in (
        "6.3 ‘A catalyst changes the shape of the Maxwell–Boltzmann distribution at constant temperature.’",
        "6.4 ‘A catalyst is used up during the reaction.’",
    ):
        y = _para(d, y, q)
        y = _lines(d, y + 4, 3)
    y = _heading(d, y + 8, "7. Catalyst identification")
    y = _para(d, y, "7.1 A reaction takes 180 s without A and 65 s with A. A is recovered with no permanent chemical change. Is A a catalyst? Justify.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "7.2 B increases rate but is completely converted and not regenerated. Does this satisfy the definition? Explain.")
    y = _lines(d, y + 6, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 5, 6)
    y = _heading(d, 140, "8. Exam-style questions")
    y = _para(d, y, "8.1 [2] Define a catalyst.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "8.2 [2] Explain how a catalyst increases rate in terms of activation energy.")
    y = _lines(d, y + 6, 4)
    y = _para(d, y + 6, "8.3 [3] Explain how catalysed and uncatalysed pathways should be shown on one Maxwell–Boltzmann distribution at constant temperature.")
    y = _lines(d, y + 6, 5)
    y = _para(d, y + 6, "8.4 [2] Explain why the catalysed pathway gives a greater proportion of successful collisions.")
    y = _lines(d, y + 6, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A11.3 Catalysts and Reaction Rate", 6, 6)
    y = _heading(d, 140, "9. Final knowledge check")
    for q in (
        "9.1 Give the full definition of a catalyst.",
        "9.2 What pathway does a catalyst provide?",
        "9.3 What happens to Ea?",
        "9.4 Does the energy distribution change at constant temperature?",
        "9.5 What happens to the proportion with E ≥ Ea?",
        "9.6 Why does rate increase?",
    ):
        y = _para(d, y, q)
        y = _lines(d, y + 4, 3)
    pages.append(img)
    return pages


def a11_3_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.3 Catalysts and Reaction Rate", 1, 3, confidential=True)
    y = _heading(d, 140, "From the original A11.3 Teacher Answer Workbook")
    y = _para(d, y, "1.1 Ea is the minimum collision energy for a successful reaction. Successful collisions need sufficient energy and correct orientation.")
    y = _para(d, y, "2.1 A catalyst increases the rate of a chemical reaction without itself being permanently chemically changed.")
    y = _para(d, y, "X: yes/no/yes — both parts satisfied. Y: yes/yes/no — permanently changed. Z: no/no/no — no rate increase.")
    y = _para(d, y, "2.2 Need rate increase and evidence the substance is not permanently chemically changed / is recovered.")
    y = _para(d, y, "3.1 Alternative pathway with lower Ea than the uncatalysed pathway, increasing rate.")
    y = _para(d, y, "3.2 Greater proportion have E ≥ lower Ea, so more collisions satisfy the energy requirement (orientation still needed).")
    y = _para(d, y, "4.1 No. At constant T the distribution is unchanged; the Ea threshold changes.")
    y = _para(d, y, "4.2 52 kJ mol⁻¹ further left — lower Ea of the catalysed pathway.")
    y = _para(d, y, "4.3 Area to the right of Ea is the proportion with E ≥ Ea. Lowering Ea increases this area.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.3 Catalysts and Reaction Rate", 2, 3, confidential=True)
    y = _heading(d, 140, "Comparison, errors and exam marks")
    y = _para(d, y, "5 Temperature: distribution changes (broader, lower peak); Ea unchanged for the same pathway; more frequent collisions and greater E ≥ Ea proportion.")
    y = _para(d, y, "5 Catalyst at same T: distribution unchanged; Ea lower; greater proportion has E ≥ lower Ea.")
    y = _para(d, y, "6.1 Incomplete: must include no permanent chemical change.")
    y = _para(d, y, "6.2 Incorrect: it does not give particles more KE at constant T.")
    y = _para(d, y, "6.3 Incorrect: distribution unchanged; Ea threshold is lower.")
    y = _para(d, y, "6.4 Incorrect: regenerated overall, not permanently changed.")
    y = _para(d, y, "7.1 Yes — faster and recovered unchanged.")
    y = _para(d, y, "7.2 No — permanently converted, not regenerated.")
    y = _para(d, y, "8.1 [2] Increases rate (1); without permanent chemical change (1).")
    y = _para(d, y, "8.2 [2] Alternative pathway (1) with lower Ea (1).")
    y = _para(d, y, "8.3 [3] Same distribution at constant T (1); catalysed Ea lower/further left (1); larger area to its right (1).")
    y = _para(d, y, "8.4 [2] Greater proportion have E ≥ lower Ea (1); more collisions can be successful (1).")
    y = _para(d, y, "9.1 Full definition. 9.2 Alternative pathway. 9.3 Lower for catalysed pathway. 9.4 No if T constant. 9.5 Increases. 9.6 Successful collisions more frequent.")
    pages.append(img)

    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A11.3 Catalysts and Reaction Rate", 3, 3, confidential=True)
    y = _heading(d, 140, "Do not publish")
    y = _para(d, y, "This scheme mirrors the original A11.3 Teacher Answer Workbook. Keep it off the public website.")
    pages.append(img)
    return pages


def main() -> None:
    jobs = [
        ("a11-2-temperature-and-rate", a11_2_student, a11_2_teacher),
        ("a11-3-catalysts", a11_3_student, a11_3_teacher),
    ]
    for slug, student_fn, teacher_fn in jobs:
        student = Path(f"/opt/cursor/artifacts/jdscience-{slug}-worksheet.pdf")
        teacher = Path(f"/opt/cursor/artifacts/PRIVATE-{slug}-teacher-marking-scheme.pdf")
        public = ROOT / f"public/resources/t-level/science/videos/{slug}/jdscience-{slug}-worksheet.pdf"
        private = ROOT / f"content/tlevel-chemistry/private/{slug}-teacher-marking-scheme.pdf"
        save_pdf(student_fn(), student)
        save_pdf(student_fn(), public)
        save_pdf(teacher_fn(), teacher)
        save_pdf(teacher_fn(), private)


if __name__ == "__main__":
    main()
