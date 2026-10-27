"""Frame renderer for the JD Science conservation-of-energy videos."""

from __future__ import annotations

import math

from PIL import Image, ImageDraw

from .scenes import Scene
from .ui import (
    AMBER,
    BG,
    BLUE,
    CORAL,
    GOLD,
    GREEN,
    H,
    INK,
    LINE,
    MUTED,
    NAVY_CARD,
    NAVY_DEEP,
    NAVY_ROW,
    PURPLE,
    RED,
    STORE_COLORS,
    TEAL,
    TEAL_BAR,
    TEAL_MID,
    W,
    WHITE,
    arrow,
    car,
    card,
    chrome,
    countdown as draw_countdown,
    flask,
    flow_dots,
    font,
    heading,
    logo,
    meter,
    nucleus,
    pill,
    pointer,
    rounded,
    spring,
    sun,
    text_width,
    turbine,
    wheel,
    wrap,
)

LEAD = 0.05


class View:
    def __init__(self, scene: Scene, t: float, words, flag_times, countdown, progress):
        self.scene = scene
        self.t = t
        self.words = words
        self.flag_times = flag_times
        self.countdown = countdown
        self.progress = progress
        self.hotspot = None

    def on(self, flag: str) -> bool:
        return any(ts <= self.t + LEAD for ts in self.flag_times.get(flag, []))

    def active(self) -> str | None:
        best, best_t = None, -1.0
        for flag, times in self.flag_times.items():
            for ts in times:
                if ts <= self.t + LEAD and ts >= best_t:
                    best, best_t = flag, ts
        return best

    def since(self, flag: str) -> float | None:
        times = [ts for ts in self.flag_times.get(flag, []) if ts <= self.t + LEAD]
        if not times:
            return None
        return self.t - max(times)


def _clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def _ease(u):
    u = _clamp(u)
    return u * u * (3 - 2 * u)


# Phrase cues. A flag turns on when the phrase is spoken in that scene.
CUES: dict[str, list[tuple[str, str]]] = {
    "stores": [
        ("cannot be created", "conserve"),
        ("chemical", "chemical"),
        ("kinetic", "kinetic"),
        ("gravitational potential", "gpe"),
        ("elastic potential", "elastic"),
        ("thermal", "internal"),
        ("magnetic", "magnetic"),
        ("electrostatic", "electrostatic"),
        ("nuclear", "nuclear"),
    ],
    "pathways": [
        ("mechanically", "mechanical"),
        ("electrically", "electrical"),
        ("by heating", "heating"),
        ("by radiation", "radiation"),
        ("light and sound", "notstore"),
        ("initial store", "method"),
    ],
    "toycar": [
        ("chemical energy store decreases", "chemical"),
        ("transferred electrically", "electrical"),
        ("then mechanically", "mechanical"),
        ("kinetic energy store", "kinetic"),
        ("internal energy stores", "internal"),
        ("carried away by sound", "sound"),
        ("not disappeared", "conserved"),
    ],
    "catapult": [
        ("elastic band", "band"),
        ("elastic potential energy store", "elastic"),
        ("transfers energy mechanically", "mechanical"),
        ("kinetic energy store", "kinetic"),
        ("transferred to the surroundings", "loss"),
    ],
    "gpe": [
        ("lift an object", "lift"),
        ("object falls", "fall"),
        ("the equation is", "equation"),
        ("in symbols", "symbols"),
        ("measured in kilograms", "units"),
    ],
    "gpe_method": [
        ("write the equation", "step1"),
        ("vertical change in height", "vertical"),
        ("divide by one thousand", "grams"),
        ("supplied in the question", "given"),
        ("9.8 newtons", "earth"),
    ],
    "piledriver": [
        ("120 kilograms", "mass"),
        ("four metres", "height"),
        ("ten newtons per kilogram", "g"),
        ("120 multiplied", "sub"),
        ("4,800 joules", "result"),
    ],
    "bag": [
        ("two-kilogram", "mass"),
        ("three metres", "height"),
        ("ten newtons per kilogram", "g"),
        ("two multiplied", "sub"),
        ("60 joules", "result"),
    ],
    "crane": [
        ("500-kilogram", "mass"),
        ("20 metres", "height"),
        ("ten newtons per kilogram", "g"),
        ("m g delta h", "equation"),
        ("100,000 joules", "result"),
    ],
    "ke": [
        ("because it is moving", "define"),
        ("one half multiplied", "equation"),
        ("in symbols", "symbols"),
        ("in kilograms", "units"),
        ("represents speed", "speed"),
    ],
    "ke_square": [
        ("square on the speed", "square"),
        ("speed doubles", "double"),
        ("four times", "four"),
        ("speed triples", "triple"),
        ("nine times", "nine"),
        ("doubling the mass", "mass"),
        ("vehicle stops", "road"),
    ],
    "ke_car": [
        ("first square the speed", "method"),
        ("1,200 kilograms", "mass"),
        ("20 metres per second", "speed"),
        ("Twenty squared", "square"),
        ("480,000", "product"),
        ("240,000 joules", "result"),
    ],
    "ball_ke": [
        ("0.15 kilograms", "mass"),
        ("eight metres per second", "speed"),
        ("Eight squared", "square"),
        ("9.6", "mid"),
        ("4.8 joules", "result"),
        ("common errors", "errors"),
    ],
    "cycle": [
        ("80 kilograms", "mass"),
        ("six metres per second", "speed"),
        ("1,440 joules", "result"),
        ("speed doubles", "double"),
        ("four times", "four"),
    ],
    "system": [
        ("group of objects", "system"),
        ("does not vanish", "conserved"),
        ("helpful method", "method"),
        ("one kilojoule", "kilo"),
        ("consistent units", "units"),
    ],
    "ballpath": [
        ("immediately after release", "release"),
        ("As it rises", "rises"),
        ("highest point", "top"),
        ("As it falls", "falls"),
        ("negligible", "ideal"),
        ("In reality", "real"),
    ],
    "skier": [
        ("top of a slope", "top"),
        ("gravitational potential energy relative", "gpe"),
        ("transfers energy mechanically", "mechanical"),
        ("increasing the kinetic", "kinetic"),
        ("Friction and air resistance", "friction"),
        ("Sound can carry", "sound"),
    ],
    "lorry": [
        ("kinetic energy store decreases", "kinetic"),
        ("Friction at the brakes", "brakes"),
        ("become hotter", "hot"),
        ("to the surroundings", "surroundings"),
    ],
    "closed": [
        ("cannot be created", "conserve"),
        ("mechanical work", "paths"),
        ("In a closed system", "closed"),
        ("not matter", "thermo"),
        ("isolated system", "isolated"),
    ],
    "dissipated": [
        ("useful and less useful", "split"),
        ("wasted or dissipated", "wasted"),
        ("not been destroyed", "kept"),
        ("total energy output", "balance"),
    ],
    "sankey": [
        ("100 joules", "input"),
        ("45 joules", "light"),
        ("36 joules", "sound"),
        ("81 joules", "useful"),
        ("19 joules", "waste"),
        ("mobile phone", "phone"),
    ],
    "kettle": [
        ("2,000 joules", "input"),
        ("1,800 joules", "water"),
        ("200 joules", "rest"),
        ("not vanished", "kept"),
    ],
    "fan": [
        ("300 joules", "input"),
        ("180 joules", "useful"),
        ("90 joules", "heat"),
        ("30 joules", "sound"),
        ("energy is conserved", "kept"),
    ],
    "efficiency": [
        ("useful energy output", "equation"),
        ("by one hundred", "percent"),
        ("useful power output", "power"),
        ("do not mix", "mix"),
    ],
    "eff_loss": [
        ("perfectly efficient", "perfect"),
        ("unwanted stores", "unwanted"),
        ("friction and electrical resistance", "causes"),
        ("cannot exceed one", "limit"),
    ],
    "wind": [
        ("500 megawatts", "input"),
        ("120 megawatts", "useful"),
        ("obtain 0.24", "decimal"),
        ("24 per cent", "percent"),
        ("measure power", "power"),
    ],
    "lamp": [
        ("60 joules", "input"),
        ("12 joules", "light"),
        ("equals 0.2", "decimal"),
        ("20 per cent", "percent"),
        ("80 per cent", "rest"),
    ],
    "motor": [
        ("800 joules", "input"),
        ("560 joules", "useful"),
        ("equals 0.7", "decimal"),
        ("70 per cent", "percent"),
        ("friction or electrical", "why"),
    ],
    "unwanted": [
        ("Friction between moving", "friction"),
        ("Electrical resistance", "resistance"),
        ("Warm buildings", "buildings"),
        ("by sound", "sound"),
    ],
    "methods": [
        ("Lubrication forms", "lubrication"),
        ("Streamlining", "stream"),
        ("Thermal insulation reduces", "insulation"),
        ("lower-resistance", "wires"),
    ],
    "engine": [
        ("Without adequate lubrication", "dry"),
        ("Engine oil", "oil"),
        ("improve efficiency", "better"),
    ],
    "bike": [
        ("friction in its moving", "friction"),
        ("air resistance", "air"),
        ("Lubricating moving parts", "lube"),
        ("Streamlined bodywork", "stream"),
    ],
    "cavity": [
        ("low thermal conductivity", "slow"),
        ("traps air", "air"),
        ("each second", "rate"),
    ],
    "conductivity": [
        ("conducts thermal energy", "define"),
        ("per kelvin", "unit"),
        ("degree Celsius", "celsius"),
        ("lower the thermal conductivity", "lower"),
    ],
    "cond_bars": [
        ("around 0.03", "air"),
        ("fibreglass around", "fibreglass"),
        ("wool felt", "wool"),
        ("wood around", "wood"),
        ("plaster around", "plaster"),
        ("glass around", "glass"),
        ("brick around", "brick"),
        ("concrete around", "concrete"),
        ("useful for insulation", "use"),
    ],
    "cond_factors": [
        ("thickness, area", "factors"),
        ("Thicker insulation", "thicker"),
        ("Double glazing", "glazing"),
        ("Loft insulation", "loft"),
    ],
    "brick": [
        ("conductivity of 1.00", "brick"),
        ("fibreglass has 0.04", "fibreglass"),
        ("gives 25", "ratio"),
        ("25 times greater", "greater"),
        ("25 times better", "careful"),
    ],
    "wood": [
        ("wood or plaster", "ask"),
        ("0.15 compared", "values"),
        ("approximately 3.3", "ratio"),
        ("same thickness", "same"),
    ],
    "loft": [
        ("wool felt has", "wool"),
        ("trapping the air", "air"),
    ],
    "finite": [
        ("used faster", "define"),
        ("fossil fuels", "fossil"),
        ("chemical stores", "chemical"),
        ("nuclear fission", "fission"),
    ],
    "coal": [
        ("Coal is mined", "mined"),
        ("controllable electricity", "control"),
        ("carbon dioxide", "co2"),
        ("sulfur dioxide", "pollution"),
    ],
    "oilgas": [
        ("Oil is extracted", "oil"),
        ("high energy density", "density"),
        ("Natural gas is extracted", "gas"),
        ("Methane leakage", "methane"),
    ],
    "nuclear": [
        ("controlled fission", "fission"),
        ("very low direct carbon dioxide", "low"),
        ("radioactive waste", "waste"),
        ("resource infinite", "finite"),
    ],
    "compare_fuels": [
        ("less carbon dioxide than coal", "less"),
        ("both are finite", "finite"),
        ("completely clean", "clean"),
    ],
    "oil": [
        ("advantage and one disadvantage", "ask"),
        ("high-energy-density", "pro"),
        ("releases carbon dioxide", "con"),
        ("impact of spills", "spills"),
    ],
    "renewable": [
        ("replenished naturally", "define"),
        ("environmental impacts", "impact"),
        ("how energy is transferred", "how"),
    ],
    "solarwind": [
        ("photovoltaic panels", "pv"),
        ("daylight, weather", "varies"),
        ("Solar thermal", "thermal"),
        ("Wind turbines", "wind"),
        ("landscapes and wildlife", "impact"),
    ],
    "tidalhydro": [
        ("water stored at height", "hydro"),
        ("electrically through a generator", "gen"),
        ("flood habitats", "flood"),
        ("Tidal systems", "tidal"),
        ("marine ecosystems", "marine"),
    ],
    "biomass": [
        ("organic material", "what"),
        ("biofuels", "fuel"),
        ("carbon-neutral", "neutral"),
        ("food production", "food"),
    ],
    "hydro": [
        ("high reservoir", "store"),
        ("flowing water increases", "kinetic"),
        ("mechanical work on a turbine", "mech"),
        ("electrically to the grid", "grid"),
        ("friction and other losses", "loss"),
    ],
    "solar": [
        ("generates electricity", "ask"),
        ("electromagnetic radiation", "radiation"),
        ("into electrical energy", "electrical"),
    ],
    "security": [
        ("Energy security means", "security"),
        ("Reliability describes", "reliability"),
        ("imported fuel", "import"),
        ("other generation", "system"),
    ],
    "reliability": [
        ("immediate weather", "firm"),
        ("Wind and solar", "variable"),
        ("reservoirs can make", "hydro"),
        ("highly predictable", "tidal"),
    ],
    "mix": [
        ("energy mix means", "mix"),
        ("gas prices rise", "shock"),
        ("Energy storage", "tools"),
        ("most secure mix", "depends"),
        ("rather than relying entirely on coal", "coal"),
        ("other resources can continue", "resilient"),
    ],
    "town": [
        ("entirely by wind", "only"),
        ("calm day", "calm"),
        ("battery storage", "mix"),
        ("whole system", "system"),
    ],
    "solar_supply": [
        ("without storage or backup", "ask"),
        ("at night", "night"),
        ("cloudy periods", "cloud"),
        ("therefore needed", "backup"),
    ],
    "demand": [
        ("generally increased", "up"),
        ("Population growth", "people"),
        ("Economic development", "economy"),
        ("slow demand", "slow"),
        ("always increases everywhere", "caution"),
        ("Two valid factors", "answer"),
    ],
    "measures": [
        ("grown strongly", "grown"),
        ("only one part", "part"),
        ("primary energy", "primary"),
        ("not interchangeable", "no"),
        ("twenty per cent", "claim"),
        ("examination source", "source"),
    ],
    "graph": [
        ("the title", "title"),
        ("axes", "axes"),
        ("units", "units"),
        ("dates", "dates"),
        ("and key", "key"),
        ("increases, decreases", "pattern"),
        ("quote relevant", "quote"),
        ("justified scientific", "why"),
        ("Do not invent", "invent"),
    ],
    "graph_example": [
        ("suppose a graph", "show"),
        ("demand rose", "rise"),
        ("sudden fall", "fall"),
        ("perfectly smooth", "smooth"),
        ("wood-based biomass", "biomass"),
        ("wind power output", "wind"),
    ],
    "tea": [
        ("hot cup of tea", "cup"),
        ("by heating", "heating"),
        ("store decreases", "down"),
        ("surroundings increases", "up"),
    ],
}


