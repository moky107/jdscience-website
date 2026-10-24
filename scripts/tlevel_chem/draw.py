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
from tlevel_chem.diagrams import collision_frame, energy_bar
from tlevel_chem.lessons import LESSONS


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
        heading(d, "A11.1  Principles of Collision Theory", "Rates of reaction and energy changes")
        d.text((88, 320), "T-Level Science  ·  Chemistry", font=font("semibold", 28), fill=TEAL_BAR)
        d.text((88, 390), "Activation energy  ·  successful collisions  ·  spatial orientation", font=font("regular", 26), fill=MUTED)
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

    heading(d, lesson["title"], slide_id)
    return img
