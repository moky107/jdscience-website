"""Original JDScience teaching diagrams — independently drawn, labelled, classroom-ready."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .theme import MEDIA

TEAL = (0, 150, 136)
TEAL_DARK = (0, 77, 64)
NAVY = (30, 58, 95)
ROSE = (190, 24, 93)
AMBER = (217, 119, 6)
INK = (15, 23, 42)
MUTED = (71, 85, 105)
CREAM = (240, 253, 250)
WHITE = (255, 255, 255)
BLUE = (37, 99, 235)
PURPLE = (91, 33, 182)
GREY = (148, 163, 184)
PINK = (254, 226, 226)
MINT = (209, 250, 229)
SKY = (224, 242, 254)
GOLD = (254, 243, 199)


def _font(size: int, bold: bool = False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def _new(w=1400, h=1000, bg=WHITE):
    img = Image.new("RGB", (w, h), bg)
    return img, ImageDraw.Draw(img)


def _leader(d, x1, y1, x2, y2, text, fill=INK, font=None):
    font = font or _font(20, True)
    d.line((x1, y1, x2, y2), fill=fill, width=2)
    d.ellipse((x1 - 4, y1 - 4, x1 + 4, y1 + 4), fill=fill)
    d.text((x2 + 6, y2 - 12), text, fill=fill, font=font)


def _callout(d, sx, sy, lx, ly, title, sub="", col=INK, w=340, h=72):
    mid_x = lx - 16
    d.line((sx, sy, mid_x, ly + h // 2), fill=col, width=2)
    d.line((mid_x, ly + h // 2, lx, ly + h // 2), fill=col, width=2)
    d.ellipse((sx - 5, sy - 5, sx + 5, sy + 5), fill=col)
    d.rounded_rectangle((lx, ly, lx + w, ly + h), 10, fill=WHITE, outline=col, width=2)
    d.rectangle((lx, ly, lx + 8, ly + h), fill=col)
    d.text((lx + 18, ly + 8), title, fill=col, font=_font(18, True))
    if sub:
        d.text((lx + 18, ly + 36), sub, fill=INK, font=_font(16))


def _double_arrow(d, x1, y1, x2, y2, fill=INK, width=3):
    d.line((x1, y1, x2, y2), fill=fill, width=width)
    ang = math.atan2(y2 - y1, x2 - x1)
    for end, sign in (( (x1, y1), 1), ((x2, y2), -1)):
        a = ang + sign * math.pi
        px, py = end
        d.polygon([
            (px, py),
            (px + 12 * math.cos(a + 0.4), py + 12 * math.sin(a + 0.4)),
            (px + 12 * math.cos(a - 0.4), py + 12 * math.sin(a - 0.4)),
        ], fill=fill)


def save(img: Image.Image, name: str) -> Path:
    path = MEDIA / name
    img.save(path, optimize=True)
    return path


def atom_labelled() -> Path:
    img, d = _new(1400, 1000, CREAM)
    cx, cy = 520, 500
    d.ellipse((cx - 46, cy - 46, cx + 46, cy + 46), fill=PINK, outline=ROSE, width=3)
    protons = [(-12, -10), (10, -8), (-4, 12)]
    neutrons = [(12, 10), (-16, 6), (4, -18), (14, 0)]
    for x, y in protons:
        d.ellipse((cx + x - 8, cy + y - 8, cx + x + 8, cy + y + 8), fill=ROSE, outline=(127, 29, 29), width=1)
    for x, y in neutrons:
        d.ellipse((cx + x - 8, cy + y - 8, cx + x + 8, cy + y + 8), fill=NAVY, outline=(15, 23, 42), width=1)
    for r in (170, 300):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=TEAL, width=4)
    electrons = [(cx + 170, cy), (cx - 170, cy), (cx + 80, cy - 290)]
    for x, y in electrons:
        d.ellipse((x - 14, y - 14, x + 14, y + 14), fill=BLUE, outline=NAVY, width=2)
    fb, f = _font(26, True), _font(20)
    _leader(d, cx + 20, cy - 20, 900, 220, "Nucleus: 3 protons + 4 neutrons", ROSE, fb)
    _leader(d, cx + 170, cy, 900, 360, "Electron (charge −1)", BLUE, fb)
    _leader(d, cx + 300, cy - 40, 900, 500, "Electron shell / energy level", TEAL_DARK, fb)
    d.text((80, 60), "Lithium-7 atom  ·  schematic, not to scale", fill=TEAL_DARK, font=_font(32, True))
    d.text((80, 920), "Neutral atom: 3 protons = 3 electrons. Almost all mass is in the tiny nucleus.", fill=MUTED, font=f)
    d.rounded_rectangle((900, 620, 1320, 860), 16, fill=WHITE, outline=TEAL, width=2)
    d.text((930, 650), "Particle key", fill=TEAL_DARK, font=fb)
    d.ellipse((940, 720, 972, 752), fill=ROSE)
    d.text((990, 722), "Proton  +1", fill=INK, font=f)
    d.ellipse((940, 770, 972, 802), fill=NAVY)
    d.text((990, 772), "Neutron  0", fill=INK, font=f)
    d.ellipse((940, 820, 972, 852), fill=BLUE)
    d.text((990, 822), "Electron  −1", fill=INK, font=f)
    return save(img, "atom-labelled.png")


def isotope_compare() -> Path:
    img, d = _new(1400, 980, WHITE)
    d.text((80, 40), "Same element, different neutrons", fill=TEAL_DARK, font=_font(32, True))
    for i, (title, n, extra) in enumerate([("Chlorine-35", 18, "more abundant"), ("Chlorine-37", 20, "less abundant")]):
        x0 = 70 + i * 680
        d.rounded_rectangle((x0, 120, x0 + 620, 880), 24, fill=CREAM if i == 0 else SKY, outline=TEAL, width=3)
        d.text((x0 + 40, 150), title, fill=TEAL_DARK, font=_font(30, True))
        cx, cy = x0 + 220, 420
        d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=PINK, outline=ROSE, width=3)
        d.text((cx - 40, cy - 18), f"17 p\n{n} n", fill=ROSE, font=_font(22, True))
        d.ellipse((cx - 150, cy - 150, cx + 150, cy + 150), outline=TEAL, width=3)
        d.ellipse((cx - 230, cy - 230, cx + 230, cy + 230), outline=NAVY, width=3)
        d.text((x0 + 40, 700), "17 protons  ·  17 electrons", fill=INK, font=_font(22, True))
        d.text((x0 + 40, 750), f"{n} neutrons", fill=NAVY, font=_font(22, True))
        d.text((x0 + 40, 800), extra, fill=MUTED, font=_font(20))
    return save(img, "isotope-compare.png")


def ion_formation() -> Path:
    img, d = _new(1400, 980, WHITE)
    d.text((80, 40), "Ion formation: electrons move, the nucleus does not", fill=TEAL_DARK, font=_font(30, True))
    panels = [
        (60, "Na atom", "11 p, 11 e", "2,8,1", "neutral", CREAM, TEAL),
        (500, "electron lost", "e⁻ leaves", "outer shell", "transfer", GOLD, AMBER),
        (940, "Na⁺ ion", "11 p, 10 e", "2,8", "charge +1", PINK, ROSE),
    ]
    for x, title, counts, shells, note, fill, edge in panels:
        d.rounded_rectangle((x, 140, x + 400, 860), 22, fill=fill, outline=edge, width=3)
        d.text((x + 30, 170), title, fill=edge, font=_font(28, True))
        d.ellipse((x + 110, 280, x + 290, 460), outline=edge, width=5)
        d.ellipse((x + 170, 340, x + 230, 400), fill=ROSE)
        d.text((x + 30, 520), counts, fill=INK, font=_font(24, True))
        d.text((x + 30, 580), f"Shells: {shells}", fill=NAVY, font=_font(22))
        d.text((x + 30, 680), note, fill=MUTED, font=_font(22, True))
    d.polygon([(470, 470), (500, 500), (470, 530)], fill=AMBER)
    d.polygon([(910, 470), (940, 500), (910, 530)], fill=AMBER)
    return save(img, "ion-formation.png")


def particle_compare() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((80, 36), "Subatomic particles compared", fill=TEAL_DARK, font=_font(32, True))
    rows = [
        ("Proton", "+1", "1", "Nucleus", ROSE, "Identifies the element (Z)"),
        ("Neutron", "0", "1", "Nucleus", NAVY, "Changes the isotope (A − Z)"),
        ("Electron", "−1", "1/1836", "Shells", BLUE, "Lost or gained when ions form"),
    ]
    for i, (name, q, m, loc, col, note) in enumerate(rows):
        y = 120 + i * 230
        d.rounded_rectangle((70, y, 1330, y + 210), 20, fill=CREAM if i % 2 == 0 else SKY)
        d.ellipse((110, y + 50, 210, y + 150), fill=col)
        d.text((250, y + 30), name, fill=INK, font=_font(30, True))
        d.text((250, y + 90), f"Charge {q}     Relative mass {m}     Found in the {loc.lower()}", fill=MUTED, font=_font(22))
        d.text((250, y + 140), note, fill=col, font=_font(22, True))
    return save(img, "particle-compare.png")


def sodium_nuclide_blank() -> Path:
    img, d = _new(1400, 720, WHITE)
    d.text((60, 30), "Nuclide notation  ·  complete the labels", fill=TEAL_DARK, font=_font(28, True))
    d.rounded_rectangle((80, 120, 620, 560), 24, fill=CREAM, outline=TEAL, width=3)
    d.text((160, 200), "?", fill=TEAL_DARK, font=_font(64, True))
    d.text((160, 300), "?", fill=NAVY, font=_font(56, True))
    d.text((320, 230), "Na", fill=INK, font=_font(100, True))
    for i, lab in enumerate(("Mass number A", "Atomic number Z", "Protons", "Neutrons", "Electrons in Na⁺")):
        y = 140 + i * 80
        d.rounded_rectangle((700, y, 1320, y + 64), 10, fill=WHITE, outline=TEAL, width=2)
        d.text((720, y + 18), lab + "  =", fill=MUTED, font=_font(20, True))
    return save(img, "sodium-nuclide-blank.png")


def sodium_nuclide() -> Path:
    img, d = _new(1400, 920, WHITE)
    d.text((60, 30), "Nuclide notation  ·  sodium-23", fill=TEAL_DARK, font=_font(30, True))
    d.rounded_rectangle((70, 110, 620, 620), 24, fill=CREAM, outline=TEAL, width=3)
    d.text((150, 180), "23", fill=TEAL_DARK, font=_font(72, True))
    d.text((150, 280), "11", fill=NAVY, font=_font(64, True))
    d.text((310, 210), "Na", fill=INK, font=_font(110, True))
    _callout(d, 220, 210, 680, 140, "Mass number A = 23", "protons + neutrons", TEAL_DARK, 620, 70)
    _callout(d, 220, 320, 680, 240, "Atomic number Z = 11", "protons — identifies the element", NAVY, 620, 70)
    _callout(d, 430, 300, 680, 340, "Chemical symbol", "Na is still sodium if the charge changes", INK, 620, 70)
    d.rounded_rectangle((70, 660, 1330, 880), 18, fill=SKY, outline=NAVY, width=2)
    d.text((100, 690), "Neutrons  =  A − Z  =  23 − 11  =  12", fill=TEAL_DARK, font=_font(26, True))
    d.text((100, 750), "Neutral atom: electrons = Z = 11", fill=NAVY, font=_font(24, True))
    d.text((100, 810), "Na⁺ ion: still 11 protons; electrons = 10. The nucleus does not change.", fill=INK, font=_font(22))
    return save(img, "sodium-nuclide.png")


def ar_weighted() -> Path:
    img, d = _new(1400, 920, WHITE)
    d.text((70, 36), "Relative atomic mass is a weighted mean", fill=TEAL_DARK, font=_font(30, True))
    d.text((70, 90), "Chlorine: 75% chlorine-35 and 25% chlorine-37", fill=MUTED, font=_font(22))
    d.rectangle((120, 200, 120 + int(9.0 * 75), 360), fill=TEAL)
    d.rectangle((120, 420, 120 + int(9.0 * 25), 580), fill=NAVY)
    d.text((820, 250), "75 × 35", fill=TEAL_DARK, font=_font(28, True))
    d.text((820, 470), "25 × 37", fill=NAVY, font=_font(28, True))
    d.rounded_rectangle((120, 660, 1280, 860), 18, fill=GOLD)
    d.text((160, 700), "Aᵣ  =  (75 × 35 + 25 × 37) / 100  =  35.5", fill=INK, font=_font(32, True))
    d.text((160, 770), "No unit. This is the value shown on the periodic table.", fill=MUTED, font=_font(22))
    return save(img, "ar-weighted.png")


def mass_spectrum() -> Path:
    img, d = _new(1400, 900, WHITE)
    d.text((70, 36), "Simple mass spectrum / abundance sketch", fill=TEAL_DARK, font=_font(30, True))
    d.line((160, 760, 1280, 760), fill=INK, width=3)
    d.line((160, 160, 160, 760), fill=INK, width=3)
    d.text((40, 140), "Relative\nabundance", fill=MUTED, font=_font(18))
    d.text((1100, 780), "m/z  (mass number)", fill=MUTED, font=_font(20))
    for mz, h, col, lab in ((35, 520, TEAL, "³⁵Cl"), (37, 180, NAVY, "³⁷Cl")):
        x = 160 + (mz - 32) * 140
        d.rectangle((x - 28, 760 - h, x + 28, 760), fill=col)
        d.text((x - 30, 760 - h - 50), lab, fill=col, font=_font(24, True))
    d.text((200, 820), "Taller peak = more abundant isotope. Peak position = mass number of the ion.", fill=MUTED, font=_font(20))
    return save(img, "mass-spectrum.png")


def shells_diagram() -> Path:
    img, d = _new(1300, 1000, WHITE)
    cx, cy = 520, 520
    d.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), fill=ROSE)
    d.text((cx - 34, cy - 10), "Nuc.", fill=WHITE, font=_font(16, True))
    for r, lab, col in ((120, "1st shell  ·  max 2", TEAL), (230, "2nd shell  ·  max 8", NAVY), (340, "3rd shell  ·  max 8 at this level", PURPLE), (450, "4th shell", AMBER)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=col, width=4)
        d.text((cx + r - 20, cy - 14), lab, fill=col, font=_font(18, True))
    d.text((70, 40), "Electron shells (first 20 elements)", fill=TEAL_DARK, font=_font(30, True))
    d.text((70, 920), "After 2,8,8 the next electrons occupy the 4th shell: calcium is 2,8,8,2 — not 2,8,10.", fill=MUTED, font=_font(20))
    return save(img, "electron-shells.png")


def orbital_boxes() -> Path:
    img, d = _new(1400, 960, WHITE)
    d.text((70, 28), "Orbital box diagrams — boxes and spin arrows drawn", fill=TEAL_DARK, font=_font(30, True))
    d.text((70, 78), "Each box is one orbital. An up arrow and a down arrow are electrons of opposite spin.", fill=MUTED, font=_font(20))

    def boxes(x, y, labels, arrows, title, note):
        d.text((x, y - 44), title, fill=INK, font=_font(24, True))
        for i, lab in enumerate(labels):
            bx = x + i * 96
            d.rectangle((bx, y, bx + 82, y + 96), outline=TEAL_DARK, width=3, fill=WHITE)
            d.text((bx + 22, y + 102), lab, fill=TEAL_DARK, font=_font(16, True))
            arts = arrows[i] if i < len(arrows) else ""
            if "u" in arts:
                d.line((bx + 30, y + 74, bx + 30, y + 22), fill=ROSE, width=4)
                d.polygon([(bx + 30, y + 16), (bx + 20, y + 32), (bx + 40, y + 32)], fill=ROSE)
            if "d" in arts:
                d.line((bx + 54, y + 22, bx + 54, y + 74), fill=NAVY, width=4)
                d.polygon([(bx + 54, y + 80), (bx + 44, y + 64), (bx + 64, y + 64)], fill=NAVY)
        d.text((x, y + 132), note, fill=MUTED, font=_font(17))

    boxes(80, 180, ["1s"], ["ud"], "Helium  1s²", "Pauli: two electrons in one orbital must have opposite spin.")
    boxes(80, 430, ["2px", "2py", "2pz"], ["u", "u", "u"], "Nitrogen  2p³", "Hund: one electron in each equal-energy orbital before pairing.")
    boxes(80, 690, ["2px", "2py", "2pz"], ["ud", "u", "u"], "Oxygen  2p⁴", "The fourth 2p electron pairs in one box. The other two stay unpaired.")
    return save(img, "orbital-boxes.png")


def aufbau_order() -> Path:
    img, d = _new(1400, 900, WHITE)
    d.text((70, 36), "Aufbau filling order used at this level", fill=TEAL_DARK, font=_font(30, True))
    order = ["1s", "2s", "2p", "3s", "3p", "4s", "3d"]
    caps = ["2", "2", "6", "2", "6", "2", "10"]
    for i, (orb, cap) in enumerate(zip(order, caps)):
        x = 80 + i * 185
        d.rounded_rectangle((x, 200, x + 165, 420), 16, fill=CREAM, outline=TEAL, width=3)
        d.text((x + 40, 230), orb, fill=TEAL_DARK, font=_font(36, True))
        d.text((x + 28, 320), f"max {cap}", fill=MUTED, font=_font(20))
        if i < 6:
            d.polygon([(x + 170, 300), (x + 185, 310), (x + 170, 320)], fill=AMBER)
    d.rounded_rectangle((80, 500, 1320, 820), 18, fill=SKY)
    d.text((110, 540), "4s is filled before 3d for isolated atoms of the first transition series.", fill=INK, font=_font(24, True))
    d.text((110, 610), "Oxygen:  1s²  2s²  2p⁴", fill=TEAL_DARK, font=_font(28, True))
    d.text((110, 680), "Calcium:  1s²  2s²  2p⁶  3s²  3p⁶  4s²", fill=TEAL_DARK, font=_font(28, True))
    d.text((110, 750), "Write the superscripts. Do not write 1s2 as plain text.", fill=MUTED, font=_font(20))
    return save(img, "aufbau-order.png")


def spd_blocks() -> Path:
    img, d = _new(1400, 820, WHITE)
    d.text((70, 36), "s, p and d blocks — teaching map", fill=TEAL_DARK, font=_font(30, True))
    blocks = [
        (70, "s-block", "Groups 1 and 2\nouter electron in ns", TEAL, "Na, Mg, Ca, He*"),
        (500, "p-block", "Groups 13–18\nouter electron in np", NAVY, "C, N, O, F, Cl"),
        (930, "d-block", "Transition metals\nfilling (n−1)d", PURPLE, "Fe, Cu, Zn"),
    ]
    for x, title, body, col, ex in blocks:
        d.rounded_rectangle((x, 140, x + 400, 720), 22, fill=CREAM, outline=col, width=4)
        d.rectangle((x, 140, x + 400, 220), fill=col)
        d.text((x + 24, 158), title, fill=WHITE, font=_font(28, True))
        d.text((x + 24, 280), body, fill=INK, font=_font(24))
        d.text((x + 24, 520), ex, fill=col, font=_font(22, True))
    d.text((70, 760), "*Helium is 1s² so it is s-block by configuration, even though it sits with the noble gases.", fill=MUTED, font=_font(18))
    return save(img, "spd-blocks.png")


def ion_configs() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((70, 36), "From atom configuration to ion configuration", fill=TEAL_DARK, font=_font(28, True))
    rows = [
        ("Na  2,8,1", "lose 1 e⁻", "Na⁺  2,8", TEAL),
        ("O  2,6", "gain 2 e⁻", "O²⁻  2,8  ·  1s² 2s² 2p⁶", ROSE),
        ("Mg  2,8,2", "lose 2 e⁻", "Mg²⁺  2,8  ·  1s² 2s² 2p⁶", NAVY),
        ("Cl  2,8,7", "gain 1 e⁻", "Cl⁻  2,8,8", PURPLE),
    ]
    for i, (atom, arrow, ion, col) in enumerate(rows):
        y = 130 + i * 170
        d.rounded_rectangle((70, y, 480, y + 140), 16, fill=CREAM)
        d.rounded_rectangle((820, y, 1330, y + 140), 16, fill=SKY)
        d.text((100, y + 48), atom, fill=INK, font=_font(28, True))
        d.text((530, y + 48), arrow, fill=col, font=_font(24, True))
        d.text((860, y + 48), ion, fill=col, font=_font(28, True))
    return save(img, "ion-configs.png")


def ion_transfer() -> Path:
    img, d = _new(1400, 920, WHITE)
    d.text((70, 36), "Electron transfer: sodium and chlorine", fill=TEAL_DARK, font=_font(30, True))
    d.rounded_rectangle((70, 130, 640, 850), 22, fill=CREAM, outline=TEAL, width=3)
    d.text((110, 160), "Na atom → Na⁺", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((230, 280, 430, 480), outline=NAVY, width=4)
    d.ellipse((300, 350, 360, 410), fill=ROSE)
    d.ellipse((470, 250, 520, 300), fill=BLUE)
    d.text((110, 540), "11 protons, 11 electrons", fill=INK, font=_font(22))
    d.text((110, 600), "Loses 1 electron → 10 electrons", fill=INK, font=_font(22))
    d.text((110, 680), "Overall charge +1", fill=ROSE, font=_font(26, True))
    d.rounded_rectangle((760, 130, 1330, 850), 22, fill=PINK, outline=ROSE, width=3)
    d.text((800, 160), "Cl atom → Cl⁻", fill=ROSE, font=_font(28, True))
    d.ellipse((920, 280, 1120, 480), outline=ROSE, width=4)
    d.ellipse((990, 350, 1050, 410), fill=NAVY)
    d.ellipse((1160, 250, 1210, 300), fill=BLUE)
    d.text((800, 540), "17 protons, 17 electrons", fill=INK, font=_font(22))
    d.text((800, 600), "Gains 1 electron → 18 electrons", fill=INK, font=_font(22))
    d.text((800, 680), "Overall charge −1", fill=NAVY, font=_font(26, True))
    d.polygon([(650, 460), (750, 490), (650, 520)], fill=AMBER)
    return save(img, "ion-transfer.png")


def ionic_lattice() -> Path:
    img, d = _new(1300, 920, WHITE)
    d.text((260, 30), "Giant ionic lattice (NaCl-style)", fill=TEAL_DARK, font=_font(30, True))
    for r in range(4):
        for c in range(5):
            x = 180 + c * 190
            y = 140 + r * 170
            plus = (r + c) % 2 == 0
            col = ROSE if plus else BLUE
            d.ellipse((x, y, x + 100, y + 100), fill=col)
            d.text((x + 32, y + 28), "+" if plus else "−", fill=WHITE, font=_font(36, True))
    d.text((80, 840), "Alternating cations and anions. Strong electrostatic attraction in every direction.", fill=MUTED, font=_font(20))
    return save(img, "ionic-lattice.png")


def covalent_pair() -> Path:
    img, d = _new(1300, 860, WHITE)
    d.text((320, 36), "A shared pair of electrons", fill=TEAL_DARK, font=_font(30, True))
    d.ellipse((180, 200, 560, 580), outline=NAVY, width=6)
    d.ellipse((740, 200, 1120, 580), outline=ROSE, width=6)
    d.ellipse((610, 330, 690, 410), fill=BLUE)
    d.ellipse((610, 430, 690, 510), fill=BLUE)
    d.text((320, 360), "H", fill=NAVY, font=_font(56, True))
    d.text((900, 350), "Cl", fill=ROSE, font=_font(56, True))
    d.text((160, 680), "Each atom obtains a more stable outer shell by sharing.", fill=INK, font=_font(24))
    d.text((160, 740), "The shared pair is the covalent bond — attracted to both nuclei.", fill=TEAL_DARK, font=_font(24, True))
    return save(img, "covalent-pair.png")


def covalent_molecules() -> Path:
    img, d = _new(1400, 900, WHITE)
    d.text((70, 24), "Displayed formulae — count the shared pairs", fill=TEAL_DARK, font=_font(28, True))

    def card(x, y, title, note):
        d.rounded_rectangle((x, y, x + 420, y + 400), 16, fill=CREAM, outline=TEAL, width=2)
        d.text((x + 20, y + 16), title, fill=TEAL_DARK, font=_font(22, True))
        d.text((x + 20, y + 330), note, fill=INK, font=_font(18))

    card(70, 80, "H₂O", "2 shared pairs  ·  bent  ·  2 lone pairs on O")
    d.text((240, 180), "H", fill=NAVY, font=_font(28, True))
    d.line((275, 230, 310, 280), fill=TEAL_DARK, width=5)
    d.text((300, 280), "O", fill=ROSE, font=_font(32, True))
    d.line((345, 280, 380, 230), fill=TEAL_DARK, width=5)
    d.text((380, 180), "H", fill=NAVY, font=_font(28, True))

    card(520, 80, "CO₂", "2 double bonds  ·  linear")
    d.text((560, 230), "O", fill=ROSE, font=_font(32, True))
    d.line((610, 250, 690, 250), fill=TEAL_DARK, width=4)
    d.line((610, 262, 690, 262), fill=TEAL_DARK, width=4)
    d.text((700, 220), "C", fill=NAVY, font=_font(32, True))
    d.line((750, 250, 830, 250), fill=TEAL_DARK, width=4)
    d.line((750, 262, 830, 262), fill=TEAL_DARK, width=4)
    d.text((840, 220), "O", fill=ROSE, font=_font(32, True))

    card(970, 80, "N₂", "triple bond  ·  3 shared pairs")
    d.text((1060, 220), "N", fill=NAVY, font=_font(36, True))
    for dy in (-10, 2, 14):
        d.line((1115, 250 + dy, 1210, 250 + dy), fill=TEAL_DARK, width=4)
    d.text((1220, 220), "N", fill=NAVY, font=_font(36, True))

    card(70, 500, "CH₄", "4 shared pairs  ·  tetrahedral")
    d.text((240, 620), "H", fill=NAVY, font=_font(22, True))
    d.text((150, 700), "H", fill=NAVY, font=_font(22, True))
    d.text((250, 700), "C", fill=TEAL_DARK, font=_font(28, True))
    d.text((350, 700), "H", fill=NAVY, font=_font(22, True))
    d.text((240, 780), "H", fill=NAVY, font=_font(22, True))
    d.line((255, 655, 270, 700), fill=TEAL_DARK, width=3)
    d.line((185, 720, 245, 720), fill=TEAL_DARK, width=3)
    d.line((295, 720, 350, 720), fill=TEAL_DARK, width=3)
    d.line((270, 745, 255, 780), fill=TEAL_DARK, width=3)

    card(520, 500, "NH₃", "3 shared pairs  ·  1 lone pair on N")
    d.text((690, 620), "H", fill=NAVY, font=_font(22, True))
    d.text((600, 720), "H", fill=NAVY, font=_font(22, True))
    d.text((700, 700), "N", fill=TEAL_DARK, font=_font(28, True))
    d.text((800, 720), "H", fill=NAVY, font=_font(22, True))
    d.line((710, 655, 720, 700), fill=TEAL_DARK, width=3)
    d.line((640, 735, 695, 725), fill=TEAL_DARK, width=3)
    d.line((750, 725, 800, 735), fill=TEAL_DARK, width=3)
    d.text((730, 665), "lone pair", fill=MUTED, font=_font(16))

    card(970, 500, "O₂", "2 shared pairs  ·  double bond")
    d.text((1060, 660), "O", fill=ROSE, font=_font(36, True))
    d.line((1115, 685, 1210, 685), fill=TEAL_DARK, width=4)
    d.line((1115, 697, 1210, 697), fill=TEAL_DARK, width=4)
    d.text((1220, 660), "O", fill=ROSE, font=_font(36, True))
    return save(img, "covalent-molecules.png")


def diamond_graphite() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.rounded_rectangle((60, 80, 660, 800), 20, fill=CREAM, outline=TEAL, width=3)
    d.text((100, 110), "Diamond", fill=TEAL_DARK, font=_font(30, True))
    pts = [(220, 280), (360, 230), (500, 280), (360, 430), (220, 520), (500, 520)]
    for a, b in ((0, 1), (1, 2), (0, 3), (2, 3), (3, 4), (3, 5), (4, 5)):
        d.line((pts[a][0], pts[a][1], pts[b][0], pts[b][1]), fill=TEAL, width=4)
    for x, y in pts:
        d.ellipse((x - 14, y - 14, x + 14, y + 14), fill=NAVY)
    d.text((100, 620), "Each C bonded to 4 others.\nGiant covalent. No delocalised e⁻.", fill=INK, font=_font(22))
    d.rounded_rectangle((740, 80, 1340, 800), 20, fill=SKY, outline=NAVY, width=3)
    d.text((780, 110), "Graphite", fill=NAVY, font=_font(30, True))
    for row, y in enumerate((260, 380, 500)):
        for i in range(4):
            x = 820 + i * 110
            d.ellipse((x, y, x + 28, y + 28), fill=TEAL)
            if i < 3:
                d.line((x + 28, y + 14, x + 110, y + 14), fill=TEAL, width=3)
        d.text((1180, y), "layer", fill=MUTED, font=_font(18))
    d.text((780, 620), "Each C bonded to 3 others.\nDelocalised electrons between layers.", fill=INK, font=_font(22))
    return save(img, "diamond-graphite.png")


def metallic_lattice() -> Path:
    img, d = _new(1300, 900, WHITE)
    d.text((180, 30), "Metallic lattice and delocalised electrons", fill=TEAL_DARK, font=_font(28, True))
    for r in range(3):
        for c in range(5):
            x = 140 + c * 200 + (80 if r % 2 else 0)
            y = 160 + r * 180
            d.ellipse((x, y, x + 120, y + 120), fill=(253, 186, 116), outline=AMBER, width=4)
            d.text((x + 28, y + 40), "M⁺", fill=TEAL_DARK, font=_font(24, True))
    for pos in [(90, 200), (320, 250), (560, 180), (800, 280), (220, 520), (640, 540), (980, 430), (1100, 260)]:
        d.ellipse((pos[0], pos[1], pos[0] + 24, pos[1] + 24), fill=BLUE)
    d.text((80, 820), "Positive metal ions in a sea of delocalised electrons. The attraction is metallic bonding.", fill=MUTED, font=_font(20))
    return save(img, "metallic-lattice.png")


def animal_cell() -> Path:
    img, d = _new(1600, 1080, WHITE)
    d.text((40, 20), "Animal cell — labelled schematic", fill=TEAL_DARK, font=_font(30, True))
    d.ellipse((70, 90, 880, 980), fill=(226, 250, 241), outline=TEAL, width=8)
    # cytoplasm texture
    for x in range(140, 820, 46):
        for y in range(160, 920, 52):
            if (x - 475) ** 2 / 380 ** 2 + (y - 535) ** 2 / 410 ** 2 < 0.82:
                d.ellipse((x, y, x + 3, y + 3), fill=(167, 243, 208))
    # nucleus
    d.ellipse((310, 300, 620, 610), fill=(254, 226, 226), outline=ROSE, width=6)
    d.ellipse((328, 318, 602, 592), outline=(244, 63, 94), width=3)
    d.ellipse((400, 390, 530, 520), fill=ROSE)
    for ang in (30, 110, 200, 280):
        px = 465 + int(148 * math.cos(math.radians(ang)))
        py = 455 + int(148 * math.sin(math.radians(ang)))
        d.ellipse((px - 8, py - 8, px + 8, py + 8), fill=WHITE, outline=NAVY, width=2)
    # mitochondria with inner folds
    for mx, my in ((150, 220), (200, 700)):
        d.ellipse((mx, my, mx + 150, my + 90), fill=(237, 233, 254), outline=PURPLE, width=4)
        d.ellipse((mx + 12, my + 12, mx + 138, my + 78), outline=PURPLE, width=2)
        for i in range(4):
            fx = mx + 28 + i * 26
            d.line([(fx, my + 20), (fx + 10, my + 45), (fx, my + 70)], fill=PURPLE, width=2)
    # RER
    for i, y in enumerate((170, 198, 226)):
        d.arc((620, y, 820, y + 70), 200, 340, fill=AMBER, width=3)
        for j in range(5):
            d.ellipse((650 + j * 28, y + 8, 660 + j * 28, y + 18), fill=NAVY)
    # Golgi
    for i, y in enumerate((640, 662, 684, 706)):
        d.arc((640, y, 800, y + 46), 200, 340, fill=PURPLE, width=4)
    # lysosome
    d.ellipse((700, 780, 780, 860), fill=(254, 215, 170), outline=AMBER, width=3)
    _callout(d, 870, 200, 980, 90, "Cell-surface membrane", "phospholipid bilayer; selective", TEAL_DARK, 560, 68)
    _callout(d, 620, 450, 980, 190, "Nucleus + nucleolus", "DNA as chromatin; rRNA made here", ROSE, 560, 68)
    _callout(d, 300, 250, 980, 290, "Mitochondrion", "cristae increase area for ATP transfer", PURPLE, 560, 68)
    _callout(d, 780, 200, 980, 390, "Rough ER + ribosomes", "protein synthesis and processing", NAVY, 560, 68)
    _callout(d, 720, 680, 980, 490, "Golgi body", "modifies and packages proteins", PURPLE, 560, 68)
    _callout(d, 500, 880, 980, 590, "Cytoplasm", "aqueous site of many reactions", TEAL, 560, 68)
    _callout(d, 740, 820, 980, 690, "Lysosome / vesicle", "hydrolytic enzymes isolated", AMBER, 560, 68)
    d.text((40, 1020), "Original schematic — organelles are not to scale. Leader lines touch the structures.", fill=MUTED, font=_font(18))
    return save(img, "animal-cell.png")


def animal_cell_blank() -> Path:
    img, d = _new(1600, 1080, WHITE)
    d.text((40, 20), "Animal cell — label the structures", fill=TEAL_DARK, font=_font(30, True))
    d.ellipse((70, 90, 880, 980), fill=(226, 250, 241), outline=TEAL, width=8)
    d.ellipse((310, 300, 620, 610), fill=(254, 226, 226), outline=ROSE, width=6)
    d.ellipse((328, 318, 602, 592), outline=(244, 63, 94), width=3)
    d.ellipse((400, 390, 530, 520), fill=ROSE)
    for mx, my in ((150, 220), (200, 700)):
        d.ellipse((mx, my, mx + 150, my + 90), fill=(237, 233, 254), outline=PURPLE, width=4)
    for i, y in enumerate((170, 198, 226)):
        d.arc((620, y, 820, y + 70), 200, 340, fill=AMBER, width=3)
        for j in range(5):
            d.ellipse((650 + j * 28, y + 8, 660 + j * 28, y + 18), fill=NAVY)
    for y in (640, 662, 684, 706):
        d.arc((640, y, 800, y + 46), 200, 340, fill=PURPLE, width=4)
    d.ellipse((700, 780, 780, 860), fill=(254, 215, 170), outline=AMBER, width=3)
    points = [(870, 200), (620, 450), (300, 250), (780, 200), (720, 680), (500, 880), (740, 820)]
    for i, (sx, sy) in enumerate(points):
        ly = 90 + i * 120
        d.line((sx, sy, 980, ly + 34), fill=MUTED, width=2)
        d.ellipse((sx - 5, sy - 5, sx + 5, sy + 5), fill=MUTED)
        d.rounded_rectangle((980, ly, 1540, ly + 70), 10, fill=WHITE, outline=GREY, width=2)
        d.text((1000, ly + 22), f"{i+1}.", fill=MUTED, font=_font(20, True))
    d.text((40, 1020), "Write the name (and a function) in each box. Organelles are not to scale.", fill=MUTED, font=_font(18))
    return save(img, "animal-cell-blank.png")


def plant_cell() -> Path:
    img, d = _new(1600, 1080, WHITE)
    d.text((40, 20), "Plant cell — labelled schematic", fill=TEAL_DARK, font=_font(30, True))
    d.rounded_rectangle((60, 90, 900, 980), 10, outline=TEAL_DARK, width=14)
    d.rounded_rectangle((88, 118, 872, 952), 8, fill=(236, 253, 245), outline=TEAL, width=5)
    # vacuole
    d.rounded_rectangle((240, 220, 720, 560), 28, fill=(219, 234, 254), outline=BLUE, width=4)
    d.text((360, 360), "cell sap", fill=NAVY, font=_font(20, True))
    # chloroplast with grana stacks
    d.ellipse((140, 620, 360, 820), fill=(187, 247, 208), outline=(21, 128, 61), width=4)
    for gx, gy in ((175, 670), (230, 690), (185, 740)):
        for i in range(4):
            d.ellipse((gx, gy + i * 10, gx + 48, gy + 8 + i * 10), fill=(22, 163, 74), outline=(21, 128, 61), width=1)
    # nucleus pushed aside
    d.ellipse((540, 640, 760, 860), fill=PINK, outline=ROSE, width=4)
    d.ellipse((600, 700, 700, 800), fill=ROSE)
    # mitochondrion
    d.ellipse((150, 200, 280, 280), fill=(237, 233, 254), outline=PURPLE, width=3)
    _callout(d, 900, 160, 980, 90, "Cellulose cell wall", "support; freely permeable", TEAL_DARK, 560, 68)
    _callout(d, 870, 300, 980, 190, "Cell-surface membrane", "selectively permeable bilayer", TEAL, 560, 68)
    _callout(d, 720, 360, 980, 290, "Permanent vacuole", "cell sap; keeps the cell turgid", BLUE, 560, 68)
    _callout(d, 360, 720, 980, 390, "Chloroplast", "grana / thylakoids hold chlorophyll", (21, 128, 61), 560, 68)
    _callout(d, 760, 750, 980, 490, "Nucleus", "DNA; controls protein synthesis", ROSE, 560, 68)
    _callout(d, 280, 240, 980, 590, "Mitochondrion", "also present — aerobic respiration", PURPLE, 560, 68)
    d.text((40, 1020), "The wall is freely permeable. Exchange is controlled by the membrane inside it.", fill=MUTED, font=_font(18))
    return save(img, "plant-cell.png")


def plant_cell_blank() -> Path:
    img, d = _new(1600, 1080, WHITE)
    d.text((40, 20), "Plant cell — label the extra structures", fill=TEAL_DARK, font=_font(30, True))
    d.rounded_rectangle((60, 90, 900, 980), 10, outline=TEAL_DARK, width=14)
    d.rounded_rectangle((88, 118, 872, 952), 8, fill=(236, 253, 245), outline=TEAL, width=5)
    d.rounded_rectangle((240, 220, 720, 560), 28, fill=(219, 234, 254), outline=BLUE, width=4)
    d.ellipse((140, 620, 360, 820), fill=(187, 247, 208), outline=(21, 128, 61), width=4)
    d.ellipse((540, 640, 760, 860), fill=PINK, outline=ROSE, width=4)
    d.ellipse((600, 700, 700, 800), fill=ROSE)
    d.ellipse((150, 200, 280, 280), fill=(237, 233, 254), outline=PURPLE, width=3)
    points = [(900, 160), (870, 300), (720, 360), (360, 720), (760, 750)]
    names = ["1. wall", "2. membrane", "3. vacuole", "4. chloroplast", "5. nucleus"]
    for i, ((sx, sy), hint) in enumerate(zip(points, names)):
        ly = 120 + i * 140
        d.line((sx, sy, 980, ly + 34), fill=MUTED, width=2)
        d.ellipse((sx - 5, sy - 5, sx + 5, sy + 5), fill=MUTED)
        d.rounded_rectangle((980, ly, 1540, ly + 90), 10, fill=WHITE, outline=GREY, width=2)
        d.text((1000, ly + 30), hint + "  —", fill=MUTED, font=_font(20, True))
    return save(img, "plant-cell-blank.png")


def nucleus_detail() -> Path:
    img, d = _new(1400, 900, WHITE)
    d.text((60, 30), "Nucleus in more detail", fill=TEAL_DARK, font=_font(30, True))
    d.ellipse((80, 140, 780, 820), fill=PINK, outline=ROSE, width=8)
    d.ellipse((110, 170, 750, 790), outline=ROSE, width=4)
    d.ellipse((300, 340, 520, 560), fill=ROSE)
    for ang in (20, 80, 150, 220, 300):
        x = 430 + int(300 * math.cos(math.radians(ang)))
        y = 480 + int(300 * math.sin(math.radians(ang)))
        d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=WHITE, outline=NAVY, width=2)
    _leader(d, 760, 240, 900, 180, "Nuclear envelope (double membrane)", ROSE)
    _leader(d, 720, 400, 900, 360, "Nuclear pore — mRNA leaves", NAVY)
    _leader(d, 520, 450, 900, 520, "Nucleolus — rRNA / ribosome parts", ROSE)
    _leader(d, 200, 300, 900, 680, "Chromatin = DNA + protein", TEAL_DARK)
    return save(img, "nucleus-detail.png")


def mitochondrion() -> Path:
    img, d = _new(1500, 880, WHITE)
    d.text((50, 24), "Mitochondrion — structure linked to ATP transfer", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((60, 160, 880, 760), fill=(226, 232, 240), outline=NAVY, width=10)
    d.ellipse((105, 205, 835, 715), fill=(245, 243, 255), outline=PURPLE, width=5)
    for cx in (210, 330, 450, 570, 690):
        depth = 430 if cx in (330, 570) else 480
        d.line([(cx - 26, 230), (cx - 30, depth), (cx, depth + 40), (cx + 30, depth), (cx + 26, 230)], fill=PURPLE, width=4)
        d.line([(cx - 12, 245), (cx - 14, depth - 20), (cx, depth), (cx + 14, depth - 20), (cx + 12, 245)], fill=(167, 139, 250), width=2)
    d.ellipse((400, 560, 510, 640), outline=TEAL, width=2)
    d.text((418, 584), "DNA", fill=TEAL_DARK, font=_font(16, True))
    _callout(d, 880, 230, 960, 140, "Outer membrane", "smooth boundary", NAVY, 480, 68)
    _callout(d, 690, 360, 960, 240, "Inner membrane / cristae", "folded inwards; more area for proteins", PURPLE, 480, 68)
    _callout(d, 460, 600, 960, 360, "Matrix", "enzymes, circular DNA, 70S ribosomes", TEAL_DARK, 480, 68)
    d.text((50, 800), "Cristae increase surface area for respiratory proteins. Do not write that mitochondria ‘make energy’.", fill=MUTED, font=_font(18))
    return save(img, "mitochondrion.png")


def protein_pathway() -> Path:
    img, d = _new(1500, 720, WHITE)
    d.text((50, 24), "Protein trafficking: ribosome → RER → Golgi → vesicle", fill=TEAL_DARK, font=_font(26, True))
    steps = [
        (50, "Ribosome", "Translation\nof polypeptide", NAVY),
        (410, "RER", "Folding /\nprocessing", TEAL),
        (770, "Golgi body", "Modify and\npackage", PURPLE),
        (1130, "Vesicle", "Secretion at\nthe membrane", AMBER),
    ]
    for i, (x, title, body, col) in enumerate(steps):
        d.rounded_rectangle((x, 140, x + 320, 560), 20, fill=CREAM, outline=col, width=4)
        d.rectangle((x, 140, x + 320, 220), fill=col)
        d.text((x + 20, 158), f"{i+1}  {title}", fill=WHITE, font=_font(24, True))
        d.text((x + 24, 300), body, fill=INK, font=_font(22))
        if i < 3:
            d.polygon([(x + 330, 330), (x + 400, 360), (x + 330, 390)], fill=AMBER)
    return save(img, "protein-pathway.png")


def bilayer() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((60, 24), "Cell-surface membrane — fluid mosaic", fill=TEAL_DARK, font=_font(28, True))
    for i, y in enumerate((260, 420)):
        for x in range(80, 900, 70):
            d.ellipse((x + 10, y, x + 50, y + 40), fill=TEAL if i == 0 else TEAL_DARK)
            if i == 0:
                d.line((x + 30, y + 40, x + 30, y + 120), fill=NAVY, width=4)
            else:
                d.line((x + 30, y - 80, x + 30, y), fill=NAVY, width=4)
    d.rounded_rectangle((200, 300, 280, 420), 8, fill=PURPLE)
    d.rounded_rectangle((520, 280, 620, 440), 10, fill=AMBER)
    d.ellipse((760, 250, 820, 310), fill=ROSE)
    _leader(d, 900, 280, 1040, 180, "Hydrophilic heads", TEAL)
    _leader(d, 900, 380, 1040, 360, "Hydrophobic tails", NAVY)
    _leader(d, 620, 360, 1040, 520, "Protein channel / carrier", AMBER)
    _leader(d, 820, 280, 1040, 660, "Glycoprotein / recognition", ROSE)
    d.text((60, 760), "Selectively permeable. Cholesterol (animal cells) regulates fluidity. Proteins form a mosaic.", fill=MUTED, font=_font(18))
    return save(img, "bilayer.png")


def specialised_cells() -> Path:
    img, d = _new(1500, 900, WHITE)
    d.rounded_rectangle((50, 80, 720, 840), 20, fill=CREAM, outline=TEAL, width=3)
    d.text((80, 110), "Sperm cell", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((120, 280, 260, 420), fill=PINK, outline=ROSE, width=3)
    d.ellipse((200, 320, 360, 400), fill=GOLD, outline=AMBER, width=2)
    d.polygon([(360, 340), (680, 300), (680, 380)], fill=NAVY)
    d.text((80, 500), "Haploid nucleus in the head\nAcrosome enzymes\nMitochondria in the midpiece\nFlagellum for swimming", fill=INK, font=_font(22))
    d.rounded_rectangle((780, 80, 1450, 840), 20, fill=MINT, outline=(22, 163, 74), width=3)
    d.text((810, 110), "Palisade mesophyll", fill=(22, 163, 74), font=_font(28, True))
    d.rounded_rectangle((860, 220, 1180, 700), 8, outline=TEAL_DARK, width=5)
    d.ellipse((900, 280, 1140, 520), fill=SKY, outline=BLUE, width=2)
    d.ellipse((910, 560, 1020, 660), fill=(187, 247, 208), outline=(22, 163, 74), width=2)
    d.ellipse((1040, 540, 1140, 640), fill=PINK, outline=ROSE, width=2)
    d.text((810, 730), "Many chloroplasts · packed near the top of the leaf\nLarge vacuole · thin walls for gas diffusion", fill=INK, font=_font(20))
    return save(img, "specialised-cells.png")


def prokaryote_cell() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((60, 24), "Typical prokaryotic cell (not to scale)", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((70, 160, 920, 720), outline=NAVY, width=8)
    d.ellipse((100, 190, 890, 690), fill=CREAM, outline=TEAL, width=5)
    d.arc((220, 280, 560, 560), 200, 500, fill=ROSE, width=10)
    d.ellipse((640, 320, 760, 440), outline=PURPLE, width=4)
    for x in range(180, 820, 36):
        d.ellipse((x, 600, x + 10, 610), fill=BLUE)
    d.line((920, 430, 1180, 300), fill=AMBER, width=6)
    _leader(d, 920, 200, 1000, 140, "Cell wall (peptidoglycan)", NAVY)
    _leader(d, 890, 260, 1000, 240, "Cell membrane", TEAL)
    _leader(d, 560, 360, 1000, 380, "Loop of DNA (nucleoid)", ROSE)
    _leader(d, 760, 380, 1000, 500, "Plasmid", PURPLE)
    _leader(d, 400, 605, 1000, 620, "70S ribosomes", BLUE)
    d.line((920, 430, 1280, 280), fill=AMBER, width=6)
    d.line((1180, 300, 1240, 220), fill=AMBER, width=4)
    d.line((1180, 300, 1260, 360), fill=AMBER, width=4)
    _leader(d, 1240, 250, 1280, 160, "Flagellum", AMBER)
    return save(img, "prokaryote-cell.png")


def prokaryote_cell_blank() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((60, 24), "Bacterial cell — label the structures", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((70, 160, 920, 720), outline=NAVY, width=8)
    d.ellipse((100, 190, 890, 690), fill=CREAM, outline=TEAL, width=5)
    d.arc((220, 280, 560, 560), 200, 500, fill=ROSE, width=10)
    d.ellipse((640, 320, 760, 440), outline=PURPLE, width=4)
    for x in range(180, 820, 36):
        d.ellipse((x, 600, x + 10, 610), fill=BLUE)
    d.line((920, 430, 1180, 300), fill=AMBER, width=6)
    d.line((1120, 320, 1180, 240), fill=AMBER, width=4)
    for i, (sx, sy) in enumerate(((920, 200), (890, 260), (560, 360), (760, 380), (400, 605), (1180, 300))):
        ly = 80 + i * 110
        d.line((sx, sy, 1000, ly + 30), fill=MUTED, width=2)
        d.ellipse((sx - 4, sy - 4, sx + 4, sy + 4), fill=MUTED)
        d.rounded_rectangle((1000, ly, 1360, ly + 70), 10, fill=WHITE, outline=GREY, width=2)
        d.text((1018, ly + 22), f"{i+1}.", fill=MUTED, font=_font(20, True))
    return save(img, "prokaryote-cell-blank.png")


def size_scale() -> Path:
    img, d = _new(1400, 720, WHITE)
    d.text((60, 24), "Scale: virus → bacterium → animal cell", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((80, 280, 140, 340), fill=PURPLE)
    d.ellipse((280, 220, 520, 460), fill=TEAL)
    d.ellipse((640, 140, 1280, 620), outline=NAVY, width=5)
    d.text((70, 500), "Virus\n~50 nm", fill=PURPLE, font=_font(20, True))
    d.text((300, 500), "Bacterium\n1–5 µm", fill=TEAL_DARK, font=_font(20, True))
    d.text((860, 640), "Animal cell  10–30 µm", fill=NAVY, font=_font(20, True))
    d.text((60, 660), "A light microscope can resolve bacteria; viruses need an electron microscope.", fill=MUTED, font=_font(18))
    return save(img, "size-scale.png")


def light_microscope() -> Path:
    img, d = _new(1100, 980, WHITE)
    d.rectangle((470, 60, 590, 130), fill=NAVY)
    d.rectangle((500, 130, 560, 280), fill=TEAL)
    d.rectangle((460, 280, 600, 330), fill=TEAL_DARK)
    d.ellipse((480, 330, 580, 410), outline=AMBER, width=8)
    d.rectangle((240, 470, 860, 520), fill=GREY)
    d.ellipse((490, 540, 570, 600), outline=BLUE, width=5)
    d.ellipse((500, 660, 560, 730), fill=AMBER)
    d.rectangle((400, 740, 660, 840), fill=INK)
    d.rectangle((220, 160, 280, 740), fill=MUTED)
    f = _font(22, True)
    _leader(d, 590, 90, 720, 70, "Eyepiece", INK, f)
    _leader(d, 580, 370, 720, 340, "Objective", INK, f)
    _leader(d, 860, 495, 920, 470, "Stage", INK, f)
    _leader(d, 560, 700, 720, 700, "Lamp", INK, f)
    _leader(d, 220, 400, 40, 380, "Arm", INK, f)
    d.text((40, 900), "Total magnification = eyepiece × objective", fill=TEAL_DARK, font=_font(22, True))
    return save(img, "light-microscope.png")


def mag_triangle() -> Path:
    img, d = _new(1200, 800, WHITE)
    d.text((60, 24), "Magnification triangle", fill=TEAL_DARK, font=_font(30, True))
    d.polygon([(600, 140), (200, 620), (1000, 620)], outline=TEAL, fill=CREAM)
    d.line((200, 380, 1000, 380), fill=TEAL, width=3)
    d.text((540, 200), "I", fill=TEAL_DARK, font=_font(48, True))
    d.text((320, 470), "A", fill=NAVY, font=_font(48, True))
    d.text((780, 470), "M", fill=ROSE, font=_font(48, True))
    d.text((80, 680), "I = image size     A = actual size     M = I / A", fill=INK, font=_font(22, True))
    d.text((80, 730), "Convert to the same unit first.  1 mm = 1000 µm = 1 000 000 nm", fill=MUTED, font=_font(20))
    return save(img, "mag-triangle.png")


def wave_snapshot() -> Path:
    img, d = _new(1500, 920, WHITE)
    d.text((60, 24), "Transverse wave snapshot  ·  displacement against distance", fill=TEAL_DARK, font=_font(26, True))
    d.line((90, 80, 90, 700), fill=INK, width=3)
    d.line((90, 420, 1420, 420), fill=GREY, width=2)
    d.text((20, 70), "displacement", fill=MUTED, font=_font(16))
    d.text((1280, 700), "distance", fill=MUTED, font=_font(16))
    pts = []
    for x in range(90, 1410):
        y = 420 - int(170 * math.sin((x - 90) / 80))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=6)
    crest1 = 90 + int(80 * math.pi / 2)
    crest2 = 90 + int(80 * 5 * math.pi / 2)
    trough = 90 + int(80 * 3 * math.pi / 2)
    d.ellipse((crest1 - 8, 250 - 8, crest1 + 8, 250 + 8), fill=ROSE)
    d.ellipse((crest2 - 8, 250 - 8, crest2 + 8, 250 + 8), fill=ROSE)
    d.ellipse((trough - 8, 590 - 8, trough + 8, 590 + 8), fill=NAVY)
    _double_arrow(d, crest1, 420, crest1, 250, ROSE, 4)
    d.text((crest1 + 16, 310), "A", fill=ROSE, font=_font(28, True))
    _double_arrow(d, crest1, 720, crest2, 720, NAVY, 4)
    d.text((crest1 + 80, 740), "wavelength  λ", fill=NAVY, font=_font(22, True))
    d.text((crest1 - 20, 200), "crest", fill=ROSE, font=_font(18, True))
    d.text((trough - 30, 610), "trough", fill=NAVY, font=_font(18, True))
    d.text((100, 400), "equilibrium", fill=MUTED, font=_font(16))
    d.rounded_rectangle((90, 800, 1410, 890), 12, fill=GOLD)
    d.text((110, 828), "A is measured from equilibrium to a crest — not crest to trough (that is 2A).", fill=INK, font=_font(22, True))
    return save(img, "wave-snapshot.png")


def wave_snapshot_blank() -> Path:
    img, d = _new(1500, 820, WHITE)
    d.text((60, 24), "Mark amplitude A and wavelength λ on this snapshot", fill=TEAL_DARK, font=_font(26, True))
    d.line((90, 80, 90, 620), fill=INK, width=3)
    d.line((90, 360, 1420, 360), fill=GREY, width=2)
    pts = []
    for x in range(90, 1410):
        y = 360 - int(150 * math.sin((x - 90) / 80))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=6)
    d.text((100, 340), "equilibrium", fill=MUTED, font=_font(16))
    d.rounded_rectangle((90, 680, 700, 780), 10, fill=WHITE, outline=GREY, width=2)
    d.text((110, 712), "A  =", fill=MUTED, font=_font(22, True))
    d.rounded_rectangle((740, 680, 1410, 780), 10, fill=WHITE, outline=GREY, width=2)
    d.text((760, 712), "λ  =", fill=MUTED, font=_font(22, True))
    return save(img, "wave-snapshot-blank.png")


def long_vs_trans() -> Path:
    img, d = _new(1500, 980, WHITE)
    d.text((60, 24), "Transverse wave", fill=TEAL_DARK, font=_font(28, True))
    d.line((80, 200, 1420, 200), fill=GREY, width=2)
    pts = []
    for x in range(80, 1420):
        y = 200 - int(90 * math.sin((x - 80) / 60))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=5)
    c1 = 80 + int(60 * math.pi / 2)
    c2 = 80 + int(60 * 5 * math.pi / 2)
    _double_arrow(d, c1, 200, c1, 110, ROSE, 3)
    d.text((c1 + 10, 140), "A", fill=ROSE, font=_font(20, True))
    _double_arrow(d, c1, 320, c2, 320, NAVY, 3)
    d.text((c1 + 40, 336), "λ", fill=NAVY, font=_font(22, True))
    d.text((60, 360), "Oscillation is perpendicular to the direction of energy transfer.", fill=INK, font=_font(20))
    d.text((60, 430), "Longitudinal wave", fill=NAVY, font=_font(28, True))
    x = 80
    labels_at = []
    for i in range(40):
        compressed = (i % 10) < 4
        gap = 10 if compressed else 36
        d.rectangle((x, 520, x + 14, 740), fill=NAVY if compressed else TEAL)
        if i % 10 == 1:
            labels_at.append((x, "compression"))
        if i % 10 == 7:
            labels_at.append((x, "rarefaction"))
        x += gap
    for lx, lab in labels_at[:4]:
        d.text((lx - 10, 760), lab, fill=NAVY if lab[0] == "c" else TEAL, font=_font(16, True))
    d.text((60, 820), "Oscillation is parallel to energy transfer. Particles bunch (compression) then spread (rarefaction).", fill=INK, font=_font(20))
    d.text((60, 870), "Sound in air is longitudinal. Light is transverse. A sine-graph of sound is a graph, not a picture of the particles.", fill=MUTED, font=_font(18))
    return save(img, "long-vs-trans.png")


def wavefront_medium() -> Path:
    img, d = _new(1400, 820, WHITE)
    d.text((60, 24), "Same frequency, new medium: speed and wavelength change", fill=TEAL_DARK, font=_font(26, True))
    d.rectangle((0, 400, 1400, 820), fill=SKY)
    d.text((60, 120), "Faster medium  ·  longer λ", fill=TEAL, font=_font(22, True))
    d.text((60, 460), "Slower medium  ·  shorter λ", fill=NAVY, font=_font(22, True))
    for i, x in enumerate(range(120, 1280, 160)):
        d.line((x, 80, x, 400), fill=TEAL, width=3)
    for i, x in enumerate(range(120, 1280, 100)):
        d.line((x, 400, x, 760), fill=NAVY, width=3)
    d.text((60, 770), "Frequency is set by the source and does not change at the boundary.", fill=MUTED, font=_font(18))
    return save(img, "wavefront-medium.png")


def phase_points() -> Path:
    img, d = _new(1400, 760, WHITE)
    d.text((60, 24), "Phase: points a whole number of wavelengths apart", fill=TEAL_DARK, font=_font(26, True))
    pts = []
    for x in range(80, 1320):
        y = 360 - int(140 * math.sin((x - 80) / 70))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=4)
    marks = [(80, "P"), (80 + int(2 * 70 * math.pi), "Q"), (80 + int(70 * math.pi), "R")]
    for x, lab in marks:
        y = 360 - int(140 * math.sin((x - 80) / 70))
        d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=ROSE)
        d.text((x - 8, y - 40), lab, fill=ROSE, font=_font(22, True))
    d.text((80, 620), "P and Q are in phase (separated by 1.0 λ).  P and R are in antiphase (0.5 λ).", fill=INK, font=_font(22))
    return save(img, "phase-points.png")


def period_frequency() -> Path:
    img, d = _new(1400, 820, WHITE)
    d.text((60, 24), "Period and frequency are reciprocals", fill=TEAL_DARK, font=_font(28, True))
    pts = []
    for x in range(80, 1320):
        y = 360 - int(120 * math.sin((x - 80) / 90))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=4)
    d.line((80, 360, 1320, 360), fill=GREY, width=2)
    t0, t1 = 80, 80 + int(2 * 90 * math.pi)
    d.line((t0, 560, t1, 560), fill=NAVY, width=4)
    d.text((t0 + 40, 580), "Period T  —  time for one cycle", fill=NAVY, font=_font(22, True))
    d.rounded_rectangle((80, 660, 1320, 780), 14, fill=GOLD)
    d.text((110, 690), "T = 1 / f      and      f = 1 / T      ·      If T = 0.020 s, f = 50 Hz", fill=INK, font=_font(26, True))
    return save(img, "period-frequency.png")


def standard_form_visual() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((60, 24), "Convert to SI units before using v = fλ", fill=TEAL_DARK, font=_font(28, True))
    rows = [
        ("1 MHz", "1 × 10⁶ Hz", TEAL),
        ("1 GHz", "1 × 10⁹ Hz", NAVY),
        ("1 nm", "1 × 10⁻⁹ m", PURPLE),
        ("600 nm light", "λ = 6.00 × 10⁻⁷ m", AMBER),
    ]
    for i, (a, b, col) in enumerate(rows):
        y = 130 + i * 160
        d.rounded_rectangle((80, y, 600, y + 130), 16, fill=CREAM)
        d.rounded_rectangle((720, y, 1320, y + 130), 16, fill=SKY)
        d.text((110, y + 40), a, fill=col, font=_font(28, True))
        d.text((760, y + 40), b, fill=INK, font=_font(28, True))
    return save(img, "standard-form.png")


def superposition() -> Path:
    img, d = _new(1400, 860, WHITE)
    d.text((60, 24), "Superposition: add displacements", fill=TEAL_DARK, font=_font(28, True))
    for i, (amp, col, lab, y0) in enumerate(((70, TEAL, "wave 1", 220), (70, ROSE, "wave 2", 400))):
        pts = []
        for x in range(80, 700):
            y = y0 - int(amp * math.sin((x - 80) / 50))
            pts.append((x, y))
        d.line(pts, fill=col, width=3)
        d.text((720, y0 - 20), lab, fill=col, font=_font(20, True))
    pts = []
    for x in range(80, 700):
        y = 680 - int(140 * math.sin((x - 80) / 50))
        pts.append((x, y))
    d.line(pts, fill=NAVY, width=5)
    d.text((720, 660), "constructive result", fill=NAVY, font=_font(20, True))
    return save(img, "superposition.png")


def refraction_rays() -> Path:
    img, d = _new(1200, 860, WHITE)
    d.rectangle((0, 430, 1200, 860), fill=SKY)
    d.line((600, 40, 600, 820), fill=GREY, width=2)
    d.line((220, 80, 600, 430), fill=TEAL, width=6)
    d.line((600, 430, 860, 800), fill=ROSE, width=6)
    d.text((160, 50), "Incident ray", fill=TEAL_DARK, font=_font(22, True))
    d.text((880, 760), "Refracted ray", fill=ROSE, font=_font(22, True))
    d.text((620, 50), "Normal", fill=MUTED, font=_font(18))
    d.text((40, 500), "Denser medium", fill=NAVY, font=_font(22, True))
    return save(img, "refraction-rays.png")


def em_scale() -> Path:
    img, d = _new(1400, 620, WHITE)
    d.text((60, 24), "Useful sizes for microscopy questions", fill=TEAL_DARK, font=_font(26, True))
    items = [("Atom", "0.1 nm"), ("Virus", "50 nm"), ("Bacterium", "1–5 µm"), ("Mitochondrion", "1–10 µm"), ("Animal cell", "10–30 µm"), ("Plant cell", "10–100 µm")]
    for i, (name, size) in enumerate(items):
        x = 40 + i * 225
        d.rounded_rectangle((x, 140, x + 210, 480), 16, fill=CREAM, outline=TEAL, width=2)
        d.text((x + 16, 180), name, fill=TEAL_DARK, font=_font(20, True))
        d.text((x + 16, 280), size, fill=NAVY, font=_font(24, True))
    return save(img, "em-scale.png")


def all_diagrams() -> dict[str, Path]:
    fns = [
        atom_labelled, isotope_compare, ion_formation, particle_compare, sodium_nuclide,
        ar_weighted, mass_spectrum, shells_diagram, orbital_boxes, aufbau_order, spd_blocks,
        ion_configs, ion_transfer, ionic_lattice, covalent_pair, covalent_molecules,
        diamond_graphite, metallic_lattice, animal_cell, plant_cell, nucleus_detail,
        mitochondrion, protein_pathway, bilayer, specialised_cells, prokaryote_cell,
        size_scale, light_microscope, mag_triangle, wave_snapshot, long_vs_trans,
        wavefront_medium, phase_points, period_frequency, standard_form_visual,
        superposition, refraction_rays, em_scale, sodium_nuclide_blank,
        animal_cell_blank, plant_cell_blank, prokaryote_cell_blank, wave_snapshot_blank,
    ]
    return {fn.__name__: fn() for fn in fns}
