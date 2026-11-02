import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL,
  FEATURED_VIDEO_SECTION_SUBTITLE,
  FEATURED_VIDEO_SECTION_TITLE,
  formatBytes,
  isMp4Upload,
  normalizeResourceUrl,
  parseYouTubeId,
  thumbnailContentType,
  toPublicFeaturedVideo,
  validateFeaturedVideoInput,
  youtubeEmbedUrl,
} from '../src/featuredVideo.js';
import {
  FEATURED_THUMBNAIL_BUCKET,
  FEATURED_VIDEO_BUCKET,
  buildFeaturedStoragePath,
  featuredVideoAdminEmails,
  handleFeaturedVideoAdminRequest,
  handleFeaturedVideoPublicRequest,
  isMissingFeaturedTable,
  isSafeStoragePath,
  validateUploadRequest,
  verifyFeaturedVideoAdmin,
  wantsFeaturedVideoAdminRequest,
  wantsFeaturedVideoPublicRequest,
} from '../api/_lib/featuredVideo.js';

/* ----------------------------- copy & constants ----------------------------- */
assert.equal(FEATURED_VIDEO_SECTION_TITLE, 'Video of the Day');
assert.equal(
  FEATURED_VIDEO_SECTION_SUBTITLE,
  'Watch our featured educational video and strengthen your understanding of key scientific concepts and examination questions.',
);
assert.equal(FEATURED_VIDEO_BUCKET, 'featured-videos');
assert.equal(FEATURED_THUMBNAIL_BUCKET, 'featured-thumbnails');

/* --------------------------------- YouTube --------------------------------- */
const ID = 'dQw4w9WgXcQ';
for (const link of [
  ID,
  `https://www.youtube.com/watch?v=${ID}`,
  `https://youtube.com/watch?v=${ID}&t=42s&list=PL123`,
  `https://m.youtube.com/watch?v=${ID}`,
  `https://youtu.be/${ID}?si=abc`,
  `youtu.be/${ID}`,
  `https://www.youtube.com/shorts/${ID}`,
  `https://www.youtube.com/embed/${ID}`,
  `https://www.youtube-nocookie.com/embed/${ID}?rel=0`,
  `https://www.youtube.com/live/${ID}`,
  `www.youtube.com/watch?v=${ID}`,
]) {
  assert.equal(parseYouTubeId(link), ID, `should parse ${link}`);
}
for (const bad of ['', null, 'hello world', 'https://vimeo.com/12345', `https://example.com/watch?v=${ID}`, 'https://youtu.be/short']) {
  assert.equal(parseYouTubeId(bad), null, `should reject ${bad}`);
}
assert.ok(!youtubeEmbedUrl(ID).includes('autoplay'), 'embed must not autoplay before a click');
assert.match(youtubeEmbedUrl(ID, { autoplay: true }), /autoplay=1/);
assert.match(youtubeEmbedUrl(ID), /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);

/* ------------------------------ resource links ------------------------------ */
assert.deepEqual(normalizeResourceUrl(''), { ok: true, url: '' });
assert.deepEqual(normalizeResourceUrl('/papers'), { ok: true, url: '/papers' });
assert.deepEqual(normalizeResourceUrl('www.jdscience.co.uk/papers'), { ok: true, url: 'https://www.jdscience.co.uk/papers' });
assert.equal(normalizeResourceUrl('https://jdscience.co.uk').ok, true);
assert.equal(normalizeResourceUrl('//evil.example').ok, false);
assert.equal(normalizeResourceUrl('javascript:alert(1)').ok, false);

/* ------------------------------- input checks ------------------------------- */
const yt = validateFeaturedVideoInput({
  title: '  Moles   explained ',
  description: 'Line one\r\n\r\n\r\nLine two',
  video_type: 'youtube',
  youtube_url: `https://youtu.be/${ID}`,
  resource_url: '/papers',
});
assert.equal(yt.ok, true);
assert.equal(yt.fields.title, 'Moles explained');
assert.equal(yt.fields.description, 'Line one\n\nLine two');
assert.equal(yt.fields.video_url, `https://www.youtube.com/watch?v=${ID}`);
assert.equal(yt.fields.resource_label, FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL);
assert.equal(yt.youtubeId, ID);

