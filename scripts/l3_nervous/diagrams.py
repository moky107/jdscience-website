"""Textbook-style 2D scientific diagrams with purposeful animation."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

from gcse_foundations.diagrams import card, text_block
from jdscience_video.theme import GOLD, INK, LINE, MUTED, TEAL, TEAL_BAR, WHITE, font
from l3_nervous.palette import (
    ACH,
    AXON,
    AXON_EDGE,
    CA,
    CHANNEL_CA,
    CHANNEL_K,
    CHANNEL_LEAK,
    CHANNEL_LIGAND,
    CHANNEL_NA,
    CHOLINE,
    CYTO,
    ION_KEY,
    K,
    LIPID_HEAD,
    LIPID_HEAD_2,
    LIPID_TAIL,
    MYELIN,
    MYELIN_EDGE,
    NA,
    ORG,
    OUTSIDE,
    PUMP,
    PUMP_EDGE,
    SOMA,
    SOMA_EDGE,
)

ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "content/videos/_shared/nervous-micrographs"


def _mid(box):
    return (box[0] + box[2]) / 2, (box[1] + box[3]) / 2


def ion(d, x, y, kind="Na", r=12):
    colours = {"Na": NA, "K": K, "Ca": CA, "A": ORG, "ACh": ACH, "Ch": CHOLINE}
    labels = {"Na": "Na⁺", "K": "K⁺", "Ca": "Ca²⁺", "A": "A⁻", "ACh": "ACh", "Ch": "Ch"}
    col = colours.get(kind, NA)
    d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=WHITE, width=2)
    d.text((x, y), labels.get(kind, kind), font=font("bold", 11 if r >= 12 else 9), fill=(20, 20, 28), anchor="mm")


def ion_key(d, box, kinds=None):
    kinds = kinds or ["Na", "K", "Ca", "A"]
    x0, y0, x1, y1 = box
    w = x1 - x0
    wanted = []
    for k in kinds:
        for lab, col, name in ION_KEY:
            if (k == "Na" and lab == "Na⁺") or (k == "K" and lab == "K⁺") or (k == "Ca" and lab == "Ca²⁺") or (k == "A" and lab == "A⁻") or (k == "ACh" and lab == "ACh"):
                wanted.append((lab, col, name))
    n = max(1, len(wanted))
    slot = w / n
    for i, (lab, col, name) in enumerate(wanted):
        x = x0 + slot * i + 22
        y = (y0 + y1) / 2
        d.ellipse((x - 11, y - 11, x + 11, y + 11), fill=col, outline=WHITE, width=2)
        d.text((x + 18, y), f"{lab}  {name}", font=font("semibold", 16), fill=WHITE, anchor="lm")


def leader(d, x, y, lx, ly, text, align="left"):
    d.line((x, y, lx, ly), fill=GOLD, width=2)
    d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=GOLD)
    if align == "left":
        d.text((lx + 8, ly), text, font=font("bold", 22), fill=WHITE, anchor="lm")
    elif align == "right":
        d.text((lx - 8, ly), text, font=font("bold", 22), fill=WHITE, anchor="rm")
    else:
        d.text((lx, ly - 10), text, font=font("bold", 22), fill=WHITE, anchor="mm")


def _branch(d, x, y, ang, length, depth, colour=SOMA_EDGE, width=3):
    if depth <= 0 or length < 10:
        return
    x2 = x + length * math.cos(ang)
    y2 = y + length * math.sin(ang)
    d.line((x, y, x2, y2), fill=colour, width=max(1, int(width)))
    _branch(d, x2, y2, ang + 0.55, length * 0.55, depth - 1, colour, width * 0.75)
    _branch(d, x2, y2, ang - 0.5, length * 0.5, depth - 1, colour, width * 0.75)


def neurone_anatomy(d, box, t=0.0, revealed=None):
    revealed = set(revealed or [])
    show_all = "*" in revealed or not revealed
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    cy = (y0 + y1) / 2 + 10
    # soma
    soma = (x0 + 210, cy)
    d.ellipse((soma[0] - 118, soma[1] - 96, soma[0] + 118, soma[1] + 108), fill=SOMA, outline=SOMA_EDGE, width=4)
    # slight irregularity
    d.ellipse((soma[0] - 70, soma[1] - 118, soma[0] + 40, soma[1] - 70), fill=SOMA, outline=SOMA_EDGE, width=3)
    d.ellipse((soma[0] - 28, soma[1] - 28, soma[0] + 28, soma[1] + 28), fill=(20, 48, 78), outline=WHITE, width=2)
    d.ellipse((soma[0] - 8, soma[1] - 8, soma[0] + 8, soma[1] + 8), fill=GOLD)
    # dendrites
    for ang in (3.55, 3.95, 4.35, 2.55, 2.15, 1.85):
        _branch(d, soma[0] + 110 * math.cos(ang), soma[1] + 90 * math.sin(ang), ang, 78, 3, SOMA_EDGE, 4)
    # axon hillock and axon
    ax0 = soma[0] + 118
    ax1 = x1 - 210
    d.polygon([(ax0 - 8, cy - 22), (ax0 + 40, cy - 12), (ax0 + 40, cy + 12), (ax0 - 8, cy + 22)], fill=AXON, outline=AXON_EDGE)
    d.rectangle((ax0 + 36, cy - 10, ax1, cy + 10), fill=AXON, outline=AXON_EDGE)
    # myelin internodes and nodes
    span = ax1 - (ax0 + 70)
    n = 5
    intern = span / n
    nodes = []
    for i in range(n):
        xa = ax0 + 70 + i * intern
        xb = xa + intern * 0.78
        d.rounded_rectangle((xa, cy - 28, xb, cy + 28), 16, fill=MYELIN, outline=MYELIN_EDGE, width=3)
        # concentric hint
        d.rounded_rectangle((xa + 6, cy - 16, xb - 6, cy + 16), 10, outline=(196, 140, 90), width=1)
        nodes.append((xb + 6, cy))
        if i == 2:
            d.ellipse((xa + 36, cy - 40, xa + 64, cy - 22), fill=(246, 226, 150), outline=MYELIN_EDGE, width=2)
            d.ellipse((xa + 46, cy - 34, xa + 54, cy - 26), fill=(90, 60, 20))
    # terminals
    for dy, ang in ((-70, -0.55), (-24, -0.18), (24, 0.18), (70, 0.55)):
        d.line((ax1, cy, ax1 + 70, cy + dy), fill=AXON_EDGE, width=3)
        _branch(d, ax1 + 70, cy + dy, ang, 36, 2, AXON_EDGE, 2)
        d.ellipse((ax1 + 98, cy + dy - 8, ax1 + 114, cy + dy + 8), fill=SOMA, outline=SOMA_EDGE, width=2)
    def show(name):
        return show_all or name in revealed or "*" in revealed

    if show("soma"):
        leader(d, soma[0], soma[1] - 100, x0 + 280, y0 + 32, "cell body + nucleus")
    if show("dendrites"):
        leader(d, soma[0] - 150, soma[1] - 90, x0 + 40, y0 + 80, "dendrites")
    if show("axon"):
        leader(d, ax0 + 56, cy + 12, ax0 + 90, y1 - 36, "axon")
    if show("membrane"):
        leader(d, ax0 + 44, cy - 12, ax0 + 70, y0 + 70, "plasma membrane")
    if show("myelin"):
        leader(d, ax0 + 340, cy - 28, ax0 + 430, y0 + 32, "myelin sheath")
    if show("nodes") and nodes:
        leader(d, nodes[1][0], cy + 12, nodes[1][0] + 30, y1 - 36, "node of Ranvier")


def _bilayer(d, x0, y, x1, thick=56):
    # extracellular heads, tails, intracellular heads
    d.rectangle((x0, y - thick // 2, x1, y + thick // 2), fill=LIPID_TAIL)
    spacing = 16
    for x in range(int(x0) + 8, int(x1) - 4, spacing):
        d.ellipse((x - 6, y - thick // 2 - 7, x + 6, y - thick // 2 + 7), fill=LIPID_HEAD, outline=LIPID_HEAD_2)
        d.ellipse((x - 6, y + thick // 2 - 7, x + 6, y + thick // 2 + 7), fill=LIPID_HEAD, outline=LIPID_HEAD_2)
        d.line((x, y - thick // 2 + 6, x, y + thick // 2 - 6), fill=(140, 80, 64), width=2)
    d.text((x1 - 12, y - thick // 2 - 22), "outside", font=font("semibold", 18), fill=MUTED, anchor="rm")
    d.text((x1 - 12, y + thick // 2 + 22), "inside", font=font("semibold", 18), fill=MUTED, anchor="rm")


def _channel(d, x, y, kind="Na", state="closed", h=86, w=34):
    colours = {"Na": CHANNEL_NA, "K": CHANNEL_K, "Ca": CHANNEL_CA, "leak": CHANNEL_LEAK, "ligand": CHANNEL_LIGAND}
    labels = {"Na": "Naᵥ", "K": "Kᵥ", "Ca": "Caᵥ", "leak": "K leak", "ligand": "AChR"}
    col = colours.get(kind, CHANNEL_NA)
    d.rounded_rectangle((x - w / 2, y - h / 2, x + w / 2, y + h / 2), 8, fill=col, outline=WHITE, width=2)
    if state == "closed":
        d.rectangle((x - 6, y - 18, x + 6, y + 18), fill=(20, 30, 40))
        d.polygon([(x - 12, y - 8), (x, y + 10), (x + 12, y - 8)], fill=(20, 30, 40))
    elif state == "open":
        d.rectangle((x - 8, y - h / 2 + 4, x + 8, y + h / 2 - 4), fill=(8, 16, 24))
        d.rectangle((x - 3, y - h / 2 + 4, x + 3, y + h / 2 - 4), fill=(232, 220, 160))
    elif state == "inactivated":
        d.rectangle((x - 6, y - h / 2 + 6, x + 6, y + 6), fill=(10, 20, 30))
        d.ellipse((x - 9, y + 10, x + 9, y + 28), fill=(180, 50, 60), outline=WHITE, width=2)
        d.text((x, y + 40), "inact.", font=font("bold", 12), fill=GOLD, anchor="mm")
    d.text((x, y + h / 2 + 16), labels.get(kind, kind), font=font("bold", 16), fill=WHITE, anchor="mm")
    status = {"closed": "closed", "open": "open", "inactivated": "inactivated"}[state]
    d.text((x, y - h / 2 - 16), status, font=font("semibold", 14), fill=GOLD if state != "closed" else MUTED, anchor="mm")


def _pump(d, x, y, t=0.0):
    d.rounded_rectangle((x - 46, y - 44, x + 46, y + 44), 12, fill=PUMP, outline=PUMP_EDGE, width=3)
    d.text((x, y - 6), "Na⁺/K⁺", font=font("bold", 15), fill=(40, 30, 10), anchor="mm")
    d.text((x, y + 14), "pump", font=font("bold", 15), fill=(40, 30, 10), anchor="mm")
    phase = (t * 0.7) % 2.0
    if phase < 1.0:
        ion(d, x - 18, y - 70, "Na", 10)
        ion(d, x, y - 78, "Na", 10)
        ion(d, x + 18, y - 70, "Na", 10)
        d.polygon([(x, y - 48), (x - 8, y - 36), (x + 8, y - 36)], fill=NA)
    else:
        ion(d, x - 12, y + 70, "K", 10)
        ion(d, x + 12, y + 70, "K", 10)
        d.polygon([(x, y + 48), (x - 8, y + 36), (x + 8, y + 36)], fill=K)
    d.text((x + 58, y), "ATP", font=font("bold", 16), fill=GOLD, anchor="lm")


def membrane_rest(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 24, y0 + 12, x1 - 24, y0 + 52), ["Na", "K", "A"])
    y = (y0 + y1) / 2 + 10
    _bilayer(d, x0 + 30, y, x1 - 40)
    # charges
    for i in range(9):
        x = x0 + 80 + i * 160
        if x < x1 - 80:
            d.text((x, y - 78), "+", font=font("bold", 22), fill=GOLD, anchor="mm")
            d.text((x, y + 78), "−", font=font("bold", 26), fill=TEAL_BAR, anchor="mm")
    # scattered ions
    for i, xx in enumerate(range(int(x0 + 70), int(x1 - 80), 90)):
        ion(d, xx, y - 120 - 8 * math.sin(t + i), "Na", 11)
        if i % 3 == 0:
            ion(d, xx + 30, y + 120 + 6 * math.sin(t + i), "K", 11)
        if i % 2 == 0:
            ion(d, xx + 18, y + 160, "A", 11)
    _channel(d, x0 + 260, y, "Na", "closed")
    _channel(d, x0 + 420, y, "K", "closed")
    _channel(d, x0 + 580, y, "leak", "open")
    d.text(((x0 + x1) / 2, y1 - 28), "Resting potential  −70 mV   ·   membrane polarised", font=font("bold", 24), fill=GOLD, anchor="mm")


def ion_gradients(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 24, y0 + 12, x1 - 24, y0 + 52), ["Na", "K", "A"])
    mid = (y0 + y1) / 2 + 8
    d.rounded_rectangle((x0 + 40, y0 + 70, x1 - 40, mid - 8), 16, fill=OUTSIDE, outline=LINE, width=2)
    d.rounded_rectangle((x0 + 40, mid + 8, x1 - 40, y1 - 40), 16, fill=CYTO, outline=LINE, width=2)
    d.text((x0 + 60, y0 + 86), "OUTSIDE the axon", font=font("bold", 22), fill=WHITE)
    d.text((x0 + 60, mid + 24), "INSIDE the axon", font=font("bold", 22), fill=WHITE)
    for i in range(10):
        ion(d, x0 + 120 + i * 140, y0 + 150 + 6 * math.sin(t + i), "Na", 13)
        if i < 3:
            ion(d, x0 + 180 + i * 200, y0 + 210, "K", 11)
    for i in range(8):
        ion(d, x0 + 140 + i * 160, y1 - 90 + 5 * math.cos(t + i), "K", 13)
        if i < 6:
            ion(d, x0 + 200 + i * 180, y1 - 150, "A", 12)
        if i < 2:
            ion(d, x0 + 280 + i * 260, y1 - 200, "Na", 11)
    d.text((x1 - 70, y0 + 86), "Na⁺ high", font=font("bold", 22), fill=NA, anchor="rm")
    d.text((x1 - 70, mid + 24), "K⁺ high   A⁻ trapped", font=font("bold", 22), fill=K, anchor="rm")


def nak_pump(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    ion_key(d, (x0 + 24, y0 + 12, x1 - 24, y0 + 52), ["Na", "K"])
    y = (y0 + y1) / 2 + 16
    _bilayer(d, x0 + 40, y, x1 - 40, 64)
    _pump(d, (x0 + x1) / 2 - 80, y, t)
    _channel(d, x1 - 280, y, "leak", "open")
    # 3 out / 2 in callouts
    d.rounded_rectangle((x0 + 60, y0 + 80, x0 + 430, y0 + 200), 14, fill=(20, 42, 70), outline=LINE, width=2)
    d.text((x0 + 80, y0 + 100), "Each cycle uses ATP", font=font("bold", 22), fill=WHITE)
    d.text((x0 + 80, y0 + 140), "3 sodium ions OUT", font=font("bold", 24), fill=NA)
    d.text((x0 + 80, y0 + 172), "2 potassium ions IN", font=font("bold", 24), fill=K)
    d.text(((x0 + x1) / 2, y1 - 30), "Active transport  ·  maintains the gradients  ·  does not fire the impulse", font=font("semibold", 20), fill=GOLD, anchor="mm")


def leak_channels(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 24, y0 + 12, x1 - 24, y0 + 52), ["Na", "K"])
    y = (y0 + y1) / 2 + 10
    _bilayer(d, x0 + 40, y, x1 - 40)
    _channel(d, x0 + 280, y, "Na", "closed")
    _channel(d, x0 + 520, y, "leak", "open")
    _channel(d, x0 + 760, y, "K", "closed")
    # K leaking out
    for i in range(4):
        yy = y + 70 - ((t * 40 + i * 28) % 150)
        ion(d, x0 + 520 + 8 * math.sin(t + i), yy, "K", 11)
    d.text((x0 + 520, y - 130), "K⁺ out down its gradient", font=font("bold", 20), fill=K, anchor="mm")
    d.text((x0 + 280, y + 120), "Na⁺ cannot flood in", font=font("semibold", 18), fill=MUTED, anchor="mm")
    d.text(((x0 + x1) / 2, y1 - 28), "Selective permeability: more permeable to K⁺ than to Na⁺ at rest", font=font("bold", 22), fill=GOLD, anchor="mm")


def ap_points(n=240):
    pts = []
    for i in range(n):
        x = 5.0 * i / (n - 1)
        if x < 1.35:
            v = -70.0
        elif x < 1.65:
            v = -70 + 20 * (x - 1.35) / 0.30
        elif x < 2.10:
            v = -50 + 85 * (x - 1.65) / 0.45
        elif x < 2.50:
            v = 35 - 120 * (x - 2.10) / 0.40
        elif x < 3.20:
            v = -85 + 15 * (x - 2.50) / 0.70
        else:
            v = -70.0
        pts.append((x, v))
    return pts


def ap_graph(d, box, t=0.0, revealed=None, phase="all"):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    gx0, gy0, gx1, gy1 = x0 + 110, y0 + 50, x1 - 50, y1 - 70
    d.rectangle((gx0, gy0, gx1, gy1), fill=(12, 28, 48), outline=LINE, width=2)
    # axes
    def X(ms):
        return gx0 + (ms / 5.0) * (gx1 - gx0)

    def Y(mv):
        return gy1 - ((mv + 90) / 140.0) * (gy1 - gy0)

    d.line((gx0, Y(0), gx1, Y(0)), fill=(80, 100, 120), width=1)
    d.line((gx0, gy0, gx0, gy1), fill=WHITE, width=2)
    d.line((gx0, gy1, gx1, gy1), fill=WHITE, width=2)
    for mv, lab in ((-70, "−70"), (-55, "−55"), (0, "0"), (35, "+35")):
        y = Y(mv)
        d.line((gx0 - 8, y, gx0, y), fill=WHITE, width=2)
        d.text((gx0 - 14, y), lab, font=font("semibold", 18), fill=INK, anchor="rm")
        if mv in (-55,):
            d.line((gx0, y, gx1, y), fill=GOLD, width=1)
            d.text((gx1 - 8, y - 12), "threshold", font=font("semibold", 16), fill=GOLD, anchor="rm")
    for ms in range(0, 6):
        x = X(ms)
        d.line((x, gy1, x, gy1 + 8), fill=WHITE, width=2)
        d.text((x, gy1 + 26), str(ms), font=font("semibold", 18), fill=INK, anchor="mm")
    d.text(((gx0 + gx1) / 2, y1 - 18), "Time  /  ms", font=font("bold", 22), fill=WHITE, anchor="mm")
    d.text((x0 + 36, (gy0 + gy1) / 2), "Membrane\npotential\n/ mV", font=font("bold", 20), fill=WHITE, anchor="mm")

    pts = ap_points()
    # how much of the curve to draw
    limits = {
        "axes": 1.35,
        "depol": 2.12,
        "peak": 2.22,
        "repol": 2.60,
        "hyper": 3.40,
        "all": 5.0,
        None: 5.0,
    }
    tmax = limits.get(phase, 5.0)
    if phase == "all":
        tmax = min(5.0, 1.15 + (t % 5.5) * 0.85)
    ghost = [(X(ms), Y(mv)) for ms, mv in pts]
    if len(ghost) >= 2:
        d.line(ghost, fill=(90, 46, 52), width=3)
    draw = [(X(ms), Y(mv)) for ms, mv in pts if ms <= tmax + 0.01]
    if len(draw) >= 2:
        d.line(draw, fill=(232, 80, 80), width=6)
        x, y = draw[-1]
        d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=GOLD)
    bands = {
        "axes": (0.0, 1.35, "resting potential"),
        "depol": (1.65, 2.12, "depolarisation"),
        "peak": (2.05, 2.25, "peak"),
        "repol": (2.10, 2.60, "repolarisation"),
        "hyper": (2.55, 3.40, "hyperpolarisation"),
    }
    if phase in bands:
        a, b, name = bands[phase]
        d.line((X(a), gy0 + 8, X(a), gy1), fill=GOLD, width=2)
        d.line((X(b), gy0 + 8, X(b), gy1), fill=GOLD, width=2)
        d.text((X((a + b) / 2), gy0 + 22), name, font=font("bold", 20), fill=GOLD, anchor="mm")
    if phase == "all":
        for n, ms, mv, dy in (
            (1, 0.7, -70, 28),
            (2, 1.85, 0, -28),
            (3, 2.15, 30, -28),
            (4, 2.7, -82, 28),
            (5, 3.8, -70, 28),
        ):
            d.ellipse((X(ms) - 12, Y(mv) + dy - 12, X(ms) + 12, Y(mv) + dy + 12), fill=(30, 80, 50), outline=GOLD, width=2)
            d.text((X(ms), Y(mv) + dy), str(n), font=font("bold", 16), fill=WHITE, anchor="mm")


def threshold(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    # two traces
    left = (x0 + 40, y0 + 40, (x0 + x1) / 2 - 16, y1 - 40)
    right = ((x0 + x1) / 2 + 16, y0 + 40, x1 - 40, y1 - 40)
    d.rounded_rectangle(left, 16, fill=(16, 34, 58), outline=LINE, width=2)
    d.rounded_rectangle(right, 16, fill=(16, 34, 58), outline=LINE, width=2)
    d.text(((left[0] + left[2]) / 2, left[1] + 24), "Subthreshold  ·  no AP", font=font("bold", 22), fill=MUTED, anchor="mm")
    d.text(((right[0] + right[2]) / 2, right[1] + 24), "Threshold reached  ·  AP fires", font=font("bold", 22), fill=GOLD, anchor="mm")

    def mini(box2, fire):
        gx0, gy0, gx1, gy1 = box2[0] + 40, box2[1] + 70, box2[2] - 30, box2[3] - 40

        def X(ms):
            return gx0 + (ms / 5) * (gx1 - gx0)

        def Y(mv):
            return gy1 - ((mv + 90) / 140) * (gy1 - gy0)

        d.line((gx0, Y(-70), gx1, Y(-70)), fill=LINE, width=1)
        d.line((gx0, Y(-55), gx1, Y(-55)), fill=GOLD, width=1)
        if fire:
            pts = [(X(ms), Y(mv)) for ms, mv in ap_points()]
            d.line(pts, fill=(232, 80, 80), width=4)
        else:
            pts = []
            for i in range(80):
                ms = 5 * i / 79
                if 1.4 <= ms < 1.85:
                    mv = -70 + 12 * (ms - 1.4) / 0.45
                elif 1.85 <= ms < 2.4:
                    mv = -58 - 12 * (ms - 1.85) / 0.55
                else:
                    mv = -70
                pts.append((X(ms), Y(mv)))
            d.line(pts, fill=TEAL_BAR, width=4)

    mini(left, False)
    mini(right, True)


def membrane_depol(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 16, y0 + 10, x1 - 16, y0 + 46), ["Na", "K"])
    y = (y0 + y1) / 2 + 8
    _bilayer(d, x0 + 20, y, x1 - 20, 52)
    _channel(d, x0 + 140, y, "Na", "open")
    _channel(d, x0 + 300, y, "K", "closed")
    for i in range(5):
        yy = y - 70 + ((t * 50 + i * 22) % 140)
        ion(d, x0 + 140 + 6 * math.sin(t + i), yy, "Na", 10)
    d.text(((x0 + x1) / 2, y1 - 22), "Na⁺ in  ·  inside becomes positive", font=font("bold", 20), fill=NA, anchor="mm")


def membrane_peak(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    ion_key(d, (x0 + 16, y0 + 10, x1 - 16, y0 + 46), ["Na", "K"])
    y = (y0 + y1) / 2 + 8
    _bilayer(d, x0 + 20, y, x1 - 20, 52)
    _channel(d, x0 + 140, y, "Na", "inactivated")
    _channel(d, x0 + 300, y, "K", "open")
    d.text(((x0 + x1) / 2, y1 - 22), "Na⁺ entry stops  ·  K⁺ channels opening", font=font("bold", 18), fill=GOLD, anchor="mm")


def membrane_repol(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 16, y0 + 10, x1 - 16, y0 + 46), ["Na", "K"])
    y = (y0 + y1) / 2 + 8
    _bilayer(d, x0 + 20, y, x1 - 20, 52)
    _channel(d, x0 + 140, y, "Na", "inactivated")
    _channel(d, x0 + 300, y, "K", "open")
    for i in range(5):
        yy = y + 70 - ((t * 50 + i * 22) % 140)
        ion(d, x0 + 300 + 6 * math.sin(t + i), yy, "K", 10)
    d.text(((x0 + x1) / 2, y1 - 22), "K⁺ out  ·  not the Na⁺/K⁺ pump", font=font("bold", 18), fill=K, anchor="mm")


def membrane_hyper(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    y = (y0 + y1) / 2 + 8
    _bilayer(d, x0 + 20, y, x1 - 20, 52)
    _channel(d, x0 + 140, y, "Na", "closed")
    _channel(d, x0 + 300, y, "K", "open" if (t % 2) < 1.1 else "closed")
    d.text(((x0 + x1) / 2, y1 - 22), "Briefly more negative than rest, then recovery", font=font("bold", 18), fill=GOLD, anchor="mm")


def local_currents(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    y = (y0 + y1) / 2
    _bilayer(d, x0 + 40, y, x1 - 40, 48)
    # three regions
    labels = [("refractory", MUTED), ("active  Na⁺ in", GOLD), ("resting  → threshold", TEAL_BAR)]
    w = (x1 - x0 - 120) / 3
    for i, (lab, col) in enumerate(labels):
        xa = x0 + 60 + i * w
        d.rounded_rectangle((xa, y - 130, xa + w - 20, y - 70), 10, fill=(20, 40, 64), outline=col, width=2)
        d.text((xa + (w - 20) / 2, y - 100), lab, font=font("bold", 18), fill=col, anchor="mm")
    # channels
    _channel(d, x0 + 220, y, "Na", "inactivated")
    _channel(d, x0 + 520, y, "Na", "open")
    _channel(d, x0 + 860, y, "Na", "closed")
    # local current arrows
    pulse = (t * 80) % 200
    d.polygon([(x0 + 480 + pulse * 0.2, y + 70), (x0 + 620, y + 40), (x0 + 620, y + 52), (x0 + 860, y + 52), (x0 + 860, y + 64), (x0 + 620, y + 64), (x0 + 620, y + 76)], fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 30), "Local currents depolarise the next resting region", font=font("bold", 22), fill=GOLD, anchor="mm")


def refractory(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    gx0, gy0, gx1, gy1 = x0 + 80, y0 + 70, x1 - 50, y1 - 60
    d.rectangle((gx0, gy0, gx1, gy1), fill=(12, 28, 48), outline=LINE, width=2)
    # excitability line
    # 0-2 normal, 2-3.2 absolute, 3.2-7 relative, 7-10 normal
    def X(ms):
        return gx0 + (ms / 10) * (gx1 - gx0)

    def Y(e):
        return gy1 - e * (gy1 - gy0)

    pts = [(X(0), Y(0.85)), (X(2), Y(0.85)), (X(2.05), Y(0.08)), (X(3.2), Y(0.08)), (X(7.2), Y(0.85)), (X(10), Y(0.85))]
    d.line(pts, fill=TEAL_BAR, width=5)
    d.rectangle((X(2), gy0, X(3.2), gy1), outline=None, fill=None)
    d.text((X(2.6), gy0 + 24), "absolute", font=font("bold", 18), fill=GOLD, anchor="mm")
    d.text((X(5.2), gy0 + 24), "relative", font=font("bold", 18), fill=WHITE, anchor="mm")
    d.text((X(1.0), gy0 + 24), "resting", font=font("semibold", 16), fill=MUTED, anchor="mm")
    d.text(((gx0 + gx1) / 2, y1 - 24), "Time after an action potential  /  ms", font=font("bold", 20), fill=WHITE, anchor="mm")
    d.text((x0 + 36, (gy0 + gy1) / 2), "Can a\nnew AP\nstart?", font=font("bold", 18), fill=WHITE, anchor="mm")


def unmyelinated(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    y = (y0 + y1) / 2
    d.rounded_rectangle((x0 + 50, y - 22, x1 - 50, y + 22), 12, fill=AXON, outline=AXON_EDGE, width=3)
    pos = (t * 140) % (x1 - x0 - 140)
    for i in range(8):
        x = x0 + 80 + i * ((x1 - x0 - 160) / 7)
        active = abs(x - (x0 + 70 + pos)) < 70
        d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=GOLD if active else (40, 80, 90), outline=WHITE, width=2)
    d.text(((x0 + x1) / 2, y - 80), "Unmyelinated axon  ·  every patch must fire", font=font("bold", 24), fill=WHITE, anchor="mm")
    d.text(((x0 + x1) / 2, y + 70), "Continuous conduction", font=font("semibold", 22), fill=MUTED, anchor="mm")


def saltatory(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    y = (y0 + y1) / 2
    d.rectangle((x0 + 50, y - 10, x1 - 50, y + 10), fill=AXON)
    n = 5
    span = x1 - x0 - 140
    intern = span / n
    nodes = []
    for i in range(n):
        xa = x0 + 70 + i * intern
        xb = xa + intern * 0.72
        d.rounded_rectangle((xa, y - 36, xb, y + 36), 16, fill=MYELIN, outline=MYELIN_EDGE, width=3)
        nodes.append(xb + 10)
    node_i = int((t * 0.7) % len(nodes))
    for i, xn in enumerate(nodes):
        col = GOLD if i == node_i else TEAL_BAR
        d.ellipse((xn - 12, y - 12, xn + 12, y + 12), fill=col, outline=WHITE, width=2)
        if i == node_i:
            d.text((xn, y - 70), "action potential", font=font("bold", 18), fill=GOLD, anchor="mm")
            if i + 1 < len(nodes):
                d.line((xn + 14, y - 40, nodes[i + 1] - 14, y - 40), fill=GOLD, width=3)
                d.polygon([(nodes[i + 1] - 14, y - 48), (nodes[i + 1] - 2, y - 40), (nodes[i + 1] - 14, y - 32)], fill=GOLD)
    d.text((nodes[0], y + 58), "node", font=font("semibold", 16), fill=WHITE, anchor="mm")
    d.text((x0 + 70 + intern * 0.36, y - 58), "myelin", font=font("semibold", 16), fill=MYELIN, anchor="mm")
    d.text(((x0 + x1) / 2, y + 100), "Saltatory conduction  ·  the impulse is regenerated at each node of Ranvier", font=font("bold", 22), fill=GOLD, anchor="mm")


def _synapse_base(d, box, phase=0, t=0.0, labels=False):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    ion_key(d, (x0 + 16, y0 + 8, x1 - 16, y0 + 44), ["Ca", "Na", "ACh"] if not labels else ["Ca", "ACh"])
    # presynaptic knob
    pre = [x0 + 80, y0 + 70, x1 - 80, (y0 + y1) / 2 + 10]
    d.rounded_rectangle(pre, 28, fill=(196, 140, 88), outline=(140, 90, 50), width=3)
    # cleft
    cleft_y0 = pre[3]
    cleft_y1 = cleft_y0 + 54
    d.rectangle((x0 + 80, cleft_y0, x1 - 80, cleft_y1), fill=(40, 90, 130))
    # postsynaptic
    d.rounded_rectangle((x0 + 80, cleft_y1, x1 - 80, y1 - 36), 28, fill=(176, 118, 80), outline=(120, 70, 40), width=3)
    d.text((x0 + 100, y0 + 86), "presynaptic knob", font=font("bold", 20), fill=(40, 24, 10))
    d.text((x0 + 100, cleft_y0 + 16), "synaptic cleft", font=font("bold", 18), fill=WHITE)
    d.text((x0 + 100, cleft_y1 + 16), "postsynaptic membrane", font=font("bold", 20), fill=(40, 24, 10))
    # mitochondria
    d.ellipse((x0 + 160, y0 + 130, x0 + 250, y0 + 180), fill=(180, 90, 80), outline=(90, 40, 30), width=2)
    d.arc((x0 + 170, y0 + 138, x0 + 240, y0 + 172), 200, 340, fill=(90, 40, 30), width=2)
    # vesicles
    ves = [
        (x0 + 400, y0 + 150), (x0 + 470, y0 + 175), (x0 + 540, y0 + 145),
        (x0 + 610, y0 + 168), (x0 + 680, y0 + 152), (x0 + 750, y0 + 178),
        (x0 + 820, y0 + 160), (x0 + 450, y0 + 220), (x0 + 720, y0 + 215),
    ]
    fuse_n = 0
    if phase >= 3:
        fuse_n = 2
    if phase >= 4:
        fuse_n = 3
    for i, (vx, vy) in enumerate(ves):
        yy = vy
        if 1 <= phase <= 3:
            yy = vy + min(70, (t * 18 + i * 8))
        if i < fuse_n:
            d.ellipse((vx - 22, cleft_y0 - 28, vx + 22, cleft_y0 + 8), fill=(250, 240, 210), outline=WHITE, width=2)
            for k in range(5):
                ion(d, vx - 16 + k * 8, cleft_y0 + 18 + 10 * math.sin(t + k + i), "ACh", 8)
        else:
            d.ellipse((vx - 20, yy - 20, vx + 20, yy + 20), fill=(250, 240, 210), outline=WHITE, width=2)
            for k in range(4):
                ang = k * math.pi / 2 + t
                ion(d, vx + 8 * math.cos(ang), yy + 8 * math.sin(ang), "ACh", 7)
    # Ca channels
    ca_state = "open" if phase >= 1 else "closed"
    _channel(d, x0 + 320, cleft_y0 - 8, "Ca", ca_state, h=70, w=30)
    if phase >= 1:
        for i in range(3):
            yy = cleft_y0 - 90 + ((t * 40 + i * 20) % 100)
            ion(d, x0 + 320, yy, "Ca", 10)
        d.text((x0 + 320, y0 + 70), "Ca²⁺ in", font=font("bold", 18), fill=CA, anchor="mm")
    # receptors
    rec_state = "open" if phase >= 5 else "closed"
    for i, rx in enumerate((x0 + 500, x0 + 620, x0 + 740)):
        _channel(d, rx, cleft_y1 + 8, "ligand", rec_state if i == 0 or phase >= 6 else "closed", h=64, w=28)
    if phase >= 5:
        for i in range(4):
            yy = cleft_y1 + 20 + ((t * 35 + i * 16) % 90)
            ion(d, x0 + 500 + 8 * math.sin(t + i), yy, "Na", 9)
        d.text((x1 - 120, y1 - 70), "Na⁺ in", font=font("bold", 18), fill=NA, anchor="mm")
    if phase >= 7:
        d.rounded_rectangle((x1 - 360, y1 - 90, x1 - 100, y1 - 46), 10, fill=(20, 70, 50), outline=GOLD, width=2)
        d.text((x1 - 230, y1 - 68), "new action potential", font=font("bold", 16), fill=GOLD, anchor="mm")
    if labels:
        leader(d, x0 + 200, y0 + 155, x0 + 200, y0 + 60, "mitochondrion")
        leader(d, x0 + 320, cleft_y0 - 40, x0 + 250, cleft_y0 - 90, "Ca²⁺ channel")
        leader(d, x0 + 580, y0 + 170, x0 + 580, y0 + 80, "synaptic vesicle")
        leader(d, x0 + 700, cleft_y0 + 24, x1 - 90, cleft_y0 + 24, "cleft", "right")
        leader(d, x0 + 620, cleft_y1 + 30, x0 + 400, y1 - 50, "ACh receptor")


def synapse(d, box, t=0.0, revealed=None, phase=0):
    _synapse_base(d, box, phase=phase, t=t, labels=False)


def synapse_labels(d, box, t=0.0, revealed=None, phase=0):
    _synapse_base(d, box, phase=0, t=t, labels=True)


def ache(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    ion_key(d, (x0 + 16, y0 + 10, x1 - 16, y0 + 46), ["ACh"])
    y = (y0 + y1) / 2
    d.rounded_rectangle((x0 + 80, y - 40, x1 - 80, y + 40), 16, fill=(40, 90, 130), outline=LINE, width=2)
    d.text(((x0 + x1) / 2, y - 70), "synaptic cleft", font=font("bold", 20), fill=WHITE, anchor="mm")
    # ACh approaching enzyme
    for i in range(3):
        xx = x0 + 180 + i * 80 + 10 * math.sin(t)
        ion(d, xx, y, "ACh", 14)
    d.rounded_rectangle((x0 + 520, y - 28, x0 + 760, y + 28), 12, fill=PUMP, outline=PUMP_EDGE, width=3)
    d.text((x0 + 640, y), "acetylcholinesterase", font=font("bold", 18), fill=(40, 30, 10), anchor="mm")
    # products
    d.text((x0 + 860, y - 18), "acetate", font=font("bold", 20), fill=MUTED, anchor="lm")
    ion(d, x0 + 900, y + 18, "Ch", 12)
    d.text((x0 + 930, y + 18), "choline", font=font("bold", 20), fill=CHOLINE, anchor="lm")
    d.text(((x0 + x1) / 2, y1 - 36), "Hydrolysis: acetylcholine  →  acetate + choline", font=font("bold", 22), fill=GOLD, anchor="mm")


def recycling(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=TEAL)
    steps = [
        ("1", "AChE splits ACh", "acetate + choline"),
        ("2", "Choline re-enters knob", "presynaptic transporter"),
        ("3", "ACh remade", "choline + acetyl-CoA"),
        ("4", "Packed into vesicles", "ready for the next impulse"),
    ]
    w = (x1 - x0 - 80) / 4
    for i, (n, title, body) in enumerate(steps):
        xa = x0 + 40 + i * w
        d.rounded_rectangle((xa, y0 + 80, xa + w - 20, y1 - 50), 16, fill=(16, 36, 60), outline=LINE, width=2)
        d.ellipse((xa + 20, y0 + 100, xa + 58, y0 + 138), fill=GOLD)
        d.text((xa + 39, y0 + 119), n, font=font("bold", 22), fill=(20, 20, 20), anchor="mm")
        d.text((xa + 20, y0 + 170), title, font=font("bold", 22), fill=WHITE)
        text_block(d, (xa + 20, y0 + 220), body, font("regular", 20), MUTED, w - 50)
        if i < 3:
            d.polygon([(xa + w - 28, (y0 + y1) / 2), (xa + w - 8, (y0 + y1) / 2 - 12), (xa + w - 8, (y0 + y1) / 2 + 12)], fill=GOLD)


def one_way(d, box, t=0.0, revealed=None):
    x0, y0, x1, y1 = box
    card(d, box, accent=GOLD)
    d.rounded_rectangle((x0 + 60, y0 + 70, (x0 + x1) / 2 - 20, y1 - 50), 18, fill=(196, 140, 88), outline=WHITE, width=2)
    d.rounded_rectangle(((x0 + x1) / 2 + 20, y0 + 70, x1 - 60, y1 - 50), 18, fill=(176, 118, 80), outline=WHITE, width=2)
    d.text(((x0 + 60 + (x0 + x1) / 2 - 20) / 2, y0 + 100), "presynaptic only", font=font("bold", 24), fill=(40, 24, 10), anchor="mm")
    d.text(((x0 + 60 + (x0 + x1) / 2 - 20) / 2, y0 + 170), "vesicles  ·  Ca²⁺ channels", font=font("semibold", 20), fill=(40, 24, 10), anchor="mm")
    d.text(((x0 + 60 + (x0 + x1) / 2 - 20) / 2, y0 + 210), "ACh release", font=font("bold", 22), fill=(40, 24, 10), anchor="mm")
    d.text((((x0 + x1) / 2 + 20 + x1 - 60) / 2, y0 + 100), "postsynaptic only", font=font("bold", 24), fill=(40, 24, 10), anchor="mm")
    d.text((((x0 + x1) / 2 + 20 + x1 - 60) / 2, y0 + 170), "ACh receptors  ·  AChE", font=font("semibold", 20), fill=(40, 24, 10), anchor="mm")
    d.text((((x0 + x1) / 2 + 20 + x1 - 60) / 2, y0 + 210), "ligand-gated Na⁺ channels", font=font("bold", 22), fill=(40, 24, 10), anchor="mm")
    d.polygon([((x0 + x1) / 2 - 10, (y0 + y1) / 2), ((x0 + x1) / 2 + 16, (y0 + y1) / 2 - 16), ((x0 + x1) / 2 + 16, (y0 + y1) / 2 + 16)], fill=GOLD)
    d.text(((x0 + x1) / 2, y1 - 70), "one-way", font=font("bold", 24), fill=GOLD, anchor="mm")


def paste_micrograph(img, box, filename, caption, credit):
    path = MEDIA / filename
    x0, y0, x1, y1 = box
    d = ImageDraw.Draw(img)
    card(d, box, accent=GOLD)
    if path.exists():
        src = Image.open(path).convert("RGB")
        # crop center and fit
        bw, bh = x1 - x0 - 48, y1 - y0 - 130
        src_ratio = src.width / src.height
        box_ratio = bw / bh
        if src_ratio > box_ratio:
            new_h = src.height
            new_w = int(src.height * box_ratio)
            left = (src.width - new_w) // 2
            src = src.crop((left, 0, left + new_w, new_h))
        else:
            new_w = src.width
            new_h = int(src.width / box_ratio)
            top = (src.height - new_h) // 2
            src = src.crop((0, top, new_w, top + new_h))
        src = src.resize((bw, bh), Image.Resampling.LANCZOS)
        src = ImageEnhance.Contrast(src).enhance(1.12)
        img.paste(src, (x0 + 24, y0 + 24))
    d.text((x0 + 28, y1 - 88), caption, font=font("semibold", 20), fill=WHITE)
    d.text((x0 + 28, y1 - 52), credit, font=font("regular", 16), fill=MUTED)


DIAGRAMS = {
    "neurone_anatomy": neurone_anatomy,
    "membrane_rest": membrane_rest,
    "ion_gradients": ion_gradients,
    "nak_pump": nak_pump,
    "leak_channels": leak_channels,
    "ap_graph": ap_graph,
    "threshold": threshold,
    "membrane_depol": membrane_depol,
    "membrane_peak": membrane_peak,
    "membrane_repol": membrane_repol,
    "membrane_hyper": membrane_hyper,
    "local_currents": local_currents,
    "refractory": refractory,
    "unmyelinated": unmyelinated,
    "saltatory": saltatory,
    "synapse": synapse,
    "synapse_labels": synapse_labels,
    "ache": ache,
    "recycling": recycling,
    "one_way": one_way,
}
