# Video of the Day

The homepage section **Video of the Day** replaced "How JD Science Works". It shows exactly one
published video (an MP4 uploaded to Supabase Storage or a YouTube link), managed from
**Admin → Video of the Day** (`/admin/featured-video`).

## One-off setup

1. Open the Supabase SQL editor and run `supabase/migrations/20261102_featured_videos.sql`.
   It is safe to re-run. It creates:
   - the `featured_videos` table, with a partial unique index so only one row can be published;
   - `publish_featured_video(uuid)`, which swaps the live video atomically (service role only);
   - RLS (the public can read only the published row);
   - the public buckets `featured-videos` (MP4) and `featured-thumbnails` (JPG/PNG/WebP, 10 MB);
   - a one-off import of any videos already saved in `site_settings` (key `featured_videos`).

   Until the migration has been run, the API stores the library as JSON in `site_settings`, so the
   feature already works. The admin page shows a reminder until the table exists.
2. No new environment variables are required. The feature reuses `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Upload size

Supabase's default **global** upload limit is 50 MB per file, so MP4 uploads are capped at 50 MB.
A Full HD (1080p H.264) video of about 3–5 minutes fits.

For longer videos, you have two options:
- Upload to YouTube and paste the link in the admin panel.
- Raise the limit in Supabase (Storage → Settings → Upload file size limit), then set
  `FEATURED_VIDEO_MAX_MB` in Vercel to the same value and redeploy.

Uploads go straight from the browser to Supabase Storage through a one-time signed URL created by
the admin API, so they never pass through Vercel (no 4.5 MB function body limit). Progress is shown
during the upload. MP4 files are never stored in git.

## How it works

| Piece | File |
| --- | --- |
| Homepage section | `src/VideoOfTheDay.jsx` (used by `VideoSection` in `src/App.jsx`) |
| Player (MP4 + YouTube) | `src/FeaturedVideoPlayer.jsx` |
| Admin panel | `src/AdminFeaturedVideo.jsx` (Admin → Video of the Day) |
| Shared validation | `src/featuredVideo.js` |
| API logic | `api/_lib/featuredVideo.js` |
| Public endpoint | `GET /api/featured-video` → `api/education-posts.js?kind=featured-video` |
| Admin endpoint | `POST /api/admin-featured-video` → `api/admin-education-posts.js?scope=featured-video` |
| Tests | `scripts/featured-video.test.mjs` (part of `pnpm test:catalog`) |

The endpoints are Vercel rewrites onto existing functions, so the project stays within the
12-function limit.

**Admin security.** Every admin request needs both of these:
- the admin dashboard password (`ADMIN_PASSWORD`);
- a signed-in Supabase session for an admin email (`jd943791@gmail.com`, plus any listed in the
  optional `ADMIN_EMAILS`).

**Publishing.**
- Publishing a video unpublishes every other video.
- Earlier videos stay in the library and in Storage until they are deleted.
- *Remove from homepage* unpublishes the current video. While nothing is published, the homepage
  falls back to the built-in JD Science introduction video.
- Deleting a video also removes its MP4 and thumbnail from Storage.
- Replacing a file while editing removes the old file.

**Player.**
- No autoplay.
- Native controls: play/pause, volume and fullscreen, plus a playback-speed selector.
- The custom thumbnail is shown before playback.
- The frame is responsive at 16:9.
- YouTube videos load as a click-to-play preview using `youtube-nocookie.com`.
