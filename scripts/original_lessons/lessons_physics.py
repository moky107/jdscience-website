"""Original BTEC Unit 1 Physics lessons."""

from __future__ import annotations

from . import diagrams as dg
from .lessons_extra import add_properties_depth, add_waves_depth
from .theme import (
    answer_slide,
    content_slide,
    diagram_slide,
    misconception_slide,
    new_presentation,
    objectives_slide,
    question_slide,
    save_prs,
    section_slide,
    activity_slide,
    table_slide,
    title_slide,
    two_col,
)


def build_progressive_waves(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Physics: Progressive Waves"
    title_slide(prs, title, "Displacement, amplitude, wavelength, frequency and the wave equation.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Physics", d["wave_snapshot"])
    objectives_slide(prs, [
        "Describe a progressive wave as a transfer of energy without a net transfer of matter.",
        "Define amplitude, wavelength, frequency, period and wave speed.",
        "Use v = fλ and T = 1/f with correct SI units.",
        "Distinguish measured displacement from amplitude.",
        "Interpret a displacement–distance snapshot of a wave.",
    ])
    question_slide(prs, "Prior knowledge", [
        "What does a wave transfer from one place to another?",
        "Give one example of a wave that needs a medium and one that does not.",
        "If 20 crests pass a point in 5.0 s, what is the frequency?",
        "What are the SI units of frequency and of wavelength?",
    ], "Do now")
    answer_slide(prs, "Retrieval answers", [
        "Energy (and information).",
        "Needs a medium: sound or water waves. Does not: electromagnetic waves / light.",
        "f = 20 / 5.0 = 4.0 Hz.",
        "Frequency: hertz (Hz). Wavelength: metre (m).",
    ])
    section_slide(prs, "What a progressive wave is", "Energy on the move")
    content_slide(prs, "A working definition", [
        "A progressive wave transfers energy from the source through oscillations of particles or fields.",
        "The oscillations are about an equilibrium position; the particles do not travel with the wave in a transverse water wave.",
        "A snapshot graph shows displacement against distance at one instant.",
        "A trace at one position shows displacement against time.",
        "Both graphs are needed to extract λ, A, T and f.",
    ])
    diagram_slide(prs, "Reading a wave snapshot", d["wave_snapshot"], "Original displacement–distance sketch.", [
        "Amplitude, A, is the maximum displacement from equilibrium.",
        "Wavelength, λ, is the shortest distance between two points in phase.",
        "Neighbouring crests (or neighbouring troughs) are one wavelength apart.",
        "The equilibrium line is not the same as a trough.",
    ])
    table_slide(prs, "Wave quantities", ["Quantity", "Symbol", "SI unit", "Meaning"], [
        ["Displacement", "s or x", "m", "Distance from equilibrium at that instant"],
        ["Amplitude", "A", "m", "Maximum displacement"],
        ["Wavelength", "λ", "m", "Shortest distance between points in phase"],
        ["Frequency", "f", "Hz", "Oscillations per second"],
        ["Period", "T", "s", "Time for one complete oscillation"],
        ["Wave speed", "v", "m s−1", "Distance the wave profile travels per second"],
    ])
    content_slide(prs, "Frequency and period", [
        "T = 1 / f and f = 1 / T.",
        "If T = 0.020 s, f = 50 Hz.",
        "If f = 2.5 kHz, convert to 2500 Hz first, then T = 4.0 × 10−4 s.",
        "Frequency is set by the source, not by the medium.",
        "When a wave changes medium, frequency stays the same; speed and wavelength change.",
    ])
    section_slide(prs, "The wave equation", "v = fλ")
    content_slide(prs, "Why the equation works", [
        "In one second the source produces f oscillations.",
        "Each oscillation occupies a length λ.",
        "So the wave profile advances f × λ metres in one second.",
        "That distance per second is the wave speed v.",
        "Rearrangements: f = v / λ and λ = v / f.",
    ])
    content_slide(prs, "Worked example 1 — sound", [
        "A tuning fork of frequency 512 Hz produces sound of wavelength 0.65 m in air.",
        "v = fλ = 512 × 0.65",
        "v = 333 m s−1 (3 s.f.).",
        "This is a sensible speed of sound in air.",
        "If the same frequency entered water, v would increase and λ would increase.",
    ])
    content_slide(prs, "Worked example 2 — radio wave", [
        "A radio station broadcasts at 100 MHz. Take c = 3.00 × 108 m s−1.",
        "f = 1.00 × 108 Hz.",
        "λ = v / f = 3.00 × 108 / 1.00 × 108 = 3.00 m.",
        "Write the standard form and the unit every time.",
        "Electromagnetic waves in air travel at approximately the speed of light in vacuum.",
    ])
    question_slide(prs, "Wave-equation practice", [
        "Water waves have f = 2.5 Hz and λ = 1.2 m. Find v.",
        "A microwave oven uses f = 2.45 GHz. Taking c = 3.00 × 108 m s−1, find λ.",
        "A wave travels 90 m in 0.30 s. If λ = 1.5 m, find f.",
    ])
    answer_slide(prs, "Calculation answers", [
        "v = 2.5 × 1.2 = 3.0 m s−1.",
        "f = 2.45 × 109 Hz. λ = 3.00×108 / 2.45×109 = 0.122 m (12.2 cm).",
        "v = 90 / 0.30 = 300 m s−1. f = v / λ = 300 / 1.5 = 200 Hz.",
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
    add_waves_depth(prs)
    question_slide(prs, "Exam-style practice", [
        "Define amplitude and wavelength. (2)",
        "A loudspeaker produces a note of frequency 680 Hz. The speed of sound is 340 m s−1. Calculate the wavelength. (2)",
        "Explain why particles of air do not travel from a singer to a listener even though a sound wave does. (3)",
    ], "Exam-style practice")
    answer_slide(prs, "Exam-style answers", [
        "Amplitude: maximum displacement from equilibrium. Wavelength: shortest distance between two points oscillating in phase / crest to adjacent crest.",
        "λ = v / f = 340 / 680 = 0.50 m.",
        "Air particles oscillate about fixed average positions. Energy is passed from particle to particle. There is no net movement of air from singer to listener.",
    ])
    content_slide(prs, "Plenary", [
        "Write v = fλ and annotate each symbol with a unit.",
        "Sketch one wavelength and mark A and λ.",
        "State what stays the same when a wave crosses into a new medium.",
    ])
    content_slide(prs, "Independent practice", [
        "Complete the progressive-waves worksheet.",
        "Practise 1/f and unit conversions (kHz, MHz, GHz, nm, mm).",
        "Next lesson: transverse and longitudinal behaviour and phase.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Physics", "Progressive waves")
    return title, len(prs.slides)


def build_wave_properties(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Physics: Wave Properties"
    title_slide(prs, title, "Transverse and longitudinal waves, phase, superposition and everyday examples.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Physics", d["long_vs_trans"])
    objectives_slide(prs, [
        "Distinguish transverse and longitudinal waves with examples.",
        "Describe compressions, rarefactions, crests and troughs.",
        "Explain what is meant by phase and path difference.",
        "State the principle of superposition.",
        "Apply these ideas to sound, water waves and electromagnetic waves.",
    ])
    question_slide(prs, "Prior knowledge", [
        "Is light transverse or longitudinal?",
        "Is sound in air transverse or longitudinal?",
        "What is transferred by a wave?",
        "Name one piece of evidence that light is a wave.",
    ], "Do now")
    answer_slide(prs, "Retrieval answers", [
        "Transverse — oscillations of the electric and magnetic fields are perpendicular to the direction of travel.",
        "Longitudinal — air particles oscillate parallel to the direction of energy transfer.",
        "Energy.",
        "Interference / diffraction / polarisation of light.",
    ])
    section_slide(prs, "Two families of wave", "Direction of oscillation")
    diagram_slide(prs, "Transverse and longitudinal", d["long_vs_trans"], "Original comparison of oscillation direction.", [
        "Transverse: oscillation perpendicular to energy transfer.",
        "Examples: water surface waves, waves on a string, all electromagnetic waves.",
        "Longitudinal: oscillation parallel to energy transfer.",
        "Examples: sound in air, P-waves from earthquakes, compression waves in a slinky.",
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
    content_slide(prs, "Electromagnetic waves are transverse", [
        "They do not need a medium.",
        "They travel at 3.00 × 108 m s−1 in vacuum.",
        "They form a spectrum from radio waves to gamma rays.",
        "Polarising filters work because the oscillations have a direction.",
        "Sound cannot be polarised, which is evidence that it is longitudinal.",
    ])
    section_slide(prs, "Phase and superposition", "How waves combine")
    content_slide(prs, "Phase", [
        "Two points are in phase if they reach maxima and minima together.",
        "Points separated by a whole number of wavelengths are in phase.",
        "Points separated by an odd number of half-wavelengths are in antiphase.",
        "Phase difference can be given in degrees or radians (360° = 2π rad = one cycle).",
        "Path difference is the extra distance one wave travels compared with another.",
    ])
    content_slide(prs, "Principle of superposition", [
        "When two waves meet, the resultant displacement is the vector sum of the individual displacements.",
        "The waves then continue as if they had not met.",
        "Constructive superposition: displacements in the same direction add.",
        "Destructive superposition: opposite displacements cancel.",
        "This idea is the basis of interference and of stationary waves (later topics).",
    ])
    content_slide(prs, "Worked example — phase from a picture", [
        "Two crests are 3.0 cm apart on a ripple tank photograph. The wavelength is 1.5 cm.",
        "Separation / λ = 3.0 / 1.5 = 2.0, so they are in phase.",
        "A crest and the neighbouring trough are 0.75 cm apart: 0.75 / 1.5 = 0.5, so they are in antiphase.",
        "Always compare the separation with λ, not with amplitude.",
        "If the graph is against time, use T in the same way.",
    ])
    activity_slide(prs, "Classify and justify", [
        "For each: ultrasound scan, microwave oven, stadium Mexican wave, earthquake P-wave, stadium sound system.",
        "State transverse / longitudinal / not a physical wave, and name the oscillating 'particle' or field.",
        "Identify one that can be polarised and one that cannot.",
    ], "8 minutes")
    answer_slide(prs, "Classification checkpoints", [
        "Ultrasound: longitudinal pressure wave in tissue.",
        "Microwave: transverse electromagnetic wave.",
        "Mexican wave: a useful model of a transverse pulse along people, not a physics wave in a medium in the usual sense — treat carefully.",
        "P-wave: longitudinal. Stadium sound: longitudinal sound.",
        "Microwaves can be polarised; sound cannot.",
    ])
    table_slide(prs, "Media and wave type", ["Wave", "Type", "Needs a medium?", "Typical speed order"], [
        ["Sound in air", "Longitudinal", "Yes", "10^2 m s−1"],
        ["Ripples on water", "Transverse (surface)", "Yes", "10^0 m s−1"],
        ["Light in vacuum", "Transverse EM", "No", "10^8 m s−1"],
        ["Waves on a string", "Transverse", "Yes (the string)", "depends on tension"],
    ])
    misconception_slide(prs, [
        ("Sound is a transverse wave because we draw it as a sine curve.", "The sine curve is a graph of pressure or displacement; the oscillation is still parallel to travel."),
        ("Waves that cancel are destroyed forever.", "Each wave continues; cancellation is local and temporary."),
        ("All waves need air.", "Electromagnetic waves do not."),
    ])
    add_properties_depth(prs)
    question_slide(prs, "Exam-style practice", [
        "Describe the difference between a transverse wave and a longitudinal wave. Give one example of each. (4)",
        "State the principle of superposition. (2)",
        "Explain why sound waves from a loudspeaker cannot be polarised. (2)",
    ], "Exam-style practice")
    answer_slide(prs, "Exam-style answers", [
        "Transverse: oscillation perpendicular to energy transfer, e.g. light or water waves. Longitudinal: oscillation parallel to energy transfer, e.g. sound in air.",
        "When waves meet, the resultant displacement equals the sum of the individual displacements.",
        "Polarisation requires a transverse oscillation with a direction that can be filtered. Sound is longitudinal, so there is no such direction to filter.",
    ])
    content_slide(prs, "Plenary", [
        "Act: students stand in a line and model a longitudinal compression, then a transverse oscillation.",
        "Write one sentence on superposition.",
        "Name one wave that can be polarised.",
    ])
    content_slide(prs, "Independent practice", [
        "Complete the wave-properties worksheet.",
        "Revise progressive-wave calculations so the two lessons connect.",
        "Later Unit 1 lessons apply these ideas to diffraction, interference and refraction.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Physics", "Wave properties")
    return title, len(prs.slides)