ROWS: dict[str, list[tuple[str, str, str]]] = {
    "gpe_method": [
        ("step1", "1  Write, substitute, calculate", "Then state the answer with its unit."),
        ("vertical", "Use vertical height", "Not the distance along a slope."),
        ("grams", "Convert grams to kilograms", "Divide the mass by 1,000."),
        ("given", "Use the g value in the question", "Often 10 N/kg at GCSE."),
        ("earth", "Near Earth, g ≈ 9.8 N/kg", "Only use 9.8 if the question says so."),
    ],
    "system": [
        ("system", "Define the system", "The object or group of objects you are considering."),
        ("conserved", "Energy is conserved", "It is transferred; it does not vanish."),
        ("method", "A useful order", "System, initial store, pathway, store that increases."),
        ("kilo", "Prefixes", "1 kJ = 1,000 J.    1 MJ = 1,000,000 J."),
        ("units", "Compare like with like", "Convert to consistent units first."),
    ],
    "closed": [
        ("conserve", "Energy is conserved", "It can be transferred, not created or destroyed."),
        ("paths", "Four pathways", "Mechanical work, electrical work, heating, radiation."),
        ("closed", "GCSE closed system", "No energy enters or leaves, so the total stays constant."),
        ("thermo", "A different technical meaning", "In thermodynamics, closed can still mean energy is exchanged."),
        ("isolated", "Isolated system", "The precise term when no energy crosses the boundary."),
    ],
    "dissipated": [
        ("split", "Useful and less useful", "Devices transfer energy into both."),
        ("wasted", "Dissipated does not mean destroyed", "It is spread into surroundings."),
        ("kept", "Harder to use", "The intended store does not receive all of the input."),
        ("balance", "Input equals output", "When every transfer is counted."),
    ],
    "efficiency": [
        ("equation", "Efficiency", "Useful energy output ÷ total energy input."),
        ("percent", "As a percentage", "Multiply the decimal by 100."),
        ("power", "Power form", "Useful power output ÷ total power input."),
        ("mix", "Do not mix quantities", "Use energy with energy, or power with power."),
    ],
    "eff_loss": [
        ("perfect", "100% would mean", "Every joule of input is transferred usefully."),
        ("unwanted", "Real devices", "Some energy reaches unwanted stores."),
        ("causes", "Friction and resistance", "Both can increase internal energy stores."),
        ("limit", "Efficiency ≤ 1", "It cannot exceed 100% if the quantities are defined correctly."),
    ],
    "unwanted": [
        ("friction", "Friction", "Moving parts gain internal energy."),
        ("resistance", "Electrical resistance", "Wires and components warm up."),
        ("buildings", "Warm buildings", "Energy is transferred to cooler surroundings."),
        ("sound", "Sound", "Unwanted sound is another dissipated transfer."),
    ],
    "methods": [
        ("lubrication", "Lubrication", "A layer between surfaces reduces friction."),
        ("stream", "Streamlining", "Reduces air resistance, a force opposing motion."),
        ("insulation", "Thermal insulation", "Reduces the rate of energy transfer."),
        ("wires", "Lower resistance", "Less heating for a given current. Cost and safety still matter."),
    ],
    "conductivity": [
        ("define", "Thermal conductivity", "How readily a material conducts thermal energy."),
        ("unit", "SI unit", "Watts per metre per kelvin, W/(m·K)."),
        ("celsius", "1 K = 1 °C in size", "Some tables use degrees Celsius for the same difference."),
        ("lower", "Lower conductivity", "Better at resisting conduction, if thickness and conditions match."),
    ],
    "cond_factors": [
        ("factors", "Four things matter", "Material, thickness, area and temperature difference."),
        ("thicker", "Thicker insulation", "Generally reduces the rate of transfer."),
        ("glazing", "Double glazing", "A gas gap reduces conduction and suppresses convection."),
        ("loft", "Loft insulation", "Reduces energy transfer through the roof."),
    ],
    "finite": [
        ("define", "Non-renewable", "Used faster than it is replaced on human timescales."),
        ("fossil", "Coal, oil and natural gas", "Formed from ancient organic material over millions of years."),
        ("chemical", "Burning releases a chemical store", "The fuel is extracted and then burnt."),
        ("fission", "Nuclear fuel is also finite", "Energy is released by fission, not by burning."),
    ],
    "coal": [
        ("mined", "Coal-fired generation", "Burning heats water. Steam turns a turbine and generator."),
        ("control", "Controllable output", "Historically used to generate electricity when it was needed."),
        ("co2", "Carbon dioxide", "Contributes to climate change."),
        ("pollution", "Other pollutants", "Sulfur dioxide and particulates may also be released."),
    ],
    "oilgas": [
        ("oil", "Oil", "Refined into petrol, diesel and aviation fuel."),
        ("density", "Why it is useful", "High energy density, and relatively easy to store and transport."),
        ("gas", "Natural gas", "Used for heating, industry and electricity. Less CO₂ per unit than coal."),
        ("methane", "Still a fossil fuel", "Methane leakage is an extra environmental concern."),
    ],
    "nuclear": [
        ("fission", "Controlled fission", "The energy heats a coolant. Steam drives the turbines."),
        ("low", "Low direct CO₂", "During operation, and it can supply a large controllable output."),
        ("waste", "The difficult parts", "Cost, decommissioning, radioactive waste and safety systems."),
        ("finite", "High energy density ≠ renewable", "A small mass releases a lot of energy. The fuel is still finite."),
    ],
    "compare_fuels": [
        ("less", "Gas usually emits less CO₂", "Than coal, for the same electrical output."),
        ("finite", "Both are finite", "And both contribute to greenhouse gas emissions."),
        ("clean", "Do not call either clean", "Compare cost, reliability, pollution and climate impact."),
    ],
    "renewable": [
        ("define", "Renewable", "Replenished naturally on human timescales."),
        ("impact", "Not impact-free", "They can still affect environments and need infrastructure."),
        ("how", "How to compare them", "Transfer, usefulness and the limits on use."),
    ],
    "solarwind": [
        ("pv", "Solar photovoltaic", "Sunlight is transferred by radiation and partly becomes electricity."),
        ("varies", "Output varies", "Daylight, weather, location and season."),
        ("thermal", "Solar thermal is different", "It uses sunlight to heat water."),
        ("wind", "Wind turbines", "The kinetic store of moving air turns a generator."),
        ("impact", "Limits", "Variable output, landscapes and wildlife."),
    ],
    "tidalhydro": [
        ("hydro", "Hydroelectric", "A gravitational store at height becomes a kinetic store as water descends."),
        ("gen", "Then electrical", "The generator transfers energy to the grid."),
        ("flood", "Reservoir limits", "Dams can be costly and may flood habitats or settlements."),
        ("tidal", "Tidal", "Predictable movement of seawater. Barrages or tidal-stream turbines."),
        ("marine", "Limited sites", "Suitable locations are few, and marine ecosystems may be affected."),
    ],
    "biomass": [
        ("what", "What biomass is", "Wood, agricultural residues or specially grown crops."),
        ("fuel", "How it is used", "Burnt for heat or electricity, or processed into biofuels."),
        ("neutral", "Not automatically carbon-neutral", "Renewable only when harvest and regrowth are responsible."),
        ("food", "Life-cycle impacts", "Emissions, land-use change and competition with food."),
    ],
    "security": [
        ("security", "Energy security", "Enough energy, at an affordable cost, when it is needed."),
        ("reliability", "Reliability", "How consistently a source or system delivers."),
        ("import", "Controllable is not the same as secure", "A station can still depend on imported fuel."),
        ("system", "Variable resources can still help", "With storage, transmission and other generation."),
    ],
    "reliability": [
        ("firm", "Gas and nuclear", "Not controlled by the immediate weather. They still need fuel and maintenance."),
        ("variable", "Wind and solar", "Output depends on weather and time of day."),
        ("hydro", "Hydroelectric", "Depends on water, but reservoirs make it more controllable."),
        ("tidal", "Tidal", "Variable, but highly predictable because tides can be forecast."),
    ],
    "measures": [
        ("grown", "Renewable electricity has grown", "In many countries. Electricity is only part of energy use."),
        ("part", "Other demand", "Transport, heating and industry also consume energy."),
        ("primary", "Check the measure", "Primary energy, final consumption, or electricity generation."),
        ("no", "Not interchangeable", "A percentage for one measure is not a percentage for another."),
        ("claim", "Avoid undated claims", "Such as a single figure for 'all energy'."),
        ("source", "Use the paper in front of you", "The definition, country and year decide the answer."),
    ],
    "demand": [
        ("up", "Demand has generally risen", "Growth still varies by country and year."),
        ("people", "Population", "More people need transport, heating, cooling, industry and electricity."),
        ("economy", "Economic development", "More appliances and technology can raise use per person."),
        ("slow", "Demand can also slow", "Efficiency, industry change and policy."),
        ("caution", "Do not oversimplify", "Energy use per person does not always rise everywhere."),
        ("answer", "Two valid factors", "Population growth, and energy use linked to economic development."),
    ],
    "oil": [
        ("ask", "Oil", "Name one advantage and one disadvantage."),
        ("pro", "Advantage", "High-energy-density transport fuels that store and travel well."),
        ("con", "Disadvantage", "Burning oil releases carbon dioxide."),
        ("spills", "Also credit", "A finite supply, or the damage caused by spills."),
    ],
    "bike": [
        ("friction", "Friction in moving parts", "Transfers energy into internal stores."),
        ("air", "Air resistance", "Another force opposing motion."),
        ("lube", "Lubricate the parts", "Reduces friction."),
        ("stream", "Streamline the bodywork", "Reduces drag, so more input can do useful work."),
    ],
}


