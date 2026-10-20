# JDScience lesson videos

Editable 1080p30 rebuilds. The **original ElevenLabs narration is the master clock**.

| Lesson | Status |
| --- | --- |
| [Calculating Empirical Formulae](empirical-formula/) | Built — see PR deliverables |
| Calculating Moles | Waiting on source MP3 (chat blocks `.mp3` / `.mp4`) |
| Calculating Concentration | Waiting on source |
| Percentage by Mass | Waiting on source |
| Atom Economy | Waiting on source |

## Send source files

Cursor chat rejects raw MP3 and MP4. Use the drop path in [`_inbox/README.md`](_inbox/README.md):

1. Zip the files and attach the zip in chat, or
2. Paste a public WeTransfer / Dropbox / Drive link, or
3. `git push` onto `cursor/empirical-formula-video-641d` under `content/videos/<topic>/source/`

```bash
python3 scripts/jdscience_video/ingest.py --topic moles moles-source.zip
python3 scripts/jdscience_video/ingest.py --topic moles 'https://…'
```
