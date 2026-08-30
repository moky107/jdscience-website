"""Original JDScience educational diagrams (independently drawn)."""

from __future__ import annotations

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


def _font(size: int, bold: bool = False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def _new(w=1100, h=800, bg=WHITE):
    img = Image.new("RGB", (w, h), bg)
    return img, ImageDraw.Draw(img)


def save(img: Image.Image, name: str) -> Path:
    path = MEDIA / name
    img.save(path)
    return path


def atom_labelled() -> Path:
    img, d = _new(1000, 800, CREAM)
    cx, cy = 380, 400
    d.ellipse((cx - 38, cy - 38, cx + 38, cy + 38), fill=(254, 226, 226), outline=ROSE, width=3)
    # Lithium-7 style nucleus: 3 protons, 4 neutrons (schematic, not to scale)
    for x, y, col in ((-10, -12, ROSE), (8, -6, ROSE), (-6, 10, ROSE), (10, 12, NAVY), (-14, 4, NAVY), (2, -16, NAVY), (12, 2, NAVY)):
        d.ellipse((cx + x - 6, cy + y - 6, cx + x + 6, cy + y + 6), fill=col)
    for r in (120, 200):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=TEAL, width=3)
    # 2 electrons in first shell, 1 in second
    positions = [(cx + 120, cy), (cx - 120, cy), (cx + 40, cy - 196)]
    for x, y in positions:
        d.ellipse((x - 12, y - 12, x + 12, y + 12), fill=BLUE, outline=NAVY, width=1)
    f, fb = _font(22), _font(24, True)
    d.text((620, 160), "Electron", fill=BLUE, font=fb)
    d.text((620, 192), "Negatively charged", fill=MUTED, font=f)
    d.text((620, 250), "Nucleus", fill=ROSE, font=fb)
    d.text((620, 282), "Protons (+) and neutrons (0)", fill=MUTED, font=f)
    d.text((620, 350), "Electron shell", fill=TEAL_DARK, font=fb)
    d.text((620, 382), "Allowed energy level", fill=MUTED, font=f)
    d.text((80, 740), "Schematic of lithium-7 (3 protons, 4 neutrons, 3 electrons). Not to scale.", fill=MUTED, font=_font(16))
    d.line((500, 170, 430, 400 - 0), fill=BLUE, width=2)
    return save(img, "atom-labelled.png")


def particle_table() -> Path:
    img, d = _new(1100, 520, WHITE)
    f, fb = _font(22), _font(24, True)
    headers = ["Particle", "Relative charge", "Relative mass", "Location"]
    rows = [
        ("Proton", "+1", "1", "Nucleus"),
        ("Neutron", "0", "1", "Nucleus"),
        ("Electron", "−1", "1/1836 (approx. 0)", "Shells"),
    ]
    colours = [ROSE, NAVY, BLUE]
    d.rounded_rectangle((20, 20, 1080, 90), 12, fill=TEAL_DARK)
    for i, h in enumerate(headers):
        d.text((50 + i * 260, 42), h, fill=WHITE, font=fb)
    for r, row in enumerate(rows):
        y = 110 + r * 130
        d.rounded_rectangle((20, y, 1080, y + 115), 12, fill=CREAM if r % 2 == 0 else (248, 250, 252))
        d.ellipse((48, y + 38, 88, y + 78), fill=colours[r])
        for i, cell in enumerate(row):
            d.text((50 + i * 260, y + 42), cell, fill=INK, font=f)
    return save(img, "particle-table.png")


def sodium_nuclide() -> Path:
    img, d = _new(900, 700, WHITE)
    f, fb = _font(28), _font(72, True)
    d.rounded_rectangle((80, 80, 820, 620), 24, fill=CREAM)
    d.text((300, 160), "23", fill=TEAL_DARK, font=fb)
    d.text((300, 250), "11", fill=NAVY, font=_font(64, True))
    d.text((430, 190), "Na", fill=INK, font=_font(96, True))
    d.text((200, 430), "Mass number A = protons + neutrons = 23", fill=INK, font=f)
    d.text((200, 480), "Atomic number Z = protons = 11", fill=INK, font=f)
    d.text((200, 530), "Neutrons = 23 − 11 = 12", fill=TEAL_DARK, font=fb)
    return save(img, "sodium-nuclide.png")