def _row_block(d, box, view, rows):
    x0, y0, x1, y1 = box
    shown = [row for row in rows if view.on(row[0])]
    if not shown:
        return
    gap = 12
    n = len(rows)
    h = min(108, (y1 - y0 - gap * (n - 1)) / max(n, 1))
    act = view.active()
    for i, (flag, title, detail) in enumerate(rows):
        if not view.on(flag):
            continue
        y = y0 + i * (h + gap)
        active = flag == act
        card(d, (x0, y, x1, y + h), accent=GOLD if active else TEAL, outline=GOLD if active else None)
        d.text((x0 + 36, y + 18), title, font=font("bold", 26), fill=WHITE)
        d.text((x0 + 36, y + 56), detail, font=font("regular", 22), fill=MUTED)
        if active:
            view.hotspot = (x0 + 12, y + h / 2)


def _equation(d, x, y, text, size=48, fill=WHITE, anchor="lm"):
    d.text((x, y), text, font=font("bold", size), fill=fill, anchor=anchor)


def _stack(d, box, view, lines):
    """lines: (flag, text, size)."""
    x0, y0, x1, y1 = box
    y = y0 + 8
    act = view.active()
    for flag, text, size in lines:
        if not view.on(flag):
            continue
        active = flag == act
        card(d, (x0, y, x1, y + size + 36), accent=GOLD if active else TEAL, outline=GOLD if active else None)
        d.text((x0 + 28, y + (size + 36) / 2), text, font=font("bold", size), fill=WHITE, anchor="lm")
        if active:
            view.hotspot = (x0 + 14, y + (size + 28) / 2)
        y += size + 50
        if y > y1 - 20:
            break


def _ground(d, x0, x1, y):
    d.line((x0, y, x1, y), fill=MUTED, width=4)
    for x in range(int(x0), int(x1), 18):
        d.line((x, y, x - 10, y + 12), fill=MUTED, width=2)


def _mass(d, cx, cy, label, w=86, h=64):
    rounded(d, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 10, TEAL_MID, TEAL_BAR, 3)
    d.text((cx, cy), label, font=font("bold", 22), fill=WHITE, anchor="mm")


def _lift_art(d, box, view, spec):
    x0, y0, x1, y1 = box
    ground_y = y1 - 36
    _ground(d, x0 + 30, x0 + 280, ground_y)
    lift_u = 0.08
    if view.on("lift") or view.on("height") or view.on("mass"):
        lift_u = 0.78
    if view.on("fall"):
        since = view.since("fall") or 0
        lift_u = 0.78 - 0.62 * _ease(since / 1.3)
    elif view.on("lift"):
        since = view.since("lift") or 0
        lift_u = 0.08 + 0.70 * _ease(since / 1.3)
    top = ground_y - 70
    travel = (ground_y - 80) - (y0 + 70)
    cy = ground_y - 40 - lift_u * (ground_y - y0 - 150)
    cx = x0 + 150
    _mass(d, cx, cy, spec.get("label", "m"))
    d.line((x0 + 250, ground_y, x0 + 250, cy), fill=GOLD, width=3)
    d.text((x0 + 270, (ground_y + cy) / 2), spec.get("h", "Δh"), font=font("bold", 22), fill=GOLD, anchor="lm")
    if view.on("result"):
        d.text((cx, cy - 58), spec["result"], font=font("bold", 28), fill=GOLD, anchor="mm")
        view.hotspot = (cx, cy - 58)


def _draw_stores(d, box, view):
    x0, y0, x1, y1 = box
    if view.on("conserve"):
        d.text((x0, y0), "Energy cannot be created or destroyed.", font=font("bold", 28), fill=WHITE)
        d.text((x0, y0 + 38), "It is transferred between stores. The total is conserved.", font=font("regular", 22), fill=MUTED)
    items = [
        ("chemical", "Chemical", "Food, fuels, batteries"),
        ("kinetic", "Kinetic", "Moving objects"),
        ("gpe", "Gravitational", "Raised objects"),
        ("elastic", "Elastic", "Stretched or compressed"),
        ("internal", "Thermal / internal", "Temperature or state"),
        ("magnetic", "Magnetic", "Magnetic fields"),
        ("electrostatic", "Electrostatic", "Electric fields"),
        ("nuclear", "Nuclear", "Atomic nuclei"),
    ]
    gap = 16
    cols = 4
    top = y0 + 100
    cw = (x1 - x0 - gap * (cols - 1)) / cols
    ch = min(180, (y1 - top - gap) / 2)
    act = view.active()
    for i, (flag, title, detail) in enumerate(items):
        if not view.on(flag):
            continue
        r, c = divmod(i, cols)
        x = x0 + c * (cw + gap)
        y = top + r * (ch + gap)
        active = flag == act
        color = STORE_COLORS[flag]
        card(d, (x, y, x + cw, y + ch), accent=color, outline=GOLD if active else None, width=3)
        d.ellipse((x + 28, y + 28, x + 78, y + 78), fill=color)
        d.text((x + 108, y + 42), title, font=font("bold", 26), fill=WHITE, anchor="lm")
        d.text((x + 28, y + 110), detail, font=font("regular", 20), fill=MUTED)
        if active:
            view.hotspot = (x + 18, y + ch / 2)


def _draw_pathways(d, box, view):
    x0, y0, x1, y1 = box
    items = [
        ("mechanical", "Mechanically", "A force does work"),
        ("electrical", "Electrically", "Charges move through a p.d."),
        ("heating", "By heating", "Because of a temperature difference"),
        ("radiation", "By radiation", "Electromagnetic waves and sound"),
    ]
    gap = 18
    cw = (x1 - x0 - gap * 3) / 4
    ch = 230
    y = y0 + 20
    act = view.active()
    for i, (flag, title, detail) in enumerate(items):
        if not view.on(flag):
            continue
        x = x0 + i * (cw + gap)
        active = flag == act
        card(d, (x, y, x + cw, y + ch), accent=GOLD if active else TEAL, outline=GOLD if active else None)
        d.text((x + 24, y + 36), f"0{i+1}", font=font("bold", 22), fill=TEAL_BAR)
        d.text((x + 24, y + 80), title, font=font("bold", 28), fill=WHITE)
        for li, line in enumerate(wrap(detail, font("regular", 20), cw - 48)):
            d.text((x + 24, y + 130 + li * 28), line, font=font("regular", 20), fill=MUTED)
        if i < 3 and view.on(items[i + 1][0]):
            flow_dots(d, x + cw - 6, y + ch / 2, x + cw + gap + 6, y + ch / 2, view.t, TEAL_BAR)
        if active:
            view.hotspot = (x + 16, y + 40)
    y2 = y + ch + 28
    if view.on("notstore"):
        card(d, (x0, y2, x1, y2 + 90), accent=AMBER)
        d.text((x0 + 32, y2 + 30), "Light and sound are transfer pathways, not energy stores.", font=font("bold", 26), fill=WHITE, anchor="lm")
        y2 += 108
    if view.on("method"):
        card(d, (x0, y2, x1, y2 + 90), accent=GOLD, outline=GOLD)
        d.text((x0 + 32, y2 + 30), "Initial store   →   pathway   →   final store", font=font("bold", 28), fill=WHITE, anchor="lm")
        view.hotspot = (x0 + 16, y2 + 45)


def _draw_toycar(d, box, view):
    x0, y0, x1, y1 = box
    nodes = [
        ("chemical", "Chemical store", "Battery decreases", AMBER),
        ("electrical", "Electrically", "To the motor", TEAL),
        ("mechanical", "Mechanically", "A force moves the car", BLUE),
        ("kinetic", "Kinetic store", "The car speeds up", GREEN),
    ]
    y = y0 + 24
    gap = 16
    cw = (x1 - x0 - gap * (len(nodes) - 1)) / len(nodes)
    act = view.active()
    centers = []
    title_size = 26 if cw >= 300 else 20
    detail_size = 20 if cw >= 300 else 16
    for i, (flag, title, detail, color) in enumerate(nodes):
        if not view.on(flag):
            centers.append(None)
            continue
        x = x0 + i * (cw + gap)
        active = flag == act
        card(d, (x, y, x + cw, y + 128), accent=color, outline=GOLD if active else None)
        d.text((x + 20, y + 28), title, font=font("bold", title_size), fill=WHITE, anchor="lm")
        dy = y + 64
        for line in wrap(detail, font("regular", detail_size), cw - 36):
            d.text((x + 20, dy), line, font=font("regular", detail_size), fill=MUTED, anchor="lm")
            dy += detail_size + 6
        centers.append((x + cw, y + 60, x))
        if active:
            view.hotspot = (x + 12, y + 60)
    for i in range(3):
        if centers[i] and centers[i + 1]:
            flow_dots(d, centers[i][0] - 10, centers[i][1], centers[i + 1][2] + 10, centers[i + 1][1], view.t)
    car(d, x0 + 80, y0 + 280, 1.7, TEAL)
    if view.on("kinetic"):
        # nudge the car forward a little with time so the motion reads
        pass
    yb = y0 + 430
    if view.on("internal"):
        meter(d, x0, yb, 520, 28, 0.45, CORAL, "Internal stores of motor and surroundings", "increases")
    if view.on("sound"):
        meter(d, x0 + 600, yb, 420, 28, 0.25, PURPLE, "Sound", "carries energy away")
    if view.on("conserved"):
        d.text((x0, y1 - 20), "The energy has not disappeared. It is in other stores.", font=font("bold", 26), fill=GOLD, anchor="lb")


