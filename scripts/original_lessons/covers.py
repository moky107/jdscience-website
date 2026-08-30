"""Product covers — topic title only, no JDScience in the title."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .theme import MEDIA, ROOT, ensure_logo

OUT = ROOT / "content/lessons"

COVERS = [
    ("atomic-structure", "BTEC Unit 1 Chemistry", "Atomic Structure", (0, 77, 64)),
    ("electron-configuration", "BTEC Unit 1 Chemistry", "Electron Configuration", (0, 105, 92)),
    ("ionic-bonding", "BTEC Unit 1 Chemistry", "Ionic Bonding", (126, 34, 68)),
    ("covalent-bonding", "BTEC Unit 1 Chemistry", "Covalent Bonding", (30, 64, 175)),
    ("metallic-bonding", "BTEC Unit 1 Chemistry", "Metallic Bonding", (180, 83, 9)),
    ("cell-structure", "BTEC Unit 1 Biology", "Cell Structure", (6, 95, 70)),
    ("prokaryotic-and-eukaryotic-cells", "BTEC Unit 1 Biology", "Prokaryotic and\nEukaryotic Cells", (15, 76, 92)),
    ("microscopy", "BTEC Unit 1 Biology", "Microscopy", (67, 56, 202)),
    ("progressive-waves", "BTEC Unit 1 Physics", "Progressive Waves", (30, 58, 95)),
    ("wave-properties", "BTEC Unit 1 Physics", "Wave Properties", (76, 29, 149)),
]


def _font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def build_covers():
    logo = Image.open(ensure_logo()).convert("RGBA").resize((72, 72))
    paths = []
    for slug, kicker, title, colour in COVERS:
        img = Image.new("RGB", (1200, 800), colour)
        d = ImageDraw.Draw(img)
        d.rectangle((0, 700, 1200, 800), fill=(15, 23, 42))
        d.text((64, 80), kicker.upper(), fill=(204, 251, 241), font=_font(28, True))
        d.text((64, 200), title, fill="white", font=_font(64, True))
        d.text((64, 520), "PowerPoint teaching resource", fill=(204, 251, 241), font=_font(28))
        d.text((160, 732), "jdscience.co.uk", fill="white", font=_font(24, True))
        img.paste(logo, (64, 714), logo)
        path = OUT / slug / "cover.png"
        img.save(path)
        paths.append(path)
    return paths
