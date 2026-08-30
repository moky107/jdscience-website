"""Multi-page original worksheets and separate answer sheets."""

from __future__ import annotations

import zipfile
from pathlib import Path

from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .theme import MEDIA

TEAL = HexColor("#009688")
TEAL_DARK = HexColor("#004D40")
INK = HexColor("#0F172A")
MUTED = HexColor("#475569")
RULE = HexColor("#99F6E4")
LINE = HexColor("#CBD5E1")
CREAM = HexColor("#F0FDFA")


def _styles():
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle("kicker", parent=base["Normal"], textColor=TEAL, fontName="Times-Bold", fontSize=10, spaceAfter=2),
        "title": ParagraphStyle("title", parent=base["Title"], textColor=TEAL_DARK, fontName="Times-Bold", fontSize=18, leading=22, spaceAfter=4, alignment=0),
        "obj": ParagraphStyle("obj", parent=base["Normal"], textColor=MUTED, fontName="Times-Italic", fontSize=10, leading=13, spaceAfter=8),
        "h": ParagraphStyle("h", parent=base["Heading2"], textColor=TEAL_DARK, fontName="Times-Bold", fontSize=13, spaceBefore=8, spaceAfter=4),
        "body": ParagraphStyle("body", parent=base["Normal"], textColor=INK, fontName="Times-Roman", fontSize=11, leading=14, spaceAfter=4),
        "q": ParagraphStyle("q", parent=base["Normal"], textColor=INK, fontName="Times-Roman", fontSize=11, leading=14, leftIndent=0, spaceAfter=3),
        "note": ParagraphStyle("note", parent=base["Normal"], textColor=MUTED, fontName="Times-Italic", fontSize=9, leading=12, spaceAfter=4),
        "ans": ParagraphStyle("ans", parent=base["Normal"], textColor=INK, fontName="Times-Roman", fontSize=10.5, leading=14, leftIndent=8, spaceAfter=6),
    }


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


def lines(n=4, width=170 * mm):
    data = [[""] for _ in range(n)]
    t = Table(data, colWidths=[width], rowHeights=[7 * mm] * n)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
        ("LINEBELOW", (0, -1), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def calc_box(label="Working"):
    data = [[label], [""], [""], [""], [""]]
    t = Table(data, colWidths=[170 * mm], rowHeights=[6 * mm, 8 * mm, 8 * mm, 8 * mm, 8 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CREAM),
        ("TEXTCOLOR", (0, 0), (-1, 0), TEAL_DARK),
        ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
        ("LINEBELOW", (0, 1), (-1, -2), 0.3, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 3),
    ]))
    return t


def _cell_style(color, bold=False, size=9):
    return ParagraphStyle(
        f"cell-{color}-{bold}-{size}",
        textColor=color,
        fontName="Times-Bold" if bold else "Times-Roman",
        fontSize=size,
        leading=size + 2,
        alignment=1,
    )


def blank_table(headers, rows=4, col_w=None):
    head_style = _cell_style(white, True, 9)
    data = [[Paragraph(h, head_style) for h in headers]] + [[""] * len(headers) for _ in range(rows)]
    widths = col_w or [170 * mm / len(headers)] * len(headers)
    t = Table(data, colWidths=widths, rowHeights=[8 * mm] + [10 * mm] * rows)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, TEAL),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 1), (-1, -1), white),
    ]))
    return t


def fig(name, w=150 * mm, h=55 * mm):
    path = MEDIA / name
    if path.exists():
        return Image(str(path), width=w, height=h)
    return Spacer(1, h)


def question_block(styles, number, text, space="lines", n=4, table=None, image=None, extra=None):
    bits = [Paragraph(f"<b>{number}.</b>  {text}", styles["q"])]
    if extra:
        bits.append(Paragraph(extra, styles["note"]))
    if image:
        bits.append(Spacer(1, 2 * mm))
        bits.append(image)
        bits.append(Spacer(1, 2 * mm))
    if table is not None:
        bits.append(Spacer(1, 2 * mm))
        bits.append(table)
        bits.append(Spacer(1, 2 * mm))
    if space == "lines":
        bits.append(lines(n))
    elif space == "calc":
        bits.append(Spacer(1, 1 * mm))
        bits.append(calc_box())
    elif space == "table_only":
        pass
    bits.append(Spacer(1, 3 * mm))
    return KeepTogether(bits)


def build_doc(path, title, kicker, kind, flowables):
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
    ]
    story.extend(flowables)
    doc.build(story, onFirstPage=_header_footer(title, kind), onLaterPages=_header_footer(title, kind))
    return path


def _disclaimer(styles, answers=False):
    if answers:
        return Paragraph("Mark scheme for the companion worksheet. Accept equivalent correct wording. These are original JDScience items, not official Pearson questions.", styles["body"])
    return Paragraph("Original JDScience practice. These questions were written for this resource and are not official exam-board items.", styles["obj"])


