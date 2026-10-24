"""Scene cues and reveals for A11.1."""

from __future__ import annotations

from tlevel_chem.narration import BY_SLUG


def _lesson(slug: str, slides: list[dict], reveals: list[dict], animate: set[str]) -> dict:
    script = BY_SLUG[slug]
    return {
        "slug": slug,
        "spec": script.spec,
        "title": script.title,
        "subtitle": script.subtitle,
        "filename": script.filename,
        "pages": max(s.get("page", 1) for s in slides),
        "slides": slides,
        "reveals": reveals,
        "animate": animate,
    }


A11_1 = _lesson(
    "a11-1-collision-theory",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "By the end of this lesson", "page": 2, "kind": "aims"},
        {"id": "hook", "cue": "Two reactant particles collide", "page": 3, "kind": "hook"},
        {"id": "central", "cue": "Here is the central idea", "page": 4, "kind": "central"},
        {"id": "ea_def", "cue": "Activation energy is the minimum energy", "page": 5, "kind": "ea_def"},
        {"id": "low_e", "cue": "Watch this first animation", "page": 6, "kind": "collide", "mode": "low"},
        {"id": "high_e", "cue": "Now watch a higher-energy collision", "page": 7, "kind": "collide", "mode": "high"},
        {"id": "two_tests", "cue": "Energy is necessary, but it is not sufficient", "page": 8, "kind": "two_tests"},
        {"id": "rule", "cue": "Use this decision rule", "page": 9, "kind": "rule"},
        {"id": "orient_def", "cue": "Now specification point A eleven point one point two", "page": 10, "kind": "orient_def"},
        {"id": "orient_bad", "cue": "Watch an incorrect orientation", "page": 11, "kind": "collide", "mode": "wrong_orient"},
        {"id": "orient_good", "cue": "Now watch a correct orientation", "page": 12, "kind": "collide", "mode": "right_orient"},
        {"id": "combine", "cue": "Put the two tests together", "page": 13, "kind": "combine"},
        {"id": "ex_a", "cue": "Collision A has thirty", "page": 14, "kind": "example", "label": "A", "energy": 30, "ea": 45, "orient": "correct"},
        {"id": "ex_b", "cue": "Collision B has fifty five", "page": 15, "kind": "example", "label": "B", "energy": 55, "ea": 45, "orient": "incorrect"},
        {"id": "ex_c", "cue": "Collision C has fifty", "page": 16, "kind": "example", "label": "C", "energy": 50, "ea": 45, "orient": "correct"},
        {"id": "myths", "cue": "Here are four misconceptions", "page": 17, "kind": "myths"},
        {"id": "exam", "cue": "Let us finish with an examination-style question", "page": 18, "kind": "exam"},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 19, "kind": "recap"},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 20, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "explain why reacting particles must collide"},
        {"slide": "aims", "item": "a2", "cue": "define activation energy"},
        {"slide": "aims", "item": "a3", "cue": "distinguish successful and unsuccessful"},
        {"slide": "aims", "item": "a4", "cue": "correct spatial orientation"},
        {"slide": "hook", "item": "ans", "cue": "The answer is no"},
        {"slide": "ex_a", "item": "verdict", "cue": "No. Thirty is below"},
        {"slide": "ex_b", "item": "verdict", "cue": "The energy is sufficient, but"},
        {"slide": "ex_c", "item": "verdict", "cue": "Energy exceeds activation energy and orientation is correct"},
        {"slide": "exam", "item": "a", "cue": "Fifty eight is below sixty two"},
        {"slide": "exam", "item": "b", "cue": "The energy exceeds the activation energy, but"},
        {"slide": "exam", "item": "c", "cue": "Collision energy must be at least"},
        {"slide": "exam", "item": "d", "cue": "Many collisions fail one or both"},
        {"slide": "recap", "item": "r1", "cue": "Reactant particles must collide"},
        {"slide": "recap", "item": "r2", "cue": "energy at least equal to the activation energy"},
        {"slide": "recap", "item": "r3", "cue": "correct spatial orientation"},
        {"slide": "recap", "item": "r4", "cue": "successful collisions"},
    ],
    {"low_e", "high_e", "orient_bad", "orient_good"},
)

LESSONS = {"a11-1-collision-theory": A11_1}
