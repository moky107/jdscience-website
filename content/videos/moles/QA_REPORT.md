# Moles QA

Checked against the encoded `jdscience-moles-1080p.mp4` (1920×1080, 30 fps,
4:59.31) with the original AAC remuxed (`-c:a copy`).

| Check | Result |
| --- | --- |
| Audio present | AAC 142 kb/s mono, duration matches master |
| Voice identity | Correlation 1.0 vs `narration_master.m4a` at 162 s |
| 12 → 24 → 0.5 | 162.2 s highlights 12 only; 163.3 s 24 appears; 164.3 s 0.5 mol |
| Practice pause | 238.2 s shows the question and PAUSE banner, no answer |
| Practice answer | 241 s empty board; 259.6 s reveals 9; 261.7 s 9 ÷ 18 = 0.5 mol |
| Chemistry | 12/24 = 0.5 mol Mg; Mr(CO₂)=44; 2×44=88 g; Mr(H₂O)=18; 9/18=0.5 mol |

60 s sample uses the same original narration for the intro → mole → Avogadro
section, with the pointer on 6.02 × 10²³.
