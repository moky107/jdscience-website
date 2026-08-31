"""Additional original teaching slides to deepen each Unit 1 lesson."""

from .theme import (
    activity_slide,
    answer_slide,
    content_slide,
    question_slide,
    section_slide,
    table_slide,
    two_col,
)


def key_terms(prs, rows):
    table_slide(prs, "Key terminology", ["Term", "Meaning you should be able to write"], rows)


def exam_technique(prs, bullets):
    content_slide(
        prs,
        "How to answer a 4-mark structure item",
        bullets,
        ["Name the particles.", "Name the forces.", "Link force to the property.", "Avoid 'it' without a noun."],
        "Mark-winning habit",
    )


def add_atomic_depth(prs):
    key_terms(prs, [
        ["Atomic number, Z", "Number of protons in the nucleus"],
        ["Mass number, A", "Protons plus neutrons"],
        ["Isotope", "Same Z, different neutron number"],
        ["Relative atomic mass, Ar", "Weighted mean mass compared with 1/12 of 12C"],
        ["Ion", "Atom (or group) with unequal protons and electrons"],
    ])
    content_slide(prs, "Teacher explanation — charge arithmetic", [
        "Charge number = protons − electrons.",
        "If electrons < protons, the ion is positive.",
        "If electrons > protons, the ion is negative.",
        "Never change Z when an ion forms — that would change the element.",
        "Model this on the board with 11+, 11e then 11+, 10e for Na+.",
    ])
    content_slide(prs, "Second worked example — aluminium-27 ion", [
        "27Al has Z = 13, so 13 protons and 14 neutrons.",
        "The atom has 13 electrons.",
        "Al3+ has lost three electrons, so 10 electrons remain.",
        "The nucleus is unchanged: still 13 protons and 14 neutrons.",
        "The ion has the same electron count as neon, but it is still aluminium.",
    ])
    two_col(prs, "Chemical versus nuclear change", "Chemical (this unit)", [
        "Electrons are rearranged",
        "Proton number stays the same",
        "Atoms become ions or form bonds",
        "Identity of the element is unchanged",
    ], "Nuclear (do not confuse)", [
        "The nucleus changes",
        "Proton number may change",
        "A different element can form",
        "Not how Na+ is produced in a flame test / salt",
    ])
    question_slide(prs, "Quick check — ions and isotopes", [
        "How many electrons has 16O2−?",
        "Why do 35Cl and 37Cl have the same chemical reactions with sodium?",
        "A student writes Ar as 35 or 37 for chlorine. What have they misunderstood?",
    ])
    answer_slide(prs, "Quick-check answers", [
        "10 electrons (8 + 2).",
        "They have the same electron arrangement / same proton number.",
        "Those are mass numbers of the two isotopes, not the weighted mean Ar.",
    ])
    exam_technique(prs, [
        "For isotope items, write 'same proton number, different neutron number' in full.",
        "For Ar, write the substitution (percent × mass) before the division by 100.",
        "For ions, state electrons lost or gained and the new electron number.",
        "A bare number with no working often loses a method mark.",
    ])


