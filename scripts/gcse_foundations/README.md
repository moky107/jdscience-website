# GCSE Chemistry foundations videos

Six YouTube-ready 1080p30 lessons. The cloned ElevenLabs narration is the master clock.

| Lesson | File |
| --- | --- |
| States of Matter | `jdscience-states-of-matter-1080p.mp4` |
| Changes of State | `jdscience-changes-of-state-1080p.mp4` |
| Pure Substances and Mixtures | `jdscience-pure-substances-and-mixtures-1080p.mp4` |
| Separation Techniques | `jdscience-separation-techniques-1080p.mp4` |
| Chromatography | `jdscience-chromatography-1080p.mp4` |
| Potable Water and Waste Water Treatment | `jdscience-potable-water-1080p.mp4` |

```bash
# Requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in the environment.
python3 scripts/gcse_foundations/tts.py
python3 scripts/gcse_foundations/render.py --video --out /opt/cursor/artifacts
```

Do not print or log the secret values. Existing calculation videos in `content/videos/` are left unchanged.