def shells_diagram() -> Path:
    img, d = _new(1000, 800, WHITE)
    cx, cy = 500, 400
    d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=ROSE)
    radii = [90, 170, 260, 350]
    labels = ["1st shell\nmax 2", "2nd shell\nmax 8", "3rd shell\nmax 8 (this course)", "4th shell"]
    for r, lab in zip(radii, labels):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=TEAL, width=3)
        d.text((cx + r - 10, cy - 16), lab, fill=TEAL_DARK, font=_font(16, True))
    d.text((430, 388), "Nucleus", fill=WHITE, font=_font(14, True))
    return save(img, "electron-shells.png")


def ion_transfer() -> Path:
    img, d = _new(1100, 720, WHITE)
    f, fb = _font(22), _font(26, True)
    # Na
    d.rounded_rectangle((60, 80, 480, 640), 20, fill=CREAM)
    d.text((140, 110), "Sodium atom → Na+ ion", fill=TEAL_DARK, font=fb)
    d.ellipse((200, 280, 340, 420), outline=NAVY, width=3)
    d.ellipse((250, 330, 290, 370), fill=ROSE)
    d.ellipse((360, 240, 400, 280), fill=BLUE)
    d.text((140, 470), "Na atom: 11 protons, 11 electrons", fill=INK, font=f)
    d.text((140, 515), "Loses 1 electron → 10 electrons", fill=INK, font=f)
    d.text((140, 560), "Overall charge +1", fill=ROSE, font=fb)
    # Cl
    d.rounded_rectangle((620, 80, 1040, 640), 20, fill=(255, 241, 242))
    d.text((680, 110), "Chlorine atom → Cl− ion", fill=ROSE, font=fb)
    d.ellipse((760, 280, 900, 420), outline=ROSE, width=3)
    d.ellipse((810, 330, 850, 370), fill=NAVY)
    d.ellipse((920, 240, 960, 280), fill=BLUE)
    d.text((680, 470), "Cl atom: 17 protons, 17 electrons", fill=INK, font=f)
    d.text((680, 515), "Gains 1 electron → 18 electrons", fill=INK, font=f)
    d.text((680, 560), "Overall charge −1", fill=NAVY, font=fb)
    d.polygon([(500, 340), (590, 360), (500, 380)], fill=AMBER)
    return save(img, "ion-transfer.png")


def ionic_lattice() -> Path:
    img, d = _new(1000, 720, WHITE)
    d.text((280, 30), "Giant ionic lattice (NaCl-style)", fill=TEAL_DARK, font=_font(26, True))
    for r in range(4):
        for c in range(5):
            x = 160 + c * 140
            y = 130 + r * 140
            plus = (r + c) % 2 == 0
            col = ROSE if plus else BLUE
            d.ellipse((x, y, x + 88, y + 88), fill=col)
            d.text((x + 28, y + 26), "+" if plus else "−", fill=WHITE, font=_font(32, True))
    d.text((80, 680), "Alternating positive and negative ions; strong electrostatic attraction in all directions.", fill=MUTED, font=_font(18))
    return save(img, "ionic-lattice.png")


def covalent_pair() -> Path:
    img, d = _new(1000, 700, WHITE)
    f, fb = _font(22), _font(28, True)
    d.text((300, 40), "Shared pair of electrons", fill=TEAL_DARK, font=fb)
    d.ellipse((180, 200, 460, 480), outline=NAVY, width=4)
    d.ellipse((540, 200, 820, 480), outline=ROSE, width=4)
    d.ellipse((470, 310, 530, 370), fill=BLUE)
    d.ellipse((470, 370, 530, 430), fill=BLUE)
    d.text((250, 320), "H", fill=NAVY, font=_font(48, True))
    d.text((680, 320), "Cl", fill=ROSE, font=_font(48, True))
    d.text((200, 560), "Each atom obtains a more stable outer shell by sharing.", fill=INK, font=f)
    d.text((200, 610), "The shared pair is the covalent bond.", fill=TEAL_DARK, font=fb)
    return save(img, "covalent-pair.png")