def add_electron_depth(prs):
    key_terms(prs, [
        ["Shell", "A main energy level around the nucleus"],
        ["Subshell", "s, p or d division of a shell"],
        ["Orbital", "Region that can hold two electrons of opposite spin"],
        ["Aufbau", "Electrons occupy the lowest available energy first"],
        ["Outer-shell electrons", "Electrons in the highest occupied shell"],
    ])
    content_slide(prs, "Teacher explanation — why 2,8,8,2 for calcium", [
        "Calcium has 20 electrons.",
        "After 2,8,8 you have used 18 electrons.",
        "The last two occupy the fourth shell, giving 2,8,8,2.",
        "At A-level you will also write 4s2 after 3p6 — same idea, extra detail.",
        "Do not invent a 2,8,10 arrangement for Ca in this course.",
    ])
    content_slide(prs, "Orbital box diagrams (first look)", [
        "An orbital is drawn as a box that can hold two arrows (electrons).",
        "Hund's rule: place one electron in each equal-energy orbital before pairing.",
        "For nitrogen 2p3, draw three boxes with one arrow in each.",
        "For oxygen 2p4, the fourth electron pairs in one of the 2p boxes.",
        "You do not need full boxes for every exam item, but they stop counting errors.",
    ])
    two_col(prs, "From configuration to ion charge", "Metals", [
        "Na 2,8,1 → Na+",
        "Mg 2,8,2 → Mg2+",
        "Al 2,8,3 → Al3+",
        "Lose the outer-shell electrons",
    ], "Non-metals", [
        "O 2,6 → O2−",
        "F 2,7 → F−",
        "Cl 2,8,7 → Cl−",
        "Gain enough electrons to fill the outer shell",
    ])
    question_slide(prs, "Configuration check", [
        "Write 1s2 2s2 2p6 3s2 3p6 in shell notation.",
        "Which element of the first 20 is this if the species is a neutral atom?",
        "Which common ions also have this configuration?",
    ])
    answer_slide(prs, "Configuration-check answers", [
        "2,8,8",
        "Argon (Z = 18).",
        "Cl−, S2−, K+, Ca2+ (among others).",
    ])
    content_slide(prs, "s, p and d blocks — teaching map", [
        "s-block: Groups 1 and 2 — outer electrons in an s subshell.",
        "p-block: Groups 3–0 (13–18) — outer electrons in a p subshell.",
        "d-block: transition metals — filling a d subshell.",
        "Helium sits in Group 0 but is 1s2, so it is s-block by configuration.",
        "You only need to assign the block, not memorise every exception.",
    ])
    exam_technique(prs, [
        "If asked for a configuration of an ion, start from the atom, then add or remove electrons.",
        "Write both shell and subshell forms if the question does not specify.",
        "Link 'full outer shell' to 'more stable' — do not stop at the configuration alone.",
    ])


def add_ionic_depth(prs):
    key_terms(prs, [
        ["Ion", "Charged particle formed by electron loss or gain"],
        ["Cation", "Positive ion"],
        ["Anion", "Negative ion"],
        ["Giant ionic lattice", "Repeating 3D array of oppositely charged ions"],
        ["Electrostatic attraction", "Force between opposite charges"],
    ])
    content_slide(prs, "Teacher explanation — why transfer happens", [
        "Metal atoms have low attraction for their outer electrons (low ionisation energy).",
        "Non-metal atoms have a strong attraction for extra electrons (high electron affinity / electronegativity).",
        "Transfer produces two ions that both have a full outer shell.",
        "The resulting attraction is much stronger than the energy cost of transfer, so the lattice is stable.",
        "Keep the story as electrons and attraction — not 'metals want to give electrons away' as a motive.",
    ])
    content_slide(prs, "Writing formulae without guessing", [
        "Write the ions with charges: Al3+ and O2−.",
        "Find the lowest whole numbers that balance charge: 2 × +3 and 3 × −2.",
        "Formula Al2O3. Do not write charges in the final formula.",
        "For polyatomic ions, keep the group intact: Ca2+ and NO3− give Ca(NO3)2.",
        "Brackets are needed when more than one polyatomic ion is present.",
    ])
    table_slide(prs, "Common ions to learn", ["Name", "Formula", "Charge"], [
        ["Sodium", "Na+", "+1"],
        ["Magnesium", "Mg2+", "+2"],
        ["Aluminium", "Al3+", "+3"],
        ["Oxide", "O2−", "−2"],
        ["Chloride", "Cl−", "−1"],
        ["Sulfate", "SO42−", "−2"],
        ["Hydroxide", "OH−", "−1"],
        ["Nitrate", "NO3−", "−1"],
    ])
    question_slide(prs, "Formulae check", [
        "Write formulae for potassium oxide, calcium hydroxide and aluminium sulfate.",
        "A compound has ions Fe3+ and O2−. Deduce the formula.",
        "Why is NaO an incorrect formula for sodium oxide?",
    ])
    answer_slide(prs, "Formulae-check answers", [
        "K2O; Ca(OH)2; Al2(SO4)3.",
        "Fe2O3.",
        "Na+ and O2− must balance as 2:1, so Na2O.",
    ])
    content_slide(prs, "Solubility — a careful story", [
        "Many ionic compounds dissolve in water because water molecules are polar.",
        "The slightly negative oxygen of water attracts cations; the slightly positive hydrogens attract anions.",
        "If hydration of the ions releases enough energy, the lattice separates.",
        "Not every ionic compound is soluble — treat solubility as a typical property, not a law.",
        "Once dissolved, the ions are free to move, so the solution conducts.",
    ])
    exam_technique(prs, [
        "A 4-mark bonding answer usually needs: electron transfer, ion charges, electrostatic attraction, lattice.",
        "A property answer needs: named particles + whether they can move + the property.",
        "Do not mention delocalised electrons in an ionic answer.",
    ])


