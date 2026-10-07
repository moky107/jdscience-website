#!/usr/bin/env python3
"""Generate improved JD Science MSK disorder lesson videos (BTEC L3 Unit 8 A.P2)."""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = Path(__file__).resolve().parent / "scripts.json"
OUT_PUBLIC = ROOT / "public" / "resources" / "btec" / "applied-science" / "videos"
WORK = Path("/tmp/msk-gen")
W, H = 1920, 1080

TEAL = (13, 148, 136)
TEAL_DARK = (15, 118, 110)
TEAL_DEEP = (19, 78, 74)
TEAL_SOFT = (204, 251, 241)
INK = (15, 23, 42)
PANEL = (15, 23, 42)
PANEL2 = (30, 41, 59)
PANEL3 = (51, 65, 85)
WHITE = (248, 250, 252)
MUTED = (148, 163, 184)
ACCENT = (45, 212, 191)
GOLD = (251, 191, 36)
WEAK_BG = (69, 10, 10)
STRONG_BG = (6, 78, 59)
RED_SOFT = (252, 165, 165)

VOICE = "en-GB-SoniaNeural"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_w: int) -> list[str]:
    words = str(text or "").split()
    if not words:
        return [""]
    lines, cur = [], words[0]
    for w in words[1:]:
        trial = f"{cur} {w}"
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def rounded(draw: ImageDraw.ImageDraw, box, fill, radius=18):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def base_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W, H), PANEL)
    # atmospheric gradient washes
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(0, 520, 4):
        alpha = int(55 * (1 - i / 520))
        od.ellipse([1100 - i, -80 - i // 2, 2100 + i, 720 + i // 2], fill=(13, 148, 136, alpha))
    for i in range(0, 380, 4):
        alpha = int(40 * (1 - i / 380))
        od.ellipse([-200 - i, 700 - i // 2, 700 + i, 1300 + i // 2], fill=(15, 118, 110, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # left brand rail
    draw.rectangle([0, 0, 16, H], fill=TEAL)
    draw.rectangle([16, 0, 18, H], fill=ACCENT)

    # top brand strip
    draw.rectangle([18, 0, W, 72], fill=TEAL_DEEP)
    draw.rectangle([18, 72, W, 76], fill=TEAL)
    draw.text((44, 22), "JD SCIENCE", font=font(24, True), fill=TEAL_SOFT)
    draw.text((240, 26), "BTEC Level 3 Applied Science  ·  Unit 8  ·  A.P2", font=font(18), fill=MUTED)
    return img, draw


def footer(draw: ImageDraw.ImageDraw, series: str, slide_i: int, slide_n: int) -> None:
    draw.rectangle([18, H - 58, W, H], fill=(8, 15, 28))
    draw.text((44, H - 40), series, font=font(17), fill=MUTED)
    # progress dots
    dot_x = W - 280
    for i in range(slide_n):
        cx = dot_x + i * 28
        fill = ACCENT if i + 1 == slide_i else PANEL3
        draw.ellipse([cx, H - 38, cx + 14, H - 24], fill=fill)
    draw.text((W - 90, H - 40), f"{slide_i}/{slide_n}", font=font(17, True), fill=TEAL_SOFT)


def draw_heading(draw: ImageDraw.ImageDraw, eyebrow: str, heading: str, sub: str | None = None, y: int = 108) -> int:
    draw.text((48, y), eyebrow.upper(), font=font(20, True), fill=ACCENT)
    y += 40
    for line in wrap(draw, heading, font(52, True), W - 140):
        draw.text((48, y), line, font=font(52, True), fill=WHITE)
        y += 62
    if sub:
        y += 6
        for line in wrap(draw, sub, font(26), W - 160):
            draw.text((48, y), line, font=font(26), fill=MUTED)
            y += 34
    return y + 28


def draw_joint_motif(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float = 1.0) -> None:
    """Simple schematic joint: two bone ends + cartilage gap."""
    r = int(90 * scale)
    # upper bone
    draw.rounded_rectangle([cx - int(40 * scale), cy - int(220 * scale), cx + int(40 * scale), cy - int(20 * scale)], radius=20, fill=PANEL3)
    draw.ellipse([cx - r, cy - r - int(10 * scale), cx + r, cy + r - int(10 * scale)], outline=TEAL, width=6)
    # cartilage arc
    draw.arc([cx - int(70 * scale), cy - int(30 * scale), cx + int(70 * scale), cy + int(50 * scale)], 200, 340, fill=ACCENT, width=8)
    # lower bone
    draw.ellipse([cx - int(75 * scale), cy + int(10 * scale), cx + int(75 * scale), cy + int(160 * scale)], outline=MUTED, width=5)
    draw.rounded_rectangle([cx - int(36 * scale), cy + int(120 * scale), cx + int(36 * scale), cy + int(260 * scale)], radius=18, fill=PANEL3)


def render_slide(slide: dict, series: str, idx: int, total: int) -> Image.Image:
    layout = slide.get("layout", "title")
    img, draw = base_canvas()
    y = draw_heading(draw, slide.get("eyebrow", ""), slide.get("heading", ""), slide.get("sub"))

    if layout == "title":
        for b in slide.get("bullets", []):
            rounded(draw, [48, y, 760, y + 68], PANEL2, 16)
            draw.ellipse([70, y + 22, 98, y + 50], fill=TEAL)
            draw.text((120, y + 18), b, font=font(26), fill=WHITE)
            y += 84
        # right visual panel
        rounded(draw, [980, 150, 1860, 930], PANEL2, 28)
        draw.rectangle([980, 150, 1860, 162], fill=TEAL)
        draw_joint_motif(draw, 1420, 480, 1.15)
        draw.text((1080, 820), "Tissue change  →  Movement change", font=font(26, True), fill=TEAL_SOFT)

    elif layout == "do_now":
        for item in slide.get("items", []):
            rounded(draw, [48, y, 1860, y + 118], PANEL2, 20)
            draw.ellipse([78, y + 28, 148, y + 98], fill=TEAL)
            num = item.split(".")[0]
            draw.text((100, y + 44), num, font=font(30, True), fill=WHITE)
            draw.text((180, y + 40), item.split(". ", 1)[-1], font=font(34), fill=WHITE)
            y += 138

    elif layout == "route":
        x = 48
        for step in slide.get("steps", []):
            rounded(draw, [x, y, x + 430, y + 440], PANEL2, 24)
            draw.rectangle([x, y, x + 430, y + 10], fill=TEAL)
            draw.text((x + 28, y + 36), step["n"], font=font(48, True), fill=ACCENT)
            yy = y + 110
            for line in wrap(draw, step["t"], font(28, True), 370):
                draw.text((x + 28, yy), line, font=font(28, True), fill=WHITE)
                yy += 36
            yy += 16
            for line in wrap(draw, step["d"], font(22), 370):
                draw.text((x + 28, yy), line, font=font(22), fill=MUTED)
                yy += 30
            x += 460

    elif layout == "key_idea":
        rounded(draw, [48, y, 1860, y + 380], PANEL2, 28)
        draw.rectangle([48, y, 72, y + 380], fill=TEAL)
        draw.ellipse([100, y + 40, 160, y + 100], fill=TEAL_DARK)
        draw.text((118, y + 54), "★", font=font(28, True), fill=GOLD)
        body = slide.get("body", "")
        yy = y + 130
        for line in wrap(draw, body, font(38, True), 1680):
            draw.text((100, yy), line, font=font(38, True), fill=WHITE)
            yy += 54

    elif layout == "columns4":
        cards = slide.get("cards", [])
        x = 48
        for i, card in enumerate(cards):
            rounded(draw, [x, y, x + 430, y + 380], PANEL2, 24)
            draw.rectangle([x, y, x + 430, y + 14], fill=TEAL if i % 2 == 0 else ACCENT)
            draw.ellipse([x + 28, y + 40, x + 88, y + 100], fill=TEAL_DARK)
            draw.text((x + 48, y + 54), str(i + 1), font=font(28, True), fill=WHITE)
            draw.text((x + 28, y + 128), card["t"], font=font(30, True), fill=TEAL_SOFT)
            yy = y + 190
            for line in wrap(draw, card["d"], font(26), 370):
                draw.text((x + 28, yy), line, font=font(26), fill=WHITE)
                yy += 36
            x += 460

    elif layout == "checklist":
        for i, item in enumerate(slide.get("items", []), 1):
            rounded(draw, [48, y, 1860, y + 104], PANEL2, 18)
            draw.rounded_rectangle([78, y + 28, 148, y + 84], radius=12, fill=TEAL)
            draw.text((100, y + 40), str(i), font=font(28, True), fill=WHITE)
            draw.text((180, y + 36), item, font=font(28), fill=WHITE)
            y += 122

    elif layout == "chain":
        steps = slide.get("steps", [])
        x = 48
        for i, step in enumerate(steps):
            rounded(draw, [x, y, x + 400, y + 500], PANEL2, 24)
            draw.rectangle([x, y, x + 400, y + 12], fill=TEAL)
            draw.text((x + 28, y + 36), step["n"], font=font(52, True), fill=ACCENT)
            draw.text((x + 28, y + 120), step["t"], font=font(32, True), fill=WHITE)
            yy = y + 190
            for line in wrap(draw, step["d"], font(24), 340):
                draw.text((x + 28, yy), line, font=font(24), fill=MUTED)
                yy += 34
            if i < len(steps) - 1:
                draw.polygon(
                    [(x + 410, y + 250), (x + 448, y + 270), (x + 410, y + 290)],
                    fill=TEAL,
                )
            x += 460

    elif layout == "compare":
        left, right = slide.get("left", {}), slide.get("right", {})
        rounded(draw, [48, y, 900, y + 440], WEAK_BG, 24)
        rounded(draw, [1000, y, 1860, y + 440], STRONG_BG, 24)
        draw.rectangle([48, y, 900, y + 12], fill=(185, 28, 28))
        draw.rectangle([1000, y, 1860, y + 12], fill=TEAL)
        draw.text((80, y + 40), left.get("t", "Weak"), font=font(34, True), fill=RED_SOFT)
        draw.text((1032, y + 40), right.get("t", "Strong"), font=font(34, True), fill=TEAL_SOFT)
        yy = y + 120
        for line in wrap(draw, left.get("d", ""), font(28), 780):
            draw.text((80, yy), line, font=font(28), fill=WHITE)
            yy += 40
        yy = y + 120
        for line in wrap(draw, right.get("d", ""), font(28), 780):
            draw.text((1032, yy), line, font=font(28), fill=WHITE)
            yy += 40

    elif layout == "table":
        rows = slide.get("rows", [])
        headers = ["Group", "Tissue", "Count", "Disorders"]
        widths = [420, 360, 160, 820]
        x0 = 48
        rounded(draw, [48, y, 1860, y + 70], TEAL_DEEP, 12)
        x = x0 + 16
        for h, w in zip(headers, widths):
            draw.text((x, y + 20), h, font=font(22, True), fill=TEAL_SOFT)
            x += w
        y += 86
        for i, row in enumerate(rows):
            fill = TEAL if i == 2 else PANEL2
            text_c = WHITE
            muted_c = TEAL_SOFT if i == 2 else MUTED
            rounded(draw, [48, y, 1860, y + 120], fill, 14)
            vals = [row["group"], row["tissue"], row["count"], row["items"]]
            x = x0 + 16
            for j, (val, w) in enumerate(zip(vals, widths)):
                fnt = font(22, True) if j == 0 else font(20)
                col = text_c if j == 0 else muted_c
                lines = wrap(draw, val, fnt, w - 20)
                yy = y + 28
                for line in lines[:3]:
                    draw.text((x, yy), line, font=fnt, fill=col if j else text_c)
                    yy += 28
                x += w
            y += 132

    elif layout == "case":
        points = slide.get("points", [])
        for p in points:
            rounded(draw, [48, y, 1860, y + 124], PANEL2, 18)
            draw.rectangle([48, y, 62, y + 124], fill=TEAL)
            draw.text((80, y + 22), p["t"], font=font(22, True), fill=ACCENT)
            for line in wrap(draw, p["d"], font(28), 1700):
                draw.text((80, y + 60), line, font=font(28), fill=WHITE)
                break
            y += 144

    elif layout == "answer":
        rounded(draw, [48, y, 1860, y + 440], PANEL2, 28)
        draw.rectangle([48, y, 72, y + 440], fill=TEAL)
        draw.rounded_rectangle([100, y + 40, 280, y + 96], radius=12, fill=TEAL)
        draw.text((130, y + 54), "CORRECT", font=font(22, True), fill=WHITE)
        body = slide.get("body", "")
        yy = y + 130
        for line in wrap(draw, body, font(34), 1680):
            draw.text((100, yy), line, font=font(34), fill=WHITE)
            yy += 48

    elif layout == "distractors":
        for item in slide.get("items", []):
            rounded(draw, [48, y, 1860, y + 156], PANEL2, 18)
            draw.ellipse([78, y + 28, 118, y + 68], outline=(185, 28, 28), width=4)
            draw.line([88, y + 38, 108, y + 58], fill=(185, 28, 28), width=4)
            draw.line([108, y + 38, 88, y + 58], fill=(185, 28, 28), width=4)
            draw.text((140, y + 28), item["t"], font=font(28, True), fill=TEAL_SOFT)
            yy = y + 78
            for line in wrap(draw, item["d"], font(24), 1680):
                draw.text((140, yy), line, font=font(24), fill=MUTED)
                yy += 32
            y += 176

    footer(draw, series, idx, total)
    return img


async def synth(text: str, out_mp3: Path) -> float:
    import edge_tts

    communicate = edge_tts.Communicate(text, VOICE, rate="-5%")
    await communicate.save(str(out_mp3))
    probe = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(out_mp3)],
        text=True,
    ).strip()
    return max(float(probe), 1.5)


def run(cmd: list[str]) -> None:
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def build_video(video: dict) -> Path:
    vid_dir = WORK / video["id"]
    vid_dir.mkdir(parents=True, exist_ok=True)
    slides = video["slides"]
    series = video.get("series", "BTEC L3 Applied Science · Unit 8 · A.P2")
    total = len(slides)

    async def all_audio():
        durations = []
        for i, slide in enumerate(slides, 1):
            img = render_slide(slide, series, i, total)
            png = vid_dir / f"slide_{i:02d}.png"
            img.save(png, "PNG")
            mp3 = vid_dir / f"vo_{i:02d}.mp3"
            dur = await synth(slide["vo"], mp3)
            dur = dur + 0.45
            durations.append((png, mp3, dur))
        return durations

    durations = asyncio.run(all_audio())

    parts = []
    for i, (png, mp3, dur) in enumerate(durations, 1):
        part = vid_dir / f"part_{i:02d}.mp4"
        run([
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(png),
            "-i", str(mp3),
            "-c:v", "libx264", "-tune", "stillimage",
            "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            "-t", f"{dur:.3f}",
            "-vf", "fps=30,format=yuv420p",
            "-movflags", "+faststart",
            str(part),
        ])
        parts.append(part)

    list_file = vid_dir / "list.txt"
    list_file.write_text("".join(f"file '{p}'\n" for p in parts))
    out_name = f"msk-disorders-{video['id']}-{video['slug']}.mp4"
    out_path = OUT_PUBLIC / out_name
    OUT_PUBLIC.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
        "-c", "copy", "-movflags", "+faststart", str(out_path),
    ])
    return out_path


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    videos = json.loads(SCRIPTS.read_text())
    results = []
    for video in videos:
        print(f"Generating video {video['id']}: {video['title']}...", flush=True)
        path = build_video(video)
        size = path.stat().st_size
        dur = subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
            text=True,
        ).strip()
        print(f"  -> {path.relative_to(ROOT)} ({size/1e6:.1f} MB, {float(dur):.1f}s)", flush=True)
        results.append({
            "id": video["id"],
            "path": str(path.relative_to(ROOT)),
            "title": video["title"],
            "duration": float(dur),
            "slug": video["slug"],
            "file": path.name,
        })
    (WORK / "manifest.json").write_text(json.dumps(results, indent=2))
    print("DONE", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
