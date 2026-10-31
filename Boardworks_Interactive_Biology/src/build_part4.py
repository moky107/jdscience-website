#!/usr/bin/env python3
"""Part 4 – The synapse. Macro-free .pptx."""

from __future__ import annotations

import os
import sys

from pptx.enum.text import PP_ALIGN
from pptx.util import Inches

sys.path.insert(0, os.path.dirname(__file__))
from activities import mcq, stepper
from diagrams import OUT as DIAG, generate_all
from pptx_kit import (
    GREEN,
    GREEN_DARK,
    GREEN_SOFT,
    LIGHT_BLUE,
    LIGHT_GREEN,
    LIGHT_RED,
    NAVY,
    NAVY_TEXT,
    ORANGE,
    RED,
    WHITE,
    YELLOW,
    YELLOW_EDGE,
    Deck,
    add_notes,
    add_picture,
    add_rect,
    add_textbox,
    set_shape_text,
    title_slide,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def P(name):
    return os.path.join(DIAG, name)


CORRECT_ORDER = [
    "An action potential arrives at the presynaptic neurone.",
    "Calcium channels in the membrane open and ions move in.",
    "Synaptic vesicles move towards the presynaptic membrane.",
    "Vesicles fuse with the membrane, releasing acetylcholine.",
    "Acetylcholine binds to receptors on the postsynaptic cell.",
    "Sodium channels on the postsynaptic membrane open.",
    "Sodium ions move into the cell, causing it to depolarize.",
    "An action potential is generated in the postsynaptic neurone.",
]

SHUFFLED = [
    "Calcium channels in the membrane open and ions move in.",
    "An action potential is generated in the postsynaptic neurone.",
    "Synaptic vesicles move towards the presynaptic membrane.",
    "An action potential arrives at the presynaptic neurone.",
    "Vesicles fuse with the membrane, releasing acetylcholine.",
    "Acetylcholine binds to receptors on the postsynaptic cell.",
    "Sodium channels on the postsynaptic membrane open.",
    "Sodium ions move into the cell, causing it to depolarize.",
]


def build(out_path=None, deck=None):
    own = deck is None
    if own and not os.path.exists(P("synapse_0.png")):
        generate_all()

    d = deck or Deck("The synapse")
    title_slide(
        d, "title", "The Nervous System", "Part 4: The synapse",
        "Interactive reconstruction  ·  Flash-free  ·  Original course © Boardworks Ltd 2009",
    )
    add_picture(d.s("title"), P("title_retina.png"), Inches(2.7), Inches(2.05), height=Inches(3.95))

    s = d.add("contents", "Contents")
    d.chrome("contents")
    items = [
        ("what happens at a synapse? (animation)", "syn_0"),
        ("features of a synapse", "features"),
        ("transmission sequence", "seq"),
        ("structure – labelling", "label"),
        ("knowledge check", "q1"),
    ]
    y = 1.4
    for i, (label, tgt) in enumerate(items, 1):
        d.button(s, Inches(1.4), Inches(y), Inches(7.2), Inches(0.65), f"{i}.  {label}", fill=GREEN if i % 2 else GREEN_DARK, size=16, target=tgt)
        y += 0.78

    stepper(
        d, "syn", "What happens at a synapse?",
        [
            {"caption": "The junction", "image": P("synapse_0.png"),
             "body": "Nervous impulses can be transmitted from one neurone to another. This transfer occurs at a junction called the synapse. Press Next step to watch neurotransmitter release, diffusion, binding and the postsynaptic response."},
            {"caption": "Action potential arrives", "image": P("synapse_1.png"),
             "body": "An action potential reaches the synaptic knob of the presynaptic neurone. The membrane depolarises."},
            {"caption": "Calcium ions enter", "image": P("synapse_2.png"),
             "body": "Voltage-gated calcium channels open. Ca²⁺ diffuses into the synaptic knob down its concentration gradient."},
            {"caption": "Vesicles move", "image": P("synapse_3.png"),
             "body": "Ca²⁺ causes synaptic vesicles to move to and fuse with the presynaptic membrane."},
            {"caption": "Acetylcholine released", "image": P("synapse_4.png"),
             "body": "Vesicles release acetylcholine (ACh) into the synaptic cleft by exocytosis."},
            {"caption": "Diffusion across the cleft", "image": P("synapse_5.png"),
             "body": "ACh diffuses across the synaptic cleft (about 20–30 nm). This is the reason synaptic transmission is slower than electrical conduction along an axon."},
            {"caption": "Receptor binding", "image": P("synapse_6.png"),
             "body": "ACh binds to complementary receptors on the postsynaptic membrane. This opens ligand-gated sodium channels."},
            {"caption": "Postsynaptic response", "image": P("synapse_7.png"),
             "body": "Na⁺ enters the postsynaptic neurone. If the excitatory postsynaptic potential reaches threshold, an action potential is generated. ACh is then hydrolysed by acetylcholinesterase so the membrane can repolarise."},
        ],
        nxt="features",
        notes="Rebuilt Flash synapse animation as an 8-step sequence covering AP arrival, Ca²⁺ entry, vesicle fusion, ACh diffusion, receptor binding and postsynaptic depolarisation.",
    )

    s = d.add("features", "What are the main features?")
    d.chrome("features", activity=True)
    add_textbox(s, Inches(0.3), Inches(0.88), Inches(9.4), Inches(0.35),
                "The features of a synapse", size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    add_picture(s, P("synapse_em_style.png"), Inches(0.25), Inches(1.2), height=Inches(5.0))
    d.info_box(s, Inches(5.7), Inches(1.25), Inches(3.9), Inches(2.15),
               "Which structures can you identify?\n\nWhich cell is the presynaptic neurone?", size=15)
    d.button(s, Inches(5.85), Inches(3.55), Inches(3.6), Inches(0.48), "show diagram", fill=GREEN, size=14, target="feat_diag")
    d.button(s, Inches(5.85), Inches(4.15), Inches(3.6), Inches(0.48), "identify structures", fill=NAVY, size=14, target="feat_id")
    d.button(s, Inches(5.85), Inches(4.75), Inches(3.6), Inches(0.48), "which is presynaptic?", fill=ORANGE, size=14, target="feat_pre")
    add_notes(s, "Original Flash toggle (micrograph / diagram) rebuilt. The electron-micrograph lookalike is an original illustration, not the copyrighted TEM image.")

    s = d.add("feat_diag", "What are the main features?", hidden=True)
    d.chrome("feat_diag", show_nav=False)
    add_picture(s, P("synapse_0.png"), Inches(0.3), Inches(1.0), width=Inches(5.8))
    d.info_box(s, Inches(6.2), Inches(1.2), Inches(3.4), Inches(4.4),
               "2D diagram of a cholinergic synapse.\n\nOrange: presynaptic knob (vesicles, mitochondria, Ca²⁺ channels).\nBlue band: synaptic cleft.\nLower cell: postsynaptic membrane with receptors.", size=15)
    d.button(s, Inches(6.5), Inches(5.9), Inches(2.8), Inches(0.4), "Back", fill=GREEN, target="features")

    s = d.add("feat_id", "What are the main features?", hidden=True)
    d.chrome("feat_id", show_nav=False)
    items = [
        "Synaptic vesicles (contain neurotransmitter)",
        "Mitochondria (ATP for exocytosis and pumps)",
        "Presynaptic membrane with voltage-gated Ca²⁺ channels",
        "Synaptic cleft (diffusion pathway)",
        "Postsynaptic receptors / ligand-gated Na⁺ channels",
        "Postsynaptic neurone",
    ]
    y = 1.05
    for t in items:
        box = add_rect(s, Inches(0.7), Inches(y), Inches(8.6), Inches(0.62), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
        set_shape_text(box, t, size=15, color=NAVY, align=PP_ALIGN.LEFT)
        y += 0.72
    d.button(s, Inches(3.5), Inches(5.7), Inches(3.0), Inches(0.4), "Back", fill=GREEN, target="features")

    s = d.add("feat_pre", "What are the main features?", hidden=True)
    d.chrome("feat_pre", show_nav=False)
    d.info_box(s, Inches(0.7), Inches(1.4), Inches(8.6), Inches(3.6),
               "The presynaptic neurone is the one that contains the synaptic vesicles (the upper cell in the diagram).\n\nIt is the cell that arrives with the action potential and releases neurotransmitter. The postsynaptic cell has the receptors and, if threshold is reached, fires the next action potential.\n\nSynapses are unidirectional because vesicles are only in the presynaptic knob and receptors only on the postsynaptic membrane.", size=16)
    d.button(s, Inches(3.5), Inches(5.4), Inches(3.0), Inches(0.45), "Back", fill=GREEN, target="features")

    # Sequencing – original shuffled list
    s = d.add("seq", "Transmission across a synapse")
    d.chrome("seq", activity=True)
    add_textbox(s, Inches(0.25), Inches(0.86), Inches(9.5), Inches(0.38),
                "What is the sequence in events across a synapse?", size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(0.3), Inches(1.22), Inches(9.4), Inches(0.32),
                "The statements are jumbled (as in the original). Click Check to see the correct order.", size=13, color=NAVY)
    y = 1.55
    for i, text in enumerate(SHUFFLED, 1):
        n = d.label_chip(s, Inches(0.3), Inches(y), Inches(0.42), Inches(0.48), str(i), fill=GREEN, size=12)
        set_shape_text(n, str(i), size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        box = add_rect(s, Inches(0.82), Inches(y), Inches(8.8), Inches(0.48), YELLOW, line=GREEN_DARK, rounded=True)
        set_shape_text(box, text, size=13, color=NAVY, align=PP_ALIGN.LEFT)
        y += 0.545
    d.button(s, Inches(0.35), Inches(6.80), Inches(1.7), Inches(0.32), "Check", fill=GREEN, size=12, target="seq_ans")
    d.button(s, Inches(2.15), Inches(6.80), Inches(1.5), Inches(0.32), "Reset", fill=ORANGE, size=12, target="seq")
    add_notes(
        s,
        "Original Flash sequencing activity. Shuffled order retained from the source slide. "
        "Correct order: 4, 1, 3, 5, 6, 7, 8, 2 of the numbered source list "
        "(AP arrives → Ca²⁺ in → vesicles move → ACh released → bind → Na⁺ channels open → Na⁺ in / depolarise → postsynaptic AP).",
    )

    s = d.add("seq_ans", "Transmission – correct order", hidden=True)
    d.chrome("seq_ans", show_nav=False)
    add_textbox(s, Inches(0.3), Inches(0.88), Inches(9.4), Inches(0.35),
                "Correct sequence", size=18, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    y = 1.28
    for i, text in enumerate(CORRECT_ORDER, 1):
        n = d.label_chip(s, Inches(0.3), Inches(y), Inches(0.42), Inches(0.52), str(i), fill=GREEN_DARK, size=12)
        set_shape_text(n, str(i), size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        box = add_rect(s, Inches(0.82), Inches(y), Inches(8.8), Inches(0.52), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
        set_shape_text(box, text, size=13, color=NAVY, align=PP_ALIGN.LEFT)
        y += 0.58
    d.button(s, Inches(3.5), Inches(6.15), Inches(3.0), Inches(0.4), "Back", fill=GREEN, target="seq")

    # Labelling
    s = d.add("label", "The structure of the synapse")
    d.chrome("label", activity=True)
    add_textbox(s, Inches(0.3), Inches(0.86), Inches(9.4), Inches(0.35),
                "What are the main features of a synapse?", size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    add_picture(s, P("synapse_numbered.png"), Inches(1.55), Inches(1.12), width=Inches(6.85))
    add_textbox(s, Inches(0.3), Inches(5.85), Inches(9.4), Inches(0.32),
                "Click a numbered hotspot, then choose the correct label from the list.", size=14, color=NAVY, align=PP_ALIGN.CENTER)
    spots = [
        ("1", 0.28, 1.22, "lab1"),
        ("2", 0.28, 2.55, "lab2"),
        ("3", 0.28, 4.05, "lab3"),
        ("4", 8.85, 1.22, "lab4"),
        ("5", 8.85, 2.35, "lab5"),
        ("6", 8.85, 3.35, "lab6"),
        ("7", 8.85, 4.55, "lab7"),
    ]
    for n, x, y, tgt in spots:
        d.button(s, Inches(x), Inches(y), Inches(0.78), Inches(0.42), n, fill=NAVY, size=14, target=tgt)
    d.button(s, Inches(0.35), Inches(6.80), Inches(1.7), Inches(0.32), "Check", fill=GREEN, size=12, target="lab_ans")
    d.button(s, Inches(2.15), Inches(6.80), Inches(1.4), Inches(0.32), "Reset", fill=ORANGE, size=12, target="label")
    add_notes(s, "Rebuilt Flash drop-down labelling. Seven structures around the synaptic knob and cleft.")

    labels = [
        ("lab1", "1  Mitochondrion", "Provides ATP for active transport (Na⁺/K⁺ pump, Ca²⁺ removal) and for vesicle recycling / exocytosis."),
        ("lab2", "2  Voltage-gated Ca²⁺ channel", "Opens when the action potential depolarises the presynaptic membrane, allowing Ca²⁺ in."),
        ("lab3", "3  Synaptic cleft", "Narrow gap between the two neurones. Neurotransmitter diffuses across it. It also ensures the impulse cannot jump electrically, keeping the synapse unidirectional and integrable."),
        ("lab4", "4  Synaptic vesicle", "Contains acetylcholine (in this cholinergic example). Fuses with the presynaptic membrane during exocytosis."),
        ("lab5", "5  Presynaptic membrane", "Membrane of the synaptic knob. Site of vesicle fusion and Ca²⁺ channels."),
        ("lab6", "6  Receptor / ligand-gated Na⁺ channel", "On the postsynaptic membrane. ACh binding opens the channel so Na⁺ can enter."),
        ("lab7", "7  Postsynaptic membrane", "Membrane of the next neurone (or effector). Generates an excitatory (or inhibitory) postsynaptic potential."),
    ]
    bank = [
        "mitochondrion",
        "voltage-gated Ca²⁺ channel",
        "synaptic cleft",
        "synaptic vesicle",
        "presynaptic membrane",
        "receptor (ligand-gated Na⁺ channel)",
        "postsynaptic membrane",
    ]
    for key, title, body in labels:
        s = d.add(key, "The structure of the synapse", hidden=True)
        d.chrome(key, show_nav=False)
        add_textbox(s, Inches(0.4), Inches(0.95), Inches(9.2), Inches(0.45), "Choose the correct label", size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        y = 1.5
        correct_name = title.split("  ", 1)[1].split(" /")[0].lower()
        for item in bank:
            # loose match
            ok = item.split(" (")[0] in title.lower() or title.lower().split("  ", 1)[1].startswith(item[:12])
            tgt = f"{key}_ok" if ok else f"{key}_no"
            d.button(s, Inches(1.6), Inches(y), Inches(6.8), Inches(0.52), item, fill=LIGHT_BLUE, text_color=NAVY, line=NAVY, size=14, target=tgt)
            y += 0.58
        s = d.add(f"{key}_ok", "The structure of the synapse", hidden=True)
        d.chrome(f"{key}_ok", show_nav=False)
        box = add_rect(s, Inches(0.7), Inches(1.5), Inches(8.6), Inches(3.2), LIGHT_GREEN, line=GREEN_DARK, rounded=True)
        set_shape_text(box, f"Correct – {title}\n\n{body}", size=16, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(5.1), Inches(3.0), Inches(0.45), "Back to diagram", fill=GREEN, target="label")
        s = d.add(f"{key}_no", "The structure of the synapse", hidden=True)
        d.chrome(f"{key}_no", show_nav=False)
        box = add_rect(s, Inches(0.7), Inches(1.8), Inches(8.6), Inches(2.4), LIGHT_RED, line=RED, rounded=True)
        set_shape_text(box, "Not that one.\n\nLook at the position of the leader line and try again.", size=18, color=NAVY, align=PP_ALIGN.CENTER)
        d.button(s, Inches(3.5), Inches(4.7), Inches(3.0), Inches(0.45), "Try again", fill=ORANGE, target=key)

    s = d.add("lab_ans", "Synapse structure – answers", hidden=True)
    d.chrome("lab_ans", show_nav=False)
    y = 1.0
    for _key, title, body in labels:
        add_textbox(s, Inches(0.4), Inches(y), Inches(9.2), Inches(0.7), f"{title}  –  {body}", size=13, color=NAVY)
        y += 0.72
    d.button(s, Inches(3.5), Inches(6.2), Inches(3.0), Inches(0.4), "Back", fill=GREEN, target="label")

    mcq(d, "q1", "Knowledge check",
        "What is the immediate effect of Ca²⁺ entering the synaptic knob?",
        ["Acetylcholinesterase is activated",
         "Synaptic vesicles move to and fuse with the presynaptic membrane",
         "Sodium ions leave the postsynaptic neurone",
         "The synaptic cleft becomes wider"],
        1, "q2",
        "Ca²⁺ is the trigger for vesicle exocytosis of acetylcholine.",
        "Calcium entry is the step that links the action potential to neurotransmitter release.")
    mcq(d, "q2", "Knowledge check",
        "Why is transmission at a cholinergic synapse unidirectional?",
        ["Myelin is only on the postsynaptic side",
         "Vesicles are only presynaptic and receptors are only postsynaptic",
         "Sodium ions can only diffuse one way",
         "The cleft contains mitochondria that pump ACh backwards"],
        1, "end",
        "Neurotransmitter is released from one side only; receptors sit only on the other. The impulse cannot reverse.",
        "Think about where the vesicles are, and where the receptors are.")

    s = d.add("end", "End of Part 4")
    d.chrome("end")
    add_textbox(s, Inches(0.5), Inches(1.7), Inches(9), Inches(1.0),
                "End of the nervous system series", size=26, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(0.8), Inches(2.8), Inches(8.4), Inches(1.4),
                "Replay any activity from Contents. Reset returns each activity to its first screen so you can use it again in the same lesson.",
                size=16, color=NAVY, align=PP_ALIGN.CENTER)
    d.button(s, Inches(3.3), Inches(4.6), Inches(3.4), Inches(0.5), "Back to contents", fill=GREEN, target="contents")

    if own:
        out_path = out_path or os.path.join(ROOT, "04_The_Synapse.pptx")
        d.save(out_path)
        return out_path, d
    return None, d


if __name__ == "__main__":
    path, deck = build()
    print("wrote", path, "slides", len(deck.prs.slides))