def add_covalent_depth(prs):
    key_terms(prs, [
        ["Covalent bond", "A shared pair of electrons"],
        ["Lone pair", "Outer-shell pair not used in a bond"],
        ["Simple molecular", "Small molecules with weak forces between them"],
        ["Giant covalent", "Network of covalent bonds throughout the solid"],
        ["Dative / coordinate bond", "Both electrons in the shared pair come from one atom"],
    ])
    content_slide(prs, "Teacher explanation — why non-metals share", [
        "Non-metal atoms attract electrons strongly, so transfer of several electrons is costly.",
        "Sharing lets each atom count the pair towards a full outer shell.",
        "The shared pair sits between the nuclei and is attracted to both.",
        "That mutual attraction is the bond.",
        "Carbon forms four bonds because it has four outer electrons and needs four more.",
    ])
    two_col(prs, "Displayed formulae to learn", "Draw and count", [
        "H2: H–H (1 pair)",
        "O2: O=O (2 pairs)",
        "N2: N≡N (3 pairs)",
        "H2O: two O–H bonds plus two lone pairs on O",
    ], "Carbon compounds", [
        "CH4: four C–H bonds",
        "CO2: O=C=O",
        "Each line is one shared pair",
        "Check carbon has four lines in total",
    ])
    content_slide(prs, "Silicon dioxide as a giant covalent example", [
        "Each silicon atom is covalently bonded to four oxygen atoms.",
        "Each oxygen is bonded to two silicon atoms.",
        "The result is a 3D network, not SiO2 molecules that you can melt easily.",
        "Very high melting point; does not conduct; hard.",
        "Used in glass and as a typical contrast with CO2.",
    ])
    question_slide(prs, "Structure check", [
        "Classify H2O, SiO2, I2 and diamond as simple molecular or giant covalent.",
        "Which of those solids would you expect to have the lowest melting point, and why?",
        "Why is 'CO2 is covalent so it has a high melting point' a weak answer?",
    ])
    answer_slide(prs, "Structure-check answers", [
        "H2O and I2 simple molecular; SiO2 and diamond giant covalent.",
        "I2 (or H2O if comparing with the giants) — weak intermolecular forces. I2 is the classic low-m.p. covalent solid.",
        "It names the bond type but ignores structure. CO2 is simple molecular, so intermolecular forces are weak.",
    ])
    content_slide(prs, "A first look at dative bonding", [
        "In NH4+, the fourth N–H bond forms when nitrogen donates its lone pair to H+.",
        "Once formed, that bond is identical to the other N–H bonds.",
        "Carbon monoxide and some complex ions also contain dative bonds.",
        "You only need the idea: both electrons in the pair can come from one atom.",
        "Do not treat dative bonds as a third main bonding type alongside ionic, covalent and metallic.",
    ])
    exam_technique(prs, [
        "Always state whether the structure is simple molecular or giant covalent before explaining a melting point.",
        "For conductivity, name the missing mobile particle.",
        "For Cl2 or H2, describe sharing and the full outer shell — do not mention ions.",
    ])


