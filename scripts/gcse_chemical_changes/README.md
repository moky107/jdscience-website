# GCSE Chemistry chemical-changes videos

Twelve six-stage 1080p30 lessons covering AQA 4.4 / Edexcel Topic 3 (acids, salts, electrolysis).

Temporary British English narration uses Microsoft `en-GB-RyanNeural` until the JD Science cloned voice is restored. Keep `content/videos/<slug>/source/narration_master.m4a` and `transcript.json` so the clone can replace the track without rebuilding cues.

```bash
python3 scripts/gcse_chemical_changes/tts_temp.py --test
python3 scripts/gcse_chemical_changes/produce.py --slug acids-bases-alkalis
python3 scripts/gcse_chemical_changes/produce.py
node scripts/publish-gcse-chemical-changes.mjs
node scripts/seo/write-gcse-chemistry-video-pages.mjs
```

Do not publish silent drafts. Do not alter Biology 1.1 or 1.2.