def _draw_catapult(d, box, view):
    x0, y0, x1, y1 = box
    # fork
    d.line((x0 + 180, y1 - 40, x0 + 180, y0 + 80), fill=MUTED, width=8)
    d.line((x0 + 180, y0 + 120, x0 + 70, y0 + 40), fill=MUTED, width=8)
    d.line((x0 + 180, y0 + 120, x0 + 290, y0 + 40), fill=MUTED, width=8)
    if view.on("band") or view.on("elastic"):
        d.line((x0 + 90, y0 + 60, x0 + 250, y0 + 150), fill=GREEN, width=5)
        d.line((x0 + 270, y0 + 60, x0 + 250, y0 + 150), fill=GREEN, width=5)
    px = x0 + 250 + (80 if view.on("kinetic") else 0)
    py = y0 + 150 - (40 if view.on("kinetic") else 0)
    if view.on("kinetic"):
        px = x0 + 250 + 180 * _ease(min(1, (view.since("kinetic") or 0) / 0.8))
        py = y0 + 140
        flow_dots(d, x0 + 250, y0 + 150, px, py, view.t, GOLD, n=2)
    d.ellipse((px - 16, py - 16, px + 16, py + 16), fill=AMBER)
    d.text((px, py + 36), "pellet", font=font("medium", 18), fill=MUTED, anchor="mm")
    labels = []
    if view.on("elastic"):
        labels.append(("Elastic potential store", "in the stretched band", GREEN))
    if view.on("mechanical"):
        labels.append(("Mechanical pathway", "the band exerts a force", TEAL))
    if view.on("kinetic"):
        labels.append(("Kinetic store", "the pellet speeds up", GOLD))
    if view.on("loss"):
        labels.append(("Surroundings", "some energy is transferred there too", CORAL))
    wide = (x1 - x0) >= 1200
    y = y0 + 16
    label_x = x0 + 460 if wide else x0 + 320
    label_w_end = x1 if wide else min(x1 - 4, x0 + 740)
    title_size = 26 if wide else 18
    detail_size = 20 if wide else 15
    block_h = 100 if wide else 86
    step = 116 if wide else 94
    for title, detail, color in labels:
        if y + block_h > y1 - 8:
            break
        card(d, (label_x, y, label_w_end, y + block_h), accent=color, outline=GOLD if title.startswith(view.active() or "___") else None)
        d.text((label_x + 18, y + 12), title, font=font("bold", title_size), fill=WHITE)
        dy = y + (48 if wide else 40)
        for line in wrap(detail, font("regular", detail_size), label_w_end - label_x - 32):
            d.text((label_x + 18, dy), line, font=font("regular", detail_size), fill=MUTED)
            dy += detail_size + 4
        y += step


def _draw_gpe(d, box, view):
    x0, y0, x1, y1 = box
    _lift_art(d, (x0, y0, x0 + 420, y1), view, {"label": "m", "h": "Δh"})
    lines = []
    if view.on("equation") or view.on("symbols"):
        lines.append(("equation", "ΔEₚ  =  m g Δh", 42))
    if view.on("symbols"):
        lines.append(("symbols", "change in GPE  =  mass × g × Δh", 28))
    if view.on("units"):
        lines.append(("units", "kg    ·    N/kg    ·    m    →    J", 28))
    _stack(d, (x0 + 460, y0 + 20, x1, y1 - 10), view, lines)
    if view.on("fall") and not lines:
        d.text((x0 + 460, y0 + 80), "GPE decreases.", font=font("bold", 36), fill=WHITE)
        d.text((x0 + 460, y0 + 140), "KE increases by the same amount", font=font("regular", 26), fill=MUTED)
        d.text((x0 + 460, y0 + 180), "if air resistance is ignored.", font=font("regular", 26), fill=MUTED)


def _draw_worked_lift(d, box, view, spec):
    wide = box[2] - box[0] >= 1200
    if wide:
        _lift_art(d, (box[0], box[1], box[0] + 460, box[3]), view, spec)
        _stack(d, (box[0] + 490, box[1] + 10, box[2], box[3] - 8), view, spec["lines"])
        return
    # Question panels are narrow. Keep the lift in that panel so the values
    # do not run into the question wording. The wording already states them.
    _lift_art(d, box, view, spec)


def _draw_ke(d, box, view):
    x0, y0, x1, y1 = box
    if view.on("define"):
        d.text((x0, y0), "Energy stored because an object is moving.", font=font("regular", 26), fill=MUTED)
    if view.on("equation") or view.on("symbols"):
        card(d, (x0, y0 + 60, x1, y0 + 190), accent=GOLD, outline=GOLD)
        _equation(d, (x0 + x1) / 2, y0 + 125, "Eₖ   =   ½  m  v²", 64, WHITE, "mm")
        view.hotspot = (x0 + 24, y0 + 125)
    if view.on("units"):
        d.text((x0, y0 + 230), "m in kg        v in m/s        Eₖ in J", font=font("bold", 28), fill=TEAL_BAR)
    if view.on("speed"):
        d.text((x0, y0 + 290), "v is the speed. Some explanations call it velocity.", font=font("regular", 24), fill=MUTED)
    car(d, x0 + 80, y1 - 120, 1.8, TEAL)
    flow_dots(d, x0 + 360, y1 - 90, x1 - 80, y1 - 90, view.t, TEAL_BAR, n=4)


def _draw_ke_square(d, box, view):
    x0, y0, x1, y1 = box
    show_double = view.on("double") or view.on("four")
    show_triple = view.on("triple") or view.on("nine")
    show_mass = view.on("mass")
    # three comparison columns
    cols = []
    if view.on("square") or show_double:
        cols.append(("Speed v", "KE", 0.18, "reference", False))
    if show_double:
        cols.append(("Speed 2v", "KE × 4", 0.72, "2² = 4", True))
    if show_triple:
        cols.append(("Speed 3v", "KE × 9", 1.0, "3² = 9", False))
    if not cols:
        d.text((x0, y0 + 40), "The square on the speed is the key feature.", font=font("bold", 32), fill=WHITE)
        return
    gap = 24
    cw = min(460, (x1 - x0 - gap * (len(cols) - 1)) / len(cols))
    base_y = y0 + 360
    for i, (title, subtitle, frac, note, hot) in enumerate(cols):
        x = x0 + i * (cw + gap)
        card(d, (x, y0, x + cw, y1 - 10), accent=GOLD if hot else TEAL)
        car(d, x + 40, y0 + 70, 1.15, TEAL if i == 0 else GOLD)
        d.text((x + 24, y0 + 170), title, font=font("bold", 28), fill=WHITE)
        d.text((x + 24, y0 + 210), note, font=font("regular", 22), fill=MUTED)
        bw = cw - 48
        rounded(d, (x + 24, base_y, x + 24 + bw, base_y + 36), 8, (10, 28, 52))
        rounded(d, (x + 24, base_y, x + 24 + max(12, bw * frac), base_y + 36), 8, GOLD if hot else TEAL)
        d.text((x + 24, base_y + 56), subtitle, font=font("bold", 24), fill=WHITE)
        if hot:
            view.hotspot = (x + 16, y0 + 180)
    if show_mass:
        d.text((x0, y1 - 8), "Doubling the mass, at the same speed, only doubles the kinetic energy.", font=font("bold", 24), fill=AMBER, anchor="lb")
    if view.on("road"):
        d.text((x0, y0 - 4), "Stopping a faster vehicle transfers much more energy.", font=font("regular", 22), fill=MUTED)


def _draw_ke_car(d, box, view):
    x0, y0, x1, y1 = box
    car(d, x0 + 40, y0 + 30, 1.5, TEAL)
    if view.on("speed"):
        d.text((x0 + 300, y0 + 50), "20 m/s", font=font("bold", 28), fill=GOLD)
        flow_dots(d, x0 + 300, y0 + 90, x0 + 620, y0 + 90, view.t)
    if view.on("mass"):
        d.text((x0 + 40, y0 + 150), "m = 1,200 kg", font=font("bold", 26), fill=WHITE)
    lines = []
    if view.on("method"):
        lines.append(("method", "Square the speed, × mass, ÷ 2", 26))
    if view.on("square"):
        lines.append(("square", "20²  =  400", 36))
    if view.on("product"):
        lines.append(("product", "400 × 1,200  =  480,000", 36))
    if view.on("result"):
        lines.append(("result", "Eₖ  =  240,000 J  =  240 kJ", 36))
    _stack(d, (x0 + 700, y0, x1, y1), view, lines)


def _draw_ball_ke(d, box, view):
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 80, y0 + 80, x0 + 150, y0 + 150), fill=AMBER)
    d.text((x0 + 115, y0 + 180), "ball", font=font("medium", 18), fill=MUTED, anchor="mm")
    if view.on("speed"):
        flow_dots(d, x0 + 160, y0 + 115, x0 + 420, y0 + 115, view.t, GOLD)
        d.text((x0 + 250, y0 + 70), "8 m/s", font=font("bold", 24), fill=GOLD)
    if view.on("mass"):
        d.text((x0 + 40, y0 + 230), "m = 0.15 kg", font=font("bold", 26), fill=WHITE)
    lines = []
    if view.on("square"):
        lines.append(("square", "8²  =  64", 36))
    if view.on("mid"):
        lines.append(("mid", "0.15 × 64  =  9.6", 36))
    if view.on("result"):
        lines.append(("result", "Eₖ  =  ½ × 9.6  =  4.8 J", 36))
    if view.on("errors"):
        lines.append(("errors", "Common errors: forgetting v² or the ½", 24))
    _stack(d, (x0 + 500, y0 + 10, x1, y1), view, lines)


