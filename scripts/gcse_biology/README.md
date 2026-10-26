# GCSE Biology videos

Twenty-five YouTube-ready 1080p30 lessons. The cloned ElevenLabs narration is the master clock.

```bash
python3 scripts/gcse_biology/tts.py
python3 scripts/gcse_biology/produce.py --slug 1-1-cell-division --skip-tts --out /opt/cursor/artifacts
python3 scripts/gcse_biology/covers.py
python3 scripts/gcse_biology/prepare.py
```

`prepare.py` builds timestamp-ready storyboards, 1080p stills, unlisted YouTube covers and `content/gcse-biology/youtube-metadata.json` for lessons that still lack cloned-voice MP3s. It uses the production cue aligner against the teaching-edition script. It does not call ElevenLabs and does not encode silent MP4s.

Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` for TTS. Do not print secret values.
