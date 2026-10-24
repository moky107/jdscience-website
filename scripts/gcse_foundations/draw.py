"""Render one foundations slide at time t."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from gcse_foundations.diagrams import (
    GAS,
    GREEN,
    LIQUID,
    ORANGE,
    PINK,
    PURPLE,
    SOLID,
    beaker,
    bullet_card,
    card,
    chromatogram,
    evaporating_basin,
    exam_panel,
    flow_steps,
    fractionating_column,
    funnel_filter,
    heating_curve,
    particle_box,
    perfume_room,
    quiz_list,
    recap_cards,
    simple_distillation,
    syringe,
    text_block,
    water_molecule,
)
from gcse_foundations.lessons import LESSONS
from jdscience_video.theme import (
    GOLD,
    INK,
    LINE,
    MUTED,
    NAVY_ROW,
    STRAPLINE,
    TEAL,
    TEAL_BAR,
    W,
    WHITE,
    chem,
    draw_chrome,
    font,
    heading,
    new_canvas,
)


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _base(lesson: dict, page: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    return img, draw_chrome(img, page, lesson["pages"], lesson["title"])


def _aims_for(slug: str) -> list[tuple[str, str]]:
    return {
        "states-of-matter": [
            ("a1", "Describe particle arrangement and movement"),
            ("a2", "Explain properties using the particle model"),
            ("a3", "Answer GCSE examination questions"),
        ],
        "changes-of-state": [
            ("a1", "Explain melting, freezing, boiling, evaporation and condensation"),
            ("a2", "Link energy changes to particle behaviour"),
        ],
        "pure-substances-and-mixtures": [
            ("a1", "Distinguish pure substances from mixtures"),
            ("a2", "Compare melting and boiling behaviour"),
            ("a3", "Use melting-point data as evidence of purity"),
        ],
        "separation-techniques": [
            ("a1", "Choose filtration, crystallisation or distillation"),
            ("a2", "Explain when each method is used"),
            ("a3", "Apply the methods to practical questions"),
        ],
        "chromatography": [
            ("a1", "Describe paper chromatography"),
            ("a2", "Explain why dyes separate"),
            ("a3", "Calculate Rf values"),
        ],
        "potable-water": [
            ("a1", "Define potable water"),
            ("a2", "Describe freshwater and sewage treatment"),
            ("a3", "Explain why desalination is expensive"),
        ],
    }[slug]


def intro(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    particle_box(d, (1180, 250, 1830, 820), "liquid", t, "Particles")
    d.text((88, 150), "GCSE Chemistry", font=font("medium", 24), fill=TEAL_BAR)
    d.text((88, 200), lesson["title"], font=font("bold", 52), fill=WHITE)
    d.text((88, 280), lesson["subtitle"], font=font("regular", 26), fill=MUTED)
    d.text((88, 328), STRAPLINE, font=font("regular", 20), fill=MUTED)
    return img


def aims(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "In this lesson", "What you should be able to do by the end")
    items = _aims_for(lesson["slug"])
    y = 250
    for key, label in items:
        box = (88, y, W - 88, y + 110)
        if _vis(revealed, key):
            card(d, box, accent=TEAL)
            d.text((120, y + 38), label, font=font("semibold", 28), fill=WHITE)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 128
    return img


def outro(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    d.text((W / 2, 280), "Keep learning with JD Science", font=font("bold", 48), fill=WHITE, anchor="mm")
    d.text((W / 2, 360), "Subscribe  ·  jdscience.co.uk", font=font("semibold", 34), fill=TEAL_BAR, anchor="mm")
    d.text((W / 2, 430), "GCSE Chemistry explanations, worked examples and examination practice", font=font("regular", 22), fill=MUTED, anchor="mm")
    recap_cards(
        d,
        (88, 520, W - 88, 860),
        [
            ("Watch", "Replay the diagrams and pause on the exam answers"),
            ("Practise", "Write the model answers in your own words"),
            ("Visit", "jdscience.co.uk for more lessons"),
        ],
        {"*"},
        ["w", "p", "v"],
    )
    return img


def hook(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "A simple question", "Same substance — three very different behaviours")
    particle_box(d, (88, 260, 640, 820), "solid", t, "Ice")
    particle_box(d, (680, 260, 1232, 820), "liquid", t, "Water")
    particle_box(d, (1272, 260, 1832, 820), "gas", t, "Steam")
    return img


def model(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "The particle model", "Small spheres whose arrangement and energy decide the state")
    particle_box(d, (88, 260, 900, 820), "liquid", t, "Particles")
    bullet_card(d, (940, 260, 1832, 420), "Everything is made of particles", "In the particle model they are drawn as small spheres.", TEAL)
    bullet_card(d, (940, 450, 1832, 620), "Arrangement and energy", "These decide whether a substance is a solid, liquid or gas.", GOLD)
    bullet_card(d, (940, 650, 1832, 820), "Properties follow", "Shape, volume and compressibility come from how particles move.", TEAL)
    return img


def state_focus(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    state = slide["state"]
    titles = {"solid": "Solids", "liquid": "Liquids", "gas": "Gases"}
    bodies = {
        "solid": "Packed closely, usually in a regular arrangement. Strong forces hold particles in fixed positions. They vibrate, but do not change place.",
        "liquid": "Particles stay close together but are arranged irregularly and can move past one another.",
        "gas": "Particles are far apart. Attractive forces are negligible. They move rapidly and randomly in all directions.",
    }
    heading(d, titles[state], "Arrangement and movement")
    particle_box(d, (88, 250, 980, 860), state, t, titles[state], highlight=True)
    text_block(d, (1040, 280), bodies[state], font("regular", 26), WHITE, 760, line_gap=10)
    return img


def state_props(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    state = slide["state"]
    heading(d, f"{state.title()} properties", "Explained with the particle model")
    particle_box(d, (88, 250, 820, 860), state, t, state.title())
    if state == "solid":
        rows = [("Fixed shape", "Particles cannot move from place to place"), ("Fixed volume", "Little space between particles"), ("Hard to compress", "Already packed closely together")]
    elif state == "liquid":
        rows = [("No fixed shape", "Particles move past one another and flow"), ("Fixed volume", "Particles remain close together"), ("Hard to compress", "Very little empty space")]
    else:
        rows = [("No fixed shape", "Particles move freely"), ("No fixed volume", "A gas fills the whole container"), ("Easy to compress", "Large spaces between particles")]
    y = 250
    for title, body in rows:
        bullet_card(d, (860, y, 1832, y + 180), title, body, TEAL)
        y += 200
    return img


def ice_slide(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Ice keeps its shape", "Water molecules held in a solid structure")
    particle_box(d, (88, 250, 980, 860), "solid", t, "Ice cube")
    bullet_card(d, (1020, 280, 1832, 500), "On a plate", "An ice cube keeps its shape because the molecules stay in fixed positions.", TEAL)
    water_molecule(d, 1420, 680, 2.2)
    d.text((1420, 780), chem("H2O"), font=font("bold", 28), fill=WHITE, anchor="mm")
    return img


def pour_slide(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Liquids take the container’s shape", "Volume stays approximately the same")
    beaker(d, 220, 320, 180, 280, 0.42, label="glass")
    beaker(d, 620, 280, 140, 340, 0.55, label="bottle")
    bullet_card(d, (980, 280, 1832, 500), "Flow", "Particles can move past one another, so the liquid flows.", TEAL)
    bullet_card(d, (980, 540, 1832, 760), "Same volume", "The amount of water does not change when it is poured.", GOLD)
    return img


def perfume_slide(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Gases spread out", "This spreading is called diffusion")
    perfume_room(d, (88, 250, 1832, 860), t)
    return img


def syringe_slide(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Gases are easy to compress", "Large spaces let particles move closer together")
    syringe(d, (88, 250, 1832, 860), compress=(0.15 + 0.55 * (0.5 + 0.5 * __import__("math").sin(t))))
    return img


def compare_h2o(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Ice, water and steam", "Same chemical identity: H₂O")
    particle_box(d, (88, 250, 680, 720), "solid", t, "Ice")
    particle_box(d, (720, 250, 1312, 720), "liquid", t, "Liquid water")
    particle_box(d, (1352, 250, 1832, 720), "gas", t, "Steam")
    d.text((W / 2, 800), "Particles do not become larger or smaller when the state changes.", font=font("semibold", 24), fill=GOLD, anchor="mm")
    return img


def exam_point(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "GCSE examination point", "Changing state does not change the particles themselves")
    card(d, (88, 260, 1832, 820), accent=GOLD)
    text_block(
        d,
        (140, 320),
        "When a substance changes state, its particles do not become larger or smaller. Their arrangement, movement and separation change. Ice, liquid water and steam are all H₂O.",
        font("regular", 32),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def states_quiz(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Check your understanding", "Three containers — ice, liquid water, water vapour")
    particle_box(d, (88, 250, 620, 500), "solid", t, "Ice")
    particle_box(d, (660, 250, 1192, 500), "liquid", t, "Water")
    particle_box(d, (1232, 250, 1832, 500), "gas", t, "Vapour")
    quiz_list(
        d,
        (88, 530, 1832, 900),
        [
            ("q1", "a1", "Vibrating about fixed positions?", "Ice"),
            ("q2", "a2", "Move past one another, still close?", "Liquid water"),
            ("q3", "a3", "Widely separated, rapid and random?", "Water vapour"),
        ],
        set(revealed),
    )
    return img


def states_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Examination question", "Use the particle model — do not only state the fact")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "Explain why gases can be compressed easily, whereas solids cannot.",
        "3 marks",
        "In a gas, particles are far apart, with large spaces between them. Pressure pushes them closer and the volume falls. In a solid, particles are already packed closely, so the volume cannot be reduced significantly."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def states_recap(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Three key ideas", "Keep these for the exam")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Solids", "Fixed shape and volume. Particles vibrate about fixed positions."),
            ("Liquids", "Fixed volume, no fixed shape. Particles move past one another."),
            ("Gases", "No fixed shape or volume. Particles move freely and are widely separated."),
        ],
        set(revealed),
        ["r1", "r2", "r3"],
    )
    return img


def saucepan(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "From freezer to saucepan", "Ice absorbs energy until it reaches 0 °C")
    particle_box(d, (88, 250, 900, 820), "solid", t, "Ice")
    bullet_card(d, (940, 260, 1832, 430), "Energy in", "The ice absorbs energy from its surroundings.", TEAL)
    bullet_card(d, (940, 460, 1832, 630), "Melting point", "For pure water at normal atmospheric pressure: 0 °C.", GOLD)
    bullet_card(d, (940, 660, 1832, 830), "Then it melts", "The solid begins to change into liquid water.", TEAL)
    return img


def change_slide(lesson, slide, revealed, t, page):
    img, d = _base(lesson, page)
    change = slide["change"]
    info = {
        "melting": ("Melting", "solid", "liquid", "Particles overcome enough attractive forces to move past one another. Temperature of a pure substance stays constant while this happens."),
        "boiling": ("Boiling", "liquid", "gas", "Bubbles of vapour form throughout the liquid at the boiling point. Pure water at normal atmospheric pressure: 100 °C."),
        "condensation": ("Condensation", "gas", "liquid", "Particles lose energy, move more slowly and are pulled closer together. Droplets form on a cold glass."),
        "freezing": ("Freezing", "liquid", "solid", "At 0 °C, attractive forces hold particles in fixed positions. They still vibrate, but no longer move freely."),
    }[change]
    title, left, right, body = info
    heading(d, title, "A physical change of state")
    particle_box(d, (88, 250, 820, 700), left, t, left.title())
    particle_box(d, (1100, 250, 1832, 700), right, t, right.title())
    d.text((960, 470), "→", font=font("bold", 64), fill=GOLD, anchor="mm")
    text_block(d, (88, 740), body, font("regular", 24), WHITE, 1740)
    return img


def energy_note(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Why the temperature stays constant", "Energy is used to overcome attractions, not to raise kinetic energy")
    card(d, (88, 260, 1832, 820), accent=GOLD)
    text_block(
        d,
        (140, 330),
        "During melting of a pure substance at constant pressure, the supplied energy overcomes forces of attraction between particles. Average kinetic energy does not increase, so the temperature remains constant until the solid has all melted. The same idea applies during boiling.",
        font("regular", 30),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def evap_vs_boil(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Evaporation or boiling?", "Both turn liquid into gas — but not in the same way")
    bullet_card(d, (88, 260, 900, 860), "Evaporation", "Occurs at the surface. Can happen below the boiling point. Wet clothes dry at 15 °C because some surface particles have enough energy to escape.", TEAL)
    bullet_card(d, (960, 260, 1832, 860), "Boiling", "Occurs throughout the liquid. Happens at the boiling point. Bubbles of vapour form inside the liquid and rise to the surface.", GOLD)
    return img


def sublime(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Sublimation and deposition", "Solid ⇌ gas with no liquid stage")
    particle_box(d, (88, 250, 820, 720), "solid", t, "Solid CO₂  (dry ice)")
    particle_box(d, (1100, 250, 1832, 720), "gas", t, "CO₂ gas")
    d.text((960, 470), "⇌", font=font("bold", 56), fill=GOLD, anchor="mm")
    d.text((W / 2, 800), "Sublimation: solid → gas     Deposition: gas → solid", font=font("semibold", 26), fill=WHITE, anchor="mm")
    return img


def physical(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Physical changes, not chemical reactions", "No new substance is formed")
    bullet_card(d, (88, 260, 900, 560), "Still H₂O", "When ice melts, the molecules remain H₂O. Only arrangement, movement and separation change.", TEAL)
    bullet_card(d, (960, 260, 1832, 560), "Reversible", "Melting, freezing, boiling and condensation can be reversed by transferring energy.", GOLD)
    bullet_card(d, (88, 600, 1832, 860), "Bonds inside molecules stay intact", "It is the forces between molecules that are overcome, not the chemical bonds within them.", TEAL)
    return img


def curve_slide(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "A heating curve", "Ice from −10 °C to steam at 100 °C")
    progress = 0.18
    if _vis(revealed, "rise1"):
        progress = 0.30
    if _vis(revealed, "melt"):
        progress = 0.48
    if _vis(revealed, "rise2"):
        progress = 0.70
    if _vis(revealed, "boil"):
        progress = 0.95
    heating_curve(d, (88, 250, 1832, 900), progress)
    return img


def changes_quiz(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Check your understanding", "Name the change of state")
    quiz_list(
        d,
        (88, 250, 1832, 900),
        [
            ("q1", "a1", "Gas becomes a liquid?", "Condensation"),
            ("q2", "a2", "Liquid becomes a solid?", "Freezing"),
            ("q3", "a3", "Wet clothes dry below the boiling point?", "Evaporation"),
        ],
        set(revealed),
    )
    return img


def changes_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Examination question", "Energy and boiling")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "Explain why energy must be supplied when water boils.",
        "3 marks",
        "Water molecules are held close together by attractive forces. Energy is needed to overcome those forces so the molecules can move farther apart and form a gas. Temperature stays constant because the energy separates molecules rather than increasing average kinetic energy."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def bonds(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Do not break the wrong bonds", "A common GCSE mistake")
    card(d, (88, 260, 1832, 820), accent=GOLD)
    text_block(
        d,
        (140, 340),
        "The chemical bonds within water molecules are not broken during boiling. It is the forces between the molecules that are overcome. The gas is still H₂O.",
        font("regular", 32),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def mineral(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Is bottled mineral water pure?", "In chemistry, pure has a precise meaning")
    beaker(d, 220, 320, 200, 300, 0.7, (120, 190, 220), solids=8, label="mineral water")
    bullet_card(d, (620, 280, 1832, 500), "It looks clear", "Clear and safe to drink does not mean chemically pure.", TEAL)
    bullet_card(d, (620, 540, 1832, 780), "Chemistry meaning", "A pure substance contains only one element or one compound.", GOLD)
    return img


def pure_def(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Pure substances", "One element or one compound only")
    bullet_card(d, (88, 260, 900, 520), "Pure element", "A sample containing only copper atoms.", TEAL)
    bullet_card(d, (960, 260, 1832, 520), "Pure compound", "A sample containing only water molecules.", GOLD)
    bullet_card(d, (88, 560, 1832, 860), "Distilled water", "Can be very pure because most dissolved substances have been removed.", TEAL)
    return img


def mixture_def(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Mixtures", "Two or more substances, not chemically bonded")
    bullet_card(d, (88, 260, 900, 560), "Air", "Nitrogen, oxygen, argon and carbon dioxide — each keeps its own identity.", TEAL)
    bullet_card(d, (960, 260, 1832, 560), "Seawater", "Water plus dissolved salts and other substances.", GOLD)
    bullet_card(d, (88, 600, 1832, 860), "Separable", "Mixtures can often be separated by physical methods such as filtration or distillation.", TEAL)
    return img


def sharp(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Melting and boiling behaviour", "A key difference used in identification")
    bullet_card(d, (88, 260, 900, 860), "Pure substance", "Sharp, characteristic melting and boiling points at a given pressure. Pure water: 0 °C and 100 °C at normal atmospheric pressure.", TEAL)
    bullet_card(d, (960, 260, 1832, 860), "Mixture", "Often melts or boils over a range of temperatures because the different substances affect the behaviour.", GOLD)
    return img


def salt_roads(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Salt on icy roads", "Impurities lower the freezing point")
    card(d, (88, 260, 1832, 820), accent=TEAL)
    text_block(
        d,
        (140, 340),
        "Pure ice melts at about 0 °C. When salt dissolves in the water on the ice, the freezing point falls. The water is less likely to refreeze at 0 °C, so winter roads stay safer.",
        font("regular", 30),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def mp_test(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Melting point as evidence of purity", "Useful — but not complete proof on its own")
    bullet_card(d, (88, 260, 900, 520), "Expected", "Pure compound melts sharply at 80 °C.", TEAL)
    if _vis(revealed, "range"):
        bullet_card(d, (960, 260, 1832, 520), "This sample", "Melts from 74 °C to 79 °C — lower and broader.", GOLD)
    else:
        bullet_card(d, (960, 260, 1832, 520), "This sample", "Compare the measured melting behaviour with the known value.", GOLD)
    bullet_card(d, (88, 560, 1832, 860), "Interpretation", "Impurities commonly lower the melting point and broaden the melting range. A matching sharp melting point supports purity but does not prove identity by itself.", TEAL)
    return img


def seawater(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Pure water compared with seawater", "Dissolved salts change freezing and boiling")
    beaker(d, 220, 320, 180, 280, 0.65, (140, 200, 230), label="pure water")
    beaker(d, 560, 320, 180, 280, 0.65, (70, 150, 190), solids=10, label="seawater")
    bullet_card(d, (880, 280, 1832, 500), "Freezing point", "Dissolved salts generally lower the freezing point.", TEAL)
    bullet_card(d, (880, 540, 1832, 760), "Boiling point", "Dissolved salts generally raise the boiling point.", GOLD)
    return img


def pure_quiz(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Pure substance or mixture?", "Decide, then check")
    quiz_list(
        d,
        (88, 250, 1832, 900),
        [
            ("q1", "a1", "Oxygen gas — only O₂ molecules", "Pure substance (one element)"),
            ("q2", "a2", "Air", "Mixture of several gases"),
            ("q3", "a3", "Sodium chloride — only NaCl", "Pure compound"),
            ("q4", "a4", "Seawater", "Mixture — water and dissolved substances"),
            ("q5", "a5", "Brass", "Mixture / alloy — mainly copper and zinc"),
        ],
        set(revealed),
    )
    return img


def pure_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Examination question", "Use the data")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "A pure substance melts at 80 °C. A student's sample melts between 74 °C and 79 °C. Explain what this suggests about the sample.",
        "3 marks",
        "The sample is likely to contain impurities because it melts over a range rather than at a sharp melting point. The range is also below the melting point of the pure substance. Impurities commonly lower and broaden the melting range."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def pure_recap(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Remember", "Purity in chemistry")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Pure", "Only one element or one compound."),
            ("Mixture", "Two or more substances, not chemically bonded."),
            ("Evidence", "Sharp melting/boiling points versus a range."),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def principle(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Choosing a separation method", "Use differences in physical properties")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Solubility", "Dissolved or undissolved?"),
            ("Particle size", "Can filter paper hold the solid?"),
            ("Boiling point", "Simple or fractional distillation?"),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def filtration(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Filtration", "Insoluble solid from a liquid")
    funnel_filter(d, 220, 300)
    beaker(d, 250, 620, 150, 140, 0.45, label="filtrate" if _vis(revealed, "filtrate") else "liquid")
    beaker(d, 620, 320, 150, 180, 0.6, solids=8, label="sand + water")
    if _vis(revealed, "residue"):
        d.text((300, 270), "residue = sand", font=font("bold", 22), fill=GOLD)
    if _vis(revealed, "filtrate"):
        d.text((320, 800), "filtrate = water", font=font("bold", 22), fill=TEAL_BAR)
    bullet_card(d, (980, 280, 1832, 820), "How it works", "Pores in the filter paper let water through and hold back larger sand particles.", TEAL)
    return img


def filter_limit(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Filtration cannot remove dissolved salt", "The salt particles travel with the water")
    card(d, (88, 260, 1832, 820), accent=GOLD)
    text_block(
        d,
        (140, 340),
        "Dissolved salt passes through the filter paper with the water. To obtain the dissolved solid we need crystallisation. To obtain the solvent we need distillation.",
        font("regular", 30),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def crystallisation(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Crystallisation", "Obtain a dissolved solid from a solution")
    evaporating_basin(d, 180, 360, crystals=True)
    flow_steps(
        d,
        (520, 260, 1832, 860),
        [
            ("Heat gently", "Evaporate some of the water in a basin"),
            ("Concentrate", "Stop before the solution is completely dry"),
            ("Cool", "Solubility falls and crystals form"),
            ("Dry", "Separate the crystals and dry them"),
        ],
    )
    return img


def simple_distil(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Simple distillation", "Collect the solvent — salt stays behind")
    simple_distillation(d, (88, 250, 1832, 860))
    return img


def fractional(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Fractional distillation", "Miscible liquids with different boiling points")
    fractionating_column(d, (88, 250, 1832, 860))
    return img


def salt_sand(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Salt and sand practical", "Combine techniques to obtain pure, dry salt")
    steps = [
        ("s1", "Add water and stir", "Salt dissolves; sand does not"),
        ("s2", "Filter", "Sand is the residue; salt solution is the filtrate"),
        ("s3", "Heat the filtrate", "Evaporate some water in a basin"),
        ("s4", "Cool", "Salt crystals form"),
        ("s5", "Dry", "Separate and dry the crystals"),
    ]
    y = 250
    for key, title, body in steps:
        box = (88, y, 1832, y + 110)
        if _vis(revealed, key):
            bullet_card(d, box, title, body, TEAL)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 122
    return img


def sep_quiz(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Check your understanding", "Choose the correct method")
    quiz_list(
        d,
        (88, 250, 1832, 900),
        [
            ("q1", "a1", "Separate sand from water?", "Filtration"),
            ("q2", "a2", "Obtain pure water from seawater?", "Simple distillation"),
            ("q3", "a3", "Separate crude oil fractions?", "Fractional distillation"),
        ],
        set(revealed),
    )
    return img


def sep_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Six-mark practical question", "Logical sequence, apparatus and purpose")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "Describe how a student could obtain pure, dry salt from a mixture of salt and sand.",
        "6 marks",
        "Add water and stir to dissolve the salt; sand stays insoluble. Filter to remove the sand. Collect the filtrate. Gently heat it in an evaporating basin to concentrate the solution. Cool so crystals form. Separate and dry the crystals."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def ink(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Is black ink one dye?", "Paper chromatography can tell us")
    chromatogram(d, (88, 250, 720, 860), 0.05, [])
    bullet_card(d, (760, 280, 1832, 520), "Looks black", "A felt-tip may contain several coloured dyes.", TEAL)
    bullet_card(d, (760, 560, 1832, 820), "The question", "One dye, or a mixture of dyes?", GOLD)
    return img


def phases(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Two phases", "How chromatography separates substances")
    bullet_card(d, (88, 260, 900, 560), "Stationary phase", "Commonly described as the chromatography paper.", TEAL)
    bullet_card(d, (960, 260, 1832, 560), "Mobile phase", "The solvent moving through the paper.", GOLD)
    bullet_card(d, (88, 600, 1832, 860), "More precisely", "Separation depends on interactions with the paper, water associated with cellulose fibres, and the moving solvent.", TEAL)
    return img


def chroma_method(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Setting up the experiment", "Pencil baseline, small spot, solvent below the line")
    chromatogram(d, (88, 250, 720, 860), 0.08, [])
    y = 260
    rows = [
        ("base", "Pencil baseline", "Graphite does not dissolve and spoil the result."),
        ("spot", "Small dry ink spot", "Place it on the baseline and allow it to dry."),
        ("level", "Solvent below the baseline", "Otherwise the sample dissolves into the liquid."),
    ]
    for key, title, body in rows:
        box = (760, y, 1832, y + 180)
        if _vis(revealed, key):
            bullet_card(d, box, title, body, TEAL)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 200
    return img


def chroma_run(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "The solvent travels up the paper", "Dyes separate because they have different affinities")
    chromatogram(d, (88, 250, 820, 860), min(1.0, 0.15 + t * 0.08), [(0.35, ORANGE), (0.62, PURPLE), (0.86, PINK)])
    bullet_card(d, (860, 280, 1832, 500), "Capillary action", "The solvent carries dissolved dyes with it.", TEAL)
    bullet_card(d, (860, 540, 1832, 800), "Different distances", "Stronger attraction to the mobile phase → farther. Stronger retention by the stationary phase → shorter.", GOLD)
    return img


def chroma_id(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Using a chromatogram", "One spot is useful evidence — not complete proof")
    chromatogram(d, (88, 250, 700, 820), 1.0, [(0.72, TEAL)])
    chromatogram(d, (740, 250, 1352, 820), 1.0, [(0.32, ORANGE), (0.58, PURPLE), (0.84, PINK)], "Mixture")
    bullet_card(d, (1390, 260, 1832, 820), "Caution", "Different substances can travel the same distance, so one spot does not prove purity.", GOLD)
    return img


def rf_formula(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Rf — retention factor", "A ratio with no units")
    card(d, (88, 260, 1832, 520), accent=GOLD)
    d.text((W / 2, 360), "Rf  =  distance travelled by the substance", font=font("bold", 36), fill=WHITE, anchor="mm")
    d.text((W / 2, 430), "distance travelled by the solvent front", font=font("bold", 36), fill=WHITE, anchor="mm")
    d.line((620, 392, 1300, 392), fill=WHITE, width=3)
    bullet_card(d, (88, 560, 900, 860), "Measure from the baseline", "Use the centre of the spot.", TEAL)
    bullet_card(d, (960, 560, 1832, 860), "Usual range", "For ordinary paper chromatography, Rf lies between 0 and 1.", GOLD)
    return img


def rf_ex1(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Worked example", "6 cm and 8 cm from the same baseline")
    chromatogram(d, (88, 250, 720, 860), 1.0, [(0.75, ORANGE)])
    y = 260
    rows = [
        ("formula", "Rf = distance of substance ÷ distance of solvent front"),
        ("sub", "6 ÷ 8"),
        ("ans", "Rf = 0.75   (no units)"),
    ]
    for key, text in rows:
        box = (760, y, 1832, y + 180)
        if _vis(revealed, key):
            card(d, box, accent=GOLD if key == "ans" else TEAL)
            d.text((800, y + 70), text.replace("Rf", "Rf"), font=font("bold", 32), fill=WHITE)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 200
    return img


def rf_ex2(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Your turn", "3.5 cm and 7.0 cm")
    chromatogram(d, (88, 250, 720, 860), 1.0, [(0.5, PURPLE)])
    if _vis(revealed, "ans"):
        card(d, (760, 300, 1832, 820), accent=GOLD)
        d.text((1296, 500), "Rf = 3.5 ÷ 7 = 0.50", font=font("bold", 40), fill=WHITE, anchor="mm")
        d.text((1296, 580), "Well done if you got that correct.", font=font("regular", 24), fill=MUTED, anchor="mm")
    else:
        card(d, (760, 300, 1832, 820), accent=TEAL)
        d.text((1296, 520), "Pause and calculate…", font=font("bold", 36), fill=WHITE, anchor="mm")
    return img


def rf_compare(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Compare like with like", "Rf values depend on the conditions")
    card(d, (88, 260, 1832, 820), accent=TEAL)
    text_block(
        d,
        (140, 360),
        "Rf values should only be compared when the chromatography conditions are the same. Changing the solvent, the paper or the experiment can change the Rf value.",
        font("regular", 30),
        WHITE,
        1600,
        line_gap=14,
    )
    return img


def chroma_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Examination question", "Explain using both phases")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "Explain why two dyes in a mixture separate during paper chromatography.",
        "3 marks",
        "The dyes have different solubilities in the mobile phase and different attractions to the stationary phase. The solvent carries them at different rates, so they travel different distances and form separate spots."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def chroma_recap(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Remember", "Chromatography in one page")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Purpose", "Separate and help identify substances in mixtures."),
            ("How", "Mobile phase carries substances through the stationary phase at different rates."),
            ("Rf", "Distance of substance ÷ distance of solvent front."),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def tap(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Is tap water chemically pure?", "Safe to drink is not the same as chemically pure")
    beaker(d, 240, 320, 200, 300, 0.7, (110, 180, 220), solids=4, label="tap water")
    bullet_card(d, (620, 280, 1832, 500), "The answer is no", "Treated tap water still contains small amounts of dissolved substances.", TEAL)
    bullet_card(d, (620, 540, 1832, 800), "Chemically pure", "Only H₂O molecules — potable water does not need this.", GOLD)
    return img


def potable(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Potable water", "Water that is safe to drink")
    bullet_card(d, (88, 260, 900, 560), "Must be low in", "Dissolved salts and harmful microorganisms.", TEAL)
    bullet_card(d, (960, 260, 1832, 560), "May still contain", "Safe levels of minerals such as calcium and magnesium compounds.", GOLD)
    bullet_card(d, (88, 600, 1832, 860), "Not chemically pure", "Potable water is about safety, not the complete absence of other substances.", TEAL)
    return img


def sources(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Where drinking water comes from", "Rivers, lakes, reservoirs and underground sources")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Collect", "In many parts of the UK, water is taken from surface and ground sources."),
            ("Treat", "The exact process depends on the quality of the source."),
            ("Supply", "Only then is it sent to homes."),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def fresh_treat(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Treating freshwater", "Different stages remove different contaminants")
    active = None
    for i, key in enumerate(("screen", "sed", "floc", "filter")):
        if _vis(revealed, key):
            active = i
    flow_steps(
        d,
        (88, 250, 1832, 900),
        [
            ("Screening", "Removes leaves, branches and other large debris"),
            ("Sedimentation", "Heavier suspended particles settle"),
            ("Coagulation and flocculation", "Chemicals help small particles clump and settle"),
            ("Filtration", "Sand and gravel remove remaining suspended material"),
        ],
        active,
    )
    return img


def disinfect(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Disinfection", "Filtration does not remove every microorganism")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Chlorination", "A controlled amount of chlorine kills or inactivates harmful microorganisms."),
            ("Other methods", "Ultraviolet radiation and ozone treatment."),
            ("Then test", "Water must meet drinking-water standards before distribution."),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def sewage(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Waste water and sewage", "Used water must be treated before discharge")
    bullet_card(d, (88, 260, 1832, 500), "Waste water", "Water used in homes, businesses and industries.", TEAL)
    bullet_card(d, (88, 540, 1832, 820), "Sewage", "May contain human waste, food residues, detergents and microorganisms.", GOLD)
    return img


def sewage_steps(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Sewage treatment", "Separate solids, then treat biologically")
    active = None
    for i, key in enumerate(("s1", "s2", "s3", "s4")):
        if _vis(revealed, key):
            active = i
    flow_steps(
        d,
        (88, 250, 1832, 900),
        [
            ("Screening", "Large objects are removed"),
            ("Settling", "Effluent (liquid) and sludge (solids) separate"),
            ("Anaerobic digestion", "Microorganisms break down sludge without oxygen and make biogas"),
            ("Aerobic treatment", "Air is supplied so microorganisms break down organic matter in the effluent"),
        ],
        active,
    )
    return img


def desal(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Desalination", "Removing dissolved salts from seawater")
    bullet_card(d, (88, 260, 900, 860), "Distillation", "Heat seawater so water evaporates. Cool the vapour to condense pure water. Most salts stay behind.", TEAL)
    bullet_card(d, (960, 260, 1832, 860), "Reverse osmosis", "High pressure forces water through a membrane. Water molecules pass; most dissolved salts are rejected.", GOLD)
    return img


def desal_cost(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Why desalination is expensive", "Energy, equipment and waste")
    recap_cards(
        d,
        (88, 260, 1832, 860),
        [
            ("Distillation energy", "A large amount of energy is needed to heat and evaporate water."),
            ("Reverse osmosis energy", "High pressure must be generated across the membrane."),
            ("Plant costs", "Specialised equipment, maintenance and concentrated salt waste."),
        ],
        {"*"},
        ["a", "b", "c"],
    )
    return img


def river_example(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "River water to the tap", "Each stage removes a different problem")
    steps = [
        ("s1", "Screening", "Removes leaves and large debris"),
        ("s2", "Sedimentation and filtration", "Removes suspended soil particles"),
        ("s3", "Disinfection", "Reduces harmful microorganisms to safe levels, then the water is tested"),
    ]
    y = 260
    for key, title, body in steps:
        box = (88, y, 1832, y + 180)
        if _vis(revealed, key):
            bullet_card(d, box, title, body, TEAL)
        else:
            d.rounded_rectangle(box, 18, fill=(16, 34, 58), outline=LINE, width=1)
        y += 200
    return img


def water_quiz(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Check your understanding", "Potable water and treatment")
    quiz_list(
        d,
        (88, 250, 1832, 900),
        [
            ("q1", "a1", "What is potable water?", "Water that is safe to drink"),
            ("q2", "a2", "Must it be chemically pure?", "No — small amounts of dissolved substances are allowed"),
            ("q3", "a3", "Chlorine is used in…", "Chlorination"),
            ("q4", "a4", "Removing salts from seawater?", "Desalination"),
        ],
        set(revealed),
    )
    return img


def water_exam(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Examination question", "Link the science to the cost")
    exam_panel(
        d,
        (88, 250, 1832, 900),
        "Explain why desalination is often more expensive than obtaining potable water from freshwater sources.",
        "4 marks",
        "Seawater has high concentrations of dissolved salts that must be removed. Distillation needs large amounts of energy to evaporate water. Reverse osmosis needs energy to generate high pressure. Specialised equipment and operating costs make desalination more expensive than ordinary freshwater treatment."
        if _vis(revealed, "answer")
        else None,
    )
    return img


def water_recap(lesson, revealed, t, page):
    img, d = _base(lesson, page)
    heading(d, "Remember", "Water treatment in four ideas")
    recap_cards(
        d,
        (88, 280, 1832, 820),
        [
            ("Potable", "Safe to drink, not necessarily chemically pure."),
            ("Freshwater", "Filtration and disinfection are common stages."),
            ("Sewage", "Separate solids and use biological treatment."),
            ("Desalination", "Removes salts but can need a lot of energy."),
        ],
        {"*"},
        ["a", "b", "c", "d"],
    )
    return img


KIND = {
    "intro": lambda lesson, slide, revealed, t, page: intro(lesson, revealed, t, page),
    "aims": lambda lesson, slide, revealed, t, page: aims(lesson, revealed, t, page),
    "outro": lambda lesson, slide, revealed, t, page: outro(lesson, revealed, t, page),
    "hook": lambda lesson, slide, revealed, t, page: hook(lesson, revealed, t, page),
    "model": lambda lesson, slide, revealed, t, page: model(lesson, revealed, t, page),
    "state": state_focus,
    "state_props": state_props,
    "ice": lambda lesson, slide, revealed, t, page: ice_slide(lesson, revealed, t, page),
    "pour": lambda lesson, slide, revealed, t, page: pour_slide(lesson, revealed, t, page),
    "perfume": lambda lesson, slide, revealed, t, page: perfume_slide(lesson, revealed, t, page),
    "syringe": lambda lesson, slide, revealed, t, page: syringe_slide(lesson, revealed, t, page),
    "compare_h2o": lambda lesson, slide, revealed, t, page: compare_h2o(lesson, revealed, t, page),
    "exam_point": lambda lesson, slide, revealed, t, page: exam_point(lesson, revealed, t, page),
    "states_quiz": lambda lesson, slide, revealed, t, page: states_quiz(lesson, revealed, t, page),
    "states_exam": lambda lesson, slide, revealed, t, page: states_exam(lesson, revealed, t, page),
    "states_recap": lambda lesson, slide, revealed, t, page: states_recap(lesson, revealed, t, page),
    "saucepan": lambda lesson, slide, revealed, t, page: saucepan(lesson, revealed, t, page),
    "change": change_slide,
    "energy_note": lambda lesson, slide, revealed, t, page: energy_note(lesson, revealed, t, page),
    "evap_vs_boil": lambda lesson, slide, revealed, t, page: evap_vs_boil(lesson, revealed, t, page),
    "sublime": lambda lesson, slide, revealed, t, page: sublime(lesson, revealed, t, page),
    "physical": lambda lesson, slide, revealed, t, page: physical(lesson, revealed, t, page),
    "heating_curve": lambda lesson, slide, revealed, t, page: curve_slide(lesson, revealed, t, page),
    "changes_quiz": lambda lesson, slide, revealed, t, page: changes_quiz(lesson, revealed, t, page),
    "changes_exam": lambda lesson, slide, revealed, t, page: changes_exam(lesson, revealed, t, page),
    "bonds": lambda lesson, slide, revealed, t, page: bonds(lesson, revealed, t, page),
    "mineral": lambda lesson, slide, revealed, t, page: mineral(lesson, revealed, t, page),
    "pure_def": lambda lesson, slide, revealed, t, page: pure_def(lesson, revealed, t, page),
    "mixture_def": lambda lesson, slide, revealed, t, page: mixture_def(lesson, revealed, t, page),
    "sharp": lambda lesson, slide, revealed, t, page: sharp(lesson, revealed, t, page),
    "salt_roads": lambda lesson, slide, revealed, t, page: salt_roads(lesson, revealed, t, page),
    "mp_test": lambda lesson, slide, revealed, t, page: mp_test(lesson, revealed, t, page),
    "seawater": lambda lesson, slide, revealed, t, page: seawater(lesson, revealed, t, page),
    "pure_quiz": lambda lesson, slide, revealed, t, page: pure_quiz(lesson, revealed, t, page),
    "pure_exam": lambda lesson, slide, revealed, t, page: pure_exam(lesson, revealed, t, page),
    "pure_recap": lambda lesson, slide, revealed, t, page: pure_recap(lesson, revealed, t, page),
    "principle": lambda lesson, slide, revealed, t, page: principle(lesson, revealed, t, page),
    "filtration": lambda lesson, slide, revealed, t, page: filtration(lesson, revealed, t, page),
    "filter_limit": lambda lesson, slide, revealed, t, page: filter_limit(lesson, revealed, t, page),
    "crystallisation": lambda lesson, slide, revealed, t, page: crystallisation(lesson, revealed, t, page),
    "simple_distil": lambda lesson, slide, revealed, t, page: simple_distil(lesson, revealed, t, page),
    "fractional": lambda lesson, slide, revealed, t, page: fractional(lesson, revealed, t, page),
    "salt_sand": lambda lesson, slide, revealed, t, page: salt_sand(lesson, revealed, t, page),
    "sep_quiz": lambda lesson, slide, revealed, t, page: sep_quiz(lesson, revealed, t, page),
    "sep_exam": lambda lesson, slide, revealed, t, page: sep_exam(lesson, revealed, t, page),
    "ink": lambda lesson, slide, revealed, t, page: ink(lesson, revealed, t, page),
    "phases": lambda lesson, slide, revealed, t, page: phases(lesson, revealed, t, page),
    "chroma_method": lambda lesson, slide, revealed, t, page: chroma_method(lesson, revealed, t, page),
    "chroma_run": lambda lesson, slide, revealed, t, page: chroma_run(lesson, revealed, t, page),
    "chroma_id": lambda lesson, slide, revealed, t, page: chroma_id(lesson, revealed, t, page),
    "rf_formula": lambda lesson, slide, revealed, t, page: rf_formula(lesson, revealed, t, page),
    "rf_ex1": lambda lesson, slide, revealed, t, page: rf_ex1(lesson, revealed, t, page),
    "rf_ex2": lambda lesson, slide, revealed, t, page: rf_ex2(lesson, revealed, t, page),
    "rf_compare": lambda lesson, slide, revealed, t, page: rf_compare(lesson, revealed, t, page),
    "chroma_exam": lambda lesson, slide, revealed, t, page: chroma_exam(lesson, revealed, t, page),
    "chroma_recap": lambda lesson, slide, revealed, t, page: chroma_recap(lesson, revealed, t, page),
    "tap": lambda lesson, slide, revealed, t, page: tap(lesson, revealed, t, page),
    "potable": lambda lesson, slide, revealed, t, page: potable(lesson, revealed, t, page),
    "sources": lambda lesson, slide, revealed, t, page: sources(lesson, revealed, t, page),
    "fresh_treat": lambda lesson, slide, revealed, t, page: fresh_treat(lesson, revealed, t, page),
    "disinfect": lambda lesson, slide, revealed, t, page: disinfect(lesson, revealed, t, page),
    "sewage": lambda lesson, slide, revealed, t, page: sewage(lesson, revealed, t, page),
    "sewage_steps": lambda lesson, slide, revealed, t, page: sewage_steps(lesson, revealed, t, page),
    "desal": lambda lesson, slide, revealed, t, page: desal(lesson, revealed, t, page),
    "desal_cost": lambda lesson, slide, revealed, t, page: desal_cost(lesson, revealed, t, page),
    "river_example": lambda lesson, slide, revealed, t, page: river_example(lesson, revealed, t, page),
    "water_quiz": lambda lesson, slide, revealed, t, page: water_quiz(lesson, revealed, t, page),
    "water_exam": lambda lesson, slide, revealed, t, page: water_exam(lesson, revealed, t, page),
    "water_recap": lambda lesson, slide, revealed, t, page: water_recap(lesson, revealed, t, page),
}


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float = 0.0) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    kind = slide["kind"]
    page = slide.get("page", 1)
    return KIND[kind](lesson, slide, list(revealed), t, page)
