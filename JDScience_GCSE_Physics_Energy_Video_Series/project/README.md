# GCSE Physics Unit 3 — Conservation of Energy

Twelve 1920×1080, 30 fps H.264 / AAC lesson videos for JD Science.

The spoken words are the revised scripts in `scripts/physics_energy_series/scripts_text.py`. Scene breaks, diagrams and examination mark schemes are built from those scripts without rewriting them.

## Rebuild

```bash
python3 -m scripts.physics_energy_series.produce --all --force-audio
python3 -m scripts.physics_energy_series.produce --video 3
```

Narration is cached under `project/audio/`. Timing maps are in `project/timing/`.

## Voice

Narration uses only the ElevenLabs cloned voice. Both of these environment variables must be set (they are not stored in the repository):

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

No British accent conversion is applied. If authentication or synthesis fails, production stops with the exact ElevenLabs error. A substitute voice is never used.
