# Testing report

**Date:** 31 October 2026 (Europe/London)  
**Environment:** Ubuntu 24.04 cloud workspace. `python-pptx 1.0.2`, LibreOffice Impress 24.2.7. **Desktop Microsoft PowerPoint was not installed.**

Do not treat this as a full classroom Slide Show test. Buttons must still be clicked in Microsoft PowerPoint (F5) before a lesson.

## 1. What was tested

| Check | Method | Result |
|---|---|---|
| Files open as OOXML presentations | Zip + `[Content_Types].xml` | Pass – four `.pptx`, no `.pptm` |
| No VBA | No `vbaProject.bin`; content types have no VBA | Pass |
| No Flash / SWF | No `.swf` in the packages | Pass |
| No OLE / ActiveX / embeddings | `ppt/embeddings/` absent | Pass |
| Hyperlinks resolve | Every `a:hlinkClick` has a relationship to a slide | Pass – 0 broken (Part 1: 134, Part 2: 216, Part 3: 115, Part 4: 157) |
| Hidden slides | `p:sld show="0"` | Pass – 34 / 55 / 38 / 34 hidden |
| Visible order | LibreOffice PDF export skips hidden slides | Pass – 19 / 29 / 14 / 16 visible pages |
| Layout of visible slides | PDF → PNG review of teaching and activity screens | Pass with notes below |
| Teacher notes present | `ppt/notesSlides/` | Pass – 15 / 25 / 11 / 13 notes slides |
| Rebuild is deterministic | `python3 src/build_all.py` | Pass |

## 2. Visual review (LibreOffice PDF of **visible** slides)

LibreOffice exports hidden slides as omitted pages, which matches slideshow Space-bar behaviour.

**Part 1.** Title, contents, organisation tree (complete), neurone labels, three neurone types, matching, MCQ, case study all render. After moving reveal buttons off the tree, the CNS/PNS/autonomic diagram is unobstructed.

**Part 2.** Resting-charge diagram, Na⁺/K⁺ pump schematic, ion table, AP graph with stages 1–5, all-or-nothing graph all render. Unicode subscripts in “Naᵥ” survive in the PNG assets; LibreOffice PDF flattened one subscript — PowerPoint uses the PNG, so the show should be fine.

**Part 3.** Skin block, Pacinian lamellae, retina click-labels, rod/cone teaching slides, rods-vs-cones sort all render.

**Part 4.** Eight-step synapse diagrams, shuffled sequence (original eight statements), numbered labelling diagram with leader lines all render.

## 3. What has **not** been tested

The following need a **Microsoft PowerPoint slide show** (desktop, recommended):

1. Clicking every button in Slide Show mode (hyperlinks do not jump in Normal view).
2. Reset returning to the first screen of an activity and being reusable in one lesson.
3. Hidden feedback slides opening from Correct / Try again / Check.
4. Sequential ▶ / ◀ arrows on every visible slide.
5. Colour/contrast on a projector.
6. PowerPoint for Microsoft 365 web, Google Slides import, or Keynote (hyperlinks usually survive; hidden-slide behaviour may differ).

LibreOffice Impress can open the files but is not a substitute for that click-through.

## 4. Known limitations (by design)

- Matching, sequencing and T/F are **click-to-check**, not Flash drag-and-drop.
- The Dr Kevin Talbot Flash interview and photograph could not be recovered and are not reproduced.
- Boardworks logos and original photographs are not included.
- Generator-potential wording for rods follows the 2009 Boardworks text (opsin changing Na⁺ permeability). Modern physiology describes light-induced hyperpolarisation of rods; this is flagged in the Part 3 notes.

## 5. File sizes (after rebuild)

| File | Size | Slides (visible / total) |
|---|---|---|
| `01_Organisation_of_the_Nervous_System.pptx` | ~437 KB | 19 / 53 |
| `02_The_Nerve_Impulse.pptx` | ~924 KB | 29 / 84 |
| `03_Sensory_Receptors.pptx` | ~382 KB | 14 / 52 |
| `04_The_Synapse.pptx` | ~689 KB | 16 / 50 |
