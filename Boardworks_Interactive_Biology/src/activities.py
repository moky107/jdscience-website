"""Reusable interactive patterns for the reconstructed Boardworks lessons."""

from __future__ import annotations

from pptx.enum.text import PP_ALIGN
from pptx.util import Inches

from pptx_kit import (
    GREEN,
    GREEN_DARK,
    LIGHT_BLUE,
    LIGHT_GREEN,
    LIGHT_RED,
    NAVY,
    NAVY_TEXT,
    ORANGE,
    RED,
    YELLOW,
    YELLOW_EDGE,
    add_notes,
    add_picture,
    add_rect,
    add_textbox,
    set_shape_text,
)


def mcq(d, name, title, question, options, correct, nxt, why_right, why_wrong=None):
    """options: list[str]. correct: 0-based index. nxt: next visible slide name."""
    s = d.add(name, title)
    d.chrome(name)
    add_textbox(s, Inches(0.4), Inches(0.95), Inches(9.2), Inches(1.15), question, size=20, bold=True, color=NAVY)
    y = 2.2
    for i, text in enumerate(options):
        letter = chr(65 + i)
        tgt = f"{name}_c" if i == correct else f"{name}_w{i}"
        d.button(
            s,
            Inches(0.65),
            Inches(y),
            Inches(8.7),
            Inches(0.68),
            f"{letter}   {text}",
            fill=LIGHT_BLUE,
            text_color=NAVY,
            line=NAVY,
            size=15,
            target=tgt,
        )
        y += 0.82
    add_notes(s, f"Correct = {chr(65+correct)}. {why_right}")

    s = d.add(f"{name}_c", title, hidden=True)
    d.chrome(f"{name}_c", show_nav=False)
    box = add_rect(s, Inches(0.7), Inches(1.7), Inches(8.6), Inches(2.8), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
    set_shape_text(box, f"Correct.\n\n{why_right}", size=18, color=NAVY, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.5), Inches(5.0), Inches(3.0), Inches(0.45), "Continue", fill=GREEN, target=nxt)

    why_wrong = why_wrong or "Not quite. Read the question again and try another option."
    for i, text in enumerate(options):
        if i == correct:
            continue
        key = f"{name}_w{i}"
        s = d.add(key, title, hidden=True)
        d.chrome(key, show_nav=False)
        box = add_rect(s, Inches(0.7), Inches(1.7), Inches(8.6), Inches(2.5), LIGHT_RED, line=RED, rounded=True)
        set_shape_text(box, f"Not quite.\n\n{why_wrong}", size=18, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(4.8), Inches(3.0), Inches(0.45), "Try again", fill=ORANGE, target=name)


