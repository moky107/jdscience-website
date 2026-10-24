"""A12 scientific scenes. Called from draw.render_slide."""

from __future__ import annotations

from typing import Iterable

from gcse_foundations.diagrams import bullet_card, card, recap_cards, text_block
from jdscience_video.theme import GOLD, GREEN, MUTED, TEAL, TEAL_BAR, WHITE, W, font, heading
from tlevel_chem.science import (
    ORANGE,
    chips_scene,
    concentration_boxes,
    data_table,
    energy_profile,
    haber_panel,
    mole_balance,
    particle_chamber,
    pressure_boxes,
    volume_time,
)


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def render_a12(lesson: dict, slide: dict, revealed: Iterable[str], t: float, img, d):
    kind = slide.get("kind")
    vis = lambda name: _vis(revealed, name)

    if kind == "aims12":
        heading(d, "Learning outcomes", f"{lesson['spec']}  {lesson['title']}")
        for i, text in enumerate(slide["aims"]):
            y = 250 + i * 140
            bullet_card(d, (88, y, W - 88, y + 120), f"Outcome {i + 1}", text, show=vis(f"a{i + 1}"))
        return img

    if kind == "myths12":
        heading(d, "Common misconceptions", "Keep the science precise")
        for i, text in enumerate(slide["myths"]):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=GOLD)
            d.text((130, y + 42), text, font=font("semibold", 26), fill=WHITE)
        return img

    if kind == "exam12":
        heading(d, "Examination-style question", lesson["title"])
        items = slide["items"]
        answers = slide["answers"]
        row_h = min(160, 620 // max(1, len(items)))
        for i, (key, prompt) in enumerate(items):
            y = 240 + i * row_h
            card(d, (88, y, W - 88, y + row_h - 12), accent=TEAL)
            d.text((128, y + 16), prompt, font=font("semibold", 22), fill=WHITE)
            if vis(key):
                d.text((128, y + 70), answers[key], font=font("regular", 20), fill=GREEN)
        return img

    if kind == "recap12":
        heading(d, "Plenary: complete the model", lesson["subtitle"])
        recap_cards(d, (88, 250, W - 88, 860), slide["cards"], set(revealed), ["r1", "r2", "r3"])
        return img

    if kind == "retrieve":
        heading(d, "Retrieve collision theory", "Energy and orientation still apply")
        particle_chamber(d, (88, 250, 1000, 900), t, "high", True, "Successful collisions are still selective")
        card(d, (1040, 250, 1830, 900), accent=TEAL)
        text_block(d, (1080, 320), "Sufficient collision energy. Correct spatial orientation. Rate depends on how often those successful collisions occur.", font("semibold", 28), WHITE, 700)
        return img

    if kind == "common":
        heading(d, "The common idea: collision frequency", "More meetings, more opportunities")
        particle_chamber(d, (88, 250, 1830, 900), t, "high", True, "More frequent collisions → more chances to succeed")
        return img

    if kind == "sa_def":
        heading(d, "A12.1.1  Surface area", "Same mass, more exposed surface")
        chips_scene(d, (88, 250, 900, 900), "large", "Large chips")
        chips_scene(d, (940, 250, 1830, 900), "powder", "Powder — same mass")
        return img

    if kind == "chips":
        heading(d, "Watch the particle models", "Same 2.0 g of solid")
        chips_scene(d, (88, 250, 680, 900), "large", "Large chips")
        chips_scene(d, (704, 250, 1296, 900), "small", "Small chips")
        chips_scene(d, (1320, 250, 1830, 900), "powder", "Powder")
        return img

    if kind == "sa_ppt":
        heading(d, "Teacher PowerPoint dataset", "Do not merge with the workbook times")
        data_table(d, (88, 250, 1830, 900), [
            ["Experiment", "Mass / g", "Form", "Time to endpoint / s"],
            ["A", "2.0", "Large chips", "95"],
            ["B", "2.0", "Small chips", "48"],
        ], "Two-trial set from the teacher slides")
        return img

    if kind == "sa_book":
        heading(d, "Student workbook dataset", "A third trial; different times")
        data_table(d, (88, 250, 1830, 900), [
            ["Trial", "Mass / g", "Form", "Time / s", "Relative rate"],
            ["A", "2.0", "Large chips", "96", "Slowest"],
            ["B", "2.0", "Small chips", "51", "Faster"],
            ["C", "2.0", "Powder", "29", "Fastest"],
        ], "Keep this table separate from 95 s / 48 s")
        return img

    if kind == "conc":
        heading(d, "A12.1.2  Concentration", "More particles per unit volume, same T")
        concentration_boxes(d, (88, 250, 920, 900), 0.5, "Lower concentration")
        concentration_boxes(d, (960, 250, 1830, 900), 2.0, "Higher concentration")
        return img

    if kind == "conc_data":
        heading(d, "Shared concentration dataset", "Same endpoint, shorter time")
        data_table(d, (88, 250, 1830, 900), [
            ["Concentration / mol dm⁻³", "Time to same endpoint / s"],
            ["0.50", "120"],
            ["1.00", "64"],
            ["1.50", "43"],
            ["2.00", "31"],
        ], "Do not assume rate exactly doubles when concentration doubles")
        return img

    if kind == "press":
        heading(d, "A12.1.3  Pressure of gases", "Same T, smaller volume")
        pressure_boxes(d, (88, 250, 920, 900), False)
        pressure_boxes(d, (960, 250, 1830, 900), True)
        return img

    if kind == "vt_graph":
        heading(d, "Gas volume versus time", "Steeper start; same final amount if limiting reactant is the same")
        volume_time(d, (88, 250, 1830, 900), series=[
            ("faster", TEAL_BAR, [(0, 0), (10, 28), (25, 52), (50, 70), (80, 78)]),
            ("slower", ORANGE, [(0, 0), (10, 12), (25, 28), (50, 50), (80, 70)]),
        ])
        return img

    if kind == "controls":
        heading(d, "Investigations: change one factor", "Control the rest")
        cards = [
            ("Surface area", "IV: particle size. Control mass, other concentration, T, apparatus."),
            ("Concentration", "IV: concentration. Control T, volumes, solid surface area."),
            ("Pressure", "Model at constant T. Do not confuse with heating."),
        ]
        for i, (title, body) in enumerate(cards):
            x = 88 + i * 590
            card(d, (x, 260, x + 560, 880), accent=TEAL)
            d.text((x + 30, 300), title, font=font("bold", 28), fill=WHITE)
            text_block(d, (x + 30, 380), body, font("regular", 24), MUTED, 500)
        return img

    if kind == "rate_def":
        heading(d, "Average rate", "Change in amount ÷ time taken")
        card(d, (88, 260, 1830, 880), accent=TEAL)
        d.text((140, 360), "rate = change in amount  ÷  time", font=font("bold", 42), fill=WHITE)
        text_block(d, (140, 500), "Amount used or product formed. For a decreasing reactant, use initial minus final. Keep the units you are given.", font("regular", 28), MUTED, 1600)
        return img

    if kind == "units":
        heading(d, "Compound units", "Name the quantity and the time basis")
        data_table(d, (88, 250, 1830, 900), [
            ["Amount", "Time", "Rate unit"],
            ["g", "s", "g s⁻¹"],
            ["cm³", "s", "cm³ s⁻¹"],
            ["mol", "s", "mol s⁻¹"],
            ["cm³", "min", "cm³ min⁻¹"],
        ], "1 min = 60 s")
        return img

    if kind == "calc_product":
        heading(d, "Product formed", "72 cm³ in 24 s")
        card(d, (88, 260, 1830, 880), accent=TEAL)
        d.text((140, 340), "72 ÷ 24 = 3.0 cm³ s⁻¹", font=font("bold", 48), fill=TEAL_BAR)
        text_block(d, (140, 460), "The same method: 45 cm³ in 15 s → 3.0 cm³ s⁻¹.  84 cm³ in 28 s → 3.0 cm³ s⁻¹.", font("semibold", 28), WHITE, 1600)
        return img

    if kind == "calc_reactant":
        heading(d, "Reactant used", "Use the change, not the leftover mass")
        data_table(d, (88, 250, 1830, 900), [
            ["Initial / g", "Final / g", "Time / s", "Change / g", "Rate"],
            ["8.40", "6.90", "50", "1.50", "0.030 g s⁻¹"],
            ["12.5", "10.1", "80", "2.4", "0.030 g s⁻¹"],
        ], "Amount used = initial − final")
        return img

    if kind == "calc_time":
        heading(d, "Convert the time first", "2.5 min = 150 s")
        card(d, (88, 260, 900, 880), accent=GOLD)
        d.text((130, 340), "120 cm³ in 2.0 min", font=font("bold", 32), fill=WHITE)
        d.text((130, 440), "60 cm³ min⁻¹", font=font("bold", 40), fill=GOLD)
        card(d, (940, 260, 1830, 880), accent=TEAL)
        d.text((980, 340), "2.0 min = 120 s", font=font("bold", 32), fill=WHITE)
        d.text((980, 440), "1.0 cm³ s⁻¹", font=font("bold", 40), fill=TEAL_BAR)
        return img

    if kind == "calc_table":
        heading(d, "Table intervals", "Compare 20–50 s with 50–80 s")
        data_table(d, (88, 240, 1830, 560), [
            ["Time / s", "0", "20", "50", "80"],
            ["Gas volume / cm³", "0", "18", "42", "58"],
        ], "")
        data_table(d, (88, 590, 1830, 900), [
            ["Interval", "Δvolume", "Δtime", "Rate"],
            ["20–50 s", "24 cm³", "30 s", "0.80 cm³ s⁻¹"],
            ["50–80 s", "16 cm³", "30 s", "0.53 cm³ s⁻¹"],
        ], "First interval is faster")
        return img

    if kind == "calc_graph":
        heading(d, "Chord gradient on a product–time graph", "Vertical change ÷ horizontal change")
        volume_time(d, (88, 250, 1830, 900), series=[
            ("product", TEAL_BAR, [(0, 0), (20, 18), (50, 42), (80, 58)]),
        ], title="18 cm³ at 20 s → 42 cm³ at 50 s   =   24 / 30   =   0.80 cm³ s⁻¹")
        return img

    if kind == "calc_errors":
        heading(d, "Error detective", "Value, change, and time unit")
        rows = [
            "80 cm³ in 20 s is 4 cm³ s⁻¹ — keep the time in the unit.",
            "9.0 → 7.5 g in 30 s uses the 1.5 g change: 0.050 g s⁻¹.",
            "90 cm³ in 1.5 min is 60 cm³ min⁻¹ or 1.0 cm³ s⁻¹.",
        ]
        for i, text in enumerate(rows):
            y = 260 + i * 200
            card(d, (88, y, W - 88, y + 180), accent=ORANGE)
            d.text((130, y + 60), text, font=font("semibold", 28), fill=WHITE)
        return img

    if kind == "hdef":
        heading(d, "H and ΔH", "State quantity versus the change")
        card(d, (88, 260, 900, 880), accent=TEAL)
        d.text((130, 320), "Enthalpy, H", font=font("bold", 34), fill=WHITE)
        text_block(d, (130, 400), "Energy content of a system at constant pressure. Compare reactant and product levels.", font("regular", 26), MUTED, 720)
        card(d, (940, 260, 1830, 880), accent=GOLD)
        d.text((980, 320), "ΔH = H(products) − H(reactants)", font=font("bold", 30), fill=WHITE)
        text_block(d, (980, 420), "Positive or negative. Commonly kJ mol⁻¹. Not just ‘the energy of the products’.", font("regular", 26), MUTED, 800)
        return img

    if kind == "profile_exo":
        heading(d, "Exothermic profile", "Products lower · ΔH negative · Ea from the reactant level")
        energy_profile(d, (88, 240, 1830, 900), catalysed=False, direction="exo")
        return img

    if kind == "profile_endo":
        heading(d, "Endothermic profile", "Products higher · ΔH positive · Ea still required")
        energy_profile(d, (88, 240, 1830, 900), catalysed=False, direction="endo")
        return img

    if kind == "profile_cat":
        heading(d, "Catalysed pathway", "Lower peak · same reactant and product levels · ΔH unchanged")
        energy_profile(d, (88, 240, 1830, 900), catalysed=True, direction="exo")
        return img

    if kind == "fortyfive":
        heading(d, "Classify the transfer", "45 kJ to the surroundings")
        card(d, (88, 280, 1830, 860), accent=ORANGE)
        d.text((140, 380), "Energy leaves the system  →  exothermic  →  ΔH negative", font=font("bold", 36), fill=WHITE)
        return img

    if kind == "ind_def":
        heading(d, "Industrial catalyst", "Faster, not permanently changed, lower Ea")
        card(d, (88, 260, 1830, 860), accent=TEAL)
        text_block(d, (140, 340), "Increases rate without being permanently chemically changed overall. Alternative pathway with lower activation energy. ΔH is unchanged because reactant and product enthalpy levels do not move.", font("semibold", 30), WHITE, 1600)
        return img

    if kind == "ind_chain":
        heading(d, "A12.4.1  Rate to turnaround to cost", "Do not claim every cost falls")
        from tlevel_chem.science import causal_pills
        causal_pills(d, (88, 280, 1830, 860), [
            ("Catalyst", "Lower Ea pathway", True),
            ("Faster rate", "Stage finishes sooner", True),
            ("Turnaround", "More cycles possible", True),
            ("Cost", "Operating cost can fall", True),
        ])
        return img

    if kind == "ind_hours":
        heading(d, "Reaction-stage times", "8.0 h → 3.0 h")
        card(d, (88, 260, 900, 860), accent=ORANGE)
        d.text((160, 360), "Without catalyst", font=font("bold", 30), fill=WHITE)
        d.text((160, 460), "8.0 hours", font=font("bold", 52), fill=GOLD)
        card(d, (940, 260, 1830, 860), accent=TEAL)
        d.text((1000, 340), "With catalyst", font=font("bold", 30), fill=WHITE)
        d.text((1000, 430), "3.0 hours", font=font("bold", 52), fill=TEAL_BAR)
        d.text((1000, 540), "Saved 5.0 h  ·  62.5%", font=font("semibold", 28), fill=WHITE)
        return img

    if kind == "ind_x":
        heading(d, "Process X", "Weekly batches and reaction-stage cost")
        data_table(d, (88, 250, 1830, 900), [
            ["", "Without catalyst", "With catalyst", "Change"],
            ["Batches / week", "12", "18", "+6"],
            ["Cost / batch", "£900", "£700", "−£200"],
        ], "More cycles and a lower reaction-stage cost per batch")
        return img

    if kind == "reversible":
        heading(d, "Reversible is not automatically equilibrium", "Both directions, specified conditions")
        mole_balance(d, (88, 250, 1830, 900), "reactants", "products", "⇌ means forward and reverse both occur. Equilibrium also needs a closed system and equal rates.")
        return img

    if kind == "dynamic":
        heading(d, "Dynamic equilibrium", "Closed · reversible · equal continuing rates")
        data_table(d, (88, 250, 1830, 900), [
            ["Statement", "Required?"],
            ["Reaction is reversible", "Yes"],
            ["System is closed", "Yes"],
            ["Forward and reverse rates equal", "Yes"],
            ["Reactions continue", "Yes"],
            ["Concentrations equal", "No"],
        ], "Constant composition is not equal concentrations")
        return img

    if kind == "lechat":
        heading(d, "Le Chatelier’s principle", "The system opposes the change")
        card(d, (88, 260, 1830, 860), accent=TEAL)
        text_block(d, (140, 340), "Identify the change. Decide the opposing response. Predict left or right. State which side is favoured. Justify with concentration, heat direction, or gas moles.", font("semibold", 30), WHITE, 1600)
        return img

    if kind == "eq_conc":
        heading(d, "Concentration shifts", "A + B ⇌ C + D")
        data_table(d, (88, 250, 1830, 900), [
            ["Change", "Shift", "Why"],
            ["Add A", "Right", "Uses some added A"],
            ["Remove A", "Left", "Forms more A"],
            ["Add C", "Left", "Uses some added C"],
            ["Remove D", "Right", "Forms more D"],
        ], "The equilibrium opposes the imposed concentration change")
        return img

    if kind == "eq_temp":
        heading(d, "Temperature: identify the heat direction first", "Increasing T does not always shift left")
        card(d, (88, 260, 900, 860), accent=ORANGE)
        d.text((130, 320), "Exothermic forward", font=font("bold", 30), fill=WHITE)
        text_block(d, (130, 400), "Heat on the product side. Increase T → left. Decrease T → right. Product yield falls if T rises.", font("regular", 26), MUTED, 720)
        card(d, (940, 260, 1830, 860), accent=TEAL)
        d.text((980, 320), "Endothermic forward", font=font("bold", 30), fill=WHITE)
        text_block(d, (980, 400), "Heat on the reactant side. Increase T → right. Decrease T → left.", font("regular", 26), MUTED, 800)
        return img

    if kind == "eq_press":
        heading(d, "Pressure and gas moles", "Solids and liquids are not counted")
        data_table(d, (88, 250, 1830, 900), [
            ["Equilibrium", "Left", "Right", "Increase P"],
            ["N₂ + 3H₂ ⇌ 2NH₃", "4", "2", "Right"],
            ["H₂ + I₂ ⇌ 2HI", "2", "2", "No shift"],
            ["2SO₂ + O₂ ⇌ 2SO₃", "3", "2", "Right"],
            ["CaCO₃(s) ⇌ CaO(s) + CO₂", "0", "1", "Left"],
        ], "Higher pressure favours fewer moles of gas")
        return img

    if kind == "eq_examples":
        heading(d, "Worked shift challenges", "Pressure, temperature, concentration")
        mole_balance(d, (88, 250, 1830, 900), "N₂(g) + 3H₂(g)", "2NH₃(g)", "4 gas moles ⇌ 2 gas moles. Increase P → right. If forward is exothermic, increase T → left.")
        return img

    if kind == "haber_eq":
        heading(d, "The Haber equation", "Forward reaction is exothermic")
        mole_balance(d, (88, 250, 1830, 900), "N₂(g) + 3H₂(g)", "2NH₃(g)", "ΔH < 0. Aim: useful rate and useful yield at acceptable cost. Unreacted N₂ and H₂ can be recycled.")
        return img

    if kind == "haber_cond":
        heading(d, "Typical industrial conditions", "A compromise, not a single optimum")
        haber_panel(d, (88, 280, 1830, 860))
        return img

    if kind == "haber_moles":
        heading(d, "Why pressure raises ammonia yield", "4 gas moles versus 2")
        mole_balance(d, (88, 250, 1830, 900), "4 moles of gas", "2 moles of gas", "Increasing pressure favours fewer gas moles, so the equilibrium shifts toward NH₃.")
        return img

    if kind == "haber_temp":
        heading(d, "Temperature compromise", "~450 °C balances yield with rate")
        data_table(d, (88, 250, 1830, 900), [
            ["", "Lower T", "Higher T"],
            ["NH₃ equilibrium yield", "Higher", "Lower"],
            ["Rate", "Slower", "Faster"],
            ["Industrial issue", "Too slow", "Poorer yield"],
        ], "Forward reaction is exothermic")
        return img

    if kind == "haber_press":
        heading(d, "Pressure compromise", "~200 atm is high but practical")
        card(d, (88, 260, 1830, 860), accent=GOLD)
        text_block(d, (140, 340), "Higher pressure increases NH₃ equilibrium yield. Extremely high pressure needs more compression energy, stronger equipment and higher capital and operating costs. Plants can vary; the point is the compromise.", font("semibold", 30), WHITE, 1600)
        return img

    if kind == "haber_iron":
        heading(d, "Iron catalyst", "Faster both ways; position unchanged")
        energy_profile(d, (88, 240, 1830, 900), catalysed=True, direction="exo")
        return img

    if kind == "haber_options":
        heading(d, "Compare the options", "Yield versus rate")
        data_table(d, (88, 250, 1830, 900), [
            ["Option", "T", "P", "Verdict in the lesson"],
            ["A", "300 °C", "200 atm", "High yield; too slow"],
            ["B", "650 °C", "200 atm", "Fast; reduced NH₃ yield"],
            ["C", "450 °C", "200 atm + iron", "Useful yield and useful rate"],
        ], "")
        return img

    if kind == "haber_plant":
        heading(d, "Plant X", "Indicative choice: ~450 °C, ~200 atm, iron")
        data_table(d, (88, 250, 1830, 900), [
            ["Choice", "Yield", "Rate / cost"],
            ["350 °C", "Higher", "Slower"],
            ["600 °C", "Lower", "Faster"],
            ["400 atm", "Higher", "More compression cost"],
            ["100 atm", "Lower than 200 atm", "Lower cost"],
        ], "350 / 450 / 600 °C and 100 / 200 / 400 atm were offered")
        return img

    return None
