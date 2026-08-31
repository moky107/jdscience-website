"""Helpers to build full walkthrough question dicts from compact specs."""

from __future__ import annotations


def q(
    text: str,
    topic: str,
    command: str,
    marks: int,
    skill: str,
    asking: str,
    steps: list[str],
    model: str,
    marks_breakdown: list[str],
    mistakes: list[str],
    tip: str,
    extension: str | None = None,
) -> dict:
    return {
        "text": text,
        "topic": topic,
        "command": command,
        "marks": marks,
        "skill": skill,
        "asking": asking,
        "steps": steps,
        "model": model,
        "marks_breakdown": marks_breakdown,
        "mistakes": mistakes,
        "tip": tip,
        "extension": extension,
    }


DEFAULT_STEPS = [
    "Identify the science idea the question is testing.",
    "Pick out key data or keywords in the question stem.",
    "Decide which equation, rule or process applies.",
    "Build the answer logically in the order the marks expect.",
    "Check units, keywords and that your final sentence answers the command word.",
]


def calc_q(
    text: str,
    topic: str,
    marks: int,
    asking: str,
    steps: list[str],
    model: str,
    marks_breakdown: list[str],
    mistakes: list[str],
    tip: str,
    extension: str | None = None,
) -> dict:
    return q(
        text, topic, "calculate", marks, "Calculation", asking, steps, model, marks_breakdown, mistakes, tip, extension
    )


def topic_pack(name: str, questions: list[dict]) -> dict:
    return {"name": name, "questions": questions}
