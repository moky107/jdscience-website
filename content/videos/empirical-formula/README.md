# JDScience GCSE Chemistry — Calculating Empirical Formulae

Professionally rebuilt lesson video. The **master clock is the original ElevenLabs narration**, extracted unchanged from the source recording (voice, pitch and speed preserved).

## Deliverables

| File | Description |
| --- | --- |
| `jdscience-empirical-formulae-1080p.mp4` | Finished 1920×1080, 30 fps, AAC audio |
| `jdscience-empirical-formulae.pptx` | Editable 16:9 PowerPoint of the completed slides |
| `timing_map.json` | Narration → slide / reveal / cursor map |
| `source/narration_master.mp3` | Master audio (extracted, not retimed) |
| `source/transcript.json` | Word-level Whisper timestamps |
| `QA_REPORT.md` | Quality-assurance notes |

## Rebuild

```bash
# Preview stills at keyed narration times
python3 scripts/empirical_formula_video/build.py

# Full 1080p encode (uses source/narration_master.wav or .mp3)
python3 scripts/empirical_formula_video/build.py --video
```

The Python project under `scripts/empirical_formula_video/` is the editable video project: slide layouts, timing map and renderer.

## Timing rules

- Slide cuts follow spoken topic changes, never a fixed duration.
- Calculations appear when they are spoken.
- Practice answers stay hidden until “Let’s check your answer”.
- The pointer only moves onto a number, formula or step that is being named.
- Crossfades last 0.4 s.