def _draw_trajectory(d, box, view, kind):
    x0, y0, x1, y1 = box
    ground = y1 - 30
    if kind == "ball":
        d.line((x0 + 160, y0 + 20, x0 + 160, ground), fill=LINE, width=3)
        stages = [("release", 0.08, 1.0, 0.05), ("rises", 0.45, 0.45, 0.55), ("top", 0.92, 0.0, 1.0), ("falls", 0.5, 0.55, 0.45)]
        stage = "release" if view.on("release") else None
        for name, *_ in stages:
            if view.on(name):
                stage = name
        pos = {"release": 0.08, "rises": 0.5, "top": 0.92, "falls": 0.48}.get(stage, 0.08)
        if stage:
            since = view.since(stage) or 0
            # ease from a lower default
            pos = pos  # already the target; snap is OK with scene blends
        cy = ground - 30 - pos * (ground - y0 - 80)
        d.ellipse((x0 + 140, cy - 22, x0 + 184, cy + 22), fill=AMBER)
        ke = {"release": 1, "rises": 0.45, "top": 0, "falls": 0.6}.get(stage, 0)
        gpe = 1 - ke if stage else 0
        if view.on("real"):
            ke = max(0, ke - 0.08)
        meter(d, x0 + 280, y0 + 40, 520, 26, ke, TEAL, "Kinetic energy store", "decreases as it rises")
        meter(d, x0 + 280, y0 + 120, 520, 26, gpe, BLUE, "Gravitational store", "increases as it rises")
        if view.on("ideal"):
            d.text((x0 + 280, y0 + 200), "If air resistance is negligible, the sum stays constant.", font=font("regular", 22), fill=MUTED)
        if view.on("real"):
            meter(d, x0 + 280, y0 + 250, 520, 26, 0.2, CORAL, "Internal stores of air and ball", "air resistance")
        if stage == "top":
            d.text((x0 + 200, cy - 20), "v = 0, so KE = 0", font=font("bold", 22), fill=GOLD)
            view.hotspot = (x0 + 140, cy)
    else:
        # slope
        d.line((x0 + 40, y0 + 50, x0 + 520, ground), fill=MUTED, width=6)
        u = 0.05
        if view.on("top") or view.on("gpe"):
            u = 0.08
        if view.on("kinetic") or view.on("mechanical"):
            since = view.since("mechanical") or view.since("kinetic") or 0
            u = 0.08 + 0.75 * _ease(since / 1.6)
        sx = x0 + 70 + u * 400
        sy = y0 + 70 + u * (ground - y0 - 90)
        d.ellipse((sx - 16, sy - 28, sx + 16, sy + 4), fill=TEAL)
        d.line((sx, sy + 4, sx, sy + 28), fill=TEAL, width=4)
        if view.on("gpe"):
            meter(d, x0 + 600, y0 + 30, 500, 24, max(0.15, 1 - u), BLUE, "Gravitational store", "decreases downhill")
        if view.on("kinetic"):
            meter(d, x0 + 600, y0 + 110, 500, 24, u, TEAL, "Kinetic store", "increases")
        if view.on("friction"):
            meter(d, x0 + 600, y0 + 190, 500, 24, 0.28, CORAL, "Internal stores", "skis, snow and air")
        if view.on("sound"):
            d.text((x0 + 600, y0 + 270), "Sound can carry some energy away.", font=font("regular", 22), fill=MUTED)


def _sankey(d, box, view, title, flows):
    """flows: list of (flag, label, joules, color, useful). Input flag is separate."""
    x0, y0, x1, y1 = box
    visible = [f for f in flows if view.on(f[0])]
    d.text((x0, y0), title, font=font("bold", 24), fill=WHITE)
    total = sum(f[2] for f in flows) or 1
    input_j = flows[0][2] + sum(f[2] for f in flows[1:]) if False else None
    # The first number of the scene is the input; widths use the given joules against their sum if all shown,
    # but we scale against a provided total stored in flows metadata via the largest sensible sum.
    scale_total = max(total, 1)
    left = x0 + 20
    right = x0 + 280
    top = y0 + 70
    height = min(280, y1 - top - 40)
    if view.on(flows[0][0]) or visible:
        rounded(d, (left, top, right, top + height), 12, TEAL_MID)
        d.text(((left + right) / 2, top + height / 2), "Input", font=font("bold", 22), fill=WHITE, anchor="mm")
    y = top
    for flag, label, joules, color, _useful in visible:
        h = max(36, height * joules / scale_total)
        if y + h > top + height + 80:
            h = 36
        rounded(d, (right + 80, y, x1 - 10, y + h), 10, color)
        d.text((right + 100, y + h / 2), f"{label}    {joules:g} J", font=font("bold", 22), fill=BG if color != NAVY_ROW else WHITE, anchor="lm")
        flow_dots(d, right, y + h / 2, right + 80, y + h / 2, view.t, color, n=2, radius=5)
        if flag == view.active():
            view.hotspot = (right + 70, y + h / 2)
        y += h + 12


def _draw_sankey(d, box, view):
    flows = [
        ("light", "Light, useful", 45, AMBER, True),
        ("sound", "Sound, useful here", 36, PURPLE, True),
        ("waste", "Dissipated", 19, CORAL, False),
    ]
    if view.on("input"):
        card(d, (box[0], box[1], box[0] + 280, box[1] + 110), accent=TEAL)
        d.text((box[0] + 24, box[1] + 36), "Input  100 J", font=font("bold", 28), fill=WHITE)
    _sankey(d, (box[0] + 300, box[1], box[2], box[3]), view, "Useful outputs and what is left", flows)
    if view.on("phone"):
        d.text((box[0], box[3] - 16), "Whether light or sound is useful depends on the job.", font=font("regular", 22), fill=MUTED, anchor="lb")


def _simple_balance(d, box, view, rows, result_flag, result):
    x0, y0, x1, y1 = box
    wide = x1 - x0 >= 1200
    card_w = 640 if wide else max(280, x1 - x0 - 12)
    y = y0
    for flag, text, color in rows:
        if not view.on(flag):
            continue
        card(d, (x0, y, x0 + card_w, y + 84), accent=color, outline=GOLD if view.active() == flag else None)
        d.text((x0 + 28, y + 42), text, font=font("bold", 26 if wide else 22), fill=WHITE, anchor="lm")
        y += 100
    if view.on(result_flag):
        if wide:
            card(d, (x0 + 700, y0 + 40, x1, y0 + 220), accent=GOLD, outline=GOLD)
            d.text(((x0 + 700 + x1) / 2, y0 + 130), result, font=font("bold", 42), fill=WHITE, anchor="mm")
            view.hotspot = (x0 + 720, y0 + 130)
        else:
            card(d, (x0, y, x0 + card_w, y + 96), accent=GOLD, outline=GOLD)
            d.text((x0 + card_w / 2, y + 48), result, font=font("bold", 32), fill=WHITE, anchor="mm")
            view.hotspot = (x0 + 16, y + 48)


def _efficiency_art(d, box, view, spec):
    x0, y0, x1, y1 = box
    if spec.get("turbine") and (view.on("input") or view.on("useful") or view.on("equation")):
        turbine(d, x0 + 120, y0 + 90, view.t, 64, TEAL)
    if spec.get("lamp") and (view.on("input") or view.on("light")):
        d.ellipse((x0 + 70, y0 + 40, x0 + 170, y0 + 140), fill=AMBER if view.on("light") else MUTED)
        d.rectangle((x0 + 100, y0 + 140, x0 + 140, y0 + 190), fill=MUTED)
    if spec.get("fan"):
        turbine(d, x0 + 120, y0 + 100, view.t * 3, 50, BLUE)
    wide = (x1 - x0) >= 1200
    if wide:
        _stack(d, (x0 + 280, y0, x1, y1 - 80), view, spec["lines"])
    else:
        _stack(d, (x0 + 200, y0 + 200, x1 - 8, y1 - 90), view, spec["lines"])
    if view.on(spec.get("bar", "percent")) and "frac" in spec and wide:
        meter(d, x0, y1 - 70, x1 - x0, 28, spec["frac"], GREEN, "Useful fraction", spec["bar_label"])


def _draw_engine(d, box, view):
    x0, y0, x1, y1 = box
    # two surfaces
    d.rectangle((x0 + 40, y0 + 80, x0 + 460, y0 + 130), fill=(120, 140, 160))
    gap = 36 if view.on("oil") else 8
    d.rectangle((x0 + 40, y0 + 130 + gap, x0 + 460, y0 + 180 + gap), fill=(90, 110, 130))
    if view.on("dry"):
        for i in range(8):
            xx = x0 + 70 + i * 48
            d.line((xx, y0 + 130, xx + 16, y0 + 130 + gap), fill=CORAL, width=3)
        d.text((x0 + 40, y0 + 40), "Dry metal surfaces rub.", font=font("bold", 26), fill=CORAL)
    if view.on("oil"):
        d.rectangle((x0 + 40, y0 + 130, x0 + 460, y0 + 130 + gap), fill=(70, 120, 90))
        d.text((x0 + 40, y0 + 220 + gap), "Engine oil separates the surfaces and reduces friction.", font=font("bold", 24), fill=GREEN)
        view.hotspot = (x0 + 40, y0 + 150)
    if view.on("better"):
        d.text((x0 + 520, y0 + 80), "Less unwanted internal energy.", font=font("bold", 28), fill=WHITE)
        d.text((x0 + 520, y0 + 130), "Efficiency can improve.", font=font("regular", 24), fill=MUTED)
        d.text((x0 + 520, y0 + 170), "Wear is reduced.", font=font("regular", 24), fill=MUTED)
        d.text((x0 + 520, y0 + 220), "Losses are not eliminated.", font=font("regular", 24), fill=AMBER)


