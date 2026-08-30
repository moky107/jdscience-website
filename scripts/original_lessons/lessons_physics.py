"""Original BTEC Unit 1 Physics lessons — commercial layouts and Level 3 depth."""

from __future__ import annotations

from . import diagrams as dg
from .theme import (
    activity_slide,
    answer_cards,
    calc_scaffold,
    depth_check,
    diagram_explain,
    fact_cards,
    homework_slide,
    match_slide,
    misconception_slide,
    new_presentation,
    objectives_slide,
    plenary_slide,
    process_steps,
    question_cards,
    save_prs,
    section_slide,
    table_slide,
    title_slide,
    two_col,
    whiteboard_slide,
    worked_example,
)


def build_progressive_waves(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Physics: Progressive Waves"
    title_slide(
        prs, title,
        "Displacement, amplitude, wavelength, frequency, period, phase and v = fλ with standard form.",
        "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Physics",
        d["wave_snapshot"],
    )
    objectives_slide(prs, [
        "Describe a progressive wave as a transfer of energy without a net transfer of matter.",
        "Define amplitude, wavelength, frequency, period and wave speed with SI units.",
        "Use v = fλ and T = 1/f, including standard-form conversions.",
        "Read A and λ from a displacement–distance snapshot and T from a time trace.",
        "Explain what stays the same, and what changes, when a wave enters a new medium.",
    ])
    depth_check(prs, [
        ["Waves move stuff along", "Energy transfers; particles oscillate about equilibrium"],
        ["Amplitude is crest to trough", "A is measured from the equilibrium line; crest-to-trough is 2A"],
        ["v = fλ as a slogan", "Derive it: f oscillations each of length λ in one second"],
        ["Frequency changes in glass", "Frequency is fixed by the source; v and λ change"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("What does a wave transfer from one place to another?", "1"),
        ("Give one wave that needs a medium and one that does not.", "2"),
        ("If 20 crests pass a point in 5.0 s, what is the frequency?", "2"),
        ("What are the SI units of frequency and of wavelength?", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Energy (and information).",
        "Needs a medium: sound or water. Does not: electromagnetic waves / light.",
        "f = 20 / 5.0 = 4.0 Hz.",
        "Frequency: hertz (Hz). Wavelength: metre (m).",
    ])
    section_slide(prs, "What a progressive wave is", "Energy on the move")
    fact_cards(prs, "A working definition", [
        ("Transfer", "A progressive wave transfers energy from a source through oscillations of particles or fields."),
        ("Particles", "Oscillations are about an equilibrium position — no net transfer of matter."),
        ("Snapshot", "Displacement against distance at one instant gives A and λ."),
        ("Trace", "Displacement against time at one place gives A and T, then f = 1/T."),
    ])
    diagram_explain(prs, "Reading a wave snapshot", d["wave_snapshot"], [
        "Amplitude A is the maximum displacement from equilibrium.",
        "Wavelength λ is the shortest distance between two points in phase.",
        "Neighbouring crests (or troughs) are one wavelength apart.",
        "The equilibrium line is not a trough.",
        "Crest-to-trough height is 2A.",
    ], "Original displacement–distance sketch.")
    table_slide(prs, "Wave quantities", ["Quantity", "Symbol", "SI unit", "Meaning"], [
        ["Displacement", "s or x", "m", "Distance from equilibrium at that instant"],
        ["Amplitude", "A", "m", "Maximum displacement"],
        ["Wavelength", "λ", "m", "Shortest distance between points in phase"],
        ["Frequency", "f", "Hz", "Oscillations per second"],
        ["Period", "T", "s", "Time for one complete oscillation"],
        ["Wave speed", "v", f"m s^{{-1}}", "Distance the wave profile travels per second"],
    ], "Write the unit of v as m s^{−1}, not just m.")
    diagram_explain(prs, "Frequency and period", d["period_frequency"], [
        "T = 1 / f and f = 1 / T.",
        "If T = 0.020 s, f = 50 Hz.",
        "If f = 2.5 kHz, convert to 2500 Hz first: T = 4.0 × 10^{−4} s.",
        "Frequency is set by the source, not by the medium.",
    ])
    diagram_explain(prs, "Phase on a snapshot", d["phase_points"], [
        "Points a whole number of wavelengths apart are in phase.",
        "Points 0.5 λ apart are in antiphase.",
        "You cannot read λ from a time graph or T from a distance graph.",
        "Both graphs can look like sine waves — label the axis first.",
    ])
    section_slide(prs, "The wave equation", "v = fλ")
    process_steps(prs, "Why the equation works", [
        ("In 1 s", "The source produces f oscillations."),
        ("Each one", "Occupies a length λ."),
        ("So", "The profile advances f × λ metres in one second."),
        ("That is v", "v = fλ"),
        ("Rearrange", "f = v / λ     λ = v / f"),
    ])
    worked_example(
        prs, "Sound — tuning fork",
        "A tuning fork of frequency 512 Hz produces sound of wavelength 0.65 m in air. Calculate v.",
        "v = fλ",
        "v = 512 Hz × 0.65 m",
        "v = 332.8",
        "333",
        "m s^{−1} (3 s.f.)",
        "This is a sensible speed of sound in air. If the same frequency entered water, v and λ would both increase.",
    )
    worked_example(
        prs, "Radio wave — standard form",
        "A radio station broadcasts at 100 MHz. Take c = 3.00 × 10^{8} m s^{−1}. Calculate λ.",
        "λ = v / f",
        "f = 100 MHz = 1.00 × 10^{8} Hz     v = 3.00 × 10^{8} m s^{−1}",
        "λ = (3.00 × 10^{8}) / (1.00 × 10^{8}) = 3.00",
        "3.00 m",
        "",
        "Write the powers of ten on a separate line. Electromagnetic waves in air travel at approximately c.",
    )
    diagram_explain(prs, "Standard form you must convert", d["standard_form_visual"], [
        "1 MHz = 1 × 10^{6} Hz.  1 GHz = 1 × 10^{9} Hz.",
        "1 nm = 1 × 10^{−9} m.",
        "Always convert to Hz and m before using v = fλ.",
        "Worked check: 600 nm light. f = (3.00 × 10^{8}) / (6.00 × 10^{−7}) = 5.00 × 10^{14} Hz.",
    ])
    diagram_explain(prs, "Changing medium — wavefronts", d["wavefront_medium"], [
        "Frequency stays the same at the boundary.",
        "If speed falls, wavelength shortens — the wavefronts crowd together.",
        "If speed rises, wavelength increases.",
        "This is the same logic as light slowing in glass.",
    ])
    worked_example(
        prs, "Water waves entering shallows",
        "Frequency is 2.0 Hz in both regions. Deep-water speed 0.80 m s^{−1}; shallow-water speed 0.50 m s^{−1}. Find both wavelengths.",
        "λ = v / f",
        "f = 2.0 Hz in both regions",
        "λ_deep = 0.80 / 2.0 = 0.40 m     λ_shallow = 0.50 / 2.0 = 0.25 m",
        "0.40 m and 0.25 m",
        "",
        "The waves crowd together because speed fell while frequency stayed the same.",
    )
    calc_scaffold(
        prs, "Calculation scaffold",
        ["25 cm wavelength", "4.0 kHz frequency"],
        ["v in m s^{−1}"],
        "Convert first: λ = 0.25 m, f = 4000 Hz.",
    )
    question_cards(prs, "Wave-equation practice", [
        ("Water waves have f = 2.5 Hz and λ = 1.2 m. Find v.", "2"),
        ("A microwave oven uses f = 2.45 GHz. Taking c = 3.00 × 10^{8} m s^{−1}, find λ.", "3"),
        ("A wave travels 90 m in 0.30 s. If λ = 1.5 m, find f.", "3"),
    ])
    answer_cards(prs, "Calculation answers", [
        "v = 2.5 × 1.2 = 3.0 m s^{−1}.",
        "f = 2.45 × 10^{9} Hz. λ = (3.00 × 10^{8}) / (2.45 × 10^{9}) = 0.122 m (12.2 cm).",
        "v = 90 / 0.30 = 300 m s^{−1}. f = 300 / 1.5 = 200 Hz.",
    ])
    activity_slide(prs, "Graph reading", [
        "From a displacement–distance graph: measure A and λ (use the scale).",
        "From a displacement–time graph of the same wave: measure T and calculate f.",
        "Combine f and λ to find v.",
        "State which quantity you must not read as amplitude (a random displacement).",
    ], "10 minutes")
    misconception_slide(prs, [
        ("Amplitude is the crest-to-trough height.", "That distance is 2A. Amplitude is measured from the equilibrium line."),
        ("Wave speed is how fast a particle travels along the wave.", "v is the speed of the wave profile / energy transfer."),
        ("Frequency changes when a wave enters glass.", "Frequency is fixed by the source."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Define amplitude and wavelength.", "2"),
        ("A loudspeaker produces a note of frequency 680 Hz. The speed of sound is 340 m s^{−1}. Calculate the wavelength.", "2"),
        ("Explain why particles of air do not travel from a singer to a listener even though a sound wave does.", "3"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Amplitude: maximum displacement from equilibrium. Wavelength: shortest distance between two points oscillating in phase.",
        "λ = v / f = 340 / 680 = 0.50 m.",
        "Air particles oscillate about fixed average positions. Energy is passed from particle to particle. There is no net movement of air.",
    ])
    plenary_slide(prs, [
        "Write v = fλ and annotate each symbol with a unit.",
        "Sketch one wavelength and mark A and λ.",
        "State what stays the same when a wave crosses into a new medium.",
    ])
    homework_slide(prs, [
        "Complete the Progressive Waves worksheet, including the calculation pages.",
        "Practise 1/f and unit conversions (kHz, MHz, GHz, nm, mm).",
        "Next lesson: transverse and longitudinal behaviour, phase and superposition.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Physics", "Progressive waves")
    return title, len(prs.slides)


def build_wave_properties(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Physics: Wave Properties"
    title_slide(prs, title, "Transverse and longitudinal waves, phase, superposition, polarisation and everyday examples.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Physics", d["long_vs_trans"])
    objectives_slide(prs, [
        "Distinguish transverse and longitudinal waves with examples and diagrams.",
        "Describe compressions, rarefactions, crests and troughs.",
        "Explain phase, antiphase and path difference.",
        "State the principle of superposition and recognise constructive and destructive cases.",
        "Use polarisation as evidence that light is transverse and sound is not.",
    ])
    depth_check(prs, [
        ["Sound is a sine wave so it is transverse", "The sine curve is a graph; the oscillation is still parallel to travel"],
        ["Waves destroy each other", "Superposition is local; each wave continues"],
        ["All waves need air", "Electromagnetic waves do not need a medium"],
        ["Polarising sunglasses are a trick", "They filter a transverse oscillation plane"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("Is light transverse or longitudinal?", "1"),
        ("Is sound in air transverse or longitudinal?", "1"),
        ("What is transferred by a wave?", "1"),
        ("Name one piece of evidence that light is a wave.", "2"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Transverse — oscillations of the electric and magnetic fields are perpendicular to travel.",
        "Longitudinal — air particles oscillate parallel to the direction of energy transfer.",
        "Energy.",
        "Interference / diffraction / polarisation of light.",
    ])
    section_slide(prs, "Two families of wave", "Direction of oscillation")
    diagram_explain(prs, "Transverse and longitudinal", d["long_vs_trans"], [
        "Transverse: oscillation perpendicular to energy transfer.",
        "Examples: water surface waves, waves on a string, all electromagnetic waves.",
        "Longitudinal: oscillation parallel to energy transfer.",
        "Examples: sound in air, P-waves, compression waves on a slinky.",
    ])
    two_col(prs, "Language for each type", "Transverse words", [
        "Crest — maximum positive displacement",
        "Trough — maximum negative displacement",
        "Amplitude — height from equilibrium",
        "Can be polarised",
    ], "Longitudinal words", [
        "Compression — region of higher pressure / closer particles",
        "Rarefaction — region of lower pressure / more spaced particles",
        "Wavelength — compression to next compression",
        "Cannot be polarised",
    ])
    fact_cards(prs, "Electromagnetic waves are transverse", [
        ("Medium", "They do not need a medium."),
        ("Speed", "They travel at 3.00 × 10^{8} m s^{−1} in vacuum."),
        ("Spectrum", "From radio waves to gamma rays."),
        ("Evidence", "Polarising filters work because the oscillations have a direction. Sound cannot be polarised."),
    ])
    section_slide(prs, "Phase and superposition", "How waves combine")
    diagram_explain(prs, "Phase", d["phase_points"], [
        "Two points are in phase if they reach maxima and minima together.",
        "Points separated by a whole number of wavelengths are in phase.",
        "Points separated by an odd number of half-wavelengths are in antiphase.",
        "Path difference is the extra distance one wave travels compared with another.",
    ])
    diagram_explain(prs, "Principle of superposition", d["superposition"], [
        "When two waves meet, the resultant displacement is the vector sum of the individual displacements.",
        "The waves then continue as if they had not met.",
        "Constructive: displacements in the same direction add.",
        "Destructive: opposite displacements cancel.",
        "This is the basis of interference and of later stationary-wave work.",
    ])
    worked_example(
        prs, "Phase from a photograph",
        "Two crests are 3.0 cm apart on a ripple-tank photograph. The wavelength is 1.5 cm. Are they in phase?",
        "separation / λ",
        "3.0 / 1.5 = 2.0",
        "2.0 is a whole number of wavelengths",
        "in phase",
        "",
        "A crest and the neighbouring trough 0.75 cm apart: 0.75 / 1.5 = 0.5, so they are in antiphase.",
    )
    fact_cards(prs, "Path difference preview", [
        ("nλ", "Constructive interference — the waves arrive in phase."),
        ("(n + ½)λ", "Destructive interference — the waves arrive in antiphase."),
        ("Later", "You will use this in Young’s slits and diffraction-grating lessons."),
        ("Word", "Use displacement, not ‘the waves add energy and vanish’."),
    ])
    two_col(prs, "Everyday applications", "Longitudinal", [
        "Speaking and hearing",
        "Ultrasound scans",
        "Sonar",
        "Earthquake P-waves",
    ], "Transverse", [
        "Visible light and radio",
        "Microwaves in ovens and Wi-Fi",
        "Polarising sunglasses",
        "Waves on musical strings",
    ])
    table_slide(prs, "Media and wave type", ["Wave", "Type", "Needs a medium?", "Typical speed order"], [
        ["Sound in air", "Longitudinal", "Yes", "10^{2} m s^{−1}"],
        ["Ripples on water", "Transverse (surface)", "Yes", "10^{0} m s^{−1}"],
        ["Light in vacuum", "Transverse EM", "No", "3.00 × 10^{8} m s^{−1}"],
        ["Waves on a string", "Transverse", "Yes (the string)", "depends on tension"],
    ])
    two_col(prs, "Earthquakes — why the distinction matters", "P-waves", [
        "Longitudinal",
        "Travel through solids and liquids",
        "Faster",
        "Detected on the far side of the Earth",
    ], "S-waves", [
        "Transverse",
        "Do not travel through the liquid outer core",
        "Slower",
        "Do travel through the solid mantle — do not say they ‘cannot travel through the Earth’",
    ])
    activity_slide(prs, "Classify and justify", [
        "For each: ultrasound scan, microwave oven, stadium Mexican wave, earthquake P-wave, stadium sound system.",
        "State transverse / longitudinal / model only, and name the oscillating particle or field.",
        "Identify one that can be polarised and one that cannot.",
    ], "8 minutes")
    answer_cards(prs, "Classification checkpoints", [
        "Ultrasound: longitudinal pressure wave in tissue.",
        "Microwave: transverse electromagnetic wave — can be polarised.",
        "Mexican wave: a useful model of a transverse pulse, not a physics wave in a medium — treat carefully.",
        "P-wave: longitudinal. Stadium sound: longitudinal. Sound cannot be polarised.",
    ])
    misconception_slide(prs, [
        ("Sound is a transverse wave because we draw it as a sine curve.", "The sine curve is a graph of pressure or displacement; the oscillation is still parallel to travel."),
        ("Waves that cancel are destroyed forever.", "Each wave continues; cancellation is local and temporary."),
        ("All waves need air.", "Electromagnetic waves do not."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Describe the difference between a transverse wave and a longitudinal wave. Give one example of each.", "4"),
        ("State the principle of superposition.", "2"),
        ("Explain why sound waves from a loudspeaker cannot be polarised.", "2"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Transverse: oscillation perpendicular to energy transfer, e.g. light or water waves. Longitudinal: oscillation parallel to energy transfer, e.g. sound in air.",
        "When waves meet, the resultant displacement equals the sum of the individual displacements.",
        "Polarisation requires a transverse oscillation with a direction that can be filtered. Sound is longitudinal, so there is no such direction to filter.",
    ])
    plenary_slide(prs, [
        "Act: model a longitudinal compression, then a transverse oscillation.",
        "Write one sentence on superposition using the word displacement.",
        "Name one wave that can be polarised and one that cannot.",
    ])
    homework_slide(prs, [
        "Complete the Wave Properties worksheet.",
        "Revise progressive-wave calculations so the two lessons connect.",
        "Later Unit 1 lessons apply these ideas to diffraction, interference and refraction.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Physics", "Wave properties")
    return title, len(prs.slides)
