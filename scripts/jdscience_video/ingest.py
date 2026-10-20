#!/usr/bin/env python3
"""Ingest lesson source media that Cursor chat cannot attach as .mp3/.mp4.

Accepts a zip, a renamed binary, a local path, or a public URL. Files are
identified by magic bytes (so .bin / .dat / no extension still work) and
copied into content/videos/<topic>/source/.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from jdscience_video.topics import SLUGS, infer_topic  # noqa: E402

INBOX = ROOT / "content/videos/_inbox"
VIDEO_ROOT = ROOT / "content/videos"

AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".aac", ".flac"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm"}
SLIDE_EXTS = {".pptx", ".ppt"}
WRAP_EXTS = {".zip", ".bin", ".dat", ".blob"}


def sniff(path: Path) -> str:
    """Return mp3, wav, mp4, pptx, zip, or unknown from file bytes."""
    data = path.read_bytes()[:64]
    if data[:3] == b"ID3" or data[:2] in {b"\xff\xfb", b"\xff\xf3", b"\xff\xf2", b"\xff\xe3"}:
        return "mp3"
    if data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return "wav"
    if data[:4] == b"fLaC":
        return "flac"
    if len(data) >= 12 and data[4:8] == b"ftyp":
        return "mp4"
    if data[:4] == b"PK\x03\x04":
        try:
            with zipfile.ZipFile(path) as zf:
                names = zf.namelist()
        except zipfile.BadZipFile:
            return "unknown"
        if any(n.startswith("ppt/") or n.startswith("word/") for n in names):
            return "pptx" if any(n.startswith("ppt/") for n in names) else "zip"
        return "zip"
    return "unknown"


def _drive_id(url: str) -> str | None:
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    if "drive.google.com" not in host and "docs.google.com" not in host:
        return None
    match = re.search(r"/d/([a-zA-Z0-9_-]+)", parsed.path)
    if match:
        return match.group(1)
    return parse_qs(parsed.query).get("id", [None])[0]


def _direct_url(url: str) -> str:
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    if "dropbox.com" in host:
        query = parse_qs(parsed.query)
        query["dl"] = ["1"]
        qs = "&".join(f"{k}={v[0]}" for k, vals in query.items() for v in vals)
        return parsed._replace(query=qs).geturl()
    drive = _drive_id(url)
    if drive:
        return f"https://drive.google.com/uc?export=download&id={drive}&confirm=t"
    return url


def download(url: str, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    target_url = _direct_url(url)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp) / "download.bin"
        cmd = [
            "curl",
            "-fsSL",
            "--retry",
            "4",
            "--retry-delay",
            "2",
            "-A",
            "Mozilla/5.0",
            "-o",
            str(tmp_path),
            "-w",
            "%{filename_effective}\n%{url_effective}\n",
            "-D",
            str(Path(tmp) / "headers.txt"),
            target_url,
        ]
        proc = subprocess.run(cmd, check=False, capture_output=True, text=True)
        if proc.returncode != 0 or not tmp_path.exists() or tmp_path.stat().st_size == 0:
            raise SystemExit(
                f"Download failed ({proc.returncode}). Paste a public WeTransfer / "
                f"Dropbox / Drive (anyone-with-the-link) URL.\n{proc.stderr.strip()}"
            )
        name = _name_from_headers(Path(tmp) / "headers.txt") or Path(
            urlparse(url).path
        ).name
        name = unquote(name) or "download.bin"
        if name in {"uc", "download", "download.bin", ""}:
            kind = sniff(tmp_path)
            name = f"source.{kind if kind != 'unknown' else 'bin'}"
        out = dest_dir / Path(name).name
        shutil.copy2(tmp_path, out)
    return out


def _name_from_headers(header_path: Path) -> str | None:
    if not header_path.exists():
        return None
    text = header_path.read_text(errors="replace")
    match = re.search(r'filename\*?=(?:UTF-8\'\')?"?([^";\r\n]+)"?', text, re.I)
    return match.group(1) if match else None


def unpack(path: Path, dest_dir: Path) -> list[Path]:
    dest_dir.mkdir(parents=True, exist_ok=True)
    kind = sniff(path)
    if kind == "zip":
        extracted: list[Path] = []
        with zipfile.ZipFile(path) as zf:
            for info in zf.infolist():
                if info.is_dir() or info.filename.startswith("__MACOSX/"):
                    continue
                target = dest_dir / Path(info.filename).name
                with zf.open(info) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                extracted.append(target)
        return extracted
    copied = dest_dir / path.name
    if path.resolve() != copied.resolve():
        shutil.copy2(path, copied)
        return [copied]
    return [path]


def classify(path: Path) -> str:
    kind = sniff(path)
    if kind in {"mp3", "wav", "flac"}:
        return "audio"
    if kind == "mp4":
        return "video"
    if kind == "pptx":
        return "slides"
    ext = path.suffix.lower()
    if ext in AUDIO_EXTS:
        return "audio"
    if ext in VIDEO_EXTS:
        return "video"
    if ext in SLIDE_EXTS:
        return "slides"
    return "other"


def extract_audio(video: Path, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video),
        "-vn",
        "-c:a",
        "libmp3lame",
        "-q:a",
        "2",
        str(dest),
    ]
    proc = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if proc.returncode != 0 or not dest.exists():
        raise SystemExit(f"ffmpeg could not extract audio from {video.name}:\n{proc.stderr[-800:]}")
    return dest


def place(files: list[Path], topic: str) -> dict[str, Path]:
    if topic not in SLUGS:
        raise SystemExit(f"Unknown topic {topic!r}. Use one of: {', '.join(sorted(SLUGS))}")
    source = VIDEO_ROOT / topic / "source"
    source.mkdir(parents=True, exist_ok=True)
    placed: dict[str, Path] = {}
    for path in files:
        role = classify(path)
        if role == "audio":
            dest = source / "narration_master.mp3"
            if sniff(path) != "mp3":
                dest = source / f"narration_master.{sniff(path) if sniff(path) != 'unknown' else 'bin'}"
            shutil.copy2(path, dest)
            placed["audio"] = dest
        elif role == "video":
            dest = source / "reference.mp4"
            shutil.copy2(path, dest)
            placed["video"] = dest
            audio_dest = source / "narration_master.mp3"
            if "audio" not in placed:
                extract_audio(dest, audio_dest)
                placed["audio"] = audio_dest
        elif role == "slides":
            dest = source / "slides.pptx"
            shutil.copy2(path, dest)
            placed["slides"] = dest
        else:
            dest = source / path.name
            shutil.copy2(path, dest)
            placed[path.name] = dest
    return placed


def ingest(items: list[str], topic: str | None) -> dict[str, Path]:
    INBOX.mkdir(parents=True, exist_ok=True)
    collected: list[Path] = []
    guessed = topic
    with tempfile.TemporaryDirectory(dir=INBOX, prefix="work-") as tmp:
        work = Path(tmp)
        for item in items:
            if re.match(r"^https?://", item, re.I):
                downloaded = download(item, work)
                guessed = guessed or infer_topic(downloaded.name)
                collected.extend(unpack(downloaded, work))
                continue
            path = Path(item).expanduser()
            if not path.exists():
                chat_uploads = Path("/home/ubuntu/.cursor/projects/workspace/uploads")
                alt = chat_uploads / path.name
                if alt.exists():
                    path = alt
                else:
                    inbox_hit = INBOX / path.name
                    if inbox_hit.exists():
                        path = inbox_hit
                    else:
                        raise SystemExit(f"File not found: {item}")
            guessed = guessed or infer_topic(path.name)
            collected.extend(unpack(path, work))
        if guessed is None:
            for path in collected:
                guessed = infer_topic(path.name)
                if guessed:
                    break
        if guessed is None:
            raise SystemExit(
                "Could not tell which lesson this is. Pass --topic moles "
                "(or concentration / percentage-by-mass / atom-economy)."
            )
        useful = [p for p in collected if classify(p) != "other" or sniff(p) != "unknown"]
        if not useful:
            useful = collected
        return place(useful, guessed)


def report(placed: dict[str, Path]) -> None:
    print("Ingested source files:")
    for role, path in placed.items():
        size = path.stat().st_size
        print(f"  {role:8}  {path.relative_to(ROOT)}  ({size:,} bytes)")
    print("Ready to transcribe and render the 60s Moles sample once moles audio is in place.")


def self_test() -> None:
    """Prove zip + renamed-bin ingest without using chat uploads."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        payload = tmp_path / "moles-narration.bin"
        # Minimal MPEG frame so sniff() reports mp3 even with a .bin suffix.
        payload.write_bytes(b"ID3\x04\x00\x00\x00\x00\x00\x00" + b"\xff\xfb\x90\x00" * 40)
        archive = tmp_path / "moles-source.zip"
        with zipfile.ZipFile(archive, "w") as zf:
            zf.write(payload, arcname="moles-narration.bin")
        dest_dir = VIDEO_ROOT / "moles" / "source"
        if dest_dir.exists():
            shutil.rmtree(dest_dir)
        placed = ingest([str(archive)], topic="moles")
        audio = placed.get("audio")
        assert audio is not None and audio.exists(), placed
        assert sniff(audio) == "mp3", sniff(audio)
        shutil.rmtree(VIDEO_ROOT / "moles")
    print("self-test ok: zip of a .bin MP3 is detected and placed as moles source")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "items",
        nargs="*",
        help="Local path, chat-upload filename, zip, or public URL",
    )
    parser.add_argument(
        "--topic",
        choices=sorted(SLUGS),
        help="Lesson slug if the filename does not contain moles/concentration/...",
    )
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args(argv)
    if args.self_test:
        self_test()
        return
    if not args.items:
        parser.error("Pass a zip, file, or URL (or --self-test)")
    report(ingest(args.items, args.topic))


if __name__ == "__main__":
    main()
