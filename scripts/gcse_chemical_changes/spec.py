"""Specification coverage for the chemical-changes series."""

from __future__ import annotations

from jdscience_video.six_stage import SpecOutcome
from gcse_chemical_changes.narration import BY_SLUG

# AQA Combined/Chemistry 4.4 Chemical changes and Edexcel CC/SC Topic 3.
OUTCOMES = {
    "acids-bases-alkalis": [
        SpecOutcome("C4.4.2.1", "Define acid, base and alkali in terms of ions in aqueous solution."),
        SpecOutcome("Edx3.1", "Recall that acids produce hydrogen ions in water."),
        SpecOutcome("Edx3.2", "Recall that alkalis are soluble bases that produce hydroxide ions."),
        SpecOutcome("C4.4.2.2a", "Write the ionic equation H+ + OH- → H2O for neutralisation."),
    ],
    "indicators-and-ph": [
        SpecOutcome("C4.4.2.4", "Describe the use of universal indicator and the pH scale."),
        SpecOutcome("Edx3.3", "Relate pH to acidic, neutral and alkaline solutions."),
        SpecOutcome("Edx3.4", "Describe colour changes of common indicators."),
        SpecOutcome("C4.4.2.5pH", "Link pH to hydrogen ion concentration, including the factor of ten on Higher Tier.", tier="higher"),
    ],
    "strong-and-weak-acids": [
        SpecOutcome("C4.4.2.5", "Explain strong and weak acids in terms of ionisation.", tier="higher"),
        SpecOutcome("Edx3.8HT", "Distinguish strength from concentration.", tier="higher"),
        SpecOutcome("C4.4.2.5b", "Compare pH of strong and weak acids at the same concentration.", tier="higher"),
    ],
    "acids-metals-redox": [
        SpecOutcome("C4.4.1.2", "Describe reactions of acids with metals to form a salt and hydrogen."),
        SpecOutcome("C4.4.1.3", "Explain these reactions as redox, including half-equations on Higher Tier."),
        SpecOutcome("Edx3.5", "Recall the lighted-splint test for hydrogen."),
        SpecOutcome("C4.4.1.2b", "Recall that copper does not react with dilute hydrochloric or sulfuric acid."),
    ],
    "neutralisation-and-gas-tests": [
        SpecOutcome("C4.4.2.2", "Describe acid + alkali and acid + oxide reactions as salt + water."),
        SpecOutcome("C4.4.2.3", "Describe acid + carbonate as salt + water + carbon dioxide."),
        SpecOutcome("Edx3.6", "Recall gas tests for hydrogen, oxygen and carbon dioxide."),
        SpecOutcome("C4.4.2.2b", "Write the ionic equation for acid-alkali neutralisation."),
    ],
    "soluble-and-insoluble-salts": [
        SpecOutcome("C4.4.2.3m", "Describe making a soluble salt from an insoluble base."),
        SpecOutcome("C4.4.2.6", "Describe making an insoluble salt by precipitation."),
        SpecOutcome("Edx3.14", "Recall solubility rules for common salts."),
        SpecOutcome("Edx3.15", "Describe filtration, washing, crystallisation and drying."),
    ],
    "acid-alkali-titration": [
        SpecOutcome("C4.4.2.4t", "Describe the titration method, including concordant titres."),
        SpecOutcome("Edx3.16", "Name pipette, burette, conical flask and indicator."),
        SpecOutcome("Edx3.17", "Calculate unknown concentration using moles = concentration × volume."),
    ],
    "electrolysis-ions-electrodes": [
        SpecOutcome("C4.4.3.1", "Explain why ionic compounds conduct when molten or dissolved."),
        SpecOutcome("Edx3.21", "Identify anode and cathode."),
        SpecOutcome("Edx3.22", "Describe movement of cations and anions and redox at the electrodes."),
    ],
    "electrolysis-molten-ionic": [
        SpecOutcome("C4.4.3.2", "Predict products of molten binary ionic compounds."),
        SpecOutcome("Edx3.23", "Write half-equations for molten electrolysis.", tier="higher"),
        SpecOutcome("C4.4.3.2b", "Explain why aluminium is extracted by electrolysis."),
    ],
    "electrolysis-aqueous-solutions": [
        SpecOutcome("C4.4.3.4", "Apply the cathode rule for aqueous solutions."),
        SpecOutcome("C4.4.3.5", "Apply the anode rule for aqueous solutions, including concentrated halides."),
        SpecOutcome("Edx3.24", "Predict products for brine and copper sulfate with inert electrodes."),
        SpecOutcome("Edx3.25", "Recall half-equations for hydrogen, oxygen and chlorine.", tier="higher"),
    ],
    "copper-purification": [
        SpecOutcome("C4.4.3.3", "Describe the purification of copper by electrolysis."),
        SpecOutcome("Edx3.26", "Write electrode half-equations and explain anode sludge."),
        SpecOutcome("C4.4.3.3b", "Explain why the electrolyte stays blue during purification."),
    ],
    "chemical-changes-exam-practice": [
        SpecOutcome("C4.4.2", "Apply acid reaction patterns in mixed questions."),
        SpecOutcome("C4.4.3", "Choose the correct electrolysis rule for molten, aqueous and purification cells."),
        SpecOutcome("Edx3", "Use gas tests, salt-making methods and electrode polarity in one problem."),
    ],
}


