# JDScience lesson videos

Editable 1080p30 rebuilds. The **original ElevenLabs narration is the master clock**.

| Lesson | Deliverable | Duration |
| --- | --- | --- |
| [Calculating Empirical Formulae](empirical-formula/) | `jdscience-empirical-formulae-1080p.mp4` | 6:20 |
| [Calculating Moles](moles/) | `jdscience-moles-1080p.mp4` (+ 60 s sample) | 4:59 |
| [Calculating Concentration](concentration/) | `jdscience-concentration-1080p.mp4` | 4:29 |
| [Percentage by Mass](percentage-by-mass/) | `jdscience-percentage-by-mass-1080p.mp4` | 4:27 |
| [Atom Economy](atom-economy/) | `jdscience-atom-economy-1080p.mp4` | 5:07 |

Source AAC lives in `content/videos/<topic>/source/narration_master.m4a`.
Rebuild with `python3 scripts/jdscience_video/render.py --topic <slug> --video`.

## Foundations series

New particle-model and separation lessons. Cloned ElevenLabs narration is the master clock.

| Lesson | Deliverable |
| --- | --- |
| [States of Matter](states-of-matter/) | `jdscience-states-of-matter-1080p.mp4` |
| [Changes of State](changes-of-state/) | `jdscience-changes-of-state-1080p.mp4` |
| [Pure Substances and Mixtures](pure-substances-and-mixtures/) | `jdscience-pure-substances-and-mixtures-1080p.mp4` |
| [Separation Techniques](separation-techniques/) | `jdscience-separation-techniques-1080p.mp4` |
| [Chromatography](chromatography/) | `jdscience-chromatography-1080p.mp4` |
| [Potable Water](potable-water/) | `jdscience-potable-water-1080p.mp4` |

Rebuild with `python3 scripts/gcse_foundations/tts.py` then `python3 scripts/gcse_foundations/render.py --video`.
