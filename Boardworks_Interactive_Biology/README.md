# Boardworks Interactive Biology – Nervous System

Reconstructed, **macro-free** classroom PowerPoints for the Boardworks A2 Biology *Nervous System* series (Parts 1–4).

Original 2009 activities used **Adobe Flash**. Those SWF activities do not run in modern PowerPoint. The original `.ppt` / `.pptx` files were not supplied with this task — only a flattened 33-page PDF export — so Flash, VBA and OLE could not be recovered from the source files. Scientific wording from recoverable static slides is retained. Diagrams, buttons and animations are **new** reconstructions.

Original course © Boardworks Ltd 2009. These files are reconstructed teaching resources for a licensee; they are not official Boardworks products and do not include Boardworks logos or Flash.

## Files

| File | Lesson |
|---|---|
| **`JD_Science_Complete_Interactive_Nervous_System_Course.pptx`** | **All four modules in one deck**, with a course menu and Home |
| `01_Organisation_of_the_Nervous_System.pptx` | Part 1 – Organisation (standalone) |
| `02_The_Nerve_Impulse.pptx` | Part 2 – The nerve impulse (standalone) |
| `03_Sensory_Receptors.pptx` | Part 3 – Sensory receptors (standalone) |
| `04_The_Synapse.pptx` | Part 4 – The synapse (standalone) |

The combined file is rebuilt from the four module builders with remapped hyperlinks. It does not overwrite the four standalone presentations.

Reports are in `reports/` (including `05_combined_course_testing_report.md`). Rebuild scripts are in `src/`.

## How to use

1. Open a file in **desktop Microsoft PowerPoint**.
2. Start the slide show (**F5** or Slide Show → From Beginning).
3. Buttons only jump while the show is running.
4. Hidden activity slides (answers, feedback) are skipped if you only press Space — use the on-slide buttons.
5. In the combined course, the opening menu jumps to each module. **Home** on later slides returns to that menu.

## Rebuild

```bash
python3 src/build_all.py          # four standalone files
python3 src/build_combined.py     # master course (does not overwrite the four)
```

Requires `python-pptx`, `lxml`, `matplotlib`, `pillow` and `numpy`.