def atomic_student(styles):
    s = []
    s.append(_disclaimer(styles))
    s.append(Paragraph("Learning focus: particles, nuclide notation, isotopes, A<sub>r</sub> and ions.", styles["obj"]))
    s.append(Paragraph("A  Retrieval", styles["h"]))
    s.append(question_block(styles, 1, "State the relative charge and relative mass of a proton, a neutron and an electron.", n=3))
    s.append(question_block(styles, 2, "Define atomic number (<i>Z</i>) and mass number (<i>A</i>).", n=3))
    s.append(question_block(styles, 3, "What is the same, and what is different, in a pair of isotopes?", n=3))
    s.append(Paragraph("B  Knowledge", styles["h"]))
    s.append(question_block(styles, 4, "A neutral atom of <super>39</super>K has atomic number 19. Calculate the numbers of protons, neutrons and electrons.", "calc"))
    s.append(question_block(styles, 5, "Explain why atoms are electrically neutral even though they contain charged particles.", n=4))
    s.append(PageBreak())
    s.append(Paragraph("C  Application and calculation", styles["h"]))
    s.append(question_block(
        styles, 6,
        "Complete the table for <super>24</super>Mg, <super>24</super>Mg<super>2+</super>, <super>19</super>F and <super>19</super>F<super>−</super>.",
        "table_only",
        table=blank_table(["Species", "Protons", "Neutrons", "Electrons"], 4, [50 * mm, 40 * mm, 40 * mm, 40 * mm]),
    ))
    s.append(question_block(styles, 7, "Gallium occurs as 60.0% <super>69</super>Ga and 40.0% <super>71</super>Ga. Calculate A<sub>r</sub>. Show substitution.", "calc"))
    s.append(question_block(styles, 8, "Explain why the A<sub>r</sub> of chlorine on the periodic table is not a whole number.", n=4))
    s.append(Paragraph("D  Exam-style practice", styles["h"]))
    s.append(question_block(styles, 9, "A student claims that <super>14</super>C and <super>14</super>N are isotopes of each other. Explain why this is incorrect. [2]", n=5))
    s.append(question_block(styles, 10, "Calculate A<sub>r</sub> for an element that is 75% isotope-63 and 25% isotope-65. [2]", "calc"))
    s.append(PageBreak())
    s.append(question_block(styles, 11, "Explain how a 2<sup>−</sup> ion forms from a neutral atom, referring to protons and electrons. [3]", n=6))
    s.append(Paragraph("E  Challenge", styles["h"]))
    s.append(fig("mass-spectrum.png", 160 * mm, 52 * mm))
    s.append(question_block(styles, 12, "The sketch shows a chlorine-style abundance plot. A sample is 75.0% <super>35</super>Cl and 25.0% <super>37</super>Cl. Calculate A<sub>r</sub> to 3 s.f. and explain why the value is not a whole number.", "calc"))
    s.append(question_block(styles, 13, "On the blank nuclide card, complete A, Z, protons, neutrons and the electron number of Na<super>+</super> for sodium-23.", n=5, image=fig("sodium-nuclide-blank.png", 140 * mm, 52 * mm)))
    return s


def electron_student(styles):
    s = [_disclaimer(styles), Paragraph("Learning focus: shells, subshells, Aufbau, orbital boxes and ion configurations.", styles["obj"])]
    s.append(Paragraph("A  Retrieval", styles["h"]))
    s.append(question_block(styles, 1, "State the maximum number of electrons in the first, second and third shells for the first 20 elements as used in this course.", n=3))
    s.append(question_block(styles, 2, "How many electrons can an s subshell and a p subshell hold?", n=2))
    s.append(question_block(styles, 3, "What does the group number tell you about a Group 1 or Group 7 atom?", n=3))
    s.append(Paragraph("B  Knowledge", styles["h"]))
    s.append(question_block(styles, 4, "Write shell configurations for N, Mg, Cl and K.", n=5))
    s.append(question_block(styles, 5, "Write full subshell configurations for O, Al and Ca. Use superscripts, e.g. 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>4</sup>.", n=5))
    s.append(PageBreak())
    s.append(fig("orbital-boxes.png", 160 * mm, 55 * mm))
    s.append(question_block(styles, 6, "On the orbital-box idea above, draw boxes and arrows for nitrogen 2p<sup>3</sup> and oxygen 2p<sup>4</sup>. State Hund’s rule in one sentence.", n=6))
    s.append(Paragraph("C  Application", styles["h"]))
    s.append(question_block(styles, 7, "Write the configuration of O<sup>2−</sup>, Al<sup>3+</sup> and Cl<sup>−</sup> in both shell and subshell form.", n=5))
    s.append(question_block(styles, 8, "A student writes calcium as 2,8,10. Correct the configuration and explain the error.", n=5))
    s.append(question_block(styles, 9, "Explain, using electrons, why magnesium forms a 2+ ion.", n=5))
    s.append(PageBreak())
    s.append(Paragraph("D  Exam-style practice", styles["h"]))
    s.append(question_block(styles, 10, "Write the electron configuration of Mg<sup>2+</sup> and explain why the ion is stable. [3]", n=6))
    s.append(question_block(styles, 11, "Explain why oxygen typically forms a 2− ion. [3]", n=5))
    s.append(question_block(styles, 12, "Identify the block (s, p or d) for sodium, fluorine and iron, and justify one of them. [3]", n=5))
    s.append(Paragraph("E  Challenge", styles["h"]))
    s.append(question_block(styles, 13, "Write [Ne] shorthand configurations for phosphorus and for P<sup>3−</sup>. Explain the relationship between them.", n=6))
    return s