def true_false_board(d, name, title, heading, items, nxt):
    """items: list of (statement, is_true, explanation)."""
    s = d.add(name, title)
    d.chrome(name, activity=True)
    add_textbox(s, Inches(0.3), Inches(0.88), Inches(9.4), Inches(0.4), heading, size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    y = 1.35
    for i, (stmt, _truth, _exp) in enumerate(items, 1):
        box = add_rect(s, Inches(0.3), Inches(y), Inches(6.55), Inches(0.78), YELLOW, line=YELLOW_EDGE, rounded=True)
        set_shape_text(box, f"{i}.  {stmt}", size=13, color=NAVY, align=PP_ALIGN.LEFT)
        d.button(s, Inches(7.0), Inches(y + 0.16), Inches(1.15), Inches(0.48), "true", fill=GREEN, size=13, target=f"{name}_t{i}")
        d.button(s, Inches(8.25), Inches(y + 0.16), Inches(1.2), Inches(0.48), "false", fill=RED, size=13, target=f"{name}_f{i}")
        y += 0.88
    d.button(s, Inches(0.35), Inches(6.80), Inches(1.7), Inches(0.32), "Show all", fill=GREEN_DARK, size=12, target=f"{name}_ans")
    d.button(s, Inches(2.15), Inches(6.80), Inches(1.4), Inches(0.32), "Reset", fill=ORANGE, size=12, target=name)
    add_notes(s, "Click true or false for each statement. Show all reveals the key.")

    for i, (stmt, truth, exp) in enumerate(items, 1):
        for choice, flag in (("t", True), ("f", False)):
            key = f"{name}_{choice}{i}"
            s = d.add(key, title, hidden=True)
            d.chrome(key, show_nav=False)
            ok = choice == "t" and truth or choice == "f" and not truth
            fill = LIGHT_GREEN if ok else LIGHT_RED
            edge = GREEN_DARK if ok else RED
            verdict = "Correct" if ok else "Incorrect"
            box = add_rect(s, Inches(0.7), Inches(1.6), Inches(8.6), Inches(3.0), fill, line=edge, rounded=True)
            set_shape_text(
                box,
                f"{verdict}.  The statement is {'TRUE' if truth else 'FALSE'}.\n\n{stmt}\n\n{exp}",
                size=16,
                color=NAVY,
                align=PP_ALIGN.CENTER,
            )
            d.button(s, Inches(3.5), Inches(5.1), Inches(3.0), Inches(0.45), "Back to quiz", fill=GREEN, target=name)

    s = d.add(f"{name}_ans", title + " – answers", hidden=True)
    d.chrome(f"{name}_ans", show_nav=False)
    y = 0.95
    for i, (stmt, truth, exp) in enumerate(items, 1):
        add_textbox(
            s,
            Inches(0.4),
            Inches(y),
            Inches(9.2),
            Inches(0.95),
            f"{i}. {'TRUE' if truth else 'FALSE'}.  {stmt}  {exp}",
            size=13,
            color=NAVY,
        )
        y += 1.0
    d.button(s, Inches(2.4), Inches(6.4), Inches(2.4), Inches(0.4), "Back to quiz", fill=GREEN, target=name)
    d.button(s, Inches(5.1), Inches(6.4), Inches(2.4), Inches(0.4), "Continue", fill=GREEN_DARK, target=nxt)


def stepper(d, prefix, title, steps, nxt, notes="Step through with Next step, or Reset to the start."):
    """steps: list of dicts with keys caption, body, image (optional path)."""
    n = len(steps)
    for i, step in enumerate(steps):
        name = f"{prefix}_{i}"
        s = d.add(name, title)
        d.chrome(name, activity=True)
        add_textbox(
            s,
            Inches(0.35),
            Inches(0.88),
            Inches(7.4),
            Inches(0.38),
            f"Step {i + 1} of {n}:  {step['caption']}",
            size=16,
            bold=True,
            color=NAVY,
        )
        img = step.get("image")
        if img:
            add_picture(s, img, Inches(0.3), Inches(1.28), width=Inches(5.5))
            d.info_box(s, Inches(5.95), Inches(1.28), Inches(3.65), Inches(4.35), step["body"], size=14)
        else:
            d.info_box(s, Inches(0.4), Inches(1.4), Inches(9.2), Inches(4.2), step["body"], size=18)
        if i > 0:
            d.button(s, Inches(0.35), Inches(6.80), Inches(1.5), Inches(0.32), "Previous", fill=NAVY, size=12, target=f"{prefix}_{i-1}")
        d.button(s, Inches(2.0), Inches(6.80), Inches(1.35), Inches(0.32), "Reset", fill=ORANGE, size=12, target=f"{prefix}_0")
        if i < n - 1:
            d.button(s, Inches(3.5), Inches(6.80), Inches(1.7), Inches(0.32), "Next step", fill=GREEN, size=12, target=f"{prefix}_{i+1}")
        else:
            d.button(s, Inches(3.5), Inches(6.80), Inches(1.7), Inches(0.32), "Continue", fill=GREEN, size=12, target=nxt)
        add_notes(s, notes)
    return f"{prefix}_0"