assert.equal(validateFeaturedVideoInput({ title: '', video_type: 'youtube', youtube_url: ID }).ok, false);
assert.equal(validateFeaturedVideoInput({ title: 'x', video_type: 'vimeo' }).ok, false);
assert.equal(validateFeaturedVideoInput({ title: 'x', video_type: 'youtube', youtube_url: 'nope' }).ok, false);
assert.equal(validateFeaturedVideoInput({ title: 'x', video_type: 'mp4' }).ok, false, 'MP4 needs an uploaded file');
assert.equal(validateFeaturedVideoInput({ title: 'x', video_type: 'mp4', video_url: 'https://cdn.example/v.mp4', thumbnail_url: 'file:///x' }).ok, false);
const mp4 = validateFeaturedVideoInput({ title: 'x', video_type: 'mp4', video_url: 'https://cdn.example/v.mp4' });
assert.equal(mp4.ok, true);
assert.equal(mp4.fields.resource_url, null);
assert.equal(mp4.fields.resource_label, null);

/* --------------------------------- uploads --------------------------------- */
assert.equal(isMp4Upload({ fileName: 'lesson.mp4', contentType: 'video/mp4' }), true);
assert.equal(isMp4Upload({ fileName: 'lesson.MP4', contentType: '' }), true);
assert.equal(isMp4Upload({ fileName: 'lesson.mov', contentType: 'video/quicktime' }), false);
assert.equal(isMp4Upload({ fileName: 'lesson.mp4', contentType: 'video/quicktime' }), false);
assert.equal(thumbnailContentType({ fileName: 'a.JPEG', contentType: '' }), 'image/jpeg');
assert.equal(thumbnailContentType({ fileName: 'a.gif', contentType: 'image/gif' }), '');
assert.equal(formatBytes(50 * 1024 * 1024), '50 MB');

const MB = 1024 * 1024;
assert.equal(validateUploadRequest({ kind: 'video', file_name: 'a.mp4', content_type: 'video/mp4', file_size: 10 * MB }, 50 * MB).ok, true);
const big = validateUploadRequest({ kind: 'video', file_name: 'a.mp4', content_type: 'video/mp4', file_size: 51 * MB }, 50 * MB);
assert.equal(big.ok, false);
assert.match(big.error, /upload limit is 50 MB/);
assert.equal(validateUploadRequest({ kind: 'video', file_name: 'a.avi', content_type: 'video/x-msvideo', file_size: 10 }).ok, false);
assert.equal(validateUploadRequest({ kind: 'video', file_name: 'a.mp4', content_type: 'video/mp4', file_size: 0 }).ok, false);
assert.equal(validateUploadRequest({ kind: 'other', file_name: 'a.mp4', file_size: 10 }).ok, false);
const thumb = validateUploadRequest({ kind: 'thumbnail', file_name: 'cover.png', content_type: 'image/png', file_size: 2 * MB });
assert.equal(thumb.ok, true);
assert.equal(thumb.bucket, FEATURED_THUMBNAIL_BUCKET);
assert.equal(validateUploadRequest({ kind: 'thumbnail', file_name: 'cover.png', content_type: 'image/png', file_size: 11 * MB }).ok, false);

const now = new Date(Date.UTC(2026, 10, 2, 9, 30));
const videoPath = buildFeaturedStoragePath('video', 'My Lesson (Final).MP4', now);
assert.match(videoPath, /^videos\/2026\/11\/\d+-[0-9a-f]{8}-my-lesson-final\.mp4$/);
assert.equal(isSafeStoragePath(videoPath, 'video'), true);
assert.equal(isSafeStoragePath(videoPath, 'thumbnail'), false);
assert.match(buildFeaturedStoragePath('thumbnail', 'cover.JPEG', now), /^thumbnails\/2026\/11\/.+-cover\.jpg$/);
assert.match(buildFeaturedStoragePath('thumbnail', 'cover', now, 'image/webp'), /\.webp$/);
for (const bad of ['', 'videos/../secret.mp4', 'other/x.mp4', '/videos/x.mp4', 'videos//x.mp4', 'videos/X.mp4']) {
  assert.equal(isSafeStoragePath(bad), false, `unsafe path accepted: ${bad}`);
}

