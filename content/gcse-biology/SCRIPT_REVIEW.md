# GCSE Biology script review — remaining 23 lessons

Reviewed before cloned-voice narration. Teaching-edition scripts stay the spoken source.
British English. Opening: `Hello and welcome back to JD Science.` Close: subscribe plus `jdscience.co.uk`.
These lessons are **not complete** until cloned-voice MP3s exist and 1080p videos are re-encoded against those timestamps.

Silent files in `content/gcse-biology/visual-drafts/` are **visual production masters only**. Do not publish them as completed lessons. Do not mux their estimated clock as if it were narration.

## Coverage verdict

All 23 remaining lessons include:

- a full spoken explanation of the named AQA topic
- at least one worked comparison, calculation or step-by-step example
- an on-screen exam-style question with a mark tariff
- a model answer revealed only after the pause
- a revise cue (what / why / how the structures help)

AQA required practicals are **not** walked through as full methods in this teaching edition. That is a curriculum-scope note, not a reason to invent new scripts before narration.

On-screen diagrams already follow the scientific corrections in `SOURCE_REVIEW.md`. Spoken teaching-edition wording may still mention the draft, then the correction.

## Lesson-by-lesson

| Spec | Lesson | Curriculum focus | Worked example | Exam question | Ready for cloned voice |
| --- | --- | --- | --- | --- | --- |
| 1.3 | Transport in Cells | Diffusion, osmosis, active transport, alveoli, root hairs | Three-process comparison; root-hair ions | Why root hairs use active transport [2] | Yes |
| 2.1 | Principles of Organisation | Cell → tissue → organ → system → organism | Heart / cardiac muscle hierarchy | Order the levels [2] | Yes |
| 2.2 | Animal Tissues, Organs and Systems | Digestive enzymes, bile, vessels, blood | Amylase → maltose, not glucose; bile is not an enzyme | Name starch enzyme and product [2] | Yes |
| 2.3 | Plant Tissues, Organs and Systems | Leaf tissues, transpiration, xylem, phloem | Source/sink sugars; transpiration pull | Phloem direction [2] | Yes |
| 3.1 | Communicable Diseases | Pathogens, defences, vaccines, antibiotics | HIV / measles / malaria; antibiotics ≠ viruses | Why antibiotics fail on viruses [2] | Yes |
| 3.1 | Discovering and Testing New Drugs | Discovery, preclinical, clinical, blinding | Fleming, digitalis, aspirin; placebo vs standard care | Single-blind vs double-blind [2] | Yes |
| 3.2 | Monoclonal Antibodies | Hybridoma, tests, targeted treatment (Biology HT) | Hybridoma fusion steps; not automatically side-effect free | How a hybridoma is produced [3] | Yes |
| 3.3 | Plant Disease | Infection, TMV, rose black spot, mineral deficiency | Mg chlorosis vs nitrate stunting | Yellow leaves with green veins [2] | Yes |
| 4.1 | Photosynthesis | Equation, uses of glucose, limiting factors | Inverse-square: 20 cm → 40 cm cuts intensity to ¼ | Light intensity and rate [3] | Yes |
| 4.2 | Respiration | Aerobic, anaerobic, fermentation, exercise | Respiration ≠ breathing; lactate correction on screen | Why muscles produce lactic acid [2] | Yes |
| 5.1 | Homeostasis | Receptors, coordinators, effectors, negative feedback | Insulin / glucagon blood-glucose loop | Roles of the three parts [3] | Yes |
| 5.2 | The Nervous System | Conscious action, reflex arc, synapse, eye | Receptor → sensory → relay → motor → effector | Reflex pathway in order [3] | Yes |
| 5.3 | Hormonal Coordination | Glands, diabetes, menstrual cycle, ADH | Type 1 vs type 2; LH and ovulation | Hormone that triggers ovulation [2] | Yes |
| 5.4 | Plant Hormones | Tropisms, auxin, ethene, gibberellins (Biology only) | Auxin redistributed, not destroyed by light | Why a shoot bends to light [3] | Yes |
| 6.1 | Reproduction | Meiosis, DNA, alleles, inheritance | Punnett Ff × FF → 0 % cystic fibrosis | Probability child has CF [3] | Yes |
| 6.2 | Variation and Evolution | Mutation, selection, breeding, genetic engineering | Human insulin in bacteria | GE steps for insulin [3] | Yes |
| 6.3 | Genetics and Evolution | Darwin, Lamarck, Mendel, resistance, speciation | Antibiotic resistance as natural selection | How resistant bacteria evolve [3] | Yes |
| 6.4 | Classification | Linnaeus, kingdoms, three domains | Dog as *Canis lupus familiaris* | Hierarchy largest to smallest [2] | Yes |
| 7.1 | Adaptations, Interdependence | Ecosystems, abiotic/biotic, extremophiles | Structural vs behavioural vs physiological | One abiotic and one biotic factor [2] | Yes |
| 7.2 | Organisation of an Ecosystem | Food chains, carbon cycle, water cycle, decay | Arrow = energy flow; respiration returns CO₂ | How CO₂ returns to air [2] | Yes |
| 7.3 | Biodiversity | Pollution, deforestation, conservation | Deforestation and the greenhouse effect | How deforestation contributes to warming [3] | Yes |
| 7.4 | Trophic Levels | Biomass pyramids, transfer % (Biology only) | (0.45 ÷ 3.2) × 100 = 14.1 % | Percentage biomass rabbit → stoat [2] | Yes |
| 7.5 | Food Production | Food security, mycoprotein, quotas (Biology only) | *Fusarium* on glucose; fishing quotas | Why quotas aid sustainability [1] | Yes |

## Required-practical note (not missing from the teaching edition by accident)

The supplied scripts teach the specification ideas. They do not run full AQA required-practical methods for osmosis, food tests, enzymes, transpiration, photosynthesis rate, reaction time, sampling or decay. Final narrated videos should stay faithful to this teaching edition rather than inserting new practical walkthroughs at the last minute.

## Final encode rule

When cloned-voice credits return:

1. Generate MP3s with `scripts/gcse_biology/tts.py` using only the existing cloned voice, starting at `1-3-transport-in-cells`.
2. Re-encode with `scripts/gcse_biology/produce.py --slug <slug> --skip-tts` so highlights, pointers and 0.40 s transitions lock to **word timestamps**.
3. Do not add audio to the silent visual masters.
4. Do not stamp `VISUAL DRAFT` on final MP4s.
5. Do not alter 1.1 or 1.2.
6. Keep YouTube Unlisted until approved for Public.
