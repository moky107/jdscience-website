# Six-stage audit of previously created JD Science videos

Mandatory gates: six instructional stages, spoken opening “Hello and welcome back to JD Science.”, pause before the model answer, recap, subscribe + jdscience.co.uk, 1920×1080 30 fps, **minimum 4 minutes**, no padding.

This audit does **not** mark short original-narration Biology lessons complete. Cell Division (1.1) and Bacterial Growth (1.2) are left unchanged.

## Chemistry — chemical changes (this branch)

Twelve acids / salts / electrolysis lessons replace the uploaded 720p ~2-minute drafts. Each is encoded 1080p30 with a temporary British English male voice (`en-GB-RyanNeural`) and passes the six-stage QA gate. Completeness is recorded per slug in `qa/` and `spec/`. Audio masters are stored separately so the cloned voice can replace this track later.

| Upload | Topic | Draft duration | Action |
| --- | --- | --- | --- |
| Chemistry_01 | Acids, Bases and Alkalis | 136 s | Rebuild 1080p six-stage |
| Chemistry_02 | Indicators and the pH Scale | 127 s | Rebuild |
| Chemistry_03 | Strong and Weak Acids (HT) | 133 s | Rebuild |
| Chemistry_04 | Acids + metals / redox | 142 s | Rebuild |
| Chemistry_05 | Neutralisation and gas tests | 127 s | Rebuild |
| Chemistry_06 | Soluble and insoluble salts | 134 s | Rebuild |
| Chemistry_07 | Acid-alkali titration | 142 s | Rebuild |
| Chemistry_08 | Electrolysis: ions and electrodes | 126 s | Rebuild |
| Chemistry_09 (duplicate files) | Molten ionic compounds | 117 s | Rebuild once |
| Chemistry_10 | Aqueous electrolysis | 122 s | Rebuild |
| Chemistry_11 | Copper purification | 127 s | Rebuild |
| Chemistry_12 | Synoptic exam practice | 143 s | Rebuild |

## Chemistry — foundations (already hosted)

Durations from cloned-voice transcripts. These already open with the brand line and include explanation, an exam item and a recap or outro. They are **over 4 minutes**. Gaps against the new gate: quiz and exam often share one beat, so Stage 4 (pause, no immediate answer) is not a separate silent-before-reveal stage.

| Slug | Duration | Intro | Explain | Worked | Your turn + pause | Model | Recap | Complete? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| states-of-matter | 416 s | yes | yes | quiz | exam (answer follows in speech) | yes | yes | Hold — needs explicit pause split |
| changes-of-state | 397 s | yes | yes | quiz | exam | yes | outro only | Hold |
| pure-substances-and-mixtures | 375 s | yes | yes | quiz | exam | yes | yes | Hold |
| separation-techniques | 426 s | yes | yes | quiz | exam | yes | outro only | Hold |
| chromatography | 400 s | yes | yes | Rf worked | exam | yes | yes | Hold |
| potable-water | 559 s | yes | yes | quiz | exam | yes | yes | Hold |

Do not mux silence onto these tracks. A later pass should insert a short pause before the spoken model answer and label Stage 3 / 4 / 5 in the slide map, then re-encode.

## Chemistry — calculation lessons

| Slug | Duration | Opening line | Notes |
| --- | --- | --- | --- |
| moles | 299 s | yes | Worked + practice; confirm pause split |
| concentration | 269 s | yes | Same |
| percentage-by-mass | 267 s | yes | Same |
| empirical-formula | 381 s | **no** — starts “In today's video” | Must gain the mandatory opening before it can be complete |
| atom-economy | 307 s | yes | Same as moles |

## Biology (do not alter 1.1 / 1.2)

Original-narration lessons on the remaining branch are 112–157 s. They have intro, explanation, exam and model answer, but they fail the 4-minute floor and lack a dedicated recap stage. Expanding them requires new authorised speech, not padding. **Not complete** against this gate.

Awaiting original audio: 2.1, 2.2, 3.1 communicable, 3.1 new drugs, 6.2–7.5.

## Physics

No GCSE/IGCSE Physics teaching-video production tree exists in this repository. Shop/original-lesson worksheets are not six-stage videos.

## T-Level Chemistry A11/A12

Cloned-voice lessons run 270–499 s and already use the brand opening. They are vocational T-Level, not GCSE, and were not rebuilt in this pass.
