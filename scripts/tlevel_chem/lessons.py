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

A11_2 = _lesson(
    "a11-2-temperature-and-rate",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "explain why increasing temperature increases particle kinetic energy", "page": 2, "kind": "aims2"},
        {"id": "hook", "cue": "First, retrieve collision theory", "page": 3, "kind": "hook2"},
        {"id": "ke", "cue": "Temperature is linked to the kinetic energy", "page": 4, "kind": "ke"},
        {"id": "watch", "cue": "Watch the particle model", "page": 5, "kind": "chamber", "temp": "high"},
        {"id": "freq", "cue": "That faster movement has two effects", "page": 6, "kind": "freq"},
        {"id": "success", "cue": "Second: the proportion of successful collisions", "page": 7, "kind": "mb", "mode": "shift"},
        {"id": "chain", "cue": "Put the chain together", "page": 8, "kind": "chain"},
        {"id": "low", "cue": "what happens when temperature decreases", "page": 9, "kind": "chamber", "temp": "low"},
        {"id": "shortcut", "cue": "Avoid a common shortcut", "page": 10, "kind": "shortcut"},
        {"id": "mb_axes", "cue": "The Maxwell–Boltzmann distribution shows how particle energies", "page": 11, "kind": "mb", "mode": "axes"},
        {"id": "mb_two", "cue": "Now compare two temperatures", "page": 12, "kind": "mb", "mode": "two"},
        {"id": "mb_area", "cue": "The key rate comparison", "page": 13, "kind": "mb", "mode": "area"},
        {"id": "changes", "cue": "What changes with temperature", "page": 14, "kind": "changes"},
        {"id": "guided", "cue": "Guided interpretation", "page": 15, "kind": "guided_mb"},
        {"id": "myths", "cue": "Correct four errors", "page": 16, "kind": "myths2"},
        {"id": "exam", "cue": "A reaction mixture is heated from two hundred", "page": 17, "kind": "exam2"},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 18, "kind": "recap2"},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 19, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "particle kinetic energy and speed"},
        {"slide": "aims", "item": "a2", "cue": "collision frequency and the proportion"},
        {"slide": "aims", "item": "a3", "cue": "what happens when temperature falls"},
        {"slide": "aims", "item": "a4", "cue": "Maxwell–Boltzmann distribution"},
        {"slide": "hook", "item": "ans", "cue": "Sufficient collision energy, and the correct spatial orientation"},
        {"slide": "chain", "item": "c1", "cue": "greater average kinetic energy"},
        {"slide": "chain", "item": "c2", "cue": "collisions occur more frequently"},
        {"slide": "chain", "item": "c3", "cue": "energy at least equal to activation energy"},
        {"slide": "chain", "item": "c4", "cue": "the rate of reaction increases"},
        {"slide": "guided", "item": "ans", "cue": "Curve B. It is broader"},
        {"slide": "exam", "item": "a", "cue": "Average kinetic energy increases. Particles move faster"},
        {"slide": "exam", "item": "b", "cue": "A greater proportion of particles have energy equal to or greater than E a, so more collisions"},
        {"slide": "exam", "item": "c", "cue": "The distribution becomes broader, its peak becomes lower"},
        {"slide": "exam", "item": "d", "cue": "Collision frequency increases and a greater proportion of collisions have sufficient energy, so successful"},
        {"slide": "recap", "item": "r1", "cue": "Higher temperature increases average kinetic energy"},
        {"slide": "recap", "item": "r2", "cue": "The Maxwell–Boltzmann curve becomes broader"},
        {"slide": "recap", "item": "r3", "cue": "Temperature does not, by itself, change E a"},
    ],
    {"watch", "freq", "low"},
)

A11_3 = _lesson(
    "a11-3-catalysts",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "define a catalyst accurately", "page": 2, "kind": "aims3"},
        {"id": "hook", "cue": "Retrieve collision theory", "page": 3, "kind": "hook3"},
        {"id": "defn", "cue": "A catalyst is a substance that increases the rate", "page": 4, "kind": "defn"},
        {"id": "notmean", "cue": "A catalyst does not mean more reactant", "page": 5, "kind": "notmean"},
        {"id": "pathway", "cue": "A catalyst provides an alternative reaction pathway", "page": 6, "kind": "pathway"},
        {"id": "profile", "cue": "Watch the energy profile", "page": 7, "kind": "profile"},
        {"id": "link", "cue": "Link that to collision theory", "page": 8, "kind": "cat_link"},
        {"id": "evidence", "cue": "Use evidence", "page": 9, "kind": "evidence"},
        {"id": "mb_same", "cue": "A catalyst does not need a new Maxwell–Boltzmann curve", "page": 10, "kind": "mb", "mode": "same"},
        {"id": "mb_left", "cue": "the catalysed E a is positioned to the left", "page": 11, "kind": "mb", "mode": "cat"},
        {"id": "vs", "cue": "Do not confuse a catalyst with temperature", "page": 12, "kind": "vs"},
        {"id": "guided", "cue": "Guided application. A reaction has E a of eighty five", "page": 13, "kind": "guided_cat"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 14, "kind": "myths3"},
        {"id": "exam", "cue": "Examination-style question.", "page": 15, "kind": "exam3"},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 16, "kind": "recap3"},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 17, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "define a catalyst accurately"},
        {"slide": "aims", "item": "a2", "cue": "use evidence to decide"},
        {"slide": "aims", "item": "a3", "cue": "alternative pathway with lower activation energy"},
        {"slide": "aims", "item": "a4", "cue": "interpret that on a Maxwell–Boltzmann"},
        {"slide": "evidence", "item": "ans", "cue": "That evidence is consistent with X acting as a catalyst"},
        {"slide": "guided", "item": "ans", "cue": "The fifty two kilojoules per mole line lies further left"},
        {"slide": "exam", "item": "a", "cue": "A substance that increases the rate of a chemical reaction, without itself"},
        {"slide": "exam", "item": "b", "cue": "It provides an alternative reaction pathway with lower activation energy"},
        {"slide": "exam", "item": "c", "cue": "Use the same distribution at the same temperature"},
        {"slide": "exam", "item": "d", "cue": "A greater proportion of particles have energy at least the lower E a"},
        {"slide": "recap", "item": "r1", "cue": "A catalyst increases rate without permanent chemical change"},
        {"slide": "recap", "item": "r2", "cue": "alternative pathway with lower activation energy"},
        {"slide": "recap", "item": "r3", "cue": "the Maxwell–Boltzmann distribution stays the same"},
    ],
    {"profile"},
)

from tlevel_chem.lessons_a12 import A12_LESSON_MAP

LESSONS = {
    "a11-1-collision-theory": A11_1,
    "a11-2-temperature-and-rate": A11_2,
    "a11-3-catalysts": A11_3,
    **A12_LESSON_MAP,
}
