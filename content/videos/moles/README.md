# Calculating Moles — 60 s sample

JDScience Video Studio rebuild. Pictures follow a cue-timed narration map (intro → mole concept → `n = m / Mr` with cursor 12 → 24 → 0.5 mol).

The **original ElevenLabs MP3 is not in this workspace yet** (Cursor chat blocks `.mp3`). This sample uses a silent audio track so the cloned voice is not replaced. Drop `moles.mp3` into `content/videos/studio/audio/`, then:

```bash
python3 scripts/jdscience_video/transcribe.py --topic moles
python3 scripts/jdscience_video/render.py --topic moles --sample
```

That re-times every cut, reveal and pointer from word-level Whisper timestamps and remuxes the original recording unchanged.

## Files

| File | Role |
| --- | --- |
| `jdscience-moles-60s-sample.mp4` | 1920×1080 30 fps sample |
| `timing_map.json` | Scene / reveal / cursor map |
| `QA_REPORT.md` | Sync notes |

Full lesson (Mg, CO₂, water practice) waits on that master MP3 and on approval of this sample.
