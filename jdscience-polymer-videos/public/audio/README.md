# JD Science polymer voiceovers

Place the **four original** narration MP3 files in this folder.

Suggested names (any of these patterns are auto-detected):

| Lesson | Preferred filename |
| --- | --- |
| Polymers intro | `01-polymers-intro.mp3` |
| Poly(ethene) | `02-polyethene.mp3` |
| Poly(propene) | `03-polypropene.mp3` |
| Polyester | `04-polyester.mp3` |

If you use other names, keep a stable sort order (`01`…`04` or `video1`…`video4`) so each lesson maps correctly.

Then run:

```bash
node scripts/probe-audio.mjs
node scripts/render-all.mjs
```

Do **not** replace these with generated TTS — the Remotion compositions are built to preserve the original voice, accent and timing.