def bonding_student(styles, topic):
    s = [_disclaimer(styles)]
    if topic == "ionic":
        s.append(Paragraph("Learning focus: electron transfer, formulae, lattice and properties.", styles["obj"]))
        s.append(Paragraph("A  Retrieval", styles["h"]))
        s.append(question_block(styles, 1, "Define ionic bonding.", n=3))
        s.append(question_block(styles, 2, "Between which types of element does ionic bonding usually form?", n=2))
        s.append(question_block(styles, 3, "Why does solid sodium chloride not conduct electricity?", n=3))
        s.append(Paragraph("B  Knowledge", styles["h"]))
        s.append(fig("ion-transfer.png", 150 * mm, 50 * mm))
        s.append(question_block(styles, 4, "Using the diagram, describe in terms of electrons how NaCl forms.", n=5))
        s.append(question_block(styles, 5, "Explain why ionic compounds have high melting points.", n=4))
        s.append(PageBreak())
        s.append(question_block(styles, 6, "Why can molten or aqueous ionic compounds conduct electricity?", n=4))
        s.append(Paragraph("C  Application", styles["h"]))
        s.append(question_block(
            styles, 7,
            "Deduce formulae for the compounds of Na and O; Mg and Cl; Al and O. Show charge balance in the table.",
            "table_only",
            table=blank_table(["Ions", "Charge balance", "Formula", "Name"], 3, [40 * mm, 50 * mm, 40 * mm, 40 * mm]),
        ))
        s.append(question_block(styles, 8, "Explain why an ionic crystal is brittle.", n=4))
        s.append(question_block(styles, 9, "Compare the particles that carry charge in molten NaCl and in a copper wire.", n=4))
        s.append(PageBreak())
        s.append(Paragraph("D  Exam-style practice", styles["h"]))
        s.append(question_block(styles, 10, "Describe how ionic bonding arises in magnesium oxide. [4]", n=7))
        s.append(question_block(styles, 11, "Explain why sodium chloride has a high melting point but does not conduct as a solid. [4]", n=6))
        s.append(question_block(styles, 12, "Deduce the formula of the compound formed between Al<sup>3+</sup> and SO<sub>4</sub><sup>2−</sup>. [2]", "calc"))
        s.append(Paragraph("E  Challenge", styles["h"]))
        s.append(question_block(styles, 13, "Suggest why magnesium oxide has a higher melting point than sodium chloride, referring to charge and attraction.", n=6))
    elif topic == "covalent":
        s.append(Paragraph("Learning focus: shared pairs, simple molecular versus giant covalent structures.", styles["obj"]))
        s.append(Paragraph("A  Retrieval", styles["h"]))
        s.append(question_block(styles, 1, "Define a covalent bond.", n=3))
        s.append(question_block(styles, 2, "What is a lone pair?", n=2))
        s.append(question_block(styles, 3, "Give one simple-molecular and one giant-covalent example.", n=3))
        s.append(fig("covalent-pair.png", 140 * mm, 48 * mm))
        s.append(question_block(styles, 4, "Explain how a chlorine molecule is held together, referring to both nuclei.", n=5))
        s.append(PageBreak())
        s.append(Paragraph("B  Knowledge", styles["h"]))
        s.append(fig("diamond-graphite.png", 160 * mm, 52 * mm))
        s.append(question_block(styles, 5, "Describe the bonding and structure of diamond.", n=5))
        s.append(question_block(styles, 6, "Why does graphite conduct electricity when diamond does not?", n=5))
        s.append(Paragraph("C  Application", styles["h"]))
        s.append(question_block(
            styles, 7,
            "Complete the table for the number of shared pairs.",
            "table_only",
            table=blank_table(["Molecule", "F<sub>2</sub>", "O<sub>2</sub>", "N<sub>2</sub>", "CH<sub>4</sub>"], 1, [34 * mm] * 5),
        ))
        s.append(question_block(styles, 8, "Explain why water has a much lower boiling point than silicon dioxide.", n=5))
        s.append(PageBreak())
        s.append(question_block(styles, 9, "Why does boiling water not break O–H covalent bonds?", n=4))
        s.append(Paragraph("D  Exam-style practice", styles["h"]))
        s.append(question_block(styles, 10, "Describe how a covalent bond forms in a hydrogen molecule. [3]", n=5))
        s.append(question_block(styles, 11, "Explain why iodine melts far below diamond. [4]", n=6))
        s.append(question_block(styles, 12, "Explain why carbon dioxide does not conduct electricity. [2]", n=4))
        s.append(Paragraph("E  Challenge", styles["h"]))
        s.append(question_block(styles, 13, "Ammonia can accept a proton to form NH<sub>4</sub><sup>+</sup>. Explain this using a lone pair and a dative covalent bond.", n=6))
    else:
        s.append(Paragraph("Learning focus: delocalised electrons, properties and comparison with ionic solids.", styles["obj"]))
        s.append(Paragraph("A  Retrieval", styles["h"]))
        s.append(question_block(styles, 1, "Define metallic bonding.", n=3))
        s.append(question_block(styles, 2, "Which particles move when a metal conducts electricity?", n=2))
        s.append(question_block(styles, 3, "What is meant by malleable?", n=2))
        s.append(fig("metallic-lattice.png", 150 * mm, 50 * mm))
        s.append(question_block(styles, 4, "Describe the structure of a solid metal using the diagram.", n=5))
        s.append(PageBreak())
        s.append(question_block(styles, 5, "Explain why metals conduct heat well.", n=4))
        s.append(question_block(styles, 6, "Explain why metals can be drawn into wires.", n=5))
        s.append(Paragraph("C  Application", styles["h"]))
        s.append(question_block(styles, 7, "Why does solid magnesium conduct but solid magnesium oxide does not?", n=5))
        s.append(question_block(styles, 8, "Suggest why steel is harder than pure iron.", n=4))
        s.append(question_block(styles, 9, "Why are Group 1 metals softer than many transition metals?", n=4))
        s.append(PageBreak())
        s.append(Paragraph("D  Exam-style practice", styles["h"]))
        s.append(question_block(styles, 10, "Describe the bonding in solid magnesium. [3]", n=5))
        s.append(question_block(styles, 11, "Explain why metals are malleable but ionic crystals are brittle. [4]", n=6))
        s.append(question_block(styles, 12, "Explain why copper is used for electrical wiring. [2]", n=4))
        s.append(Paragraph("E  Challenge", styles["h"]))
        s.append(question_block(styles, 13, "Use ideas about charge and delocalised electrons to suggest why aluminium has a higher melting point than sodium.", n=6))
    return s


def cell_student(styles):
    s = [_disclaimer(styles), Paragraph("Learning focus: ultrastructure, membranes and structure–function relationships.", styles["obj"])]
    s.append(Paragraph("A  Retrieval", styles["h"]))
    s.append(question_block(styles, 1, "State the function of the nucleus, a mitochondrion and a ribosome.", n=4))
    s.append(question_block(styles, 2, "Name three structures found in plant cells but not in typical animal cells.", n=3))
    s.append(question_block(styles, 3, "What is meant by a selectively permeable membrane?", n=3))
    s.append(PageBreak())
    s.append(Paragraph("B  Labelling", styles["h"]))
    s.append(question_block(
        styles, 4,
        "On the animal-cell schematic, name the structures indicated by the numbered leader lines and state a function for each.",
        n=6,
        image=fig("animal-cell-blank.png", 155 * mm, 72 * mm),
    ))
    s.append(PageBreak())
    s.append(question_block(
        styles, 5,
        "Label the plant-cell extras indicated by the numbered lines: wall, membrane, vacuole, chloroplast and nucleus. State which layer is freely permeable.",
        n=5,
        image=fig("plant-cell-blank.png", 155 * mm, 70 * mm),
    ))
    s.append(fig("bilayer.png", 150 * mm, 48 * mm))
    s.append(question_block(styles, 6, "Describe the structure of the cell-surface membrane. Use the words phospholipid, hydrophobic, protein and fluid mosaic.", n=6))
    s.append(PageBreak())
    s.append(question_block(styles, 7, "Explain how cristae help mitochondria to transfer energy to ATP.", n=5))
    s.append(question_block(styles, 8, "Why do muscle cells contain many mitochondria?", n=3))
    s.append(question_block(styles, 9, "Root cells usually lack chloroplasts. Explain why this is not a problem for the plant.", n=4))
    s.append(Paragraph("D  Exam-style practice", styles["h"]))
    s.append(question_block(styles, 10, "Describe the functions of the nucleus and mitochondria in an animal cell. [4]", n=6))
    s.append(question_block(styles, 11, "Explain two ways a palisade cell is adapted for photosynthesis. [4]", n=6))
    s.append(PageBreak())
    s.append(question_block(styles, 12, "Distinguish between the cell wall and the cell membrane. [3]", n=5))
    s.append(Paragraph("E  Challenge", styles["h"]))
    s.append(fig("protein-pathway.png", 160 * mm, 42 * mm))
    s.append(question_block(styles, 13, "Secretory cells have extensive RER and Golgi bodies. Explain this combination in terms of protein trafficking.", n=7))
    return s


