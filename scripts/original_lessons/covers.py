"""Shop covers — topic title first, JDScience identity in the chrome only."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .theme import MEDIA, ROOT, ensure_logo

OUT = ROOT / "content/lessons"

COVER_W = 1600
COVER_H = 900

NAVY = (15, 23, 42)
CREAM = (248, 250, 252)
GOLD = (212, 175, 55)
PALE = (204, 251, 241)
WHITE = (255, 255, 255)
INK = (15, 23, 42)
TEAL = (0, 150, 136)

COVERS = [
    ("atomic-structure", "Chemistry", "Atomic Structure", (0, 77, 64), "atom-labelled.png"),
    ("electron-configuration", "Chemistry", "Electron Configuration", (0, 105, 92), "electron-shells.png"),
    ("ionic-bonding", "Chemistry", "Ionic Bonding", (126, 34, 68), "ion-transfer.png"),
    ("covalent-bonding", "Chemistry", "Covalent Bonding", (30, 64, 175), "covalent-pair.png"),
    ("metallic-bonding", "Chemistry", "Metallic Bonding", (180, 83, 9), "metallic-lattice.png"),
    ("cell-structure", "Biology", "Cell Structure", (6, 95, 70), "animal-cell.png"),
    ("prokaryotic-and-eukaryotic-cells", "Biology", "Prokaryotic and\nEukaryotic Cells", (15, 76, 92), "prokaryote-cell.png"),
    ("microscopy", "Biology", "Microscopy", (67, 56, 202), "light-microscope.png"),
    ("progressive-waves", "Physics", "Progressive Waves", (30, 58, 95), "wave-snapshot.png"),
    ("wave-properties", "Physics", "Wave Properties", (76, 29, 149), "long-vs-trans.png"),
]


def _font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)
    except OSError:
        return ImageFont.load_default()


def _fit_visual(path, max_w=620, max_h=560):
    image = Image.open(path).convert("RGBA")
    image.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    return image


def _draw_cover(subject, title, colour, visual_name, resource_type):
    img = Image.new("RGB", (COVER_W, COVER_H), CREAM)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 18, COVER_H), fill=colour)
    draw.rectangle((0, 0, COVER_W, 96), fill=NAVY)
    draw.text((48, 28), "JDScience", font=_font(34, True), fill=GOLD)
    draw.text(
        (280, 38),
        f"BTEC Level 3  ·  Unit 1  ·  {subject}  ·  {resource_type}",
        font=_font(22),
        fill=PALE,
    )
    draw.text((48, 140), title, font=_font(58, True), fill=INK)
    subtitle = (
        "Student worksheet and answer sheet"
        if resource_type == "Worksheet"
        else "Principles and Applications of Science I"
    )
    draw.text((48, 330 if "\n" in title else 250), subtitle, font=_font(28), fill=TEAL)
    draw.rounded_rectangle((48, COVER_H - 210, 620, COVER_H - 90), 16, fill=WHITE, outline=colour, width=3)
    draw.text((68, COVER_H - 186), resource_type, font=_font(22, True), fill=colour)
    draw.text((68, COVER_H - 150), "Original teaching resource", font=_font(20), fill=INK)
    draw.text((68, COVER_H - 118), "Suitable for teaching, revision and independent study", font=_font(16), fill=(71, 85, 105))

    visual_path = MEDIA / visual_name
    if visual_path.exists():
        visual = _fit_visual(visual_path)
        img.paste(visual, (COVER_W - visual.width - 48, 150), visual)

    draw.rectangle((0, COVER_H - 70, COVER_W, COVER_H), fill=NAVY)
    logo = Image.open(ensure_logo()).convert("RGBA").resize((46, 46))
    img.paste(logo, (40, COVER_H - 58), logo)
    draw.text((98, COVER_H - 48), f"jdscience.co.uk  ·  Original {resource_type}  ·  BTEC Level 3 Unit 1", font=_font(20, True), fill=WHITE)
    return img


def build_covers():
    paths = []
    for slug, subject, title, colour, visual in COVERS:
        folder = OUT / slug
        folder.mkdir(parents=True, exist_ok=True)
        ppt = folder / "cover.png"
        _draw_cover(subject, title, colour, visual, "PowerPoint").save(ppt, "PNG")
        paths.append(ppt)
        worksheet = folder / "cover-worksheet.png"
        _draw_cover(subject, title, colour, visual, "Worksheet").save(worksheet, "PNG")
        paths.append(worksheet)
    return paths