def outcomes_for(slug: str, spoken: str | None = None) -> list[SpecOutcome]:
    rows = [SpecOutcome(o.code, o.statement, o.covered, o.evidence, o.tier) for o in OUTCOMES[slug]]
    text = (spoken if spoken is not None else BY_SLUG[slug].spoken).lower()
    needles = {
        "C4.4.2.1": ["hydrogen ions", "hydroxide", "not every base"],
        "Edx3.1": ["hydrogen ions"],
        "Edx3.2": ["soluble base"],
        "C4.4.2.2a": ["h plus plus o h minus"],
        "C4.4.2.4": ["universal indicator", "p h"],
        "Edx3.3": ["ph seven", "pH seven", "p h seven"],
        "Edx3.4": ["litmus"],
        "C4.4.2.5pH": ["factor of ten"],
        "C4.4.2.5": ["fully ionised", "partially ionised"],
        "Edx3.8HT": ["strength", "concentration"],
        "C4.4.2.5b": ["same concentration"],
        "C4.4.1.2": ["salt plus hydrogen"],
        "C4.4.1.3": ["oxidation is loss"],
        "Edx3.5": ["squeaky pop"],
        "C4.4.1.2b": ["copper does not react"],
        "C4.4.2.2": ["salt and water"],
        "C4.4.2.3": ["carbon dioxide"],
        "Edx3.6": ["limewater"],
        "C4.4.2.2b": ["h plus plus o h minus"],
        "C4.4.2.3m": ["excess"],
        "C4.4.2.6": ["precipitation"],
        "Edx3.14": ["all nitrates"],
        "Edx3.15": ["crystallise"],
        "C4.4.2.4t": ["concordant"],
        "Edx3.16": ["burette", "pipette"],
        "Edx3.17": ["moles equals concentration"],
        "C4.4.3.1": ["free to move"],
        "Edx3.21": ["anode is the positive"],
        "Edx3.22": ["gain electrons"],
        "C4.4.3.2": ["metal forms at the cathode"],
        "Edx3.23": ["two electrons"],
        "C4.4.3.2b": ["more reactive than carbon"],
        "C4.4.3.4": ["more reactive than hydrogen"],
        "C4.4.3.5": ["halide"],
        "Edx3.24": ["brine"],
        "Edx3.25": ["four o h minus"],
        "C4.4.3.3": ["impure copper"],
        "Edx3.26": ["sludge"],
        "C4.4.3.3b": ["stays blue"],
        "C4.4.2": ["acid plus metal"],
        "C4.4.3": ["molten, aqueous or purification"],
        "Edx3": ["gas test"],
    }
    for row in rows:
        hits = needles.get(row.code, [])
        found = [n for n in hits if n in text]
        row.covered = bool(found) if hits else True
        row.evidence = ", ".join(found)
    return rows
