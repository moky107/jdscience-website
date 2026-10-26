# GCSE Biology videos

Twenty-five YouTube-ready 1080p30 lessons. The cloned ElevenLabs narration is the master clock.

```bash
python3 scripts/gcse_biology/tts.py
python3 scripts/gcse_biology/produce.py --slug 1-1-cell-division --skip-tts --out /opt/cursor/artifacts
python3 scripts/gcse_biology/covers.py
python3 scripts/gcse_biology/prepare.py
```

`prepare.py` builds timestamp-ready storyboards, 1080p stills, unlisted YouTube covers and `content/gcse-biology/youtube-metadata.json` for lessons that still lack cloned-voice MP3s. It uses the production cue aligner against the teaching-edition script. It does not call ElevenLabs.

When cloned-voice credits are exhausted, `render_visual_drafts.py` encodes silent 1080p30 visual-draft MP4s from the existing timing maps. Those files are labelled visual-only drafts, are not published, and are not completed teaching videos.

Prepared stills live in `content/gcse-biology/previs/` (214 frames) and contact sheets in `content/gcse-biology/contact/`. Completed 1.1 and 1.2 MP3/MP4 masters stay in `content/videos/` and must not be altered. Resume narration from `1-3-transport-in-cells` with the existing cloned voice only. Keep YouTube Unlisted until approved for Public.

Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` for TTS. Do not print secret values.
