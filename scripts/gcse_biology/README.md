# GCSE Biology videos

Twenty-five YouTube-ready 1080p30 lessons. The cloned ElevenLabs narration is the master clock.

```bash
python3 scripts/gcse_biology/tts.py
python3 scripts/gcse_biology/produce.py --slug 1-1-cell-division --skip-tts --out /opt/cursor/artifacts
python3 scripts/gcse_biology/covers.py
```

Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. Do not print secret values.
