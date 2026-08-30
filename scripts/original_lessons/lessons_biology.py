"""Original BTEC Unit 1 Biology lessons — commercial layouts and Level 3 depth."""

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


def build_cell_structure(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Cell Structure"
    title_slide(
        prs, title,
        "Ultrastructure, membranes, organelle function and structure–function relationships in animal and plant cells.",
        "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology",
        d["animal_cell"],
    )
    objectives_slide(prs, [
        "Identify the main organelles of animal and plant cells and state their functions.",
        "Describe nucleus, mitochondrion, RER–Golgi trafficking and the fluid-mosaic membrane.",
        "Compare animal and plant cells using labelled diagrams with leader lines.",
        "Link organelle ultrastructure to function using precise vocabulary.",
        "Interpret electron-micrograph descriptions without inventing unseen structures.",
    ])
    depth_check(prs, [
        ["Nucleus holds DNA", "Envelope, pores, chromatin, nucleolus, mRNA export"],
        ["Mitochondria make energy", "Cristae, matrix, ATP transfer — never ‘make energy’"],
        ["Plant cells have a wall", "Wall is freely permeable; the membrane controls exchange"],
        ["Cells have parts", "Structure–function sentences and specialised-cell adaptations"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("Name three structures you would expect in a typical animal cell.", "2"),
        ("Which organelle is associated with aerobic respiration?", "1"),
        ("What extra structures does a plant cell have compared with an animal cell?", "2"),
        ("Why do cells need a membrane?", "2"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Nucleus, cytoplasm and cell-surface membrane (plus mitochondria, ribosomes).",
        "The mitochondrion.",
        "Cell wall, chloroplasts and a permanent vacuole.",
        "To separate the contents from the surroundings and control what enters and leaves.",
    ])
    section_slide(prs, "The eukaryotic animal cell", "Compartments with jobs", [
        ("Look for", "Leader lines to the nucleus, mitochondrion, RER, membrane and cytoplasm."),
        ("Say in full", "Each organelle has a structure that matches its function."),
        ("Level 3 move", "Name ultrastructure: envelope, cristae, ribosomes — not just ‘it makes energy’."),
    ])
    diagram_explain(prs, "Animal cell — labelled schematic", d["animal_cell"], [
        "The nucleus stores DNA as chromatin and controls protein synthesis.",
        "Mitochondria transfer energy to ATP by aerobic respiration.",
        "Ribosomes on RER synthesise proteins for trafficking.",
        "The cell-surface membrane is a phospholipid bilayer with proteins.",
        "Lysosomes isolate hydrolytic enzymes.",
    ], "Original schematic. Organelles are not to scale. Leader lines touch the structures.")
    diagram_explain(prs, "Nucleus in more detail", d["nucleus_detail"], [
        "Double nuclear envelope with pores.",
        "Pores allow mRNA and ribosomal subunits to leave.",
        "Chromatin is DNA plus protein; it condenses to chromosomes for division.",
        "The nucleolus makes rRNA.",
        "Mature mammalian red blood cells have no nucleus.",
    ])
    diagram_explain(prs, "Mitochondrion", d["mitochondrion"], [
        "Bound by a double membrane.",
        "Inner membrane folds into cristae — more surface area for respiratory proteins.",
        "The matrix contains enzymes, circular DNA and 70S ribosomes.",
        "High-demand cells (muscle, sperm midpiece) have many mitochondria.",
        "Do not write that mitochondria ‘make energy’.",
    ])
    diagram_explain(prs, "Protein trafficking", d["protein_pathway"], [
        "Ribosomes are the site of translation.",
        "RER is studded with ribosomes and processes proteins.",
        "The Golgi body modifies proteins and packages them into vesicles.",
        "Vesicles fuse with the membrane for secretion.",
        "Secretory cells have extensive RER and Golgi.",
    ])
    diagram_explain(prs, "The cell-surface membrane", d["bilayer"], [
        "Phospholipid bilayer: hydrophilic heads face water; hydrophobic tails face inwards.",
        "Proteins form channels, carriers, receptors and enzymes.",
        "It is selectively permeable.",
        "Cholesterol (animal cells) regulates fluidity.",
        "Glycoproteins and glycolipids are used in cell recognition — the fluid mosaic.",
    ])
    section_slide(prs, "Plant cell extras", "Wall, vacuole, chloroplast", [
        ("Look for", "A cellulose wall, a large permanent vacuole and chloroplasts with grana."),
        ("Say in full", "The wall is freely permeable; the membrane controls exchange."),
        ("Level 3 move", "Link each extra structure to support, turgidity or photosynthesis."),
    ])
    diagram_explain(prs, "Plant cell — labelled schematic", d["plant_cell"], [
        "The cellulose cell wall provides support and prevents osmotic bursting.",
        "The wall is freely permeable to water and most solutes.",
        "The permanent vacuole stores cell sap and helps keep the cell turgid.",
        "Chloroplasts are the site of photosynthesis — grana hold chlorophyll.",
        "Plant cells also have a nucleus, mitochondria and ribosomes.",
    ])
    fact_cards(prs, "Chloroplasts — ultrastructure", [
        ("Envelope", "Double membrane around the stroma."),
        ("Grana", "Stacks of thylakoids hold chlorophyll and the light-dependent reactions."),
        ("Stroma", "Enzymes for the light-independent reactions, plus DNA and ribosomes."),
        ("Not every plant cell", "Root cells typically lack chloroplasts. Chlorophyll is the pigment, not the organelle."),
    ])
    two_col(prs, "Animal versus plant cells", "Only animal", [
        "No cellulose cell wall",
        "No chloroplasts",
        "No large permanent vacuole",
        "Often have centrioles associated with division",
        "May have cholesterol in the membrane",
    ], "Only plant", [
        "Cellulose cell wall",
        "Chloroplasts in photosynthetic cells",
        "Large permanent vacuole",
        "Pits and plasmodesmata connect cytoplasm",
        "Starch as a storage carbohydrate",
    ])
    table_slide(prs, "Organelle function summary", ["Organelle", "Main function", "Ultrastructure to name"], [
        ["Nucleus", "Holds DNA; controls the cell", "Envelope / pores / nucleolus"],
        ["Mitochondrion", "Aerobic respiration / ATP", "Cristae / matrix"],
        ["Ribosome / RER", "Protein synthesis and processing", "Bound ribosomes"],
        ["Golgi body", "Modify and package proteins", "Vesicles"],
        ["Chloroplast", "Photosynthesis", "Grana / stroma"],
        ["Cell wall", "Support; shape", "Cellulose; freely permeable"],
    ])
    diagram_explain(prs, "High-demand specialised cells", d["specialised_cells"], [
        "Sperm: haploid nucleus, acrosome enzymes, mitochondria in the midpiece, flagellum.",
        "Palisade: many chloroplasts, elongated and packed near the top of the leaf.",
        "Large vacuole maintains turgidity so the leaf is held out.",
        "Thin cell walls aid gas diffusion.",
        "Always pair a named adaptation with its function.",
    ])
    fact_cards(prs, "Reading an electron-micrograph description", [
        ("Cristae", "You are looking at a mitochondrion."),
        ("Grana / thylakoids", "You are looking at a chloroplast."),
        ("Double membrane around chromatin", "You are looking at a nucleus."),
        ("Do not invent labels", "Colour is usually added later to EM images."),
    ])
    activity_slide(prs, "Structure–function cards", [
        "Write six cards: organelle on one side; function plus one ultrastructure detail on the other.",
        "Include nucleus, mitochondrion, ribosome/RER, membrane, chloroplast and vacuole.",
        "Test a partner. Reject vague phrases such as ‘helps the cell live’.",
    ], "10 minutes")
    misconception_slide(prs, [
        ("The cell wall controls what enters a plant cell.", "The membrane controls exchange; the wall is freely permeable."),
        ("All plant cells photosynthesise.", "Only cells with chloroplasts do."),
        ("The nucleus is the ‘brain’ that thinks.", "It stores genetic information and controls protein production."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Describe the function of the nucleus and of mitochondria in an animal cell.", "4"),
        ("Explain two ways a palisade mesophyll cell is adapted for photosynthesis.", "4"),
        ("A student says the cell wall and the cell membrane are the same structure. Correct this statement.", "3"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Nucleus: contains DNA / chromosomes and controls protein synthesis. Mitochondria: site of aerobic respiration / produce ATP.",
        "Many chloroplasts to absorb light. Positioned near the top of the leaf / elongated shape. Vacuole maintains turgidity. (Any two explained.)",
        "Wall: cellulose, freely permeable, support. Membrane: phospholipid bilayer, selectively permeable, controls exchange.",
    ])
    plenary_slide(prs, [
        "Point to an organelle and state function plus one ultrastructure detail.",
        "Give one structure found in both cells and one found only in plant cells.",
        "State why red blood cells are an exception to the typical animal cell.",
    ])
    homework_slide(prs, [
        "Complete the Cell Structure worksheet, including the labelling page.",
        "Learn the organelle table until you can write it from memory.",
        "Next lesson: prokaryotic cells compared with these eukaryotic cells.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Cell structure")
    return title, len(prs.slides)


def build_prokaryotes(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Prokaryotic and Eukaryotic Cells"
    title_slide(prs, title, "Ultrastructure, DNA organisation, ribosome type, plasmids and why the comparison matters medically.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology", d["prokaryote_cell"])
    objectives_slide(prs, [
        "State the defining features of prokaryotic and eukaryotic cells.",
        "Label a bacterial cell, including wall, DNA loop, plasmid, 70S ribosomes and flagellum where present.",
        "Compare size, organelles and DNA organisation of the two cell types.",
        "Explain antibiotic selectivity and plasmid transfer of resistance.",
        "Use paired comparison sentences in extended-response items.",
    ])
    depth_check(prs, [
        ["Bacteria have no nucleus", "Name nucleoid, circular DNA, plasmids, 70S ribosomes"],
        ["Bacteria are simple", "Name the missing envelope and membrane-bound organelles"],
        ["Antibiotics kill germs", "Targets: peptidoglycan wall or 70S ribosomes, absent in human cells"],
        ["All bacteria are harmful", "Useful roles plus resistance via plasmids"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("Which organelle contains chromosomal DNA in an animal cell?", "1"),
        ("Do bacteria have a nucleus?", "1"),
        ("Name one useful and one harmful activity of bacteria.", "2"),
        ("Which is usually larger, a bacterial cell or an animal cell?", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "The nucleus.",
        "No — their DNA is not enclosed by a nuclear envelope.",
        "Useful: yoghurt / insulin / decomposition. Harmful: infection / food spoilage.",
        "An animal cell is typically larger (about 10–30 µm versus about 1–5 µm).",
    ])
    section_slide(prs, "Two fundamental cell types", "The nucleus is the key divide", [
        ("Look for", "A nucleus with an envelope versus a DNA loop in the cytoplasm."),
        ("Say in full", "Eukaryotes have a nucleus and membrane-bound organelles; prokaryotes do not."),
        ("Level 3 move", "Pair every difference: 70S versus 80S, peptidoglycan versus cellulose, size."),
    ])
    fact_cards(prs, "Definitions that earn marks", [
        ("Eukaryotic", "Nucleus bounded by a nuclear envelope and membrane-bound organelles."),
        ("Prokaryotic", "No nucleus and no membrane-bound organelles."),
        ("Who is who", "Animals, plants, fungi and protoctists are eukaryotic. Bacteria and archaea are prokaryotic."),
        ("Viruses", "Acellular — not prokaryotic or eukaryotic."),
    ])
    diagram_explain(prs, "Bacterial cell schematic", d["prokaryote_cell"], [
        "Cell wall (peptidoglycan in many bacteria) gives shape and protection.",
        "The membrane still controls exchange.",
        "DNA is a circular loop in the cytoplasm (nucleoid) — not a nucleus.",
        "Plasmids are small extra DNA circles and may carry resistance genes.",
        "Ribosomes are 70S. Some species have a flagellum or capsule.",
    ], "Say ‘some bacteria’ for capsule and flagellum.")
    diagram_explain(prs, "Scale comparison", d["size_scale"], [
        "Bacteria are typically 1–5 µm.",
        "Animal cells are often 10–30 µm.",
        "A small cell has a large surface-area-to-volume ratio, so diffusion can supply it.",
        "Viruses are much smaller still and are not cells.",
    ])
    table_slide(prs, "Prokaryote versus eukaryote", ["Feature", "Prokaryote", "Eukaryote"], [
        ["Nucleus", "Absent", "Present"],
        ["DNA", "Circular loop; plasmids possible", "Linear chromosomes in a nucleus"],
        ["Membrane-bound organelles", "Absent", "Present"],
        ["Ribosomes", "70S", "80S (70S in mitochondria/chloroplasts)"],
        ["Typical size", "1–5 µm", "10–100 µm"],
        ["Cell wall", "Peptidoglycan (many bacteria)", "Cellulose / chitin / none"],
    ], "Each exam row must contrast the same feature.")
    two_col(prs, "DNA organisation", "Prokaryotic DNA", [
        "Usually one circular chromosome",
        "Lies free in the cytoplasm (nucleoid)",
        "May include plasmids that replicate independently",
        "Not packaged as eukaryotic chromatin with histones in the same way",
    ], "Eukaryotic DNA", [
        "Several linear chromosomes",
        "Associated with histone proteins",
        "Enclosed by a nuclear envelope",
        "Mitochondria and chloroplasts also contain circular DNA",
    ])
    fact_cards(prs, "Why the comparison matters medically", [
        ("Wall target", "Some antibiotics block peptidoglycan synthesis."),
        ("Ribosome target", "Some antibiotics bind 70S ribosomes, not 80S."),
        ("Selectivity", "Those targets are absent or different in human cells."),
        ("Resistance", "Plasmids can transfer resistance genes by conjugation."),
    ])
    two_col(prs, "Useful versus harmful bacteria", "Useful", [
        "Decomposers in nutrient cycles",
        "Yoghurt and cheese production",
        "Recombinant insulin and other products",
        "Gut bacteria that aid digestion",
    ], "Harmful", [
        "Pathogens causing infection",
        "Food spoilage",
        "Toxin production",
        "Antibiotic-resistant strains in hospitals",
    ])
    fact_cards(prs, "Fungi — a eukaryotic contrast", [
        ("Nucleus", "Fungi are eukaryotic, so they have nuclei."),
        ("Wall", "Their walls are typically chitin, not cellulose or peptidoglycan."),
        ("Form", "Yeast is unicellular; mushrooms are multicellular."),
        ("Point", "Do not dump all walled cells into one group. Viruses remain outside the comparison."),
    ])
    fact_cards(prs, "Endosymbiotic hint (Level 3 stretch)", [
        ("Observation", "Mitochondria and chloroplasts have circular DNA and 70S ribosomes."),
        ("Idea", "These features resemble free-living bacteria."),
        ("Theory", "The organelles may have originated from engulfed prokaryotes."),
        ("Use", "A stretch explanation — do not treat it as the whole lesson."),
    ])
    activity_slide(prs, "Venn comparison", [
        "Draw a two-circle Venn diagram: prokaryote / both / eukaryote.",
        "Place: ribosomes, nucleus, cell membrane, plasmids, mitochondria, DNA, cell wall (qualify the chemistry).",
        "Write one sentence on a medical application of a difference you placed on one side only.",
    ], "10 minutes")
    misconception_slide(prs, [
        ("Bacteria have no DNA.", "They have DNA; it is not inside a nucleus."),
        ("Prokaryotes have no ribosomes.", "They have 70S ribosomes."),
        ("All bacteria cause disease.", "Many are harmless or beneficial."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Give three differences between a bacterial cell and an animal cell.", "3"),
        ("Explain how a plasmid can be medically important.", "3"),
        ("A student writes that mitochondria prove a cell is prokaryotic. Explain the error.", "2"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "Bacterium: no nucleus / no mitochondria / peptidoglycan wall / circular DNA / 70S / smaller. Animal cell has the opposite of each stated point.",
        "Plasmids can carry antibiotic-resistance genes, can be transferred, and are used as vectors in genetic engineering.",
        "Mitochondria are membrane-bound organelles found in eukaryotes. Their presence shows the cell is eukaryotic.",
    ])
    plenary_slide(prs, [
        "List four labels for a bacterial cell.",
        "State the single best defining difference between the two cell types.",
        "Give one reason viruses are not placed in either group.",
    ])
    homework_slide(prs, [
        "Complete the prokaryote/eukaryote worksheet.",
        "Practise a six-mark comparison from memory using paired sentences.",
        "Next lesson: seeing these cells — microscopy and magnification.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Prokaryotic and eukaryotic cells")
    return title, len(prs.slides)


def build_microscopy(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Microscopy"
    title_slide(prs, title, "Light and electron microscopes, magnification, resolution, unit conversions and instrument choice.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology", d["light_microscope"])
    objectives_slide(prs, [
        "Describe how a light microscope forms an image and name its main parts.",
        "Distinguish magnification from resolution.",
        "Calculate magnification, actual size and image size using the standard triangle.",
        "Compare light microscopes, TEM and SEM.",
        "Choose an appropriate instrument for a stated observation.",
    ])
    depth_check(prs, [
        ["Turn the magnification up", "Resolution, not empty magnification, limits useful detail"],
        ["µm and mm mixed", "Convert first: 1 mm = 1000 µm = 1 000 000 nm"],
        ["EM is always better", "Vacuum — living specimens cannot be viewed"],
        ["Colour EM photos", "False colour is added after capture"],
    ])
    question_cards(prs, "Prior knowledge", [
        ("Which knob do you use first when focusing — coarse or fine?", "1"),
        ("Why is a stain often used on a slide?", "1"),
        ("A cell is 25 µm long and the image is 25 mm long. What is M?", "2"),
        ("Which can see viruses more clearly — a school light microscope or an EM?", "1"),
    ], "Do now")
    answer_cards(prs, "Retrieval answers", [
        "Coarse focus first with the lowest-power objective, then fine focus.",
        "To increase contrast so structures are visible.",
        "25 mm = 25 000 µm. M = 25 000 / 25 = ×1000.",
        "An electron microscope — viruses are usually below the resolution of a light microscope.",
    ])
    section_slide(prs, "The light microscope", "Rays, lenses and contrast", [
        ("Look for", "Lamp, stage, objective, eyepiece — total magnification = eyepiece × objective."),
        ("Say in full", "Magnification enlarges; resolution is the smallest separable distance."),
        ("Level 3 move", "Convert units first. Empty magnification does not add new detail."),
    ])
    diagram_explain(prs, "Light microscope schematic", d["light_microscope"], [
        "The lamp provides light that passes through the specimen.",
        "The objective produces a magnified real image.",
        "The eyepiece magnifies that image again.",
        "Total magnification = eyepiece × objective.",
        "Start on low power; never use the coarse wheel on high power.",
    ])
    two_col(prs, "Magnification versus resolution", "Magnification", [
        "How many times larger the image is than the real object",
        "M = image size / actual size",
        "Can be increased with stronger lenses",
        "Empty magnification adds no new detail",
    ], "Resolution", [
        "Smallest distance at which two points still look separate",
        "Limited by the wavelength of the radiation used",
        "Light microscopes: about 0.2 µm",
        "TEM: about 0.1 nm",
    ])
    diagram_explain(prs, "The calculation triangle", d["mag_triangle"], [
        "Write every quantity in the same unit before dividing.",
        "1 mm = 1000 µm. 1 µm = 1000 nm.",
        "Actual size = image size / magnification.",
        "Show the conversion line — that is where marks are won.",
    ])
    worked_example(
        prs, "Actual size of a mitochondrion",
        "A mitochondrion image is 40 mm long. Magnification is ×20 000. Find the actual size in µm.",
        "A = I / M",
        "I = 40 mm = 40 000 µm     M = 20 000",
        "A = 40 000 / 20 000 = 2",
        "2 µm",
        "",
        "Check: mitochondria are typically 1–10 µm, so 2 µm is sensible.",
    )
    worked_example(
        prs, "Calculating magnification",
        "A bacterium is 2.0 µm long. The drawing is 80 mm long. Calculate M.",
        "M = I / A",
        "I = 80 mm = 80 000 µm     A = 2.0 µm",
        "M = 80 000 / 2.0 = 40 000",
        "×40 000",
        "",
        "Write the ×. Include a scale bar on practical drawings.",
    )
    calc_scaffold(
        prs, "Scaffold — your turn",
        ["Image width = 15 mm", "M = ×400"],
        ["Actual size in µm"],
        "Convert 15 mm to µm first.",
    )
    question_cards(prs, "Magnification practice", [
        ("Image = 15 mm, M = ×400. Find actual size in µm.", "2"),
        ("Actual = 8 µm, image = 4.0 cm. Find M.", "2"),
        ("A scale bar labelled 5 µm measures 25 mm on the page. What is M?", "2"),
    ])
    answer_cards(prs, "Calculation answers", [
        "15 mm = 15 000 µm. Actual = 15 000 / 400 = 37.5 µm.",
        "4.0 cm = 40 000 µm. M = 40 000 / 8 = ×5000.",
        "25 mm = 25 000 µm. M = 25 000 / 5 = ×5000.",
    ])
    section_slide(prs, "Electron microscopy", "Shorter wavelength, higher resolution", [
        ("Look for", "TEM for internal detail; SEM for surface; both need a vacuum."),
        ("Say in full", "Electrons have a shorter wavelength than light, so resolution is higher."),
        ("Level 3 move", "Living specimens cannot be viewed. Colour on EM images is usually added later."),
    ])
    two_col(prs, "TEM and SEM", "TEM", [
        "Electrons pass through a thin specimen",
        "High internal detail (cristae, thylakoids)",
        "Requires a vacuum",
        "Living specimens cannot be used",
    ], "SEM", [
        "Electrons scan the surface",
        "Good 3D surface appearance",
        "Also requires a vacuum",
        "Colour in published images is usually added later",
    ])
    diagram_explain(prs, "Useful sizes", d["em_scale"], [
        "A plant cell is tens of µm.",
        "A bacterium is a few µm.",
        "A virus is tens of nm.",
        "If two granules are closer than the resolution, extra magnification only enlarges the blur.",
    ])
    table_slide(prs, "Choosing an instrument", ["Need to see…", "Prefer", "Why"], [
        ["Living pond microbes swimming", "Light", "No vacuum; colour; movement"],
        ["Cristae inside a mitochondrion", "TEM", "High internal resolution"],
        ["Surface of a pollen grain", "SEM", "Surface topography"],
        ["Nucleus of an onion cell in class", "Light", "Large enough; simple prep"],
    ])
    fact_cards(prs, "Eyepiece graticule — the idea", [
        ("What it is", "A ruler you see superimposed on the specimen."),
        ("Not fixed", "The micrometre value of a division changes with the objective."),
        ("Calibrate", "Use a stage micrometer of known length."),
        ("Then measure", "Actual size = divisions × µm per division."),
    ])
    misconception_slide(prs, [
        ("Higher magnification always means a clearer image.", "Resolution decides useful detail."),
        ("Electron microscopes are used in school practicals on living cells.", "They need a vacuum; living cells are not used."),
        ("µm and nm can be mixed without converting.", "Convert to one unit first."),
    ])
    question_cards(prs, "Exam-style practice", [
        ("Calculate the actual width of a cell if the image is 42 mm wide at ×700. Give the answer in µm.", "2"),
        ("Compare the resolution of a light microscope with that of a TEM and explain the difference.", "4"),
        ("Give two reasons a scientist might still choose a light microscope rather than an electron microscope.", "2"),
    ], "Exam-style practice")
    answer_cards(prs, "Exam-style answers", [
        "42 mm = 42 000 µm. Actual = 42 000 / 700 = 60 µm.",
        "Light about 0.2 µm; TEM much smaller (about 0.1 nm) because electrons have a shorter wavelength.",
        "Living specimens / cheaper / colour / easier preparation. (Any two.)",
    ])
    plenary_slide(prs, [
        "State the magnification formula.",
        "Define resolution in one sentence.",
        "Name one structure you would need an electron microscope to study clearly.",
    ])
    homework_slide(prs, [
        "Complete the Microscopy worksheet, including the calculation page.",
        "Practise unit conversions until they are automatic.",
        "Optional: calibrate an eyepiece graticule if your centre has the slides.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Microscopy")
    return title, len(prs.slides)