def prokaryote_student(styles):
    s = [_disclaimer(styles), Paragraph("Learning focus: comparison tables, plasmids and medical applications.", styles["obj"])]
    s.append(Paragraph("A  Retrieval", styles["h"]))
    s.append(question_block(styles, 1, "What is the defining difference between prokaryotic and eukaryotic cells?", n=3))
    s.append(question_block(styles, 2, "Name four structures of a typical bacterial cell.", n=3))
    s.append(question_block(styles, 3, "Are viruses prokaryotic, eukaryotic, or neither? Justify.", n=3))
    s.append(question_block(
        styles, 4,
        "Label the bacterial cell at the numbered leader lines: wall, membrane, DNA loop, plasmid, ribosomes and flagellum.",
        n=6,
        image=fig("prokaryote-cell-blank.png", 155 * mm, 58 * mm),
    ))
    s.append(PageBreak())
    s.append(Paragraph("B  Comparison table", styles["h"]))
    s.append(question_block(
        styles, 5,
        "Complete the comparison table.",
        "table_only",
        table=blank_table(["Feature", "Prokaryote", "Eukaryote"], 6, [50 * mm, 60 * mm, 60 * mm]),
        extra="Include nucleus, DNA form, organelles, ribosome type, typical size and wall chemistry.",
    ))
    s.append(question_block(styles, 6, "What is a plasmid, and why can it be medically important?", n=5))
    s.append(question_block(styles, 7, "Explain why some antibiotics can kill bacteria without killing human cells.", n=5))
    s.append(PageBreak())
    s.append(Paragraph("D  Exam-style practice", styles["h"]))
    s.append(question_block(styles, 8, "Give three differences between a bacterial cell and an animal cell. [3]", n=5))
    s.append(question_block(styles, 9, "Explain how plasmids can be medically important. [3]", n=5))
    s.append(question_block(styles, 10, "Explain why bacteria are described as prokaryotic. [2]", n=4))
    s.append(Paragraph("E  Challenge", styles["h"]))
    s.append(question_block(styles, 11, "Mitochondria and chloroplasts contain circular DNA and 70S ribosomes. Suggest how this observation is used in the endosymbiotic theory.", n=6))
    return s


def microscopy_student(styles):
    s = [_disclaimer(styles), Paragraph("Learning focus: magnification, resolution, conversions and instrument choice.", styles["obj"])]
    s.append(Paragraph("A  Retrieval", styles["h"]))
    s.append(question_block(styles, 1, "Write the magnification formula and define resolution.", n=4))
    s.append(question_block(styles, 2, "Convert 2.5 mm to µm and to nm.", "calc"))
    s.append(fig("mag-triangle.png", 130 * mm, 48 * mm))
    s.append(question_block(styles, 3, "How do you calculate total magnification of a light microscope?", n=3))
    s.append(PageBreak())
    s.append(Paragraph("C  Calculations — show every conversion", styles["h"]))
    s.append(question_block(styles, 4, "An image is 18 mm wide and magnification is ×600. Calculate actual size in µm.", "calc"))
    s.append(question_block(styles, 5, "A 7.5 µm cell is drawn 3.0 cm wide. Calculate magnification.", "calc"))
    s.append(question_block(styles, 6, "A 10 µm scale bar measures 40 mm on a photograph. Calculate magnification.", "calc"))
    s.append(PageBreak())
    s.append(Paragraph("D  Exam-style practice", styles["h"]))
    s.append(question_block(styles, 7, "Calculate the actual width of a cell if the image is 35 mm wide at ×500. Give the answer in µm. [2]", "calc"))
    s.append(question_block(styles, 8, "Compare the resolution of a light microscope and a TEM. [4]", n=6))
    s.append(question_block(styles, 9, "Give two reasons for choosing a light microscope rather than an electron microscope. [2]", n=4))
    s.append(Paragraph("E  Challenge", styles["h"]))
    s.append(question_block(styles, 10, "A student increases magnification from ×100 to ×1000 but cannot separate two close granules. Explain, using resolution.", n=6))
    return s