def add_metallic_depth(prs):
    key_terms(prs, [
        ["Delocalised electron", "Electron not fixed to one atom; free to move through the lattice"],
        ["Metallic bonding", "Attraction between metal cations and delocalised electrons"],
        ["Malleable", "Can be hammered into sheets"],
        ["Ductile", "Can be drawn into wires"],
        ["Alloy", "Mixture of a metal with other elements"],
    ])
    content_slide(prs, "Teacher explanation — why electrons delocalise", [
        "Metal atoms have relatively low ionisation energies and pack closely.",
        "Outer electrons are not tightly held by one nucleus.",
        "They occupy a shared 'sea' belonging to the whole lattice.",
        "The leftover cores are positive ions.",
        "The attraction between the sea and the ions is the metallic bond.",
    ])
    table_slide(prs, "Property, particle, explanation", ["Property", "Mobile particle?", "One-sentence explanation"], [
        ["Conducts as a solid", "Yes — electrons", "Delocalised electrons drift in a potential difference"],
        ["High melting point (most)", "No (ions stay packed)", "Strong attraction throughout the lattice"],
        ["Malleable", "Electrons stay after sliding", "Layers of ions slide; electrons still bind them"],
        ["Shiny", "—", "Electrons interact with light at the surface"],
    ])
    content_slide(prs, "Alloys — why they are harder", [
        "In a pure metal the ions are the same size, so layers slide easily.",
        "In an alloy, atoms of a different size distort the layers.",
        "More force is needed to make the layers slide, so the alloy is harder.",
        "Steel (iron plus carbon and other elements) is the everyday example.",
        "Solder and brass are other examples you can name.",
    ])
    two_col(prs, "Compare three solids", "Copper", [
        "Cations + delocalised electrons",
        "Solid conducts",
        "Malleable",
        "Used for wires",
    ], "Sodium chloride", [
        "Na+ and Cl− ions",
        "Solid does not conduct",
        "Brittle",
        "Conducts when molten or dissolved",
    ])
    question_slide(prs, "Metallic check", [
        "Name the charged particles in solid sodium and in solid sodium chloride.",
        "Which of those solids conducts, and why?",
        "Why is 'metals have ionic bonding' incorrect?",
    ])
    answer_slide(prs, "Metallic-check answers", [
        "Sodium: Na+ and delocalised electrons. Sodium chloride: Na+ and Cl−.",
        "Solid sodium conducts (mobile electrons). Solid sodium chloride does not (ions fixed).",
        "Ionic bonding requires anions as well as cations. Metals have no anions.",
    ])
    activity_slide(prs, "Write a six-mark plan", [
        "Question: Compare the structures of copper, diamond and sodium chloride and use them to explain differences in electrical conductivity.",
        "Plan three short paragraphs: particles present; solid conductivity; one extra property.",
        "Swap plans and check that each paragraph names particles.",
    ], "8 minutes")
    exam_technique(prs, [
        "Write 'delocalised electrons' — 'free electrons' is weaker.",
        "Do not say metal ions flow along the wire.",
        "For alloys, mention different-sized atoms and layers that cannot slide easily.",
    ])
    content_slide(prs, "Uses that follow from structure", [
        "Electrical wiring: copper is ductile and a good conductor.",
        "Saucepans: metals conduct heat quickly to the food.",
        "Bridges and frames: strong metallic bonding and, in alloys, hardness.",
        "A thin foil still conducts because the electron sea remains even in a thin sheet.",
        "Link every use back to mobile electrons or sliding layers — that is the scientific point.",
    ])
    content_slide(prs, "Mercury — a useful exception", [
        "Mercury is a metal that is liquid at room temperature.",
        "Its metallic bonding is relatively weak, so the ions can move past one another.",
        "It still conducts electricity because delocalised electrons remain.",
        "Use it to stop students writing 'all metals have high melting points' as a law.",
        "Health and safety: mercury is toxic — treat it as a property example, not a classroom demo.",
    ])


def add_cell_depth(prs):
    key_terms(prs, [
        ["Organelle", "Specialised structure inside a cell"],
        ["Eukaryotic", "Cell with a nucleus and membrane-bound organelles"],
        ["Phospholipid bilayer", "Double layer of phospholipids forming membranes"],
        ["Cristae", "Folds of the inner mitochondrial membrane"],
        ["Turgid", "Plant cell swollen against its wall because of water intake"],
    ])
    content_slide(prs, "Teacher explanation — compartmentalisation", [
        "Membrane-bound organelles keep reactions in the right place.",
        "Lysosomes isolate digestive enzymes so they do not destroy the rest of the cell.",
        "Mitochondria package the respiration machinery.",
        "This is a major difference from prokaryotes, which lack these compartments.",
        "When you name an organelle, add one internal detail — envelope, cristae, grana.",
    ])
    content_slide(prs, "Lysosomes, cytoskeleton and centrioles", [
        "Lysosomes contain hydrolytic enzymes for breaking down waste and pathogens.",
        "The cytoskeleton (microtubules and filaments) supports shape and moves organelles.",
        "Centrioles organise the spindle in many animal cells during division.",
        "These details help you write a 'typical animal cell' description that is not just nucleus + membrane.",
        "Only include centrioles if you are sure the question is about animal cells.",
    ])
    two_col(prs, "High-demand cells", "Sperm cell", [
        "Nucleus with haploid DNA in the head",
        "Acrosome enzymes to reach the egg",
        "Many mitochondria in the midpiece",
        "Flagellum for swimming",
    ], "Palisade mesophyll", [
        "Many chloroplasts",
        "Elongated cells packed at the top of the leaf",
        "Large vacuole to maintain turgidity",
        "Thin cell walls for gas diffusion",
    ])
    question_slide(prs, "Organelle check", [
        "Which organelle modifies and packages proteins for secretion?",
        "Why would a phagocyte contain many lysosomes?",
        "Name one organelle that contains its own DNA besides the nucleus.",
    ])
    answer_slide(prs, "Organelle-check answers", [
        "Golgi body / Golgi apparatus.",
        "To digest engulfed pathogens / debris.",
        "Mitochondrion or chloroplast.",
    ])
    content_slide(prs, "Reading an electron micrograph description", [
        "If the text mentions cristae, you are looking at a mitochondrion.",
        "Grana or thylakoids indicate a chloroplast.",
        "A double membrane around chromatin indicates a nucleus.",
        "Do not label structures that are not described — invented labels lose marks.",
        "Remember that colour is usually added later to EM images.",
    ])
    exam_technique(prs, [
        "Use the proper name: cell-surface membrane, not 'skin of the cell'.",
        "Pair structure with function in the same sentence.",
        "For plant/animal comparisons, write paired sentences, not a jumble.",
    ])