def metallic_lattice() -> Path:
    img, d = _new(1000, 720, WHITE)
    d.text((240, 30), "Metallic lattice and delocalised electrons", fill=TEAL_DARK, font=_font(26, True))
    for r in range(3):
        for c in range(5):
            x = 120 + c * 160 + (80 if r % 2 else 0)
            y = 140 + r * 150
            d.ellipse((x, y, x + 100, y + 100), fill=(253, 186, 116), outline=AMBER, width=3)
            d.text((x + 28, y + 32), "M+", fill=TEAL_DARK, font=_font(22, True))
    for i, pos in enumerate([(90, 200), (300, 260), (520, 180), (740, 290), (200, 480), (600, 500), (850, 430)]):
        d.ellipse((pos[0], pos[1], pos[0] + 22, pos[1] + 22), fill=BLUE)
    d.text((80, 660), "Positive metal ions in a sea of delocalised electrons.", fill=MUTED, font=_font(20))
    return save(img, "metallic-lattice.png")


def animal_cell() -> Path:
    img, d = _new(1100, 800, WHITE)
    d.ellipse((80, 80, 720, 720), fill=(236, 253, 245), outline=TEAL, width=5)
    d.ellipse((260, 240, 520, 500), fill=(254, 226, 226), outline=ROSE, width=4)
    d.ellipse((330, 310, 450, 430), fill=ROSE)
    d.ellipse((150, 180, 250, 250), outline=NAVY, width=3)
    d.ellipse((560, 160, 680, 240), outline=AMBER, width=3)
    d.ellipse((170, 520, 300, 600), outline=PURPLE, width=3)
    fb = _font(20, True)
    d.text((760, 120), "Cell membrane", fill=TEAL_DARK, font=fb)
    d.text((760, 200), "Cytoplasm", fill=TEAL, font=fb)
    d.text((760, 320), "Nucleus", fill=ROSE, font=fb)
    d.text((760, 400), "Nucleolus", fill=ROSE, font=fb)
    d.text((760, 500), "Mitochondrion", fill=PURPLE, font=fb)
    d.text((760, 580), "Ribosome / RER region", fill=NAVY, font=fb)
    return save(img, "animal-cell.png")


def plant_cell() -> Path:
    img, d = _new(1100, 800, WHITE)
    d.rounded_rectangle((70, 70, 740, 730), 8, outline=TEAL_DARK, width=6)
    d.ellipse((110, 120, 700, 680), outline=TEAL, width=4)
    d.rounded_rectangle((220, 200, 560, 430), 20, fill=(219, 234, 254), outline=BLUE, width=3)
    d.ellipse((160, 480, 300, 600), fill=(187, 247, 208), outline=TEAL, width=3)
    d.ellipse((400, 500, 560, 640), fill=(254, 226, 226), outline=ROSE, width=3)
    fb = _font(20, True)
    d.text((770, 100), "Cell wall (cellulose)", fill=TEAL_DARK, font=fb)
    d.text((770, 180), "Cell membrane", fill=TEAL, font=fb)
    d.text((770, 280), "Permanent vacuole", fill=BLUE, font=fb)
    d.text((770, 400), "Chloroplast", fill=(22, 163, 74), font=fb)
    d.text((770, 520), "Nucleus", fill=ROSE, font=fb)
    return save(img, "plant-cell.png")


def prokaryote_cell() -> Path:
    img, d = _new(1100, 720, WHITE)
    d.ellipse((80, 180, 820, 560), fill=CREAM, outline=TEAL, width=5)
    d.ellipse((70, 170, 830, 570), outline=NAVY, width=3)
    d.arc((200, 260, 520, 460), 200, 480, fill=ROSE, width=8)
    d.ellipse((600, 300, 720, 400), outline=PURPLE, width=3)
    for x in range(160, 760, 40):
        d.ellipse((x, 500, x + 8, 508), fill=BLUE)
    fb = _font(20, True)
    d.text((80, 40), "Typical prokaryotic cell (not to scale)", fill=TEAL_DARK, font=_font(26, True))
    d.text((860, 200), "Cell wall", fill=NAVY, font=fb)
    d.text((860, 270), "Cell membrane", fill=TEAL, font=fb)
    d.text((860, 340), "Loop of DNA", fill=ROSE, font=fb)
    d.text((860, 410), "Plasmid", fill=PURPLE, font=fb)
    d.text((860, 480), "Ribosomes", fill=BLUE, font=fb)
    return save(img, "prokaryote-cell.png")


