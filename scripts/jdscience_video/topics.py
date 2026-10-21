"""Topic slugs for the GCSE chemistry video series."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Topic:
    slug: str
    title: str
    keywords: tuple[str, ...]


TOPICS: tuple[Topic, ...] = (
    Topic("moles", "Calculating Moles", ("mole", "moles", "avogadro", "molar")),
    Topic(
        "concentration",
        "Calculating Concentration",
        ("concentration", "conc", "moldm", "mol-dm", "solution"),
    ),
    Topic(
        "percentage-by-mass",
        "Percentage by Mass",
        ("percentage", "percent", "pct-mass", "percentagemass", "%mass"),
    ),
    Topic(
        "atom-economy",
        "Atom Economy",
        ("atom-economy", "atomeconomy", "atom_economy", "economy"),
    ),
    Topic(
        "empirical-formula",
        "Calculating Empirical Formulae",
        ("empirical", "empirical-formula", "empiricalformula"),
    ),
    Topic(
        "six-mark-questions",
        "Six-Mark Exam Technique",
        ("six-mark", "sixmark", "6-mark", "6mark", "exam-technique"),
    ),
)

SLUGS = {topic.slug for topic in TOPICS}


def infer_topic(name: str, fallback: str | None = None) -> str | None:
    """Guess a topic slug from a filename or folder name."""
    lowered = name.lower().replace(" ", "-").replace("_", "-")
    for topic in TOPICS:
        if any(key in lowered for key in topic.keywords):
            return topic.slug
    return fallback if fallback in SLUGS else None