def waves_student(styles, progressive=True):
    s = [_disclaimer(styles)]
    if progressive:
        s.append(Paragraph("Learning focus: definitions, v = fλ, standard form and medium change.", styles["obj"]))
        s.append(Paragraph("A  Retrieval", styles["h"]))
        s.append(question_block(styles, 1, "Define amplitude, wavelength and frequency.", n=4))
        s.append(question_block(styles, 2, "Write the wave equation and give SI units for each quantity, including m s<sup>−1</sup>.", n=3))
        s.append(question_block(styles, 3, "How are period and frequency related?", n=2))
        s.append(question_block(
            styles, 4,
            "On the snapshot, mark A and λ. How is amplitude read from a displacement–distance graph?",
            n=4,
            image=fig("wave-snapshot-blank.png", 160 * mm, 52 * mm),
        ))
        s.append(PageBreak())
        s.append(Paragraph("C  Calculations", styles["h"]))
        s.append(Paragraph("Use the same method every time: write the equation, convert to SI units, substitute, then give the unit.", styles["note"]))
        s.append(blank_table(["Quantity", "As written", "SI value", "SI unit"], 3, [40 * mm, 45 * mm, 45 * mm, 40 * mm]))
        s.append(Paragraph("Use the blank rows to convert 200 MHz, 48 m / 0.16 s, and any other value before you substitute.", styles["note"]))
        s.append(question_block(styles, 5, "f = 4.0 Hz, λ = 0.80 m. Calculate v.", "calc"))
        s.append(question_block(styles, 6, "A radio wave has f = 200 MHz. Take c = 3.00 × 10<sup>8</sup> m s<sup>−1</sup>. Calculate λ. Show the MHz → Hz conversion.", "calc"))
        s.append(question_block(styles, 7, "A wave travels 48 m in 0.16 s. If λ = 2.0 m, calculate f.", "calc"))
        s.append(PageBreak())
        s.append(Paragraph("D  Exam-style practice", styles["h"]))
        s.append(question_block(styles, 8, "Define amplitude and wavelength. [2]", n=4))
        s.append(question_block(styles, 9, "A note of 510 Hz travels at 340 m s<sup>−1</sup>. Calculate λ. [2]", "calc"))
        s.append(question_block(styles, 10, "Explain why air particles do not travel from a loudspeaker to a listener. [3]", n=5))
        s.append(Paragraph("E  Challenge", styles["h"]))
        s.append(question_block(styles, 11, "A displacement–time trace has 5 complete cycles in 20 ms. The matching snapshot shows 4.0 cm between adjacent crests. Calculate f, T, λ and v. Show unit conversions.", "calc"))
        s.append(question_block(styles, 12, "Which quantity stays the same when a wave enters a new medium? Explain what happens to v and λ.", n=5))
    else:
        s.append(Paragraph("Learning focus: wave type, phase, superposition and polarisation.", styles["obj"]))
        s.append(Paragraph("A  Retrieval", styles["h"]))
        s.append(question_block(styles, 1, "Define a transverse wave and a longitudinal wave.", n=4))
        s.append(question_block(styles, 2, "Give one example of each.", n=2))
        s.append(question_block(styles, 3, "State the principle of superposition.", n=3))
        s.append(fig("long-vs-trans.png", 160 * mm, 55 * mm))
        s.append(question_block(styles, 4, "What is a compression and what is a rarefaction?", n=4))
        s.append(PageBreak())
        s.append(fig("phase-points.png", 155 * mm, 45 * mm))
        s.append(question_block(styles, 5, "When are two points on a wave in phase?", n=3))
        s.append(question_block(styles, 6, "Why can light be polarised but sound in air cannot?", n=5))
        s.append(question_block(styles, 7, "Classify ultrasound, microwaves and stadium sound as transverse or longitudinal.", n=3))
        s.append(question_block(styles, 8, "Two crests are 6.0 cm apart and λ = 2.0 cm. Are they in phase? Explain.", "calc"))
        s.append(PageBreak())
        s.append(Paragraph("D  Exam-style practice", styles["h"]))
        s.append(question_block(styles, 9, "Describe the difference between transverse and longitudinal waves, with an example of each. [4]", n=6))
        s.append(question_block(styles, 10, "State the principle of superposition. [2]", n=3))
        s.append(question_block(styles, 11, "Explain why sound from a loudspeaker cannot be polarised. [2]", n=4))
        s.append(Paragraph("E  Challenge", styles["h"]))
        s.append(question_block(styles, 12, "A student says a sine-wave drawing of sound proves sound is transverse. Write a correction a teacher could use.", n=6))
    return s


