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


def sodium_nuclide() -> Path:
    img, d = _new(1200, 900, WHITE)
    d.rounded_rectangle((80, 80, 1120, 820), 28, fill=CREAM, outline=TEAL, width=3)
    d.text((160, 120), "Nuclide notation", fill=TEAL_DARK, font=_font(32, True))
    d.text((280, 250), "23", fill=TEAL_DARK, font=_font(72, True))
    d.text((280, 340), "11", fill=NAVY, font=_font(64, True))
    d.text((430, 270), "Na", fill=INK, font=_font(110, True))
    d.text((200, 500), "Mass number A  =  protons + neutrons  =  23", fill=INK, font=_font(26))
    d.text((200, 560), "Atomic number Z  =  protons  =  11", fill=INK, font=_font(26))
    d.text((200, 620), "Neutrons  =  23 − 11  =  12", fill=TEAL_DARK, font=_font(28, True))
    d.text((200, 700), "Neutral atom: electrons = Z = 11", fill=NAVY, font=_font(24))
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
    img, d = _new(1400, 920, WHITE)
    d.text((70, 36), "Orbital box diagrams", fill=TEAL_DARK, font=_font(32, True))
    d.text((70, 90), "Each box is one orbital. Arrows are electrons of opposite spin.", fill=MUTED, font=_font(20))

    def boxes(x, y, n, arrows, title, note):
        d.text((x, y - 46), title, fill=INK, font=_font(24, True))
        for i in range(n):
            bx = x + i * 90
            d.rectangle((bx, y, bx + 76, y + 90), outline=TEAL_DARK, width=3, fill=WHITE)
            arts = arrows[i] if i < len(arrows) else ""
            if "u" in arts:
                d.line((bx + 28, y + 70, bx + 28, y + 22), fill=ROSE, width=4)
                d.polygon([(bx + 28, y + 18), (bx + 18, y + 32), (bx + 38, y + 32)], fill=ROSE)
            if "d" in arts:
                d.line((bx + 50, y + 22, bx + 50, y + 70), fill=NAVY, width=4)
                d.polygon([(bx + 50, y + 74), (bx + 40, y + 60), (bx + 60, y + 60)], fill=NAVY)
        d.text((x, y + 110), note, fill=MUTED, font=_font(18))

    boxes(80, 220, 1, ["ud"], "Helium  1s²", "Pauli: two electrons in one orbital must have opposite spin.")
    boxes(80, 460, 3, ["u", "u", "u"], "Nitrogen  2p³", "Hund: one electron in each equal-energy orbital before pairing.")
    boxes(80, 700, 3, ["ud", "u", "u"], "Oxygen  2p⁴", "The fourth 2p electron pairs in one box.")
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
        ("O  2,6", "gain 2 e⁻", "O²⁻  2,8", ROSE),
        ("Mg  2,8,2", "lose 2 e⁻", "Mg²⁺  2,8", NAVY),
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
    img, d = _new(1400, 860, WHITE)
    d.text((70, 30), "Displayed formulae to count shared pairs", fill=TEAL_DARK, font=_font(28, True))

    def mol(x, y, title, lines):
        d.rounded_rectangle((x, y, x + 420, y + 340), 16, fill=CREAM, outline=TEAL, width=2)
        d.text((x + 24, y + 20), title, fill=TEAL_DARK, font=_font(22, True))
        d.text((x + 24, y + 90), lines, fill=INK, font=_font(22))

    mol(70, 120, "H₂O", "Two O–H single bonds\nTwo lone pairs on oxygen\nBent molecule")
    mol(520, 120, "CO₂", "O=C=O\nTwo double bonds\nLinear molecule")
    mol(970, 120, "N₂", "N≡N\nTriple bond (3 pairs)\nVery strong bond")
    mol(70, 490, "CH₄", "Four C–H bonds\nTetrahedral\nNo lone pair on C")
    mol(520, 490, "NH₃", "Three N–H bonds\nOne lone pair on N\nCan form NH₄⁺")
    mol(970, 490, "O₂", "O=O\nTwo shared pairs\nSimple molecule")
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
    img, d = _new(1500, 1050, WHITE)
    d.text((40, 24), "Animal cell — labelled schematic", fill=TEAL_DARK, font=_font(30, True))
    d.ellipse((80, 90, 900, 960), fill=MINT, outline=TEAL, width=7)
    d.ellipse((300, 280, 620, 600), fill=PINK, outline=ROSE, width=5)
    d.ellipse((390, 360, 530, 500), fill=ROSE)
    d.ellipse((160, 200, 280, 300), outline=PURPLE, width=4)
    d.ellipse((160, 210, 270, 290), outline=PURPLE, width=2)
    d.ellipse((650, 180, 820, 280), outline=AMBER, width=3)
    for i in range(5):
        d.ellipse((640 + i * 18, 200, 652 + i * 18, 212), fill=NAVY)
    d.ellipse((200, 680, 360, 800), outline=PURPLE, width=4)
    d.ellipse((700, 700, 780, 760), fill=(254, 215, 170), outline=AMBER, width=2)
    labels = [
        (900, 120, 1180, 140, "Cell-surface membrane\nphospholipid bilayer", TEAL_DARK, 890, 200),
        (900, 280, 1180, 300, "Nucleus + nucleolus\nDNA / rRNA", ROSE, 620, 430),
        (900, 430, 1180, 450, "Mitochondrion\ncristae, ATP", PURPLE, 280, 250),
        (900, 560, 1180, 580, "RER + ribosomes\nprotein synthesis", NAVY, 740, 230),
        (900, 700, 1180, 720, "Cytoplasm\naqueous site of reactions", TEAL, 500, 800),
        (900, 830, 1180, 850, "Lysosome / vesicle\ndigestive enzymes", AMBER, 740, 730),
    ]
    for lx, ly, _a, _b, text, col, sx, sy in labels:
        d.line((sx, sy, lx, ly + 10), fill=col, width=2)
        d.text((lx + 10, ly), text, fill=col, font=_font(20, True))
    d.text((40, 990), "Original schematic — organelles are not to scale. Leader lines touch the structures.", fill=MUTED, font=_font(18))
    return save(img, "animal-cell.png")


