"""Original BTEC Unit 1 Chemistry lessons — commercial layouts and Level 3 depth."""

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


def build_atomic_structure(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Chemistry: Atomic Structure"
    title_slide(
        prs, title,
        "Subatomic particles, nuclide notation, isotopes, A_{r} and ion formation — taught as a BTEC Level 3 Unit 1 lesson.",
        "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Chemistry",
        d["atom_labelled"],
    )
    objectives_slide(prs, [
        "State relative charge, relative mass and location of protons, neutrons and electrons.",
        "Use A and Z to calculate protons, neutrons and electrons, including ions.",
        "Explain isotopes and why chemical properties stay the same.",
        "Calculate A_{r} from percentage abundances and interpret a simple mass spectrum.",
        "Describe ion formation as a change in electrons, not protons.",
    ])
    depth_check(prs, [
        ["Particles are +1, 0, −1", "Use charge arithmetic: charge = protons − electrons"],
        ["Isotopes have different mass", "Same Z, different neutrons; chemical properties match because electrons match"],
        ["A_{r} is on the periodic table", "A_{r} is a weighted mean versus 1/12 of ^{12}C; no unit"],
        ["Ions are charged atoms", "Nucleus unchanged; link to later bonding and electrostatic attraction"],
    ])
    question_cards(prs, "Prior-knowledge retrieval", [
        ("Name the three subatomic particles found in an atom.", "1"),
        ("Which particle determines which element an atom is?", "1"),
        ("What is the difference between an atom and a molecule?", "2"),
        ("Is the nucleus positive, negative or neutral — and why?", "2"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Proton, neutron and electron.",
        "The proton number (atomic number, Z).",
        "An atom is a single particle of an element. A molecule contains two or more atoms chemically bonded.",
        "Positive — the nucleus contains protons (and uncharged neutrons).",
    ])
    section_slide(prs, "The nuclear model", "A tiny dense nucleus; electrons in shells")
    diagram_explain(prs, "A labelled lithium-7 atom", d["atom_labelled"], [
        "Almost all of the mass is in the nucleus.",
        "The nucleus occupies a tiny fraction of the volume.",
        "Electrons occupy shells (energy levels).",
        "A neutral atom has equal numbers of protons and electrons.",
        "Chemical behaviour depends on the outer electrons.",
    ], "Original schematic of ^{7}Li — 3 protons, 4 neutrons, 3 electrons. Not to scale.")
    diagram_explain(prs, "Comparing the three particles", d["particle_compare"], [
        "Protons identify the element.",
        "Neutrons change the isotope without changing Z.",
        "Electrons are lost or gained when ions form.",
        "Relative electron mass is about 1/1836 — treat as negligible in mass number.",
    ])
    table_slide(prs, "Subatomic particles", ["Particle", "Relative charge", "Relative mass", "Where found"], [
        ["Proton", "+1", "1", "Nucleus"],
        ["Neutron", "0", "1", "Nucleus"],
        ["Electron", "−1", "≈ 1/1836", "Shells"],
    ], "Learn this table exactly. Examiners expect charge and mass, not just names.")
    section_slide(prs, "Reading a nuclide symbol", "Mass number top left, atomic number bottom left")
    diagram_explain(prs, "^{23}_{11}Na", d["sodium_nuclide"], [
        "A = protons + neutrons.",
        "Z = protons.",
        "Neutrons = A − Z.",
        "Electrons in a neutral atom = Z.",
        "For an ion, adjust electrons by the charge. The nucleus does not change.",
    ], "Always write A as a superscript and Z as a subscript — never 23Na as plain text in notes.")
    worked_example(
        prs, "Sodium-23 atom and ion",
        "For ^{23}Na, find protons, neutrons and electrons. Then find electrons in Na^{+}.",
        "neutrons = A − Z     electrons(ion) = Z − charge",
        "A = 23    Z = 11    charge of Na^{+} is +1",
        "protons = 11     neutrons = 23 − 11 = 12     electrons (atom) = 11",
        "Na^{+} has 10 electrons",
        "",
        "The ion is still sodium because Z is still 11.",
    )
    question_cards(prs, "Calculate p, n and e", [
        ("^{12}C  (neutral atom)", "2"),
        ("^{37}Cl (neutral atom)", "2"),
        ("^{27}Al^{3+}", "3"),
        ("^{16}O^{2−}", "3"),
    ], "Worked practice")
    answer_cards(prs, "Particle-count answers", [
        "^{12}C: 6 p, 6 n, 6 e.",
        "^{37}Cl: 17 p, 20 n, 17 e.",
        "^{27}Al^{3+}: 13 p, 14 n, 10 e  (13 − 3).",
        "^{16}O^{2−}: 8 p, 8 n, 10 e  (8 + 2).",
    ])
    section_slide(prs, "Isotopes", "Same Z, different neutron number")
    fact_cards(prs, "Defining isotopes", [
        ("Same element", "Isotopes have the same proton number, so they are the same element."),
        ("Different mass", "They have different numbers of neutrons and therefore different mass numbers."),
        ("Chemistry", "Chemical properties are almost identical because the electron arrangement is the same."),
        ("Physics", "Mass-dependent properties (density, rate of diffusion) can differ. Some isotopes are radioisotopes."),
    ])
    diagram_explain(prs, "Chlorine-35 and chlorine-37", d["isotope_compare"], [
        "Both have 17 protons and 17 electrons in the atom.",
        "^{35}Cl has 18 neutrons; ^{37}Cl has 20.",
        "^{35}Cl is more abundant.",
        "They react with sodium in the same way.",
        "Do not say isotopes have different proton numbers.",
    ])
    section_slide(prs, "Relative atomic mass", "A weighted mean, not a mass number")
    diagram_explain(prs, "Why A_{r} is not a whole number", d["ar_weighted"], [
        "Most elements are mixtures of isotopes.",
        "A_{r} is the weighted mean mass compared with 1/12 of the mass of a ^{12}C atom.",
        "A_{r} has no unit.",
        "Use the abundances given in the question — do not memorise them.",
    ])
    diagram_explain(prs, "Reading a simple mass spectrum", d["mass_spectrum"], [
        "Peak position is the mass number of that ion.",
        "Peak height is relative abundance.",
        "Use those heights as the percentages in the A_{r} formula.",
        "A tiny peak can often be ignored only after you have checked the 3 s.f. effect.",
    ], "Teaching sketch — not a copied instrument printout.")
    worked_example(
        prs, "Chlorine A_{r}",
        "A sample is 75.0% ^{35}Cl and 25.0% ^{37}Cl. Calculate A_{r}.",
        "A_{r} = (Σ percent × mass number) / 100",
        "A_{r} = (75.0 × 35 + 25.0 × 37) / 100",
        "A_{r} = (2625 + 925) / 100 = 3550 / 100",
        "35.5",
        "no unit",
        "This matches the familiar periodic-table value.",
    )
    calc_scaffold(
        prs, "Your turn — copper",
        ["69.0% ^{63}Cu", "31.0% ^{65}Cu"],
        ["A_{r} to 1 d.p."],
        "Write every term. Do not skip the division by 100.",
    )
    question_cards(prs, "Relative atomic mass practice", [
        ("Boron is 20.0% ^{10}B and 80.0% ^{11}B. Calculate A_{r}.", "2"),
        ("Copper is 69.0% ^{63}Cu and 31.0% ^{65}Cu. Calculate A_{r} to 1 d.p.", "2"),
        ("Why is A_{r} for chlorine not a whole number?", "2"),
    ])
    answer_cards(prs, "A_{r} answers", [
        "A_{r}(B) = (20×10 + 80×11)/100 = 10.8",
        "A_{r}(Cu) = (69×63 + 31×65)/100 = 63.6",
        "Chlorine is a mixture of ^{35}Cl and ^{37}Cl, so the weighted mean is not an integer.",
    ])
    section_slide(prs, "Ions from atoms", "Electrons move; protons do not")
    diagram_explain(prs, "How a sodium ion forms", d["ion_formation"], [
        "A cation forms when an atom loses electrons.",
        "An anion forms when an atom gains electrons.",
        "Z is unchanged, so it is still the same element.",
        "Charge number = protons − electrons.",
        "Metals typically form cations; non-metals typically form anions.",
    ])
    worked_example(
        prs, "Aluminium-27 ion",
        "How many protons, neutrons and electrons has ^{27}Al^{3+}?",
        "neutrons = A − Z     electrons = Z − 3",
        "A = 27    Z = 13    the 3+ means three electrons lost",
        "protons = 13     neutrons = 14     electrons = 10",
        "13 p, 14 n, 10 e",
        "",
        "The ion has the same electron count as neon, but it is still aluminium.",
    )
    two_col(prs, "Chemical versus nuclear change", "Chemical (this unit)", [
        "Electrons are rearranged",
        "Proton number stays the same",
        "Atoms become ions or form bonds",
        "Identity of the element is unchanged",
    ], "Nuclear (do not confuse)", [
        "The nucleus changes",
        "Proton number may change",
        "A different element can form",
        "Not how Na^{+} is produced in a salt",
    ])
    whiteboard_slide(prs, "Four nuclide cards", "Draw cards for ^{24}Mg, ^{24}Mg^{2+}, ^{19}F and ^{19}F^{−}. Show A, Z, p, n and e.", [
        "^{24}Mg", "^{24}Mg^{2+}", "^{19}F", "^{19}F^{−}",
    ])
    misconception_slide(prs, [
        ("The mass number is the number of neutrons.", "Mass number is protons plus neutrons."),
        ("Electrons sit inside the nucleus with the protons.", "Electrons occupy shells outside the nucleus."),
        ("Isotopes have different numbers of protons.", "Isotopes have the same protons and different neutrons."),
        ("Ions are formed by changing the number of protons.", "Ions form when electrons are lost or gained."),
    ])
    match_slide(prs, "Term and meaning", [
        "Atomic number, Z",
        "Mass number, A",
        "Isotope",
        "Relative atomic mass, A_{r}",
        "Ion",
    ], [
        "Weighted mean mass versus 1/12 of ^{12}C",
        "Number of protons",
        "Atom with unequal protons and electrons",
        "Protons plus neutrons",
        "Same Z, different neutron number",
    ])
    question_cards(prs, "Exam-style practice", [
        ("A student writes that ^{14}C and ^{14}N are isotopes. Explain why this is incorrect.", "2"),
        ("An element has two isotopes, ^{69}X (60.0%) and ^{71}X (40.0%). Calculate A_{r}.", "2"),
        ("Explain why atoms are electrically neutral even though they contain charged particles.", "2"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Isotopes must have the same proton number. ^{14}C has 6 protons; ^{14}N has 7, so they are different elements.",
        "A_{r} = (60×69 + 40×71)/100 = 69.8",
        "The number of protons equals the number of electrons, so the charges cancel.",
    ])
    plenary_slide(prs, [
        "Define Z and A in one sentence each.",
        "Give one pair of isotopes and state what is the same and what is different.",
        "Write the A_{r} formula and one substitution.",
        "Explain in one sentence how a 2− ion forms.",
    ])
    homework_slide(prs, [
        "Complete the Atomic Structure worksheet (writing space is provided).",
        "Learn the particle table until you can write it from memory.",
        "Calculate p, n and e for five nuclides from a periodic table, including one ion.",
    ], "Next lesson: electron configuration, including subshells and orbital boxes.")
    save_prs(prs, out, title, "BTEC Unit 1 Chemistry", "Atomic structure")
    return title, len(prs.slides)


def build_electron_configuration(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Chemistry: Electron Configuration"
    title_slide(
        prs, title,
        "Shells for the first 20 elements, then s, p and d subshells, Aufbau, orbital boxes and ions.",
        "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Chemistry",
        d["orbital_boxes"],
    )
    objectives_slide(prs, [
        "Write shell configurations (2,8,8,2) for the first 20 elements as a starting model.",
        "Describe s, p and d subshells and state their capacities.",
        "Write configurations such as 1s^{2} 2s^{2} 2p^{4} using the Aufbau order.",
        "Draw orbital box diagrams and apply Hund’s rule.",
        "Use configuration to predict simple ion charges and identify s, p or d block.",
    ])
    depth_check(prs, [
        ["2,8,8 for everything", "Keep 2,8,8,2 for Ca, then write 4s^{2} after 3p^{6}"],
        ["Electrons in shells only", "Subshells, orbitals, opposite spin, Hund’s rule"],
        ["Ions ‘want a full shell’", "State the electron change and the new configuration"],
        ["Ignore the periodic table", "Link ns^{1}, ns^{2} and ns^{2} np^{5} to group number"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("How many electrons can the first shell hold?", "1"),
        ("Why do atoms form ions?", "2"),
        ("What does the group number of sodium tell you?", "1"),
        ("Which particle is rearranged during bonding?", "1"),
    ], "Do now")
    answer_cards(prs, "Prior-knowledge answers", [
        "A maximum of two electrons.",
        "To obtain a more stable (often full) outer shell.",
        "Sodium is in Group 1, so it has one outer-shell electron.",
        "Electrons.",
    ])
    section_slide(prs, "Shells first", "A useful model for the first 20 elements")
    diagram_explain(prs, "Electron shells", d["shells_diagram"], [
        "Electrons occupy the lowest available shell first.",
        "For the first 20 elements this course uses 2, 8, 8, then 2.",
        "Calcium is 2,8,8,2 — not 2,8,10.",
        "Period number matches the number of occupied shells for main-group atoms.",
    ], "This is the GCSE starting point. The lesson now moves to subshells.")
    table_slide(prs, "Selected shell configurations", ["Element", "Z", "Shells", "Common ion"], [
        ["He", "2", "2", "none (noble gas)"],
        ["O", "8", "2,6", "O^{2−}"],
        ["Na", "11", "2,8,1", "Na^{+}"],
        ["Cl", "17", "2,8,7", "Cl^{−}"],
        ["Ca", "20", "2,8,8,2", "Ca^{2+}"],
    ], "Learn the pattern, then rewrite the same atoms in subshell form.")
    process_steps(prs, "Worked example — chlorine shells", [
        ("Count", "Chlorine has 17 electrons."),
        ("Fill 1st", "2 electrons; 15 remain."),
        ("Fill 2nd", "8 electrons; 7 remain."),
        ("Write", "Configuration 2,8,7."),
        ("Ion", "Cl^{−} is 2,8,8."),
    ])
    question_cards(prs, "Write the shell configurations", [
        ("Nitrogen (Z = 7)", "1"),
        ("Magnesium (Z = 12)", "1"),
        ("Phosphorus (Z = 15)", "1"),
        ("Potassium (Z = 19) and S^{2−} (Z = 16)", "2"),
    ])
    answer_cards(prs, "Shell-configuration answers", [
        "N: 2,5",
        "Mg: 2,8,2",
        "P: 2,8,5",
        "K: 2,8,8,1     S^{2−}: 2,8,8  (atom is 2,8,6)",
    ])
    section_slide(prs, "Subshells and orbitals", "Why 2,8,8 is not the whole story")
    fact_cards(prs, "Subshell capacities", [
        ("s", "1 orbital. Maximum 2 electrons. Example: 1s^{2}, 2s^{2}, 3s^{2}."),
        ("p", "3 orbitals. Maximum 6 electrons. Example: 2p^{6}, 3p^{5}."),
        ("d", "5 orbitals. Maximum 10 electrons. Used when assigning the d-block."),
        ("Orbital", "A region that holds two electrons of opposite spin."),
    ])
    diagram_explain(prs, "Aufbau order at this level", d["aufbau_order"], [
        "Fill 1s, 2s, 2p, 3s, 3p, then 4s, then 3d.",
        "4s is filled before 3d for isolated atoms of the first transition series.",
        "Oxygen is 1s^{2} 2s^{2} 2p^{4}.",
        "Calcium is 1s^{2} 2s^{2} 2p^{6} 3s^{2} 3p^{6} 4s^{2}.",
        "Always write the superscripts.",
    ])
    worked_example(
        prs, "Phosphorus in subshell form",
        "Write the full configuration and the noble-gas shorthand for phosphorus (Z = 15).",
        "Fill lowest subshells first",
        "15 electrons: 1s^{2} 2s^{2} 2p^{6} uses 10; 5 remain",
        "3s^{2} 3p^{3} uses the remaining 5",
        "1s^{2} 2s^{2} 2p^{6} 3s^{2} 3p^{3}",
        "[Ne] 3s^{2} 3p^{3}",
        "The 3 shows three electrons in 3p, not three p subshells.",
    )
    diagram_explain(prs, "Orbital boxes — actually drawn", d["orbital_boxes"], [
        "A box is one orbital.",
        "Arrows are electrons. Opposite arrows = opposite spin (Pauli).",
        "Hund: place one electron in each equal-energy orbital before pairing.",
        "Nitrogen 2p^{3}: three boxes, one up-arrow in each.",
        "Oxygen 2p^{4}: the fourth electron pairs in one 2p box.",
    ], "You do not need boxes for every exam item, but they stop counting errors.")
    diagram_explain(prs, "s, p and d blocks", d["spd_blocks"], [
        "s-block: Groups 1 and 2 — outer electron in an s subshell.",
        "p-block: Groups 13–18 — outer electron in a p subshell.",
        "d-block: transition metals — filling a d subshell.",
        "Helium is 1s^{2} so it is s-block by configuration.",
    ])
    diagram_explain(prs, "From configuration to ion charge", d["ion_configs"], [
        "Start from the atom, then add or remove electrons.",
        "Na 2,8,1 → Na^{+} 2,8.",
        "O 2,6 → O^{2−} 2,8  which is also 1s^{2} 2s^{2} 2p^{6}.",
        "Mg^{2+} and Al^{3+} both reach 1s^{2} 2s^{2} 2p^{6}.",
    ])
    activity_slide(prs, "Build configurations", [
        "Write full subshell configurations for F, Al, Ar and Ca.",
        "Circle the outer-shell electrons.",
        "State the most likely ion for F and Al and rewrite the ion configuration.",
        "Check a partner’s Ca carefully — 4s comes after 3p.",
    ], "12 minutes")
    answer_cards(prs, "Activity answers", [
        "F: 1s^{2} 2s^{2} 2p^{5} → F^{−} is 1s^{2} 2s^{2} 2p^{6}",
        "Al: 1s^{2} 2s^{2} 2p^{6} 3s^{2} 3p^{1} → Al^{3+} is 1s^{2} 2s^{2} 2p^{6}",
        "Ar: 1s^{2} 2s^{2} 2p^{6} 3s^{2} 3p^{6}",
        "Ca: 1s^{2} 2s^{2} 2p^{6} 3s^{2} 3p^{6} 4s^{2}",
    ])
    misconception_slide(prs, [
        ("The third shell always holds 18 electrons in first-20 examples.", "For K and Ca this course still uses 2,8,8,1 and 2,8,8,2."),
        ("2p^{4} means four p subshells.", "It means four electrons in the 2p subshell."),
        ("Ions keep the same configuration as the atom.", "Ions have lost or gained electrons."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Write the electron configuration of Mg^{2+} and explain why this ion is stable.", "3"),
        ("A student writes chlorine as 2,8,8. Identify the error and give the correct atom configuration.", "2"),
        ("Explain, using electron configuration, why oxygen typically forms a 2− ion.", "3"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Mg atom is 2,8,2 / 1s^{2} 2s^{2} 2p^{6} 3s^{2}. Mg^{2+} is 2,8 / 1s^{2} 2s^{2} 2p^{6}. Full outer shell / noble-gas arrangement.",
        "The atom has 17 electrons, not 18. Correct atom configuration is 2,8,7.",
        "Oxygen is 2,6. Gaining two electrons gives 2,8 / 1s^{2} 2s^{2} 2p^{6}. A full outer shell is more stable, so O^{2−} forms.",
    ])
    plenary_slide(prs, [
        "Whiteboard: element, shells, subshells, likely ion — use Na, O and Ca.",
        "Sketch nitrogen 2p^{3} boxes from memory.",
        "State one link between group number and outer electrons.",
    ])
    homework_slide(prs, [
        "Complete the Electron Configuration worksheet.",
        "Learn configurations for the first 20 elements in both forms.",
        "Preview ionic bonding: why Na and Cl form NaCl.",
    ], "Next lesson: ionic bonding.")
    save_prs(prs, out, title, "BTEC Unit 1 Chemistry", "Electron configuration")
    return title, len(prs.slides)


def build_ionic_bonding(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Chemistry: Ionic Bonding"
    title_slide(prs, title, "Electron transfer, electrostatic attraction, giant lattices and structure–property links.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Chemistry", d["ionic_lattice"])
    objectives_slide(prs, [
        "Define ionic bonding as electrostatic attraction between oppositely charged ions.",
        "Explain ion formation by electron transfer between metals and non-metals.",
        "Deduce formulae from ion charges, including polyatomic ions.",
        "Use the giant lattice to explain melting point, conductivity, brittleness and solubility.",
        "Compare conduction in ionic compounds with metallic conduction.",
    ])
    depth_check(prs, [
        ["Metal + non-metal = ionic", "Name transfer, ion charges, electrostatic attraction and the lattice"],
        ["High melting point", "Strong attraction throughout a giant lattice needs a lot of energy"],
        ["Conducts when molten", "Mobile ions — not electrons — carry the charge"],
        ["Guess the formula", "Balance charge: Al^{3+} and O^{2−} give Al_{2}O_{3}"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("What is the charge on a proton and on an electron?", "1"),
        ("Write the shell configuration of sodium and of chlorine.", "2"),
        ("Why do Group 1 metals form 1+ ions?", "2"),
        ("Name one compound you already know that contains ions.", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Proton +1; electron −1.",
        "Na 2,8,1 and Cl 2,8,7.",
        "They have one outer electron which is lost to leave a full outer shell.",
        "Examples include sodium chloride, copper sulfate or calcium carbonate.",
    ])
    section_slide(prs, "What ionic bonding is", "Transfer, then attraction")
    fact_cards(prs, "A precise definition", [
        ("The bond", "Strong electrostatic attraction between oppositely charged ions."),
        ("Who bonds", "Typically a metal and a non-metal."),
        ("What happens", "The metal loses electrons; the non-metal gains electrons."),
        ("Where it acts", "In all directions throughout a giant lattice."),
    ])
    diagram_explain(prs, "Electron transfer: Na and Cl", d["ion_transfer"], [
        "Na starts 2,8,1 and becomes Na^{+} 2,8.",
        "Cl starts 2,8,7 and becomes Cl^{−} 2,8,8.",
        "One electron is transferred.",
        "The ions then attract strongly.",
        "The compound is NaCl — there are no NaCl molecules.",
    ])
    process_steps(prs, "Worked example — magnesium oxide", [
        ("Mg", "2,8,2 loses 2 e^{−} → Mg^{2+}"),
        ("O", "2,6 gains 2 e^{−} → O^{2−}"),
        ("Ratio", "One Mg supplies both electrons to one O"),
        ("Formula", "MgO  (charges cancel 1:1)"),
        ("Lattice", "Giant array of Mg^{2+} and O^{2−}"),
    ])
    process_steps(prs, "Worked example — calcium chloride", [
        ("Ca", "2,8,8,2 → Ca^{2+}"),
        ("Cl", "Each Cl is 2,8,7 → Cl^{−}"),
        ("Balance", "Two Cl atoms for each Ca"),
        ("Check", "+2 balances 2 × −1"),
        ("Formula", "CaCl_{2}"),
    ])
    table_slide(prs, "Common ions to learn", ["Name", "Formula", "Charge"], [
        ["Sodium", "Na^{+}", "+1"],
        ["Magnesium", "Mg^{2+}", "+2"],
        ["Aluminium", "Al^{3+}", "+3"],
        ["Oxide", "O^{2−}", "−2"],
        ["Chloride", "Cl^{−}", "−1"],
        ["Sulfate", "SO_{4}^{2−}", "−2"],
        ["Hydroxide", "OH^{−}", "−1"],
        ["Nitrate", "NO_{3}^{−}", "−1"],
    ])
    activity_slide(prs, "Formulae from charges", [
        "Deduce formulae for Na and O; Al and Cl; Mg and N; K and SO_{4}^{2−}.",
        "Show the charge-balance working.",
        "Name each compound.",
    ], "8 minutes")
    answer_cards(prs, "Formula answers", [
        "Na_{2}O — sodium oxide",
        "AlCl_{3} — aluminium chloride",
        "Mg_{3}N_{2} — magnesium nitride",
        "K_{2}SO_{4} — potassium sulfate",
    ])
    section_slide(prs, "The giant ionic lattice", "Structure explains properties")
    diagram_explain(prs, "Giant ionic lattice", d["ionic_lattice"], [
        "Every cation is surrounded by anions, and vice versa.",
        "Attraction is strong and acts throughout the crystal.",
        "A large amount of energy is needed to separate the ions.",
        "That produces high melting and boiling points.",
    ], "Two-dimensional sketch of a three-dimensional lattice.")
    two_col(prs, "Properties of ionic compounds", "Typical observations", [
        "High melting and boiling points",
        "Often soluble in water",
        "Do not conduct when solid",
        "Do conduct when molten or aqueous",
        "Often brittle crystals",
    ], "Explanation from structure", [
        "Strong attractions throughout the lattice",
        "Polar water molecules can surround ions",
        "Ions are fixed, so charge cannot move",
        "Ions become free to move and carry charge",
        "A shift lines up like charges, so the crystal splits",
    ])
    fact_cards(prs, "Electrical conductivity in more detail", [
        ("Need", "Conduction requires mobile charged particles."),
        ("Solid", "Ions vibrate but cannot migrate."),
        ("Molten / aqueous", "Ions move towards electrodes."),
        ("Not metallic", "Metals conduct using delocalised electrons, not ions."),
    ])
    misconception_slide(prs, [
        ("NaCl molecules travel around in salt solution.", "There are separate hydrated Na^{+} and Cl^{−} ions."),
        ("Ionic solids conduct because electrons jump from ion to ion.", "The solid does not conduct; mobile ions are required."),
        ("A 2+ ion is formed by gaining two protons.", "Charge changes by losing or gaining electrons."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Describe, in terms of electrons, how ionic bonding arises in magnesium oxide.", "4"),
        ("Explain why sodium chloride has a high melting point but does not conduct as a solid.", "4"),
        ("Deduce the formula of the compound formed between Al^{3+} and O^{2−}. Show the charge balance.", "2"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Mg loses 2 e^{−} → Mg^{2+}. O gains 2 e^{−} → O^{2−}. Oppositely charged ions attract. Giant lattice of Mg^{2+} and O^{2−}.",
        "Strong electrostatic attraction throughout the lattice → high m.p. Solid ions are not free to move → no conduction.",
        "Two Al^{3+} and three O^{2−} so +6 balances −6. Formula Al_{2}O_{3}.",
    ])
    plenary_slide(prs, [
        "Write a 20-word definition of ionic bonding.",
        "Sketch two ions and mark the attraction.",
        "Give one property and its structural explanation.",
    ])
    homework_slide(prs, [
        "Complete the Ionic Bonding worksheet.",
        "Practise formulae until charge balance is automatic.",
        "Next lesson: covalent bonding — sharing rather than transfer.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Chemistry", "Ionic bonding")
    return title, len(prs.slides)


def build_covalent_bonding(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Chemistry: Covalent Bonding"
    title_slide(prs, title, "Shared pairs, simple molecules, giant covalent networks and structure–property explanations.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Chemistry", d["covalent_pair"])
    objectives_slide(prs, [
        "Describe a covalent bond as a shared pair of electrons attracted to both nuclei.",
        "Explain why non-metal atoms share rather than transfer.",
        "Count shared pairs in H_{2}, O_{2}, N_{2}, CH_{4}, H_{2}O and CO_{2}.",
        "Distinguish simple molecular from giant covalent structures.",
        "Use structure to explain melting point and electrical conductivity, including graphite.",
    ])
    depth_check(prs, [
        ["Covalent = sharing", "The shared pair is attracted to both nuclei"],
        ["Covalent substances melt easily", "Only simple molecular ones do; diamond does not"],
        ["Boiling water breaks O–H bonds", "Boiling overcomes intermolecular forces"],
        ["Graphite is just carbon", "Delocalised electrons between layers explain conduction"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("How does ionic bonding differ from sharing electrons?", "2"),
        ("How many electrons does carbon need for a full outer shell?", "1"),
        ("Name two elements that exist as diatomic molecules.", "1"),
        ("What is a full outer shell for Period 2 elements?", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Ionic bonding is electron transfer and attraction between ions; covalent bonding is sharing.",
        "Four (carbon is 2,4).",
        "Hydrogen, nitrogen, oxygen, fluorine, chlorine, bromine or iodine.",
        "Eight electrons (helium is the exception with two).",
    ])
    section_slide(prs, "The covalent bond", "A shared pair")
    diagram_explain(prs, "A shared pair of electrons", d["covalent_pair"], [
        "Each atom contributes one electron to the shared pair (unless the bond is dative).",
        "The pair is attracted to both nuclei.",
        "That mutual attraction is the covalent bond.",
        "Both atoms obtain a more stable outer shell.",
    ], "HCl as an original schematic — not a copied dot-and-cross from another publisher.")
    fact_cards(prs, "Single, double and triple bonds", [
        ("Single", "One shared pair. H–H, Cl–Cl, C–C."),
        ("Double", "Two shared pairs. O=O, C=O."),
        ("Triple", "Three shared pairs. N≡N."),
        ("Carbon", "Regularly forms four covalent bonds in stable molecules."),
    ])
    diagram_explain(prs, "Molecules you must be able to draw", d["covalent_molecules"], [
        "Count the lines: each line is one shared pair.",
        "Water is bent and has two lone pairs on oxygen.",
        "CO_{2} is linear: O=C=O.",
        "Ammonia has a lone pair and can form a dative bond to H^{+} to make NH_{4}^{+}.",
    ])
    two_col(prs, "Why non-metals share", "The electron story", [
        "Non-metal atoms attract electrons strongly",
        "Transferring several electrons is costly",
        "Sharing lets each atom count the pair",
        "The pair sits between the nuclei",
    ], "Keep the language scientific", [
        "Do not say atoms ‘want’ electrons",
        "Name attraction to both nuclei",
        "State the full outer shell after sharing",
        "Do not mention ions in a covalent answer",
    ])
    section_slide(prs, "Two covalent structure types", "The structure word wins the mark")
    two_col(prs, "Structure types", "Simple molecular", [
        "Strong covalent bonds within molecules",
        "Weak forces between molecules",
        "Low melting and boiling points",
        "Usually do not conduct",
        "Examples: H_{2}O, CO_{2}, I_{2}, CH_{4}",
    ], "Giant covalent", [
        "Vast network of covalent bonds",
        "No separate small molecules",
        "Very high melting points",
        "Usually do not conduct (graphite is the exception)",
        "Examples: diamond, graphite, SiO_{2}",
    ])
    diagram_explain(prs, "Diamond versus graphite", d["diamond_graphite"], [
        "Diamond: each C bonded to four others — hard, no delocalised electrons.",
        "Graphite: each C bonded to three others in layers.",
        "Spare electrons are delocalised between layers, so graphite conducts.",
        "Layers can slide, so graphite is soft.",
    ])
    fact_cards(prs, "Silicon dioxide as a giant covalent example", [
        ("Bonding", "Each Si is covalently bonded to four O atoms."),
        ("Oxygen", "Each O is bonded to two Si atoms."),
        ("Structure", "A 3D network — not SiO_{2} molecules."),
        ("Properties", "Very high melting point; does not conduct; hard."),
    ])
    activity_slide(prs, "Bond counts", [
        "For F_{2}, O_{2}, N_{2}, CH_{4} and CO_{2}, state the number of shared pairs.",
        "Identify any lone pairs on the central atom where relevant.",
        "Predict whether each substance is a gas at room temperature using structure, not memory alone.",
    ], "10 minutes")
    answer_cards(prs, "Bond-count answers", [
        "F_{2}: 1 pair. O_{2}: 2 pairs. N_{2}: 3 pairs.",
        "CH_{4}: 4 pairs; no lone pair on C. CO_{2}: two double bonds; no lone pair on C.",
        "All are simple molecules, so intermolecular forces are weak and they are gases at room temperature.",
    ])
    fact_cards(prs, "A first look at dative bonding", [
        ("NH_{4}^{+}", "The fourth N–H bond forms when nitrogen donates its lone pair to H^{+}."),
        ("After", "Once formed, that bond is identical to the other N–H bonds."),
        ("Elsewhere", "Carbon monoxide and some complex ions also contain dative bonds."),
        ("Limit", "Treat it as a special covalent case — not a fourth main bonding type."),
    ])
    misconception_slide(prs, [
        ("Breaking covalent bonds is what happens when water boils.", "Boiling overcomes intermolecular forces; the O–H bonds remain."),
        ("All covalent substances have low melting points.", "Giant covalent structures have very high melting points."),
        ("Covalent bonds form between a metal and a non-metal.", "That pairing usually gives ionic bonding."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Describe how a covalent bond forms in a chlorine molecule.", "3"),
        ("Explain why iodine melts at a much lower temperature than diamond.", "4"),
        ("Explain why graphite conducts electricity but diamond does not.", "3"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Each Cl has 7 outer electrons. They share one pair. Both then have 8. The pair is attracted to both nuclei.",
        "Iodine is simple molecular — melting overcomes weak forces between I_{2} molecules. Diamond is giant covalent — many strong C–C bonds must break.",
        "Graphite has delocalised electrons between layers. In diamond every outer electron is held in a C–C bond.",
    ])
    plenary_slide(prs, [
        "Define a covalent bond in one sentence.",
        "Give one simple-molecular and one giant-covalent example.",
        "Name the mobile particle that allows graphite to conduct.",
    ])
    homework_slide(prs, [
        "Complete the Covalent Bonding worksheet.",
        "Draw displayed formulae for H_{2}O, NH_{3}, CH_{4} and CO_{2} from memory.",
        "Next lesson: metallic bonding.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Chemistry", "Covalent bonding")
    return title, len(prs.slides)


def build_metallic_bonding(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Chemistry: Metallic Bonding"
    title_slide(prs, title, "Cations, delocalised electrons and the properties they explain, compared with ionic and covalent solids.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Chemistry", d["metallic_lattice"])
    objectives_slide(prs, [
        "Describe metallic bonding as attraction between positive metal ions and delocalised electrons.",
        "Explain electrical and thermal conductivity using mobile electrons.",
        "Explain malleability and ductility using sliding layers.",
        "Link charge and number of delocalised electrons to melting point and hardness.",
        "Compare metallic, ionic and simple-covalent structures.",
    ])
    depth_check(prs, [
        ["Sea of electrons", "Name cations + delocalised electrons + electrostatic attraction"],
        ["Metals conduct", "Electrons drift; ions stay in the lattice"],
        ["Metals are bendy", "Layers slide; electrons still bind the ions"],
        ["Alloys are stronger", "Different-sized atoms stop layers sliding easily"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("Are metal atoms more likely to lose or gain electrons?", "1"),
        ("Why does solid sodium chloride not conduct?", "2"),
        ("Name two physical properties common to most metals.", "2"),
        ("What does delocalised mean?", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Lose electrons, forming positive ions.",
        "Its ions are not free to move.",
        "Shiny, conduct heat and electricity, malleable, ductile, high melting points (most).",
        "Not fixed to one atom; free to move through the structure.",
    ])
    section_slide(prs, "The metallic lattice", "Ions plus a sea of electrons")
    diagram_explain(prs, "Metallic structure", d["metallic_lattice"], [
        "Metal atoms lose outer electrons into a shared cloud.",
        "The remaining particles are positive ions packed closely.",
        "Delocalised electrons attract every ion and bind the lattice.",
        "The attraction is strong and non-directional.",
    ])
    fact_cards(prs, "A careful definition", [
        ("The bond", "Electrostatic attraction between metal cations and delocalised electrons."),
        ("Not ionic", "There are no anions."),
        ("Not covalent", "Electrons are not shared as localised pairs between two atoms."),
        ("Strength", "More delocalised electrons and higher ionic charge generally strengthen the bond."),
    ])
    two_col(prs, "Explaining metallic properties", "Electrical conductivity", [
        "Delocalised electrons are mobile charged particles",
        "A potential difference makes them drift",
        "The solid therefore conducts",
        "Molten metals also conduct",
    ], "Thermal conductivity", [
        "Electrons transfer kinetic energy rapidly",
        "Ions also vibrate and pass energy on",
        "A metal spoon heats quickly in a drink",
        "Name electrons in a full explanation",
    ])
    fact_cards(prs, "Malleability, strength and alloys", [
        ("Slide", "Layers of positive ions can slide when a force is applied."),
        ("Hold", "Delocalised electrons still attract the ions after the slide."),
        ("Words", "Malleable: sheets. Ductile: wires."),
        ("Alloys", "Different-sized atoms distort the layers, so the alloy is harder."),
    ])
    table_slide(prs, "Property, particle, explanation", ["Property", "Mobile particle?", "One-sentence explanation"], [
        ["Conducts as a solid", "Yes — electrons", "Delocalised electrons drift in a p.d."],
        ["High melting point (most)", "Ions stay packed", "Strong attraction throughout the lattice"],
        ["Malleable", "Electrons stay after sliding", "Layers of ions slide; electrons still bind them"],
        ["Group 1 softer", "Only one e^{−} per atom", "Weaker metallic bonding than many transition metals"],
    ])
    two_col(prs, "Compare three solids", "Copper", [
        "Cations + delocalised electrons",
        "Solid conducts",
        "Malleable",
        "Used for wires",
    ], "Sodium chloride", [
        "Na^{+} and Cl^{−} ions",
        "Solid does not conduct",
        "Brittle",
        "Conducts when molten or dissolved",
    ])
    activity_slide(prs, "Three-structure comparison", [
        "Draw a three-column table: ionic, simple covalent, metallic.",
        "For each, state the particles present, the bonding, melting point (high/low), and whether the solid conducts.",
        "Add one example to each column.",
        "Write one sentence explaining the conductivity difference between copper and solid sodium chloride.",
    ], "12 minutes")
    answer_cards(prs, "Comparison checkpoints", [
        "Ionic: ions; electrostatic attraction; high m.p.; solid does not conduct.",
        "Simple covalent: molecules; covalent inside, weak forces between; low m.p.; does not conduct.",
        "Metallic: cations + delocalised electrons; usually high m.p.; solid does conduct.",
        "Copper has mobile electrons; solid NaCl does not have mobile ions.",
    ])
    fact_cards(prs, "Uses that follow from structure", [
        ("Wiring", "Copper is ductile and a good conductor because electrons can drift."),
        ("Saucepans", "Metals conduct heat quickly to the food."),
        ("Alloys", "Bridges and frames use stronger metallic bonding plus hardness from mixed atom sizes."),
        ("Mercury", "Liquid at room temperature, but it still conducts — metallic bonding can be relatively weak."),
    ])
    misconception_slide(prs, [
        ("Metals conduct because positive ions flow through the wire.", "The ions stay in the lattice; electrons move."),
        ("Metallic bonding is a type of covalent bonding.", "Electrons are delocalised, not shared as localised pairs."),
        ("All metals have very high melting points.", "Mercury is liquid at room temperature; Group 1 metals melt relatively easily."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Describe the bonding in solid magnesium.", "3"),
        ("Explain why magnesium conducts as a solid but magnesium oxide does not.", "4"),
        ("Explain why metals can be drawn into wires.", "3"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Lattice of Mg^{2+} ions. Outer electrons delocalised. Electrostatic attraction is metallic bonding.",
        "Mg has mobile delocalised electrons. MgO is ionic; solid ions are not free to move.",
        "Layers of ions can slide. Delocalised electrons continue to attract the ions, so the metal does not break.",
    ])
    plenary_slide(prs, [
        "Complete: ‘Metallic bonding is the attraction between … and …’",
        "Give one property explained by sliding layers and one by mobile electrons.",
        "State one structural difference between an alloy and a pure metal.",
    ])
    homework_slide(prs, [
        "Complete the Metallic Bonding worksheet.",
        "Revise all three bonding types together.",
        "Preview intermolecular forces: why CO_{2} is a gas even though it has strong C=O bonds.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Chemistry", "Metallic bonding")
    return title, len(prs.slides)
