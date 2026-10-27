# YouTube Unlisted upload pack

Titles, descriptions and 1280×720 thumbnails for the twelve GCSE Chemistry Chemical Changes lessons. Privacy is **Unlisted**. Do not set Public without approval.

Upload with:

```bash
node scripts/upload-gcse-chemical-changes-youtube.mjs
```

Requires environment secrets on the Google account that owns the JD Science YouTube channel:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

OAuth scope: `https://www.googleapis.com/auth/youtube.upload`