def light_microscope() -> Path:
    img, d = _new(900, 800, WHITE)
    # simple original apparatus schematic
    d.rectangle((400, 80, 500, 140), fill=NAVY)  # eyepiece
    d.rectangle((420, 140, 480, 260), fill=TEAL)  # body
    d.rectangle((390, 260, 510, 300), fill=TEAL_DARK)  # nosepiece
    d.ellipse((405, 300, 495, 360), outline=AMBER, width=6)  # objective
    d.rectangle((220, 420, 680, 460), fill=GREY)  # stage
    d.ellipse((410, 470, 490, 520), outline=BLUE, width=4)  # condenser
    d.ellipse((420, 560, 480, 620), fill=AMBER)  # lamp
    d.rectangle((340, 620, 560, 700), fill=INK)  # base
    d.rectangle((200, 160, 250, 620), fill=MUTED)  # arm
    f = _font(20, True)
    d.text((540, 90), "Eyepiece", fill=INK, font=f)
    d.text((540, 310), "Objective", fill=INK, font=f)
    d.text((700, 425), "Stage", fill=INK, font=f)
    d.text((540, 575), "Lamp", fill=INK, font=f)
    d.text((80, 300), "Arm", fill=INK, font=f)
    return save(img, "light-microscope.png")


def wave_snapshot() -> Path:
    img, d = _new(1100, 700, WHITE)
    import math
    d.line((80, 350, 1020, 350), fill=GREY, width=2)
    pts = []
    for x in range(80, 1020):
        y = 350 - int(140 * math.sin((x - 80) / 70))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=4)
    # amplitude
    d.line((220, 350, 220, 210), fill=ROSE, width=3)
    d.text((230, 250), "Amplitude", fill=ROSE, font=_font(20, True))
    # wavelength
    d.line((80 + int(70 * math.pi), 520, 80 + int(70 * 3 * math.pi), 520), fill=NAVY, width=3)
    d.text((360, 540), "Wavelength λ", fill=NAVY, font=_font(20, True))
    d.text((80, 40), "Transverse wave snapshot", fill=TEAL_DARK, font=_font(26, True))
    return save(img, "wave-snapshot.png")


def long_vs_trans() -> Path:
    img, d = _new(1100, 760, WHITE)
    fb = _font(24, True)
    d.text((80, 40), "Transverse", fill=TEAL_DARK, font=fb)
    import math
    pts = []
    for x in range(80, 1020):
        y = 180 - int(70 * math.sin((x - 80) / 55))
        pts.append((x, y))
    d.line(pts, fill=TEAL, width=4)
    d.text((80, 280), "Oscillation is perpendicular to the direction of energy transfer.", fill=MUTED, font=_font(20))
    d.text((80, 400), "Longitudinal", fill=NAVY, font=fb)
    x = 80
    for i in range(28):
        gap = 14 if (i % 6) < 3 else 36
        d.rectangle((x, 480, x + 10, 640), fill=NAVY)
        x += gap
    d.text((80, 670), "Oscillation is parallel to the direction of energy transfer (compressions and rarefactions).", fill=MUTED, font=_font(20))
    return save(img, "long-vs-trans.png")


def refraction_rays() -> Path:
    img, d = _new(1000, 760, WHITE)
    d.rectangle((0, 380, 1000, 760), fill=(219, 234, 254))
    d.line((500, 40, 500, 740), fill=GREY, width=2)
    d.line((200, 80, 500, 380), fill=TEAL, width=5)
    d.line((500, 380, 720, 720), fill=ROSE, width=5)
    d.text((160, 60), "Incident ray", fill=TEAL_DARK, font=_font(20, True))
    d.text((740, 680), "Refracted ray", fill=ROSE, font=_font(20, True))
    d.text((520, 50), "Normal", fill=MUTED, font=_font(18))
    d.text((40, 420), "Denser medium (e.g. glass)", fill=NAVY, font=_font(20, True))
    d.text((40, 80), "Less dense (e.g. air)", fill=INK, font=_font(20, True))
    return save(img, "refraction-rays.png")


def all_diagrams() -> dict[str, Path]:
    fns = [
        atom_labelled,
        particle_table,
        sodium_nuclide,
        shells_diagram,
        ion_transfer,
        ionic_lattice,
        covalent_pair,
        metallic_lattice,
        animal_cell,
        plant_cell,
        prokaryote_cell,
        light_microscope,
        wave_snapshot,
        long_vs_trans,
        refraction_rays,
    ]
    return {fn.__name__: fn() for fn in fns}
