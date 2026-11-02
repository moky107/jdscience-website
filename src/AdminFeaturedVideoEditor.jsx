import React, { useEffect, useMemo, useRef, useState } from "react";
import FeaturedVideoPlayer from "./FeaturedVideoPlayer";
import { FeaturedVideoDetails } from "./FeaturedVideoSection";
import {
  FEATURED_THUMBNAIL_MAX_BYTES,
  FEATURED_VIDEO_DEFAULT_MAX_BYTES,
  formatBytes,
  isAllowedFeaturedThumbnailFile,
  isAllowedFeaturedVideoFile,
  normalizeResourceLink,
  parseYouTubeId,
  thumbnailContentType,
  validateFeaturedVideoInput,
  youTubeThumbnailUrl,
} from "./featuredVideo.js";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const NAVY = "#071025";
const API = "/api/admin-featured-video";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box", background: "#fff" };
const label = { display: "grid", gap: 6, fontSize: 14, fontWeight: 700, color: "#0f172a" };
const hint = { fontSize: 12.5, color: "#64748b", fontWeight: 500, lineHeight: 1.5 };
const btn = (variant = "default") => ({
  padding: "9px 13px",
  minHeight: 40,
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  ...(variant === "primary" && { border: "none", background: TEAL, color: "#fff" }),
  ...(variant === "default" && { border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" }),
  ...(variant === "warn" && { border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" }),
  ...(variant === "danger" && { border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }),
});

const EMPTY_FORM = {
  id: null,
  video_type: "mp4",
  mp4_path: "",
  mp4_preview: "",
  mp4_name: "",
  youtube_url: "",
  title: "",
  description: "",
  thumbnail_url: "",
  thumb_preview: "",
  resource_link: "",
  is_published: false,
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

/** PUTs a file straight to a Supabase signed upload URL, reporting progress. */
function uploadToSignedUrl(signedUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let detail = "";
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        detail = data.message || data.error || "";
      } catch { /* ignore */ }
      reject(new Error(detail ? `Upload failed: ${detail}` : `Upload failed (HTTP ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload. Check your connection and try again."));
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

function Badge({ live }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: live ? "#dcfce7" : "#f1f5f9", color: live ? "#166534" : "#475569", border: `1px solid ${live ? "#bbf7d0" : "#e2e8f0"}` }}>
      {live ? "● Live on homepage" : "Not published"}
    </span>
  );
}

export default function AdminFeaturedVideoEditor({ password }) {
  const [videos, setVideos] = useState([]);
  const [limits, setLimits] = useState({ maxVideoBytes: FEATURED_VIDEO_DEFAULT_MAX_BYTES, maxThumbnailBytes: FEATURED_THUMBNAIL_MAX_BYTES });
  const [backend, setBackend] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [original, setOriginal] = useState(null);
  const [deleteReplaced, setDeleteReplaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [upload, setUpload] = useState(null); // { kind, pct, name }
  const [previewId, setPreviewId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sessionUploads = useRef([]); // files uploaded in this form session but not yet saved
  const blobUrls = useRef([]);
  const formRef = useRef(null);

  async function request(payload) {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...payload }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error || "Request failed");
    return data;
  }

  function applyList(data) {
    if (Array.isArray(data?.videos)) setVideos(data.videos);
    if (data?.limits) setLimits(data.limits);
    if (data?.backend) setBackend(data.backend);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      applyList(await request({ action: "fv-list" }));
    } catch (err) {
      setError(err.message || "Failed to load featured videos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => () => blobUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function localUrl(file) {
    const url = URL.createObjectURL(file);
    blobUrls.current.push(url);
    return url;
  }

  /** Removes uploads from this session that were never saved on a record. */
  function discardUnsavedUploads(keepPaths = []) {
    const keep = new Set(keepPaths.filter(Boolean));
    const files = sessionUploads.current.filter((file) => !keep.has(file.path));
    sessionUploads.current = [];
    if (!files.length || !password) return;
    request({ action: "fv-discard-uploads", files }).catch(() => { /* best effort */ });
  }

  function resetForm({ discard = true } = {}) {
    if (discard) discardUnsavedUploads();
    else sessionUploads.current = [];
    setForm(EMPTY_FORM);
    setOriginal(null);
    setDeleteReplaced(false);
  }

  function editVideo(video) {
    discardUnsavedUploads();
    setOriginal(video);
    setDeleteReplaced(false);
    setForm({
      ...EMPTY_FORM,
      id: video.id,
      video_type: video.video_type,
      mp4_path: video.video_type === "mp4" ? video.video_url : "",
      mp4_preview: video.video_type === "mp4" ? video.video_src : "",
      youtube_url: video.video_type === "youtube" ? video.video_url : "",
      title: video.title || "",
      description: video.description || "",
      thumbnail_url: video.thumbnail_url || "",
      thumb_preview: video.has_custom_thumbnail ? video.thumbnail_src : "",
      resource_link: video.resource_link || "",
      is_published: Boolean(video.is_published),
    });
    setMessage(`Editing “${video.title}”.`);
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function uploadFile(kind, file) {
    if (!file) return;
    setError("");
    setMessage("");
    const isVideo = kind === "video";
    const maxBytes = isVideo ? limits.maxVideoBytes : limits.maxThumbnailBytes;
    const allowed = isVideo ? isAllowedFeaturedVideoFile(file) : isAllowedFeaturedThumbnailFile(file);
    if (!allowed) {
      setError(isVideo ? "Choose an MP4 video file (.mp4)." : "Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > maxBytes) {
      setError(`${file.name} is ${formatBytes(file.size)}. The maximum is ${formatBytes(maxBytes)}${isVideo ? " — for longer videos, upload to YouTube and paste the link instead." : "."}`);
      return;
    }
    setUpload({ kind, pct: 0, name: file.name });
    try {
      const prepared = await request({
        action: "fv-prepare-upload",
        kind,
        filename: file.name,
        contentType: isVideo ? "video/mp4" : thumbnailContentType(file),
        fileSize: file.size,
      });
      await uploadToSignedUrl(prepared.signedUrl, file, (pct) => setUpload({ kind, pct, name: file.name }));
      sessionUploads.current.push({ kind, path: prepared.path });
      const preview = localUrl(file);
      setForm((current) => (isVideo
        ? { ...current, mp4_path: prepared.path, mp4_preview: preview, mp4_name: file.name }
        : { ...current, thumbnail_url: prepared.path, thumb_preview: preview }));
      setMessage(`${isVideo ? "Video" : "Thumbnail"} uploaded. Check the preview, then save or publish.`);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUpload(null);
    }
  }

  const payload = useMemo(() => ({
    id: form.id,
    title: form.title,
    description: form.description,
    video_type: form.video_type,
    video_url: form.video_type === "mp4" ? form.mp4_path : form.youtube_url,
    thumbnail_url: form.thumbnail_url,
    resource_link: form.resource_link,
  }), [form]);

  const youtubeId = form.video_type === "youtube" ? parseYouTubeId(form.youtube_url) : null;

  const previewVideo = useMemo(() => {
    const base = {
      title: form.title.trim() || "Untitled video",
      description: form.description.trim(),
      resource_link: normalizeResourceLink(form.resource_link) || "",
    };
    if (form.video_type === "youtube") {
      return youtubeId ? { ...base, video_type: "youtube", youtube_id: youtubeId, thumbnail_src: form.thumb_preview || youTubeThumbnailUrl(youtubeId) } : null;
    }
    return form.mp4_preview ? { ...base, video_type: "mp4", video_src: form.mp4_preview, thumbnail_src: form.thumb_preview } : null;
  }, [form, youtubeId]);

  const replacedFiles = useMemo(() => {
    if (!original) return [];
    const files = [];
    if (original.video_type === "mp4" && original.video_url && (form.video_type !== "mp4" || form.mp4_path !== original.video_url)) files.push("video file");
    if (original.thumbnail_url && form.thumbnail_url !== original.thumbnail_url) files.push("thumbnail image");
    return files;
  }, [original, form]);

  async function save(publish) {
    setError("");
    setMessage("");
    if (upload) {
      setError("Wait for the upload to finish first.");
      return;
    }
    const parsed = validateFeaturedVideoInput(payload);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setSaving(true);
    try {
      const data = await request({ action: "fv-save", video: payload, publish, deleteReplacedFiles: deleteReplaced && replacedFiles.length > 0 });
      applyList(data);
      discardUnsavedUploads([data.video?.video_url, data.video?.thumbnail_url]);
      resetForm({ discard: false });
      setMessage(publish
        ? `“${data.video?.title}” is now the Video of the Day on the homepage.`
        : `“${data.video?.title}” saved${data.video?.is_published ? " (still live on the homepage)" : " to the video library (not published)"}.`);
    } catch (err) {
      setError(err.message || "Failed to save the video.");
    } finally {
      setSaving(false);
    }
  }

  async function rowAction(video, action) {
    setError("");
    setMessage("");
    if (action === "fv-delete") {
      const ok = window.confirm(`Permanently delete “${video.title}”?\n\nThis removes it from the video library and deletes its uploaded video and thumbnail files from storage. This cannot be undone.`);
      if (!ok) return;
    }
    if (action === "fv-unpublish" && !window.confirm(`Remove “${video.title}” from the homepage? It stays in the video library and can be published again at any time.`)) return;
    setBusyId(video.id);
    try {
      const data = await request({ action, id: video.id, confirm: action === "fv-delete" ? true : undefined });
      applyList(data);
      if (action === "fv-delete" && form.id === video.id) resetForm({ discard: false });
      if (action === "fv-publish") setMessage(`“${video.title}” is now the Video of the Day.`);
      if (action === "fv-unpublish") setMessage(`“${video.title}” was removed from the homepage. It is still in the library.`);
      if (action === "fv-delete") setMessage(`“${video.title}” was permanently deleted${data.removedFiles?.length ? ` (${data.removedFiles.length} file${data.removedFiles.length === 1 ? "" : "s"} removed from storage)` : ""}.`);
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  }

  const live = videos.find((video) => video.is_published) || null;
  const busy = saving || Boolean(upload);
  const tab = (type, text) => (
    <button
      type="button"
      onClick={() => setField("video_type", type)}
      aria-pressed={form.video_type === type}
      style={{ flex: 1, padding: "10px 12px", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: 14, background: form.video_type === type ? "#fff" : "transparent", color: form.video_type === type ? TEAL_DARK : "#475569", boxShadow: form.video_type === type ? "0 1px 4px rgba(15,23,42,.12)" : "none" }}
    >
      {text}
    </button>
  );
  const progress = (kind) => upload?.kind === kind && (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ width: `${upload.pct}%`, height: "100%", background: TEAL, transition: "width .2s" }} />
      </div>
      <div style={hint}>Uploading {upload.name}… {upload.pct}%</div>
    </div>
  );

  return (
    <div id="admin-featured-video" style={{ marginTop: 20, background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, color: "#0f172a" }}>Featured Video Management</div>
        <button type="button" onClick={load} disabled={loading} style={btn()}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 16, minWidth: 0 }}>
        <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          The published video appears in the homepage section “Video of the Day”. Only one video is live at a time — publishing a video replaces the current one, which stays in the library below.
        </div>

        {backend === "settings" && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", borderRadius: 12, padding: 12, fontSize: 13.5, lineHeight: 1.6 }}>
            Videos are currently saved in site settings. To move them into the dedicated <b>featured_videos</b> table, run <b>supabase/migrations/20261102_featured_videos.sql</b> once in the Supabase SQL editor — existing videos are copied across automatically. Everything works either way.
          </div>
        )}
        {error && <div role="alert" style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 14 }}>{error}</div>}
        {message && <div role="status" style={{ padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 14 }}>{message}</div>}

        <div style={{ borderRadius: 12, padding: 14, background: live ? "#f0fdfa" : "#f8fafc", border: `1px solid ${live ? "#99f6e4" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: live ? TEAL_DARK : "#64748b" }}>Currently on the homepage</div>
            <div style={{ fontWeight: 800, color: "#0f172a", marginTop: 4, overflowWrap: "anywhere" }}>
              {live ? live.title : "No video published — visitors see a “coming soon” message."}
            </div>
          </div>
          {live && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => editVideo(live)} style={btn()}>Edit / replace</button>
              <button type="button" disabled={busyId === live.id} onClick={() => rowAction(live, "fv-unpublish")} style={btn("warn")}>Remove from homepage</button>
            </div>
          )}
        </div>

        <div ref={formRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 16, alignItems: "start" }}>
          <form onSubmit={(e) => { e.preventDefault(); save(true); }} style={{ display: "grid", gap: 14, background: "#f8fafc", borderRadius: 12, padding: 14, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: TEAL_DARK }}>{form.id ? "Edit featured video" : "Add a new featured video"}</div>

            <div style={{ display: "flex", gap: 4, padding: 4, background: "#e2e8f0", borderRadius: 10 }} role="group" aria-label="Video source">
              {tab("mp4", "Upload MP4")}
              {tab("youtube", "YouTube link")}
            </div>

            {form.video_type === "mp4" ? (
              <div style={label}>
                MP4 video file
                <input type="file" accept="video/mp4,.mp4" disabled={busy} onChange={(e) => { uploadFile("video", e.target.files?.[0]); e.target.value = ""; }} style={{ ...inp, padding: "9px 8px" }} />
                <span style={hint}>MP4 (H.264/AAC) up to {formatBytes(limits.maxVideoBytes)}. 1920×1080 (Full HD) recommended. For longer videos, upload to YouTube and use the YouTube link option.</span>
                {progress("video")}
                {form.mp4_path && !upload && (
                  <span style={{ ...hint, color: "#166534", overflowWrap: "anywhere" }}>✓ {form.mp4_name || form.mp4_path.split("/").pop()}</span>
                )}
              </div>
            ) : (
              <label style={label}>
                YouTube video URL
                <input placeholder="https://www.youtube.com/watch?v=…" value={form.youtube_url} onChange={(e) => setField("youtube_url", e.target.value)} style={inp} />
                {form.youtube_url && (
                  <span style={{ ...hint, color: youtubeId ? "#166534" : "#b91c1c" }}>
                    {youtubeId ? `✓ YouTube video ${youtubeId}` : "That doesn’t look like a YouTube video link."}
                  </span>
                )}
              </label>
            )}

            <label style={label}>
              Video title
              <input placeholder="e.g. Balancing chemical equations in 5 minutes" value={form.title} maxLength={200} onChange={(e) => setField("title", e.target.value)} style={inp} />
            </label>

            <label style={label}>
              Short description
              <textarea rows={4} placeholder="What will students learn from this video?" value={form.description} maxLength={5000} onChange={(e) => setField("description", e.target.value)} style={{ ...inp, resize: "vertical" }} />
            </label>

            <div style={label}>
              Custom thumbnail <span style={{ fontWeight: 500, color: "#64748b" }}>(shown before playback)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => { uploadFile("thumbnail", e.target.files?.[0]); e.target.value = ""; }} style={{ ...inp, padding: "9px 8px" }} />
              <span style={hint}>JPG, PNG or WebP up to {formatBytes(limits.maxThumbnailBytes)}, ideally 1920×1080 or 1280×720.{form.video_type === "youtube" ? " If none is uploaded, the YouTube thumbnail is used." : ""}</span>
              {progress("thumbnail")}
              {form.thumb_preview && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <img src={form.thumb_preview} alt="Thumbnail preview" style={{ width: 128, aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <button type="button" disabled={busy} onClick={() => setForm((c) => ({ ...c, thumbnail_url: "", thumb_preview: "" }))} style={btn("danger")}>Remove thumbnail</button>
                </div>
              )}
            </div>

            <label style={label}>
              Related resource link <span style={{ fontWeight: 500, color: "#64748b" }}>(optional)</span>
              <input placeholder="https://www.jdscience.co.uk/resources/… or /papers" value={form.resource_link} onChange={(e) => setField("resource_link", e.target.value)} style={inp} />
              {form.resource_link && normalizeResourceLink(form.resource_link) === null && (
                <span style={{ ...hint, color: "#b91c1c" }}>Use a full web address (https://…) or a site path starting with /.</span>
              )}
            </label>

            {replacedFiles.length > 0 && (
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: "#7c2d12", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 10 }}>
                <input type="checkbox" checked={deleteReplaced} onChange={(e) => setDeleteReplaced(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Permanently delete the replaced {replacedFiles.join(" and ")} from storage when saving. Leave unticked to keep the old file.</span>
              </label>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="submit" disabled={busy} style={{ ...btn("primary"), background: busy ? "#94a3b8" : TEAL }}>
                {saving ? "Saving…" : form.id && form.is_published ? "Save & keep live" : "Publish as Video of the Day"}
              </button>
              {!(form.id && form.is_published) && (
                <button type="button" disabled={busy} onClick={() => save(false)} style={btn()}>
                  {form.id ? "Save changes (not published)" : "Save as draft"}
                </button>
              )}
              {(form.id || form.title || form.mp4_path || form.youtube_url || form.thumbnail_url) && (
                <button type="button" disabled={busy} onClick={() => { resetForm(); setMessage(""); }} style={btn()}>
                  {form.id ? "Cancel edit" : "Clear form"}
                </button>
              )}
            </div>
          </form>

          <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Preview</div>
            <div style={{ background: NAVY, borderRadius: 12, padding: 16, textAlign: "center", minWidth: 0 }}>
              {previewVideo ? (
                <FeaturedVideoDetails video={previewVideo} isMobile />
              ) : (
                <div style={{ aspectRatio: "16 / 9", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: 14, border: "1px dashed rgba(255,255,255,.2)", borderRadius: 10, padding: 16 }}>
                  {form.video_type === "mp4" ? "Upload an MP4 to preview it here." : "Paste a YouTube link to preview it here."}
                </div>
              )}
            </div>
            <div style={hint}>This is how the video will look in the homepage “Video of the Day” section.</div>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>
            Video library {loading ? "· loading…" : `· ${videos.length} video${videos.length === 1 ? "" : "s"}`}
          </div>
          {!loading && videos.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>No featured videos yet. Add one above.</div>}
          <div style={{ display: "grid", gap: 10 }}>
            {videos.map((video) => (
              <div key={video.id} style={{ border: `1px solid ${video.is_published ? "#99f6e4" : "#e2e8f0"}`, borderRadius: 12, padding: 12, display: "grid", gap: 12, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 120, aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg, ${NAVY}, #0b3b3a)`, flexShrink: 0, display: "grid", placeItems: "center", color: "#5eead4" }}>
                    {video.thumbnail_src ? <img src={video.thumbnail_src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "▶"}
                  </div>
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", overflowWrap: "anywhere" }}>{video.title}</div>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 4, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span>{video.video_type === "youtube" ? "YouTube" : "MP4 upload"} · Added {formatDate(video.created_at)}</span>
                      <Badge live={video.is_published} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setPreviewId(previewId === video.id ? "" : video.id)} style={btn()}>{previewId === video.id ? "Hide preview" : "Preview"}</button>
                    <button type="button" onClick={() => editVideo(video)} style={btn()}>Edit</button>
                    {video.is_published ? (
                      <button type="button" disabled={busyId === video.id} onClick={() => rowAction(video, "fv-unpublish")} style={btn("warn")}>Remove from homepage</button>
                    ) : (
                      <button type="button" disabled={busyId === video.id} onClick={() => rowAction(video, "fv-publish")} style={btn("primary")}>Publish</button>
                    )}
                    <button type="button" disabled={busyId === video.id} onClick={() => rowAction(video, "fv-delete")} style={btn("danger")}>Delete permanently</button>
                  </div>
                </div>
                {previewId === video.id && (
                  <div style={{ background: NAVY, borderRadius: 10, padding: 12, maxWidth: 720 }}>
                    <FeaturedVideoPlayer video={video} isMobile />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