ANSWERS = {
    "atomic-structure": [
        ("A", [
            "1. Proton +1, mass 1. Neutron 0, mass 1. Electron −1, mass ≈ 1/1836.",
            "2. Z = number of protons. A = protons + neutrons.",
            "3. Same proton number / element; different neutron number / mass number.",
        ]),
        ("B", [
            "4. 19 p, 20 n, 19 e.",
            "5. Number of protons equals number of electrons, so charges cancel.",
        ]),
        ("C", [
            "6. Mg: 12p 12n 12e. Mg<sup>2+</sup>: 12p 12n 10e. F: 9p 10n 9e. F<sup>−</sup>: 9p 10n 10e.",
            "7. A<sub>r</sub> = (60×69 + 40×71)/100 = 69.8",
            "8. Chlorine is a mixture of <super>35</super>Cl and <super>37</super>Cl; A<sub>r</sub> is a weighted mean.",
        ]),
        ("D / E", [
            "9. Isotopes must have the same proton number. C has 6 protons; N has 7.",
            "10. (75×63 + 25×65)/100 = 63.5",
            "11. The atom gains two electrons. Proton number unchanged. Electrons exceed protons by 2, so charge is 2−. [3]",
            "12. A<sub>r</sub> = (75.0×35 + 25.0×37)/100 = 35.5. Not whole because chlorine is a mixture of isotopes.",
            "13. A = 23 top left, Z = 11 bottom left, 11 p, 12 n. Na<sup>+</sup> has 10 electrons.",
        ]),
    ],
    "electron-configuration": [
        ("A–E", [
            "1. 2, 8 and 8.",
            "2. s: 2. p: 6.",
            "3. Group 1: one outer electron. Group 7: seven outer electrons.",
            "4. N 2,5; Mg 2,8,2; Cl 2,8,7; K 2,8,8,1.",
            "5. O 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>4</sup>; Al 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>1</sup>; Ca 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>6</sup> 4s<sup>2</sup>.",
            "6. Hund: one electron in each equal-energy orbital before pairing. N 2p<sup>3</sup> three single arrows; O 2p<sup>4</sup> one pair plus two singles.",
            "7. O<sup>2−</sup> 2,8 / 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup>; Al<sup>3+</sup> 2,8 / 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup>; Cl<sup>−</sup> 2,8,8 / 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>6</sup>.",
            "8. Calcium is 2,8,8,2. After 2,8,8 the next two electrons occupy the fourth shell / 4s, not a 10-electron third shell.",
            "9. Mg is 2,8,2. Losing two electrons leaves 2,8, a full outer shell.",
            "10. Mg<sup>2+</sup> is 2,8 or 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup>. Full outer-shell / noble-gas arrangement is stable. [3]",
            "11. Oxygen is 2,6. Gaining two electrons gives 2,8. [3]",
            "12. Na s-block; F p-block; Fe d-block, with one justification. [3]",
            "13. P is [Ne] 3s<sup>2</sup> 3p<sup>3</sup>. P<sup>3−</sup> is [Ne] 3s<sup>2</sup> 3p<sup>6</sup>. The ion has gained three electrons to fill 3p.",
        ]),
    ],
    "ionic-bonding": [
        ("A–E", [
            "1. Electrostatic attraction between oppositely charged ions.",
            "2. A metal and a non-metal.",
            "3. Ions are not free to move.",
            "4. Na loses 1 e<sup>−</sup> → Na<sup>+</sup>. Cl gains that electron → Cl<sup>−</sup>. Oppositely charged ions attract.",
            "5. Strong attractions throughout a giant lattice need a lot of energy to overcome.",
            "6. Ions become free to move and carry charge.",
            "7. Na<sub>2</sub>O; MgCl<sub>2</sub>; Al<sub>2</sub>O<sub>3</sub>.",
            "8. A shift lines up like charges, which repel, so the crystal splits.",
            "9. Molten NaCl: mobile ions. Copper: delocalised electrons.",
            "10. Mg loses 2e<sup>−</sup> → Mg<sup>2+</sup>. O gains 2e<sup>−</sup> → O<sup>2−</sup>. Electrostatic attraction. Giant lattice. [4]",
            "11. Strong ionic attractions → high m.p. Solid ions fixed → no conduction. [4]",
            "12. Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> so +6 balances −6. [2]",
            "13. Mg<sup>2+</sup> and O<sup>2−</sup> have higher charges than Na<sup>+</sup> and Cl<sup>−</sup>, so attraction is stronger.",
        ]),
    ],
    "covalent-bonding": [
        ("A–E", [
            "1. A shared pair of electrons attracted to both nuclei.",
            "2. An outer-shell pair not used in bonding.",
            "3. e.g. H<sub>2</sub>O or CO<sub>2</sub>; diamond, graphite or SiO<sub>2</sub>.",
            "4. Each Cl shares one electron; the shared pair is attracted to both nuclei.",
            "5. Each C bonded to four others in a tetrahedral giant covalent network.",
            "6. Graphite has delocalised electrons between layers; diamond’s electrons are all in C–C bonds.",
            "7. 1, 2, 3 and 4 shared pairs.",
            "8. Water is simple molecular (weak intermolecular forces). SiO<sub>2</sub> is giant covalent.",
            "9. Boiling overcomes intermolecular forces; covalent bonds inside molecules remain.",
            "10. Each H has 1 electron. They share a pair. Both then have a full first shell. [3]",
            "11. Iodine is simple molecular — weak forces between I<sub>2</sub>. Diamond is giant covalent. [4]",
            "12. No mobile ions or delocalised electrons. [2]",
            "13. Nitrogen donates its lone pair to H<sup>+</sup> (dative bond). All four N–H bonds in NH<sub>4</sub><sup>+</sup> are then equivalent.",
        ]),
    ],
    "metallic-bonding": [
        ("A–E", [
            "1. Attraction between positive metal ions and delocalised electrons.",
            "2. Delocalised electrons.",
            "3. Can be hammered into sheets without breaking.",
            "4. Lattice of positive ions surrounded by a sea of delocalised electrons.",
            "5. Electrons transfer kinetic energy rapidly through the lattice.",
            "6. Layers of ions slide; electrons still hold the structure together.",
            "7. Mg has mobile electrons; MgO ions are fixed in the solid lattice.",
            "8. Different-sized atoms in the alloy hinder layers sliding.",
            "9. Only one delocalised electron per atom / 1+ ions → weaker metallic bonding.",
            "10. Mg<sup>2+</sup> lattice; delocalised electrons; electrostatic attraction is metallic bonding. [3]",
            "11. Metal layers slide and electrons still attract ions. Ionic lattice: sliding lines up like charges. [4]",
            "12. Delocalised electrons make it a good conductor; it is also ductile. [2]",
            "13. Al forms 3+ ions and contributes more delocalised electrons than Na (1+), so metallic attraction is stronger.",
        ]),
    ],
    "cell-structure": [
        ("A–E", [
            "1. Nucleus: DNA / control of protein synthesis. Mitochondrion: aerobic respiration / ATP. Ribosome: protein synthesis.",
            "2. Cell wall, chloroplasts, permanent vacuole.",
            "3. Allows some substances to cross and restricts others.",
            "4. Animal-cell labels: cell-surface membrane, cytoplasm, nucleus / nucleolus, mitochondrion, RER + ribosomes, lysosome / vesicle. Award 1 mark per correct structure–function pair, up to 6.",
            "5. Plant extras: cellulose wall (freely permeable), membrane (selectively permeable), permanent vacuole, chloroplast (grana), nucleus.",
            "6. Phospholipid bilayer with proteins (and cholesterol / glycoproteins in animal cells); fluid mosaic.",
            "7. Folds increase surface area for respiratory enzymes / electron-transport proteins.",
            "8. High ATP demand for contraction.",
            "9. Photosynthesis occurs in green shoots and leaves; roots absorb water and minerals.",
            "10. Nucleus contains DNA and controls protein synthesis. Mitochondria carry out aerobic respiration / produce ATP. [4]",
            "11. Many chloroplasts; position near the upper leaf; vacuole maintains turgidity; elongated shape. Any two explained. [4]",
            "12. Wall: cellulose, freely permeable, support. Membrane: bilayer, selectively permeable. [3]",
            "13. RER synthesises and processes proteins. Golgi modifies and packages them into vesicles for secretion.",
        ]),
    ],
    "prokaryotic-and-eukaryotic-cells": [
        ("A–E", [
            "1. Eukaryotes have a nucleus / membrane-bound organelles; prokaryotes do not.",
            "2. Cell wall, membrane, loop of DNA, ribosomes; also plasmid / flagellum / capsule.",
            "3. Neither — they are acellular / not cells.",
            "4. Accept correct labels from the schematic.",
            "5. Nucleus absent/present; circular vs linear DNA; no/yes membrane-bound organelles; 70S vs 80S; 1–5 µm vs 10–100 µm; peptidoglycan vs cellulose/chitin/none.",
            "6. Small extra DNA circle; may carry resistance genes or be used as a vector.",
            "7. Antibiotics can target peptidoglycan walls or 70S ribosomes, which human cells lack or have in a different form.",
            "8. Three paired differences. [3]",
            "9. Carry resistance genes; transferable; used as vectors. [3]",
            "10. No nucleus / DNA not enclosed by a nuclear envelope / no membrane-bound organelles. [2]",
            "11. These features resemble free-living bacteria, supporting an engulfed-prokaryote origin.",
        ]),
    ],
    "microscopy": [
        ("A–E", [
            "1. M = image size / actual size. Resolution: smallest distance at which two points can still be seen as separate.",
            "2. 2500 µm; 2.5 × 10<sup>6</sup> nm.",
            "3. Eyepiece magnification × objective magnification.",
            "4. 18 mm = 18 000 µm; actual = 18 000/600 = 30 µm.",
            "5. 3.0 cm = 30 000 µm; M = 30 000/7.5 = ×4000.",
            "6. 40 mm = 40 000 µm; M = 40 000/10 = ×4000.",
            "7. 35 mm = 35 000 µm; actual = 70 µm. [2]",
            "8. Light about 0.2 µm; TEM much smaller (about 0.1 nm) because electrons have a shorter wavelength. [4]",
            "9. Living specimens / colour / cheaper / easier preparation. [2]",
            "10. The granules are closer together than the resolution. Extra magnification enlarges the blur (empty magnification).",
        ]),
    ],
    "progressive-waves": [
        ("A–E", [
            "1. A: max displacement from equilibrium. λ: shortest distance between points in phase. f: oscillations per second.",
            "2. v = fλ; m s<sup>−1</sup>, Hz, m.",
            "3. T = 1/f.",
            "4. Vertical distance from the equilibrium line to a crest (not crest-to-trough).",
            "5. 3.2 m s<sup>−1</sup>. Full working in the table.",
            "6. Convert 200 MHz to 2.00 × 10<sup>8</sup> Hz first. λ = 1.50 m.",
            "7. v = 300 m s<sup>−1</sup>; f = 150 Hz.",
            "8. See retrieval definitions. [2]",
            "9. λ = 340/510 = 0.667 m (3 s.f.). [2]",
            "10. Particles oscillate about equilibrium; energy is passed along; no net movement of air. [3]",
            "11. T = 20 ms / 5 = 4.0 ms; f = 250 Hz; λ = 0.040 m; v = 10 m s<sup>−1</sup>.",
            "12. Frequency stays the same. Speed and wavelength change (both increase or both decrease together).",
        ]),
    ],
    "wave-properties": [
        ("A–E", [
            "1. Transverse: oscillation perpendicular to energy transfer. Longitudinal: parallel.",
            "2. Light / water / string; sound / P-waves / slinky compressions.",
            "3. Resultant displacement is the sum of individual displacements.",
            "4. Compression: particles closer / higher pressure. Rarefaction: more spaced / lower pressure.",
            "5. They reach maxima and minima together / separated by nλ.",
            "6. Light is transverse so oscillations have a direction that can be filtered; sound is longitudinal.",
            "7. Ultrasound longitudinal; microwaves transverse; stadium sound longitudinal.",
            "8. Yes — separation is 3λ, a whole number of wavelengths.",
            "9. See definitions plus one valid example of each. [4]",
            "10. Resultant displacement = sum of individual displacements. [2]",
            "11. Polarisation needs a transverse direction; sound is longitudinal. [2]",
            "12. The sine curve is a graph of pressure or displacement. The air particles still oscillate parallel to the direction of travel.",
        ]),
    ],
}

