import assert from "node:assert/strict";
import {
  checkYouTubePublicEmbed,
  featuredVideoMaxBytesFromEnv,
  isAllowedFeaturedThumbnailFile,
  isAllowedFeaturedVideoFile,
  isInternalResourceLink,
  normalizeResourceLink,
  parseYouTubeId,
  validateFeaturedVideoInput,
  youTubeEmbedUrl,
} from "../src/featuredVideo.js";
import {
  handleFeaturedVideoAdminRequest,
  handleFeaturedVideoPublicRequest,
  wantsFeaturedVideoAdminRequest,
  wantsFeaturedVideoPublicRequest,
} from "../api/_lib/featuredVideos.js";

assert.equal(featuredVideoMaxBytesFromEnv({}), 50 * 1024 * 1024);
assert.equal(featuredVideoMaxBytesFromEnv({ FEATURED_VIDEO_MAX_MB: "100" }), 100 * 1024 * 1024);

/* ------------------------------ shared helpers ------------------------------ */

const ID = "dQw4w9WgXcQ";
{
  const ok = await checkYouTubePublicEmbed(ID, async () => ({
    ok: true,
    json: async () => ({ title: "Demo", author_name: "JDScience" }),
  }));
  assert.equal(ok.embeddable, true);
  assert.equal(ok.youtubeId, ID);
  const blocked = await checkYouTubePublicEmbed(ID, async () => ({ ok: false, status: 403, json: async () => ({}) }));
  assert.equal(blocked.embeddable, false);
  assert.match(blocked.error, /Private/i);
}
for (const url of [
  ID,
  `https://www.youtube.com/watch?v=${ID}&t=42s`,
  `https://youtu.be/${ID}?si=abc`,
  `youtube.com/shorts/${ID}`,
  `https://www.youtube.com/embed/${ID}`,
  `https://m.youtube.com/watch?v=${ID}`,
  `https://www.youtube-nocookie.com/embed/${ID}`,
]) {
  assert.equal(parseYouTubeId(url), ID, url);
}
for (const bad of ["", "https://vimeo.com/123", "https://youtube.com/watch?v=short", "not a url"]) {
  assert.equal(parseYouTubeId(bad), null, bad);
}
assert.ok(!youTubeEmbedUrl(ID).includes("autoplay"), "embed never autoplays by default");
assert.ok(youTubeEmbedUrl(ID, { autoplay: true }).includes("autoplay=1"));
assert.ok(youTubeEmbedUrl(ID).startsWith("https://www.youtube.com/embed/"));

assert.equal(normalizeResourceLink(""), "");
assert.equal(normalizeResourceLink("/papers"), "/papers");
assert.equal(normalizeResourceLink("jdscience.co.uk/shop"), "https://jdscience.co.uk/shop");
assert.equal(normalizeResourceLink("javascript:alert(1)"), null);
assert.equal(normalizeResourceLink("//evil.example"), "https://evil.example/");
assert.equal(isInternalResourceLink("/papers"), true);
assert.equal(isInternalResourceLink("https://www.jdscience.co.uk/papers"), true);
assert.equal(isInternalResourceLink("https://example.com"), false);

assert.equal(isAllowedFeaturedVideoFile({ name: "lesson.mp4", type: "video/mp4" }), true);
assert.equal(isAllowedFeaturedVideoFile({ name: "lesson.mov", type: "video/quicktime" }), false);
assert.equal(isAllowedFeaturedThumbnailFile({ name: "t.png", type: "image/png" }), true);
assert.equal(isAllowedFeaturedThumbnailFile({ name: "t.gif", type: "image/gif" }), false);