def add_prokaryote_depth(prs):
    key_terms(prs, [
        ["Nucleoid", "Region where the bacterial chromosome sits — not a nucleus"],
        ["Plasmid", "Small extra circle of DNA"],
        ["Peptidoglycan", "Polymer that strengthens many bacterial walls"],
        ["Binary fission", "Asexual splitting of a bacterial cell"],
        ["70S ribosome", "Smaller ribosome found in prokaryotes"],
    ])
    content_slide(prs, "Teacher explanation — wall, capsule, flagellum", [
        "Not every bacterium has a capsule or a flagellum — say 'some bacteria'.",
        "A capsule can help a pathogen evade phagocytosis.",
        "A flagellum rotates and allows motility towards resources.",
        "Pili can help attachment and, in some species, DNA transfer.",
        "The membrane is still the barrier that controls exchange.",
    ])
    content_slide(prs, "Gram-positive and Gram-negative — first idea", [
        "Gram staining is a later practical topic, but the wall difference starts here.",
        "Gram-positive walls have a thick peptidoglycan layer and stain purple.",
        "Gram-negative walls have a thinner peptidoglycan layer plus an outer membrane and stain pink.",
        "The outer membrane affects which antibiotics can enter.",
        "You do not need the full stain protocol in this lesson, only the wall idea.",
    ])
    two_col(prs, "Useful versus harmful bacteria", "Useful", [
        "Decomposers in nutrient cycles",
        "Yoghurt and cheese production",
        "Insulin and other recombinant products",
        "Gut bacteria that aid digestion",
    ], "Harmful", [
        "Pathogens causing infection",
        "Food spoilage",
        "Toxin production",
        "Antibiotic-resistant strains in hospitals",
    ])
    question_slide(prs, "Comparison check", [
        "Give one similarity between a bacterial cell and a plant cell.",
        "Give two differences between a bacterial cell and a plant cell.",
        "Why is 'bacteria have no genetic material' an automatic zero?",
    ])
    answer_slide(prs, "Comparison-check answers", [
        "Both have a cell wall / ribosomes / cell membrane / DNA / cytoplasm.",
        "Plant cell has a nucleus / cellulose wall / chloroplasts / larger size. Bacterium has peptidoglycan / circular DNA / plasmids.",
        "Bacteria have DNA (a circular chromosome, and often plasmids).",
    ])
    content_slide(prs, "Fungi — a eukaryotic contrast", [
        "Fungi are eukaryotic, so they have nuclei.",
        "Their walls are typically chitin, not cellulose or peptidoglycan.",
        "Yeast is unicellular; mushrooms are multicellular.",
        "This stops students dumping all 'walled cells' into one group.",
        "Viruses remain outside this comparison — they are not cells.",
    ])
    exam_technique(prs, [
        "In a 'differences' table, each row must contrast the same feature.",
        "Do not write 'bacteria are simple' — name the missing nucleus or organelle.",
        "For plasmids, mention a named consequence (resistance or genetic engineering).",
    ])
    content_slide(prs, "Size and surface area", [
        "A small bacterial cell has a large surface-area-to-volume ratio.",
        "Diffusion can supply the interior quickly, so bacteria do not need mitochondria or a circulatory system.",
        "Larger eukaryotic cells rely on organelles and, in multicellular organisms, exchange systems.",
        "This is a functional reason for the size difference, not just a fact to memorise.",
        "Typical values: bacteria 1–5 µm; animal cells often 10–30 µm.",
    ])
    content_slide(prs, "Classification reminder", [
        "Prokaryotes: bacteria and archaea.",
        "Eukaryotes: animals, plants, fungi, protoctists.",
        "Viruses: acellular particles with genetic material in a protein coat.",
        "If an item asks you to classify an unnamed cell, look first for a nucleus.",
        "If there is a cellulose wall and chloroplasts, it is a plant cell, not a bacterium.",
    ])
    content_slide(prs, "Putting the comparison on one slide", [
        "Start with the nucleus: present or absent.",
        "Then DNA: linear chromosomes versus a circular loop.",
        "Then organelles: mitochondria and chloroplasts versus none.",
        "Then wall chemistry if a wall is present.",
        "Finish with a medical or biotechnological consequence so the comparison is not a dry list.",
    ])


