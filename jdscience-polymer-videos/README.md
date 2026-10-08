# JD Science — Polymer lesson videos (Remotion)

Four GCSE Chemistry polymer videos with displayed-formula animations for:

1. **PolymersIntro** — monomers, polymers, addition vs condensation  
2. **Polyethene** — ethene → poly(ethene)  
3. **Polypropene** — propene → poly(propene)  
4. **Polyester** — condensation polymerisation  

## Voiceovers (required)

Put the **original** JD Science MP3 narrations in `public/audio/`.  
Do not replace them with generated speech.

Suggested names:

- `01-polymers-intro.mp3`
- `02-polyethene.mp3`
- `03-polypropene.mp3`
- `04-polyester.mp3`

Composition length is taken from each MP3 via `getAudioDurationInSeconds` so scenes stay in sync with the real narration.

## Commands

```bash
npm install
node scripts/probe-audio.mjs   # measure MP3 durations
npm run render:all             # writes MP4s to out/
npm run dev                    # Remotion Studio
```

## Output

Rendered files:

- `out/01-polymers-intro.mp4`
- `out/02-polyethene.mp4`
- `out/03-polypropene.mp4`
- `out/04-polyester.mp4`
