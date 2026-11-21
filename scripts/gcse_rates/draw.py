"""Light-theme GCSE slides for rates of reaction. 1920×1080."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PHOTOS = ROOT / "content/videos/rates-of-reaction/source"
FONT_DIR = Path("/usr/share/fonts/truetype/macos")

W, H = 1920, 1080
BG = (252, 253, 255)
INK = (15, 32, 56)
MUTED = (90, 110, 130)
TEAL = (15, 150, 138)
NAVY = (20, 48, 84)
LINE = (214, 224, 232)
MAGENTA = (168, 48, 140)
GREEN = (16, 140, 110)
GOLD = (196, 140, 24)
WHITE = (255, 255, 255)
CARD = (244, 248, 250)

SUB = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    names = {
        "regular": "Inter-Regular.ttf",
        "medium": "Inter-Medium.ttf",
        "semibold": "Inter-SemiBold.ttf",
        "bold": "Inter-Bold.ttf",
    }
    return ImageFont.truetype(str(FONT_DIR / names.get(weight, names["regular"])), size)


def chem(text: str) -> str:
    out: list[str] = []
    prev_letter = False
    i = 0
    while i < len(text):
        if text[i].isdigit() and prev_letter:
            j = i
            while j < len(text) and text[j].isdigit():
                j += 1
            out.append(text[i:j].translate(SUB))
            i = j
            prev_letter = False
        else:
            out.append(text[i])
            prev_letter = text[i].isalpha()
            i += 1
    return "".join(out)


def vis(revealed: Iterable[str], name: str) -> bool:
    revealed = set(revealed)
    return name in revealed or "*" in revealed


def chrome(topic: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 8), fill=TEAL)
    d.text((72, 36), "JD", font=font("bold", 28), fill=TEAL)
    d.text((112, 36), "Science", font=font("semibold", 28), fill=INK)
    d.text((W - 72, 50), "GCSE CHEMISTRY", font=font("medium", 18), fill=MUTED, anchor="rm")
    d.line((72, 88, W - 72, 88), fill=LINE, width=2)
    d.text((W - 72, H - 36), "jdscience.co.uk", font=font("medium", 18), fill=MUTED, anchor="rm")
    return img, d


def heading(d: ImageDraw.ImageDraw, title: str, sub: str | None = None) -> None:
    d.text((W / 2, 128), title, font=font("bold", 52), fill=INK, anchor="mt")
    if sub:
        d.text((W / 2, 198), sub, font=font("regular", 26), fill=MUTED, anchor="mt")


def photo(path: Path, size: tuple[int, int]) -> Image.Image:
    im = Image.open(path).convert("RGB")
    im.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (236, 240, 244))
    x = (size[0] - im.width) // 2
    y = (size[1] - im.height) // 2
    canvas.paste(im, (x, y))
    return canvas


def rounded_photo(base: Image.Image, im: Image.Image, xy: tuple[int, int], radius: int = 18) -> None:
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius, fill=255)
    base.paste(im, xy, mask)


def flask(d: ImageDraw.ImageDraw, cx: int, cy: int, t: float) -> None:
    d.polygon(
        [(cx - 28, cy - 150), (cx + 28, cy - 150), (cx + 28, cy - 40), (cx + 110, cy + 130),
         (cx - 110, cy + 130), (cx - 28, cy - 40)],
        fill=(255, 214, 224), outline=NAVY, width=4,
    )
    d.rectangle((cx - 28, cy - 170, cx + 28, cy - 40), outline=NAVY, width=4)
    d.ellipse((cx - 22, cy + 70, cx + 18, cy + 100), fill=(200, 210, 220), outline=NAVY, width=2)
    d.ellipse((cx + 8, cy + 86, cx + 48, cy + 114), fill=(180, 190, 200), outline=NAVY, width=2)
    for i in range(7):
        phase = (t * 1.6 + i * 0.37) % 1.0
        bx = cx - 40 + (i * 14)
        by = cy + 40 - int(phase * 170)
        r = 6 + (i % 3)
        if by > cy - 160:
            d.ellipse((bx - r, by - r, bx + r, by + r), fill=(170, 220, 255), outline=(80, 140, 190))


def axes(d, box, xlabel, ylabel, yticks: list[tuple[float, str]]) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    d.line((x0, y1, x1, y1), fill=NAVY, width=4)
    d.line((x0, y0, x0, y1), fill=NAVY, width=4)
    d.polygon([(x1, y1 - 8), (x1 + 16, y1), (x1, y1 + 8)], fill=NAVY)
    d.polygon([(x0 - 8, y0), (x0, y0 - 16), (x0 + 8, y0)], fill=NAVY)
    d.text(((x0 + x1) / 2, y1 + 36), xlabel, font=font("medium", 24), fill=INK, anchor="mt")
    d.text((x0, y0 - 28), ylabel, font=font("semibold", 24), fill=TEAL, anchor="lb")
    for frac, label in yticks:
        y = y1 - frac * (y1 - y0)
        d.line((x0 - 8, y, x1, y), fill=LINE, width=1)
        d.text((x0 - 18, y), label, font=font("medium", 22), fill=INK, anchor="rm")
    d.text((x0 - 18, y1), "0", font=font("medium", 22), fill=INK, anchor="rm")
    return x0, y0, x1, y1


def decay_points(n: int = 160) -> list[tuple[float, float]]:
    pts = []
    for i in range(n + 1):
        x = i / n
        y = math.exp(-3.4 * x)
        if x > 0.70:
            blend = min(1.0, (x - 0.70) / 0.30)
            y *= (1.0 - blend) ** 1.6
        pts.append((x, y))
    return pts


def rise_points(n: int = 160) -> list[tuple[float, float]]:
    pts = []
    for i in range(n + 1):
        x = i / n
        y = 1.0 - math.exp(-3.2 * x)
        if x > 0.70:
            blend = min(1.0, (x - 0.70) / 0.30)
            y = y + (1.0 - y) * (blend ** 1.15)
        pts.append((x, y))
    return pts


def draw_curve(d, box, pts, progress: float, colour, y_scale: float = 1.0) -> None:
    x0, y0, x1, y1 = box
    visible = max(2, int(round(len(pts) * min(1.0, max(0.02, progress)))))
    xy = []
    for x, y in pts[:visible]:
        px = x0 + x * (x1 - x0)
        py = y1 - y * y_scale * (y1 - y0)
        xy.append((px, py))
    if len(xy) >= 2:
        d.line(xy, fill=colour, width=7)


def hello(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    d.text((W / 2, 430), "Hello and welcome back", font=font("semibold", 42), fill=MUTED, anchor="mm")
    d.text((W / 2, 530), "to JD Science", font=font("bold", 84), fill=INK, anchor="mm")
    d.rectangle((W / 2 - 90, 610, W / 2 + 90, 618), fill=TEAL)
    return img


def title(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    d.text((W / 2, 360), "Rates of reaction", font=font("bold", 84), fill=INK, anchor="mm")
    d.text((W / 2, 470), "How fast a chemical reaction happens", font=font("regular", 34), fill=MUTED, anchor="mm")
    d.text((W / 2, 560), "GCSE Chemistry", font=font("semibold", 28), fill=TEAL, anchor="mm")
    return img


def aims(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "In this lesson", "Three clear goals")
    items = [
        ("a1", "01", "What reaction rate means"),
        ("a2", "02", "How to calculate average rate"),
        ("a3", "03", "What reaction graphs tell us"),
    ]
    y = 280
    for key, num, label in items:
        if vis(revealed, key):
            d.rounded_rectangle((220, y, W - 220, y + 130), 22, fill=CARD, outline=LINE, width=2)
            d.text((280, y + 65), num, font=font("bold", 40), fill=TEAL, anchor="lm")
            d.text((420, y + 65), label, font=font("semibold", 38), fill=INK, anchor="lm")
        y += 160
    return img


def hook(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Reactions happen at different speeds")
    d.text((W / 2, 520), "Some finish in a flash.", font=font("bold", 48), fill=INK, anchor="mm")
    d.text((W / 2, 610), "Others take years.", font=font("bold", 48), fill=TEAL, anchor="mm")
    return img


def compare(_lesson, _revealed, _t, _page, focus: str = "both"):
    img, d = chrome("Rates of reaction")
    heading(d, "Reactions happen at different speeds")
    fw = photo(PHOTOS / "fireworks.jpg", (520, 380))
    rs = photo(PHOTOS / "rusting.jpg", (520, 380))
    if focus in {"both", "fast"}:
        rounded_photo(img, fw, (220, 280))
        d = ImageDraw.Draw(img)
        d.text((480, 690), "Fireworks", font=font("bold", 36), fill=MAGENTA, anchor="mt")
        d.text((480, 744), "Very fast", font=font("regular", 26), fill=MUTED, anchor="mt")
    if focus in {"both", "slow"}:
        rounded_photo(img, rs, (1180, 280))
        d = ImageDraw.Draw(img)
        d.text((1440, 690), "Rusting", font=font("bold", 36), fill=TEAL, anchor="mt")
        d.text((1440, 744), "Slow  ·  oxygen + water", font=font("regular", 26), fill=MUTED, anchor="mt")
        if focus == "slow":
            d.text((420, 480), "Iron changes gradually", font=font("bold", 40), fill=TEAL, anchor="mm")
    return img


def define(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "What rate of reaction means")
    d.rounded_rectangle((160, 300, W - 160, 780), 28, fill=CARD, outline=LINE, width=2)
    d.text((W / 2, 430), "How quickly reactants are used up,", font=font("semibold", 40), fill=INK, anchor="mm")
    d.text((W / 2, 510), "or how quickly products are formed.", font=font("semibold", 40), fill=INK, anchor="mm")
    d.text((W / 2, 640), "Faster change  →  higher rate", font=font("medium", 30), fill=TEAL, anchor="mm")
    return img


def words(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Two words you must use precisely")
    if vis(revealed, "reactants"):
        d.rounded_rectangle((140, 300, 900, 780), 24, fill=CARD, outline=TEAL, width=4)
        d.text((520, 400), "Reactants", font=font("bold", 44), fill=TEAL, anchor="mm")
        d.text((520, 520), "The substances we start with", font=font("regular", 28), fill=INK, anchor="mm")
    if vis(revealed, "products"):
        d.rounded_rectangle((1020, 300, 1780, 780), 24, fill=CARD, outline=MAGENTA, width=4)
        d.text((1400, 400), "Products", font=font("bold", 44), fill=MAGENTA, anchor="mm")
        d.text((1400, 520), "The new substances made", font=font("regular", 28), fill=INK, anchor="mm")
    return img


def formula(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Calculating average rate", "Measure a change, then divide by the time taken")
    d.text((W / 2, 320), "Average rate  =", font=font("bold", 40), fill=INK, anchor="mm")
    d.line((360, 560, W - 360, 560), fill=NAVY, width=5)
    top = "Quantity of product formed" if vis(revealed, "product") else "Quantity of reactant used up"
    colour = MAGENTA if vis(revealed, "product") and not vis(revealed, "reactant") else (TEAL if vis(revealed, "reactant") else INK)
    if vis(revealed, "product") and vis(revealed, "reactant"):
        top = "Reactant used up   OR   product formed"
        colour = GREEN
    d.text((W / 2, 480), top, font=font("bold", 40), fill=colour, anchor="mm")
    d.text((W / 2, 640), "Time taken", font=font("bold", 40), fill=INK, anchor="mm")
    return img


def units(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "The units of rate follow the measurement")
    rows = [
        ("Mass", "grams  ÷  seconds", "g/s"),
        ("Volume", "cm³  ÷  seconds", "cm³/s"),
        ("Amount", "moles  ÷  seconds", "mol/s"),
    ]
    y = 300
    for left, mid, right in rows:
        d.rounded_rectangle((180, y, W - 180, y + 150), 20, fill=CARD, outline=LINE, width=2)
        d.text((240, y + 75), left, font=font("bold", 32), fill=TEAL, anchor="lm")
        d.text((780, y + 75), mid, font=font("regular", 30), fill=INK, anchor="lm")
        d.text((1580, y + 75), right, font=font("bold", 36), fill=NAVY, anchor="rm")
        y += 180
    return img


def reaction(_lesson, _revealed, t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Magnesium + hydrochloric acid")
    d.text((W / 2, 280), chem("Mg + 2HCl  →  MgCl2 + H2"), font=font("bold", 48), fill=TEAL, anchor="mt")
    d.text((420, 400), "Reactants", font=font("semibold", 28), fill=TEAL, anchor="mm")
    d.text((1500, 400), "Products", font=font("semibold", 28), fill=MAGENTA, anchor="mm")
    flask(d, 960, 720, t)
    d.text((960, 980), "Hydrogen bubbles  ·  magnesium is used up", font=font("regular", 24), fill=MUTED, anchor="mm")
    return img


def ex1(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Example 1: hydrogen produced", "Calculate the average rate in cm³/s")
    d.rounded_rectangle((220, 320, 900, 780), 24, fill=CARD, outline=LINE, width=2)
    d.text((560, 430), "180 cm³", font=font("bold", 64), fill=MAGENTA, anchor="mm")
    d.text((560, 530), "hydrogen collected", font=font("regular", 26), fill=MUTED, anchor="mm")
    d.rounded_rectangle((1020, 320, 1700, 780), 24, fill=CARD, outline=LINE, width=2)
    d.text((1360, 430), "2 min", font=font("bold", 64), fill=NAVY, anchor="mm")
    d.text((1360, 530), "time taken", font=font("regular", 26), fill=MUTED, anchor="mm")
    return img


def ex1_calc(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Example 1: hydrogen produced", "Convert minutes to seconds, then divide")
    y = 320
    steps = [
        ("time", "2 × 60 = 120 s"),
        ("div", "180 ÷ 120"),
        ("ans", "=  1.5 cm³/s"),
    ]
    for key, text in steps:
        if vis(revealed, key):
            d.rounded_rectangle((320, y, W - 320, y + 140), 20, fill=CARD, outline=LINE, width=2)
            d.text((W / 2, y + 70), text, font=font("bold", 48), fill=TEAL if key == "ans" else INK, anchor="mm")
        y += 170
    return img


def ex1_ans(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Average rate of hydrogen production")
    d.text((W / 2, 460), "1.5 cm³/s", font=font("bold", 96), fill=TEAL, anchor="mm")
    d.text((W / 2, 600), "1.5 centimetres cubed of hydrogen each second, on average", font=font("regular", 28), fill=MUTED, anchor="mm")
    d.text((W / 2, 700), "The actual rate may have been faster at the start.", font=font("medium", 26), fill=INK, anchor="mm")
    return img


def ex2(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Example 2: magnesium used up", "A separate experiment  ·  rate in g/s")
    d.rounded_rectangle((220, 320, 900, 780), 24, fill=CARD, outline=LINE, width=2)
    d.text((560, 430), "3 g", font=font("bold", 64), fill=TEAL, anchor="mm")
    d.text((560, 530), "magnesium used up", font=font("regular", 26), fill=MUTED, anchor="mm")
    d.rounded_rectangle((1020, 320, 1700, 780), 24, fill=CARD, outline=LINE, width=2)
    d.text((1360, 430), "4 min", font=font("bold", 64), fill=NAVY, anchor="mm")
    d.text((1360, 530), "time taken", font=font("regular", 26), fill=MUTED, anchor="mm")
    return img


def ex2_ans(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Example 2: magnesium used up")
    y = 300
    steps = [
        ("time", "4 × 60 = 240 s"),
        ("div", "3 ÷ 240"),
        ("ans", "=  0.0125 g/s"),
    ]
    for key, text in steps:
        if vis(revealed, key):
            d.rounded_rectangle((320, y, W - 320, y + 150), 20, fill=CARD, outline=LINE, width=2)
            d.text((W / 2, y + 75), text, font=font("bold", 48), fill=TEAL if key == "ans" else INK, anchor="mm")
        y += 180
    return img


def note(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Average rate hides the change")
    d.text((W / 2, 460), "Graphs show how the rate changes", font=font("bold", 46), fill=INK, anchor="mm")
    d.text((W / 2, 560), "as the reaction proceeds.", font=font("bold", 46), fill=TEAL, anchor="mm")
    return img


def _graph_mg(lesson, revealed, t, page, phase: str):
    img, d = chrome("Rates of reaction")
    heading(d, "Reactant remaining against time")
    box = (300, 310, 1620, 860)
    axes(d, box, "Time (s)", "Mass of magnesium remaining (g)", [(1.0, "3")])
    if phase == "draw":
        # find slide start
        start = next(s["t"] for s in lesson["slides"] if s["id"] == "mg_line")
        progress = min(1.0, max(0.0, (t - start) / 8.0))
        draw_curve(d, box, decay_points(), progress, TEAL, y_scale=1.0)
        d.text((1680, 320), "steep = fast", font=font("medium", 22), fill=TEAL, anchor="lt")
    d.text((W / 2, 980), "Schematic curve  ·  not measured experimental data", font=font("regular", 20), fill=MUTED, anchor="mm")
    return img


def _graph_h2(lesson, revealed, t, page):
    img, d = chrome("Rates of reaction")
    heading(d, "Product formed against time")
    box = (300, 310, 1620, 860)
    axes(d, box, "Time (s)", "Volume of hydrogen produced (cm³)", [])
    start = next(s["t"] for s in lesson["slides"] if s["id"] == "h2_graph")
    progress = min(1.0, max(0.0, (t - start) / 8.0))
    draw_curve(d, box, rise_points(), progress, MAGENTA, y_scale=0.92)
    d.text((W / 2, 980), "Schematic curve  ·  not measured experimental data", font=font("regular", 20), fill=MUTED, anchor="mm")
    return img


def steep(_lesson, revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Reading the graph")
    if vis(revealed, "fast"):
        d.rounded_rectangle((180, 300, 1740, 500), 22, fill=CARD, outline=TEAL, width=4)
        d.text((W / 2, 400), "Steeper line  →  faster reaction", font=font("bold", 42), fill=TEAL, anchor="mm")
    if vis(revealed, "flat"):
        d.rounded_rectangle((180, 560, 1740, 760), 22, fill=CARD, outline=NAVY, width=4)
        d.text((W / 2, 660), "Horizontal line  →  quantity has stopped changing", font=font("bold", 36), fill=NAVY, anchor="mm")
    return img


def units2(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Always match the units in the question")
    d.rounded_rectangle((220, 320, W - 220, 780), 24, fill=CARD, outline=LINE, width=2)
    d.text((W / 2, 450), "0.6 mol in 2 minutes", font=font("bold", 44), fill=INK, anchor="mm")
    d.text((W / 2, 560), "0.6  ÷  2  =  0.3 mol/min", font=font("bold", 48), fill=TEAL, anchor="mm")
    d.text((W / 2, 680), "If the question asks for per second, convert time first.", font=font("regular", 28), fill=MUTED, anchor="mm")
    return img


def recap(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    heading(d, "Remember the key relationship")
    d.text((W / 2, 360), "Average rate  =", font=font("bold", 40), fill=INK, anchor="mm")
    d.line((300, 560, W - 300, 560), fill=NAVY, width=5)
    d.text((W / 2, 480), "Reactant used up  OR  product formed", font=font("bold", 40), fill=TEAL, anchor="mm")
    d.text((W / 2, 640), "Time taken", font=font("bold", 40), fill=INK, anchor="mm")
    d.text((W / 2, 800), "On a graph, greater steepness means a faster reaction.", font=font("medium", 28), fill=MUTED, anchor="mm")
    return img


def outro(_lesson, _revealed, _t, _page):
    img, d = chrome("Rates of reaction")
    d.text((W / 2, 360), "Thanks for watching", font=font("bold", 64), fill=INK, anchor="mm")
    d.text((W / 2, 470), "Subscribe to JD Science", font=font("semibold", 36), fill=TEAL, anchor="mm")
    d.text((W / 2, 600), "jdscience.co.uk", font=font("bold", 48), fill=NAVY, anchor="mm")
    d.text((W / 2, 700), "Further lessons, resources and practice questions", font=font("regular", 26), fill=MUTED, anchor="mm")
    return img


RENDERERS = {
    "hello": hello,
    "title": title,
    "aims": aims,
    "hook": hook,
    "define": define,
    "words": words,
    "formula": formula,
    "units": units,
    "reaction": reaction,
    "ex1": ex1,
    "ex1_calc": ex1_calc,
    "ex1_ans": ex1_ans,
    "ex2": ex2,
    "ex2_ans": ex2_ans,
    "note": note,
    "steep": steep,
    "units2": units2,
    "recap": recap,
    "outro": outro,
}


def render_slide(lesson: dict, slide_id: str, revealed: list[str], t: float) -> Image.Image:
    slide = next(s for s in lesson["slides"] if s["id"] == slide_id)
    kind = slide["kind"]
    page = slide.get("page", 1)
    if kind == "compare":
        return compare(lesson, revealed, t, page, focus=slide.get("focus", "both"))
    if kind == "graph_mg":
        return _graph_mg(lesson, revealed, t, page, phase=slide.get("phase", "axes"))
    if kind == "graph_h2":
        return _graph_h2(lesson, revealed, t, page)
    return RENDERERS[kind](lesson, revealed, t, page)