def add_microscopy_depth(prs):
    key_terms(prs, [
        ["Magnification", "Image size ÷ actual size"],
        ["Resolution", "Smallest separable distance between two points"],
        ["Objective", "Lens nearest the specimen"],
        ["Artefact", "Structure created by preparation, not present in life"],
        ["Graticule", "Measuring scale in the eyepiece"],
    ])
    content_slide(prs, "Teacher explanation — unit conversions", [
        "Write a conversion line every time: 1 mm = 1000 µm = 1 000 000 nm.",
        "Convert the quantity that is not already in the unit you want.",
        "If both are converted, convert them to the same unit.",
        "A factor-of-1000 error is the most common calculation mistake in this topic.",
        "Estimate: a plant cell is tens of µm, a bacterium a few µm, a virus tens of nm.",
    ])
    content_slide(prs, "Eyepiece graticule — the idea", [
        "The eyepiece graticule is a ruler you see superimposed on the specimen.",
        "Its divisions are not a fixed number of micrometres — they change with the objective.",
        "You calibrate it using a stage micrometer of known length.",
        "Then: actual size = number of eyepiece divisions × micrometres per division.",
        "Even if you cannot do the practical today, you should be able to describe the steps.",
    ])
    two_col(prs, "Stains and contrast", "Why stain", [
        "Many cell parts are colourless in water",
        "Stain binds to some structures more than others",
        "Iodine stains starch; methylene blue stains nuclei",
        "Contrast makes measurement possible",
    ], "Limits", [
        "Staining often kills the specimen",
        "Too much stain hides detail",
        "Some structures still need EM to resolve",
        "Stain does not improve resolution",
    ])
    question_slide(prs, "Instrument choice", [
        "Which microscope would you choose to watch living yeast budding, and why?",
        "Which would you choose to study the inner membrane of a mitochondrion?",
        "Why might a published SEM image of an insect eye look coloured?",
    ])
    answer_slide(prs, "Instrument-choice answers", [
        "Light microscope — no vacuum, so living cells can be viewed.",
        "TEM — high internal resolution.",
        "False colour is often added after capture; electrons do not produce a natural colour image.",
    ])
    content_slide(prs, "Drawing rules for practical work", [
        "Use a sharp pencil; no sketchy shading.",
        "Give a title and a calculated magnification or a scale bar.",
        "Label with ruled lines that touch the structure.",
        "Draw what you see, not what you remember from a textbook diagram.",
        "These habits are assessed in Unit 1-style practical write-ups.",
    ])
    exam_technique(prs, [
        "In calculations, box the converted values before dividing.",
        "Write × before a magnification answer.",
        "If asked to compare microscopes, mention both magnification and resolution, plus living versus vacuum.",
    ])


