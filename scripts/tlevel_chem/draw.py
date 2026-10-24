"""Render one A11.1 slide at time t."""

from __future__ import annotations

from typing import Iterable

from PIL import Image, ImageDraw

from gcse_foundations.diagrams import bullet_card, card, recap_cards, text_block
from jdscience_video.theme import (
    GOLD,
    GREEN,
    INK,
    LINE,
    MUTED,
    NAVY_CARD,
    NAVY_ROW,
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
from tlevel_chem.diagrams import ORANGE, collision_frame, energy_bar
from tlevel_chem.lessons import LESSONS
from tlevel_chem.draw_a12 import render_a12
from tlevel_chem.science import causal_pills, energy_profile, maxwell_boltzmann, particle_chamber


def _vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def _chrome(page: int, total: int, topic: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = new_canvas()
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 10), fill=TEAL_BAR)
    img.paste(logo(), (56, 28), logo())
    d.text((122, 38), "JD", font=font("bold", 22), fill=TEAL_BAR)
    d.text((156, 38), "SCIENCE", font=font("semibold", 22), fill=INK)
    d.rounded_rectangle((48, 96, W - 48, img.height - 72), 28, fill=NAVY_CARD, outline=LINE, width=2)
    d.rectangle((0, img.height - 56, W, img.height), fill=(7, 16, 34))
    d.text((56, img.height - 40), f"T-LEVEL CHEMISTRY   ·   {topic.upper()}", font=font("medium", 16), fill=MUTED, anchor="lm")
    d.text((W - 56, img.height - 40), f"{page:02d}  /  {total:02d}", font=font("semibold", 16), fill=INK, anchor="rm")
    return img, d


