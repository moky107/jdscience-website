# Source drop (Cursor chat blocks .mp3 / .mp4)

Cursor chat rejects raw MP3 and MP4 attachments. The files never reach this workspace. Use one of the paths below; they all land in `content/videos/<topic>/source/`.

Start with **Moles** only (60 s sample first). Zip is enough — PowerPoint is optional.

## Fastest: zip and attach here

On your computer:

```bash
zip moles-source.zip moles.mp3 moles.mp4 moles.pptx
```

Attach `moles-source.zip` to this chat (or drop the zip into this folder) and send a message. `.zip` is allowed.

If zip is also blocked, rename first:

```bash
cp moles.mp3 moles-narration.bin
zip moles-source.zip moles-narration.bin
```

## Or paste a public link

Anyone-with-the-link WeTransfer, Dropbox (`?dl=1`), or Google Drive. Then say which lesson it is if the filename is unclear.

```bash
python3 scripts/jdscience_video/ingest.py --topic moles 'https://…'
```

## Or push onto this branch

```bash
git checkout cursor/empirical-formula-video-641d
mkdir -p content/videos/moles/source
cp moles.mp3 content/videos/moles/source/narration_master.mp3
# optional:
cp moles.mp4 content/videos/moles/source/reference.mp4
cp moles.pptx content/videos/moles/source/slides.pptx
git add content/videos/moles/source
git commit -m "Add moles source narration"
git push origin cursor/empirical-formula-video-641d
```

GitHub accepts these binaries (keep each file under 50 MB).

## Expected files per lesson

| File | Role |
| --- | --- |
| `narration_master.mp3` | ElevenLabs master clock (required) |
| `reference.mp4` | Optional picture reference |
| `slides.pptx` | Optional slide reference |

Topics: `moles`, `concentration`, `percentage-by-mass`, `atom-economy`.