/* ------------------------------ public payload ------------------------------ */
const publicYt = toPublicFeaturedVideo({
  id: '1',
  title: 'T',
  video_type: 'youtube',
  video_url: `https://www.youtube.com/watch?v=${ID}`,
  is_published: true,
  video_storage_path: null,
});
assert.equal(publicYt.youtube_id, ID);
assert.equal(publicYt.poster_url, `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
assert.equal(publicYt.resource_label, '');
assert.ok(!('video_storage_path' in publicYt), 'public payload must not leak storage internals');
const customThumb = new URL(`storage/v1/object/public/${FEATURED_THUMBNAIL_BUCKET}/thumbnails/cover-image`, `https:${'//'}project.supabase.co/`).href;
assert.equal(toPublicFeaturedVideo({ id: '2', title: 'M', video_type: 'mp4', video_url: 'https://project.supabase.co/v.mp4', thumbnail_url: customThumb }).poster_url, customThumb);
assert.equal(toPublicFeaturedVideo(null), null);

/* -------------------------------- dispatchers ------------------------------- */
assert.equal(wantsFeaturedVideoPublicRequest({ query: { kind: 'featured-video' }, url: '/api/education-posts?kind=featured-video' }), true);
assert.equal(wantsFeaturedVideoPublicRequest({ query: {}, url: '/api/featured-video' }), true);
assert.equal(wantsFeaturedVideoPublicRequest({ query: {}, url: '/api/education-posts' }), false);
assert.equal(wantsFeaturedVideoAdminRequest({ query: { scope: 'featured-video' }, url: '/api/admin-education-posts' }, {}), true);
assert.equal(wantsFeaturedVideoAdminRequest({ query: {}, url: '/api/admin-education-posts' }, { action: 'fv-publish' }), true);
assert.equal(wantsFeaturedVideoAdminRequest({ query: {}, url: '/api/admin-education-posts' }, { action: 'list' }), false);

assert.equal(isMissingFeaturedTable({ code: 'PGRST205', message: "Could not find the table 'public.featured_videos' in the schema cache" }), true);
assert.equal(isMissingFeaturedTable({ code: 'PGRST205', message: "Could not find the table 'public.other'" }), false);
assert.ok(featuredVideoAdminEmails().includes('jd943791@gmail.com'));

/* ------------------------------ auth guard paths ----------------------------- */
function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}
const fakeSupabase = (email) => ({
  auth: { getUser: async () => (email ? { data: { user: { email } }, error: null } : { data: null, error: { message: 'bad jwt' } }) },
});

assert.equal((await verifyFeaturedVideoAdmin(fakeSupabase('jd943791@gmail.com'), { headers: {} })).status, 401, 'no token → 401');
assert.equal((await verifyFeaturedVideoAdmin(fakeSupabase(null), { headers: { authorization: 'Bearer x' } })).status, 401);
assert.equal((await verifyFeaturedVideoAdmin(fakeSupabase('student@example.com'), { headers: { authorization: 'Bearer x' } })).status, 403);
assert.equal((await verifyFeaturedVideoAdmin(fakeSupabase('JD943791@gmail.com'), { headers: { authorization: 'Bearer x' } })).ok, true);

const denied = mockRes();
await handleFeaturedVideoAdminRequest({ headers: {} }, denied, { action: 'fv-list' }, { supabase: fakeSupabase('jd943791@gmail.com') });
assert.equal(denied.statusCode, 401, 'admin API must reject requests without an admin session');

const wrongMethod = mockRes();
await handleFeaturedVideoPublicRequest({ method: 'POST' }, wrongMethod, { supabase: {} });
assert.equal(wrongMethod.statusCode, 405);

/* ------------------------------- wiring checks ------------------------------ */
const appSource = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(appSource, /import VideoOfTheDay from "\.\/VideoOfTheDay"/);
assert.match(appSource, /<AdminFeaturedVideo /);
assert.doesNotMatch(appSource, /import HomepageIntroVideo/, 'old "How JD Science Works" section must be replaced');

const playerSource = fs.readFileSync(new URL('../src/FeaturedVideoPlayer.jsx', import.meta.url), 'utf8');
assert.doesNotMatch(playerSource, /<video[^>]*\sautoPlay/, 'MP4 player must never autoplay');
assert.match(playerSource, /controls/);
assert.match(playerSource, /playbackRate/);

const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const rewrites = (vercel.rewrites || []).map((r) => `${r.source}=>${r.destination}`);
assert.ok(rewrites.includes('/api/featured-video=>/api/education-posts?kind=featured-video'));
assert.ok(rewrites.includes('/api/admin-featured-video=>/api/admin-education-posts?scope=featured-video'));

const migration = fs.readFileSync(new URL('../supabase/migrations/20261102_featured_videos.sql', import.meta.url), 'utf8');
assert.match(migration, /create table if not exists public\.featured_videos/i);
assert.match(migration, /featured_videos_single_published/);
assert.match(migration, /publish_featured_video/);

console.log('featured-video.test.mjs: ok');
