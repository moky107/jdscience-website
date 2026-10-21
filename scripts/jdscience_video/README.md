# JDScience Video Studio

Editable 1920×1080 30 fps rebuilds of the GCSE chemistry calculation lessons.
The **original ElevenLabs narration is the master clock**. Voice, pitch and
speed are never changed; the cloned AAC is remuxed with `-c:a copy`.

```
scripts/jdscience_video/
  render.py            encode 1080p30 MP4 from the timing map
  video_data.py        word-aligned slides / reveals / cursor
  scenes_*.py          topic-specific boards, molecules, lab kit
  transcribe.py        faster-whisper word timestamps
content/videos/<topic>/
  jdscience-<topic>-1080p.mp4
  source/narration_master.m4a
  timing_map.json
```

## Commands

```bash
python3 scripts/jdscience_video/render.py --topic moles --sample
python3 scripts/jdscience_video/render.py --topic moles --video
python3 scripts/jdscience_video/render.py --topic concentration --video
python3 scripts/jdscience_video/render.py --topic percentage-by-mass --video
python3 scripts/jdscience_video/render.py --topic atom-economy --video
```

## Rules

- Scene cuts follow spoken topic changes (0.4 s fade through navy).
- Working appears when it is spoken. Practice answers stay hidden until
  “Let's check your answer”.
- The pointer sits under a named number or formula and hides on introductions.
- No placeholder TTS. No background music. No extra closing lines.
