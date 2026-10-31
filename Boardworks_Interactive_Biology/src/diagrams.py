"""Original 2D teaching diagrams. No Boardworks artwork is copied."""

from __future__ import annotations

import math
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import (
    Arc,
    Circle,
    Ellipse,
    FancyBboxPatch,
    FancyArrowPatch,
    Polygon,
    Rectangle,
    Wedge,
)
from matplotlib.patches import PathPatch
from matplotlib.path import Path
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "diagrams")


def _fig(name, w=10, h=6.2, bg="white"):
    os.makedirs(OUT, exist_ok=True)
    fig, ax = plt.subplots(figsize=(w, h), dpi=160)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor(bg)
    ax.set_facecolor(bg)
    path = os.path.join(OUT, name)
    return fig, ax, path


def _save(fig, path):
    fig.savefig(path, bbox_inches="tight", pad_inches=0.08, facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def _branch(ax, x, y, ang, length, depth, color="#4a4a4a", lw=1.1):
    if depth == 0 or length < 0.12:
        return
    x2 = x + length * math.cos(ang)
    y2 = y + length * math.sin(ang)
    ax.plot([x, x2], [y, y2], color=color, lw=lw, solid_capstyle="round")
    _branch(ax, x2, y2, ang + 0.55, length * 0.55, depth - 1, color, lw * 0.85)
    _branch(ax, x2, y2, ang - 0.5, length * 0.52, depth - 1, color, lw * 0.85)


def _myelin(ax, x0, x1, y, n=5, color="#E8A87C"):
    span = x1 - x0
    w = span / (n * 1.15)
    gap = w * 0.18
    x = x0
    for _ in range(n):
        ax.add_patch(FancyBboxPatch((x, y - 0.22), w - gap, 0.44, boxstyle="round,pad=0.04,rounding_size=0.12",
                                    facecolor=color, edgecolor="#C47A4A", lw=1.0))
        x += w


def motor_neurone(path_name="motor_neurone.png"):
    fig, ax, path = _fig(path_name, 10, 4.2)
    ax.set_ylim(0, 4.2)
    # cell body
    body = Ellipse((1.6, 2.1), 1.7, 1.5, facecolor="#5EC8C0", edgecolor="#2A7A74", lw=1.6)
    ax.add_patch(body)
    ax.add_patch(Circle((1.55, 2.1), 0.22, facecolor="#1B3A6B", edgecolor="none"))
    for ang in (2.2, 2.6, 3.1, 3.5, 3.9, 1.8):
        _branch(ax, 1.6 + 0.75 * math.cos(ang), 2.1 + 0.6 * math.sin(ang), ang, 0.55, 3)
    # axon
    ax.plot([2.45, 8.4], [2.1, 2.1], color="#6BB6E0", lw=4, solid_capstyle="butt", zorder=2)
    _myelin(ax, 2.7, 7.6, 2.1, n=6)
    # terminals
    for dy, ang in ((0.55, 0.5), (0.0, 0.0), (-0.55, -0.5)):
        ax.plot([8.4, 9.35], [2.1, 2.1 + dy], color="#4a4a4a", lw=1.3)
        _branch(ax, 9.35, 2.1 + dy, ang, 0.35, 2)
    return _save(fig, path)


def sensory_neurone(path_name="sensory_neurone.png"):
    fig, ax, path = _fig(path_name, 10, 3.4)
    ax.set_ylim(0, 3.4)
    # receptor end
    for dy, ang in ((0.5, 2.6), (0.0, 3.14), (-0.5, 3.7)):
        ax.plot([1.5, 0.55], [1.7, 1.7 + dy], color="#4a4a4a", lw=1.2)
        _branch(ax, 0.55, 1.7 + dy, ang, 0.32, 2)
    ax.plot([1.5, 4.6], [1.7, 1.7], color="#9B6BB0", lw=4, zorder=2)
    _myelin(ax, 1.7, 4.3, 1.7, n=3, color="#E8A87C")
    # dorsal root ganglion cell body off axon
    ax.plot([4.6, 4.6], [1.7, 2.55], color="#9B6BB0", lw=3)
    ax.add_patch(Circle((4.6, 2.85), 0.32, facecolor="#C9A0DC", edgecolor="#6B2D8B", lw=1.4))
    ax.add_patch(Circle((4.6, 2.85), 0.11, facecolor="#1B3A6B", edgecolor="none"))
    ax.plot([4.6, 8.3], [1.7, 1.7], color="#9B6BB0", lw=4, zorder=2)
    _myelin(ax, 4.9, 8.0, 1.7, n=3, color="#E8A87C")
    for dy, ang in ((0.5, 0.5), (0.0, 0.0), (-0.5, -0.5)):
        ax.plot([8.3, 9.25], [1.7, 1.7 + dy], color="#4a4a4a", lw=1.2)
        _branch(ax, 9.25, 1.7 + dy, ang, 0.3, 2)
    return _save(fig, path)


def relay_neurone(path_name="relay_neurone.png"):
    fig, ax, path = _fig(path_name, 10, 3.4)
    ax.set_ylim(0, 3.4)
    for dy, ang in ((0.5, 2.6), (0.15, 3.0), (-0.15, 3.3), (-0.5, 3.7)):
        ax.plot([2.2, 1.2], [1.7, 1.7 + dy], color="#4a4a4a", lw=1.2)
        _branch(ax, 1.2, 1.7 + dy, ang, 0.32, 2)
    ax.plot([2.2, 3.7], [1.7, 1.7], color="#F2D16B", lw=4, zorder=2)
    _myelin(ax, 2.3, 3.55, 1.7, n=2, color="#E8A87C")
    ax.add_patch(Circle((4.3, 1.7), 0.48, facecolor="#FFE082", edgecolor="#C9A227", lw=1.5))
    ax.add_patch(Circle((4.3, 1.7), 0.14, facecolor="#7A5B00", edgecolor="none"))
    ax.plot([4.78, 8.0], [1.7, 1.7], color="#F2D16B", lw=4, zorder=2)
    _myelin(ax, 4.95, 7.7, 1.7, n=3, color="#E8A87C")
    for dy, ang in ((0.5, 0.5), (0.0, 0.0), (-0.5, -0.5)):
        ax.plot([8.0, 9.0], [1.7, 1.7 + dy], color="#4a4a4a", lw=1.2)
        _branch(ax, 9.0, 1.7 + dy, ang, 0.3, 2)
    return _save(fig, path)


def neurone_structure(path_name="neurone_structure.png"):
    """Motor neurone suitable for labelling."""
    fig, ax, path = _fig(path_name, 10.5, 4.6)
    ax.set_ylim(0, 4.6)
    body = Ellipse((1.55, 2.3), 1.85, 1.7, facecolor="#5EC8C0", edgecolor="#2A7A74", lw=1.8)
    ax.add_patch(body)
    ax.add_patch(Circle((1.5, 2.3), 0.24, facecolor="#1B3A6B", edgecolor="none"))
    for ang in (2.15, 2.55, 3.05, 3.5, 3.95, 1.75):
        _branch(ax, 1.55 + 0.82 * math.cos(ang), 2.3 + 0.68 * math.sin(ang), ang, 0.62, 3)
    ax.plot([2.48, 8.55], [2.3, 2.3], color="#6BB6E0", lw=5, zorder=2)
    _myelin(ax, 2.7, 7.55, 2.3, n=5)
    # Schwann nucleus on one myelin
    ax.add_patch(Ellipse((5.35, 2.62), 0.38, 0.22, facecolor="#F6E6A5", edgecolor="#C9A227", lw=0.8))
    ax.add_patch(Circle((5.35, 2.62), 0.06, facecolor="#7A5B00"))
    for dy, ang in ((0.7, 0.55), (0.25, 0.2), (-0.25, -0.2), (-0.7, -0.55)):
        ax.plot([8.55, 9.55], [2.3, 2.3 + dy], color="#4a4a4a", lw=1.3)
        _branch(ax, 9.55, 2.3 + dy, ang, 0.32, 2)
    return _save(fig, path)


def axon_electrodes(path_name="axon_electrodes.png"):
    fig, ax, path = _fig(path_name, 7.2, 3.6)
    ax.set_xlim(0, 7.2)
    ax.set_ylim(0, 3.6)
    ax.add_patch(FancyBboxPatch((0.5, 1.55), 4.6, 1.15, boxstyle="round,pad=0.02,rounding_size=0.25",
                                facecolor="#B3E5FC", edgecolor="#4A90A4", lw=1.6))
    ax.text(2.7, 2.05, "axon", color="#2E9E4F", fontsize=16, fontweight="bold", ha="center")
    # electrodes
    ax.add_patch(Polygon([(2.0, 1.55), (1.75, 1.05), (2.25, 1.05)], facecolor="#9E9E9E", edgecolor="#424242"))
    ax.add_patch(Polygon([(3.5, 1.55), (3.25, 1.05), (3.75, 1.05)], facecolor="#9E9E9E", edgecolor="#424242"))
    ax.plot([2.0, 2.0, 2.75, 3.5, 3.5], [1.05, 0.55, 0.55, 0.55, 1.05], color="#424242", lw=1.4)
    ax.add_patch(Circle((2.75, 0.55), 0.16, facecolor="#BDBDBD", edgecolor="#424242"))
    ax.plot([2.75, 2.75], [0.39, 0.15], color="#424242", lw=1.4)
    ax.annotate("", xy=(5.35, 2.35), xytext=(5.05, 2.7),
                arrowprops=dict(arrowstyle="->", color="#222"))
    ax.text(5.45, 2.55, "plasma\nmembrane", color="#2E9E4F", fontsize=11, fontweight="bold", va="center")
    ax.annotate("", xy=(3.5, 1.12), xytext=(5.1, 0.55),
                arrowprops=dict(arrowstyle="->", color="#222"))
    ax.text(5.2, 0.45, "microelectrodes\nmeasuring p.d.", color="#2E9E4F", fontsize=11, fontweight="bold")
    return _save(fig, path)


def resting_charges(path_name="resting_charges.png", extra_labels=False):
    fig, ax, path = _fig(path_name, 8.6, 4.4)
    ax.set_xlim(0, 8.6)
    ax.set_ylim(0, 4.4)
    ax.add_patch(Rectangle((0.6, 2.85), 7.4, 1.15, facecolor="#F3B562", edgecolor="#2E9E4F", lw=2))
    ax.add_patch(Rectangle((0.6, 1.35), 7.4, 1.5, facecolor="#4DB6AC", edgecolor="#2E9E4F", lw=2))
    ax.add_patch(Rectangle((0.6, 0.35), 7.4, 1.0, facecolor="#F3B562", edgecolor="#2E9E4F", lw=2))
    ax.text(4.3, 3.7, "outside the axon", ha="center", fontsize=13, fontweight="bold", color="#1B3A6B")
    ax.text(4.3, 2.05, "inside the axon", ha="center", fontsize=13, fontweight="bold", color="#1B3A6B")
    ax.text(4.3, 0.7, "outside the axon", ha="center", fontsize=13, fontweight="bold", color="#1B3A6B")
    xs = np.linspace(1.15, 7.45, 7)
    for x in xs:
        ax.text(x, 3.25, "+", ha="center", fontsize=16, color="#1B3A6B", fontweight="bold")
        ax.text(x, 2.45, "−", ha="center", fontsize=18, color="#1B3A6B", fontweight="bold")
        ax.text(x, 1.55, "−", ha="center", fontsize=18, color="#1B3A6B", fontweight="bold")
        ax.text(x, 0.95, "+", ha="center", fontsize=16, color="#1B3A6B", fontweight="bold")
    return _save(fig, path)


def membrane_ions(path_name="membrane_ions.png", stage="rest"):
    """stage: rest, depol, repol, pump."""
    fig, ax, path = _fig(path_name, 9.4, 5.0)
    ax.set_xlim(0, 9.4)
    ax.set_ylim(0, 5.0)
    ax.add_patch(Rectangle((0.3, 2.15), 8.8, 0.7, facecolor="#F8C8A0", edgecolor="#C47A4A", lw=1.5))
    ax.text(8.55, 2.5, "membrane", fontsize=9, color="#6D4C41", rotation=90, va="center")
    ax.text(0.4, 4.55, "outside  (Na⁺ high)", fontsize=11, color="#1565C0")
    ax.text(0.4, 0.25, "inside  (K⁺ high)   organic anions (−)", fontsize=11, color="#C62828")
    # channels
    def channel(x, open_, ion, color):
        ax.add_patch(Rectangle((x, 2.05), 0.7, 0.9, facecolor=color, edgecolor="#333", lw=1.2, alpha=0.9))
        ax.text(x + 0.35, 1.75, ion, ha="center", fontsize=9, fontweight="bold")
        ax.text(x + 0.35, 3.15, "open" if open_ else "closed", ha="center", fontsize=8,
                color="#2E7D32" if open_ else "#C62828")

    if stage == "rest":
        channel(1.2, False, "Naᵥ", "#90CAF9")
        channel(3.0, False, "Kᵥ", "#A5D6A7")
        channel(4.8, True, "K leak", "#C8E6C9")
        # pump
        ax.add_patch(FancyBboxPatch((6.6, 2.0), 1.5, 1.0, boxstyle="round,pad=0.02,rounding_size=0.1",
                                    facecolor="#FFF59D", edgecolor="#F9A825", lw=1.4))
        ax.text(7.35, 2.5, "Na⁺/K⁺\npump", ha="center", va="center", fontsize=9, fontweight="bold")
        ax.annotate("3 Na⁺", xy=(7.35, 3.05), xytext=(7.35, 3.7),
                    ha="center", arrowprops=dict(arrowstyle="->", color="#1565C0"), color="#1565C0", fontsize=9)
        ax.annotate("2 K⁺", xy=(7.35, 1.95), xytext=(7.35, 1.2),
                    ha="center", arrowprops=dict(arrowstyle="->", color="#2E7D32"), color="#2E7D32", fontsize=9)
        ax.text(4.7, 4.2, "Resting potential  −70 mV   membrane polarised", ha="center",
                fontsize=12, fontweight="bold", color="#1B3A6B")
    elif stage == "depol":
        channel(1.2, True, "Naᵥ", "#90CAF9")
        channel(3.0, False, "Kᵥ", "#A5D6A7")
        channel(4.8, True, "K leak", "#C8E6C9")
        ax.annotate("Na⁺ in", xy=(1.55, 2.1), xytext=(1.55, 0.9),
                    ha="center", arrowprops=dict(arrowstyle="->", color="#1565C0"), color="#1565C0",
                    fontsize=11, fontweight="bold")
        ax.text(4.7, 4.2, "Depolarisation  towards +35 mV   Na⁺ influx", ha="center",
                fontsize=12, fontweight="bold", color="#1565C0")
    elif stage == "repol":
        channel(1.2, False, "Naᵥ", "#90CAF9")
        channel(3.0, True, "Kᵥ", "#A5D6A7")
        channel(4.8, True, "K leak", "#C8E6C9")
        ax.annotate("K⁺ out", xy=(3.35, 3.0), xytext=(3.35, 4.0),
                    ha="center", arrowprops=dict(arrowstyle="->", color="#2E7D32"), color="#2E7D32",
                    fontsize=11, fontweight="bold")
        ax.text(4.7, 4.55, "Repolarisation  K⁺ efflux restores negativity", ha="center",
                fontsize=12, fontweight="bold", color="#2E7D32")
    return _save(fig, path)


def ap_graph(path_name="ap_graph.png", highlight=None, labels=True, failed=False, stim=None):
    """highlight: None or 1-5 for AP phases. stim: 'weak'|'medium'|'strong'."""
    fig, ax = plt.subplots(figsize=(7.2, 4.6), dpi=160)
    t = np.linspace(0, 5, 400)
    v = np.full_like(t, -70.0)
    # build a standard AP around t=1.6-3.2
    for i, x in enumerate(t):
        if 1.45 <= x < 1.7:
            v[i] = -70 + 20 * (x - 1.45) / 0.25  # to threshold
        elif 1.7 <= x < 2.15:
            v[i] = -50 + 90 * (x - 1.7) / 0.45  # upstroke to +40
        elif 2.15 <= x < 2.55:
            v[i] = 40 - 125 * (x - 2.15) / 0.4  # downstroke
        elif 2.55 <= x < 3.15:
            v[i] = -85 + 15 * (x - 2.55) / 0.6  # afterhyperpolarisation
        elif 3.15 <= x < 3.8:
            v[i] = -70
    ax.plot(t, v, color="#C62828", lw=2.4)
    if failed:
        t2 = np.linspace(0, 5, 400)
        v2 = np.full_like(t2, -70.0)
        for i, x in enumerate(t2):
            if 1.4 <= x < 1.7:
                v2[i] = -70 + 12 * (x - 1.4) / 0.3
            elif 1.7 <= x < 2.1:
                v2[i] = -58 - 12 * (x - 1.7) / 0.4
        ax.plot(t2, v2, color="#1565C0", lw=2.0)
        ax.annotate("failed\ninitiations", xy=(1.7, -58), xytext=(0.7, -20),
                    color="#2E9E4F", fontsize=10, fontweight="bold",
                    arrowprops=dict(arrowstyle="->", color="#2E9E4F"))
        ax.axhline(-55, color="#555", ls="--", lw=0.8)
        ax.text(4.05, -52, "threshold\nvalue", color="#2E9E4F", fontsize=10, fontweight="bold")
    if stim == "weak":
        ax.cla()
        t = np.linspace(0, 12, 600)
        v = np.full_like(t, -70)
        # one AP
        for i, x in enumerate(t):
            if 2.0 <= x < 3.6:
                ph = (x - 2.0) / 1.6
                v[i] = -70 + 110 * math.sin(math.pi * min(ph, 1)) - (20 if ph > 0.7 else 0) * (ph - 0.7) / 0.3
        ax.plot(t, np.clip(v, -90, 45), color="#C62828", lw=2)
        ax.set_xlim(0, 12)
    elif stim == "medium":
        ax.cla()
        t = np.linspace(0, 12, 800)
        v = np.full_like(t, -70.0)
        for start in (1.5, 5.0, 8.5):
            for i, x in enumerate(t):
                if start <= x < start + 1.5:
                    ph = (x - start) / 1.5
                    v[i] = -70 + 115 * math.sin(math.pi * ph) - 8 * math.sin(2 * math.pi * ph)
        ax.plot(t, v, color="#C62828", lw=2)
        ax.set_xlim(0, 12)
    elif stim == "strong":
        ax.cla()
        t = np.linspace(0, 12, 900)
        v = np.full_like(t, -70.0)
        for start in (1.2, 3.4, 5.6, 7.8, 10.0):
            for i, x in enumerate(t):
                if start <= x < start + 1.35:
                    ph = (x - start) / 1.35
                    v[i] = -70 + 115 * math.sin(math.pi * ph) - 8 * math.sin(2 * math.pi * ph)
        ax.plot(t, v, color="#C62828", lw=2)
        ax.set_xlim(0, 12)
    ax.axhline(0, color="#333", lw=0.6)
    ax.set_ylim(-90, 50)
    ax.set_xlabel("time (ms)", fontsize=11)
    ax.set_ylabel("potential difference (mV)", fontsize=11)
    ax.set_yticks([-70, 0, 40])
    ax.set_facecolor("#FFF8DC")
    fig.patch.set_facecolor("white")
    for spine in ax.spines.values():
        spine.set_color("#888")
    if highlight in (1, 2, 3, 4, 5) and stim is None and not failed:
        bands = {1: (0.2, 1.45), 2: (1.45, 2.2), 3: (2.2, 2.7), 4: (2.7, 3.3), 5: (3.3, 4.6)}
        a, b = bands[highlight]
        ax.axvspan(a, b, color="#A5D6A7", alpha=0.45)
        ax.annotate(str(highlight), xy=((a + b) / 2, 35), ha="center", fontsize=12,
                    fontweight="bold", color="#1B7A3A",
                    bbox=dict(boxstyle="circle", facecolor="#C8E6A0", edgecolor="#1B7A3A"))
    if labels and stim is None and not failed and highlight is None:
        for n, x, y in ((1, 0.85, -70), (2, 1.85, 5), (3, 2.45, 5), (4, 2.9, -82), (5, 3.9, -70)):
            ax.annotate(str(n), xy=(x, y), xytext=(x, y + (18 if y < 0 else -18)),
                        ha="center", fontsize=10, fontweight="bold", color="#1B7A3A",
                        arrowprops=dict(arrowstyle="-", color="#1B7A3A"),
                        bbox=dict(boxstyle="circle", facecolor="#C8E6A0", edgecolor="#1B7A3A"))
    path = os.path.join(OUT, path_name)
    fig.savefig(path, bbox_inches="tight", pad_inches=0.08, facecolor="white")
    plt.close(fig)
    return path


def refractory_graph(path_name="refractory.png"):
    fig, ax = plt.subplots(figsize=(7.4, 4.4), dpi=160)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.set_xlabel("time (ms)", fontsize=11)
    ax.set_ylabel("axon excitability", fontsize=11)
    ax.set_xticks(range(0, 11))
    ax.set_yticks([])
    ax.set_facecolor("#E3F2FD")
    fig.patch.set_facecolor("white")
    ax.axhspan(0, 6, xmin=0.0, xmax=0.2, color="#BBDEFB")
    ax.axvspan(2, 3.2, color="#90CAF9", alpha=0.9)
    ax.plot([0, 2, 2, 3.2, 8, 10], [4.6, 4.6, 0.3, 0.3, 4.6, 4.6], color="#1565C0", lw=2.4)
    ax.text(1.0, 5.1, "normal\nresting state", ha="center", fontsize=9)
    ax.text(2.6, 5.1, "absolute\nrefractory\nperiod", ha="center", fontsize=9, fontweight="bold")
    ax.text(5.5, 5.1, "relative refractory period", ha="center", fontsize=9, fontweight="bold")
    ax.text(9.0, 5.1, "normal\nresting state", ha="center", fontsize=9)
    ax.annotate("stimulus", xy=(2.0, 2.2), xytext=(0.4, 1.5),
                arrowprops=dict(arrowstyle="->", color="#333"), fontsize=9)
    path = os.path.join(OUT, path_name)
    fig.savefig(path, bbox_inches="tight", pad_inches=0.08, facecolor="white")
    plt.close(fig)
    return path


def saltatory(path_name="saltatory.png", node=0):
    fig, ax, path = _fig(path_name, 4.2, 6.4)
    ax.set_xlim(0, 4.2)
    ax.set_ylim(0, 6.4)
    ax.plot([2.1, 2.1], [0.4, 6.0], color="#6BB6E0", lw=8, zorder=1)
    ys = [5.3, 3.9, 2.5, 1.1]
    for i, y in enumerate(ys):
        ax.add_patch(FancyBboxPatch((1.45, y - 0.45), 1.3, 1.05, boxstyle="round,pad=0.02,rounding_size=0.2",
                                    facecolor="#E8A87C", edgecolor="#C47A4A", lw=1.3, zorder=2))
        # local currents
        ax.annotate("", xy=(1.2, y - 0.85), xytext=(1.2, y + 0.55),
                    arrowprops=dict(arrowstyle="<->", color="#333", lw=1.1))
        ax.annotate("", xy=(3.0, y - 0.85), xytext=(3.0, y + 0.55),
                    arrowprops=dict(arrowstyle="<->", color="#333", lw=1.1))
        if node == i + 1:
            ax.add_patch(Circle((2.1, y - 0.62), 0.18, facecolor="#FFEB3B", edgecolor="#F9A825", lw=1.5, zorder=4))
    return _save(fig, path)


def skin_block(path_name="skin_block.png", highlight_pacinian=False):
    fig, ax, path = _fig(path_name, 5.6, 5.8)
    ax.set_xlim(0, 5.6)
    ax.set_ylim(0, 5.8)
    # layers
    ax.add_patch(Polygon([(0.6, 3.7), (1.0, 4.55), (4.7, 4.55), (5.1, 3.7)], facecolor="#F8C1B8", edgecolor="#C47A6A"))
    ax.add_patch(Rectangle((0.6, 2.55), 4.5, 1.15, facecolor="#F5D0C5", edgecolor="#C47A6A"))
    ax.add_patch(Rectangle((0.6, 1.55), 4.5, 1.0, facecolor="#E8A0A0", edgecolor="#C47A6A"))
    ax.add_patch(Rectangle((0.6, 0.7), 4.5, 0.85, facecolor="#F3E5AB", edgecolor="#C47A6A"))
    # epidermis ridges
    xs = np.linspace(0.7, 4.9, 18)
    ys = 3.7 + 0.18 * np.sin(np.linspace(0, 3 * np.pi, 18))
    ax.plot(xs, ys, color="#C47A6A", lw=1.2)
    # hair
    ax.plot([2.7, 2.7], [2.7, 5.35], color="#5D4037", lw=1.6)
    ax.plot([3.15, 3.55], [3.9, 5.2], color="#5D4037", lw=1.3)
    ax.add_patch(Ellipse((2.7, 2.55), 0.28, 0.7, facecolor="#8D6E63", edgecolor="#5D4037"))
    # Meissner
    ax.add_patch(Ellipse((1.5, 3.85), 0.28, 0.38, facecolor="#64B5F6", edgecolor="#1565C0"))
    # Pacinian
    color = "#FFEB3B" if highlight_pacinian else "#81C784"
    ax.add_patch(Ellipse((4.35, 1.15), 0.55, 0.7, facecolor=color, edgecolor="#2E7D32", lw=1.3))
    for s in (0.18, 0.32):
        ax.add_patch(Ellipse((4.35, 1.15), 0.55 * s / 0.22, 0.7 * s / 0.22, fill=False, edgecolor="#2E7D32", lw=0.8))
    ax.plot([4.35, 4.35], [1.5, 3.9], color="#2E7D32", lw=1.5)
    ax.plot([4.35, 4.7], [3.9, 4.7], color="#2E7D32", lw=1.3)
    ax.add_patch(Circle((1.9, 2.1), 0.16, facecolor="#4FC3F7", edgecolor="#0277BD"))  # Merkel / other
    ax.add_patch(Wedge((3.5, 2.35), 0.28, 200, 340, facecolor="#CE93D8", edgecolor="#6A1B9A"))
    return _save(fig, path)


def pacinian(path_name="pacinian.png", deformed=False):
    fig, ax, path = _fig(path_name, 6.4, 4.6)
    ax.set_xlim(0, 6.4)
    ax.set_ylim(0, 4.6)
    sx, sy = (1.25, 0.72) if deformed else (1.0, 1.0)
    cx, cy = 3.2, 2.3
    for i, r in enumerate((1.6, 1.25, 0.95, 0.7, 0.45)):
        ax.add_patch(Ellipse((cx, cy), r * 2 * sx, r * 1.35 * sy, fill=False,
                             edgecolor="#2E7D32", lw=1.4, alpha=0.85))
    ax.add_patch(Ellipse((cx, cy), 0.55 * sx, 0.28 * sy, facecolor="#FFE082", edgecolor="#F9A825"))
    ax.plot([cx, 5.7], [cy, cy + 0.8], color="#1565C0", lw=2.5)
    ax.text(4.7, 3.5, "sensory\nneurone", color="#1565C0", fontsize=10, fontweight="bold")
    ax.text(cx, 0.35, "lamellae of connective tissue", ha="center", fontsize=10, color="#1B3A6B")
    if deformed:
        ax.annotate("pressure", xy=(cx, 3.55), xytext=(cx, 4.2),
                    ha="center", arrowprops=dict(arrowstyle="->", color="#C62828"),
                    color="#C62828", fontsize=11, fontweight="bold")
    return _save(fig, path)


def retina_cells(path_name="retina_cells.png"):
    fig, ax, path = _fig(path_name, 7.2, 6.4)
    ax.set_xlim(0, 7.2)
    ax.set_ylim(0, 6.4)

    def rod(x, cone=False):
        if cone:
            ax.add_patch(Polygon([(x - 0.28, 4.15), (x + 0.28, 4.15), (x, 5.55)],
                                 facecolor="#A8C97A", edgecolor="#4E6B32", lw=1.1))
        else:
            ax.add_patch(FancyBboxPatch((x - 0.26, 4.05), 0.52, 1.5, boxstyle="round,pad=0.01,rounding_size=0.08",
                                        facecolor="#A8C97A", edgecolor="#4E6B32", lw=1.1))
            for y in np.linspace(4.2, 5.4, 9):
                ax.plot([x - 0.22, x + 0.22], [y, y], color="#6B8F3A", lw=0.6)
        ax.add_patch(Ellipse((x, 3.55), 0.55, 0.7, facecolor="#8FBF6A", edgecolor="#4E6B32", lw=1.0))
        ax.add_patch(Circle((x, 3.55), 0.12, facecolor="#5D4037"))
        ax.add_patch(Circle((x - 0.12, 3.75), 0.06, facecolor="#E57373"))
        ax.add_patch(Circle((x + 0.1, 3.4), 0.06, facecolor="#E57373"))
        ax.plot([x, x], [3.2, 2.85], color="#4E6B32", lw=1.2)
        ax.plot([x - 0.18, x, x + 0.18], [2.7, 2.85, 2.7], color="#4E6B32", lw=1.2)

    rod(1.5, False)
    rod(2.45, False)
    rod(3.4, False)
    rod(4.55, True)
    # bipolar
    for x, col in ((1.95, "#4FC3F7"), (3.4, "#4FC3F7"), (4.55, "#4FC3F7")):
        ax.add_patch(Ellipse((x, 2.15), 0.28, 0.55, facecolor=col, edgecolor="#0277BD"))
        ax.plot([x, x], [2.42, 2.65], color="#0277BD", lw=1.1)
        ax.plot([x, x], [1.88, 1.55], color="#0277BD", lw=1.1)
        ax.plot([x - 0.2, x, x + 0.2], [1.45, 1.55, 1.45], color="#0277BD", lw=1.0)
    ax.plot([1.5, 1.95, 2.45], [2.7, 2.65, 2.7], color="#4E6B32", lw=1.0)
    # ganglion
    for x in (1.95, 3.4, 4.55):
        ax.add_patch(Ellipse((x, 0.95), 0.32, 0.42, facecolor="#FFE082", edgecolor="#F9A825"))
        ax.add_patch(Circle((x, 0.95), 0.08, facecolor="#5D4037"))
        ax.plot([x, x], [1.16, 1.42], color="#F9A825", lw=1.1)
        ax.plot([x, x], [0.74, 0.45], color="#F9A825", lw=1.5)
    ax.add_patch(Rectangle((0.7, 0.22), 5.6, 0.18, facecolor="#BCAAA4", edgecolor="#6D4C41"))
    ax.text(3.5, 0.08, "optic nerve fibres", ha="center", fontsize=9, color="#5D4037")
    return _save(fig, path)


def photoreceptor_cell(path_name="rod_cell.png", kind="rod"):
    fig, ax, path = _fig(path_name, 3.4, 7.2)
    ax.set_xlim(0, 3.4)
    ax.set_ylim(0, 7.2)
    if kind == "rod":
        ax.add_patch(FancyBboxPatch((1.15, 3.55), 1.1, 3.15, boxstyle="round,pad=0.02,rounding_size=0.12",
                                    facecolor="#A8C97A", edgecolor="#4E6B32", lw=1.3))
        for y in np.linspace(3.75, 6.5, 14):
            ax.plot([1.25, 2.15], [y, y], color="#6B8F3A", lw=0.7)
    else:
        ax.add_patch(Polygon([(1.15, 3.7), (2.25, 3.7), (1.7, 6.7)],
                             facecolor="#A8C97A", edgecolor="#4E6B32", lw=1.3))
        for i, y in enumerate(np.linspace(3.9, 6.2, 10)):
            w = 0.42 - i * 0.03
            ax.plot([1.7 - w, 1.7 + w], [y, y], color="#6B8F3A", lw=0.7)
    ax.add_patch(Ellipse((1.7, 2.7), 1.25, 1.35, facecolor="#8FBF6A", edgecolor="#4E6B32", lw=1.2))
    ax.add_patch(Circle((1.7, 2.55), 0.22, facecolor="#6D4C41"))
    ax.add_patch(Circle((1.35, 3.0), 0.1, facecolor="#E57373"))
    ax.add_patch(Circle((2.05, 2.85), 0.1, facecolor="#E57373"))
    ax.add_patch(Circle((1.5, 2.2), 0.08, facecolor="#E57373"))
    ax.plot([1.7, 1.7], [2.02, 1.55], color="#4E6B32", lw=1.4)
    ax.plot([1.35, 1.7, 2.05], [1.25, 1.55, 1.25], color="#4E6B32", lw=1.4)
    ax.plot([1.2, 1.35], [1.05, 1.25], color="#4E6B32", lw=1.1)
    ax.plot([2.2, 2.05], [1.05, 1.25], color="#4E6B32", lw=1.1)
    return _save(fig, path)


def synapse_diagram(path_name="synapse.png", step=0):
    """step 0 idle, 1 AP, 2 Ca in, 3 vesicles move, 4 release, 5 diffuse, 6 bind, 7 Na in."""
    fig, ax, path = _fig(path_name, 8.4, 6.2)
    ax.set_xlim(0, 8.4)
    ax.set_ylim(0, 6.2)
    # presynaptic
    verts = [(1.3, 5.6), (4.5, 5.6), (5.4, 3.6), (4.7, 2.55), (1.6, 2.7), (1.1, 4.2)]
    ax.add_patch(Polygon(verts, facecolor="#F3B562", edgecolor="#C47A4A", lw=1.8))
    # postsynaptic
    ax.add_patch(Polygon([(1.5, 0.4), (5.5, 0.4), (5.7, 1.9), (4.6, 2.35), (1.5, 2.15)],
                         facecolor="#E8A060", edgecolor="#C47A4A", lw=1.8))
    # cleft
    ax.add_patch(Polygon([(1.65, 2.22), (4.65, 2.38), (4.72, 2.55), (1.62, 2.68)],
                         facecolor="#90CAF9", edgecolor="#1565C0", lw=1.0, alpha=0.65))
    # mitochondria
    for (x, y) in ((2.15, 4.7), (3.55, 4.95), (4.55, 3.95)):
        ax.add_patch(Ellipse((x, y), 0.55, 0.28, facecolor="#E57373", edgecolor="#B71C1C", lw=1.0))
        ax.plot([x - 0.16, x + 0.16], [y, y], color="#B71C1C", lw=0.8)
    # Ca channels
    ax.add_patch(Rectangle((2.05, 2.62), 0.22, 0.28, facecolor="#7E57C2", edgecolor="#4527A0"))
    ax.add_patch(Rectangle((3.55, 2.58), 0.22, 0.28, facecolor="#7E57C2", edgecolor="#4527A0"))
    # receptors
    for x in (2.3, 3.15, 3.95, 4.55):
        ax.add_patch(Rectangle((x, 2.05), 0.22, 0.28, facecolor="#AB47BC", edgecolor="#6A1B9A"))
    # vesicles
    vesicle_pos = [(3.15, 4.55), (4.15, 4.35), (3.55, 3.55), (2.7, 3.35)]
    if step >= 3:
        vesicle_pos = [(3.05, 3.35), (3.9, 3.15), (3.4, 2.95), (2.55, 3.15)]
    for i, (x, y) in enumerate(vesicle_pos):
        if step >= 4 and i == 0:
            continue  # fused
        ax.add_patch(Circle((x, y), 0.32, facecolor="#FFF8E1", edgecolor="#F9A825", lw=1.2))
        for dx, dy in ((-0.1, 0.08), (0.08, 0.1), (0.0, -0.1), (0.12, -0.02), (-0.08, -0.05)):
            ax.add_patch(Circle((x + dx, y + dy), 0.05, facecolor="#66BB6A", edgecolor="#2E7D32"))
    nts = []
    if step >= 4:
        nts = [(2.6, 2.45), (3.2, 2.42), (3.8, 2.48), (4.3, 2.4)]
    if step >= 5:
        nts = [(2.4, 2.28), (3.2, 2.25), (3.9, 2.3), (4.45, 2.22)]
    if step >= 6:
        nts = [(2.41, 2.18), (3.26, 2.18), (4.06, 2.18), (4.66, 2.18)]
    for (x, y) in nts:
        ax.add_patch(Circle((x, y), 0.07, facecolor="#66BB6A", edgecolor="#2E7D32"))
    if step >= 1:
        ax.add_patch(FancyBboxPatch((0.25, 5.15), 2.3, 0.7, boxstyle="round,pad=0.02,rounding_size=0.1",
                                    facecolor="#FFEB3B", edgecolor="#F9A825"))
        ax.text(1.4, 5.5, "action potential", ha="center", va="center", fontsize=9, fontweight="bold")
    if step >= 2:
        ax.annotate("Ca²⁺ in", xy=(2.16, 2.75), xytext=(0.5, 3.3),
                    arrowprops=dict(arrowstyle="->", color="#6A1B9A"), color="#6A1B9A",
                    fontsize=10, fontweight="bold")
    if step >= 7:
        ax.annotate("Na⁺ in", xy=(3.2, 2.05), xytext=(6.0, 1.2),
                    arrowprops=dict(arrowstyle="->", color="#1565C0"), color="#1565C0",
                    fontsize=10, fontweight="bold")
        ax.add_patch(FancyBboxPatch((5.6, 0.45), 2.4, 0.55, boxstyle="round,pad=0.02,rounding_size=0.1",
                                    facecolor="#C8E6C9", edgecolor="#2E7D32"))
        ax.text(6.8, 0.72, "depolarisation", ha="center", va="center", fontsize=10, fontweight="bold")
    return _save(fig, path)


def synapse_numbered(path_name="synapse_numbered.png"):
    """Same synapse with numbered leader lines and no names (labelling activity)."""
    fig, ax, path = _fig(path_name, 8.4, 6.2)
    ax.set_xlim(0, 8.4)
    ax.set_ylim(0, 6.2)
    verts = [(1.3, 5.6), (4.5, 5.6), (5.4, 3.6), (4.7, 2.55), (1.6, 2.7), (1.1, 4.2)]
    ax.add_patch(Polygon(verts, facecolor="#F3B562", edgecolor="#C47A4A", lw=1.8))
    ax.add_patch(Polygon([(1.5, 0.4), (5.5, 0.4), (5.7, 1.9), (4.6, 2.35), (1.5, 2.15)],
                         facecolor="#E8A060", edgecolor="#C47A4A", lw=1.8))
    ax.add_patch(Polygon([(1.65, 2.22), (4.65, 2.38), (4.72, 2.55), (1.62, 2.68)],
                         facecolor="#90CAF9", edgecolor="#1565C0", lw=1.0, alpha=0.65))
    for (x, y) in ((2.15, 4.7), (3.55, 4.95), (4.55, 3.95)):
        ax.add_patch(Ellipse((x, y), 0.55, 0.28, facecolor="#E57373", edgecolor="#B71C1C", lw=1.0))
    ax.add_patch(Rectangle((2.05, 2.62), 0.22, 0.28, facecolor="#7E57C2", edgecolor="#4527A0"))
    ax.add_patch(Rectangle((3.55, 2.58), 0.22, 0.28, facecolor="#7E57C2", edgecolor="#4527A0"))
    for x in (2.3, 3.15, 3.95, 4.55):
        ax.add_patch(Rectangle((x, 2.05), 0.22, 0.28, facecolor="#AB47BC", edgecolor="#6A1B9A"))
    for (x, y) in ((3.15, 4.55), (4.15, 4.35), (3.55, 3.55), (2.7, 3.35)):
        ax.add_patch(Circle((x, y), 0.32, facecolor="#FFF8E1", edgecolor="#F9A825", lw=1.2))
        for dx, dy in ((-0.1, 0.08), (0.08, 0.1), (0.0, -0.1), (0.12, -0.02), (-0.08, -0.05)):
            ax.add_patch(Circle((x + dx, y + dy), 0.05, facecolor="#66BB6A", edgecolor="#2E7D32"))

    def mark(n, x, y, tx, ty):
        ax.plot([x, tx], [y, ty], color="#1B3A6B", lw=1.0)
        ax.add_patch(Circle((tx, ty), 0.22, facecolor="#1B3A6B", edgecolor="none"))
        ax.text(tx, ty, str(n), ha="center", va="center", color="white", fontsize=11, fontweight="bold")

    mark(1, 2.15, 4.7, 0.55, 5.35)   # mitochondrion
    mark(2, 2.16, 2.76, 0.55, 3.15)  # Ca channel
    mark(3, 1.7, 2.45, 0.55, 1.55)   # cleft
    mark(4, 4.15, 4.35, 7.7, 5.35)   # vesicle
    mark(5, 5.15, 3.4, 7.7, 3.85)    # presynaptic membrane
    mark(6, 4.55, 2.18, 7.7, 2.45)   # receptor
    mark(7, 5.2, 1.1, 7.7, 0.85)     # postsynaptic
    return _save(fig, path)


def synapse_em_style(path_name="synapse_em_style.png"):
    """Original illustrative 2D view inspired by TEM layout, not a micrograph copy."""
    fig, ax, path = _fig(path_name, 6.4, 6.4)
    ax.set_xlim(0, 6.4)
    ax.set_ylim(0, 6.4)
    ax.add_patch(Circle((3.2, 3.2), 2.85, facecolor="#E8C39E", edgecolor="#8D6E63", lw=3))
    # two cells
    ax.add_patch(Polygon([(0.7, 3.3), (3.4, 5.6), (5.6, 3.5), (4.7, 3.15), (1.6, 2.95)],
                         facecolor="#D7A07A", edgecolor="#6D4C41", lw=1.2, alpha=0.95))
    ax.add_patch(Polygon([(0.8, 0.7), (3.3, 0.55), (5.5, 1.5), (4.8, 3.0), (1.5, 2.9)],
                         facecolor="#C98A6A", edgecolor="#6D4C41", lw=1.2))
    ax.add_patch(Polygon([(1.7, 2.95), (4.65, 3.12), (4.7, 2.85), (1.75, 2.72)],
                         facecolor="#90CAF9", edgecolor="#1565C0", lw=1.0))
    # mitochondria green-ish
    ax.add_patch(Ellipse((2.35, 4.35), 1.1, 0.7, facecolor="#81C784", edgecolor="#2E7D32", lw=1.2))
    ax.add_patch(Ellipse((3.7, 1.35), 1.2, 0.65, facecolor="#81C784", edgecolor="#2E7D32", lw=1.2))
    # vesicles
    rng = np.random.default_rng(3)
    for _ in range(28):
        x = rng.uniform(2.4, 4.5)
        y = rng.uniform(3.35, 4.7)
        ax.add_patch(Circle((x, y), 0.09, facecolor="#42A5F5", edgecolor="#1565C0"))
    return _save(fig, path)


def organisation_tree(path_name="organisation_tree.png", level=0):
    fig, ax, path = _fig(path_name, 9.6, 5.8)
    ax.set_xlim(0, 9.6)
    ax.set_ylim(0, 5.8)

    def box(x, y, w, h, text, fc, ec="#1B3A6B", live=True):
        if not live:
            return
        ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                                    facecolor=fc, edgecolor=ec, lw=1.4))
        ax.text(x, y, text, ha="center", va="center", fontsize=10, fontweight="bold", color="#1B2A4A", wrap=True)

    box(4.8, 5.25, 3.2, 0.55, "the nervous system", "#EF9A9A", "#C62828")
    if level >= 1:
        ax.plot([4.8, 2.4], [4.97, 4.45], color="#555", lw=1.2)
        ax.plot([4.8, 7.2], [4.97, 4.45], color="#555", lw=1.2)
        box(2.4, 4.15, 2.6, 0.5, "CNS", "#A5D6A7", "#2E7D32")
        box(7.2, 4.15, 2.6, 0.5, "PNS", "#90CAF9", "#1565C0")
    if level >= 2:
        ax.plot([2.4, 1.3], [3.9, 3.4], color="#555", lw=1.1)
        ax.plot([2.4, 3.5], [3.9, 3.4], color="#555", lw=1.1)
        box(1.3, 3.1, 2.2, 0.5, "brain", "#C8E6C9", "#2E7D32")
        box(3.5, 3.1, 2.2, 0.5, "spinal cord", "#C8E6C9", "#2E7D32")
    if level >= 3:
        ax.plot([7.2, 6.1], [3.9, 3.4], color="#555", lw=1.1)
        ax.plot([7.2, 8.3], [3.9, 3.4], color="#555", lw=1.1)
        box(6.1, 3.1, 2.3, 0.5, "somatic", "#BBDEFB", "#1565C0")
        box(8.3, 3.1, 2.3, 0.5, "autonomic", "#BBDEFB", "#1565C0")
    if level >= 4:
        ax.plot([8.3, 7.35], [2.85, 2.35], color="#555", lw=1.1)
        ax.plot([8.3, 9.15], [2.85, 2.35], color="#555", lw=1.1)
        box(7.35, 2.05, 2.4, 0.5, "sympathetic", "#FFE082", "#F9A825")
        box(9.15, 2.05, 2.4, 0.5, "parasympathetic", "#FFE082", "#F9A825")
    return _save(fig, path)