def add_waves_depth(prs):
    key_terms(prs, [
        ["Progressive wave", "Wave that transfers energy from a source"],
        ["Amplitude, A", "Maximum displacement from equilibrium"],
        ["Wavelength, λ", "Shortest distance between points in phase"],
        ["Frequency, f", "Number of oscillations per second"],
        ["Wave speed, v", "Speed of the wave profile; v = fλ"],
    ])
    content_slide(prs, "Teacher explanation — two graphs of the same wave", [
        "Displacement–distance: freeze time, read A and λ.",
        "Displacement–time: sit at one place, read A and T, then f = 1/T.",
        "You cannot read λ from a time graph or T from a distance graph.",
        "Both graphs can look like sine waves — label the axis before measuring.",
        "Phase: points 1.0 λ apart on the distance graph are in phase.",
    ])
    content_slide(prs, "Standard form and prefixes", [
        "Radio and microwave questions use MHz and GHz: 1 MHz = 106 Hz, 1 GHz = 109 Hz.",
        "Light questions may use nm: 1 nm = 10−9 m.",
        "Always convert to Hz and m before using v = fλ.",
        "Worked check: 600 nm light. f = 3.00×108 / 6.00×10−7 = 5.00×1014 Hz.",
        "Write the powers of ten on a separate line to avoid calculator errors.",
    ])
    content_slide(prs, "Worked example — changing medium", [
        "Water waves approach a shallower region. Frequency is 2.0 Hz in both regions.",
        "Deep-water speed 0.80 m s−1, so λ_deep = v/f = 0.40 m.",
        "Shallow-water speed 0.50 m s−1, so λ_shallow = 0.25 m.",
        "The waves crowd together — wavelength shortens when speed falls.",
        "This is the same logic as light slowing in glass.",
    ])
    question_slide(prs, "Units and sense-check", [
        "A student calculates the speed of sound as 3.0 × 108 m s−1. What went wrong conceptually?",
        "Another student reads crest-to-trough as amplitude. How should they correct it?",
        "Convert 25 cm and 4.0 kHz into SI units, then find v.",
    ])
    answer_slide(prs, "Sense-check answers", [
        "That is the speed of light / EM waves, not sound in air.",
        "Amplitude is half of crest-to-trough / measured from equilibrium.",
        "λ = 0.25 m, f = 4000 Hz, v = 1000 m s−1.",
    ])
    exam_technique(prs, [
        "Write the equation, substitute with units, then calculate.",
        "Give the unit of v as m s−1 (or m/s), not just m.",
        "If a graph scale is 1 square = 0.02 s, show that conversion.",
    ])


def add_properties_depth(prs):
    key_terms(prs, [
        ["Transverse", "Oscillation perpendicular to energy transfer"],
        ["Longitudinal", "Oscillation parallel to energy transfer"],
        ["In phase", "Points that reach maxima together"],
        ["Superposition", "Resultant displacement is the sum of individual displacements"],
        ["Polarisation", "Restricting a transverse oscillation to one plane"],
    ])
    content_slide(prs, "Teacher explanation — why polarisation is a test", [
        "Only transverse waves have a direction of oscillation that can be filtered.",
        "A Polaroid filter transmits oscillations in one plane and absorbs the rest.",
        "Two filters at 90° cut out almost all the light.",
        "Sound has no such plane, so it cannot be polarised.",
        "This is evidence, not just a definition, that light is transverse and sound is not.",
    ])
    content_slide(prs, "Path difference and interference preview", [
        "If two waves from the same source travel different distances, there is a path difference.",
        "Path difference of nλ → constructive interference (in phase).",
        "Path difference of (n + ½)λ → destructive interference (antiphase).",
        "You will use this in Young's slits and diffraction-grating lessons.",
        "Superposition is the reason bright and dark fringes exist.",
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
    question_slide(prs, "Phase check", [
        "Points are 0.75 m apart on a wave with λ = 0.50 m. What is the path difference in wavelengths, and are they in phase?",
        "Describe the resultant if two equal crests overlap.",
        "Why is a slinky useful for modelling both wave types?",
    ])
    answer_slide(prs, "Phase-check answers", [
        "0.75 / 0.50 = 1.5 λ, so they are in antiphase / not in phase.",
        "Constructive superposition — a larger crest (double if amplitudes are equal).",
        "You can stretch it sideways (transverse) or push along its length (longitudinal).",
    ])
    content_slide(prs, "Earthquakes — a useful pair", [
        "P-waves are longitudinal and travel through solids and liquids.",
        "S-waves are transverse and do not travel through the liquid outer core.",
        "This is a real-world reason the distinction matters.",
        "You do not need full seismology, only the wave-type contrast.",
        "Do not say S-waves 'cannot travel through the Earth' — they travel through the solid mantle.",
    ])
    exam_technique(prs, [
        "For 'describe the difference', write both types and both directions of oscillation.",
        "Always add an example if the mark scheme is likely to require one.",
        "For superposition, use the word displacement, not 'the waves add energy and vanish'.",
    ])