STUDENT_BUILDERS = {
    "atomic-structure": ("Atomic Structure", "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet", atomic_student),
    "electron-configuration": ("Electron Configuration", "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet", electron_student),
    "ionic-bonding": ("Ionic Bonding", "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet", lambda st: bonding_student(st, "ionic")),
    "covalent-bonding": ("Covalent Bonding", "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet", lambda st: bonding_student(st, "covalent")),
    "metallic-bonding": ("Metallic Bonding", "BTEC Level 3 Applied Science  ·  Unit 1 Chemistry  ·  Worksheet", lambda st: bonding_student(st, "metallic")),
    "cell-structure": ("Cell Structure", "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet", cell_student),
    "prokaryotic-and-eukaryotic-cells": ("Prokaryotic and Eukaryotic Cells", "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet", prokaryote_student),
    "microscopy": ("Microscopy", "BTEC Level 3 Applied Science  ·  Unit 1 Biology  ·  Worksheet", microscopy_student),
    "progressive-waves": ("Progressive Waves", "BTEC Level 3 Applied Science  ·  Unit 1 Physics  ·  Worksheet", lambda st: waves_student(st, True)),
    "wave-properties": ("Wave Properties", "BTEC Level 3 Applied Science  ·  Unit 1 Physics  ·  Worksheet", lambda st: waves_student(st, False)),
}


