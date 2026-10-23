"""On-screen lesson objectives and YouTube copy. Spoken scripts stay in scripts_text.py."""

from __future__ import annotations

OBJECTIVES: dict[int, tuple[str, ...]] = {
    1: (
        "Name the eight energy stores used in GCSE Physics",
        "Explain the four transfer pathways",
        "Describe energy changes using stores and pathways",
    ),
    2: (
        "Explain how an object gains gravitational potential energy",
        "Use ΔEₚ = m g Δh with the correct units",
        "Calculate a change in GPE in an exam-style question",
    ),
    3: (
        "Define kinetic energy and use Eₖ = ½ m v²",
        "Explain why kinetic energy depends on speed squared",
        "Calculate kinetic energy and scale it when speed changes",
    ),
    4: (
        "Define a system and track energy stores within it",
        "Describe transfers for a thrown ball, skier and braking lorry",
        "Convert between joules, kilojoules and megajoules",
    ),
    5: (
        "State conservation of energy in a closed system",
        "Distinguish useful, wasted and dissipated energy",
        "Calculate energy dissipated to the surroundings",
    ),
    6: (
        "Define efficiency as useful output divided by total input",
        "Calculate efficiency as a decimal and as a percentage",
        "Explain why real devices are less than 100% efficient",
    ),
    7: (
        "Identify unwanted energy transfers in machines and buildings",
        "Explain lubrication, streamlining and insulation",
        "Describe how cavity wall insulation reduces the rate of transfer",
    ),
    8: (
        "Define thermal conductivity and its unit",
        "Compare insulating materials using a conductivity table",
        "Explain loft insulation, trapped air and thickness",
    ),
    9: (
        "Define a non-renewable energy resource",
        "Compare coal, oil, natural gas and nuclear fuel",
        "Evaluate advantages and disadvantages with evidence",
    ),
    10: (
        "Define a renewable energy resource",
        "Explain solar, wind, hydroelectric, tidal and biomass transfers",
        "Give a balanced comparison, including limitations",
    ),
    11: (
        "Explain energy security and reliability",
        "Describe why countries use an energy mix",
        "Apply these ideas to weather-dependent generation",
    ),
    12: (
        "Describe long-term trends in energy demand",
        "Read graphs using the correct energy measure",
        "Explain changing use of renewable and non-renewable resources",
    ),
}

