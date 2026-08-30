"""Scientific notation helpers for PowerPoint runs and plain Unicode fallbacks."""

from __future__ import annotations

from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn
from pptx.util import Pt

INK = RGBColor(0x0F, 0x17, 0x2A)

SUP_MAP = str.maketrans("0123456789+-=()", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾")
SUB_MAP = str.maketrans("0123456789+-=()aeor", "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒᵣ")


def sup(text: str) -> str:
    return str(text).translate(SUP_MAP)


def sub(text: str) -> str:
    return str(text).translate(SUB_MAP)


def sci(coeff: str, exp: int) -> str:
    return f"{coeff} × 10{sup(str(exp))}"


def ion(symbol: str, charge: str) -> str:
    return f"{symbol}{sup(charge)}"


def nuclide(mass: str | int, atomic: str | int, symbol: str, charge: str = "") -> str:
    out = f"{sup(mass)}{sub(atomic)}{symbol}"
    if charge:
        out += sup(charge)
    return out


def ar() -> str:
    return "Aᵣ"


def mr() -> str:
    return "Mᵣ"


def cfg(parts: str) -> str:
    """Turn '1s2 2s2 2p4' into '1s² 2s² 2p⁴'."""
    out = []
    for token in parts.split():
        i = 0
        while i < len(token) and not token[i].isdigit():
            i += 1
        if i == 0 or i == len(token):
            out.append(token)
        else:
            out.append(token[:i] + sup(token[i:]))
    return " ".join(out)


def unit_ms() -> str:
    return f"m s{sup('-1')}"


def apply_run(run, size=18, bold=False, color=INK, italic=False, name="Calibri", baseline=None):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = name
    run.font._element.set(qn("a:ea"), name)
    if baseline == "sup":
        run.font._element.set("baseline", "30000")
    elif baseline == "sub":
        run.font._element.set("baseline", "-25000")


def parse_markup(text: str) -> list[tuple[str, str | None]]:
    """Parse a compact markup string into (text, baseline) chunks.

    Markup:
      ^{2} or ^2   superscript
      _{r} or _r   subscript
      10^{8}       scientific
    Plain text is left unchanged. Prefer this for equations in slides.
    """
    chunks: list[tuple[str, str | None]] = []
    i = 0
    buf = []

    def flush():
        if buf:
            chunks.append(("".join(buf), None))
            buf.clear()

    while i < len(text):
        ch = text[i]
        if ch in "^{" or (ch == "^") or (ch == "_"):
            if ch == "^" or ch == "_":
                kind = "sup" if ch == "^" else "sub"
                if i + 1 < len(text) and text[i + 1] == "{":
                    end = text.find("}", i + 2)
                    if end == -1:
                        buf.append(ch)
                        i += 1
                        continue
                    flush()
                    chunks.append((text[i + 2 : end], kind))
                    i = end + 1
                    continue
                if i + 1 < len(text):
                    flush()
                    chunks.append((text[i + 1], kind))
                    i += 2
                    continue
        buf.append(ch)
        i += 1
    flush()
    return chunks


def add_markup_runs(paragraph, text, size=18, bold=False, color=INK, italic=False):
    for piece, baseline in parse_markup(text):
        run = paragraph.add_run()
        run.text = piece
        apply_run(run, size=size, bold=bold, color=color, italic=italic, baseline=baseline)
