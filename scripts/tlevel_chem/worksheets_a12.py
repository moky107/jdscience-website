#!/usr/bin/env python3
"""A12 student worksheets and private teacher mark schemes from the source extracts/PDFs."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.theme import font
from tlevel_chem.worksheets import INK, LIGHT, MARGIN, PAGE, RULE, TEAL_DARK, WHITE, _heading, _lines, _page, _para, save_pdf
from tlevel_chem.worksheets_a11 import _table


def _pack(slug, spec, title, student_builder, teacher_builder):
    student = Path(f"/opt/cursor/artifacts/jdscience-{slug}-worksheet.pdf")
    teacher = Path(f"/opt/cursor/artifacts/PRIVATE-{slug}-teacher-marking-scheme.pdf")
    public = ROOT / f"public/resources/t-level/science/videos/{slug}/jdscience-{slug}-worksheet.pdf"
    private = ROOT / f"content/tlevel-chemistry/private/{slug}-teacher-marking-scheme.pdf"
    save_pdf(student_builder(), student)
    save_pdf(student_builder(), public)
    save_pdf(teacher_builder(), teacher)
    save_pdf(teacher_builder(), private)


def a12_1_student():
    pages = []
    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 1, 6)
    d.text((MARGIN, 150), "Factors Affecting Rates", font=font("bold", 32), fill=INK)
    d.text((MARGIN, 198), "T-Level Science  ·  Chemistry  ·  A12.1.1–A12.1.3", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Retrieval")
    y = _para(d, y, "1.1 State the two requirements for a successful collision. Then explain what collision frequency means.")
    y = _lines(d, y + 4, 4)
    y = _heading(d, y + 6, "2. Surface area — two source datasets")
    y = _para(d, y, "The teacher PowerPoint and the student workbook do not use the same times. Keep them separate.")
    y = _table(d, y, [
        ("Source", "Large chips / s", "Small chips / s", "Powder / s"),
        ("Teacher PowerPoint (2.0 g)", "95", "48", "not given"),
        ("Student workbook (2.0 g)", "96", "51", "29"),
    ], [360, 250, 250, 260])
    y = _para(d, y, "2.1 Using the PowerPoint pair only, which experiment is faster and why?")
    y = _lines(d, y + 4, 4)
    pages.append(img)

    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 2, 6)
    y = _heading(d, 140, "2.2 Workbook powder trial")
    y = _para(d, y, "Using 96 s / 51 s / 29 s, explain why powder is fastest for the same 2.0 g mass.")
    y = _lines(d, y + 4, 5)
    y = _para(d, y + 4, "2.3 A student says ‘smaller pieces contain more substance’. Correct the error.")
    y = _lines(d, y + 4, 3)
    y = _heading(d, y + 8, "3. Concentration")
    y = _table(d, y, [
        ("Concentration / mol dm⁻³", "Time to same endpoint / s"),
        ("0.50", "120"),
        ("1.00", "64"),
        ("1.50", "43"),
        ("2.00", "31"),
    ], [520, 600])
    y = _para(d, y, "3.1 Describe the pattern and explain it with collision theory. Temperature is unchanged.")
    y = _lines(d, y + 4, 5)
    pages.append(img)

    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 3, 6)
    y = _heading(d, 140, "3.2 Doubling concentration")
    y = _para(d, y, "Concentration is doubled at constant temperature. What happens to rate? May you assume it exactly doubles?")
    y = _lines(d, y + 4, 4)
    y = _heading(d, y + 8, "4. Pressure")
    y = _para(d, y, "4.1 At constant temperature a gas mixture is compressed. Explain why rate increases.")
    y = _lines(d, y + 4, 5)
    y = _para(d, y + 4, "4.2 Why is it wrong to say higher pressure always means higher temperature?")
    y = _lines(d, y + 4, 3)
    y = _heading(d, y + 8, "5. Graph")
    y = _para(d, y, "Sketch two gas-volume vs time curves for the same limiting amount: one faster, one slower. Label the steeper start and the shared final volume.")
    y = _lines(d, y + 4, 8)
    pages.append(img)

    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 4, 6)
    y = _heading(d, 140, "6. Controls")
    y = _para(d, y, "6.1 For a surface-area investigation, name the independent variable, a suitable dependent variable, and two control variables. Explain one control.")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "7. Unfamiliar")
    y = _para(d, y, "7.1 Trial X uses 8 large pieces. Trial Y uses 80 small pieces of the same mass. Which is faster and why?")
    y = _lines(d, y + 4, 4)
    y = _heading(d, y + 8, "8. Examination-style")
    y = _para(d, y, "(a) Powder vs same mass of large pieces. [3]   (b) Increasing concentration. [3]")
    y = _para(d, y, "(c) Increasing pressure of gaseous reactants. [3]   (d) One surface-area control and why. [2]")
    y = _lines(d, y + 4, 10)
    pages.append(img)

    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 5, 6)
    y = _heading(d, 140, "9. Extended response")
    y = _para(d, y, "Write a single explanation of how surface area, concentration and pressure each increase rate. Use collision frequency and successful collisions. State what does not change if temperature is constant.")
    y = _lines(d, y + 4, 12)
    pages.append(img)

    img, d = _page("Student worksheet", "A12.1 Factors Affecting Rates of Chemical Reactions", 6, 6)
    y = _heading(d, 140, "10. Source note")
    y = _para(d, y, "A12.1 original PDF binaries were not in the upload set. This worksheet uses the markdown extracts of the teacher PowerPoint, student workbook and teacher answers. The 95 s / 48 s and 96 s / 51 s / 29 s times are both printed above and must not be merged.")
    pages.append(img)
    return pages


def a12_1_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.1", 1, 3, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 Sufficient energy and correct spatial orientation. Collision frequency = how often reacting particles collide.")
    y = _para(d, y, "2.1 B (48 s) faster than A (95 s). Same 2.0 g; small chips have greater total surface area; higher collision frequency at the surface.")
    y = _para(d, y, "2.2 Powder 29 s fastest: smallest pieces, greatest exposed surface area, highest collision frequency. Amount of substance unchanged for same mass.")
    y = _para(d, y, "2.3 Same mass → same amount. Smaller pieces expose more surface, they do not contain more substance.")
    y = _para(d, y, "3.1 Time falls 120 → 31 s as concentration rises 0.50 → 2.00 mol dm⁻³. More particles per unit volume; T unchanged so not faster particles; collision frequency rises; successful collisions / time rise.")
    y = _para(d, y, "3.2 Rate expected to increase. Do not assume it exactly doubles without extra evidence.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.1", 2, 3, confidential=True)
    y = _heading(d, 140, "Pressure, graphs, exam")
    y = _para(d, y, "4.1 Same particles, smaller volume, constant T → more particles per unit volume → more frequent collisions → faster rate. Do not award ‘higher average KE’.")
    y = _para(d, y, "4.2 Pressure can rise by reducing volume at constant T.")
    y = _para(d, y, "5 Faster curve steeper initially; same final volume if the same limiting amount reacts.")
    y = _para(d, y, "6.1 IV particle size/surface area. DV time to endpoint or gas volume/time. Controls: mass, other concentration/volume, T, apparatus. Control isolates surface area.")
    y = _para(d, y, "7.1 Y faster — 80 small pieces, same mass, greater surface area.")
    y = _para(d, y, "8 (a)[3] greater surface area (1) higher collision frequency (1) more successful collisions / time (1). (b)[3] more particles / volume (1) collision frequency (1) successful collisions / time (1). (c)[3] smaller volume / closer particles at constant T (1) collision frequency (1) successful collisions / time (1). (d)[2] valid control (1) isolates surface area (1).")
    y = _para(d, y, "9 Award for all three factors via collision frequency; energy/orientation still required; T unchanged ⇒ KE distribution unchanged.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.1", 3, 3, confidential=True)
    y = _heading(d, 140, "Source flag")
    y = _para(d, y, "Do not merge PowerPoint 95 s / 48 s with workbook 96 s / 51 s / 29 s. Conceptual conclusion is the same. Content taken from markdown extracts because original A12.1 PDFs were not supplied.")
    pages.append(img)
    return pages


def a12_2_student():
    pages = []
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 1, 6)
    d.text((MARGIN, 150), "Calculating Rate of Reaction", font=font("bold", 32), fill=INK)
    d.text((MARGIN, 198), "A12.2.1  change in amount ÷ time", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Recall")
    y = _para(d, y, "1.1 Write the average-rate relationship. What must you do if a reactant mass decreases?")
    y = _lines(d, y + 4, 3)
    y = _para(d, y, "1.2 Complete the units: g and s; cm³ and s; mol and s; cm³ and min. How many seconds in 1 min?")
    y = _lines(d, y + 4, 3)
    y = _heading(d, y + 8, "2. Product calculations")
    y = _para(d, y, "2.1 72 cm³ in 24 s.  2.2 45 cm³ in 15 s.  2.3 84 cm³ in 28 s. Show working and units.")
    y = _lines(d, y + 4, 6)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 2, 6)
    y = _heading(d, 140, "3. Reactant used")
    y = _para(d, y, "3.1 8.40 g → 6.90 g in 50 s.  3.2 12.5 g → 10.1 g in 80 s.  3.3 7.20 g → 5.70 g in 50 s.")
    y = _lines(d, y + 4, 7)
    y = _heading(d, y + 8, "4. Time conversion")
    y = _para(d, y, "4.1 Convert 2.5 min to seconds.  4.2 120 cm³ in 2.0 min as cm³ min⁻¹ and as cm³ s⁻¹.")
    y = _lines(d, y + 4, 5)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 3, 6)
    y = _heading(d, 140, "5. Table")
    y = _table(d, y, [
        ("Time / s", "0", "20", "50", "80"),
        ("Gas volume / cm³", "0", "18", "42", "58"),
    ], [280, 200, 200, 200, 240])
    y = _para(d, y, "5.1 Rate from 20–50 s.  5.2 Rate from 50–80 s (2 s.f.).  5.3 Which interval is faster?")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "6. Graph chord")
    y = _para(d, y, "6.1 18 cm³ at 20 s and 42 cm³ at 50 s.  6.2 15 cm³ at 20 s and 39 cm³ at 60 s.")
    y = _lines(d, y + 4, 5)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 4, 6)
    y = _heading(d, 140, "7. Error detective")
    y = _para(d, y, "Correct: (i) 80 cm³ in 20 s = ‘4 cm³’.  (ii) 9.0 → 7.5 g in 30 s, rate = 7.5 ÷ 30.  (iii) 90 cm³ in 1.5 min = 60 cm³ s⁻¹.")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "8. Rate data challenge")
    y = _para(d, y, "A 150 cm³ in 50 s.  B 2.4 g used in 80 s.  C 0.48 mol in 4.0 min (give mol min⁻¹ and mol s⁻¹).")
    y = _lines(d, y + 4, 6)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 5, 6)
    y = _heading(d, 140, "9. Examination-style")
    y = _para(d, y, "(a) 96 cm³ in 32 s. [2]  (b) 6.80 → 5.30 g in 75 s. [3]  (c) 15 cm³ at 20 s, 39 cm³ at 60 s. [3]  (d) Why the unit is essential. [1]")
    y = _lines(d, y + 4, 12)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.2 Calculating Rate of Reaction", 6, 6)
    y = _heading(d, 140, "10. Method")
    y = _para(d, y, "List the five calculation steps used in the lesson.")
    y = _lines(d, y + 4, 6)
    pages.append(img)
    return pages


def a12_2_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.2", 1, 2, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 rate = change in amount ÷ time. Reactant: initial − final (positive). 1.2 g s⁻¹; cm³ s⁻¹; mol s⁻¹; cm³ min⁻¹. 60 s.")
    y = _para(d, y, "2.1–2.3 all 3.0 cm³ s⁻¹.")
    y = _para(d, y, "3.1 1.50 g / 50 s = 0.030 g s⁻¹. 3.2 2.4 g / 80 s = 0.030 g s⁻¹. 3.3 1.50 g / 50 s = 0.030 g s⁻¹.")
    y = _para(d, y, "4.1 150 s. 4.2 60 cm³ min⁻¹; 2.0 min = 120 s → 1.0 cm³ s⁻¹.")
    y = _para(d, y, "5.1 24/30 = 0.80 cm³ s⁻¹. 5.2 16/30 = 0.53 cm³ s⁻¹ (2 s.f.). 5.3 20–50 s faster.")
    y = _para(d, y, "6.1 24/30 = 0.80 cm³ s⁻¹. 6.2 24/40 = 0.60 cm³ s⁻¹.")
    y = _para(d, y, "7 (i) 4 cm³ s⁻¹. (ii) use 1.5 g → 0.050 g s⁻¹. (iii) 60 cm³ min⁻¹ or 1.0 cm³ s⁻¹.")
    y = _para(d, y, "8 A 3.0 cm³ s⁻¹. B 0.030 g s⁻¹. C 0.12 mol min⁻¹; 4.0 min = 240 s → 0.0020 mol s⁻¹.")
    y = _para(d, y, "9 (a) 3.0 cm³ s⁻¹ [2]. (b) 1.50/75 = 0.020 g s⁻¹ [3]. (c) 0.60 cm³ s⁻¹ [3]. (d) unit names quantity and time basis [1].")
    y = _para(d, y, "10 Start/end; change; time interval; divide; compound unit + rounding.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.2", 2, 2, confidential=True)
    y = _heading(d, 140, "Source")
    y = _para(d, y, "Values taken from the A12.2 markdown extracts of the teacher PowerPoint, student workbook and illustrated teacher answers. Original PDF binaries were not supplied.")
    pages.append(img)
    return pages


def a12_3_student():
    pages = []
    img, d = _page("Student worksheet", "A12.3 Enthalpy Changes", 1, 5)
    d.text((MARGIN, 150), "Enthalpy Changes", font=font("bold", 32), fill=INK)
    d.text((MARGIN, 198), "A12.3.1–A12.3.3", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Definitions")
    y = _para(d, y, "1.1 Define H.  1.2 Write ΔH = …  1.3 Why are H and ΔH not interchangeable?")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "2. Classification")
    y = _table(d, y, [
        ("Scenario", "Type", "Energy transfer", "ΔH sign"),
        ("Surroundings warmer", "", "", ""),
        ("Surroundings cooler", "", "", ""),
        ("Products lower H", "", "", ""),
        ("Products higher H", "", "", ""),
    ], [280, 260, 300, 280])
    pages.append(img)
    img, d = _page("Student worksheet", "A12.3 Enthalpy Changes", 2, 5)
    y = _heading(d, 140, "3. Diagrams")
    y = _para(d, y, "3.1 Sketch an exothermic profile. Label reactants, products, Ea and ΔH.")
    y = _lines(d, y + 4, 7)
    y = _para(d, y, "3.2 Sketch an endothermic profile with the same labels.")
    y = _lines(d, y + 4, 7)
    y = _para(d, y, "3.3 Where is Ea measured from? Why not from zero on the y-axis?")
    y = _lines(d, y + 4, 3)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.3 Enthalpy Changes", 3, 5)
    y = _heading(d, 140, "4. Application")
    y = _para(d, y, "4.1 A reaction transfers 45 kJ to the surroundings. Classify it and give the ΔH sign.")
    y = _lines(d, y + 4, 3)
    y = _para(d, y, "4.2 Does an exothermic reaction still need Ea? Explain.")
    y = _lines(d, y + 4, 3)
    y = _para(d, y, "4.3 Draw a catalysed and uncatalysed pathway on one diagram. What stays the same?")
    y = _lines(d, y + 4, 7)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.3 Enthalpy Changes", 4, 5)
    y = _heading(d, 140, "5. Errors")
    y = _para(d, y, "Correct: catalyst lowers ΔH; endothermic destroys energy; ΔH must be positive; Ea measured from y = 0; catalyst lowers product enthalpy.")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "6. Examination-style")
    y = _para(d, y, "(a) Define ΔH [2]. (b) Exothermic diagram [2]. (c) Endothermic change [2]. (d) Catalyst effect [3].")
    y = _lines(d, y + 4, 10)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.3 Enthalpy Changes", 5, 5)
    y = _heading(d, 140, "7. Extended")
    y = _para(d, y, "Explain conservation of energy for an endothermic reaction in terms of system and surroundings.")
    y = _lines(d, y + 4, 8)
    pages.append(img)
    return pages


def a12_3_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.3", 1, 2, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 Energy content at constant pressure. 1.2 H(products) − H(reactants). 1.3 H is a state; ΔH is the change.")
    y = _para(d, y, "2 Warmer: exo, system→surroundings, −. Cooler: endo, surroundings→system, +. Products lower: exo, −. Products higher: endo, +.")
    y = _para(d, y, "3.1 Products below reactants; Ea reactant→peak; ΔH down. 3.2 Products above; ΔH up. 3.3 From reactant level, not y = 0.")
    y = _para(d, y, "4.1 Exothermic, ΔH negative. 4.2 Yes — barrier still exists. 4.3 Lower peak; same reactant/product levels; ΔH unchanged.")
    y = _para(d, y, "5 Catalyst lowers Ea not ΔH. Endothermic transfers energy in. ΔH can be negative. Ea from reactant level. Catalyst does not lower product H.")
    y = _para(d, y, "6 (a)[2] change in enthalpy; ΔH = H(p) − H(r). (b)[2] products lower; energy to surroundings / negative. (c)[2] positive ΔH; energy from surroundings. (d)[3] lower-Ea pathway; levels unchanged; ΔH unchanged.")
    y = _para(d, y, "7 Energy conserved; transferred from surroundings into the system; not destroyed.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.3", 2, 2, confidential=True)
    y = _heading(d, 140, "Source")
    y = _para(d, y, "From A12.3 markdown extracts. Diagram slides had no extractable text; levels follow the teacher ‘expected diagram’ wording.")
    pages.append(img)
    return pages


def a12_4_student():
    pages = []
    img, d = _page("Student worksheet", "A12.4 Catalysts in Industrial Reactions", 1, 5)
    d.text((MARGIN, 150), "Catalysts in Industrial Reactions", font=font("bold", 30), fill=INK)
    d.text((MARGIN, 198), "A12.4.1–A12.4.2", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Recall")
    y = _para(d, y, "1.1 Define a catalyst.  1.2 Define Ea.  1.3 What happens to ΔH when a catalyst is added?")
    y = _lines(d, y + 4, 5)
    y = _heading(d, y + 8, "2. Industrial chain")
    y = _para(d, y, "Write the chain from catalyst to reduced costs. Then state one cost that may still remain.")
    y = _lines(d, y + 4, 5)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.4 Catalysts in Industrial Reactions", 2, 5)
    y = _heading(d, 140, "3. Calculations")
    y = _para(d, y, "3.1 Stage time 8.0 h → 3.0 h. Calculate the time saved and the percentage time saved.")
    y = _lines(d, y + 4, 4)
    y = _para(d, y, "3.2 10 h → 4 h. State the time reduction.")
    y = _lines(d, y + 4, 2)
    y = _para(d, y, "3.3 Process X: 12 → 18 batches/week; £900 → £700 per batch. State both changes.")
    y = _lines(d, y + 4, 3)
    y = _heading(d, y + 8, "4. Profile")
    y = _para(d, y, "Complete: uncatalysed vs catalysed for Ea, reactant H, product H, ΔH, expected rate.")
    y = _lines(d, y + 4, 6)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.4 Catalysts in Industrial Reactions", 3, 5)
    y = _heading(d, 140, "5. Molecular link")
    y = _para(d, y, "At the same T, why does a lower barrier increase rate? What must you not say?")
    y = _lines(d, y + 4, 5)
    y = _heading(d, y + 8, "6. Errors")
    y = _para(d, y, "Correct: catalyst gives particles more KE; catalyst changes ΔH; catalyst is used up; faster means zero cost.")
    y = _lines(d, y + 4, 5)
    y = _heading(d, y + 8, "7. Examination-style")
    y = _para(d, y, "(a) Industrial advantage [3]. (b) How catalyst increases rate via Ea [3]. (c) 10 h → 4 h [1]. (d) Why ΔH unchanged [2].")
    y = _lines(d, y + 4, 8)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.4 Catalysts in Industrial Reactions", 4, 5)
    y = _heading(d, 140, "8. Extended")
    y = _para(d, y, "A plant manager says ‘the catalyst makes the whole factory cheaper’. Write a balanced response using the lesson chain and remaining costs.")
    y = _lines(d, y + 4, 10)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.4 Catalysts in Industrial Reactions", 5, 5)
    y = _heading(d, 140, "Source note")
    y = _para(d, y, "From A12.4 markdown extracts. Original PDF binaries were not supplied.")
    pages.append(img)
    return pages


def a12_4_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.4", 1, 2, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 Increases rate without permanent chemical change; alternative lower-Ea pathway. 1.2 Minimum energy for reaction. 1.3 Unchanged.")
    y = _para(d, y, "2 catalyst → rate → shorter stage → faster turnaround → more cycles / reduced operating cost. Remaining: catalyst purchase, recovery, energy, maintenance, separation.")
    y = _para(d, y, "3.1 5.0 h; (5.0/8.0)×100 = 62.5%. 3.2 6 h. 3.3 +6 batches/week; −£200 per batch.")
    y = _para(d, y, "4 Ea higher/lower; reactant H same; product H same; ΔH same; rate slower/faster.")
    y = _para(d, y, "5 Greater proportion of collisions can react; more successful collisions / time. Not ‘particles given extra KE’.")
    y = _para(d, y, "6 Lowers Ea / alternative pathway; ΔH unchanged; not permanently changed; costs remain.")
    y = _para(d, y, "7 (a)[3] rate (1) turnaround (1) cost/cycles (1). (b)[3] alternative pathway (1) lower Ea (1) more successful collisions / time (1). (c) 6 h. (d)[2] reactant H (1) product H / ΔH (1).")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.4", 2, 2, confidential=True)
    y = _heading(d, 140, "Source")
    y = _para(d, y, "From A12.4 markdown extracts of the teacher PowerPoint and workbooks.")
    pages.append(img)
    return pages


def a12_5_student():
    pages = []
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 1, 6)
    d.text((MARGIN, 150), "Reversible Reactions", font=font("bold", 32), fill=INK)
    d.text((MARGIN, 198), "A12.5.1–A12.5.2", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Dynamic equilibrium")
    y = _para(d, y, "1.1 Define dynamic equilibrium.  1.2 Tick which statements are required: reversible; closed; equal rates; equal concentrations; reactions continue.")
    y = _lines(d, y + 4, 5)
    y = _para(d, y, "1.3 Sealed flask, equal rates. Open vessel, gas escapes. Sealed, forward faster than reverse. Which are at equilibrium?")
    y = _lines(d, y + 4, 4)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 2, 6)
    y = _heading(d, 140, "2. Concentration  A + B ⇌ C + D")
    y = _para(d, y, "State the shift and reason: add A; remove A; add C; remove D.")
    y = _lines(d, y + 4, 6)
    y = _heading(d, y + 8, "3. Temperature")
    y = _para(d, y, "3.1 Forward exothermic: effect of increasing T on position and on product yield.")
    y = _lines(d, y + 4, 4)
    y = _para(d, y, "3.2 Forward endothermic: effect of increasing T.")
    y = _lines(d, y + 4, 3)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 3, 6)
    y = _heading(d, 140, "4. Pressure")
    y = _table(d, y, [
        ("Equilibrium", "Increase pressure"),
        ("N₂(g) + 3H₂(g) ⇌ 2NH₃(g)", ""),
        ("H₂(g) + I₂(g) ⇌ 2HI(g)", ""),
        ("2SO₂(g) + O₂(g) ⇌ 2SO₃(g)", ""),
        ("CaCO₃(s) ⇌ CaO(s) + CO₂(g)", ""),
    ], [700, 420])
    y = _para(d, y, "4.1 Why are solids not counted?")
    y = _lines(d, y + 4, 3)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 4, 6)
    y = _heading(d, 140, "5. Mixed challenges")
    y = _para(d, y, "5.1 2SO₂ + O₂ ⇌ 2SO₃, forward exothermic, increase P.  5.2 Same, increase T.  5.3 A(aq)+B(aq)⇌C(aq), add C.  5.4 Same, remove A.")
    y = _lines(d, y + 4, 8)
    y = _heading(d, y + 8, "6. Examination-style")
    y = _para(d, y, "(a) Define dynamic equilibrium + one condition [3]. (b) Haber equation, increase P [2]. (c) Exothermic forward, increase T, yield [2]. (d) Add reactant [2].")
    y = _lines(d, y + 4, 8)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 5, 6)
    y = _heading(d, 140, "7. Extended")
    y = _para(d, y, "Explain why ‘the reaction stops at equilibrium’ and ‘increasing pressure always shifts right’ are both wrong.")
    y = _lines(d, y + 4, 10)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.5 Reversible Reactions", 6, 6)
    y = _heading(d, 140, "Source note")
    y = _para(d, y, "Teacher PowerPoint is the original PDF. Student and teacher workbooks were markdown extracts. Exam 10.1 mark split is 1+1+1 in the workbook and 2+1 in the PDF slides — same science, different split.")
    pages.append(img)
    return pages


def a12_5_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.5", 1, 2, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 Closed reversible system; equal continuing rates; constant macroscopic amounts. 1.2 Yes, yes, yes, no, yes. 1.3 Yes; no (open); no (rates unequal).")
    y = _para(d, y, "2 Add A right; remove A left; add C left; remove D right.")
    y = _para(d, y, "3.1 Shifts left / endothermic reverse; product yield decreases. 3.2 Shifts right.")
    y = _para(d, y, "4 Right; no shift; right; left. Solids/liquids are not gas moles.")
    y = _para(d, y, "5.1 Right (3→2). 5.2 Left. 5.3 Left. 5.4 Left.")
    y = _para(d, y, "6 (a) continue (1) equal rates (1) closed (1) — PDF alternatively awards equal rates (2) + closed (1). (b) right (1) 2 vs 4 (1). (c) reverse/endothermic (1) yield down (1). (d) uses added reactant (1) products favoured (1).")
    y = _para(d, y, "7 Both directions continue; pressure shift depends on gas moles.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.5", 2, 2, confidential=True)
    y = _heading(d, 140, "Source")
    y = _para(d, y, "Original A12.5 Teacher PowerPoint PDF plus markdown student/teacher workbooks. Mark-split difference on 10.1 is flagged, not silently chosen.")
    pages.append(img)
    return pages


def a12_6_student():
    pages = []
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 1, 6)
    d.text((MARGIN, 150), "The Haber Process", font=font("bold", 32), fill=INK)
    d.text((MARGIN, 198), "A12.6.1  conditions and compromise", font=font("semibold", 18), fill=TEAL_DARK)
    d.text((MARGIN, 240), "Name: ________________________________    Date: ____________________", font=font("regular", 16), fill=INK)
    y = _heading(d, 290, "1. Recall")
    y = _para(d, y, "1.1 Write the Haber equation and the sign of ΔH for the forward reaction.")
    y = _lines(d, y + 4, 3)
    y = _para(d, y, "1.2 State typical T, P and catalyst from the lesson.")
    y = _lines(d, y + 4, 3)
    y = _para(d, y, "1.3 How many gas moles are on each side? Why does increasing pressure raise NH₃ yield?")
    y = _lines(d, y + 4, 4)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 2, 6)
    y = _heading(d, 140, "2. Temperature compromise")
    y = _table(d, y, [
        ("", "Lower T", "Higher T"),
        ("NH₃ equilibrium yield", "", ""),
        ("Rate", "", ""),
        ("Industrial issue", "", ""),
    ], [360, 380, 380])
    y = _para(d, y, "2.1 Why is about 450 °C chosen?")
    y = _lines(d, y + 4, 4)
    y = _heading(d, y + 8, "3. Pressure compromise")
    y = _para(d, y, "3.1 Why not the highest possible pressure?  3.2 Why is about 200 atm described as a compromise?")
    y = _lines(d, y + 4, 5)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 3, 6)
    y = _heading(d, 140, "4. Iron")
    y = _para(d, y, "4.1 What does iron change?  4.2 What does it not change at fixed T and P?")
    y = _lines(d, y + 4, 5)
    y = _heading(d, y + 8, "5. Options")
    y = _para(d, y, "Judge A 300 °C / 200 atm; B 650 °C / 200 atm; C 450 °C / 200 atm + iron.")
    y = _lines(d, y + 4, 6)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 4, 6)
    y = _heading(d, 140, "6. Plant X")
    y = _para(d, y, "Choose from 350 / 450 / 600 °C and 100 / 200 / 400 atm, iron available. Give the indicative industrial choice and one reason against each rejected option.")
    y = _lines(d, y + 4, 10)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 5, 6)
    y = _heading(d, 140, "7. Examination-style")
    y = _para(d, y, "(a) Typical T, P, catalyst [3]. (b) Why not lower T [3]. (c) Why higher P increases yield [2]. (d) Why P is a compromise [3]. (e) Iron [2].")
    y = _lines(d, y + 4, 12)
    pages.append(img)
    img, d = _page("Student worksheet", "A12.6 The Haber Process", 6, 6)
    y = _heading(d, 140, "8. Errors")
    y = _para(d, y, "Correct: choose lowest T for highest yield; choose highest P for highest yield; iron increases equilibrium yield; higher T always improves production.")
    y = _lines(d, y + 4, 8)
    pages.append(img)
    return pages


def a12_6_teacher():
    pages = []
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.6", 1, 2, confidential=True)
    y = _heading(d, 140, "Answers")
    y = _para(d, y, "1.1 N₂(g)+3H₂(g)⇌2NH₃(g); ΔH < 0 / exothermic. 1.2 ~450 °C; ~200 atm; iron. 1.3 4 vs 2; higher P favours fewer gas moles → NH₃.")
    y = _para(d, y, "2 Lower T: higher yield, slower, too slow. Higher T: lower yield, faster, poorer yield. 450 °C: useful rate and useful yield.")
    y = _para(d, y, "3.1 Compression energy, stronger equipment, capital/operating cost. 3.2 High enough for useful yield, economically practical. Exact plant values can vary.")
    y = _para(d, y, "4.1 Alternative pathway, lower Ea, faster both directions, equilibrium reached faster. 4.2 Not position, composition, equilibrium yield, or ΔH.")
    y = _para(d, y, "5 A high yield too slow. B fast, reduced yield. C useful yield and rate.")
    y = _para(d, y, "6 Indicative ~450 °C and ~200 atm + iron. 350 slower; 600 lower yield; 400 atm costlier; 100 atm lower yield.")
    y = _para(d, y, "7 (a) 450 °C, 200 atm, iron [3]. (b) higher yield (1) lower rate (1) too slow/less economic (1). (c) 2 vs 4 (1) shift to NH₃ (1). (d) yield (1) cost/engineering (1) balance (1). (e) lower Ea / faster (1) position unchanged (1).")
    y = _para(d, y, "8 Lowest T too slow; highest P too costly; iron does not raise equilibrium yield; higher T lowers NH₃ yield.")
    pages.append(img)
    img, d = _page("Teacher marking scheme", "PRIVATE  ·  A12.6", 2, 2, confidential=True)
    y = _heading(d, 140, "Source")
    y = _para(d, y, "Original A12.6 student and teacher workbook PDFs, plus the markdown teacher PowerPoint extract. 650 °C and Plant X 600 °C are different worked scenarios, not a conflict.")
    pages.append(img)
    return pages


def main():
    jobs = [
        ("a12-1-factors-affecting-rates", a12_1_student, a12_1_teacher),
        ("a12-2-calculating-rate", a12_2_student, a12_2_teacher),
        ("a12-3-enthalpy-changes", a12_3_student, a12_3_teacher),
        ("a12-4-industrial-catalysts", a12_4_student, a12_4_teacher),
        ("a12-5-reversible-reactions", a12_5_student, a12_5_teacher),
        ("a12-6-haber-process", a12_6_student, a12_6_teacher),
    ]
    for slug, s, t in jobs:
        _pack(slug, slug, slug, s, t)


if __name__ == "__main__":
    main()