def _draw_cavity(d, box, view):
    x0, y0, x1, y1 = box
    # interior warm, bricks, cavity, exterior
    d.rectangle((x0, y0 + 40, x0 + 180, y1 - 20), fill=(90, 50, 40))
    d.text((x0 + 90, y0 + 80), "Warm", font=font("bold", 22), fill=AMBER, anchor="mm")
    d.rectangle((x0 + 180, y0 + 40, x0 + 280, y1 - 20), fill=(150, 82, 70))
    d.rectangle((x0 + 430, y0 + 40, x0 + 530, y1 - 20), fill=(150, 82, 70))
    d.rectangle((x0 + 530, y0 + 40, x0 + 700, y1 - 20), fill=(40, 70, 110))
    d.text((x0 + 610, y0 + 80), "Cold", font=font("bold", 22), fill=BLUE, anchor="mm")
    if view.on("slow") or view.on("air") or view.scene.diagram == "cavity":
        d.rectangle((x0 + 280, y0 + 40, x0 + 430, y1 - 20), fill=(70, 110, 100))
        d.text((x0 + 355, y0 + 70), "foam", font=font("bold", 18), fill=WHITE, anchor="mm")
    if view.on("air"):
        for i in range(6):
            for j in range(3):
                cx = x0 + 310 + (i % 3) * 36
                cy = y0 + 120 + j * 70 + (i // 3) * 10
                d.ellipse((cx, cy, cx + 22, cy + 22), outline=WHITE, width=2)
        view.hotspot = (x0 + 300, y0 + 160)
    # heat arrows get shorter when insulation is explained
    length = 80 if view.on("rate") else 150
    for i in range(4):
        y = y0 + 140 + i * 70
        arrow(d, x0 + 40, y, x0 + 40 + length, y, CORAL, 4)
    if view.on("rate"):
        d.text((x0 + 740, y0 + 80), "Less energy", font=font("bold", 28), fill=WHITE)
        d.text((x0 + 740, y0 + 120), "transferred", font=font("bold", 28), fill=WHITE)
        d.text((x0 + 740, y0 + 160), "each second.", font=font("bold", 28), fill=GOLD)


def _bars(d, box, view, title, rows, note):
    x0, y0, x1, y1 = box
    d.text((x0, y0), title, font=font("bold", 24), fill=WHITE)
    d.text((x0, y0 + 34), note, font=font("regular", 18), fill=AMBER)
    shown = [(flag, label, value) for flag, label, value in rows if view.on(flag)]
    if not shown:
        return
    max_v = max(v for _, _, v in rows)
    top = y0 + 80
    gap = 10
    h = min(48, (y1 - top - 10) / max(len(rows), 1) - gap)
    act = view.active()
    for i, (flag, label, value) in enumerate(rows):
        if not view.on(flag):
            continue
        y = top + i * (h + gap)
        rounded(d, (x0 + 230, y, x1 - 120, y + h), 8, (10, 28, 52))
        frac = value / max_v if max_v else 0
        color = GREEN if value < 0.1 else (TEAL if value < 0.3 else CORAL)
        if frac > 0:
            rounded(d, (x0 + 230, y, x0 + 230 + max(8, int((x1 - x0 - 360) * frac)), y + h), 8, color)
        d.text((x0, y + h / 2), label, font=font("medium", 18), fill=WHITE, anchor="lm")
        d.text((x1 - 20, y + h / 2), f"{value:.2f}", font=font("bold", 18), fill=GOLD if flag == act else WHITE, anchor="rm")
        if flag == act:
            view.hotspot = (x0 + 210, y + h / 2)


def _draw_plant(d, box, view, steps):
    x0, y0, x1, y1 = box
    shown = [s for s in steps if view.on(s[0])]
    if not shown:
        return
    gap = 16
    cw = min(280, (x1 - x0 - gap * (len(steps) - 1)) / max(len(steps), 1))
    for i, (flag, title, detail) in enumerate(steps):
        if not view.on(flag):
            continue
        x = x0 + i * (cw + gap)
        active = view.active() == flag
        card(d, (x, y0 + 20, x + cw, y0 + 200), accent=GOLD if active else TEAL, outline=GOLD if active else None)
        d.text((x + 16, y0 + 50), title, font=font("bold", 22), fill=WHITE)
        for li, line in enumerate(wrap(detail, font("regular", 18), cw - 32)):
            d.text((x + 16, y0 + 96 + li * 24), line, font=font("regular", 18), fill=MUTED)
        if i and view.on(steps[i - 1][0]):
            flow_dots(d, x - gap + 4, y0 + 110, x - 4, y0 + 110, view.t)
        if active:
            view.hotspot = (x + 10, y0 + 110)


def _draw_hydro(d, box, view):
    x0, y0, x1, y1 = box
    if view.on("store") or view.on("kinetic") or view.on("mech"):
        d.polygon([(x0 + 40, y0 + 40), (x0 + 220, y0 + 40), (x0 + 220, y0 + 150), (x0 + 40, y0 + 110)], fill=(40, 110, 160))
        d.text((x0 + 120, y0 + 80), "reservoir", font=font("bold", 18), fill=WHITE, anchor="mm")
        d.rectangle((x0 + 220, y0 + 40, x0 + 250, y0 + 230), fill=(140, 150, 160))
    if view.on("kinetic") or view.on("mech"):
        flow_dots(d, x0 + 250, y0 + 180, x0 + 430, y0 + 230, view.t, BLUE)
    if view.on("mech"):
        turbine(d, x0 + 500, y0 + 230, view.t * 2.2, 48, TEAL)
    if view.on("grid"):
        arrow(d, x0 + 560, y0 + 230, x0 + 760, y0 + 230, GOLD, 6)
        d.text((x0 + 780, y0 + 230), "grid", font=font("bold", 24), fill=GOLD, anchor="lm")
    if view.on("loss"):
        d.text((x0 + 40, y0 + 300), "Some energy is dissipated by friction and other losses.", font=font("regular", 24), fill=CORAL)
    steps = [
        ("store", "GPE store", "Water held at height"),
        ("kinetic", "Kinetic store", "Water speeds up as it descends"),
        ("mech", "Mechanically", "Water does work on the turbine"),
        ("grid", "Electrically", "Generator to the grid"),
    ]
    _draw_plant(d, (x0, y0 + 360, x1, y1), view, steps)


def _draw_graph(d, box, view, example=False):
    x0, y0, x1, y1 = box
    gx0, gy0, gx1, gy1 = x0 + 90, y0 + 70, x0 + 980, y1 - 70
    d.line((gx0, gy0, gx0, gy1), fill=WHITE, width=3)
    d.line((gx0, gy1, gx1, gy1), fill=WHITE, width=3)
    if example:
        d.text(((gx0 + gx1) / 2, y0 + 24), "Illustrative example only — not a published data set", font=font("bold", 22), fill=AMBER, anchor="mm")
        xs = [0, 1, 2, 3, 4, 5]
        ys = [18, 22, 27, 30, 23, 34]
        pts = []
        for i, (x, yv) in enumerate(zip(xs, ys)):
            px = gx0 + 40 + i * ((gx1 - gx0 - 80) / 5)
            py = gy1 - (yv / 40) * (gy1 - gy0 - 30)
            pts.append((px, py))
            d.text((px, gy1 + 16), f"Y{i+1}", font=font("medium", 16), fill=MUTED, anchor="mt")
        if view.on("show") or view.on("rise") or view.on("fall") or view.scene.layout == "exam":
            d.line(pts, fill=TEAL_BAR, width=5)
            for p in pts:
                d.ellipse((p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6), fill=TEAL)
        if view.on("rise"):
            d.text((pts[1][0], pts[1][1] - 28), "overall rise", font=font("bold", 18), fill=GREEN, anchor="mm")
            view.hotspot = pts[3]
        if view.on("fall"):
            d.line((pts[3][0], pts[3][1], pts[4][0], pts[4][1]), fill=CORAL, width=6)
            d.text((pts[4][0], pts[4][1] - 28), "sudden fall", font=font("bold", 18), fill=CORAL, anchor="mm")
            view.hotspot = pts[4]
        d.text((x0 + 10, (gy0 + gy1) / 2), "demand", font=font("medium", 16), fill=MUTED, anchor="mm")
        d.text(((gx0 + gx1) / 2, y1 - 16), "time (labelled years on a real paper)", font=font("medium", 16), fill=MUTED, anchor="mm")
        if view.on("smooth"):
            d.text((gx1 + 20, y0 + 80), "Describe the dip.", font=font("bold", 22), fill=WHITE)
            d.text((gx1 + 20, y0 + 116), "Do not pretend", font=font("regular", 20), fill=MUTED)
            d.text((gx1 + 20, y0 + 144), "the line is smooth.", font=font("regular", 20), fill=MUTED)
    else:
        labels = [
            ("title", "Title", x0 + 1040, y0 + 30),
            ("axes", "Axes", x0 + 1040, y0 + 90),
            ("units", "Units", x0 + 1040, y0 + 150),
            ("dates", "Dates", x0 + 1040, y0 + 210),
            ("key", "Key", x0 + 1040, y0 + 270),
        ]
        for flag, label, x, y in labels:
            if not view.on(flag):
                continue
            active = view.active() == flag
            card(d, (x, y, x1, y + 48), accent=GOLD if active else TEAL, outline=GOLD if active else None)
            d.text((x + 16, y + 24), label, font=font("bold", 22), fill=WHITE, anchor="lm")
            if active:
                view.hotspot = (x, y + 24)
                if flag == "title":
                    d.text(((gx0 + gx1) / 2, gy0 - 16), "Graph title", font=font("bold", 20), fill=GOLD, anchor="mm")
                if flag == "axes":
                    d.text((gx0 - 8, (gy0 + gy1) / 2), "y", font=font("bold", 20), fill=GOLD, anchor="rm")
                    d.text(((gx0 + gx1) / 2, gy1 + 24), "x", font=font("bold", 20), fill=GOLD, anchor="mm")
        notes = []
        if view.on("pattern"):
            notes.append("1  Pattern: increases, decreases, stable or fluctuates.")
        if view.on("quote"):
            notes.append("2  Quote values that are actually on the graph.")
        if view.on("why"):
            notes.append("3  Explain with a factor you can justify.")
        if view.on("invent"):
            notes.append("Do not invent a reason the source does not support.")
        y = y0 + 340
        for note in notes:
            d.text((x0 + 1040, y), note, font=font("regular", 20), fill=WHITE if not note.startswith("Do") else AMBER)
            y += 36


def _draw_mix(d, box, view):
    x0, y0, x1, y1 = box
    cx, cy = x0 + 360, y0 + 230
    if view.on("mix") or view.on("coal") or view.on("tools"):
        d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=TEAL_MID, outline=TEAL_BAR, width=4)
        d.text((cx, cy), "mix", font=font("bold", 28), fill=WHITE, anchor="mm")
    sources = [
        ("mix", "Several sources", -260, -120),
        ("shock", "If one source fails", -280, 40),
        ("tools", "Storage and links", 160, -130),
        ("depends", "Cost, place, emissions", 150, 50),
        ("resilient", "Others keep supplying", 150, 150),
    ]
    for flag, label, dx, dy in sources:
        if not view.on(flag):
            continue
        x, y = cx + dx, cy + dy
        card(d, (x, y, x + 250, y + 64), accent=GOLD if view.active() == flag else TEAL)
        d.text((x + 16, y + 32), label, font=font("bold", 18), fill=WHITE, anchor="lm")
        flow_dots(d, x + 250, y + 32, cx - 70, cy, view.t, TEAL_BAR, n=2, radius=4)
        if view.active() == flag:
            view.hotspot = (x, y + 32)


def _draw_town(d, box, view):
    x0, y0, x1, y1 = box
    if view.on("only") or view.on("calm"):
        turbine(d, x0 + 140, y0 + 80, view.t * (0.3 if view.on("calm") else 1), 60, MUTED if view.on("calm") else TEAL)
        turbine(d, x0 + 300, y0 + 100, view.t * (0.2 if view.on("calm") else 1.3), 50, MUTED if view.on("calm") else TEAL)
        label = "Calm day: little electricity" if view.on("calm") else "Town supplied only by wind"
        d.text((x0 + 40, y0 + 280), label, font=font("bold", 26), fill=CORAL if view.on("calm") else WHITE)
    if view.on("mix"):
        sun(d, x0 + 700, y0 + 70, view.t)
        turbine(d, x0 + 860, y0 + 90, view.t, 48)
        rounded(d, (x0 + 980, y0 + 50, x0 + 1080, y0 + 110), 8, GREEN)
        d.text((x0 + 1030, y0 + 80), "store", font=font("bold", 16), fill=BG, anchor="mm")
        d.text((x0 + 620, y0 + 280), "Wind + solar + storage + controllable generation", font=font("bold", 22), fill=GREEN)
    if view.on("system"):
        d.text((x0 + 40, y0 + 360), "Meet demand from the whole system, not from one source alone.", font=font("regular", 24), fill=WHITE)


def _draw_solar_supply(d, box, view):
    x0, y0, x1, y1 = box
    night = view.on("night")
    sun(d, x0 + 120, y0 + 80, view.t, 30)
    if night:
        d.ellipse((x0 + 150, y0 + 40, x0 + 230, y0 + 120), fill=NAVY_CARD)
        d.text((x0 + 80, y0 + 150), "No output at night", font=font("bold", 24), fill=WHITE)
    if view.on("cloud"):
        d.ellipse((x0 + 70, y0 + 40, x0 + 150, y0 + 90), fill=MUTED)
        d.text((x0 + 40, y0 + 200), "Less output under some cloud", font=font("regular", 22), fill=MUTED)
    # panel
    d.polygon([(x0 + 80, y0 + 300), (x0 + 220, y0 + 250), (x0 + 260, y0 + 310), (x0 + 120, y0 + 360)], fill=(30, 70, 120), outline=TEAL_BAR)
    if view.on("backup"):
        card(d, (x0 + 360, y0 + 80, x1, y0 + 220), accent=GOLD, outline=GOLD)
        d.text((x0 + 390, y0 + 130), "Storage or other generation", font=font("bold", 28), fill=WHITE)
        d.text((x0 + 390, y0 + 175), "is needed when sunlight is not enough.", font=font("regular", 22), fill=MUTED)
        view.hotspot = (x0 + 360, y0 + 150)


