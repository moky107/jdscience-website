/* Shared (browser + /api) helpers for the homepage "Video of the Day" feature. */

export const FEATURED_VIDEO_BUCKET = "featured-videos";
export const FEATURED_THUMBNAIL_BUCKET = "featured-thumbnails";
/** Supabase Free plan single-file cap. The API reports the live bucket limit. */
export const FEATURED_VIDEO_DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
export const FEATURED_THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
export const FEATURED_VIDEO_TYPES = ["mp4", "youtube"];
export const FEATURED_THUMBNAIL_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const FEATURED_VIDEO_PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
export const FEATURED_VIDEO_SECTION_TITLE = "Video of the Day";
export const FEATURED_VIDEO_SECTION_SUBTITLE =
  "Watch our featured educational video and strengthen your understanding of key scientific concepts and examination questions.";

/**
 * Optional Vercel env FEATURED_VIDEO_MAX_MB overrides the default 50 MB cap.
 * Keep it aligned with Supabase Storage → Settings → Upload file size limit.
 */
export function featuredVideoMaxBytesFromEnv(env = typeof process !== "undefined" ? process.env : {}) {
  const mb = Number(env?.FEATURED_VIDEO_MAX_MB);
  return Number.isFinite(mb) && mb > 0 ? Math.round(mb * 1024 * 1024) : FEATURED_VIDEO_DEFAULT_MAX_BYTES;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

/** Extracts the 11-character video id from any common YouTube URL form. */
export function parseYouTubeId(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (YOUTUBE_ID.test(raw)) return raw;
  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;
  const segments = parsed.pathname.split("/").filter(Boolean);
  let candidate = null;
  if (host === "youtu.be") {
    candidate = segments[0];
  } else if (parsed.searchParams.get("v")) {
    candidate = parsed.searchParams.get("v");
  } else if (["embed", "shorts", "live", "v", "e"].includes(segments[0])) {
    candidate = segments[1];
  }
  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
}

export function youTubeWatchUrl(id) {
  return id ? `https://www.youtube.com/watch?v=${id}` : "";
}

/**
 * Standard YouTube embed. `autoplay` is only used after the visitor clicks play.
 * Uses youtube.com/embed (same host as YouTube's oEmbed) so Public/Unlisted
 * videos play for ordinary visitors without a YouTube login.
 */
export function youTubeEmbedUrl(id, { autoplay = false } = {}) {
  if (!id) return "";
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function youTubeThumbnailUrl(id, quality = "maxresdefault") {
  return id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : "";
}

export function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

/**
 * Optional "related resources" link. Accepts absolute http(s) URLs or
 * site-relative paths such as /papers or /resources/gcse/chemistry/.
 * Returns "" for empty input and null for invalid input.
 */
export function normalizeResourceLink(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.length > 2000) return null;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withScheme);
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isInternalResourceLink(link) {
  const raw = String(link || "");
  if (raw.startsWith("/") && !raw.startsWith("//")) return true;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host === "jdscience.co.uk";
  } catch {
    return false;
  }
}

function fileExtension(name) {
  return String(name || "").split(".").pop()?.toLowerCase() || "";
}

export function isAllowedFeaturedVideoFile({ name, type }) {
  const mime = String(type || "").toLowerCase();
  if (mime && mime !== "video/mp4") return false;
  return fileExtension(name) === "mp4" || mime === "video/mp4";
}

export function isAllowedFeaturedThumbnailFile({ name, type }) {
  const mime = String(type || "").toLowerCase();
  if (mime) return FEATURED_THUMBNAIL_MIME_TYPES.includes(mime);
  return ["jpg", "jpeg", "png", "webp"].includes(fileExtension(name));
}

export function thumbnailContentType({ name, type }) {
  const mime = String(type || "").toLowerCase();
  if (FEATURED_THUMBNAIL_MIME_TYPES.includes(mime)) return mime;
  const ext = fileExtension(name);
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} bytes`;
}

/** Validates the editable fields of a featured video. */
export function validateFeaturedVideoInput(input = {}) {
  const title = String(input.title || "").trim().slice(0, 200);
  const description = String(input.description || "").trim().slice(0, 5000);
  const video_type = String(input.video_type || "").trim().toLowerCase();
  const thumbnail_url = String(input.thumbnail_url || "").trim().slice(0, 1000);
  const resourceLink = normalizeResourceLink(input.resource_link);

  if (!title) return { ok: false, error: "Enter a video title." };
  if (!FEATURED_VIDEO_TYPES.includes(video_type)) {
    return { ok: false, error: "Choose an MP4 upload or a YouTube link." };
  }

  let video_url = String(input.video_url || "").trim().slice(0, 1000);
  if (video_type === "youtube") {
    const id = parseYouTubeId(video_url);
    if (!id) return { ok: false, error: "Paste a valid YouTube video link (for example https://www.youtube.com/watch?v=…)." };
    video_url = youTubeWatchUrl(id);
  } else if (!video_url) {
    return { ok: false, error: "Upload an MP4 video file first." };
  }

  if (resourceLink === null) {
    return { ok: false, error: "The resource link must be a web address (https://…) or a site path such as /papers." };
  }

  return {
    ok: true,
    fields: {
      title,
      description: description || null,
      video_type,
      video_url,
      thumbnail_url: thumbnail_url || null,
      resource_link: resourceLink || null,
    },
  };
}

/**
 * Checks whether a YouTube video can be embedded for ordinary visitors
 * (Public or Unlisted). Private / unavailable videos fail YouTube's oEmbed
 * endpoint with HTTP 401/403/404.
 */
export async function checkYouTubePublicEmbed(videoUrlOrId, fetchImpl = fetch) {
  const id = parseYouTubeId(videoUrlOrId);
  if (!id) {
    return {
      ok: false,
      embeddable: false,
      youtubeId: null,
      error: "Paste a valid YouTube video link.",
    };
  }
  const watchUrl = youTubeWatchUrl(id);
  try {
    const resp = await fetchImpl(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { headers: { Accept: "application/json" } },
    );
    if (resp.ok) {
      const data = await resp.json().catch(() => ({}));
      return {
        ok: true,
        embeddable: true,
        youtubeId: id,
        title: data?.title || "",
        author: data?.author_name || "",
      };
    }
    if (resp.status === 401 || resp.status === 403) {
      return {
        ok: false,
        embeddable: false,
        youtubeId: id,
        error:
          "This YouTube video is Private (or otherwise blocked). Visitors on jdscience.co.uk cannot watch it. In YouTube Studio set visibility to Public or Unlisted — never Private for Video of the Day.",
      };
    }
    if (resp.status === 404) {
      return {
        ok: false,
        embeddable: false,
        youtubeId: id,
        error: "That YouTube video could not be found. Check the link and try again.",
      };
    }
    return {
      ok: false,
      embeddable: false,
      youtubeId: id,
      error: `YouTube could not confirm this video is embeddable (HTTP ${resp.status}). Use a Public or Unlisted video.`,
    };
  } catch {
    return {
      ok: false,
      embeddable: false,
      youtubeId: id,
      error: "Could not reach YouTube to check this link. Check your connection and try again.",
    };
  }
}
