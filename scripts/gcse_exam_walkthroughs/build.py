#!/usr/bin/env python3
"""Build GCSE Science exam walkthrough PDF and DOCX packs."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from gcse_exam_walkthroughs.builder import build_docx, build_pdf
from gcse_exam_walkthroughs.covers import build_all_covers
from gcse_exam_walkthroughs.pack_biology import build_pack as build_biology
from gcse_exam_walkthroughs.pack_chemistry import build_pack as build_chemistry
from gcse_exam_walkthroughs.pack_physics import build_pack as build_physics
from gcse_exam_walkthroughs.theme import OUT

PACKS = [
    ("chemistry", build_chemistry),
    ("biology", build_biology),
    ("physics", build_physics),
]


def build_bundle_zip(out_dir: Path) -> Path:
    bundle_dir = out_dir / "bundle"
    bundle_dir.mkdir(parents=True, exist_ok=True)
    zip_path = bundle_dir / "gcse-science-exam-walkthrough-bundle.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for slug in ("chemistry", "biology", "physics"):
            folder = out_dir / slug
            for name in (
                f"gcse-{slug}-exam-walkthrough-pack.pdf",
                f"gcse-{slug}-exam-walkthrough-pack.docx",
            ):
                src = folder / name
                if src.exists():
                    zf.write(src, arcname=f"gcse-{slug}/{name}")
    return zip_path


def build_preview_pdf(source_pdf: Path, preview_pdf: Path, max_pages: int = 8) -> Path:
    """Copy first pages as shop preview using pypdf if available, else truncate note."""
    try:
        from pypdf import PdfReader, PdfWriter

        reader = PdfReader(str(source_pdf))
        writer = PdfWriter()
        for i in range(min(max_pages, len(reader.pages))):
            writer.add_page(reader.pages[i])
        preview_pdf.parent.mkdir(parents=True, exist_ok=True)
        with open(preview_pdf, "wb") as f:
            writer.write(f)
        return preview_pdf
    except ImportError:
        preview_pdf.write_bytes(source_pdf.read_bytes()[:50000])
        return preview_pdf


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for path in build_all_covers():
        print(f"COVER {path}")

    built = []
    for slug, builder in PACKS:
        pack = builder()
        folder = OUT / slug
        pdf_path = folder / f"gcse-{slug}-exam-walkthrough-pack.pdf"
        docx_path = folder / f"gcse-{slug}-exam-walkthrough-pack.docx"
        build_pdf(pack, pdf_path)
        build_docx(pack, docx_path)
        preview_path = folder / f"gcse-{slug}-exam-walkthrough-preview.pdf"
        build_preview_pdf(pdf_path, preview_path)
        print(f"PDF  {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")
        print(f"DOCX {docx_path} ({docx_path.stat().st_size // 1024} KB)")
        print(f"PREV {preview_path}")
        built.append((slug, pdf_path, docx_path))

    zip_path = build_bundle_zip(OUT)
    print(f"BUNDLE {zip_path} ({zip_path.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