def _draw_tea(d, box, view):
    x0, y0, x1, y1 = box
    # cup
    d.polygon([(x0 + 80, y0 + 80), (x0 + 200, y0 + 80), (x0 + 180, y0 + 200), (x0 + 100, y0 + 200)], fill=(90, 50, 40), outline=AMBER)
    d.arc((x0 + 190, y0 + 100, x0 + 240, y0 + 160), -80, 80, fill=WHITE, width=4)
    if view.on("heating") or view.on("cup"):
        for i in range(3):
            arrow(d, x0 + 210, y0 + 90 + i * 28, x0 + 340, y0 + 70 + i * 28, CORAL, 4)
        d.text((x0 + 360, y0 + 90), "heating", font=font("bold", 24), fill=CORAL)
    if view.on("down"):
        d.text((x0 + 40, y0 + 240), "Tea internal store decreases", font=font("bold", 22), fill=AMBER)
    if view.on("up"):
        d.text((x0 + 360, y0 + 160), "Air internal store increases", font=font("bold", 22), fill=TEAL_BAR)
        view.hotspot = (x0 + 360, y0 + 160)


def _draw_loft(d, box, view):
    x0, y0, x1, y1 = box
    d.polygon([(x0 + 40, y0 + 160), (x0 + 280, y0 + 40), (x0 + 520, y0 + 160)], outline=WHITE, width=4)
    if view.on("wool") or view.on("air") or True:
        d.rectangle((x0 + 120, y0 + 160, x0 + 440, y0 + 210), fill=(120, 150, 110))
        d.text((x0 + 280, y0 + 185), "loft insulation", font=font("bold", 18), fill=BG, anchor="mm")
    if view.on("wool"):
        d.text((x0 + 560, y0 + 60), "Wool felt conducts better", font=font("bold", 24), fill=WHITE)
        d.text((x0 + 560, y0 + 100), "than fibreglass, so it needs", font=font("regular", 22), fill=MUTED)
        d.text((x0 + 560, y0 + 132), "to be thicker.", font=font("regular", 22), fill=MUTED)
    if view.on("air"):
        d.text((x0 + 560, y0 + 190), "Trapped air:", font=font("bold", 24), fill=TEAL_BAR)
        d.text((x0 + 560, y0 + 230), "low conductivity, and no large", font=font("regular", 22), fill=MUTED)
        d.text((x0 + 560, y0 + 262), "convection currents.", font=font("regular", 22), fill=MUTED)


def _sentence_spans(scene: Scene):
    spans = []
    idx = 0
    for sentence in scene.sentences:
        n = len(sentence.split())
        spans.append((idx, idx + n))
        idx += n
    return spans


def _current_span(scene, view):
    spans = _sentence_spans(scene)
    current = None
    for start, end in spans:
        if start < len(view.words) and view.words[start][1] <= view.t + LEAD:
            current = (start, end)
    return current


def _karaoke(d, box, scene, view, size=26):
    x0, y0, x1, y1 = box
    span = _current_span(scene, view)
    if span is None:
        return
    start, end = span
    tokens = view.words[start:end]
    rounded(d, (x0, y0, x1, y1), 16, NAVY_ROW)
    spoken_pairs = [(tok, True) if ts <= view.t + LEAD else (tok, False) for tok, ts in tokens]
    draw_words = spoken_pairs
    # local import avoided; draw inline
    fnt = font("regular", size)
    cx, cy = x0 + 24, y0 + 16
    space = text_width(" ", fnt)
    line_h = int(size * 1.35)
    for token, spoken in draw_words:
        token_draw = token
        # Unspoken words stay readable, in a quieter colour, so a sentence is never cut off.
        fill = WHITE if spoken else MUTED
        tw = text_width(token_draw, fnt)
        if cx > x0 + 24 and cx + tw > x1 - 24:
            cx = x0 + 24
            cy += line_h
        if cy > y1 - 8:
            break
        d.text((cx, cy), token_draw, font=fnt, fill=fill)
        cx += tw + space


def _block_text(d, x, y, width, sentences, roles, view, scene):
    """Draw exam or question sentences that have started."""
    spans = _sentence_spans(scene)
    y_cursor = y
    bottom = 980
    for (start, end), sentence, role in zip(spans, sentences, roles):
        if start >= len(view.words) or view.words[start][1] > view.t + LEAD:
            continue
        if role == "mark":
            fill, accent, size, weight = (14, 48, 46), GREEN, 22, "medium"
        elif role == "answer":
            fill, accent, size, weight = NAVY_ROW, GOLD, 24, "regular"
        else:
            fill, accent, size, weight = NAVY_DEEP, TEAL, 24, "regular"
        fnt = font(weight, size)
        lines = wrap(sentence, fnt, width - 48)
        h = 24 + len(lines) * int(size * 1.32)
        if y_cursor + h > bottom:
            size = 20
            fnt = font(weight, size)
            lines = wrap(sentence, fnt, width - 48)
            h = 20 + len(lines) * int(size * 1.28)
        if y_cursor + h > bottom:
            break
        card(d, (x, y_cursor, x + width, y_cursor + h), fill=fill, accent=accent, outline=GOLD if role == "answer" and view.active() else None)
        ly = y_cursor + 12
        for line in lines:
            d.text((x + 28, ly), line, font=fnt, fill=WHITE)
            ly += int(size * 1.28)
        if role == "answer":
            view.hotspot = (x + 12, y_cursor + h / 2)
        y_cursor += h + 10
    return y_cursor


def _focus_height(scene, view):
    span = _current_span(scene, view)
    if span is None:
        return 0
    start, end = span
    text = " ".join(tok for tok, _ in view.words[start:end])
    lines = wrap(text, font("regular", 26), 1696)
    return min(280, 52 + len(lines) * 36)


def render_frame(scene: Scene, t: float, words, flag_times, countdown, progress: float) -> Image.Image:
    view = View(scene, t, words, flag_times, countdown, progress)
    img = Image.new("RGB", (W, H), BG)
    d = chrome(img, scene.footer, scene.index + 1, scene.total, progress)
    if scene.layout == "title":
        _title(d, scene, view)
    elif scene.layout == "end":
        _end(d, scene, view)
    elif scene.layout == "exam":
        _exam(d, scene, view)
    elif scene.layout in {"question", "answer"}:
        _qa(d, scene, view)
    else:
        _explain(d, scene, view)
    if countdown:
        draw_countdown(d, countdown)
    return img


def _title(d, scene, view):
    d.text((88, 150), "GCSE PHYSICS", font=font("bold", 18), fill=TEAL_BAR)
    y = 190
    for line in wrap(scene.video_title, font("bold", 54), 1600):
        d.text((88, y), line, font=font("bold", 54), fill=WHITE)
        y += 64
    d.text((88, y + 6), scene.subtitle, font=font("regular", 24), fill=MUTED)
    spans = _sentence_spans(scene)
    y = y + 70
    for i, ((start, end), sentence) in enumerate(zip(spans, scene.sentences)):
        if start >= len(view.words) or view.words[start][1] > view.t + LEAD:
            continue
        lines = wrap(sentence, font("regular", 26), 1560)
        h = 28 + len(lines) * 34
        card(d, (88, y, 1832, y + h), accent=TEAL if i else GOLD)
        ly = y + 14
        for line in lines:
            d.text((124, ly), line, font=font("regular", 26), fill=WHITE)
            ly += 34
        y += h + 14


def _end(d, scene, view):
    mark = logo().resize((96, 96))
    # paste needs the image; chrome already used the draw on img. We only have draw here.
    # Redraw logo via text badge so this function stays on the draw context.
    rounded(d, (88, 180, 184, 276), 24, TEAL_MID)
    d.text((136, 228), "JD", font=font("bold", 42), fill=WHITE, anchor="mm")
    d.text((210, 214), "JD SCIENCE", font=font("bold", 36), fill=WHITE, anchor="lm")
    d.text((210, 258), "Learn smarter. Revise better. Achieve more.", font=font("regular", 22), fill=MUTED, anchor="lm")
    spans = _sentence_spans(scene)
    y = 320
    for (start, end), sentence in zip(spans, scene.sentences):
        if start >= len(view.words) or view.words[start][1] > view.t + LEAD:
            continue
        lines = wrap(sentence, font("regular", 26), 1560)
        h = 24 + len(lines) * 34
        card(d, (88, y, 1832, y + h), accent=TEAL)
        ly = y + 12
        for line in lines:
            d.text((120, ly), line, font=font("regular", 26), fill=WHITE)
            ly += 34
        y += h + 12
    if any(view.on(flag) for flag in ("web",)) or "jdscience.co.uk" in " ".join(w for w, ts in view.words if ts <= view.t + LEAD):
        d.text((88, min(y + 20, 900)), "jdscience.co.uk", font=font("bold", 48), fill=TEAL_BAR)


def _explain(d, scene, view):
    top = heading(d, scene.title, scene.subtitle)
    focus_h = _focus_height(scene, view)
    focus_top = 984 - focus_h if focus_h else 984
    box = (88, max(top, 220), 1832, focus_top - 12)
    _art(d, box, view)
    if focus_h:
        _karaoke(d, (88, focus_top, 1832, 984), scene, view)


def _qa(d, scene, view):
    top = heading(d, scene.title, scene.subtitle)
    if scene.layout == "answer":
        pill(d, (1500, 128), "ANSWER", GREEN, BG, 18)
        roles = ["answer"] * len(scene.sentences)
        _block_text(d, 88, top + 10, 1744, scene.sentences, roles, view, scene)
        return
    pill(d, (1460, 128), "YOUR TURN", GOLD, BG, 18)
    art = (88, top + 10, 760, 980)
    _art(d, art, view)
    roles = ["question"] * len(scene.sentences)
    _block_text(d, 800, top + 10, 1032, scene.sentences, roles, view, scene)


def _exam(d, scene, view):
    top = heading(d, scene.title, scene.subtitle)
    pill(d, (1548, 126), "EXAM", TEAL_BAR, BG, 16)
    # The question, model answer and mark scheme use the full card.
    _block_text(d, 88, top, 1744, scene.sentences, scene.roles, view, scene)