def plant_cell() -> Path:
    img, d = _new(1500, 1050, WHITE)
    d.text((40, 24), "Plant cell — labelled schematic", fill=TEAL_DARK, font=_font(30, True))
    d.rounded_rectangle((70, 90, 900, 960), 8, outline=TEAL_DARK, width=10)
    d.ellipse((110, 140, 860, 910), outline=TEAL, width=5)
    d.rounded_rectangle((260, 240, 680, 520), 24, fill=SKY, outline=BLUE, width=3)
    d.ellipse((160, 600, 340, 780), fill=(187, 247, 208), outline=(22, 163, 74), width=3)
    for gy in (640, 680, 720):
        d.line((190, gy, 310, gy), fill=(22, 163, 74), width=2)
    d.ellipse((520, 620, 720, 820), fill=PINK, outline=ROSE, width=3)
    d.ellipse((580, 680, 660, 760), fill=ROSE)
    labels = [
        (960, 120, "Cellulose cell wall\nsupport; freely permeable", TEAL_DARK, 900, 160),
        (960, 280, "Cell-surface membrane\nselectively permeable", TEAL, 860, 300),
        (960, 430, "Permanent vacuole\ncell sap; turgidity", BLUE, 680, 360),
        (960, 580, "Chloroplast\ngrana / thylakoids", (22, 163, 74), 340, 690),
        (960, 740, "Nucleus", ROSE, 720, 720),
    ]
    for lx, ly, text, col, sx, sy in labels:
        d.line((sx, sy, lx, ly + 10), fill=col, width=2)
        d.text((lx + 12, ly), text, fill=col, font=_font(20, True))
    return save(img, "plant-cell.png")


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
    img, d = _new(1400, 820, WHITE)
    d.text((60, 30), "Mitochondrion — structure linked to ATP transfer", fill=TEAL_DARK, font=_font(28, True))
    d.ellipse((80, 180, 860, 700), outline=NAVY, width=6)
    d.ellipse((120, 220, 820, 660), outline=PURPLE, width=5)
    for x in range(180, 760, 90):
        d.line([(x, 250), (x + 24, 400), (x, 550), (x + 24, 630)], fill=PURPLE, width=4)
    d.text((920, 220), "Outer membrane", fill=NAVY, font=_font(22, True))
    d.text((920, 320), "Inner membrane folded\ninto cristae", fill=PURPLE, font=_font(22, True))
    d.text((920, 460), "Matrix: enzymes,\ncircular DNA, 70S ribosomes", fill=TEAL_DARK, font=_font(22, True))
    d.text((80, 740), "Cristae increase surface area for respiratory proteins. Do not say mitochondria 'make energy'.", fill=MUTED, font=_font(18))
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
    _leader(d, 1180, 300, 1220, 280, "Flagellum", AMBER)
    return save(img, "prokaryote-cell.png")


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
    img, d = _new(1400, 860, WHITE)
    d.line((80, 420, 1320, 420), fill=GREY, width=2)
    pts = []
    for x in range(80, 1320):
        y = 420 - int(160 * math.sin((x - 80) / 80))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=5)
    d.line((260, 420, 260, 260), fill=ROSE, width=4)
    d.text((275, 300), "Amplitude A", fill=ROSE, font=_font(22, True))
    start = 80 + int(80 * math.pi)
    end = 80 + int(80 * 3 * math.pi)
    d.line((start, 640, end, 640), fill=NAVY, width=4)
    d.text((start + 40, 660), "Wavelength λ  (crest to next crest)", fill=NAVY, font=_font(22, True))
    d.text((80, 40), "Transverse wave snapshot  ·  displacement against distance", fill=TEAL_DARK, font=_font(26, True))
    d.text((80, 780), "Equilibrium is the centre line — not a trough. Crest-to-trough height is 2A.", fill=MUTED, font=_font(20))
    return save(img, "wave-snapshot.png")


def long_vs_trans() -> Path:
    img, d = _new(1400, 920, WHITE)
    d.text((70, 30), "Transverse", fill=TEAL_DARK, font=_font(28, True))
    pts = []
    for x in range(80, 1320):
        y = 200 - int(80 * math.sin((x - 80) / 60))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=5)
    d.text((70, 300), "Oscillation is perpendicular to energy transfer.", fill=MUTED, font=_font(20))
    d.text((70, 400), "Longitudinal", fill=NAVY, font=_font(28, True))
    x = 80
    for i in range(36):
        gap = 12 if (i % 8) < 4 else 34
        d.rectangle((x, 500, x + 12, 700), fill=NAVY)
        x += gap
    d.text((70, 740), "Oscillation is parallel to energy transfer.", fill=MUTED, font=_font(20))
    d.text((70, 790), "Compressions (particles closer) and rarefactions (particles further apart).", fill=MUTED, font=_font(20))
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
        superposition, refraction_rays, em_scale,
    ]
    return {fn.__name__: fn() for fn in fns}
