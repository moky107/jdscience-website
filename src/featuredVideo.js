/**
 * Video of the Day — pure helpers shared by the homepage, the admin dashboard
 * and the serverless API (api/_lib/featuredVideo.js). No browser-only APIs here.
 */

export const FEATURED_VIDEO_SECTION_TITLE = "Video of the Day";
export const FEATURED_VIDEO_SECTION_SUBTITLE =
  "Watch our featured educational video and strengthen your understanding of key scientific concepts and examination questions.";

export const FEATURED_VIDEO_PUBLIC_API = "/api/featured-video";
export const FEATURED_VIDEO_ADMIN_API = "/api/admin-featured-video";

export const FEATURED_VIDEO_TYPES = ["mp4", "youtube"];
export const FEATURED_VIDEO_DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
export const FEATURED_THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
export const FEATURED_VIDEO_TITLE_MAX = 160;
export const FEATURED_VIDEO_DESCRIPTION_MAX = 600;
export const FEATURED_VIDEO_RESOURCE_LABEL_MAX = 80;
export const FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL = "Explore related JD Science resources";
export const FEATURED_VIDEO_PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const THUMBNAIL_CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function clean(value, max) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return max ? text.slice(0, max) : text;
}

function cleanMultiline(value, max) {
  const text = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return max ? text.slice(0, max) : text;
}

/** Extracts the 11-character video id from any common YouTube link (or a bare id). */
export function parseYouTubeId(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  let candidate = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] || null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (["embed", "shorts", "live", "v", "e"].includes(parts[0])) {
      candidate = parts[1] || null;
    } else if (url.searchParams.get("v")) {
      candidate = url.searchParams.get("v");
    }
  }

  return candidate && YOUTUBE_ID_RE.test(candidate) ? candidate : null;
}

export function youtubeWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-enhanced embed. `autoplay` is only used after the visitor clicks play. */
export function youtubeEmbedUrl(id, { autoplay = false } = {}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbnailUrl(id, quality = "hqdefault") {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Accepts "" (no link), a site-relative path ("/papers") or an absolute http(s) URL. */
export function normalizeResourceUrl(value) {
  const text = clean(value, 500);
  if (!text) return { ok: true, url: "" };
  if (text.startsWith("/") && !text.startsWith("//")) return { ok: true, url: text };
  if (/^www\./i.test(text) && isHttpUrl(`https://${text}`)) return { ok: true, url: `https://${text}` };
  if (isHttpUrl(text)) return { ok: true, url: text };
  return { ok: false, error: "The resources link must start with / (a JD Science page) or https://." };
}

export function fileExtension(name) {
  const ext = String(name || "").split(".").pop()?.toLowerCase() || "";
  return /^[a-z0-9]{1,8}$/.test(ext) && String(name || "").includes(".") ? ext : "";
}

export function isMp4Upload({ fileName, contentType }) {
  const type = String(contentType || "").toLowerCase();
  const ext = fileExtension(fileName);
  if (type && type !== "video/mp4" && type !== "application/octet-stream") return false;
  return ext === "mp4" || type === "video/mp4";
}

export function thumbnailContentType({ fileName, contentType }) {
  const type = String(contentType || "").toLowerCase();
  if (Object.values(THUMBNAIL_CONTENT_TYPES).includes(type)) return type;
  return THUMBNAIL_CONTENT_TYPES[fileExtension(fileName)] || "";
}

export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/**
 * Validates the editable fields of a featured video. For MP4 videos the caller
 * (server) supplies the storage-derived `video_url`; for YouTube we canonicalise the link.
 */
export function validateFeaturedVideoInput(input = {}) {
  const title = clean(input.title, FEATURED_VIDEO_TITLE_MAX);
  const description = cleanMultiline(input.description, FEATURED_VIDEO_DESCRIPTION_MAX);
  const videoType = clean(input.video_type, 10).toLowerCase();
  const resource = normalizeResourceUrl(input.resource_url);
  const resourceLabel = clean(input.resource_label, FEATURED_VIDEO_RESOURCE_LABEL_MAX);
  const thumbnailUrl = clean(input.thumbnail_url, 2000);

  if (!title) return { ok: false, error: "Enter a video title." };
  if (!FEATURED_VIDEO_TYPES.includes(videoType)) {
    return { ok: false, error: "Choose an MP4 upload or a YouTube link." };
  }
  if (!resource.ok) return { ok: false, error: resource.error };
  if (thumbnailUrl && !isHttpUrl(thumbnailUrl)) {
    return { ok: false, error: "The thumbnail must be an uploaded image." };
  }

  let videoUrl = clean(input.video_url, 2000);
  let youtubeId = null;
  if (videoType === "youtube") {
    youtubeId = parseYouTubeId(input.youtube_url || videoUrl);
    if (!youtubeId) {
      return { ok: false, error: "Paste a valid YouTube link, e.g. https://www.youtube.com/watch?v=…" };
    }
    videoUrl = youtubeWatchUrl(youtubeId);
  } else if (!videoUrl || !isHttpUrl(videoUrl)) {
    return { ok: false, error: "Upload an MP4 video before saving." };
  }

  return {
    ok: true,
    fields: {
      title,
      description: description || null,
      video_type: videoType,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl || null,
      resource_url: resource.url || null,
      resource_label: resource.url ? (resourceLabel || FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL) : null,
    },
    youtubeId,
  };
}

/** Poster shown before playback: custom thumbnail first, then YouTube's own artwork. */
export function featuredVideoPosterUrl(video) {
  if (!video) return "";
  if (video.thumbnail_url) return video.thumbnail_url;
  if (video.video_type === "youtube") {
    const id = video.youtube_id || parseYouTubeId(video.video_url);
    if (id) return youtubeThumbnailUrl(id);
  }
  return "";
}

/** Shape returned by the public API and consumed by the homepage player. */
export function toPublicFeaturedVideo(row) {
  if (!row) return null;
  const youtubeId = row.video_type === "youtube" ? parseYouTubeId(row.video_url) : null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    video_type: row.video_type,
    video_url: row.video_url,
    youtube_id: youtubeId,
    thumbnail_url: row.thumbnail_url || "",
    poster_url: featuredVideoPosterUrl({ ...row, youtube_id: youtubeId }),
    resource_url: row.resource_url || "",
    resource_label: row.resource_url ? (row.resource_label || FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL) : "",
    published_at: row.published_at || null,
    updated_at: row.updated_at || null,
  };
}