assert.equal(validateFeaturedVideoInput({ video_type: "youtube", video_url: ID }).ok, false, "title required");
assert.equal(validateFeaturedVideoInput({ title: "x", video_type: "youtube", video_url: "nope" }).ok, false);
assert.equal(validateFeaturedVideoInput({ title: "x", video_type: "mp4" }).ok, false, "mp4 needs an upload");
const yt = validateFeaturedVideoInput({ title: " Moles ", video_type: "youtube", video_url: `https://youtu.be/${ID}`, resource_link: "/papers" });
assert.equal(yt.ok, true);
assert.deepEqual(yt.fields, {
  title: "Moles",
  description: null,
  video_type: "youtube",
  video_url: `https://www.youtube.com/watch?v=${ID}`,
  thumbnail_url: null,
  resource_link: "/papers",
});

/* --------------------- API handlers with an in-memory Supabase --------------------- */

function fakeSupabase() {
  const settings = new Map();
  const removed = [];
  const query = (table) => {
    const state = { table, op: "select", filters: {}, payload: null };
    const builder = {
      select() { return builder; },
      limit() { return builder; },
      order() { return builder; },
      maybeSingle() { return builder; },
      single() { return builder; },
      eq(col, value) { state.filters[col] = value; return builder; },
      upsert(payload) { state.op = "upsert"; state.payload = payload; return builder; },
      delete() { state.op = "delete"; return builder; },
      then(resolve) {
        if (table === "featured_videos") {
          return resolve({ data: null, error: { code: "PGRST205", message: "Could not find the table 'public.featured_videos' in the schema cache" } });
        }
        if (state.op === "upsert") settings.set(state.payload.key, state.payload.value);
        if (state.op === "delete") settings.delete(state.filters.key);
        const value = settings.get(state.filters.key);
        return resolve({ data: state.op === "select" && value != null ? { value } : null, error: null });
      },
    };
    return builder;
  };
  return {
    settings,
    removed,
    from: query,
    auth: {
      getUser: async (token) => {
        if (token === "admin-token") return { data: { user: { email: "jd943791@gmail.com" } }, error: null };
        if (token === "visitor-token") return { data: { user: { email: "student@example.com" } }, error: null };
        return { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    rpc: async () => ({ data: null, error: { message: "not installed" } }),
    storage: {
      getBucket: async (id) => ({ data: { id, file_size_limit: id === "featured-videos" ? 50 * 1024 * 1024 : 10 * 1024 * 1024 }, error: null }),
      createBucket: async () => ({ data: null, error: null }),
      from: (bucket) => ({
        getPublicUrl: (path) => ({ data: { publicUrl: `https://cdn.test/${bucket}/${path}` } }),
        createSignedUploadUrl: async (path) => ({ data: { signedUrl: `https://cdn.test/upload/${bucket}/${path}?token=t` }, error: null }),
        remove: async (paths) => {
          removed.push(...paths.map((p) => `${bucket}/${p}`));
          return { data: paths.map((name) => ({ name })), error: null };
        },
      }),
    },
  };
}

function fakeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function admin(sb, body, { token = "admin-token" } = {}) {
  const res = fakeRes();
  await handleFeaturedVideoAdminRequest({
    method: "POST",
    query: { scope: "featured-video" },
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }, res, body, sb);
  return res;
}

async function publicGet(sb) {
  const res = fakeRes();
  await handleFeaturedVideoPublicRequest({ method: "GET", query: { kind: "featured-video" } }, res, sb);
  return res;
}

assert.equal(wantsFeaturedVideoPublicRequest({ query: { kind: "featured-video" }, url: "/api/education-posts" }), true);
assert.equal(wantsFeaturedVideoPublicRequest({ query: {}, url: "/api/education-posts" }), false);
assert.equal(wantsFeaturedVideoAdminRequest({ query: {}, url: "/api/admin-education-posts" }, { action: "fv-list" }), true);
assert.equal(wantsFeaturedVideoAdminRequest({ query: {}, url: "/api/admin-education-posts" }, { action: "list" }), false);

const sb = fakeSupabase();
let res = await publicGet(sb);
assert.equal(res.statusCode, 200);
assert.deepEqual(res.body, { ok: true, video: null }, "no published video yet");

res = await admin(sb, { action: "fv-list" }, { token: "" });
assert.equal(res.statusCode, 401, "admin actions require a signed-in admin session");
res = await admin(sb, { action: "fv-list" }, { token: "visitor-token" });
assert.equal(res.statusCode, 403, "non-admin sessions are rejected");

res = await admin(sb, { action: "fv-list" });
assert.equal(res.statusCode, 200);
assert.equal(res.body.backend, "settings");
assert.deepEqual(res.body.videos, []);

res = await admin(sb, { action: "fv-prepare-upload", kind: "video", filename: "Moles Lesson.mp4", contentType: "video/mp4", fileSize: 1000 });
assert.equal(res.statusCode, 200);
assert.match(res.body.path, /^videos\/\d+-moles-lesson\.mp4$/);
const videoPath = res.body.path;
res = await admin(sb, { action: "fv-prepare-upload", kind: "video", filename: "big.mp4", contentType: "video/mp4", fileSize: 60 * 1024 * 1024 });
assert.equal(res.statusCode, 400, "over the bucket limit");
res = await admin(sb, { action: "fv-prepare-upload", kind: "thumbnail", filename: "x.gif", contentType: "image/gif", fileSize: 10 });
assert.equal(res.statusCode, 400, "gif thumbnails rejected");
res = await admin(sb, { action: "fv-prepare-upload", kind: "thumbnail", filename: "Cover.png", contentType: "image/png", fileSize: 10 });
const thumbPath = res.body.path;
assert.match(thumbPath, /^thumbnails\/\d+-cover\.png$/);

res = await admin(sb, { action: "fv-save", video: { title: "Bad", video_type: "mp4", video_url: "../secret.mp4" } });
assert.equal(res.statusCode, 400, "unmanaged storage paths rejected");

res = await admin(sb, { action: "fv-save", publish: true, video: { title: "Moles", video_type: "mp4", video_url: videoPath, thumbnail_url: thumbPath } });
assert.equal(res.statusCode, 200);
const mp4Id = res.body.video.id;
assert.equal(res.body.video.is_published, true);

res = await publicGet(sb);
assert.equal(res.body.video.title, "Moles");
assert.equal(res.body.video.video_src, `https://cdn.test/featured-videos/${videoPath}`);
assert.equal(res.body.video.thumbnail_src, `https://cdn.test/featured-thumbnails/${thumbPath}`);
assert.equal(res.body.video.video_url, undefined, "public payload hides admin fields");

res = await admin(sb, { action: "fv-save", video: { title: "Bonding", video_type: "youtube", video_url: `https://youtu.be/${ID}` } });
const ytId = res.body.video.id;
assert.equal(res.body.videos.length, 2);
assert.equal(res.body.video.is_published, false, "drafts stay unpublished");

res = await admin(sb, { action: "fv-publish", id: ytId });
assert.equal(res.body.videos.filter((v) => v.is_published).length, 1, "only one published video");
res = await publicGet(sb);
assert.equal(res.body.video.youtube_id, ID);
assert.equal(res.body.video.thumbnail_src, `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`);

res = await admin(sb, { action: "fv-unpublish", id: ytId });
res = await publicGet(sb);
assert.equal(res.body.video, null, "API returns null when unpublished; homepage falls back to the intro video");

res = await admin(sb, { action: "fv-delete", id: mp4Id });
assert.equal(res.statusCode, 400, "permanent delete requires explicit confirmation");
assert.deepEqual(sb.removed, []);
res = await admin(sb, { action: "fv-delete", id: mp4Id, confirm: true });
assert.equal(res.statusCode, 200);
assert.deepEqual(sb.removed.sort(), [`featured-thumbnails/${thumbPath}`, `featured-videos/${videoPath}`].sort());
assert.equal(res.body.videos.length, 1, "previous videos remain in the library");

res = await admin(sb, { action: "fv-delete", id: mp4Id, confirm: true });
assert.equal(res.statusCode, 404);

console.log("featured-video tests passed");