YOUTUBE: dict[int, dict[str, object]] = {
    1: {
        "title": "Energy Stores and Pathways | GCSE Physics Conservation of Energy",
        "thumbnail": "8 ENERGY STORES",
        "keywords": [
            "GCSE Physics", "conservation of energy", "energy stores", "energy pathways",
            "kinetic energy store", "gravitational potential energy", "AQA Physics",
            "Edexcel Physics", "OCR Physics", "JD Science",
        ],
        "description": "Identify the eight energy stores and the four transfer pathways used in GCSE Physics, then apply store-and-pathway language to exam-style questions.",
    },
    2: {
        "title": "Gravitational Potential Energy (GPE) | GCSE Physics Calculations",
        "thumbnail": "ΔEₚ = mgΔh",
        "keywords": [
            "GCSE Physics", "gravitational potential energy", "GPE", "mgh",
            "energy calculations", "conservation of energy", "AQA Physics", "JD Science",
        ],
        "description": "Learn how an object gains gravitational potential energy and practise ΔEₚ = m g Δh with units, substitution and GCSE-style working.",
    },
    3: {
        "title": "Kinetic Energy and Speed Squared | GCSE Physics Calculations",
        "thumbnail": "Eₖ = ½mv²",
        "keywords": [
            "GCSE Physics", "kinetic energy", "1/2 mv^2", "speed squared",
            "energy calculations", "AQA Physics", "JD Science",
        ],
        "description": "Use Eₖ = ½ m v², see why doubling speed multiplies kinetic energy by four, and work through GCSE calculation questions.",
    },
    4: {
        "title": "Energy Stores and Systems | GCSE Physics Conservation of Energy",
        "thumbnail": "TRACK THE SYSTEM",
        "keywords": [
            "GCSE Physics", "energy stores", "systems", "conservation of energy",
            "braking", "gravitational potential energy", "kinetic energy", "JD Science",
        ],
        "description": "Track energy stores inside a system using a thrown ball, a skier and a braking lorry, and describe transfers in GCSE answers.",
    },
    5: {
        "title": "Conservation of Energy and Dissipation | GCSE Physics",
        "thumbnail": "NOT DESTROYED",
        "keywords": [
            "GCSE Physics", "conservation of energy", "closed system", "dissipated energy",
            "wasted energy", "Sankey", "AQA Physics", "JD Science",
        ],
        "description": "State conservation of energy, distinguish useful and dissipated energy, and calculate energy transferred to the surroundings.",
    },
    6: {
        "title": "Energy Efficiency Calculations | GCSE Physics",
        "thumbnail": "EFFICIENCY %",
        "keywords": [
            "GCSE Physics", "efficiency", "useful energy output", "percentage efficiency",
            "wind turbine", "electric motor", "AQA Physics", "JD Science",
        ],
        "description": "Define efficiency, calculate it as a decimal and a percentage, and explain why real devices transfer some energy to unwanted stores.",
    },
    7: {
        "title": "Reducing Unwanted Energy Transfers | GCSE Physics Insulation",
        "thumbnail": "REDUCE LOSSES",
        "keywords": [
            "GCSE Physics", "unwanted energy transfers", "lubrication", "streamlining",
            "cavity wall insulation", "thermal insulation", "AQA Physics", "JD Science",
        ],
        "description": "Identify unwanted energy transfers and explain how lubrication, streamlining and insulation reduce the rate of energy transfer.",
    },
    8: {
        "title": "Thermal Conductivity and Insulation | GCSE Physics",
        "thumbnail": "LOW k INSULATES",
        "keywords": [
            "GCSE Physics", "thermal conductivity", "insulation", "loft insulation",
            "trapped air", "conduction", "AQA Physics", "JD Science",
        ],
        "description": "Compare thermal conductivities, explain why trapped air insulates, and apply the ideas to loft and wall insulation questions.",
    },
    9: {
        "title": "Non-Renewable Energy Resources | GCSE Physics",
        "thumbnail": "FINITE FUELS",
        "keywords": [
            "GCSE Physics", "non-renewable energy", "fossil fuels", "coal oil gas",
            "nuclear power", "carbon dioxide", "AQA Physics", "JD Science",
        ],
        "description": "Compare coal, oil, natural gas and nuclear fuel, including climate impact, reliability and why they are classified as non-renewable.",
    },
    10: {
        "title": "Renewable Energy Resources | GCSE Physics",
        "thumbnail": "SOLAR WIND HYDRO",
        "keywords": [
            "GCSE Physics", "renewable energy", "solar photovoltaic", "wind turbine",
            "hydroelectric", "tidal", "biomass", "AQA Physics", "JD Science",
        ],
        "description": "Explain solar, wind, hydroelectric, tidal and biomass energy transfers, and give balanced GCSE comparisons of their limitations.",
    },
    11: {
        "title": "Energy Security and Reliability | GCSE Physics Energy Mix",
        "thumbnail": "ENERGY MIX",
        "keywords": [
            "GCSE Physics", "energy security", "reliability", "energy mix",
            "renewable energy", "national grid", "AQA Physics", "JD Science",
        ],
        "description": "Explain energy security and reliability, and why a mix of resources, storage and interconnectors helps keep electricity available.",
    },
    12: {
        "title": "Trends in Energy Use | GCSE Physics Graph Skills",
        "thumbnail": "READ THE GRAPH",
        "keywords": [
            "GCSE Physics", "energy demand", "renewable energy trends", "graph skills",
            "primary energy", "electricity generation", "AQA Physics", "JD Science",
        ],
        "description": "Interpret energy-demand and generation graphs, distinguish electricity from total energy use, and explain changing resource mixes.",
    },
}


def youtube_description(n: int) -> str:
    info = YOUTUBE[n]
    keywords = ", ".join(info["keywords"])
    return (
        f"{info['description']}\n\n"
        "This is part of the JD Science GCSE Physics series on Conservation of Energy.\n\n"
        "Learning objectives:\n"
        + "".join(f"• {item}\n" for item in OBJECTIVES[n])
        + "\n"
        "Revision notes, worksheets and further lessons: https://www.jdscience.co.uk\n"
        "Subscribe to JD Science for clear GCSE Physics explanations, worked examples and exam technique.\n\n"
        f"Keywords: {keywords}\n"
    )
