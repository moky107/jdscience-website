# Diagnostic report – Boardworks A2 Biology: The Nervous System

**Date:** 31 October 2026 (Europe/London)  
**Input examined:** flattened PDF export only  
`Boardworks_Nervous_System_Complete_Course_880d.pdf` (33 pages, 720 × 540 pt, PDF 1.7).  
**Original PowerPoint files:** not present in the workspace. They were not executed.

No VBA, ActiveX, OLE or SWF objects were run. The PDF was opened read-only with PyMuPDF; embedded raster chrome (Boardworks UI, Flash “f” badge, toolbars) was inspected visually. No macros were executed.

## 1. What the export shows

Four concatenated presentations, all branded **FLASH ENABLED** on the title slide:

| Part | Original slides | Pages in PDF |
|---|---|---|
| 1 Organisation | 7 | 1–7 |
| 2 The nerve impulse | 14 | 8–21 |
| 3 Sensory receptors | 7 | 22–28 |
| 4 The synapse | 5 | 29–33 |

Slide size is classic 4:3 (10 × 7.5 in). Footer: © Boardworks Ltd 2009.

## 2. Technology of the original activities

Every interactive slide shows the Boardworks Flash activity chrome:

- bin / highlighter / scribble / pen
- orange **Reset** and **Help**
- **S** / **C** (show / check) on quizzes
- play / step / rewind on animations
- **FLASH ENABLED** badge on titles
- drop-down triangles on cloze and labelling

**Conclusion:** the broken interactivity is **Adobe Flash (SWF)**, not VBA. There is no evidence in the export of macros, ActiveX controls or OLE packages. Native PowerPoint animations/triggers were not used for the activities — the movies sat on the slide as Flash objects. Those objects flattened to a **single still frame** (usually the start state).

SWF files cannot be recovered from this PDF. A real `.ppt` would typically store `oleObject*.bin` / `.swf` in `ppt/embeddings/`. Those containers were not supplied.

## 3. Slide-by-slide recoverability

### Part 1 – Organisation

| Original slide | Type | Recoverable? | Rebuild |
|---|---|---|---|
| Title | Static + Flash chrome | Layout yes; logo/artwork not copied | New title + original 2D retina-style diagram |
| The human nervous system | Static text + photo | **Text yes.** Neurone micrograph is copyrighted photography — not reused | Text retained; original diagram substituted |
| How is the nervous system organized? | Flash click-to-reveal tree | **Start frame only** (one red button). Tree content not in the export | Click-to-reveal CNS/PNS/somatic/autonomic/sympathetic/parasympathetic |
| General structure of a neurone | Flash click-labels | Labels visible; pop-up text not in the export | Click-label + function cards |
| Types of neurone | Static diagrams | **Yes** – sensory / relay / motor drawings and labels | Rebuilt 2D diagrams + info cards |
| Neurone structure | Flash matching | Terms + shuffled definitions visible | Matching with Check / Reset |
| Scientist case study | Flash drop-down interview | Title, name (Dr Kevin Talbot, Oxford), photo. Interview audio/text **not recoverable** | New Q&A on clinical neurology. Photograph **not copied** |

### Part 2 – The nerve impulse

| Original slide | Type | Recoverable? | Rebuild |
|---|---|---|---|
| Title | Static | Layout | New title |
| What is a nerve impulse? | Static | **Text and electrode diagram yes** | Wording retained; diagram rebuilt |
| Resting state | Flash animation (play bar) | Start frame of charge diagram + caption | 4-step ion / pump animation |
| Understanding resting potential | Flash cloze (drop-downs) | Sentence stems; options **not visible** | Option-button cloze |
| Action potential | Flash play animation | Start frame of motor neurone | 4-step Na⁺/K⁺ channel sequence |
| Ion channels table | Flash open/closed table | Empty grid + “open/closed” chips | Click-to-reveal table + answer key |
| Changes during an AP | Flash click-on-graph | Graph with labels 1–5; summaries hidden | Click stages 1–5 |
| How does the axon change? | Flash start-quiz | Start screen only | Three MCQs |
| All or nothing | Static | **Text and graph yes** | Wording retained; graph rebuilt |
| Different strengths of stimuli | Flash slider | Empty axes + weak/medium/strong control | Weak / medium / strong frequency traces |
| Refractory period | Flash click-on-graph | Graph visible; pop-ups hidden | Absolute / relative cards |
| Speed (myelin) | Static | **Text yes**; saltatory sketch yes | Text retained + step animation |
| Speed (diameter, temperature) | Static | **Text yes** | Wording retained |
| True or false? | Flash T/F | Five statements visible; answers hidden | True/false with feedback. Answers from A-level biology, not from a recovered key |

### Part 3 – Sensory receptors

| Original slide | Type | Recoverable? | Rebuild |
|---|---|---|---|
| Title | Static | Layout | New title |
| The sensory nervous system | Static | **Text yes**; skin-block drawing yes | Wording retained; original 2D skin block |
| Mechanoreceptors in the skin | Flash play animation | Start frame only | 4-step Pacinian sequence |
| Photoreceptors in the retina | Flash click-labels | Labels listed; pop-ups hidden | Click cone/rod/bipolar/ganglion/optic nerve |
| Rod cells | Static | **Text yes** | Wording retained |
| Cone cells | Static | **Text yes** | Wording retained |
| Photoreceptors sort | Flash drag-to-columns | Start card “mostly used for night vision” | Rods vs cones sort |

### Part 4 – The synapse

| Original slide | Type | Recoverable? | Rebuild |
|---|---|---|---|
| Title | Static | Layout | New title |
| What happens at a synapse? | Flash play animation | Start frame only | 8-step transmission sequence |
| What are the main features? | Flash micrograph/diagram toggle | TEM-like image + questions. **Photograph not copied** | Original 2D diagram + identification cards |
| Transmission across a synapse | Flash sequencing | **Eight shuffled statements recovered in full** | Check-order activity using that list |
| Structure of the synapse | Flash drop-down labelling | Unlabelled diagram; options not visible | Numbered hotspots + word bank |

## 4. What was recovered vs rebuilt

**Recovered (reused as scientific content, not as Flash):**

- All visible body text on static slides (wording kept).
- Activity titles, instructions and the synapse sequencing list.
- True/false stems; matching terms and shuffled definitions; retina label list; ion-table axes; AP graph stage numbers 1–5.
- Course structure, 4:3 ratio, green/purple classroom chrome (recreated, not traced from assets).
- Copyright line © Boardworks Ltd 2009 on every slide.

**Not recovered (must be rebuilt; originals not copied):**

- All Flash movies, drop-downs, sliders, drag-and-drop, play-bars.
- Boardworks logo, Flash badge artwork, toolbar icons, Dr Talbot photograph, neurone micrograph, synapse TEM.
- Hidden pop-up copy inside Flash (neurone label blurbs, T/F answers, rod/cone cards, interview answers). Those were rewritten from A-level specification knowledge.

**Not present:** VBA macros, ActiveX, OLE, embedded SWF, native PowerPoint trigger animations in the source.

## 5. Licensing

Boardworks materials remain © Boardworks Ltd 2009. This reconstruction:

- does not ship the original PPT/SWF
- does not include Boardworks logos or photographs
- uses new 2D diagrams
- keeps copyright acknowledgements on every slide
- is intended for classroom use by someone who already has rights to the original course

It is **not** an official Boardworks product.

## 6. File format choice

All four deliverables are **macro-free `.pptx`**. Interactivity is native **slide hyperlinks** plus hidden slides (skipped by Space, reached by buttons). VBA was unnecessary. Flash is not used.
