# JDScience Video Studio

Editable 1920×1080 30 fps rebuilds of the GCSE chemistry calculation lessons. The **original ElevenLabs MP3 is the master clock**. Voice, pitch and speed are never changed.

```
scripts/jdscience_video/
  README.md
  render.py
  video_data.py
  transcribe.py
content/videos/studio/audio/     ← original MP3s (moles.mp3, …)
content/videos/<topic>/          ← rendered MP4, timing map, QA frames
```

## Recordings

Place the four cloned-voice masters here (any of these names):

| Lesson | Filename |
| --- | --- |
| Calculating Moles | `content/videos/studio/audio/moles.mp3` |
| Concentration | `content/videos/studio/audio/concentration.mp3` |
| Percentage by Mass | `content/videos/studio/audio/percentage-by-mass.mp3` |
| Atom Economy | `content/videos/studio/audio/atom-economy.mp3` |

Chat cannot attach raw `.mp3`. Zip the files, push them onto this branch, or paste a public URL — `ingest.py` will put them in the right folder.

## Commands

```bash
# Align Moles narration (requires the original MP3)
python3 scripts/jdscience_video/transcribe.py --topic moles

# 60 s sample: intro + concept + cursor-guided n = m / Mr
python3 scripts/jdscience_video/render.py --topic moles --sample

# Full lesson after the sample is approved
python3 scripts/jdscience_video/render.py --topic moles --transcribe --video
```

If the Moles MP3 is not on disk yet, `--sample` still renders the pictures against the cue map and uses a silent track so the original recording can be remuxed without re-voicing.

## Rules

- Scene cuts follow spoken topic changes (0.4 s fade through navy), never a fixed slide clock.
- Working appears when it is spoken. Practice answers stay hidden until “Let's check your answer”.
- The pointer sits under a named number or formula and hides on introductions.
- No placeholder TTS. No background music.
