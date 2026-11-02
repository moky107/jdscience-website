#!/usr/bin/env python3
"""Part 1 – Organisation of the nervous system. Macro-free .pptx."""

from __future__ import annotations

import os
import sys

from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

sys.path.insert(0, os.path.dirname(__file__))
from diagrams import OUT as DIAG, generate_all
from pptx_kit import (
    GREEN,
    GREEN_DARK,
    GREEN_SOFT,
    GREY,
    LIGHT_BLUE,
    LIGHT_GREEN,
    LIGHT_RED,
    NAVY,
    NAVY_TEXT,
    ORANGE,
    PURPLE,
    RED,
    WHITE,
    YELLOW,
    YELLOW_EDGE,
    Deck,
    add_notes,
    add_picture,
    add_rect,
    add_rich_textbox,
    add_textbox,
    hyperlink_to_slide,
    set_shape_text,
    title_slide,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def P(name):
    return os.path.join(DIAG, name)


def build(out_path=None, deck=None):
    own = deck is None
    if own and not os.path.exists(P("neurone_structure.png")):
        generate_all()

    d = deck or Deck("Organisation")
    title_slide(
        d,
        "title",
        "The Nervous System",
        "Part 1: Organisation",
        "Interactive reconstruction  ·  Flash-free  ·  Original course © Boardworks Ltd 2009",
    )
    add_picture(d.s("title"), P("title_retina.png"), Inches(2.7), Inches(2.05), height=Inches(3.95))
    add_notes(
        d.s("title"),
        "Title slide. Click the green arrow on later slides, or press the on-slide buttons. "
        "Original Boardworks Flash activities could not be executed; this file rebuilds them with hyperlinks.",
    )

    # How to use
    s = d.add("how", "How to use this presentation")
    d.chrome("how")
    d.info_box(
        s,
        Inches(0.35),
        Inches(0.95),
        Inches(9.3),
        Inches(1.35),
        "This is a reconstructed classroom presentation. Original 2009 Boardworks activities used Adobe Flash, "
        "which no longer runs. Every activity below uses native PowerPoint hyperlinks (no macros, no Flash).",
        size=15,
    )
    tips = [
        ("Next / Back arrows", "Move through the teaching sequence."),
        ("Green buttons", "Reveal answers, open an activity, or jump to a labelled structure."),
        ("Reset", "Returns an activity to its starting slide so you can reuse it in the same lesson."),
        ("Check / Show answers", "Teacher-controlled reveal. Hidden slides are skipped if you just press Space."),
        ("Slide Show mode", "Start the slide show (F5). Buttons only jump while the show is running."),
    ]
    y = 2.45
    for title, body in tips:
        chip = d.label_chip(s, Inches(0.4), Inches(y), Inches(2.5), Inches(0.62), title, size=12)
        add_textbox(s, Inches(3.05), Inches(y), Inches(6.5), Inches(0.62), body, size=14)
        y += 0.72
    add_notes(s, "Demonstrate Slide Show mode. Buttons do not jump in Normal (edit) view.")

    # Learning outcomes
    s = d.add("outcomes", "Learning outcomes")
    d.chrome("outcomes")
    add_textbox(s, Inches(0.45), Inches(1.0), Inches(9), Inches(0.4), "By the end of this lesson you should be able to:", size=16, color=NAVY)
    outcomes = [
        "Describe the organisation of the human nervous system (CNS and PNS, including somatic and autonomic divisions).",
        "Label the main parts of a neurone and state the function of each part.",
        "Compare sensory, relay and motor neurones in terms of structure and direction of impulse.",
        "Explain how myelination and nodes of Ranvier relate to neurone function.",
        "Link organisation of the nervous system to clinical work in neurology.",
    ]
    y = 1.5
    for i, t in enumerate(outcomes, 1):
        n = d.label_chip(s, Inches(0.45), Inches(y), Inches(0.5), Inches(0.55), str(i), fill=GREEN, edge=GREEN_DARK, size=16)
        set_shape_text(n, str(i), size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        box = add_rect(s, Inches(1.1), Inches(y), Inches(8.4), Inches(0.55), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
        set_shape_text(box, t, size=14, color=NAVY_TEXT, align=PP_ALIGN.LEFT)
        y += 0.72

    # Contents
    s = d.add("contents", "Contents")
    d.chrome("contents")
    items = [
        ("the human nervous system", "content"),
        ("organisation explorer (click to reveal)", "org0"),
        ("neurone structure – click the labels", "neurone_lab"),
        ("types of neurone", "types"),
        ("matching activity", "match"),
        ("knowledge check", "mcq1"),
        ("scientist case study", "case"),
        ("plenary", "plenary"),
    ]
    y = 1.05
    for i, (label, target) in enumerate(items, 1):
        b = d.button(s, Inches(1.6), Inches(y), Inches(6.8), Inches(0.58), f"{i}.  {label}", fill=GREEN if i % 2 else GREEN_DARK, size=16, target=target)
        y += 0.68
    add_notes(s, "Menu for jumping around the lesson. Useful when reusing activities.")

    # Content: human NS
    s = d.add("content", "The human nervous system")
    d.chrome("content")
    add_rich_textbox(
        s,
        Inches(0.4),
        Inches(1.0),
        Inches(5.3),
        Inches(5.0),
        [
            ("The ", 20, False, NAVY_TEXT),
            ("nervous system", 20, True, GREEN),
            (" is a highly organized system of nervous tissue that detects, relays and co-ordinates information about an organism’s internal and external environment.\n\n", 20, False, NAVY_TEXT),
            ("All nervous systems contain nerve cells, called ", 20, False, NAVY_TEXT),
            ("neurones", 20, True, GREEN),
            (", which convey information in the form of nerve impulses. They can produce a rapid, localized response.", 20, False, NAVY_TEXT),
        ],
    )
    add_picture(s, P("title_retina.png"), Inches(5.7), Inches(1.15), height=Inches(4.6))
    add_notes(s, "Original static teaching slide – scientific wording retained. Diagram is a new 2D reconstruction of retinal circuitry (rods, cones, bipolar and ganglion cells), which appears throughout the series.")

    # Organisation explorer
    org_copy = {
        0: "Each part of the nervous system performs a different function.\n\nPress the red button, then each new button, to reveal how the nervous system is organized.",
        1: "The nervous system is divided into the CNS and the PNS.\n\nPress CNS and PNS to see what each contains.",
        2: "The CNS is the brain and spinal cord.\n\nPress PNS to see its divisions.",
        3: "The PNS is every nerve outside the CNS. It has somatic and autonomic divisions.\n\nPress autonomic to split it further.",
        4: "The autonomic nervous system has sympathetic (‘fight or flight’) and parasympathetic (‘rest and digest’) branches.",
    }
    for level in range(5):
        name = f"org{level}"
        s = d.add(name, "How is the nervous system organized?")
        d.chrome(name, activity=True)
        add_textbox(s, Inches(0.4), Inches(0.9), Inches(9.2), Inches(0.4),
                    "Organization of the nervous system", size=20, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        d.info_box(s, Inches(0.3), Inches(1.3), Inches(3.15), Inches(2.35), org_copy[level], size=13)
        add_picture(s, P(f"org_{level}.png"), Inches(3.45), Inches(1.28), width=Inches(6.2))
        # Action buttons sit under the tree so they do not cover the diagram.
        ay = 5.35
        if level == 0:
            d.button(s, Inches(4.4), Inches(ay), Inches(3.4), Inches(0.42), "Reveal CNS and PNS", fill=RED, size=13, target="org1")
        elif level == 1:
            d.button(s, Inches(3.6), Inches(ay), Inches(2.5), Inches(0.42), "Reveal CNS parts", fill=GREEN, size=12, target="org2")
            d.button(s, Inches(6.25), Inches(ay), Inches(2.5), Inches(0.42), "Reveal PNS parts", fill=NAVY, size=12, target="org3")
        elif level == 2:
            d.button(s, Inches(4.4), Inches(ay), Inches(3.4), Inches(0.42), "Reveal PNS parts", fill=NAVY, size=13, target="org3")
        elif level == 3:
            d.button(s, Inches(4.0), Inches(ay), Inches(4.0), Inches(0.42), "Reveal autonomic branches", fill=ORANGE, size=13, target="org4")
        d.button(s, Inches(0.35), Inches(6.80), Inches(1.35), Inches(0.32), "Reset", fill=ORANGE, size=12, target="org0")
        d.button(s, Inches(1.8), Inches(6.80), Inches(1.7), Inches(0.32), "Show all", fill=GREEN_DARK, size=12, target="org4")
        d.button(s, Inches(3.6), Inches(6.80), Inches(1.7), Inches(0.32), "Functions", fill=PURPLE, size=12, target="org_fn")
        add_notes(s, "Rebuilt Flash click-to-reveal tree. Each button jumps to the next reveal level. Reset returns to the start.")

    s = d.add("org_fn", "Functions of each division", hidden=True)
    d.chrome("org_fn", show_nav=False)
    rows = [
        ("CNS – brain", "Processes sensory information, initiates motor output, higher functions (memory, language, coordination)."),
        ("CNS – spinal cord", "Carries impulses between brain and PNS; is the integrating centre for many reflex arcs."),
        ("Somatic PNS", "Sensory neurones from skin, muscles and joints; motor neurones to skeletal muscle (mostly voluntary)."),
        ("Autonomic PNS", "Controls glands, smooth muscle and cardiac muscle (involuntary)."),
        ("Sympathetic", "Increases heart rate, dilates bronchioles, diverts blood to muscle – ‘fight or flight’."),
        ("Parasympathetic", "Slows heart rate, stimulates digestion – ‘rest and digest’. Antagonistic to sympathetic."),
    ]
    y = 0.95
    for title, body in rows:
        d.label_chip(s, Inches(0.35), Inches(y), Inches(2.5), Inches(0.78), title, fill=GREEN_SOFT, size=12)
        box = add_rect(s, Inches(3.0), Inches(y), Inches(6.6), Inches(0.78), YELLOW, line=YELLOW_EDGE, rounded=True)
        set_shape_text(box, body, size=13, color=NAVY_TEXT, align=PP_ALIGN.LEFT)
        y += 0.88
    d.button(s, Inches(3.6), Inches(6.55), Inches(2.6), Inches(0.4), "Back to explorer", fill=GREEN, target="org4")

    # Neurone intro + labelling
    s = d.add("neurone_lab", "General structure of a neurone")
    d.chrome("neurone_lab", activity=True)
    add_textbox(s, Inches(0.35), Inches(0.88), Inches(9.3), Inches(0.38),
                "What is the structure of a neurone?", size=20, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    add_picture(s, P("neurone_structure.png"), Inches(0.2), Inches(1.25), width=Inches(9.5))
    labels = [
        ("cell body", 2.15, 1.35, "n_cellbody"),
        ("dendrites", 0.45, 3.55, "n_dendrites"),
        ("myelin sheath", 4.35, 3.55, "n_myelin"),
        ("axon", 4.55, 1.35, "n_axon"),
        ("node of Ranvier", 6.55, 1.35, "n_node"),
        ("nucleus of Schwann cell", 6.7, 3.55, "n_schwann"),
    ]
    for text, x, y, tgt in labels:
        d.label_chip(s, Inches(x), Inches(y), Inches(2.35), Inches(0.42), text + " ▶", target=tgt, size=12)
    d.info_box(
        s,
        Inches(0.35),
        Inches(5.55),
        Inches(9.3),
        Inches(1.1),
        "Neurones are specialized cells that convey information in the form of nerve impulses. "
        "Press on the labels to find out more about each part of the neurone.",
        size=15,
    )
    d.button(s, Inches(7.9), Inches(6.80), Inches(1.7), Inches(0.32), "Reset", fill=ORANGE, size=12, target="neurone_lab")
    add_notes(s, "Rebuilt Flash labelling activity. Each label opens a hidden explanation slide, then Back returns here.")

    explanations = {
        "n_cellbody": (
            "Cell body",
            "The cell body (soma) contains the nucleus and organelles. It is the metabolic centre of the neurone and manufactures proteins and neurotransmitters. In motor neurones it lies in the CNS; in sensory neurones it lies in a ganglion just outside the CNS.",
        ),
        "n_dendrites": (
            "Dendrites",
            "Dendrites are highly branched cytoplasmic extensions. They receive impulses from other neurones (or from a receptor) and carry them towards the cell body. More branches mean a larger surface area for synapses.",
        ),
        "n_axon": (
            "Axon",
            "The axon is a long, single fibre that carries the nerve impulse away from the cell body towards the synaptic terminals. Motor axons may be more than a metre long. The axoplasm is surrounded by the axon membrane, where the action potential is generated.",
        ),
        "n_myelin": (
            "Myelin sheath",
            "A thick insulating layer of fatty material (myelin) wrapped around the axon by Schwann cells in the PNS (oligodendrocytes in the CNS). It prevents ion leakage and greatly increases conduction speed.",
        ),
        "n_node": (
            "Node of Ranvier",
            "A gap in the myelin sheath where the axon membrane is exposed. Voltage-gated ion channels are concentrated here. The action potential ‘jumps’ from node to node – saltatory conduction.",
        ),
        "n_schwann": (
            "Schwann cell",
            "A glial cell that wraps around a PNS axon, forming the myelin sheath. The nucleus of the Schwann cell sits in the outermost layer of the wrap. One Schwann cell myelinates one internodal segment of one axon.",
        ),
    }
    for key, (title, body) in explanations.items():
        s = d.add(key, "General structure of a neurone", hidden=True)
        d.chrome(key, show_nav=False)
        add_picture(s, P("neurone_structure.png"), Inches(0.25), Inches(1.0), width=Inches(9.4))
        d.label_chip(s, Inches(3.3), Inches(0.88), Inches(3.4), Inches(0.4), title, fill=GREEN, edge=GREEN_DARK, size=14)
        set_shape_text(d.s(key).shapes[-1] if False else d.label_chip(s, Inches(0.4), Inches(4.85), Inches(2.2), Inches(0.4), title, fill=GREEN, size=13), title, size=13, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        d.info_box(s, Inches(0.35), Inches(5.3), Inches(9.3), Inches(1.25), body, size=15)
        d.button(s, Inches(3.7), Inches(6.62), Inches(2.5), Inches(0.38), "Back to diagram", fill=GREEN, target="neurone_lab")

    # Types of neurone
    s = d.add("types", "Types of neurone")
    d.chrome("types")
    add_textbox(s, Inches(0.4), Inches(0.88), Inches(9), Inches(0.35),
                "There are several different types of neurone:", size=18, color=NAVY)
    # three rows
    rows = [
        ("sensory\nneurones:", "receptor organs", "CNS", P("sensory_neurone.png"), "t_sensory"),
        ("relay\nneurones:", "sensory neurones", "motor neurones", P("relay_neurone.png"), "t_relay"),
        ("motor\nneurones:", "CNS", "effectors", P("motor_neurone.png"), "t_motor"),
    ]
    y = 1.28
    for left, from_l, to_l, img, tgt in rows:
        add_textbox(s, Inches(0.25), Inches(y), Inches(1.55), Inches(0.9), left, size=14, bold=True, color=GREEN)
        add_textbox(s, Inches(1.7), Inches(y + 0.25), Inches(1.55), Inches(0.5), from_l, size=12, bold=True, color=NAVY, align=PP_ALIGN.RIGHT)
        add_picture(s, img, Inches(3.25), Inches(y - 0.05), width=Inches(4.55))
        add_textbox(s, Inches(7.85), Inches(y + 0.25), Inches(1.35), Inches(0.5), to_l, size=12, bold=True, color=NAVY)
        d.button(s, Inches(8.85), Inches(y + 0.28), Inches(0.9), Inches(0.36), "info", fill=ORANGE, size=11, target=tgt)
        y += 1.55
    add_notes(s, "Original comparison diagrams rebuilt. Info buttons open function cards.")

    type_info = {
        "t_sensory": (
            "Sensory neurone",
            "Carries impulses from a receptor towards the CNS. The cell body is in a dorsal root ganglion, off to the side of the axon. There is a long dendron and a shorter axon. Many sensory neurones are myelinated.",
        ),
        "t_relay": (
            "Relay (intermediate) neurone",
            "Found entirely within the CNS. Connects sensory neurones to motor neurones and to other relay neurones, allowing integration and coordination. Typically short, with many synapses. Also called an interneurone.",
        ),
        "t_motor": (
            "Motor neurone",
            "Carries impulses from the CNS to an effector (muscle or gland). The cell body is in the CNS (grey matter of spinal cord or brain) with many dendrites. A long myelinated axon runs out through the PNS to the effector.",
        ),
    }
    for key, (title, body) in type_info.items():
        s = d.add(key, "Types of neurone", hidden=True)
        d.chrome(key, show_nav=False)
        d.info_box(s, Inches(0.7), Inches(1.5), Inches(8.6), Inches(3.2), f"{title}\n\n{body}", size=18)
        d.button(s, Inches(3.7), Inches(5.2), Inches(2.5), Inches(0.45), "Back", fill=GREEN, target="types")

    # Comparison table reveal
    s = d.add("compare", "Comparing neurone types")
    d.chrome("compare")
    add_textbox(s, Inches(0.4), Inches(0.9), Inches(9), Inches(0.4),
                "Click a heading to reveal the comparison. Use Show all before moving on.", size=14, color=NAVY)
    headers = ["Feature", "Sensory", "Relay", "Motor"]
    xs = [0.35, 2.55, 4.85, 7.15]
    for x, h in zip(xs, headers):
        chip = d.label_chip(s, Inches(x), Inches(1.4), Inches(2.2), Inches(0.45), h, fill=GREEN, edge=GREEN_DARK, size=13)
        set_shape_text(chip, h, size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.5), Inches(3.2), Inches(3.0), Inches(0.5), "Show comparison table", fill=GREEN, size=16, target="compare_all")
    add_notes(s, "Reveal table is a hidden slide so Space will skip it during a straight run-through.")

    s = d.add("compare_all", "Comparing neurone types", hidden=True)
    d.chrome("compare_all", show_nav=False)
    table = [
        ("Direction of impulse", "Receptor → CNS", "CNS → CNS", "CNS → effector"),
        ("Cell body position", "Dorsal root ganglion", "Entirely in CNS", "In CNS (grey matter)"),
        ("Relative axon length", "Short axon, long dendron", "Short", "Long axon"),
        ("Myelin", "Usually myelinated", "Often unmyelinated", "Usually myelinated"),
    ]
    y = 1.0
    hdrs = ["Feature", "Sensory", "Relay", "Motor"]
    for i, h in enumerate(hdrs):
        b = add_rect(s, Inches(0.3 + i * 2.4), Inches(y), Inches(2.3), Inches(0.45), GREEN_DARK, rounded=True)
        set_shape_text(b, h, size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    y = 1.55
    for i, row in enumerate(table):
        fill = LIGHT_GREEN if i % 2 == 0 else LIGHT_BLUE
        for j, cell in enumerate(row):
            b = add_rect(s, Inches(0.3 + j * 2.4), Inches(y), Inches(2.3), Inches(0.85), fill, rounded=True)
            set_shape_text(b, cell, size=12, color=NAVY, align=PP_ALIGN.CENTER)
        y += 0.95
    d.button(s, Inches(3.7), Inches(6.4), Inches(2.5), Inches(0.4), "Back", fill=GREEN, target="compare")

    # Matching
    s = d.add("match", "Neurone structure")
    d.chrome("match", activity=True)
    add_textbox(s, Inches(0.3), Inches(0.88), Inches(9.4), Inches(0.4),
                "Match the parts of the neurone to the definitions", size=20, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    terms = [
        ("node of Ranvier", "m_node"),
        ("axon", "m_axon"),
        ("myelin sheath", "m_myelin"),
        ("Schwann cell", "m_schwann"),
        ("dendrites", "m_dend"),
    ]
    defs = [
        "a long single fibre that carries nerve impulses",
        "a thick insulating layer around the axon",
        "gap in the myelin sheath where the axon is exposed",
        "highly branched fibres that conduct impulses",
        "a cell wrapped around the axon, forming the myelin sheath",
    ]
    y = 1.4
    for (term, tgt), definition in zip(terms, defs):
        d.button(s, Inches(0.35), Inches(y), Inches(2.7), Inches(0.72), term, fill=YELLOW, text_color=NAVY, line=GREEN_DARK, size=13, target=tgt)
        box = add_rect(s, Inches(3.2), Inches(y), Inches(6.3), Inches(0.72), YELLOW, line=GREEN_DARK, rounded=True)
        set_shape_text(box, definition, size=14, color=NAVY, align=PP_ALIGN.CENTER)
        y += 0.85
    d.button(s, Inches(0.35), Inches(6.80), Inches(1.7), Inches(0.32), "Check", fill=GREEN, size=12, target="match_ans")
    d.button(s, Inches(2.15), Inches(6.80), Inches(1.5), Inches(0.32), "Reset", fill=ORANGE, size=12, target="match")
    add_notes(
        s,
        "Rebuilt Flash matching activity. Definitions are shuffled (original order). "
        "Click a term to highlight its match, or Check to show the full key. "
        "Correct pairs: node of Ranvier = gap in myelin; axon = long single fibre; myelin sheath = insulating layer; "
        "Schwann cell = cell wrapped around axon; dendrites = highly branched fibres.",
    )

    pair_text = {
        "m_node": ("node of Ranvier", "gap in the myelin sheath where the axon is exposed"),
        "m_axon": ("axon", "a long single fibre that carries nerve impulses"),
        "m_myelin": ("myelin sheath", "a thick insulating layer around the axon"),
        "m_schwann": ("Schwann cell", "a cell wrapped around the axon, forming the myelin sheath"),
        "m_dend": ("dendrites", "highly branched fibres that conduct impulses"),
    }
    for key, (term, definition) in pair_text.items():
        s = d.add(key, "Neurone structure", hidden=True)
        d.chrome(key, show_nav=False)
        add_textbox(s, Inches(0.5), Inches(1.3), Inches(9), Inches(0.5), "Matched pair", size=20, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
        d.label_chip(s, Inches(1.5), Inches(2.2), Inches(7.0), Inches(0.8), term, fill=GREEN_SOFT, size=20)
        d.label_chip(s, Inches(1.5), Inches(3.3), Inches(7.0), Inches(1.1), definition, fill=YELLOW, size=18)
        d.button(s, Inches(3.5), Inches(5.0), Inches(3.0), Inches(0.45), "Back to matching", fill=GREEN, target="match")

    s = d.add("match_ans", "Neurone structure – answers", hidden=True)
    d.chrome("match_ans", show_nav=False)
    add_textbox(s, Inches(0.3), Inches(0.9), Inches(9.4), Inches(0.4), "Answer key", size=20, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    answers = [
        ("node of Ranvier", "gap in the myelin sheath where the axon is exposed"),
        ("axon", "a long single fibre that carries nerve impulses"),
        ("myelin sheath", "a thick insulating layer around the axon"),
        ("Schwann cell", "a cell wrapped around the axon, forming the myelin sheath"),
        ("dendrites", "highly branched fibres that conduct impulses"),
    ]
    y = 1.4
    for term, definition in answers:
        d.label_chip(s, Inches(0.35), Inches(y), Inches(2.7), Inches(0.7), term, fill=GREEN_SOFT, size=13)
        box = add_rect(s, Inches(3.2), Inches(y), Inches(6.3), Inches(0.7), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
        set_shape_text(box, definition, size=14, color=NAVY, align=PP_ALIGN.CENTER)
        y += 0.82
    d.button(s, Inches(3.5), Inches(6.5), Inches(3.0), Inches(0.4), "Back to matching", fill=GREEN, target="match")

    # MCQ 1
    s = d.add("mcq1", "Knowledge check 1")
    d.chrome("mcq1")
    add_textbox(s, Inches(0.4), Inches(0.95), Inches(9.2), Inches(1.1),
                "Which statement about relay neurones is correct?", size=20, bold=True, color=NAVY)
    opts = [
        ("A", "They carry impulses from receptors directly to effectors.", "mcq1w"),
        ("B", "They are found entirely in the CNS and connect other neurones.", "mcq1c"),
        ("C", "Their cell bodies always lie in a dorsal root ganglion.", "mcq1w2"),
        ("D", "They are the only myelinated neurones in the nervous system.", "mcq1w3"),
    ]
    y = 2.2
    for letter, text, tgt in opts:
        d.button(s, Inches(0.7), Inches(y), Inches(8.5), Inches(0.7), f"{letter}   {text}", fill=LIGHT_BLUE, text_color=NAVY, line=NAVY, size=15, target=tgt)
        y += 0.85
    add_notes(s, "Correct = B.")

    s = d.add("mcq1c", "Knowledge check 1", hidden=True)
    d.chrome("mcq1c", show_nav=False)
    box = add_rect(s, Inches(0.8), Inches(1.8), Inches(8.4), Inches(2.6), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
    set_shape_text(box, "Correct.\n\nRelay (intermediate) neurones lie entirely in the CNS and synapse with sensory and motor neurones, allowing integration.", size=18, color=NAVY, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.5), Inches(5.0), Inches(3.0), Inches(0.45), "Continue", fill=GREEN, target="mcq2")

    for key in ("mcq1w", "mcq1w2", "mcq1w3"):
        s = d.add(key, "Knowledge check 1", hidden=True)
        d.chrome(key, show_nav=False)
        box = add_rect(s, Inches(0.8), Inches(1.8), Inches(8.4), Inches(2.4), LIGHT_RED, line=RED, rounded=True)
        set_shape_text(box, "Not quite.\n\nThink about where a relay neurone is found, and what it connects. Try again.", size=18, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(4.8), Inches(3.0), Inches(0.45), "Try again", fill=ORANGE, target="mcq1")

    s = d.add("mcq2", "Knowledge check 2")
    d.chrome("mcq2")
    add_textbox(s, Inches(0.4), Inches(0.95), Inches(9.2), Inches(1.2),
                "The nodes of Ranvier are:", size=20, bold=True, color=NAVY)
    opts = [
        ("A", "the nuclei of Schwann cells", "mcq2w"),
        ("B", "synapses between sensory and motor neurones", "mcq2w2"),
        ("C", "gaps in the myelin sheath where the axon is exposed", "mcq2c"),
        ("D", "the cell bodies of sensory neurones", "mcq2w3"),
    ]
    y = 2.3
    for letter, text, tgt in opts:
        d.button(s, Inches(0.7), Inches(y), Inches(8.5), Inches(0.7), f"{letter}   {text}", fill=LIGHT_BLUE, text_color=NAVY, line=NAVY, size=15, target=tgt)
        y += 0.85

    s = d.add("mcq2c", "Knowledge check 2", hidden=True)
    d.chrome("mcq2c", show_nav=False)
    box = add_rect(s, Inches(0.8), Inches(1.8), Inches(8.4), Inches(2.4), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
    set_shape_text(box, "Correct.\n\nNodes of Ranvier are unmyelinated gaps. They allow saltatory conduction.", size=18, color=NAVY, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.5), Inches(4.9), Inches(3.0), Inches(0.45), "Continue", fill=GREEN, target="case")

    for key in ("mcq2w", "mcq2w2", "mcq2w3"):
        s = d.add(key, "Knowledge check 2", hidden=True)
        d.chrome(key, show_nav=False)
        box = add_rect(s, Inches(0.8), Inches(1.8), Inches(8.4), Inches(2.2), LIGHT_RED, line=RED, rounded=True)
        set_shape_text(box, "Not quite.\n\nLook back at the labelled neurone. Try again.", size=18, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(4.7), Inches(3.0), Inches(0.45), "Try again", fill=ORANGE, target="mcq2")

    # Case study – original Flash interview unrecovered; reconstructed from public professional context
    s = d.add("case", "Scientist case study")
    d.chrome("case")
    add_textbox(s, Inches(0.4), Inches(0.9), Inches(9.2), Inches(0.45),
                "Scientists in the real world: the neurologist", size=20, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    d.info_box(
        s,
        Inches(0.4),
        Inches(1.45),
        Inches(9.2),
        Inches(1.7),
        "The original Boardworks activity was a Flash interview with Dr Kevin Talbot, then Reader in Clinical Neurology at Oxford University, with a drop-down question menu. "
        "The interview recording cannot be recovered from the flattened export. The questions below keep the same classroom purpose: linking organisation of the nervous system to clinical neurology.",
        size=14,
    )
    qs = [
        ("What does a neurologist do?", "case_q1"),
        ("How does motor neurone disease relate to this topic?", "case_q2"),
        ("Why does organisation of the nervous system matter in diagnosis?", "case_q3"),
        ("What skills do clinical neurologists use?", "case_q4"),
    ]
    y = 3.35
    for label, tgt in qs:
        d.button(s, Inches(1.5), Inches(y), Inches(7.0), Inches(0.55), label, fill=GREEN, size=15, target=tgt)
        y += 0.65
    add_notes(s, "Original Flash dropdown and photograph were not recoverable and are not copied. Reconstructed Q&A for classroom use.")

    answers = {
        "case_q1": "A neurologist is a doctor who diagnoses and treats disorders of the brain, spinal cord and peripheral nerves. They use knowledge of how the nervous system is organised to work out where a lesion is – CNS or PNS, sensory or motor, somatic or autonomic.",
        "case_q2": "Motor neurone disease (MND / ALS) destroys motor neurones in the CNS. Signals no longer reach skeletal muscle, so muscles weaken and waste. Sensory neurones are typically spared, which is why the organisation into sensory, relay and motor pathways is clinically important.",
        "case_q3": "Symptoms follow the wiring. A problem in a spinal motor neurone affects effectors supplied by that segment. A brain lesion may affect many pathways. Distinguishing upper from lower motor neurone signs, and CNS from PNS, depends on this map of organisation.",
        "case_q4": "History taking, neurological examination (tone, power, reflexes, sensation, coordination), and linking signs to named pathways. Research neurologists also study how neurones live, die and might be protected – building on the cell biology of the neurone you have just labelled.",
    }
    for key, body in answers.items():
        s = d.add(key, "Scientist case study", hidden=True)
        d.chrome(key, show_nav=False)
        d.info_box(s, Inches(0.7), Inches(1.5), Inches(8.6), Inches(3.5), body, size=17)
        d.button(s, Inches(3.5), Inches(5.4), Inches(3.0), Inches(0.45), "Back to questions", fill=GREEN, target="case")

    # Plenary
    s = d.add("plenary", "Plenary")
    d.chrome("plenary")
    add_textbox(s, Inches(0.4), Inches(0.95), Inches(9.2), Inches(0.4),
                "True or false? Click a statement, then decide.", size=18, bold=True, color=NAVY)
    items = [
        ("Sensory neurones carry impulses from the CNS to effectors.", "pl1"),
        ("The sympathetic and parasympathetic systems are both autonomic.", "pl2"),
        ("Myelin is produced by Schwann cells in the PNS.", "pl3"),
        ("Relay neurones have their cell bodies in the dorsal root ganglion.", "pl4"),
    ]
    y = 1.5
    for text, tgt in items:
        d.button(s, Inches(0.55), Inches(y), Inches(8.9), Inches(0.7), text, fill=YELLOW, text_color=NAVY, line=GREEN_DARK, size=15, target=tgt)
        y += 0.85
    d.button(s, Inches(3.3), Inches(5.2), Inches(3.4), Inches(0.45), "Show all answers", fill=GREEN_DARK, target="plenary_ans")

    plenary_detail = {
        "pl1": ("False", "Sensory neurones carry impulses from receptors to the CNS. Motor neurones run from the CNS to effectors."),
        "pl2": ("True", "Both are divisions of the autonomic (involuntary) nervous system and usually act antagonistically."),
        "pl3": ("True", "In the PNS, Schwann cells wrap the axon. In the CNS the equivalent cells are oligodendrocytes."),
        "pl4": ("False", "Dorsal root ganglia contain sensory neurone cell bodies. Relay neurone cell bodies are in the CNS."),
    }
    for key, (verdict, body) in plenary_detail.items():
        s = d.add(key, "Plenary", hidden=True)
        d.chrome(key, show_nav=False)
        fill = LIGHT_GREEN if verdict == "True" else LIGHT_RED
        edge = GREEN_DARK if verdict == "True" else RED
        box = add_rect(s, Inches(0.8), Inches(1.7), Inches(8.4), Inches(2.8), fill, line=edge, rounded=True)
        set_shape_text(box, f"{verdict}\n\n{body}", size=18, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(5.0), Inches(3.0), Inches(0.45), "Back", fill=GREEN, target="plenary")

    s = d.add("plenary_ans", "Plenary – answers", hidden=True)
    d.chrome("plenary_ans", show_nav=False)
    y = 1.1
    for (text, tgt), (verdict, body) in zip(items, plenary_detail.values()):
        add_textbox(s, Inches(0.4), Inches(y), Inches(9.2), Inches(0.9), f"{verdict}.  {text}  {body}", size=13, color=NAVY)
        y += 1.0
    d.button(s, Inches(3.5), Inches(6.3), Inches(3.0), Inches(0.4), "Back", fill=GREEN, target="plenary")

    s = d.add("end", "End of Part 1")
    d.chrome("end")
    add_textbox(s, Inches(0.5), Inches(1.8), Inches(9), Inches(1.2),
                "Next: Part 2 – The nerve impulse", size=26, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(0.8), Inches(3.1), Inches(8.4), Inches(1.6),
                "You can replay any activity from the Contents slide. Reset always returns an activity to its first screen so it can be used again with another group or a second pass.",
                size=16, color=NAVY, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.3), Inches(5.0), Inches(3.4), Inches(0.5), "Back to contents", fill=GREEN, target="contents")

    if own:
        out_path = out_path or os.path.join(ROOT, "01_Organisation_of_the_Nervous_System.pptx")
        d.save(out_path)
        return out_path, d
    return None, d


if __name__ == "__main__":
    path, deck = build()
    print("wrote", path, "slides", len(deck.prs.slides))