def _art(d, box, view):
    if box[3] - box[1] < 40 or box[2] - box[0] < 40:
        return
    name = view.scene.diagram
    custom = {
        "stores": _draw_stores,
        "pathways": _draw_pathways,
        "toycar": _draw_toycar,
        "catapult": _draw_catapult,
        "gpe": _draw_gpe,
        "ke": _draw_ke,
        "ke_square": _draw_ke_square,
        "ke_car": _draw_ke_car,
        "ball_ke": _draw_ball_ke,
        "engine": _draw_engine,
        "cavity": _draw_cavity,
        "loft": _draw_loft,
        "hydro": _draw_hydro,
        "mix": _draw_mix,
        "town": _draw_town,
        "solar_supply": _draw_solar_supply,
        "tea": _draw_tea,
        "graph": lambda d, box, view: _draw_graph(d, box, view, False),
        "graph_example": lambda d, box, view: _draw_graph(d, box, view, True),
    }
    if name in custom:
        custom[name](d, box, view)
        return
    if name == "piledriver":
        _draw_worked_lift(d, box, view, {
            "label": "120 kg",
            "h": "4 m",
            "result": "+4,800 J",
            "lines": [
                ("mass", "m = 120 kg", 32),
                ("height", "Δh = 4 m", 32),
                ("g", "g = 10 N/kg", 32),
                ("sub", "ΔEₚ = 120 × 10 × 4", 32),
                ("result", "ΔEₚ = 4,800 J", 36),
            ],
        })
        return
    if name == "bag":
        _draw_worked_lift(d, box, view, {
            "label": "2 kg",
            "h": "3 m",
            "result": "+60 J",
            "lines": [
                ("mass", "m = 2 kg", 32),
                ("height", "Δh = 3 m", 32),
                ("g", "g = 10 N/kg", 32),
                ("sub", "ΔEₚ = 2 × 10 × 3", 32),
                ("result", "ΔEₚ = 60 J", 40),
            ],
        })
        return
    if name == "crane":
        _draw_worked_lift(d, box, view, {
            "label": "500 kg",
            "h": "20 m",
            "result": "+100,000 J",
            "lines": [
                ("mass", "m = 500 kg", 30),
                ("height", "Δh = 20 m", 30),
                ("g", "g = 10 N/kg", 30),
                ("equation", "ΔEₚ = m g Δh", 30),
                ("result", "500 × 10 × 20 = 100,000 J", 26),
            ],
        })
        return
    if name == "sankey":
        _draw_sankey(d, box, view)
        return
    if name == "kettle":
        _simple_balance(d, box, view, [
            ("input", "Electrical input    2,000 J", TEAL),
            ("water", "To the water    1,800 J", GREEN),
            ("rest", "Transferred elsewhere    200 J", CORAL),
        ], "rest", "200 J")
        if view.on("kept"):
            d.text((box[0], box[3] - 10), "That energy has not vanished.", font=font("bold", 24), fill=GOLD, anchor="lb")
        return
    if name == "fan":
        _simple_balance(d, box, view, [
            ("input", "Input    300 J", TEAL),
            ("useful", "Moving air    180 J", GREEN),
            ("heat", "Internal stores    90 J", CORAL),
            ("sound", "Sound    30 J", PURPLE),
        ], "sound", "30 J")
        return
    if name == "wind":
        _efficiency_art(d, box, view, {
            "turbine": True, "frac": 0.24, "bar": "percent", "bar_label": "24%",
            "lines": [
                ("input", "Wind power    500 MW", 30),
                ("useful", "Electrical output    120 MW", 30),
                ("decimal", "120 ÷ 500  =  0.24", 34),
                ("percent", "Efficiency  =  24%", 40),
                ("power", "Megawatts are power, not energy", 24),
            ],
        })
        return
    if name == "lamp":
        _efficiency_art(d, box, view, {
            "lamp": True, "frac": 0.2, "bar": "percent", "bar_label": "20% light",
            "lines": [
                ("input", "Electrical input    60 J", 30),
                ("light", "Useful light    12 J", 30),
                ("decimal", "12 ÷ 60  =  0.2", 34),
                ("percent", "Efficiency  =  20%", 40),
                ("rest", "80% is not counted as useful light", 24),
            ],
        })
        return
    if name == "motor":
        _efficiency_art(d, box, view, {
            "frac": 0.7, "bar": "percent", "bar_label": "70%",
            "lines": [
                ("input", "Electrical input    800 J", 30),
                ("useful", "Useful motion    560 J", 30),
                ("decimal", "560 ÷ 800  =  0.7", 34),
                ("percent", "Efficiency  =  70%", 40),
                ("why", "Friction or resistance warms the motor", 24),
            ],
        })
        return
    if name == "ballpath":
        _draw_trajectory(d, box, view, "ball")
        return
    if name == "skier":
        _draw_trajectory(d, box, view, "skier")
        return
    if name == "cond_bars":
        _bars(d, box, view, "Illustrative thermal conductivity  /  W per metre per kelvin", [
            ("air", "Air and foam", 0.03),
            ("fibreglass", "Fibreglass", 0.04),
            ("wool", "Wool felt", 0.05),
            ("wood", "Wood", 0.15),
            ("plaster", "Plaster", 0.50),
            ("glass", "Glass", 0.80),
            ("brick", "Brick", 1.00),
            ("concrete", "Concrete", 1.04),
        ], "Illustrative values. Use the table printed in the examination.")
        return
    if name == "brick":
        _bars(d, box, view, "Same thickness, area and temperature difference", [
            ("fibreglass", "Fibreglass", 0.04),
            ("brick", "Brick", 1.00),
        ], "Brick conducts about 25 times as readily as fibreglass.")
        if view.on("ratio"):
            d.text((box[0], box[3] - 8), "1.00 ÷ 0.04  =  25", font=font("bold", 36), fill=GOLD, anchor="lb")
        if view.on("careful"):
            d.text((box[0] + 700, box[3] - 8), "Say '25 times the conductivity', not simply '25 times better'.", font=font("regular", 20), fill=AMBER, anchor="lb")
        return
    if name == "wood":
        if box[2] - box[0] < 1200 and not view.on("values"):
            d.text((box[0] + 24, box[1] + 80), "Wood or plaster?", font=font("bold", 36), fill=WHITE)
            d.text((box[0] + 24, box[1] + 132), "Same thickness.", font=font("regular", 22), fill=MUTED)
            return
        _bars(d, box, view, "Which is the better insulator?", [
            ("values", "Wood", 0.15),
            ("values", "Plaster", 0.50),
        ], "Lower conductivity resists conduction more at the same thickness.")
        # both bars share the values flag; show ratio when spoken
        if view.on("ask") and not view.on("values"):
            d.text((box[0], box[1] + 80), "Wood or plaster?", font=font("bold", 40), fill=WHITE)
        if view.on("ratio"):
            d.text((box[0], box[3] - 8), "0.50 ÷ 0.15  ≈  3.3", font=font("bold", 36), fill=GOLD, anchor="lb")
        return
    if name == "cycle":
        _stack(d, (box[0], box[1], box[2], box[3]), view, [
            ("mass", "m = 80 kg", 32),
            ("speed", "v = 6 m/s", 32),
            ("result", "Eₖ = ½ × 80 × 6² = 1,440 J", 30),
            ("double", "Speed doubles", 30),
            ("four", "Kinetic energy becomes × 4", 32),
        ])
        return
    if name == "lorry":
        rounded(d, (box[0] + 40, box[1] + 80, box[0] + 280, box[1] + 160), 12, TEAL_MID)
        wheel(d, box[0] + 90, box[1] + 160, 18)
        wheel(d, box[0] + 220, box[1] + 160, 18)
        d.text((box[0] + 160, box[1] + 110), "lorry", font=font("bold", 22), fill=WHITE, anchor="mm")
        if view.on("kinetic"):
            d.text((box[0] + 320, box[1] + 80), "Kinetic store decreases", font=font("bold", 26), fill=WHITE)
        if view.on("brakes"):
            d.ellipse((box[0] + 80, box[1] + 200, box[0] + 150, box[1] + 270), outline=CORAL, width=6)
            d.text((box[0] + 180, box[1] + 230), "Brakes heat up", font=font("bold", 24), fill=CORAL)
        if view.on("surroundings"):
            arrow(d, box[0] + 200, box[1] + 250, box[0] + 460, box[1] + 250, AMBER, 4)
            d.text((box[0] + 480, box[1] + 250), "surroundings, heating and sound", font=font("regular", 22), fill=MUTED, anchor="lm")
        return
    if name == "coal":
        _draw_plant(d, box, view, [
            ("mined", "Mine and burn", "Chemical store heats water"),
            ("control", "Steam turbine", "Controllable generation"),
            ("co2", "Carbon dioxide", "Contributes to climate change"),
            ("pollution", "Other pollution", "Sulfur dioxide, particulates"),
        ])
        if view.on("co2"):
            flow_dots(d, box[0] + 40, box[1] + 250, box[2] - 40, box[1] + 250, view.t, CORAL, n=4)
        return
    if name == "nuclear":
        nucleus(d, box[0] + 40, box[1] + 30)
        _row_block(d, (box[0] + 120, box[1], box[2], box[3]), view, ROWS["nuclear"])
        return
    if name == "solarwind":
        if view.on("pv") or view.on("thermal"):
            sun(d, box[0] + 80, box[1] + 70, view.t, 28)
        if view.on("wind"):
            turbine(d, box[0] + 220, box[1] + 80, view.t, 48)
        _row_block(d, (box[0] + 340, box[1], box[2], box[3]), view, ROWS["solarwind"])
        return
    if name == "solar":
        sun(d, box[0] + 100, box[1] + 70, view.t)
        d.polygon([(box[0] + 40, box[1] + 180), (box[0] + 180, box[1] + 130), (box[0] + 230, box[1] + 200), (box[0] + 90, box[1] + 250)], fill=(20, 60, 110), outline=TEAL_BAR)
        if view.on("radiation"):
            flow_dots(d, box[0] + 100, box[1] + 110, box[0] + 140, box[1] + 170, view.t, AMBER)
            d.text((box[0] + 260, box[1] + 80), "Electromagnetic radiation", font=font("bold", 26), fill=AMBER)
        if view.on("electrical"):
            d.text((box[0] + 260, box[1] + 140), "Electrical output", font=font("bold", 28), fill=TEAL_BAR)
            view.hotspot = (box[0] + 260, box[1] + 140)
        return
    if name in ROWS:
        art_w = 0
        if name == "tidalhydro" and (view.on("hydro") or view.on("tidal")):
            _draw_hydro(d, (box[0], box[1], box[0] + 520, box[3]), view) if False else None
        _row_block(d, box, view, ROWS[name])
        return
    # last resort: show the scene title so the frame is never blank
    d.text((box[0], box[1] + 20), scene_title(view), font=font("bold", 32), fill=WHITE)


def scene_title(view) -> str:
    return view.scene.title


def fake_words(scene: Scene):
    words = scene.text.split()
    return [(w, i * 0.35) for i, w in enumerate(words)]


def flag_times_from_words(diagram: str, words) -> dict[str, list[float]]:
    import re

    def norm(token: str) -> str:
        token = token.lower().replace("’", "'").replace(",", "")
        return token.strip(".,;:!?\"'()[]")

    norms = [norm(w) for w, _ in words]
    found: dict[str, list[float]] = {}
    for phrase, flag in CUES.get(diagram, []):
        target = [norm(w) for w in phrase.split()]
        target = [w for w in target if w]
        if not target:
            continue
        for i in range(len(norms) - len(target) + 1):
            if norms[i:i + len(target)] == target:
                found.setdefault(flag, []).append(words[i][1])
    return found
