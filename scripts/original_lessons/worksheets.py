"""Original companion worksheets and answer sheets (PDF)."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

TEAL = HexColor("#009688")
TEAL_DARK = HexColor("#004D40")
INK = HexColor("#0F172A")
MUTED = HexColor("#475569")
RULE = HexColor("#CCFBF1")


def _styles():
    base = getSampleStyleSheet()
    styles = {
        "kicker": ParagraphStyle("kicker", parent=base["Normal"], textColor=TEAL, fontName="Times-Bold", fontSize=10, spaceAfter=2),
        "title": ParagraphStyle("title", parent=base["Title"], textColor=TEAL_DARK, fontName="Times-Bold", fontSize=18, leading=22, spaceAfter=6, alignment=0),
        "h": ParagraphStyle("h", parent=base["Heading2"], textColor=TEAL_DARK, fontName="Times-Bold", fontSize=13, spaceBefore=10, spaceAfter=4),
        "body": ParagraphStyle("body", parent=base["Normal"], textColor=INK, fontName="Times-Roman", fontSize=11, leading=15, spaceAfter=4),
        "q": ParagraphStyle("q", parent=base["Normal"], textColor=INK, fontName="Times-Roman", fontSize=11, leading=15, leftIndent=12, spaceAfter=8),
        "foot": ParagraphStyle("foot", parent=base["Normal"], textColor=MUTED, fontName="Times-Italic", fontSize=8),
    }
    return styles


def _header_footer(title, kind):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(TEAL_DARK)
        canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont("Times-Bold", 9)
        canvas.drawString(16 * mm, A4[1] - 8 * mm, "jdscience.co.uk")
        canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 8 * mm, kind)
        canvas.setFillColor(TEAL_DARK)
        canvas.rect(0, 0, A4[0], 10 * mm, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont("Times-Roman", 8)
        canvas.drawString(16 * mm, 4 * mm, title)
        canvas.drawRightString(A4[0] - 16 * mm, 4 * mm, f"Page {doc.page}")
        canvas.restoreState()

    return draw


def write_pdf(path: Path, title: str, kicker: str, kind: str, sections: list[tuple[str, list[str]]]):
    path.parent.mkdir(parents=True, exist_ok=True)
    styles = _styles()
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title=title,
        author="JDScience",
    )
    story = [
        Paragraph(kicker, styles["kicker"]),
        Paragraph(title, styles["title"]),
        Paragraph(
            "Original JDScience practice. These questions were written for this resource and are not official exam-board items."
            if "Answer" not in kind
            else "Mark scheme for the companion worksheet. Accept equivalent correct wording.",
            styles["body"],
        ),
        Spacer(1, 4),
    ]
    for heading, items in sections:
        story.append(Paragraph(heading, styles["h"]))
        for item in items:
            story.append(Paragraph(item, styles["q"]))
    doc.build(story, onFirstPage=_header_footer(title, kind), onLaterPages=_header_footer(title, kind))
    return path


WORKSHEETS = {
    "atomic-structure": {
        "title": "Atomic Structure",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  State the relative charge and relative mass of a proton, a neutron and an electron.",
                "2.  Define atomic number and mass number.",
                "3.  What is the same, and what is different, in a pair of isotopes?",
            ]),
            ("B  Knowledge", [
                "4.  A neutral atom of <sup>39</sup>K has atomic number 19. Calculate the numbers of protons, neutrons and electrons.",
                "5.  Explain why atoms are electrically neutral.",
                "6.  Describe where almost all of the mass of an atom is found, and why the atom is mostly empty space.",
            ]),
            ("C  Application and calculation", [
                "7.  Complete a table for <sup>24</sup>Mg, <sup>24</sup>Mg<sup>2+</sup>, <sup>19</sup>F and <sup>19</sup>F<sup>−</sup> showing protons, neutrons and electrons.",
                "8.  Gallium occurs as 60.0% <sup>69</sup>Ga and 40.0% <sup>71</sup>Ga. Calculate A<sub>r</sub>.",
                "9.  Explain why the A<sub>r</sub> of chlorine on the periodic table is not a whole number.",
            ]),
            ("D  Exam-style practice", [
                "10.  A student claims that <sup>14</sup>C and <sup>14</sup>N are isotopes of each other. Explain why this is incorrect. [2]",
                "11.  Calculate A<sub>r</sub> for an element that is 75% isotope-63 and 25% isotope-65. [2]",
                "12.  Explain how a 2− ion forms from a neutral atom, referring to protons and electrons. [3]",
            ]),
            ("E  Challenge", [
                "13.  Neon has peaks at mass numbers 20, 21 and 22 with relative abundances 90.5, 0.27 and 9.25. Calculate A<sub>r</sub> to 3 s.f. and comment on the effect of ignoring the middle isotope.",
            ]),
        ],
        "answers": [
            ("A", [
                "1.  Proton +1, mass 1. Neutron 0, mass 1. Electron −1, mass ≈ 1/1836 (very small).",
                "2.  Atomic number = number of protons. Mass number = protons + neutrons.",
                "3.  Same proton number / element; different neutron number / mass number.",
            ]),
            ("B", [
                "4.  19 p, 20 n, 19 e.",
                "5.  Number of protons equals number of electrons, so charges cancel.",
                "6.  Mass is in the nucleus (protons and neutrons). Electrons occupy a much larger volume of mostly empty space.",
            ]),
            ("C", [
                "7.  Mg: 12p 12n 12e. Mg2+: 12p 12n 10e. F: 9p 10n 9e. F−: 9p 10n 10e.",
                "8.  A<sub>r</sub> = (60×69 + 40×71)/100 = 69.8",
                "9.  Chlorine is a mixture of <sup>35</sup>Cl and <sup>37</sup>Cl; A<sub>r</sub> is a weighted mean.",
            ]),
            ("D", [
                "10.  Isotopes must have the same proton number. C has 6 protons; N has 7, so they are different elements.",
                "11.  (75×63 + 25×65)/100 = 63.5",
                "12.  The atom gains two electrons. Proton number is unchanged. Electrons now exceed protons by 2, so charge is 2−.",
            ]),
            ("E", [
                "13.  A<sub>r</sub> = (90.5×20 + 0.27×21 + 9.25×22)/100 = 20.2 (3 s.f.). Ignoring 21Ne changes the value only at the third significant figure / has a very small effect.",
            ]),
        ],
    },
    "electron-configuration": {
        "title": "Electron Configuration",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  State the maximum number of electrons in the first, second and third shells for the first 20 elements as used in this course.",
                "2.  How many electrons can an s subshell and a p subshell hold?",
                "3.  What does the group number tell you about a Group 1 or Group 7 atom?",
            ]),
            ("B  Knowledge", [
                "4.  Write shell configurations for N, Mg, Cl and K.",
                "5.  Write full subshell configurations for O, Al and Ca.",
                "6.  Explain why noble gases are chemically unreactive in terms of electron arrangement.",
            ]),
            ("C  Application", [
                "7.  Write the configuration of O<sup>2−</sup>, Al<sup>3+</sup> and Cl<sup>−</sup>.",
                "8.  A student writes calcium as 2,8,10. Correct the configuration and explain the error.",
                "9.  Explain, using electrons, why magnesium forms a 2+ ion.",
            ]),
            ("D  Exam-style practice", [
                "10.  Write the electron configuration of Mg<sup>2+</sup> and explain why the ion is stable. [3]",
                "11.  Explain why oxygen typically forms a 2− ion. [3]",
                "12.  Identify the block (s, p or d) for sodium, fluorine and iron, and justify one of them. [3]",
            ]),
            ("E  Challenge", [
                "13.  Write [Ne] shorthand configurations for phosphorus and for P<sup>3−</sup>. Explain the relationship between them.",
            ]),
        ],
        "answers": [
            ("A", ["1.  2, 8 and 8.", "2.  s: 2. p: 6.", "3.  Group 1: one outer electron. Group 7: seven outer electrons."]),
            ("B", ["4.  N 2,5; Mg 2,8,2; Cl 2,8,7; K 2,8,8,1.", "5.  O 1s2 2s2 2p4; Al 1s2 2s2 2p6 3s2 3p1; Ca 1s2 2s2 2p6 3s2 3p6 4s2.", "6.  They already have a full outer shell, so they do not easily lose, gain or share electrons."]),
            ("C", ["7.  O2− 2,8 / 1s2 2s2 2p6; Al3+ 2,8 / 1s2 2s2 2p6; Cl− 2,8,8 / 1s2 2s2 2p6 3s2 3p6.", "8.  Calcium is 2,8,8,2. After 2,8,8 the next two electrons occupy the fourth shell, not a 10-electron third shell in this course.", "9.  Mg is 2,8,2. Losing two electrons leaves 2,8, a full outer shell."]),
            ("D", ["10.  Mg2+ is 2,8 or 1s2 2s2 2p6. This matches a noble-gas / full outer-shell arrangement, which is stable.", "11.  Oxygen is 2,6. Gaining two electrons gives 2,8, a full outer shell.", "12.  Na s-block; F p-block; Fe d-block. Sodium’s outer electron is in an s subshell / fluorine is filling 2p / iron is filling 3d."]),
            ("E", ["13.  P is [Ne] 3s2 3p3. P3− is [Ne] 3s2 3p6. The ion has gained three electrons to fill 3p."]),
        ],
    },
    "ionic-bonding": {
        "title": "Ionic Bonding",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Define ionic bonding.",
                "2.  Between which types of element does ionic bonding usually form?",
                "3.  Why does solid sodium chloride not conduct electricity?",
            ]),
            ("B  Knowledge", [
                "4.  Describe, in terms of electrons, how NaCl forms.",
                "5.  Explain why ionic compounds have high melting points.",
                "6.  Why can molten or aqueous ionic compounds conduct electricity?",
            ]),
            ("C  Application", [
                "7.  Deduce formulae for the compounds of Na and O; Mg and Cl; Al and O.",
                "8.  Explain why an ionic crystal is brittle.",
                "9.  Compare the particles that carry charge in molten NaCl and in a copper wire.",
            ]),
            ("D  Exam-style practice", [
                "10.  Describe how ionic bonding arises in magnesium oxide. [4]",
                "11.  Explain why sodium chloride has a high melting point but does not conduct as a solid. [4]",
                "12.  Deduce the formula of the compound formed between Al<sup>3+</sup> and SO<sub>4</sub><sup>2−</sup>. [2]",
            ]),
            ("E  Challenge", [
                "13.  Suggest why magnesium oxide has a higher melting point than sodium chloride, referring to charge and attraction.",
            ]),
        ],
        "answers": [
            ("A", ["1.  Electrostatic attraction between oppositely charged ions.", "2.  A metal and a non-metal.", "3.  Ions are not free to move."]),
            ("B", ["4.  Na loses 1 electron to form Na+. Cl gains that electron to form Cl−. Oppositely charged ions attract.", "5.  Strong attractions throughout a giant lattice need a lot of energy to overcome.", "6.  Ions become free to move and carry charge."]),
            ("C", ["7.  Na2O; MgCl2; Al2O3.", "8.  A shift lines up like charges, which repel, so the crystal splits.", "9.  Molten NaCl: mobile ions. Copper: delocalised electrons."]),
            ("D", ["10.  Mg loses 2e− → Mg2+. O gains 2e− → O2−. Electrostatic attraction. Giant lattice of Mg2+ and O2−.", "11.  Strong ionic attractions throughout the lattice → high m.p. Solid ions fixed → no conduction.", "12.  Al2(SO4)3 so +6 balances −6."]),
            ("E", ["13.  Mg2+ and O2− have higher charges than Na+ and Cl−, so the electrostatic attraction is stronger and more energy is needed to melt the lattice."]),
        ],
    },
    "covalent-bonding": {
        "title": "Covalent Bonding",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Define a covalent bond.",
                "2.  What is a lone pair?",
                "3.  Give one simple-molecular and one giant-covalent example.",
            ]),
            ("B  Knowledge", [
                "4.  Explain how a chlorine molecule is held together.",
                "5.  Describe the bonding and structure of diamond.",
                "6.  Why does graphite conduct electricity when diamond does not?",
            ]),
            ("C  Application", [
                "7.  State the number of shared pairs in F2, O2, N2 and CH4.",
                "8.  Explain why water has a much lower boiling point than silicon dioxide.",
                "9.  Why does boiling water not break O–H covalent bonds?",
            ]),
            ("D  Exam-style practice", [
                "10.  Describe how a covalent bond forms in a hydrogen molecule. [3]",
                "11.  Explain why iodine melts far below diamond. [4]",
                "12.  Explain why carbon dioxide does not conduct electricity. [2]",
            ]),
            ("E  Challenge", [
                "13.  Ammonia can accept a proton to form NH4+. Explain this using the idea of a lone pair and a dative covalent bond.",
            ]),
        ],
        "answers": [
            ("A", ["1.  A shared pair of electrons.", "2.  An outer-shell pair not used in bonding.", "3.  e.g. H2O or CO2; diamond, graphite or SiO2."]),
            ("B", ["4.  Each Cl shares one electron; the shared pair is attracted to both nuclei.", "5.  Each C bonded to four others in a tetrahedral giant covalent network.", "6.  Graphite has delocalised electrons between layers; diamond’s electrons are all in C–C bonds."]),
            ("C", ["7.  1, 2, 3 and 4.", "8.  Water is simple molecular (weak intermolecular forces). SiO2 is giant covalent (many strong bonds must break).", "9.  Boiling overcomes intermolecular forces; covalent bonds inside molecules remain."]),
            ("D", ["10.  Each H has 1 electron. They share a pair. Both then have a full first shell. The pair is attracted to both nuclei.", "11.  Iodine is simple molecular — weak forces between I2 molecules. Diamond is giant covalent — many strong C–C bonds must break.", "12.  No mobile ions or delocalised electrons."]),
            ("E", ["13.  Nitrogen has a lone pair. The pair is donated into a vacant orbital on H+ to form a dative bond. All four N–H bonds in NH4+ are equivalent once formed."]),
        ],
    },
    "metallic-bonding": {
        "title": "Metallic Bonding",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Define metallic bonding.",
                "2.  Which particles move when a metal conducts electricity?",
                "3.  What is meant by malleable?",
            ]),
            ("B  Knowledge", [
                "4.  Describe the structure of a solid metal.",
                "5.  Explain why metals conduct heat well.",
                "6.  Explain why metals can be drawn into wires.",
            ]),
            ("C  Application", [
                "7.  Why does solid magnesium conduct but solid magnesium oxide does not?",
                "8.  Suggest why steel is harder than pure iron.",
                "9.  Why are Group 1 metals softer than many transition metals?",
            ]),
            ("D  Exam-style practice", [
                "10.  Describe the bonding in solid magnesium. [3]",
                "11.  Explain why metals are malleable but ionic crystals are brittle. [4]",
                "12.  Explain why copper is used for electrical wiring. [2]",
            ]),
            ("E  Challenge", [
                "13.  Use ideas about charge and delocalised electrons to suggest why aluminium has a higher melting point than sodium.",
            ]),
        ],
        "answers": [
            ("A", ["1.  Attraction between positive metal ions and delocalised electrons.", "2.  Delocalised electrons.", "3.  Can be hammered into sheets without breaking."]),
            ("B", ["4.  Lattice of positive ions surrounded by a sea of delocalised electrons.", "5.  Electrons transfer kinetic energy rapidly through the lattice.", "6.  Layers of ions slide; electrons still hold the structure together."]),
            ("C", ["7.  Mg has mobile electrons; MgO ions are fixed in the solid lattice.", "8.  Different-sized atoms in the alloy hinder layers sliding.", "9.  Only one delocalised electron per atom / 1+ ions → weaker metallic bonding."]),
            ("D", ["10.  Mg2+ lattice; delocalised electrons; electrostatic attraction is metallic bonding.", "11.  Metal layers slide and electrons still attract ions. Ionic lattice: sliding lines up like charges, so it shatters.", "12.  Delocalised electrons make it a good conductor; it is also ductile."]),
            ("E", ["13.  Al forms 3+ ions and contributes more delocalised electrons than Na (1+), so the metallic attraction is stronger and the melting point is higher."]),
        ],
    },
    "cell-structure": {
        "title": "Cell Structure",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  State the function of the nucleus, a mitochondrion and a ribosome.",
                "2.  Name three structures found in plant cells but not in typical animal cells.",
                "3.  What is meant by a selectively permeable membrane?",
            ]),
            ("B  Knowledge", [
                "4.  Describe the structure of the cell-surface membrane.",
                "5.  Explain how cristae help mitochondria to transfer energy.",
                "6.  Describe the role of the cellulose cell wall.",
            ]),
            ("C  Application", [
                "7.  Why do muscle cells contain many mitochondria?",
                "8.  Root cells usually lack chloroplasts. Explain why this is not a problem for the plant.",
                "9.  Explain why mature mammalian red blood cells cannot produce new proteins.",
            ]),
            ("D  Exam-style practice", [
                "10.  Describe the functions of the nucleus and mitochondria in an animal cell. [4]",
                "11.  Explain two ways a palisade cell is adapted for photosynthesis. [4]",
                "12.  Distinguish between the cell wall and the cell membrane. [3]",
            ]),
            ("E  Challenge", [
                "13.  Secretory cells have extensive RER and Golgi bodies. Explain this combination in terms of protein trafficking.",
            ]),
        ],
        "answers": [
            ("A", ["1.  Nucleus: DNA / control of protein synthesis. Mitochondrion: aerobic respiration / ATP. Ribosome: protein synthesis.", "2.  Cell wall, chloroplasts, permanent vacuole.", "3.  Allows some substances to cross and restricts others."]),
            ("B", ["4.  Phospholipid bilayer with proteins (and cholesterol / glycoproteins in animal cells).", "5.  Folds increase surface area for respiratory enzymes / electron-transport proteins.", "6.  Support, shape, and prevention of osmotic bursting; freely permeable."]),
            ("C", ["7.  High ATP demand for contraction.", "8.  Photosynthesis occurs in green shoots and leaves; roots absorb water and minerals instead.", "9.  They have no nucleus, so no DNA for transcription."]),
            ("D", ["10.  Nucleus contains DNA and controls protein synthesis. Mitochondria carry out aerobic respiration / produce ATP.", "11.  Many chloroplasts; position near the upper leaf; vacuole maintains turgidity; elongated shape. Any two explained.", "12.  Wall: cellulose, freely permeable, support. Membrane: bilayer, selectively permeable, controls exchange."]),
            ("E", ["13.  RER synthesises and processes proteins. Golgi modifies and packages them into vesicles for secretion."]),
        ],
    },
    "prokaryotic-and-eukaryotic-cells": {
        "title": "Prokaryotic and Eukaryotic Cells",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  What is the defining difference between prokaryotic and eukaryotic cells?",
                "2.  Name four structures of a typical bacterial cell.",
                "3.  Are viruses prokaryotic, eukaryotic, or neither? Justify.",
            ]),
            ("B  Knowledge", [
                "4.  Compare DNA organisation in a bacterium and in an animal cell.",
                "5.  What is a plasmid, and why can it be medically important?",
                "6.  State typical size ranges for bacterial and animal cells.",
            ]),
            ("C  Application", [
                "7.  Explain why some antibiotics can kill bacteria without killing human cells.",
                "8.  Why can bacterial populations become resistant to an antibiotic so quickly?",
                "9.  A student finds mitochondria in a cell. Which cell type is it? Explain.",
            ]),
            ("D  Exam-style practice", [
                "10.  Give three differences between a bacterial cell and an animal cell. [3]",
                "11.  Explain how plasmids can be medically important. [3]",
                "12.  Explain why bacteria are described as prokaryotic. [2]",
            ]),
            ("E  Challenge", [
                "13.  Mitochondria and chloroplasts contain circular DNA and 70S ribosomes. Suggest how this observation is used in the endosymbiotic theory.",
            ]),
        ],
        "answers": [
            ("A", ["1.  Eukaryotes have a nucleus / membrane-bound organelles; prokaryotes do not.", "2.  Cell wall, membrane, loop of DNA, ribosomes; also plasmid / flagellum / capsule.", "3.  Neither — they are acellular / not cells."]),
            ("B", ["4.  Bacterium: circular loop in cytoplasm, plasmids possible. Animal: linear chromosomes in a nucleus, with histones.", "5.  Small extra DNA circle; may carry resistance genes or be used as a vector.", "6.  Bacteria about 1–5 µm; animal cells about 10–30 µm (accept 10–100 µm)."]),
            ("C", ["7.  Antibiotics can target peptidoglycan walls or 70S ribosomes, which human cells lack or have in a different form.", "8.  Rapid binary fission plus mutation and selection; plasmids can transfer resistance.", "9.  Eukaryotic — mitochondria are membrane-bound organelles."]),
            ("D", ["10.  Nucleus / mitochondria / DNA form / ribosome type / wall / size — any three paired differences.", "11.  Carry resistance genes; transferable; used as vectors / make infections harder to treat.", "12.  No nucleus / DNA not enclosed by a nuclear envelope / no membrane-bound organelles."]),
            ("E", ["13.  These features resemble free-living bacteria, supporting the idea that the organelles originated from engulfed prokaryotes."]),
        ],
    },
    "microscopy": {
        "title": "Microscopy",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Write the magnification formula.",
                "2.  Define resolution.",
                "3.  Convert 2.5 mm to µm and to nm.",
            ]),
            ("B  Knowledge", [
                "4.  How do you calculate total magnification of a light microscope?",
                "5.  Give two differences between a TEM and an SEM.",
                "6.  Why can a living amoeba be viewed with a light microscope but not with an electron microscope?",
            ]),
            ("C  Calculations", [
                "7.  An image is 18 mm wide and magnification is ×600. Calculate actual size in µm.",
                "8.  A 7.5 µm cell is drawn 3.0 cm wide. Calculate magnification.",
                "9.  A 10 µm scale bar measures 40 mm on a photograph. Calculate magnification.",
            ]),
            ("D  Exam-style practice", [
                "10.  Calculate the actual width of a cell if the image is 35 mm wide at ×500. Give the answer in µm. [2]",
                "11.  Compare the resolution of a light microscope and a TEM. [4]",
                "12.  Give two reasons for choosing a light microscope rather than an electron microscope. [2]",
            ]),
            ("E  Challenge", [
                "13.  A student increases magnification from ×100 to ×1000 but cannot separate two close granules. Explain, using resolution.",
            ]),
        ],
        "answers": [
            ("A", ["1.  M = image size / actual size.", "2.  Smallest distance at which two points can still be seen as separate.", "3.  2500 µm; 2.5 × 10<sup>6</sup> nm."]),
            ("B", ["4.  Eyepiece magnification × objective magnification.", "5.  TEM: electrons through a thin specimen, internal detail. SEM: surface scan, 3D appearance.", "6.  Electron microscopes require a vacuum; living specimens cannot be used."]),
            ("C", ["7.  18 mm = 18 000 µm; actual = 18 000/600 = 30 µm.", "8.  3.0 cm = 30 000 µm; M = 30 000/7.5 = ×4000.", "9.  40 mm = 40 000 µm; M = 40 000/10 = ×4000."]),
            ("D", ["10.  35 mm = 35 000 µm; actual = 70 µm.", "11.  Light about 0.2 µm; TEM much smaller (about 0.1 nm) because electrons have a shorter wavelength.", "12.  Living specimens / colour / cheaper / easier preparation."]),
            ("E", ["13.  The granules are closer together than the resolution. Extra magnification enlarges the blur but cannot separate them (empty magnification)."]),
        ],
    },
    "progressive-waves": {
        "title": "Progressive Waves",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Physics  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Define amplitude, wavelength and frequency.",
                "2.  Write the wave equation and give SI units for each quantity.",
                "3.  How are period and frequency related?",
            ]),
            ("B  Knowledge", [
                "4.  What does a progressive wave transfer, and what does it not transfer?",
                "5.  Which quantity stays the same when a wave enters a new medium?",
                "6.  How is amplitude read from a displacement–distance graph?",
            ]),
            ("C  Calculations", [
                "7.  f = 4.0 Hz, λ = 0.80 m. Calculate v.",
                "8.  A radio wave has f = 200 MHz. Take c = 3.00 × 10<sup>8</sup> m s<sup>−1</sup>. Calculate λ.",
                "9.  A wave travels 48 m in 0.16 s. If λ = 2.0 m, calculate f.",
            ]),
            ("D  Exam-style practice", [
                "10.  Define amplitude and wavelength. [2]",
                "11.  A note of 510 Hz travels at 340 m s<sup>−1</sup>. Calculate λ. [2]",
                "12.  Explain why air particles do not travel from a loudspeaker to a listener. [3]",
            ]),
            ("E  Challenge", [
                "13.  A displacement–time trace has 5 complete cycles in 20 ms. The matching snapshot shows 4.0 cm between adjacent crests. Calculate f, T, λ and v. Show unit conversions.",
            ]),
        ],
        "answers": [
            ("A", ["1.  A: max displacement from equilibrium. λ: shortest distance between points in phase. f: oscillations per second.", "2.  v = fλ; m s−1, Hz, m.", "3.  T = 1/f."]),
            ("B", ["4.  Transfers energy (and information), not a net transfer of matter.", "5.  Frequency.", "6.  Vertical distance from the equilibrium line to a crest (not crest-to-trough)."]),
            ("C", ["7.  3.2 m s−1.", "8.  f = 2.00 × 10<sup>8</sup> Hz; λ = 1.50 m.", "9.  v = 300 m s−1; f = 150 Hz."]),
            ("D", ["10.  See retrieval definitions.", "11.  λ = 340/510 = 0.667 m (3 s.f.).", "12.  Particles oscillate about equilibrium; energy is passed along; no net movement of air."]),
            ("E", ["13.  T = 20 ms / 5 = 4.0 ms; f = 250 Hz; λ = 0.040 m; v = 10 m s−1."]),
        ],
    },
    "wave-properties": {
        "title": "Wave Properties",
        "kicker": "BTEC Level 3 Applied Science  ·  Unit 1 Physics  ·  Worksheet",
        "questions": [
            ("A  Retrieval", [
                "1.  Define a transverse wave and a longitudinal wave.",
                "2.  Give one example of each.",
                "3.  State the principle of superposition.",
            ]),
            ("B  Knowledge", [
                "4.  What is a compression and what is a rarefaction?",
                "5.  When are two points on a wave in phase?",
                "6.  Why can light be polarised but sound in air cannot?",
            ]),
            ("C  Application", [
                "7.  Classify ultrasound, microwaves and stadium sound as transverse or longitudinal.",
                "8.  Two crests are 6.0 cm apart and λ = 2.0 cm. Are they in phase? Explain.",
                "9.  Describe what happens when a crest meets a trough of equal amplitude.",
            ]),
            ("D  Exam-style practice", [
                "10.  Describe the difference between transverse and longitudinal waves, with an example of each. [4]",
                "11.  State the principle of superposition. [2]",
                "12.  Explain why sound from a loudspeaker cannot be polarised. [2]",
            ]),
            ("E  Challenge", [
                "13.  A student says a sine-wave drawing of sound proves sound is transverse. Write a correction a teacher could use.",
            ]),
        ],
        "answers": [
            ("A", ["1.  Transverse: oscillation perpendicular to energy transfer. Longitudinal: parallel.", "2.  Light / water / string; sound / P-waves / slinky compressions.", "3.  Resultant displacement is the sum of individual displacements."]),
            ("B", ["4.  Compression: particles closer / higher pressure. Rarefaction: more spaced / lower pressure.", "5.  They reach maxima and minima together / separated by nλ.", "6.  Light is transverse so oscillations have a direction that can be filtered; sound is longitudinal."]),
            ("C", ["7.  Ultrasound longitudinal; microwaves transverse; stadium sound longitudinal.", "8.  Yes — separation is 3λ, a whole number of wavelengths.", "9.  Destructive superposition / cancellation (resultant zero if amplitudes are equal)."]),
            ("D", ["10.  See definitions plus one valid example of each.", "11.  Resultant displacement = sum of individual displacements.", "12.  Polarisation needs a transverse direction; sound is longitudinal."]),
            ("E", ["13.  The sine curve is a graph of pressure or displacement against distance or time. The air particles still oscillate parallel to the direction of travel."]),
        ],
    },
}


def build_all(out_root: Path):
    written = []
    for slug, spec in WORKSHEETS.items():
        folder = out_root / slug
        qpath = folder / f"btec-unit-1-{slug}-worksheet.pdf"
        apath = folder / f"btec-unit-1-{slug}-answers.pdf"
        write_pdf(qpath, spec["title"], spec["kicker"], "Worksheet", spec["questions"])
        write_pdf(apath, f"{spec['title']} — Answers", spec["kicker"].replace("Worksheet", "Answer sheet"), "Answer sheet", spec["answers"])
        written.append((spec["title"], qpath, apath))
    return written
