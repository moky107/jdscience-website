# Level 3 · Nerve impulse and chemical synapse

Five 1080p30 JD Science lessons. Scripts, captions, interactive HTML and
editable Python sources sit with the videos.

| Part | Slug | Focus |
| --- | --- | --- |
| Nerve impulse 1 | `nerve-impulse-part-1` | Neurone structure and resting potential |
| Nerve impulse 2 | `nerve-impulse-part-2` | Action potential and graph |
| Nerve impulse 3 | `nerve-impulse-part-3` | Propagation and saltatory conduction |
| Synapse 1 | `chemical-synapse-part-1` | Structure and chemical transmission |
| Synapse 2 | `chemical-synapse-part-2` | AChE, recycling and one-way travel |

```bash
COQUI_TOS_AGREED=1 python3 scripts/l3_nervous/tts_xtts_clone.py
python3 scripts/l3_nervous/produce.py --skip-tts --out /opt/cursor/artifacts
```

Narration is a zero-shot clone of the uploaded JD Science teaching sample
(`scripts/l3_nervous/tts_xtts_clone.py`). Accent and timbre come from that
recording, not from `en-GB-RyanNeural`. ElevenLabs still cannot clone
(`voices_write` denied) or synthesise (`quota_exceeded`). Keep
`narration_master.m4a` and `transcript.json` so a later ElevenLabs clone can
replace the track without rebuilding slide art.

Interactive activities:

- `/resources/level3/biology/activities/nerve-impulse.html`
- `/resources/level3/biology/activities/chemical-synapse.html`
