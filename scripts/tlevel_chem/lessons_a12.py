"""Scene cues for A12.1–A12.6."""

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


def _aims(n, extras=None):
    items = [{"slide": "aims", "item": f"a{i}", "cue": cue} for i, cue in n]
    return items + (extras or [])


A12_1 = _lesson(
    "a12-1-factors-affecting-rates",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "explain how surface area, concentration and pressure", "page": 2, "kind": "aims12", "aims": [
            "Explain surface area using collision theory",
            "Explain concentration using collision theory",
            "Explain pressure using collision theory",
            "Identify control variables in a rate investigation",
        ]},
        {"id": "retrieve", "cue": "Retrieve collision theory", "page": 3, "kind": "retrieve"},
        {"id": "common", "cue": "The common idea across A twelve point one", "page": 4, "kind": "common"},
        {"id": "sa", "cue": "surface area", "page": 5, "kind": "sa_def"},
        {"id": "chips", "cue": "Watch the particle models", "page": 6, "kind": "chips"},
        {"id": "ppt", "cue": "The teacher PowerPoint uses two experiments", "page": 7, "kind": "sa_ppt"},
        {"id": "book", "cue": "The student workbook uses a third trial", "page": 8, "kind": "sa_book"},
        {"id": "conc", "cue": "concentration", "page": 9, "kind": "conc"},
        {"id": "conc_data", "cue": "The shared concentration dataset", "page": 10, "kind": "conc_data"},
        {"id": "press", "cue": "pressure, for gases", "page": 11, "kind": "press"},
        {"id": "graph", "cue": "On a gas-volume versus time graph", "page": 12, "kind": "vt_graph"},
        {"id": "controls", "cue": "When you plan an investigation", "page": 13, "kind": "controls"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 14, "kind": "myths12", "myths": [
            "Same mass means the same amount of substance.",
            "Higher concentration is not faster particles if T is unchanged.",
            "Higher pressure is not always higher temperature.",
            "More collisions still need energy and orientation.",
        ]},
        {"id": "exam", "cue": "Examination-style question.", "page": 15, "kind": "exam12", "items": [
            ("a", "(a) Powder vs same mass of large pieces.  [3]"),
            ("b", "(b) Why increasing concentration increases rate.  [3]"),
            ("c", "(c) Why increasing gas pressure increases rate.  [3]"),
            ("d", "(d) One control variable for surface area, and why.  [2]"),
        ], "answers": {
            "a": "Greater total surface area → higher collision frequency → more successful collisions / time.",
            "b": "More particles per unit volume → higher collision frequency → faster rate.",
            "c": "Same particles, smaller volume at constant T → closer together → more frequent collisions.",
            "d": "Control mass, other concentration, or T so only surface area changes.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 16, "kind": "recap12", "cards": [
            ("Surface area", "Same mass, more exposed surface."),
            ("Concentration", "More particles per unit volume."),
            ("Pressure", "Closer gas particles at constant T."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 17, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "surface area, concentration and pressure"},
        {"slide": "aims", "item": "a2", "cue": "using collision theory"},
        {"slide": "aims", "item": "a3", "cue": "identify control variables"},
        {"slide": "aims", "item": "a4", "cue": "rate investigation"},
        {"slide": "exam", "item": "a", "cue": "Powder has a greater total surface area"},
        {"slide": "exam", "item": "b", "cue": "There are more particles per unit volume"},
        {"slide": "exam", "item": "c", "cue": "the same particles occupy a smaller volume"},
        {"slide": "exam", "item": "d", "cue": "Control the mass of solid"},
        {"slide": "recap", "item": "r1", "cue": "Surface area, concentration and pressure"},
        {"slide": "recap", "item": "r2", "cue": "More frequent collisions"},
        {"slide": "recap", "item": "r3", "cue": "Energy and orientation still decide"},
    ],
    {"chips", "press"},
)

