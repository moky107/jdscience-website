"""Original BTEC Unit 1 Biology lessons."""

from __future__ import annotations

from . import diagrams as dg
from .lessons_extra import add_cell_depth, add_microscopy_depth, add_prokaryote_depth
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


def build_cell_structure(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Cell Structure"
    title_slide(prs, title, "Organelles, membranes and how structure supports function in animal and plant cells.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology", d["animal_cell"])
    objectives_slide(prs, [
        "Identify the main organelles of animal and plant cells and state their functions.",
        "Explain how the cell-surface membrane controls exchange.",
        "Compare animal and plant cells using labelled diagrams.",
        "Link organelle structure to function using precise biological vocabulary.",
        "Interpret simple electron-micrograph descriptions without inventing unseen structures.",
    ])
    question_slide(prs, "Prior knowledge", [
        "Name three structures you would expect in a typical animal cell.",
        "Which organelle is associated with aerobic respiration?",
        "What extra structures does a plant cell have compared with an animal cell?",
        "Why do cells need a membrane?",
    ], "Do now")
    answer_slide(prs, "Retrieval answers", [
        "Nucleus, cytoplasm and cell-surface membrane (plus mitochondria, ribosomes).",
        "The mitochondrion.",
        "Cell wall, chloroplasts and a permanent vacuole.",
        "To separate the cell contents from the surroundings and control what enters and leaves.",
    ])
    section_slide(prs, "The eukaryotic animal cell", "Compartments with jobs")
    diagram_slide(prs, "Animal cell schematic", d["animal_cell"], "Original schematic — organelles are not to scale.", [
        "The nucleus stores DNA as chromosomes and controls protein synthesis.",
        "The nucleolus makes ribosomal RNA.",
        "Mitochondria transfer energy by aerobic respiration.",
        "Ribosomes synthesise proteins.",
        "The cell-surface membrane is a phospholipid bilayer with proteins.",
    ])
    content_slide(prs, "Nucleus in more detail", [
        "Surrounded by a nuclear envelope with pores.",
        "Pores allow mRNA and ribosomes to leave, and some proteins to enter.",
        "Chromatin is DNA plus proteins; it condenses to chromosomes for division.",
        "Most cells have one nucleus; red blood cells in mammals have none when mature.",
        "Multinucleate cells exist (for example skeletal muscle).",
    ])
    content_slide(prs, "Mitochondria", [
        "Bound by a double membrane.",
        "The inner membrane folds into cristae, increasing surface area for respiration proteins.",
        "The matrix contains enzymes, circular DNA and 70S ribosomes.",
        "Cells with high energy demand (sperm midpiece, muscle) have many mitochondria.",
        "Do not say mitochondria 'make energy' — they transfer it to ATP.",
    ])
    content_slide(prs, "Ribosomes, ER and Golgi body", [
        "Ribosomes are the site of translation.",
        "Rough endoplasmic reticulum (RER) is studded with ribosomes and processes proteins.",
        "Smooth ER is involved in lipid synthesis and detoxification in some cells.",
        "The Golgi body modifies proteins and packages them into vesicles.",
        "Vesicles transport materials to the membrane for secretion.",
    ])
    content_slide(prs, "The cell-surface membrane", [
        "A phospholipid bilayer with hydrophilic heads facing water and hydrophobic tails inside.",
        "Proteins form channels, carriers, receptors and enzymes.",
        "It is selectively permeable.",
        "Cholesterol (in animal cells) regulates fluidity.",
        "Glycoproteins and glycolipids are important in cell recognition.",
    ], ["Unit 1 often asks why membranes are described as fluid mosaics.", "Phospholipids move; proteins are scattered like a mosaic."], "Key phrase")
    section_slide(prs, "Plant cell extras", "Wall, vacuole, chloroplast")
    diagram_slide(prs, "Plant cell schematic", d["plant_cell"], "Original schematic showing wall, vacuole and chloroplast.", [
        "The cellulose cell wall provides support and prevents osmotic bursting.",
        "The permanent vacuole stores cell sap and helps keep the cell turgid.",
        "Chloroplasts are the site of photosynthesis.",
        "Plant cells also have a nucleus, mitochondria and ribosomes.",
    ])
    content_slide(prs, "Chloroplasts", [
        "Double membrane around a stroma.",
        "Thylakoids stacked as grana hold chlorophyll and the light-dependent reactions.",
        "The stroma contains enzymes for the light-independent reactions, plus DNA and ribosomes.",
        "Not every plant cell has chloroplasts — root cells typically do not.",
        "Do not confuse chloroplasts with chlorophyll; chlorophyll is the pigment inside.",
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
    table_slide(prs, "Organelle function summary", ["Organelle", "Main function", "Typical evidence of activity"], [
        ["Nucleus", "Holds DNA; controls the cell", "Chromatin / nuclear pores"],
        ["Mitochondrion", "Aerobic respiration / ATP", "Many cristae"],
        ["Ribosome", "Protein synthesis", "Attached to RER or free"],
        ["Chloroplast", "Photosynthesis", "Grana present"],
        ["Cell wall", "Support; shape", "Rigid cellulose layer"],
    ])
    activity_slide(prs, "Structure–function cards", [
        "Write six cards: organelle on one side, function plus one adaptation on the other.",
        "Include nucleus, mitochondrion, ribosome, membrane, chloroplast and vacuole.",
        "Test a partner. Reject vague phrases such as 'helps the cell live'.",
    ], "10 minutes")
    misconception_slide(prs, [
        ("The cell wall controls what enters a plant cell.", "The membrane controls exchange; the wall is fully permeable to water and most solutes."),
        ("All plant cells photosynthesise.", "Only cells with chloroplasts do."),
        ("The nucleus is the 'brain' that thinks.", "It stores genetic information and controls protein production."),
    ])
    add_cell_depth(prs)
    question_slide(prs, "Exam-style practice", [
        "Describe the function of the nucleus and of mitochondria in an animal cell. (4)",
        "Explain two ways a palisade mesophyll cell is adapted for photosynthesis. (4)",
        "A student says the cell wall and the cell membrane are the same structure. Correct this statement. (3)",
    ], "Exam-style practice")
    answer_slide(prs, "Exam-style answers", [
        "Nucleus: contains DNA / chromosomes and controls protein synthesis. Mitochondria: site of aerobic respiration / produce ATP.",
        "Many chloroplasts to absorb light. Located near the top of the leaf / elongated shape packs many cells in a small area. Vacuole helps maintain turgidity so the leaf is held out. (Any two explained.)",
        "The wall is made of cellulose and is freely permeable / supports the cell. The membrane is a phospholipid bilayer and is selectively permeable / controls entry and exit.",
    ])
    content_slide(prs, "Plenary", [
        "Point to an organelle on the board diagram and state function plus one structural detail.",
        "Give one structure found in both cells and one found only in plant cells.",
        "State why red blood cells are an exception to the 'typical animal cell' story.",
    ])
    content_slide(prs, "Independent practice", [
        "Complete the cell-structure worksheet.",
        "Learn the organelle table until you can write it from memory.",
        "Next lesson: prokaryotic cells compared with these eukaryotic cells.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Cell structure")
    return title, len(prs.slides)


def build_prokaryotes(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Prokaryotic and Eukaryotic Cells"
    title_slide(prs, title, "Comparing bacteria with animal and plant cells, including ultrastructure and classification.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology", d["prokaryote_cell"])
    objectives_slide(prs, [
        "State the defining features of prokaryotic and eukaryotic cells.",
        "Label a bacterial cell, including cell wall, loop of DNA, plasmid, ribosomes and flagellum where present.",
        "Compare sizes, organelles and DNA organisation of the two cell types.",
        "Explain why bacteria can reproduce quickly and transfer plasmids.",
        "Use comparison tables to answer extended-response items.",
    ])
    question_slide(prs, "Prior knowledge", [
        "Which organelle contains chromosomal DNA in an animal cell?",
        "Do bacteria have a nucleus?",
        "Name one useful and one harmful activity of bacteria.",
        "Which is usually larger, a bacterial cell or an animal cell?",
    ], "Do now")
    answer_slide(prs, "Retrieval answers", [
        "The nucleus.",
        "No — their DNA is not enclosed by a nuclear envelope.",
        "Useful: yoghurt / insulin production / decomposition. Harmful: infection / food spoilage.",
        "An animal cell is typically larger (about 10–30 µm versus about 1–5 µm).",
    ])
    section_slide(prs, "Two fundamental cell types", "The nucleus is the key divide")
    content_slide(prs, "Definitions that earn marks", [
        "Eukaryotic cells have a nucleus bounded by a nuclear envelope and membrane-bound organelles.",
        "Prokaryotic cells have no nucleus and no membrane-bound organelles.",
        "Animals, plants, fungi and protoctists are eukaryotic.",
        "Bacteria and archaea are prokaryotic.",
        "Viruses are acellular and are not classified as either.",
    ])
    diagram_slide(prs, "Bacterial cell schematic", d["prokaryote_cell"], "Original schematic of a typical prokaryote.", [
        "Cell wall (peptidoglycan in many bacteria) gives shape and protection.",
        "Cell membrane controls exchange.",
        "DNA is a circular loop in the cytoplasm (nucleoid region).",
        "Plasmids are small extra DNA circles and may carry antibiotic-resistance genes.",
        "Ribosomes (70S) make proteins. Some species have a flagellum or capsule.",
    ])
    table_slide(prs, "Prokaryote versus eukaryote", ["Feature", "Prokaryote", "Eukaryote"], [
        ["Nucleus", "Absent", "Present"],
        ["DNA", "Circular loop; plasmids possible", "Linear chromosomes in a nucleus"],
        ["Membrane-bound organelles", "Absent", "Present"],
        ["Ribosomes", "70S", "80S (70S in mitochondria/chloroplasts)"],
        ["Typical size", "1–5 µm", "10–100 µm"],
        ["Cell wall", "Peptidoglycan (many bacteria)", "Cellulose (plants) / chitin (fungi) / none (animals)"],
    ])
    content_slide(prs, "Why the comparison matters medically", [
        "Antibiotics can target peptidoglycan synthesis or 70S ribosomes.",
        "Those targets are absent or different in human cells, which is why many antibiotics are selective.",
        "Plasmid transfer (conjugation) spreads resistance between bacteria.",
        "Gram staining (later practical work) distinguishes wall types and guides treatment.",
        "Always say 'many bacteria' rather than 'all bacteria' when discussing walls and flagella.",
    ])
    two_col(prs, "DNA organisation", "Prokaryotic DNA", [
        "Usually one circular chromosome",
        "Not wrapped as eukaryotic chromatin with histones in the same way",
        "Lies free in the cytoplasm",
        "May include plasmids that replicate independently",
    ], "Eukaryotic DNA", [
        "Several linear chromosomes",
        "Associated with histone proteins",
        "Enclosed by a nuclear envelope",
        "Mitochondria and chloroplasts also contain their own circular DNA",
    ])
    content_slide(prs, "Reproduction and growth", [
        "Bacteria commonly divide by binary fission — asexual and rapid in good conditions.",
        "Eukaryotic body cells divide by mitosis; gametes form by meiosis.",
        "A short bacterial generation time can produce huge populations overnight.",
        "This is useful in biotechnology and dangerous in infection.",
        "Mutation plus selection explains how resistance becomes common.",
    ])
    activity_slide(prs, "Venn comparison", [
        "Draw a two-circle Venn diagram: prokaryote / both / eukaryote.",
        "Place: ribosomes, nucleus, cell membrane, plasmids, mitochondria, DNA, cell wall (qualify).",
        "Write one sentence on a medical application of a difference you placed on one side only.",
    ], "10 minutes")
    misconception_slide(prs, [
        ("Bacteria have no DNA.", "They have DNA; it is not inside a nucleus."),
        ("Prokaryotes have no ribosomes.", "They have 70S ribosomes."),
        ("All bacteria cause disease.", "Many are harmless or beneficial."),
    ])
    add_prokaryote_depth(prs)
    question_slide(prs, "Exam-style practice", [
        "Give three differences between a bacterial cell and an animal cell. (3)",
        "Explain how a plasmid can be medically important. (3)",
        "A student writes that mitochondria prove a cell is prokaryotic. Explain the error. (2)",
    ], "Exam-style practice")
    answer_slide(prs, "Exam-style answers", [
        "Bacterium has no nucleus / no mitochondria / has peptidoglycan wall / has circular DNA / smaller / 70S ribosomes. Animal cell has the opposite of each stated point. Award three clear paired differences.",
        "Plasmids can carry antibiotic-resistance genes. They can be transferred between bacteria. This makes infections harder to treat. They are also used as vectors in genetic engineering.",
        "Mitochondria are membrane-bound organelles found in eukaryotes, not in prokaryotes. Their presence shows the cell is eukaryotic.",
    ])
    content_slide(prs, "Plenary", [
        "List four labels for a bacterial cell.",
        "State the single best defining difference between the two cell types.",
        "Give one reason viruses are not placed in either group.",
    ])
    content_slide(prs, "Independent practice", [
        "Complete the prokaryote/eukaryote worksheet.",
        "Practise a six-mark comparison from memory.",
        "Next lesson: seeing these cells — microscopy and magnification.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Prokaryotic and eukaryotic cells")
    return title, len(prs.slides)


def build_microscopy(out):
    d = dg.all_diagrams()
    prs = new_presentation()
    title = "BTEC Unit 1 Biology: Microscopy"
    title_slide(prs, title, "Light and electron microscopes, magnification, resolution and measuring cells.", "BTEC Level 3  ·  Applied Science  ·  Unit 1  ·  Biology", d["light_microscope"])
    objectives_slide(prs, [
        "Describe how a light microscope forms an image and name its main parts.",
        "Distinguish magnification from resolution.",
        "Calculate magnification, actual size and image size using the standard triangle.",
        "Compare light and electron microscopes in terms of resolution, magnification and specimen preparation.",
        "Choose an appropriate instrument for a stated observation.",
    ])
    question_slide(prs, "Prior knowledge", [
        "Which knob do you use first when focusing a light microscope — coarse or fine?",
        "Why is a stain often used on a slide?",
        "If a cell is 25 µm long and the image is 25 mm long, what is the magnification?",
        "Which can see viruses more clearly — a school light microscope or an electron microscope?",
    ], "Do now")
    answer_slide(prs, "Retrieval answers", [
        "Coarse focus first with the lowest-power objective, then fine focus.",
        "To increase contrast so structures are visible.",
        "25 mm = 25 000 µm. Magnification = 25 000 / 25 = ×1000.",
        "An electron microscope — viruses are usually below the resolution of a light microscope.",
    ])
    section_slide(prs, "The light microscope", "Rays, lenses and contrast")
    diagram_slide(prs, "Light microscope schematic", d["light_microscope"], "Original apparatus diagram for teaching labels.", [
        "The lamp provides light that passes through the specimen.",
        "The objective lens produces a magnified real image.",
        "The eyepiece magnifies that image again.",
        "Total magnification = eyepiece × objective.",
        "The stage holds the slide; the coarse and fine wheels focus.",
    ])
    content_slide(prs, "Using a light microscope safely and well", [
        "Start with the lowest-power objective and the slide central on the stage.",
        "Move the objective close to the slide while watching from the side.",
        "Focus away from the slide using the coarse wheel, then refine with fine focus.",
        "Increase objective power only after the image is sharp.",
        "Use a coverslip to protect lenses and flatten the specimen. Wipe spills; never use the coarse wheel on high power.",
    ])
    two_col(prs, "Magnification versus resolution", "Magnification", [
        "How many times larger the image is than the real object",
        "M = image size / actual size",
        "Can be increased with stronger lenses",
        "Empty magnification adds no new detail",
    ], "Resolution", [
        "The smallest distance between two points that can still be seen as separate",
        "Limited by the wavelength of the radiation used",
        "Light microscopes: about 0.2 µm",
        "Electron microscopes: about 0.1 nm (much smaller)",
    ])
    content_slide(prs, "The calculation triangle", [
        "Write every quantity in the same unit before dividing.",
        "1 mm = 1000 µm. 1 µm = 1000 nm.",
        "Actual size = image size / magnification.",
        "Image size = actual size × magnification.",
        "Show the substitution and the unit conversion — that is where marks are won.",
    ])
    content_slide(prs, "Worked example 1", [
        "A mitochondrion image is 40 mm long. Magnification is ×20 000.",
        "Convert 40 mm to µm: 40 × 1000 = 40 000 µm.",
        "Actual size = 40 000 / 20 000 = 2 µm.",
        "Check: mitochondria are typically 1–10 µm, so 2 µm is sensible.",
        "If you forget to convert units, the answer will be wrong by a factor of 1000.",
    ])
    content_slide(prs, "Worked example 2", [
        "A bacterium is 2.0 µm long. The drawing is 80 mm long.",
        "80 mm = 80 000 µm.",
        "M = 80 000 / 2.0 = ×40 000.",
        "State the answer as ×40 000, not 40 000 alone.",
        "Include a scale bar on drawings in practical work.",
    ])
    question_slide(prs, "Magnification practice", [
        "Image = 15 mm, M = ×400. Find actual size in µm.",
        "Actual = 8 µm, image = 4.0 cm. Find M.",
        "A scale bar labelled 5 µm measures 25 mm on the page. What is M?",
    ])
    answer_slide(prs, "Calculation answers", [
        "15 mm = 15 000 µm. Actual = 15 000 / 400 = 37.5 µm.",
        "4.0 cm = 40 mm = 40 000 µm. M = 40 000 / 8 = ×5000.",
        "25 mm = 25 000 µm. M = 25 000 / 5 = ×5000.",
    ])
    section_slide(prs, "Electron microscopy", "Shorter wavelength, higher resolution")
    content_slide(prs, "Transmission and scanning", [
        "TEM (transmission): electrons pass through a thin specimen; good internal detail.",
        "SEM (scanning): electrons scan the surface; good 3D surface appearance.",
        "Both require a vacuum, so living specimens cannot be viewed.",
        "Preparation can introduce artefacts — treat images critically.",
        "Colour in published electron micrographs is usually added afterwards.",
    ])
    table_slide(prs, "Choosing an instrument", ["Need to see…", "Prefer", "Why"], [
        ["Living pond microbes swimming", "Light", "No vacuum; colour; movement"],
        ["Cristae inside a mitochondrion", "TEM", "High internal resolution"],
        ["Surface of a pollen grain", "SEM", "Surface topography"],
        ["Nucleus of an onion cell in class", "Light", "Large enough; simple prep"],
    ])
    activity_slide(prs, "Unit conversions drill", [
        "Convert 0.25 mm to µm and to nm.",
        "A drawing of a 30 µm cell is 12 cm wide. Calculate M.",
        "Write a two-sentence explanation of why increasing magnification alone may not reveal two close objects as separate.",
    ], "8 minutes")
    answer_slide(prs, "Drill answers", [
        "0.25 mm = 250 µm = 250 000 nm.",
        "12 cm = 120 mm = 120 000 µm. M = 120 000 / 30 = ×4000.",
        "Resolution, not magnification, limits whether two points appear separate. If they are closer than the resolution, they blur into one.",
    ])
    misconception_slide(prs, [
        ("Higher magnification always means a clearer image.", "Resolution decides useful detail."),
        ("Electron microscopes are used in school practicals on living cells.", "They need a vacuum; living cells are not used."),
        ("µm and nm can be mixed in the same calculation without converting.", "Convert to one unit first."),
    ])
    add_microscopy_depth(prs)
    question_slide(prs, "Exam-style practice", [
        "Calculate the actual width of a cell if the image is 42 mm wide and the magnification is ×700. Give your answer in µm. (2)",
        "Compare the resolution of a light microscope with that of a TEM and explain the difference. (4)",
        "Give two reasons a scientist might still choose a light microscope rather than an electron microscope. (2)",
    ], "Exam-style practice")
    answer_slide(prs, "Exam-style answers", [
        "42 mm = 42 000 µm. Actual = 42 000 / 700 = 60 µm.",
        "Light microscope resolution is about 0.2 µm; TEM is much smaller (about 0.1 nm). Electrons have a shorter wavelength than light, so two close points can be distinguished.",
        "Can view living specimens / cheaper / colour / easier sample preparation / portable. (Any two.)",
    ])
    content_slide(prs, "Plenary", [
        "State the magnification formula.",
        "Define resolution in one sentence.",
        "Name one structure you would need an electron microscope to study clearly.",
    ])
    content_slide(prs, "Independent practice", [
        "Complete the microscopy worksheet, including the calculation page.",
        "Practise unit conversions until they are automatic.",
        "Optional practical: calibrate an eyepiece graticule if your centre has the slides.",
    ])
    save_prs(prs, out, title, "BTEC Unit 1 Biology", "Microscopy")
    return title, len(prs.slides)
