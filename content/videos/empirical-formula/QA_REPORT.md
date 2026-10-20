# Quality-assurance report — Empirical Formulae (1080p)

Master clock: original narration extracted from the supplied MP4  
(`source/narration_master.wav` / `.mp3`). Voice, pitch and speaking speed were not changed.  
A separate source MP3 and PowerPoint were not attached to this run, so the MP4 audio is the master track and the slides were rebuilt from the reference picture and JDScience branding.

Finished file: `jdscience-empirical-formulae-1080p.mp4`  
**1920×1080, 30 fps, 6:20.46** — matches the narration length to the frame.

## Checks passed

| Check | Result |
| --- | --- |
| Audio is the original narration, uncut | Pass — AAC remux of the extracted master; duration 380.46 s |
| Slide cuts follow spoken topic changes | Pass — 12 slides timed from Whisper word alignment, not fixed durations |
| Calculations appear when they are spoken | Pass — table cells reveal on the spoken number |
| Practice answers stay hidden until “Let’s check your answer” | Pass — pause banners at 161.96 s and 317.74 s; answers from 165.84 s and 320.40 s |
| Pointer only moves onto named values | Pass — idle / hidden on introductions and pause screens |
| Pointer does not cover numbers or formulae | Pass — pin sits under the highlight box |
| 0.3–0.5 s transitions | Pass — 0.40 s fade through navy (avoids stacked titles) |
| Chemical subscripts | Pass — C₆H₁₂O₆, CH₂O, Na₂O, C₂H₆O |
| Branding | Pass — JDScience navy/teal, 16:9, footer, page numbers |

Sampled encoded frames: 0:01, 0:12, 0:38, 1:21, 2:00 (cursor on **2.4**), 2:42 (pause, no answer), 2:46 (answer slide fading in empty), 3:23 (Na₂O), 4:46, 5:18 (practice 2 pause), 6:15 (C₂H₆O), 6:19 (close).

## Remaining notes

1. **Decimal tokens in Whisper.** The aligner often splits `2.4` into `2` + `.4`. Cursor times for those values were taken from the high-probability fragment (for example 2.4 at 119.32–120.00 s) rather than guessed.
2. **One patched window (118–145 s).** A 25 s Whisper chunk hallucinated “MgO” over the magnesium working. That span was re-transcribed in isolation and the cursor map uses that second pass.
3. **Full working line vs glyph-by-glyph.** When the teacher starts “2.4 divided by 24 gives 0.1 moles”, the whole mole cell is revealed and the pointer then moves 2.4 → 24 → 0.10. The line is not written one glyph at a time.
4. **Practice pause is short.** The narration itself only leaves about 3–4 s on “pause the video” before “let’s check your answer”. The picture holds the question for that whole spoken pause; it does not insert extra silence, because that would change the master audio.
5. **Bitrate.** Static slides compress to ~80 kb/s video at CRF 18. Edges of type remain sharp at 1080p; this is expected for a board-style master.

No narration is clipped. No practice answer is visible before the spoken reveal.