A12_2 = _lesson(
    "a12-2-calculating-rate",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "calculate average rate from tables and graphs", "page": 2, "kind": "aims12", "aims": [
            "Define average rate as change in amount ÷ time",
            "Calculate rate from product formed or reactant used",
            "Convert minutes to seconds when needed",
            "Read a chord gradient from a product–time graph",
        ]},
        {"id": "defn", "cue": "Reaction rate is how quickly", "page": 3, "kind": "rate_def"},
        {"id": "units", "cue": "Rate units are compound units", "page": 4, "kind": "units"},
        {"id": "product", "cue": "Seventy two cubic centimetres of gas", "page": 5, "kind": "calc_product"},
        {"id": "reactant", "cue": "A solid falls from eight point four zero grams", "page": 6, "kind": "calc_reactant"},
        {"id": "time", "cue": "Two point five minutes is one hundred and fifty seconds", "page": 7, "kind": "calc_time"},
        {"id": "table", "cue": "Now a table. Gas volume is zero", "page": 8, "kind": "calc_table"},
        {"id": "graph", "cue": "On a product–time graph", "page": 9, "kind": "calc_graph"},
        {"id": "errors", "cue": "Correct three common errors", "page": 10, "kind": "calc_errors"},
        {"id": "exam", "cue": "Examination-style question.", "page": 11, "kind": "exam12", "items": [
            ("a", "(a) 96 cm³ in 32 s.  [2]"),
            ("b", "(b) 6.80 g → 5.30 g in 75 s.  [3]"),
            ("c", "(c) 15 cm³ at 20 s, 39 cm³ at 60 s.  [3]"),
            ("d", "(d) Why is the unit essential?  [1]"),
        ], "answers": {
            "a": "96 ÷ 32 = 3.0 cm³ s⁻¹",
            "b": "Change 1.50 g; 1.50 ÷ 75 = 0.020 g s⁻¹",
            "c": "24 cm³ in 40 s = 0.60 cm³ s⁻¹",
            "d": "The unit names the quantity and the time basis.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the method", "page": 12, "kind": "recap12", "cards": [
            ("Change", "Initial − final for a reactant."),
            ("Divide", "Change ÷ time interval."),
            ("Unit", "Compound unit, sensible rounding."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 13, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "average rate from tables and graphs"},
        {"slide": "aims", "item": "a2", "cue": "reactant used or product formed"},
        {"slide": "aims", "item": "a3", "cue": "correct compound unit"},
        {"slide": "aims", "item": "a4", "cue": "tables and graphs"},
        {"slide": "exam", "item": "a", "cue": "three point zero cubic centimetres per second"},
        {"slide": "exam", "item": "b", "cue": "zero point zero two zero grams per second"},
        {"slide": "exam", "item": "c", "cue": "zero point six zero cubic centimetres per second"},
        {"slide": "exam", "item": "d", "cue": "The unit identifies the amount measured"},
        {"slide": "recap", "item": "r1", "cue": "Find the start and end values"},
        {"slide": "recap", "item": "r2", "cue": "Divide change by time"},
        {"slide": "recap", "item": "r3", "cue": "Write the compound unit"},
    ],
    set(),
)

A12_3 = _lesson(
    "a12-3-enthalpy-changes",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "define H and delta H", "page": 2, "kind": "aims12", "aims": [
            "Define H and ΔH",
            "Describe exothermic and endothermic transfers",
            "Read Ea and ΔH on an enthalpy profile",
            "Explain that a catalyst does not change ΔH",
        ]},
        {"id": "hdef", "cue": "Enthalpy, H, is the energy content", "page": 3, "kind": "hdef"},
        {"id": "exo", "cue": "Watch the exothermic profile", "page": 4, "kind": "profile_exo"},
        {"id": "endo", "cue": "Watch the endothermic profile", "page": 5, "kind": "profile_endo"},
        {"id": "fortyfive", "cue": "forty five kilojoules to the surroundings", "page": 6, "kind": "fortyfive"},
        {"id": "cat", "cue": "A catalyst provides an alternative pathway", "page": 7, "kind": "profile_cat"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 8, "kind": "myths12", "myths": [
            "Exothermic reactions still need Ea.",
            "A catalyst lowers Ea, not ΔH.",
            "Endothermic does not destroy energy.",
            "ΔH is not always positive.",
        ]},
        {"id": "exam", "cue": "Examination-style question.", "page": 9, "kind": "exam12", "items": [
            ("a", "(a) Define ΔH.  [2]"),
            ("b", "(b) Exothermic diagram.  [2]"),
            ("c", "(c) Endothermic change.  [2]"),
            ("d", "(d) Catalyst on the profile.  [3]"),
        ], "answers": {
            "a": "ΔH = H(products) − H(reactants).",
            "b": "Products lower; energy to surroundings; ΔH negative.",
            "c": "ΔH positive; energy from surroundings into the system.",
            "d": "Lower Ea pathway; same reactant and product levels; ΔH unchanged.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 10, "kind": "recap12", "cards": [
            ("H and ΔH", "State energy vs the change."),
            ("Signs", "Exo −  ·  Endo +"),
            ("Catalyst", "Peak falls; ΔH stays."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 11, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "define H and delta H"},
        {"slide": "aims", "item": "a2", "cue": "exothermic and endothermic"},
        {"slide": "aims", "item": "a3", "cue": "read enthalpy diagrams"},
        {"slide": "aims", "item": "a4", "cue": "what a catalyst does and does not change"},
        {"slide": "exam", "item": "a", "cue": "Delta H equals H products minus H reactants"},
        {"slide": "exam", "item": "b", "cue": "Products are lower in enthalpy"},
        {"slide": "exam", "item": "c", "cue": "Delta H is positive"},
        {"slide": "exam", "item": "d", "cue": "The catalyst provides a lower E a pathway"},
        {"slide": "recap", "item": "r1", "cue": "H is the energy content of a state"},
        {"slide": "recap", "item": "r2", "cue": "Exothermic, delta H negative"},
        {"slide": "recap", "item": "r3", "cue": "A catalyst changes the pathway peak"},
    ],
    {"exo", "endo", "cat"},
)

A12_4 = _lesson(
    "a12-4-industrial-catalysts",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "explain how a catalyst increases industrial rate", "page": 2, "kind": "aims12", "aims": [
            "State the industrial rate → turnaround → cost chain",
            "Calculate time saved from process data",
            "Show lower Ea with unchanged ΔH",
            "Reject cost and energy misconceptions",
        ]},
        {"id": "defn", "cue": "A catalyst increases reaction rate without being permanently", "page": 3, "kind": "ind_def"},
        {"id": "chain", "cue": "The industrial chain is", "page": 4, "kind": "ind_chain"},
        {"id": "hours", "cue": "Without a catalyst the reaction stage takes eight point zero hours", "page": 5, "kind": "ind_hours"},
        {"id": "processx", "cue": "Process X runs twelve batches", "page": 6, "kind": "ind_x"},
        {"id": "profile", "cue": "Watch the energy profile", "page": 7, "kind": "profile_cat"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 8, "kind": "myths12", "myths": [
            "A catalyst does not heat the mixture.",
            "ΔH does not change.",
            "The catalyst is not consumed overall.",
            "Faster is not the same as zero cost.",
        ]},
        {"id": "exam", "cue": "Examination-style question.", "page": 9, "kind": "exam12", "items": [
            ("a", "(a) Industrial advantage of a faster catalysed rate.  [3]"),
            ("b", "(b) How a catalyst increases rate via Ea.  [3]"),
            ("c", "(c) 10 h → 4 h. Time reduction.  [1]"),
            ("d", "(d) Why ΔH is unchanged.  [2]"),
        ], "answers": {
            "a": "Faster rate → shorter stage → faster turnaround / more cycles / lower cost.",
            "b": "Alternative pathway; lower Ea; more successful collisions per unit time.",
            "c": "6 hours.",
            "d": "Reactant and product enthalpy levels unchanged.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 10, "kind": "recap12", "cards": [
            ("Rate", "Lower Ea, more successful collisions."),
            ("Turnaround", "Shorter stage, more cycles."),
            ("ΔH", "Enthalpy levels unchanged."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 11, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "increases industrial rate"},
        {"slide": "aims", "item": "a2", "cue": "shortens turnaround time"},
        {"slide": "aims", "item": "a3", "cue": "reduce costs"},
        {"slide": "aims", "item": "a4", "cue": "why delta H does not change"},
        {"slide": "exam", "item": "a", "cue": "Rate increases. The stage completes sooner"},
        {"slide": "exam", "item": "b", "cue": "It provides an alternative pathway"},
        {"slide": "exam", "item": "c", "cue": "Six hours"},
        {"slide": "exam", "item": "d", "cue": "Reactant enthalpy is unchanged"},
        {"slide": "recap", "item": "r1", "cue": "A catalyst lowers E a and increases rate"},
        {"slide": "recap", "item": "r2", "cue": "Faster rate shortens the reaction stage"},
        {"slide": "recap", "item": "r3", "cue": "Delta H stays the same"},
    ],
    {"profile"},
)

A12_5 = _lesson(
    "a12-5-reversible-reactions",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "define dynamic equilibrium", "page": 2, "kind": "aims12", "aims": [
            "Define dynamic equilibrium",
            "State the required conditions",
            "Predict concentration and temperature shifts",
            "Predict pressure shifts from gas moles",
        ]},
        {"id": "rev", "cue": "The symbol with arrows both ways", "page": 3, "kind": "reversible"},
        {"id": "dyn", "cue": "Dynamic equilibrium occurs when", "page": 4, "kind": "dynamic"},
        {"id": "le", "cue": "Le Chatelier’s principle", "page": 5, "kind": "lechat"},
        {"id": "conc", "cue": "Concentration, for A plus B", "page": 6, "kind": "eq_conc"},
        {"id": "temp", "cue": "If the forward reaction is exothermic", "page": 7, "kind": "eq_temp"},
        {"id": "press", "cue": "Pressure applies to gaseous equilibria", "page": 8, "kind": "eq_press"},
        {"id": "examples", "cue": "Nitrogen plus three hydrogen", "page": 9, "kind": "eq_examples"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 10, "kind": "myths12", "myths": [
            "Reactions do not stop at equilibrium.",
            "Constant composition is not equal concentrations.",
            "Increasing pressure does not always shift right.",
            "Increasing temperature does not always shift left.",
        ]},
        {"id": "exam", "cue": "Examination-style question.", "page": 11, "kind": "exam12", "items": [
            ("a", "(a) Define dynamic equilibrium + one condition.  [3]"),
            ("b", "(b) N₂ + 3H₂ ⇌ 2NH₃, increase pressure.  [2]"),
            ("c", "(c) Exothermic forward, increase T, product yield.  [2]"),
            ("d", "(d) Add a reactant.  [2]"),
        ], "answers": {
            "a": "Equal continuing rates in a closed system.",
            "b": "Shifts right: 2 gas moles vs 4.",
            "c": "Shifts reverse / endothermic; yield decreases.",
            "d": "Shifts to use added reactant; products favoured.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 12, "kind": "recap12", "cards": [
            ("Dynamic", "Closed, reversible, equal rates."),
            ("Oppose", "Shift counters the change."),
            ("Gas moles", "Higher P → fewer gas moles."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 13, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "define dynamic equilibrium"},
        {"slide": "aims", "item": "a2", "cue": "conditions it requires"},
        {"slide": "aims", "item": "a3", "cue": "concentration, temperature and pressure"},
        {"slide": "aims", "item": "a4", "cue": "Le Chatelier"},
        {"slide": "exam", "item": "a", "cue": "equal rates in a closed system"},
        {"slide": "exam", "item": "b", "cue": "two moles of gas against four"},
        {"slide": "exam", "item": "c", "cue": "product yield decreases"},
        {"slide": "exam", "item": "d", "cue": "products are favoured"},
        {"slide": "recap", "item": "r1", "cue": "Dynamic equilibrium is a closed reversible system"},
        {"slide": "recap", "item": "r2", "cue": "Le Chatelier’s principle predicts"},
        {"slide": "recap", "item": "r3", "cue": "concentration, temperature and pressure"},
    ],
    set(),
)

A12_6 = _lesson(
    "a12-6-haber-process",
    [
        {"id": "intro", "cue": "Hello and welcome back to JD Science", "page": 1, "kind": "intro"},
        {"id": "aims", "cue": "state typical Haber conditions", "page": 2, "kind": "aims12", "aims": [
            "State typical T, P and catalyst",
            "Explain the temperature compromise",
            "Explain the pressure compromise",
            "State what iron does and does not change",
        ]},
        {"id": "eq", "cue": "The equation is nitrogen plus three hydrogen", "page": 3, "kind": "haber_eq"},
        {"id": "cond", "cue": "Typical conditions in the lesson", "page": 4, "kind": "haber_cond"},
        {"id": "moles", "cue": "Count the gas moles", "page": 5, "kind": "haber_moles"},
        {"id": "temp", "cue": "Temperature is a compromise", "page": 6, "kind": "haber_temp"},
        {"id": "press", "cue": "Pressure is also a compromise", "page": 7, "kind": "haber_press"},
        {"id": "iron", "cue": "The iron catalyst provides an alternative pathway", "page": 8, "kind": "haber_iron"},
        {"id": "options", "cue": "Compare the options. Three hundred degrees", "page": 9, "kind": "haber_options"},
        {"id": "plantx", "cue": "Plant X is offered three hundred and fifty", "page": 10, "kind": "haber_plant"},
        {"id": "myths", "cue": "Correct the misconceptions", "page": 11, "kind": "myths12", "myths": [
            "Lowest T is not chosen — rate is too slow.",
            "Highest P is not chosen — cost and engineering.",
            "Iron does not increase equilibrium yield.",
            "Higher T lowers NH₃ equilibrium yield.",
        ]},
        {"id": "exam", "cue": "Examination-style question.", "page": 12, "kind": "exam12", "items": [
            ("a", "(a) Typical T, P and catalyst.  [3]"),
            ("b", "(b) Why not a lower temperature?  [3]"),
            ("c", "(c) Why higher pressure increases yield.  [2]"),
            ("d", "(d) Why industrial pressure is a compromise.  [3]"),
            ("e", "(e) What iron does.  [2]"),
        ], "answers": {
            "a": "~450 °C; ~200 atm; iron.",
            "b": "Higher yield but too slow / less economic.",
            "c": "2 vs 4 gas moles; shift toward NH₃.",
            "d": "Yield vs compression, equipment and cost.",
            "e": "Lower Ea; faster approach; position unchanged.",
        }},
        {"id": "recap", "cue": "Before we finish, complete the model", "page": 13, "kind": "recap12", "cards": [
            ("Conditions", "~450 °C, ~200 atm, iron."),
            ("Compromise", "Yield, rate and cost."),
            ("Iron", "Faster; yield at fixed T, P unchanged."),
        ]},
        {"id": "outro", "cue": "please subscribe to J D Science", "page": 14, "kind": "outro"},
    ],
    [
        {"slide": "aims", "item": "a1", "cue": "typical Haber conditions"},
        {"slide": "aims", "item": "a2", "cue": "economic effect"},
        {"slide": "aims", "item": "a3", "cue": "compromise between equilibrium yield"},
        {"slide": "aims", "item": "a4", "cue": "reaction rate"},
        {"slide": "exam", "item": "a", "cue": "four hundred and fifty degrees Celsius, about two hundred atmospheres, and iron"},
        {"slide": "exam", "item": "b", "cue": "the rate is lower"},
        {"slide": "exam", "item": "c", "cue": "two moles of gas against four"},
        {"slide": "exam", "item": "d", "cue": "balances yield against economic"},
        {"slide": "exam", "item": "e", "cue": "lower activation-energy pathway"},
        {"slide": "recap", "item": "r1", "cue": "about four hundred and fifty degrees Celsius and about two hundred atmospheres"},
        {"slide": "recap", "item": "r2", "cue": "compromises between yield, rate and cost"},
        {"slide": "recap", "item": "r3", "cue": "without changing the equilibrium yield"},
    ],
    set(),
)

A12_LESSON_MAP = {
    "a12-1-factors-affecting-rates": A12_1,
    "a12-2-calculating-rate": A12_2,
    "a12-3-enthalpy-changes": A12_3,
    "a12-4-industrial-catalysts": A12_4,
    "a12-5-reversible-reactions": A12_5,
    "a12-6-haber-process": A12_6,
}
