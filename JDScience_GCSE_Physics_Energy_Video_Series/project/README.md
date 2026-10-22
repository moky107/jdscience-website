# GCSE Physics Unit 3 — Conservation of Energy

Twelve 1920×1080, 30 fps H.264 / AAC lesson videos for JD Science.

The spoken words are the revised scripts in `scripts/physics_energy_series/scripts_text.py`. Scene breaks, diagrams and examination mark schemes are built from those scripts without rewriting them.

## Rebuild

```bash
python3 -m scripts.physics_energy_series.produce --all
python3 -m scripts.physics_energy_series.produce --video 3
```

Narration is cached under `project/audio/`. Timing maps are in `project/timing/`.

## Voice

The series uses the ElevenLabs cloned voice as recorded when both of these environment variables are set (they are not stored in the repository):

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

No British accent is applied to that clone. The request does not send a language override.

If those variables are absent, narration uses the West African English voice `en-NG-AbeoNeural`. British `en-GB` voices are not used. Re-run with `--force-audio` after adding the ElevenLabs variables to replace the soundtrack with the raw clone and rebuild the pictures in sync.
