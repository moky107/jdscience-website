# GCSE Biology video series — source review

Revised teaching edition scripts were supplied in chat on 26 October 2026 (Europe/London).
British English. Continuous spoken narration. Original topic sequence.

This is a script-review production: exam questions and model answers are retained for video use.
No existing biology MP3s were found in the repository; cloned ElevenLabs narration is generated for every lesson.

## Lesson register (document order)

| Spec | Title | Slug | Notes |
| --- | --- | --- | --- |
| 1.1 | Cell Division | `1-1-cell-division` | Combined |
| 1.2 | Bacterial Growth | `1-2-bacterial-growth` | Biology only |
| 1.3 | Transport in Cells | `1-3-transport-in-cells` | Combined |
| 2.1 | Principles of Organisation | `2-1-principles-of-organisation` | Combined |
| 2.2 | Animal Tissues, Organs and Organ Systems | `2-2-animal-tissues-organs-systems` | Combined |
| 2.3 | Plant Tissues, Organs and Systems | `2-3-plant-tissues-organs-systems` | Combined |
| 3.1 | Communicable Diseases | `3-1-communicable-diseases` | Combined |
| 3.1 | Discovering and Testing New Drugs | `3-1-discovering-and-testing-new-drugs` | Second 3.1; unique slug kept |
| 3.2 | Monoclonal Antibodies | `3-2-monoclonal-antibodies` | Biology HT only |
| 3.3 | Plant Disease | `3-3-plant-disease` | Biology only |
| 4.1 | Photosynthesis | `4-1-photosynthesis` | Combined |
| 4.2 | Respiration | `4-2-respiration` | Combined |
| 5.1 | Homeostasis | `5-1-homeostasis` | Combined; glucagon Higher Tier |
| 5.2 | The Nervous System | `5-2-the-nervous-system` | Combined |
| 5.3 | Hormonal Coordination in Humans | `5-3-hormonal-coordination` | Combined |
| 5.4 | Plant Hormones | `5-4-plant-hormones` | Biology only |
| 6.1 | Reproduction | `6-1-reproduction` | Combined |
| 6.2 | Variation and Evolution | `6-2-variation-and-evolution` | Combined |
| 6.3 | The Development of Understanding of Genetics and Evolution | `6-3-genetics-and-evolution` | Combined |
| 6.4 | Classification of New Organisms | `6-4-classification` | Combined |
| 7.1 | Adaptations, Interdependence and Competition | `7-1-adaptations-interdependence` | Combined |
| 7.2 | Organisation of an Ecosystem | `7-2-organisation-of-an-ecosystem` | Combined |
| 7.3 | Biodiversity and the Effect of Human Interaction on Ecosystems | `7-3-biodiversity` | Combined |
| 7.4 | Trophic Levels in an Ecosystem | `7-4-trophic-levels` | Biology only |
| 7.5 | Food Production | `7-5-food-production` | Biology only |

Numbering follows the supplied scripts, including two topics labelled 3.1.

## Scientific flags (spoken text kept; visuals follow the correction)

The teaching edition speaks the draft and then the correction. On-screen diagrams use the corrected science.

| Topic | Draft wording | Correction used on screen |
| --- | --- | --- |
| 5.4 Plant hormones | “auxin is destroyed by light” | Auxin is **redistributed**; more accumulates on the shaded side. Light does not simply destroy all auxin on the illuminated side. |
| 6.4 Classification | Dog listed as *Canis lupus* | Domestic dog is commonly *Canis lupus familiaris*, a subspecies of the grey wolf. |
| 3.1 Communicable diseases | Vaccines “contain dead or inactive pathogens” | Some vaccines contain purified antigens, inactivated toxins or genetic instructions. |
| 4.2 Respiration | Lactic acid causes muscle fatigue / oxygen debt repaid by deep breathing | Respiration is not breathing. Anaerobic muscle respiration produces **lactate**. Oxygen is needed afterwards for recovery; lactate is not the simple cause of all fatigue. |
| 7.4 Trophic levels | “Only about 10 percent of energy is transferred” with cabbage masses | Masses give **biomass-transfer** percentages (about 8.6 %, 14.1 %, 8.9 %). Do not label those values energy-transfer efficiency unless energy data are supplied. |
| 2.2 Digestion | Risk of implying amylase produces glucose immediately | Amylase produces maltose / smaller sugars; later enzymes produce glucose. **Bile is not an enzyme.** |
| 6.1 Inheritance | Punnett Ff × FF | Child is ff only for cystic fibrosis; probability **0 %**. |
| 3.2 Monoclonal antibodies | “fewer side effects” vs chemotherapy | They can target more precisely; they are **not automatically free from side effects**. |

## Production notes

- Opening line is exactly: `Hello and welcome back to JD Science.`
- Close with subscribe and `jdscience.co.uk` (not JDScience.in).
- Exam questions appear on screen; the model answer is revealed only when the narration reaches it.
- One MP4 per lesson. Lessons are not combined.

## Production status (26 October 2026, Europe/London)

Cloned-voice TTS for **1.1 Cell Division** and **1.2 Bacterial Growth** completed with `eleven_multilingual_v2` and the JD Science cloned voice. Those two lessons are live on `/resources/gcse/biology/videos/` and the papers Videos catalog.

A fresh cloned-voice request for **1.3 Transport in Cells** (1875 characters, one chunk) still returns `quota_exceeded`: 52 credits remaining, 825 required for that request. The cloned voice is already configured (`ELEVENLABS_VOICE_ID` present). TTS still consumes character credits; there is no credit-free path that uses this voice. Existing MP3s for 1.1 and 1.2 are reused and not regenerated. No generic fallback voice is used.

The remaining 23 lessons therefore have **no cloned-voice MP3** and are **not reported complete**. Silent 1080p files exist only as **visual production masters** (red `VISUAL DRAFT` banner). They are unpublished. Cue order on 5.4, 6.3, 7.1 and 7.5 was corrected so the production aligner matches the teaching-edition script. Script review: `content/gcse-biology/SCRIPT_REVIEW.md`.

Resume cloned-voice production with `python3 scripts/gcse_biology/tts.py` (skips existing 1.1 and 1.2 transcripts) once credits cover a full lesson chunk, starting at **1.3 Transport in Cells**, then `python3 scripts/gcse_biology/produce.py --slug <slug> --skip-tts`. That path aligns highlights and transitions to cloned-voice word times, omits the draft banner, and refuses to mux silent masters. Do not publish unfinished lessons. Keep YouTube Unlisted until approved for Public. See `content/gcse-biology/PRODUCTION_REGISTER.md`.
