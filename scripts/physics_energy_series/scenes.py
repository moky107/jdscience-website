"""Split the revised scripts into timed scenes without changing the words."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from .scripts_text import VIDEOS


def _norm_space(text: str) -> str:
    return " ".join(text.split())


def paragraphs(script: str) -> list[str]:
    return [p.strip() for p in script.strip().split("\n\n") if p.strip()]


def sentences(paragraph: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z])", paragraph.strip())
    return [p.strip() for p in parts if p.strip()]


def split_pause(sents: list[str]) -> tuple[list[str], list[str]]:
    for i, sentence in enumerate(sents):
        if "Pause the video" in sentence:
            return sents[: i + 1], sents[i + 1 :]
    return sents, []


def exam_roles(sents: list[str]) -> list[str]:
    """Classify examination sentences as question, model answer or mark point."""
    roles: list[str] = []
    phase = "stem"
    for sentence in sents:
        low = sentence.lower().strip()
        if low.startswith("award"):
            phase = "mark"
            roles.append("mark")
            continue
        if low.startswith("part a") or low.startswith("part b"):
            phase = "asked"
            roles.append("question")
            continue
        if low.startswith("here is a gcse") or low.startswith("here is a three-mark"):
            phase = "stem"
            roles.append("question")
            continue
        if (
            "model answer" in low
            or low.startswith("for part")
            or low.startswith("a suitable answer")
        ):
            phase = "answer"
            roles.append("answer")
            continue
        if phase in {"asked", "mark"}:
            phase = "answer"
            roles.append("answer")
            continue
        if phase == "answer":
            roles.append("answer")
            continue
        roles.append("question")
        if low.startswith(("describe", "explain", "calculate", "name ", "which ", "give ")):
            phase = "asked"
    return roles


@dataclass
class Scene:
    video_n: int
    index: int
    total: int
    layout: str
    diagram: str
    title: str
    subtitle: str
    footer: str
    video_title: str
    text: str
    sentences: list[str]
    roles: list[str] = field(default_factory=list)
    pause: float = 0.0
    ambient: bool = False

    @property
    def words(self) -> list[str]:
        return self.text.split()


def _join(sents: list[str]) -> str:
    return " ".join(sents)


def _meta(n: int, layout: str, text: str, video_title: str) -> tuple[str, str, str, bool]:
    """Return diagram id, scene title, subtitle and whether the diagram animates."""
    t = text.lower()
    if layout == "title":
        return "title", video_title, "Unit 3  ·  Conservation of energy", False
    if layout == "end":
        return "end", "Keep practising", "JD Science  ·  jdscience.co.uk", False
    if layout == "question":
        return _question_diagram(n), "Your turn", "Pause the video and have a go", False
    if layout == "answer":
        diagram = _answer_diagram(n)
        return diagram, "Worked answer", "Reveal after you have had a go", diagram in AMBIENT
    if layout == "exam":
        diagram = _exam_diagram(n)
        marks = _marks_label(text)
        return diagram, "GCSE-style question", marks, False
    diagram, title, subtitle = _explain(n, t)
    return diagram, title, subtitle, diagram in AMBIENT


AMBIENT = {
    "pathways",
    "toycar",
    "ballpath",
    "skier",
    "lorry",
    "fan",
    "wind",
    "kettle",
    "lamp",
    "motor",
    "hydro",
    "solarwind",
    "tidalhydro",
    "coal",
    "nuclear",
    "cavity",
    "engine",
    "sankey",
    "mix",
    "town",
    "graph",
    "graph_example",
    "gpe",
    "piledriver",
    "ke_square",
    "ke_car",
}


def _marks_label(text: str) -> str:
    words = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}
    low = text.lower()
    found = [int(n) for n in re.findall(r"worth (\d+) marks?", low)]
    found += [words[w] for w in re.findall(r"worth (one|two|three|four|five) marks?", low)]
    found += [int(n) for n in re.findall(r"(\d+)-mark", low)]
    found += [words[w] for w in re.findall(r"\b(one|two|three|four|five)-mark", low)]

    def word(n: int) -> str:
        return "1 mark" if n == 1 else f"{n} marks"

    if not found:
        return "Show the working and the unit"
    if len(found) == 1:
        return word(found[0])
    return "   ·   ".join(f"Part {label}: {word(n)}" for label, n in zip("ABCDEF", found))


def _question_diagram(n: int) -> str:
    return {
        1: "catapult",
        2: "bag",
        3: "ball_ke",
        4: "skier",
        5: "kettle",
        6: "lamp",
        7: "bike",
        8: "wood",
        9: "oil",
        10: "solar",
        11: "solar_supply",
        12: "demand",
    }[n]


def _answer_diagram(n: int) -> str:
    return {
        1: "catapult",
        2: "bag",
        3: "ball_ke",
        4: "skier",
        5: "kettle",
        6: "lamp",
        7: "bike",
        8: "wood",
        9: "oil",
        10: "solar",
        11: "solar_supply",
        12: "demand",
    }[n]


def _exam_diagram(n: int) -> str:
    return {
        1: "tea",
        2: "crane",
        3: "cycle",
        4: "lorry",
        5: "fan",
        6: "motor",
        7: "cavity",
        8: "loft",
        9: "compare_fuels",
        10: "biomass",
        11: "mix",
        12: "graph_example",
    }[n]


def _explain(n: int, t: str) -> tuple[str, str, str]:
    rules = {
        1: [
            ("eight energy stores", "stores", "Eight energy stores", "Energy is conserved"),
            ("four ways", "pathways", "Four transfer pathways", "Name the store and the pathway"),
            ("toy car", "toycar", "Battery-powered toy car", "Follow the transfers in order"),
        ],
        2: [
            ("when you lift", "gpe", "Gravitational potential energy", "ΔEₚ = m g Δh"),
            ("reliable calculation", "gpe_method", "Calculation method", "Units, substitution, answer"),
            ("pile driver", "piledriver", "Worked example", "Hammer raised through 4 m"),
        ],
        3: [
            ("because it is moving", "ke", "Kinetic energy", "Eₖ = ½ m v²"),
            ("square on the speed", "ke_square", "Why speed matters", "Kinetic energy depends on speed squared"),
            ("first square the speed", "ke_car", "Worked example", "1,200 kg car at 20 m/s"),
        ],
        4: [
            ("a system is", "system", "Systems and stores", "Energy is measured in joules"),
            ("throwing a ball", "ballpath", "A ball thrown upwards", "Kinetic and gravitational stores exchange"),
        ],
        5: [
            ("closed system", "closed", "Closed and isolated systems", "No energy crosses the boundary"),
            ("wasted or dissipated", "dissipated", "Useful and dissipated energy", "Dissipated energy has not been destroyed"),
            ("100 joules", "sankey", "Calculating dissipated energy", "Input minus useful outputs"),
        ],
        6: [
            ("proportion of the total", "efficiency", "What efficiency means", "Useful output ÷ total input"),
            ("perfectly efficient", "eff_loss", "Why efficiency is below 100%", "Unwanted stores still receive energy"),
            ("wind turbine", "wind", "Worked example", "Power form of the efficiency equation"),
        ],
        7: [
            ("intended useful store", "unwanted", "Unwanted energy transfers", "Friction, resistance, heating and sound"),
            ("useful approach", "methods", "How engineers reduce transfers", "Lubrication, streamlining, insulation"),
            ("car engine", "engine", "Lubricating an engine", "Oil reduces friction between moving parts"),
        ],
        8: [
            ("how readily a material", "conductivity", "Thermal conductivity", "Unit: W per metre per kelvin"),
            ("illustrative values", "cond_bars", "Illustrative conductivities", "Always use the table in the examination"),
            ("illustrative table", "brick", "Brick and fibreglass", "Compare conductivity under the same conditions"),
            ("thickness, area", "cond_factors", "What changes the rate", "Material, thickness, area and temperature difference"),
        ],
        9: [
            ("naturally replaced", "finite", "Non-renewable resources", "Used faster than they are replaced"),
            ("coal is mined", "coal", "Coal", "Chemical store, released by burning"),
            ("oil is extracted", "oilgas", "Oil and natural gas", "Finite fossil fuels"),
            ("nuclear power stations", "nuclear", "Nuclear fuel", "Fission, not combustion"),
            ("compare coal and gas", "compare_fuels", "Coal compared with gas", "Neither finite fuel is impact-free"),
        ],
        10: [
            ("replenished naturally", "renewable", "Renewable resources", "Replenished on human timescales"),
            ("solar photovoltaic", "solarwind", "Solar and wind", "No fuel burnt during operation"),
            ("water stored at height", "tidalhydro", "Hydroelectric and tidal", "Predictable tides, controllable reservoirs"),
            ("organic material", "biomass", "Biomass", "Renewable is not automatically carbon-neutral"),
            ("hydroelectric energy-transfer", "hydro", "Hydroelectric transfer", "Gravitational store to the grid"),
        ],
        11: [
            ("energy security means", "security", "Security and reliability", "Related, but not the same idea"),
            ("gas-fired and nuclear", "reliability", "How consistently can it deliver?", "Weather, fuel and control"),
            ("energy mix means", "mix", "Why use an energy mix?", "Several sources reduce dependence"),
            ("powered entirely by wind", "town", "A town powered only by wind", "The whole system has to meet demand"),
        ],
        12: [
            ("global energy demand", "demand", "Energy demand", "Growth is not the same everywhere"),
            ("energy mix is also changing", "measures", "Read the measure carefully", "Primary energy, final energy or electricity"),
            ("analysing a trend graph", "graph", "How to read a trend graph", "Title, axes, units, dates and key"),
            ("suppose a graph", "graph_example", "Illustrative trend", "Describe the pattern you can actually see"),
        ],
    }
    for needle, diagram, title, subtitle in rules[n]:
        if needle in t:
            return diagram, title, subtitle
    return "stores", "Conservation of energy", "JD Science"


def build_scenes(video: dict) -> list[Scene]:
    blocks: list[tuple[str, str]] = []
    paras = paragraphs(video["script"])
    for i, para in enumerate(paras):
        sents = sentences(para)
        if i == 0:
            blocks.append(("title", _join(sents)))
            continue
        if i == len(paras) - 1:
            blocks.append(("end", _join(sents)))
            continue
        if any("Pause the video" in s for s in sents):
            question, answer = split_pause(sents)
            blocks.append(("question", _join(question)))
            if answer:
                blocks.append(("answer", _join(answer)))
            continue
        if (
            "GCSE-style question" in para
            or "GCSE examination question" in para
            or para.startswith("Here is a three-mark")
            or para.startswith("Here is a GCSE")
        ):
            blocks.append(("exam", _join(sents)))
            continue
        blocks.append(("explain", _join(sents)))

    total = len(blocks)
    scenes: list[Scene] = []
    for index, (layout, text) in enumerate(blocks):
        sents = sentences(text)
        diagram, title, subtitle, ambient = _meta(video["n"], layout, text, video["title"])
        scenes.append(
            Scene(
                video_n=video["n"],
                index=index,
                total=total,
                layout=layout,
                diagram=diagram,
                title=title,
                subtitle=subtitle,
                footer=video["footer"],
                video_title=video["title"],
                text=text,
                sentences=sents,
                roles=exam_roles(sents) if layout == "exam" else [],
                pause=5.0 if layout == "question" else 0.0,
                ambient=ambient,
            )
        )
    return scenes


def build_all() -> list[list[Scene]]:
    return [build_scenes(video) for video in VIDEOS]


def assert_coverage() -> None:
    for video, scenes in zip(VIDEOS, build_all()):
        joined = " ".join(scene.text for scene in scenes)
        if _norm_space(joined) != _norm_space(video["script"]):
            raise SystemExit(f"Script coverage failed for video {video['n']}")
        for scene in scenes:
            if _norm_space(" ".join(scene.sentences)) != _norm_space(scene.text):
                raise SystemExit(f"Sentence join failed in video {video['n']} scene {scene.index}")
            if scene.layout == "exam" and len(scene.roles) != len(scene.sentences):
                raise SystemExit(f"Exam roles failed in video {video['n']}")
            if scene.layout == "exam" and "answer" not in scene.roles:
                raise SystemExit(f"Exam scene has no model answer in video {video['n']}")
            if scene.layout == "question" and "Pause the video" not in scene.text:
                raise SystemExit(f"Question scene missing pause in video {video['n']}")
            if scene.layout == "answer" and "Pause the video" in scene.text:
                raise SystemExit(f"Answer scene still contains the pause in video {video['n']}")
            if scene.diagram == "cond_factors" and "illustrative table" in scene.text.lower():
                raise SystemExit("Brick comparison was classified as the factors scene")
    _check_numbers()


def _check_numbers() -> None:
    assert 120 * 10 * 4 == 4800
    assert 2 * 10 * 3 == 60
    assert 500 * 10 * 20 == 100_000
    assert 0.5 * 1200 * 20 ** 2 == 240_000
    assert abs(0.5 * 0.15 * 8 ** 2 - 4.8) < 1e-9
    assert 0.5 * 80 * 6 ** 2 == 1440
    assert 100 - 45 - 36 == 19
    assert 2000 - 1800 == 200
    assert 300 - 180 - 90 == 30
    assert abs(120 / 500 - 0.24) < 1e-12
    assert abs(12 / 60 - 0.2) < 1e-12
    assert abs(560 / 800 - 0.7) < 1e-12
    assert abs(1.00 / 0.04 - 25) < 1e-9
    assert abs(0.50 / 0.15 - 10 / 3) < 1e-9


if __name__ == "__main__":
    assert_coverage()
    for video, scenes in zip(VIDEOS, build_all()):
        print(f"\n=== VIDEO {video['n']}  {len(scenes)} scenes ===")
        for scene in scenes:
            print(f"  [{scene.layout:8} {scene.diagram:16}] {scene.title}")
            if scene.layout == "exam":
                for sent, role in zip(scene.sentences, scene.roles):
                    print(f"      {role:8} {sent[:90]}")