CALC_ANSWERS = {
    ("atomic-structure", "7"): (
        "A<sub>r</sub> = (Σ percent × mass number) / 100",
        "A<sub>r</sub> = (60.0 × 69 + 40.0 × 71) / 100",
        "(4140 + 2840) / 100 = 6980 / 100",
        "69.8   (no unit)",
        "1 mark substitution with both isotopes; 1 mark 69.8.",
    ),
    ("atomic-structure", "10"): (
        "A<sub>r</sub> = (Σ percent × mass number) / 100",
        "A<sub>r</sub> = (75 × 63 + 25 × 65) / 100",
        "(4725 + 1625) / 100 = 6350 / 100",
        "63.5   (no unit)",
        "1 mark substitution; 1 mark 63.5.",
    ),
    ("atomic-structure", "12"): (
        "A<sub>r</sub> = (Σ percent × mass number) / 100",
        "A<sub>r</sub> = (75.0 × 35 + 25.0 × 37) / 100",
        "(2625 + 925) / 100 = 3550 / 100",
        "35.5 (3 s.f., no unit)",
        "1 mark substitution; 1 mark 35.5; 1 mark mixture of isotopes so A<sub>r</sub> is not an integer.",
    ),
    ("microscopy", "2"): (
        "1 mm = 1000 µm = 1 000 000 nm",
        "2.5 mm × 1000",
        "2500 µm;  2.5 × 10<sup>6</sup> nm",
        "2500 µm   and   2.5 × 10<sup>6</sup> nm",
        "1 mark each conversion.",
    ),
    ("microscopy", "4"): (
        "A = I / M",
        "I = 18 mm = 18 000 µm;  M = 600",
        "A = 18 000 / 600",
        "30 µm",
        "1 mark conversion; 1 mark 30 µm.",
    ),
    ("microscopy", "5"): (
        "M = I / A",
        "I = 3.0 cm = 30 000 µm;  A = 7.5 µm",
        "M = 30 000 / 7.5",
        "×4000",
        "1 mark conversion; 1 mark ×4000.",
    ),
    ("microscopy", "6"): (
        "M = I / A",
        "I = 40 mm = 40 000 µm;  A = 10 µm",
        "M = 40 000 / 10",
        "×4000",
        "1 mark conversion; 1 mark ×4000.",
    ),
    ("microscopy", "7"): (
        "A = I / M",
        "I = 35 mm = 35 000 µm;  M = 500",
        "A = 35 000 / 500",
        "70 µm",
        "1 mark conversion; 1 mark 70 µm.",
    ),
    ("progressive-waves", "5"): (
        "v = fλ",
        "v = 4.0 Hz × 0.80 m",
        "v = 3.2",
        "3.2 m s<sup>−1</sup>",
        "1 mark substitution; 1 mark answer + unit.",
    ),
    ("progressive-waves", "6"): (
        "λ = v / f",
        "f = 200 MHz = 2.00 × 10<sup>8</sup> Hz;  v = 3.00 × 10<sup>8</sup> m s<sup>−1</sup>",
        "λ = (3.00 × 10<sup>8</sup>) / (2.00 × 10<sup>8</sup>)",
        "1.50 m",
        "1 mark MHz → Hz; 1 mark 1.50 m.",
    ),
    ("progressive-waves", "7"): (
        "v = s / t    then    f = v / λ",
        "v = 48 / 0.16 = 300 m s<sup>−1</sup>;  λ = 2.0 m",
        "f = 300 / 2.0",
        "150 Hz",
        "1 mark speed; 1 mark 150 Hz.",
    ),
    ("progressive-waves", "9"): (
        "λ = v / f",
        "λ = 340 / 510",
        "λ = 0.666…",
        "0.667 m (3 s.f.)",
        "1 mark substitution; 1 mark 0.667 m.",
    ),
    ("progressive-waves", "11"): (
        "T = total time / cycles;   f = 1/T;   v = fλ",
        "T = 20 ms / 5 = 4.0 ms = 4.0 × 10<sup>−3</sup> s;  λ = 4.0 cm = 0.040 m",
        "f = 1 / 0.0040 = 250 Hz;  v = 250 × 0.040",
        "f = 250 Hz;  T = 4.0 × 10<sup>−3</sup> s;  λ = 0.040 m;  v = 10 m s<sup>−1</sup>",
        "1 mark each correctly converted quantity, up to 4.",
    ),
}


def calc_answer_table(eq, sub, work, ans):
    lab = _cell_style(TEAL_DARK, True, 10)
    lab.alignment = 0
    body = _cell_style(INK, False, 10)
    body.alignment = 0
    data = [
        [Paragraph("Equation", lab), Paragraph(eq, body)],
        [Paragraph("Substitution", lab), Paragraph(sub, body)],
        [Paragraph("Working", lab), Paragraph(work, body)],
        [Paragraph("Answer + unit", lab), Paragraph(ans, body)],
    ]
    t = Table(data, colWidths=[38 * mm, 132 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), CREAM),
        ("BACKGROUND", (0, 3), (-1, 3), HexColor("#ECFDF5")),
        ("GRID", (0, 0), (-1, -1), 0.5, TEAL),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


ANSWER_FIGURES = {
    "atomic-structure": [("13", "sodium-nuclide.png", 110 * mm, 42 * mm)],
    "electron-configuration": [("6", "orbital-boxes.png", 140 * mm, 42 * mm)],
    "cell-structure": [("4", "animal-cell.png", 145 * mm, 58 * mm), ("5", "plant-cell.png", 145 * mm, 56 * mm)],
    "prokaryotic-and-eukaryotic-cells": [("4", "prokaryote-cell.png", 140 * mm, 42 * mm)],
    "progressive-waves": [("4", "wave-snapshot.png", 145 * mm, 42 * mm)],
    "wave-properties": [("4", "long-vs-trans.png", 145 * mm, 46 * mm)],
}


def answers_flow(styles, slug):
    s = [_disclaimer(styles, answers=True)]
    s.append(Paragraph("Numbering matches the student worksheet exactly. Award equivalent scientifically correct wording. Show units on every calculated quantity.", styles["note"]))
    for heading, items in ANSWERS[slug]:
        s.append(Paragraph(heading, styles["h"]))
        for item in items:
            num = item.split(".", 1)[0].split("–")[0].strip()
            bits = [Paragraph(item, styles["ans"])]
            calc = CALC_ANSWERS.get((slug, num))
            if calc:
                eq, sub, work, ans, guide = calc
                bits.append(Spacer(1, 1 * mm))
                bits.append(calc_answer_table(eq, sub, work, ans))
                bits.append(Paragraph(f"<i>Marking guidance: {guide}</i>", styles["note"]))
            for fig_num, name, w, h in ANSWER_FIGURES.get(slug, []):
                if fig_num == num or (num.startswith(fig_num)):
                    bits.append(Spacer(1, 2 * mm))
                    bits.append(fig(name, w, h))
            bits.append(Spacer(1, 3 * mm))
            s.append(KeepTogether(bits))
    return s


def build_all(out_root: Path):
    styles = _styles()
    written = []
    for slug, (title, kicker, builder) in STUDENT_BUILDERS.items():
        folder = out_root / slug
        qpath = folder / f"btec-unit-1-{slug}-worksheet.pdf"
        apath = folder / f"btec-unit-1-{slug}-answers.pdf"
        build_doc(qpath, title, kicker, "Worksheet", builder(styles))
        build_doc(apath, f"{title} — Answers", kicker.replace("Worksheet", "Answer sheet"), "Answer sheet", answers_flow(styles, slug))
        written.append((title, qpath, apath))
    return written


def build_shop_packs(out_root: Path):
    """Zip each student worksheet with its answer sheet for the paid shop download."""
    written = []
    for slug in STUDENT_BUILDERS:
        folder = out_root / slug
        qpath = folder / f"btec-unit-1-{slug}-worksheet.pdf"
        apath = folder / f"btec-unit-1-{slug}-answers.pdf"
        zpath = folder / f"btec-unit-1-{slug}-worksheet-pack.zip"
        if not qpath.exists() or not apath.exists():
            raise FileNotFoundError(f"Missing worksheet files for {slug}")
        with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.write(qpath, qpath.name)
            archive.write(apath, apath.name)
        written.append(zpath)
    return written
