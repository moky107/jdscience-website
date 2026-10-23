# JDScience lesson videos

Editable 1080p30 rebuilds. The **original ElevenLabs narration is the master clock**.

| Lesson | Deliverable | Duration |
| --- | --- | --- |
| [Calculating Empirical Formulae](empirical-formula/) | `jdscience-empirical-formulae-1080p.mp4` | 6:20 |
| [Calculating Moles](moles/) | `jdscience-moles-1080p.mp4` (+ 60 s sample) | 4:59 |
| [Calculating Concentration](concentration/) | `jdscience-concentration-1080p.mp4` | 4:29 |
| [Percentage by Mass](percentage-by-mass/) | `jdscience-percentage-by-mass-1080p.mp4` | 4:27 |
| [Atom Economy](atom-economy/) | `jdscience-atom-economy-1080p.mp4` | 5:07 |
| GCSE Physics energy series (12 lessons) | `jdscience-*-1080p.mp4` under each topic folder | ~3–5 min each |

Physics energy lessons use the **ElevenLabs cloned voice** (original accent). Do not replace those MP4s with Azure Neural / `en-NG-AbeoNeural` builds.

Source AAC for chemistry lessons lives in `content/videos/<topic>/source/narration_master.m4a`.
Rebuild chemistry with `python3 scripts/jdscience_video/render.py --topic <slug> --video`.
Rebuild physics energy with `python3 -m scripts.physics_energy_series.produce` when that package is present and `ELEVENLABS_*` is set.
