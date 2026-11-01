# Level 3 · Nerve impulse and chemical synapse

Five 1080p30 JD Science lessons. Scripts, captions, interactive HTML and
editable Python sources sit with the videos.

| Part | Slug | Intended length |
| --- | --- | --- |
| Nerve impulse 1 | `nerve-impulse-part-1` | Neurone structure and resting potential |
| Nerve impulse 2 | `nerve-impulse-part-2` | Action potential and graph |
| Nerve impulse 3 | `nerve-impulse-part-3` | Propagation and saltatory conduction |
| Synapse 1 | `chemical-synapse-part-1` | Structure and chemical transmission |
| Synapse 2 | `chemical-synapse-part-2` | AChE, recycling and one-way travel |

```bash
python3 scripts/l3_nervous/tts_fallback.py
python3 scripts/l3_nervous/produce.py --skip-tts --out /opt/cursor/artifacts
```

ElevenLabs cloned-voice generation is preferred (`scripts/l3_nervous/tts.py`)
when quota is available. This build used `en-GB-RyanNeural` after an
ElevenLabs `quota_exceeded` response. Keep `narration_master.m4a` and
`transcript.json` so the clone can replace the track without rebuilding cues.

Interactive activities:

- `/resources/level3/biology/activities/nerve-impulse.html`
- `/resources/level3/biology/activities/chemical-synapse.html`
