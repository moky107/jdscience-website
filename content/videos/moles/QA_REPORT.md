# QA — Calculating Moles 60 s sample

Master clock: cue map in `video_data.py` until the original ElevenLabs MP3 is aligned. **No cloned voice was synthesised.** The MP4 audio is silent so the original recording can be remuxed later.

Finished file: `jdscience-moles-60s-sample.mp4` — 1920×1080, 30 fps, 60.0 s.

## Checks

| Check | Result |
| --- | --- |
| Intro has title, strapline, no pointer | Pass — cursor hidden at 0–16 s |
| Concept uses a particle scene, not a slide list only | Pass — Avogadro cluster + 6.02×10²³ |
| Formula terms appear as they are named | Pass — n at 36.4 s, m at 38.4 s, Mr at 40.4 s |
| Pointer under n, then m, then Mr | Pass — pin sits below the glyph |
| 12 ÷ 24 = 0.5 mol progressive | Pass — 12, then 24, then 0.5 mol |
| Magnesium given values hidden until spoken | Pass — empty board until 42.4 s |
| Pointer does not fly in from a parked corner | Pass — fades up on the target |
| 0.3–0.5 s transitions | Pass — 0.40 s fade through navy |
| Original voice preserved | N/A — MP3 not on disk; silent track only |

Sampled frames: 0:01, 0:06, 0:16.5 (cursor on 6.02×10²³), 0:37 (n), 0:39 (m), 0:49 (24), 0:52 (0.5 mol), 0:55 (answer line).

## Remaining

Word-level Whisper alignment is implemented (`transcribe.py`) and will replace every timestamp once `moles.mp3` is in `content/videos/studio/audio/`. Do not treat this silent sample as the YouTube master.
