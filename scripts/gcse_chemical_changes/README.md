# GCSE Chemistry chemical-changes videos

Twelve six-stage 1080p30 lessons covering AQA 4.4 / Edexcel Topic 3 (acids, salts, electrolysis).

Narration uses the JD Science cloned ElevenLabs voice (`ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`). Ryan Neural masters stay in `content/videos/<slug>/source/ryan-neural/`. Production pauses if the API reports `quota_exceeded`; live Ryan Neural MP4s are left in place.

```bash
python3 scripts/gcse_chemical_changes/produce.py --slug acids-bases-alkalis
python3 scripts/gcse_chemical_changes/produce.py
node scripts/publish-gcse-chemical-changes.mjs
node scripts/seo/write-gcse-chemistry-video-pages.mjs
```

Do not publish silent drafts. Do not alter Biology 1.1 or 1.2.