def render_slide(lesson: dict, slide_id: str, revealed: Iterable[str], t: float) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    img, d = _chrome(slide["page"], lesson["pages"], lesson["title"])
    kind = slide.get("kind")
    vis = lambda name: _vis(revealed, name)

    if kind == "intro":
        heading(d, f"{lesson['spec']}  {lesson['title']}", lesson.get("subtitle") or "Rates of reaction and energy changes")
        d.text((88, 320), "T-Level Science  ·  Chemistry", font=font("semibold", 28), fill=TEAL_BAR)
        d.text((88, 390), lesson.get("subtitle") or "Activation energy  ·  successful collisions  ·  spatial orientation", font=font("regular", 26), fill=MUTED)
        d.text((88, 860), STRAPLINE, font=font("medium", 22), fill=GOLD)
        return img

    if kind == "aims":
        heading(d, "Learning outcomes", "What you should be able to do by the end")
        aims = [
            ("a1", "Explain why reacting particles must collide"),
            ("a2", "Define activation energy"),
            ("a3", "Distinguish successful and unsuccessful collisions"),
            ("a4", "Explain correct spatial orientation"),
        ]
        for i, (key, text) in enumerate(aims):
            y = 250 + i * 140
            bullet_card(d, (88, y, W - 88, y + 120), f"Outcome {i + 1}", text, show=vis(key))
        return img

    if kind == "hook":
        heading(d, "Will every collision react?", "A starter from the A11.1 lesson")
        d.text((88, 260), "Two reactant particles collide.", font=font("semibold", 34), fill=WHITE)
        d.text((88, 320), "Must a reaction always occur?", font=font("regular", 30), fill=MUTED)
        if vis("ans"):
            card(d, (88, 420, W - 88, 860), accent=ORANGE if False else TEAL)
            d.text((128, 450), "No. Many collisions are unsuccessful.", font=font("bold", 32), fill=WHITE)
            text_block(d, (128, 520), "A collision may have insufficient energy, or an unsuitable spatial orientation. Existing bonds may need to break before atoms rearrange and new bonds form.", font("regular", 26), MUTED, 1600)
        return img

    if kind == "central":
        heading(d, "Collision theory: the central idea", "Specification A11.1")
        points = [
            "Reactant particles must collide.",
            "A collision alone is not sufficient.",
            "A successful collision needs enough energy and the correct orientation.",
            "If either requirement fails, products do not form.",
        ]
        for i, text in enumerate(points):
            y = 260 + i * 140
            card(d, (88, y, W - 88, y + 120), accent=TEAL)
            d.text((130, y + 38), text, font=font("semibold", 28), fill=WHITE)
        return img

    if kind == "ea_def":
        heading(d, "A11.1.1  Activation energy", "The energy requirement")
        card(d, (88, 250, W - 88, 430), accent=GOLD)
        text_block(d, (128, 280), "Activation energy is the minimum energy that colliding particles must have for a successful reaction.", font("semibold", 28), WHITE, 1640)
        card(d, (88, 460, 920, 860), accent=TEAL)
        text_block(d, (128, 500), "Particles need enough collision energy for required bonds to break and atoms to rearrange. New bonds can then form.", font("regular", 24), MUTED, 740)
        energy_bar(d, (960, 460, 1830, 860), energy=30, ea=45, title="Below Ea")
        return img

    if kind == "collide":
        mode = slide.get("mode", "low")
        titles = {
            "low": ("Energy below activation energy", "Unsuccessful collision"),
            "high": ("Energy meets activation energy", "Energy requirement satisfied"),
            "wrong_orient": ("Incorrect spatial orientation", "Reactive regions do not meet"),
            "right_orient": ("Correct spatial orientation", "Required parts of the reactants meet"),
        }
        title, sub = titles[mode]
        heading(d, title, sub)
        collision_frame(d, (88, 250, 1240, 900), t, mode)
        ea, energy = (45, 30 if mode == "low" else 55)
        energy_bar(d, (1280, 250, 1830, 900), energy=energy, ea=ea)
        return img

    if kind == "two_tests":
        heading(d, "Energy is necessary, not sufficient", "Two tests, not one")
        card(d, (88, 250, 920, 860), accent=GOLD)
        d.text((128, 290), "Test 1  ·  Energy", font=font("bold", 32), fill=WHITE)
        text_block(d, (128, 360), "Is collision energy at least the activation energy? If not, the collision is unsuccessful.", font("regular", 26), MUTED, 740)
        card(d, (980, 250, 1830, 860), accent=TEAL)
        d.text((1020, 290), "Test 2  ·  Orientation", font=font("bold", 32), fill=WHITE)
        text_block(d, (1020, 360), "Are the particles aligned so the required atoms or reactive regions can interact? Enough energy can still fail this test.", font("regular", 26), MUTED, 740)
        return img

    if kind == "rule":
        heading(d, "Decision rule", "Use this every time you classify a collision")
        rows = [
            "Collision energy < Ea  →  unsuccessful, insufficient energy.",
            "Collision energy ≥ Ea  →  energy is satisfied; now check orientation.",
            "Correct orientation cannot compensate for low energy.",
            "A full answer mentions bond breaking, rearrangement and new bonds.",
        ]
        for i, text in enumerate(rows):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=TEAL)
            d.text((130, y + 42), text, font=font("semibold", 26), fill=WHITE)
        return img

    if kind == "orient_def":
        heading(d, "A11.1.2  Spatial orientation", "How the particles meet")
        text_block(d, (88, 260), "Reacting particles have a three-dimensional arrangement. Particular atoms or reactive regions must meet. If they approach the wrong way, the necessary bond changes cannot occur, even if the particles touch.", font("regular", 28), MUTED, 1740)
        card(d, (88, 520, W - 88, 860), accent=TEAL)
        d.text((128, 580), "Correct spatial orientation is a second requirement for a successful collision.", font=font("bold", 30), fill=WHITE)
        return img

    if kind == "combine":
        heading(d, "Combine the two conditions", "Both must be yes")
        card(d, (88, 250, 640, 860), accent=GOLD)
        d.text((120, 320), "Both yes", font=font("bold", 34), fill=WHITE)
        text_block(d, (120, 400), "Successful collision is possible. Products can form.", font("regular", 26), MUTED, 460)
        card(d, (680, 250, 1830, 860), accent=(232, 150, 72))
        d.text((720, 320), "Either no", font=font("bold", 34), fill=WHITE)
        text_block(d, (720, 400), "Unsuccessful collision. Products do not form from that meeting of particles.", font("regular", 26), MUTED, 1040)
        return img

    if kind == "example":
        label = slide["label"]
        energy = slide["energy"]
        ea = slide["ea"]
        orient = slide["orient"]
        heading(d, f"Worked example  ·  Collision {label}", f"Ea = {ea:g} kJ mol⁻¹")
        energy_bar(d, (88, 250, 620, 900), energy=energy, ea=ea, title=f"Collision {label}")
        card(d, (660, 250, 1830, 520), accent=TEAL)
        d.text((700, 290), f"Orientation: {orient}", font=font("bold", 32), fill=WHITE)
        d.text((700, 360), f"Collision energy: {energy:g} kJ mol⁻¹", font=font("semibold", 26), fill=MUTED)
        d.text((700, 420), f"Activation energy: {ea:g} kJ mol⁻¹", font=font("semibold", 26), fill=MUTED)
        if vis("verdict"):
            ok = energy >= ea and orient == "correct"
            card(d, (660, 560, 1830, 900), accent=GREEN if ok else (232, 150, 72))
            d.text((700, 610), "Successful collision possible" if ok else "Unsuccessful collision", font=font("bold", 32), fill=WHITE)
            reason = (
                "Energy exceeds Ea and orientation is correct."
                if ok else
                "Energy is below Ea." if energy < ea else "Orientation is incorrect."
            )
            text_block(d, (700, 680), reason, font("regular", 26), MUTED, 1060)
        return img

    if kind == "myths":
        heading(d, "Common misconceptions", "Correct these before the examination")
        myths = [
            "Particles do not react whenever they collide.",
            "Activation energy is not energy released by a reaction.",
            "Enough energy does not guarantee a reaction.",
            "Correct orientation cannot make up for low energy.",
        ]
        for i, text in enumerate(myths):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=GOLD)
            d.text((130, y + 42), text, font=font("semibold", 28), fill=WHITE)
        return img

    if kind == "exam":
        heading(d, "Examination-style question", "Ea = 62 kJ mol⁻¹  ·  particles P and Q")
        items = [
            ("a", "(a) 58 kJ mol⁻¹, correct orientation. Why unsuccessful?  [2]"),
            ("b", "(b) 70 kJ mol⁻¹, incorrect orientation. Why unsuccessful?  [2]"),
            ("c", "(c) State the conditions needed to form products.  [2]"),
            ("d", "(d) Why do many collisions not produce a reaction?  [2]"),
        ]
        answers = {
            "a": "58 is below 62, so insufficient energy for the required bond changes.",
            "b": "Energy exceeds Ea, but spatial orientation is incorrect.",
            "c": "Energy at least Ea, and correct spatial orientation.",
            "d": "Many collisions fail one or both requirements.",
        }
        for i, (key, prompt) in enumerate(items):
            y = 240 + i * 170
            card(d, (88, y, W - 88, y + 154), accent=TEAL)
            d.text((128, y + 18), prompt, font=font("semibold", 24), fill=WHITE)
            if vis(key):
                d.text((128, y + 78), answers[key], font=font("regular", 24), fill=GREEN)
        return img

    if kind == "recap":
        heading(d, "Plenary: complete the model", "Both requirements, in one sentence each")
        recap_cards(
            d,
            (88, 250, W - 88, 860),
            [
                ("Collide", "Reactant particles must collide."),
                ("Energy", "Collision energy is at least Ea."),
                ("Orientation", "Correct spatial orientation."),
                ("Successful", "Only then is the collision successful."),
            ],
            set(revealed),
            ["r1", "r2", "r3", "r4"],
        )
        return img

    if kind == "outro":
        heading(d, "Subscribe to JD Science", "More T-Level Chemistry explanations")
        d.text((88, 360), "jdscience.co.uk", font=font("bold", 56), fill=TEAL_BAR)
        d.text((88, 460), STRAPLINE, font=font("medium", 28), fill=GOLD)
        d.text((88, 560), "Worksheets, videos and tutoring for UK science students.", font=font("regular", 26), fill=MUTED)
        return img

    if kind == "aims2":
        heading(d, "Learning outcomes", "A11.2  Temperature and rate")
        aims = [
            ("a1", "Kinetic energy and particle speed"),
            ("a2", "Collision frequency and successful collisions"),
            ("a3", "The effect of lowering temperature"),
            ("a4", "Read a Maxwell–Boltzmann distribution"),
        ]
        for i, (key, text) in enumerate(aims):
            y = 250 + i * 140
            bullet_card(d, (88, y, W - 88, y + 120), f"Outcome {i + 1}", text, show=vis(key))
        return img

    if kind == "hook2":
        heading(d, "Retrieve collision theory", "Two conditions, then temperature")
        particle_chamber(d, (88, 250, 900, 860), t, "high", True, "Particles in a reaction mixture")
        card(d, (940, 250, 1830, 860), accent=TEAL)
        if vis("ans"):
            d.text((980, 300), "Successful collision needs", font=font("bold", 28), fill=WHITE)
            text_block(d, (980, 360), "1. Collision energy ≥ activation energy.\n2. Correct spatial orientation.", font("semibold", 26), MUTED, 800)
        else:
            d.text((980, 420), "What two conditions are required?", font=font("semibold", 28), fill=MUTED)
        return img

    if kind == "ke":
        heading(d, "A11.2.1  Temperature changes kinetic energy", "Average energy, then speed")
        particle_chamber(d, (88, 250, 1100, 900), t, "high", False, "Greater average kinetic energy")
        card(d, (1140, 250, 1830, 900), accent=GOLD)
        text_block(d, (1180, 310), "Higher temperature → greater average kinetic energy → particles move faster.", font("semibold", 28), WHITE, 600)
        text_block(d, (1180, 520), "Faster movement changes how often particles collide and the energies of those collisions.", font("regular", 24), MUTED, 600)
        return img

    if kind == "chamber":
        temp = slide.get("temp", "high")
        heading(d, "Lower temperature" if temp == "low" else "Higher temperature", "Watch particle speed")
        particle_chamber(d, (88, 250, 1830, 900), t, temp, True)
        return img

    if kind == "freq":
        heading(d, "First effect: collision frequency", "More encounters per unit time")
        particle_chamber(d, (88, 250, 920, 900), t, "low", True, "Lower T")
        particle_chamber(d, (960, 250, 1830, 900), t * 1.1, "high", True, "Higher T")
        return img

    if kind == "mb":
        mode = slide.get("mode", "axes")
        heading(d, {
            "axes": "Maxwell–Boltzmann distribution",
            "shift": "Proportion of successful collisions",
            "two": "Two temperatures, one sample",
            "area": "The area beyond Ea",
            "same": "Same temperature, same curve",
            "cat": "Two activation-energy lines",
        }[mode], {
            "axes": "Energy on the x-axis; number of particles on the y-axis",
            "shift": "A greater proportion have E ≥ Ea",
            "two": "Higher T: broader, lower peak, more high-energy particles",
            "area": "Particles to the right of Ea have E ≥ Ea",
            "same": "A catalyst does not redraw the distribution",
            "cat": "Catalysed Ea lies further left",
        }[mode])
        temps = [("lower T", 3.2, ORANGE), ("higher T", 5.4, TEAL_BAR)]
        if mode == "axes":
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=[temps[0]], ea=9.5, title="One temperature")
        elif mode == "shift":
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=temps, ea=9.5, shade_from=9.5, title="Distribution moves toward higher energy")
        elif mode == "two":
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=temps, ea=9.5, title="Total area unchanged")
        elif mode == "area":
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=[temps[1]], ea=9.5, shade_from=9.5, title="Area to the right of Ea")
        elif mode == "same":
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=11.0, extra_ea=6.4, title="Temperature unchanged")
        else:
            maxwell_boltzmann(d, (88, 240, 1830, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=11.0, extra_ea=6.4, shade_from=6.4, title="Larger area beyond catalysed Ea")
        return img

    if kind == "chain":
        heading(d, "Complete explanation: increasing temperature", "The causal chain")
        causal_pills(d, (88, 260, 1830, 860), [
            ("Temperature", "Greater average kinetic energy.", vis("c1")),
            ("Speed", "Particles move faster.", vis("c1")),
            ("Frequency", "More collisions per unit time.", vis("c2")),
            ("E ≥ Ea", "Larger high-energy proportion.", vis("c3")),
            ("Rate", "Successful collisions more often.", vis("c4")),
        ])
        return img

    if kind == "shortcut":
        heading(d, "Avoid the incomplete shortcut", "Both frequency and success")
        card(d, (88, 250, 900, 860), accent=ORANGE)
        d.text((128, 300), "Incomplete", font=font("bold", 32), fill=WHITE)
        text_block(d, (128, 380), "‘Particles collide less.’ That is only half of the explanation.", font("regular", 26), MUTED, 720)
        card(d, (940, 250, 1830, 860), accent=TEAL)
        d.text((980, 300), "Complete", font=font("bold", 32), fill=WHITE)
        text_block(d, (980, 380), "Fewer collisions per unit time and a smaller proportion with sufficient energy. Ea itself has not changed. Orientation still matters.", font("regular", 26), MUTED, 800)
        return img

    if kind == "changes":
        heading(d, "What changes — and what does not", "Same uncatalysed reaction")
        card(d, (88, 250, 920, 860), accent=TEAL)
        d.text((128, 300), "Changes", font=font("bold", 32), fill=WHITE)
        text_block(d, (128, 380), "Shape of the distribution. Average kinetic energy. Proportion with E ≥ Ea.", font("regular", 26), MUTED, 740)
        card(d, (960, 250, 1830, 860), accent=GOLD)
        d.text((1000, 300), "Does not change", font=font("bold", 32), fill=WHITE)
        text_block(d, (1000, 380), "The activation-energy threshold for the same uncatalysed reaction. Orientation is still required.", font("regular", 26), MUTED, 760)
        return img

    if kind == "guided_mb":
        heading(d, "Guided graph interpretation", "Which curve is higher temperature?")
        maxwell_boltzmann(
            d, (88, 240, 1240, 900),
            temps=[("A", 3.1, ORANGE), ("B", 5.6, TEAL_BAR)],
            ea=9.8,
            title="Ea is fixed",
        )
        card(d, (1280, 240, 1830, 900), accent=TEAL)
        if vis("ans"):
            d.text((1320, 300), "Curve B", font=font("bold", 36), fill=WHITE)
            text_block(d, (1320, 380), "Broader, lower peak, larger area beyond Ea → greater rate, with increased collision frequency.", font("regular", 24), MUTED, 460)
        else:
            d.text((1320, 420), "Pause and decide.", font=font("semibold", 28), fill=MUTED)
        return img

    if kind == "myths2":
        heading(d, "Error detective", "Correct these before the examination")
        myths = [
            "Heating does not lower Ea for the same reaction.",
            "At higher T the peak is lower, not higher.",
            "Frequency and the E ≥ Ea proportion both change.",
            "Energy above Ea is not enough without orientation.",
        ]
        for i, text in enumerate(myths):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=GOLD)
            d.text((130, y + 42), text, font=font("semibold", 26), fill=WHITE)
        return img

    if kind == "exam2":
        heading(d, "Examination-style question", "Heated from 298 K to 318 K")
        items = [
            ("a", "(a) Kinetic energy and collision frequency.  [2]"),
            ("b", "(b) Why does the successful-collision proportion increase?  [2]"),
            ("c", "(c) How does the Maxwell–Boltzmann distribution change?  [3]"),
            ("d", "(d) Why does rate increase? Use collision theory.  [3]"),
        ]
        answers = {
            "a": "Average KE increases; particles move faster and collide more often.",
            "b": "Greater proportion have E ≥ Ea, so more collisions meet the energy test.",
            "c": "Broader curve, lower peak, larger area to the right of Ea.",
            "d": "Higher collision frequency and more sufficient-energy collisions. Orientation still required.",
        }
        for i, (key, prompt) in enumerate(items):
            y = 240 + i * 170
            card(d, (88, y, W - 88, y + 154), accent=TEAL)
            d.text((128, y + 18), prompt, font=font("semibold", 24), fill=WHITE)
            if vis(key):
                d.text((128, y + 78), answers[key], font=font("regular", 22), fill=GREEN)
        return img

    if kind == "recap2":
        heading(d, "Plenary: complete the model", "Temperature, distribution, rate")
        recap_cards(
            d,
            (88, 250, W - 88, 860),
            [
                ("Energy", "Higher T raises average KE and speed."),
                ("Graph", "Broader, lower peak, larger area beyond Ea."),
                ("Ea", "Temperature does not change Ea for the same reaction."),
            ],
            set(revealed),
            ["r1", "r2", "r3"],
        )
        return img

    if kind == "aims3":
        heading(d, "Learning outcomes", "A11.3  Catalysts and reaction rate")
        aims = [
            ("a1", "Define a catalyst accurately"),
            ("a2", "Use evidence to identify a catalyst"),
            ("a3", "Alternative pathway with lower Ea"),
            ("a4", "Read the catalyst effect on a Maxwell–Boltzmann graph"),
        ]
        for i, (key, text) in enumerate(aims):
            y = 250 + i * 140
            bullet_card(d, (88, y, W - 88, y + 120), f"Outcome {i + 1}", text, show=vis(key))
        return img

    if kind == "hook3":
        heading(d, "Faster, without heating", "Collision theory retrieval")
        maxwell_boltzmann(d, (88, 250, 1200, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=10, title="Energy distribution at one temperature")
        card(d, (1240, 250, 1830, 900), accent=TEAL)
        text_block(d, (1280, 320), "How can rate increase if temperature stays the same? One method is a catalyst.", font("semibold", 26), WHITE, 500)
        return img

    if kind == "defn":
        heading(d, "A11.3.1  Definition of a catalyst", "Both parts are required")
        card(d, (88, 250, 1830, 520), accent=GOLD)
        text_block(d, (128, 300), "A catalyst increases the rate of a chemical reaction without itself being permanently chemically changed.", font("semibold", 32), WHITE, 1640)
        card(d, (88, 560, 900, 860), accent=TEAL)
        text_block(d, (128, 610), "It may take part in the mechanism, but it is regenerated overall.", font("regular", 24), MUTED, 720)
        card(d, (940, 560, 1830, 860), accent=TEAL)
        text_block(d, (980, 610), "Increased rate and no permanent chemical change. Keep both.", font("regular", 24), MUTED, 800)
        return img

    if kind == "notmean":
        heading(d, "What a catalyst does not mean", "Reject the shortcuts")
        rows = [
            "It does not increase the amount of reactant present.",
            "It does not, by definition, raise the temperature.",
            "It is not simply ‘a substance that makes a reaction happen’.",
            "The key effect is a different, lower-Ea pathway.",
        ]
        for i, text in enumerate(rows):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=TEAL)
            d.text((130, y + 42), text, font=font("semibold", 26), fill=WHITE)
        return img

    if kind == "pathway":
        heading(d, "Alternative pathway, lower Ea", "Same temperature, different barrier")
        energy_profile(d, (88, 240, 1830, 900), catalysed=True, progress=1.0)
        return img

    if kind == "profile":
        heading(d, "Watch the energy profile", "Uncatalysed barrier, then catalysed")
        energy_profile(d, (88, 240, 1830, 900), catalysed=True, progress=1.0)
        return img

    if kind == "cat_link":
        heading(d, "Link to collision theory", "Lower threshold, more successful collisions")
        maxwell_boltzmann(d, (88, 240, 1200, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=11, extra_ea=6.4, shade_from=6.4, title="More particles clear the lower Ea")
        card(d, (1240, 240, 1830, 900), accent=TEAL)
        text_block(d, (1280, 300), "Orientation is still required. More successful collisions per unit time → increased rate.", font("semibold", 24), WHITE, 500)
        return img

    if kind == "evidence":
        heading(d, "Catalyst evidence", "Rate and recovery")
        card(d, (88, 250, 900, 560), accent=ORANGE)
        d.text((128, 300), "Without X", font=font("bold", 32), fill=WHITE)
        d.text((128, 380), "120 s to the endpoint", font=font("semibold", 30), fill=GOLD)
        card(d, (940, 250, 1830, 560), accent=TEAL)
        d.text((980, 300), "With X", font=font("bold", 32), fill=WHITE)
        d.text((980, 380), "45 s to the same endpoint", font=font("semibold", 30), fill=TEAL_BAR)
        card(d, (88, 600, 1830, 900), accent=GREEN if vis("ans") else TEAL)
        if vis("ans"):
            text_block(d, (128, 650), "X is recovered with no permanent chemical change. Both parts of the definition are satisfied — consistent with a catalyst.", font("semibold", 28), WHITE, 1640)
        else:
            text_block(d, (128, 680), "Rate evidence alone is not enough. Was X permanently changed?", font("regular", 28), MUTED, 1640)
        return img

    if kind == "vs":
        heading(d, "Catalyst versus temperature", "Two ways to raise the able-to-react proportion")
        maxwell_boltzmann(d, (88, 240, 920, 900), temps=[("lower T", 3.2, ORANGE), ("higher T", 5.4, TEAL_BAR)], ea=9.5, title="Temperature changes the curve")
        maxwell_boltzmann(d, (960, 240, 1830, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=11, extra_ea=6.4, title="Catalyst moves Ea, not the curve")
        return img

    if kind == "guided_cat":
        heading(d, "Guided application", "Ea 85 kJ mol⁻¹ → 52 kJ mol⁻¹, T unchanged")
        maxwell_boltzmann(d, (88, 240, 1200, 900), temps=[("fixed T", 4.2, TEAL_BAR)], ea=11, extra_ea=6.6, shade_from=6.6, title="52 kJ mol⁻¹ lies further left")
        card(d, (1240, 240, 1830, 900), accent=TEAL)
        if vis("ans"):
            text_block(d, (1280, 300), "Distribution unchanged. Catalysed pathway has the larger E ≥ Ea area. Rate increases.", font("semibold", 24), WHITE, 500)
        else:
            d.text((1280, 420), "Pause and decide.", font=font("semibold", 28), fill=MUTED)
        return img

    if kind == "myths3":
        heading(d, "Common misconceptions", "Keep the definition precise")
        myths = [
            "A catalyst does not give particles more energy.",
            "It does not lower the energy of every particle.",
            "It is not used up permanently.",
            "It does not work by changing temperature.",
        ]
        for i, text in enumerate(myths):
            y = 250 + i * 150
            card(d, (88, y, W - 88, y + 130), accent=GOLD)
            d.text((130, y + 42), text, font=font("semibold", 26), fill=WHITE)
        return img

    if kind == "exam3":
        heading(d, "Examination-style question", "Definition, pathway, graph, successful collisions")
        items = [
            ("a", "(a) Define a catalyst.  [2]"),
            ("b", "(b) How does a catalyst increase rate, in terms of Ea?  [2]"),
            ("c", "(c) Show catalysed and uncatalysed pathways on one MB graph.  [3]"),
            ("d", "(d) Why are more collisions successful?  [2]"),
        ]
        answers = {
            "a": "Increases rate (1) without permanent chemical change (1).",
            "b": "Alternative pathway (1) with lower activation energy (1).",
            "c": "Same distribution (1); lower Ea further left (1); larger area beyond it (1).",
            "d": "Greater proportion have E ≥ lower Ea, so more collisions meet the energy test.",
        }
        for i, (key, prompt) in enumerate(items):
            y = 240 + i * 170
            card(d, (88, y, W - 88, y + 154), accent=TEAL)
            d.text((128, y + 18), prompt, font=font("semibold", 24), fill=WHITE)
            if vis(key):
                d.text((128, y + 78), answers[key], font=font("regular", 22), fill=GREEN)
        return img

    if kind == "recap3":
        heading(d, "Plenary: complete the model", "Definition, pathway, graph")
        recap_cards(
            d,
            (88, 250, W - 88, 860),
            [
                ("Definition", "Faster rate, no permanent change."),
                ("Pathway", "Alternative route with lower Ea."),
                ("Graph", "Same curve; Ea moves left."),
            ],
            set(revealed),
            ["r1", "r2", "r3"],
        )
        return img

    a12 = render_a12(lesson, slide, revealed, t, img, d)
    if a12 is not None:
        return a12

    heading(d, lesson["title"], slide_id)
    return img
