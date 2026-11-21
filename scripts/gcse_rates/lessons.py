"""Slide cues for the GCSE rates-of-reaction video."""

from __future__ import annotations

from gcse_rates.narration import BY_SLUG


def _lesson(slug: str, slides: list[dict], reveals: list[dict], animate: set[str] | None = None) -> dict:
    script = BY_SLUG[slug]
    return {
        "slug": slug,
        "title": script.title,
        "subtitle": script.subtitle,
        "filename": script.filename,
        "youtube_filename": script.youtube_filename,
        "pages": max(s.get("page", 1) for s in slides),
        "slides": slides,
        "reveals": reveals,
        "animate": animate or set(),
    }


RATES = _lesson(
    "rates-of-reaction",
    [
        {"id": "hello", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "hello"},
        {"id": "title", "cue": "This GCSE Chemistry lesson is about rates of reaction", "page": 2, "kind": "title"},
        {"id": "aims", "cue": "By the end, you should be able to do three things", "page": 3, "kind": "aims"},
        {"id": "hook", "cue": "Some chemical reactions finish in a flash", "page": 4, "kind": "hook"},
        {"id": "fireworks", "cue": "Fireworks are very fast", "page": 5, "kind": "compare", "focus": "fast"},
        {"id": "rusting", "cue": "Rusting of iron is slow", "page": 6, "kind": "compare", "focus": "slow"},
        {"id": "define", "cue": "The rate of a reaction tells us", "page": 7, "kind": "define"},
        {"id": "words", "cue": "Reactants are the substances we start with", "page": 8, "kind": "words"},
        {"id": "formula", "cue": "Average rate equals the quantity of product formed", "page": 9, "kind": "formula"},
        {"id": "units", "cue": "Quantity might be a mass in grams", "page": 10, "kind": "units"},
        {"id": "reaction", "cue": "Magnesium reacts with hydrochloric acid", "page": 11, "kind": "reaction"},
        {"id": "ex1", "cue": "Suppose we collect 180", "page": 12, "kind": "ex1"},
        {"id": "ex1_calc", "cue": "2 minutes times 60 equals 120 seconds", "page": 13, "kind": "ex1_calc"},
        {"id": "ex1_ans", "cue": "the average rate is 1.5", "page": 14, "kind": "ex1_ans"},
        {"id": "ex2", "cue": "3 grams of magnesium reacts completely", "page": 15, "kind": "ex2"},
        {"id": "ex2_ans", "cue": "Convert 4 minutes to seconds", "page": 16, "kind": "ex2_ans"},
        {"id": "graphs_why", "cue": "Graphs show that clearly", "page": 17, "kind": "note"},
        {"id": "mg_axes", "cue": "Time goes on the horizontal axis", "page": 18, "kind": "graph_mg", "phase": "axes"},
        {"id": "mg_line", "cue": "the line begins at 3", "page": 19, "kind": "graph_mg", "phase": "draw"},
        {"id": "h2_graph", "cue": "Volume of hydrogen produced against time", "page": 20, "kind": "graph_h2"},
        {"id": "steep", "cue": "a steeper line means a faster reaction", "page": 21, "kind": "steep"},
        {"id": "units2", "cue": "moles per minute instead of grams per second", "page": 22, "kind": "units2"},
        {"id": "recap", "cue": "Remember this", "page": 23, "kind": "recap"},
        {"id": "outro", "cue": "please subscribe to JD Science", "page": 24, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "Say what reaction rate means"},
        {"slide": "aims", "item": "a2", "cue": "Calculate average rate from measurements"},
        {"slide": "aims", "item": "a3", "cue": "read graphs that show how the rate changes"},
        {"slide": "words", "item": "reactants", "cue": "Reactants are the substances we start with"},
        {"slide": "words", "item": "products", "cue": "Products are the new substances"},
        {"slide": "formula", "item": "product", "cue": "quantity of product formed"},
        {"slide": "formula", "item": "reactant", "cue": "quantity of reactant used up"},
        {"slide": "ex1_calc", "item": "time", "cue": "2 minutes times 60"},
        {"slide": "ex1_calc", "item": "div", "cue": "180 divided by 120"},
        {"slide": "ex1_calc", "item": "ans", "cue": "equals 1.5"},
        {"slide": "ex2_ans", "item": "time", "cue": "4 times 60"},
        {"slide": "ex2_ans", "item": "div", "cue": "3 divided by"},
        {"slide": "ex2_ans", "item": "ans", "cue": "The average rate is 0.0125"},
        {"slide": "steep", "item": "fast", "cue": "a steeper line means a faster reaction"},
        {"slide": "steep", "item": "flat", "cue": "A horizontal line means the measured quantity"},
    ],
    {"mg_line", "h2_graph", "reaction"},
)

LESSONS = {"rates-of-reaction": RATES}
