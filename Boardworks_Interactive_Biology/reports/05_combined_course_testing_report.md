# Combined course testing report

**Date:** 31 October 2026 (Europe/London)  
**File:** `JD_Science_Complete_Interactive_Nervous_System_Course.pptx`  
**Environment:** Ubuntu 24.04 cloud workspace. `python-pptx 1.0.2`, LibreOffice Impress 24.2.7. **Desktop Microsoft PowerPoint was not installed.**

The four standalone presentations were **not** modified or rebuilt. MD5 checksums after the combined build:

| File | MD5 |
|---|---|
| `01_Organisation_of_the_Nervous_System.pptx` | `03b62d94bfa8553ed5bdc4ed2becd179` |
| `02_The_Nerve_Impulse.pptx` | `0bd09a2dace736c3e952bfff2b5acc1d` |
| `03_Sensory_Receptors.pptx` | `39394e7432ee95bb1aa2ca5195aeb97c` |
| `04_The_Synapse.pptx` | `67e9f2f7444be3713d93a19b46706cfe` |

The master file is **not** a zip-level concatenation. Each module is rebuilt onto one `Deck` with prefixes `p1_`…`p4_`, so every named hyperlink is remapped to the combined slide list. A course menu is slide 1. Home on every later slide targets that menu.

Do not treat this as a full classroom Slide Show test. Buttons must still be clicked in Microsoft PowerPoint (**F5**) before a lesson.

## 1. Structural checks (OOXML)

| Check | Method | Result |
|---|---|---|
| Opens as macro-free OOXML | Zip + `[Content_Types].xml`; no `.pptm` | Pass – 1 combined `.pptx` |
| No VBA | No `vbaProject.bin` | Pass |
| No Flash / SWF | No `.swf` in the package | Pass (the word “Flash” appears only in how-to / title wording) |
| No OLE / ActiveX / embeddings | `ppt/embeddings/` absent | Pass |
| Hyperlinks resolve | Every `a:hlinkClick` has a relationship to a slide in this file | Pass – **877 hyperlinks, 0 broken** |
| Hidden slides | `p:sld show="0"` | Pass – **161 hidden**, **79 visible**, **240 total** |
| Hidden orphans | Hidden slide with no inbound hyperlink | Pass – **0** |
| Visible order vs PDF | LibreOffice PDF export skips hidden slides | Pass – **79 PDF pages** = 79 visible slides |
| Home on every non-menu slide | Shape labelled Home → slide 1 | Pass – **239 Home buttons**, 0 wrong targets, 0 missing |
| Sequential ▶ / ◀ | Visible-only chain | Pass – 78 next, 78 previous, **0 chain breaks** |
| Reset | Reset never targets a hidden slide | Pass |
| Check / Show all / Show answers | Answer keys are hidden, except organisation-tree “Show all” | Pass – tree “Show all” jumps to the last **visible** tree level (by design) |
| Try again / Back / Continue | 258 return-from-hidden buttons; 0 dangling | Pass – cloze and synapse-label “Try again” return to the **specific question** (those question slides are themselves hidden, which is intended) |
| Teacher notes | `ppt/notesSlides/` | Pass – 65 notes slides |
| Four originals unchanged | MD5 before and after combined build | Pass |

### Menu and section joins (labelled hyperlinks)

| Control | Target |
|---|---|
| Menu “Part 1 · Organisation of the nervous system” | Slide 2 – Part 1 title |
| Menu “Part 2 · The nerve impulse” | Slide 55 – Part 2 title |
| Menu “Part 3 · Sensory receptors” | Slide 139 – Part 3 title |
| Menu “Part 4 · The synapse” | Slide 191 – Part 4 title |
| Menu ▶ | Part 1 title (start of teaching sequence) |
| End of Part 1 ▶ and “Next: The nerve impulse” | Part 2 title |
| End of Part 2 ▶ and “Next: Sensory receptors” | Part 3 title |
| End of Part 3 ▶ and “Next: The synapse” | Part 4 title |
| End of Part 4 “Course menu” and Home | Course menu (slide 1) |
| Each “Back to contents” | That module’s Contents slide (not another module) |

Visible teaching order: menu → Part 1 (pages 2–20) → Part 2 (21–49) → Part 3 (50–63) → Part 4 (64–79). Explanations, diagrams, activities and questions inside each module keep their original order.

### Interactive “animations”

There are **no** `p:timing` click-reveal timelines in the combined package (the helper exists in `pptx_kit.py` but the four lessons use hyperlink steppers instead). Resting-potential, action-potential, saltatory, Pacinian and synapse sequences are successive slides with **Next step / Previous / Reset**, as in the four separate files. That behaviour is preserved after the merge.

## 2. Visual review (LibreOffice PDF of **visible** slides)

LibreOffice exports hidden slides as omitted pages, which matches slideshow Space-bar behaviour.

- Course menu: four module buttons, retina diagram, F5 instruction.
- Part title slides: Home at top-left; sequential arrows; original part banners.
- Chrome slides: Home in the header (left of the A2 Biology badge) so it is not covered by activity bars or info boxes.
- End-of-part slides: “Back to contents” stacked above “Next: …” / “Course menu” (no overlap).
- Organisation tree, neurone labels, Part 2 contents, Part 3/4 joins: teaching artwork intact.

## 3. What has **not** been tested (needs desktop PowerPoint)

The following cannot be confirmed without **Microsoft PowerPoint Slide Show (F5)** on a teacher machine:

1. Clicking every button in Slide Show mode (hyperlinks do not jump in Normal view, and LibreOffice is not a substitute).
2. Reset being reusable in one live lesson after the class has already stepped through an activity.
3. Hidden feedback slides opening from Correct / Try again / Check, then returning to the question, *as a live click-through*.
4. Colour/contrast on a classroom projector.
5. PowerPoint for Microsoft 365 web, Google Slides import, or Keynote (hyperlinks usually survive; hidden-slide behaviour may differ).
6. Whether a click-reveal `p:timing` animation would run — none are present; steppers are slide jumps.

## 4. Known limitations (unchanged from the four-file rebuild)

- Matching, sequencing and T/F are **click-to-check**, not Flash drag-and-drop.
- The Dr Kevin Talbot Flash interview and photograph could not be recovered and are not reproduced.
- Boardworks logos and original photographs are not included.
- Generator-potential wording for rods follows the 2009 Boardworks text; this is flagged in the Part 3 notes.

## 5. File

| File | Size | Slides (visible / total) |
|---|---|---|
| `JD_Science_Complete_Interactive_Nervous_System_Course.pptx` | ~2.3 MB | 79 / 240 |