def title_retina(path_name="title_retina.png"):
    return retina_cells(path_name)


def generate_all():
    os.makedirs(OUT, exist_ok=True)
    paths = {}
    paths["motor"] = motor_neurone()
    paths["sensory"] = sensory_neurone()
    paths["relay"] = relay_neurone()
    paths["neurone"] = neurone_structure()
    paths["electrodes"] = axon_electrodes()
    paths["charges"] = resting_charges()
    for st in ("rest", "depol", "repol"):
        paths[f"mem_{st}"] = membrane_ions(f"membrane_{st}.png", st)
    paths["ap"] = ap_graph("ap_graph.png")
    for i in range(1, 6):
        paths[f"ap_{i}"] = ap_graph(f"ap_graph_{i}.png", highlight=i)
    paths["ap_failed"] = ap_graph("ap_failed.png", failed=True, labels=False)
    for s in ("weak", "medium", "strong"):
        paths[f"stim_{s}"] = ap_graph(f"stim_{s}.png", stim=s, labels=False)
    paths["refractory"] = refractory_graph()
    for i in range(0, 5):
        paths[f"salt_{i}"] = saltatory(f"saltatory_{i}.png", node=i)
    paths["skin"] = skin_block()
    paths["skin_h"] = skin_block("skin_pacinian.png", True)
    paths["pac"] = pacinian()
    paths["pac_d"] = pacinian("pacinian_deformed.png", True)
    paths["retina"] = retina_cells()
    paths["rod"] = photoreceptor_cell("rod_cell.png", "rod")
    paths["cone"] = photoreceptor_cell("cone_cell.png", "cone")
    for i in range(0, 8):
        paths[f"syn_{i}"] = synapse_diagram(f"synapse_{i}.png", i)
    paths["syn_em"] = synapse_em_style()
    paths["syn_num"] = synapse_numbered()
    for i in range(0, 5):
        paths[f"org_{i}"] = organisation_tree(f"org_{i}.png", i)
    paths["title"] = title_retina("title_retina.png")
    return paths


if __name__ == "__main__":
    generate_all()
    print("wrote", OUT)
