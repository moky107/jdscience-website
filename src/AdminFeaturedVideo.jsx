import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { VideoOfTheDayContent, VideoOfTheDayHeading } from "./VideoOfTheDay.jsx";
import {
  FEATURED_THUMBNAIL_MAX_BYTES,
  FEATURED_VIDEO_ADMIN_API,
  FEATURED_VIDEO_DEFAULT_MAX_BYTES,
  FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL,
  FEATURED_VIDEO_DESCRIPTION_MAX,
  FEATURED_VIDEO_RESOURCE_LABEL_MAX,
  FEATURED_VIDEO_TITLE_MAX,
  featuredVideoPosterUrl,
  formatBytes,
  isMp4Upload,
  normalizeResourceUrl,
  parseYouTubeId,
  thumbnailContentType,
  youtubeWatchUrl,
} from "./featuredVideo.js";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const MIGRATION_FILE = "supabase/migrations/20261102_featured_videos.sql";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box", background: "#fff" };
const card = { background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "hidden" };
const cardHeader = { padding: "12px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#0f172a" };
const label = { display: "grid", gap: 6, fontSize: 14, fontWeight: 700, color: "#0f172a" };
const hint = { color: "#64748b", fontSize: 13, fontWeight: 400, lineHeight: 1.5 };

function btn(kind = "default", disabled = false) {
  const base = { minHeight: 40, padding: "9px 14px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1 };
  if (kind === "primary") return { ...base, border: "none", background: TEAL, color: "#fff" };
  if (kind === "danger") return { ...base, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c" };
  if (kind === "warn") return { ...base, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" };
  return { ...base, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" };
}

const EMPTY_FORM = {
  id: null,
  video_type: "mp4",
  title: "",
  description: "",
  youtube_url: "",
  video_storage_path: "",
  video_url: "",
  video_file_name: "",
  thumbnail_storage_path: "",
  thumbnail_url: "",
  resource_url: "",
  resource_label: "",
};

function formFromVideo(video) {
  return {
    ...EMPTY_FORM,
    id: video.id,
    video_type: video.video_type === "youtube" ? "youtube" : "mp4",
    title: video.title || "",
    description: video.description || "",
    youtube_url: video.video_type === "youtube" ? video.video_url || "" : "",
    video_storage_path: video.video_storage_path || "",
    video_url: video.video_type === "mp4" ? video.video_url || "" : "",
    video_file_name: video.video_storage_path ? video.video_storage_path.split("/").pop() : "",
    thumbnail_storage_path: video.thumbnail_storage_path || "",
    thumbnail_url: video.thumbnail_url || "",
    resource_url: video.resource_url || "",
    resource_label: video.resource_label || "",
  };
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function useNarrow(bp = 768) {
  const [narrow, setNarrow] = useState(typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth <= bp);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bp]);
  return narrow;
}

function friendlyStorageError(status, text) {
  let message = "";
  try {
    const data = JSON.parse(text || "{}");
    message = data.message || data.error || "";
  } catch {
    message = text || "";
  }
  if (status === 413 || /maximum allowed size|too large|payload/i.test(message)) {
    return "This file is larger than the Supabase Storage upload limit. Compress the MP4, use a YouTube link, or raise the limit in Supabase → Storage → Settings.";
  }
  if (/mime|content type|invalid_mime_type/i.test(message)) return "This file type is not allowed. Use an MP4 video or a JPG/PNG/WebP thumbnail.";
  if (/expired|signature|invalid.*token/i.test(message)) return "The upload link expired. Please choose the file again.";
  return message || `Upload failed (HTTP ${status || "network error"}).`;
}

/** PUT a file to a Supabase signed upload URL with progress events (fetch cannot report upload progress). */
function uploadWithProgress({ signedUrl, file, contentType, onProgress, register }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    register?.(xhr);
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=86400");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(friendlyStorageError(xhr.status, xhr.responseText)));
    };
    xhr.onerror = () => reject(new Error("Network error during upload — check your connection and try again."));
    xhr.onabort = () => {
      const err = new Error("Upload cancelled.");
      err.name = "AbortError";
      reject(err);
    };
    xhr.send(file);
  });
}

function UploadProgress({ upload, onCancel }) {
  if (!upload) return null;
  const pct = upload.total ? Math.min(100, Math.round((upload.loaded / upload.total) * 100)) : 0;
  const active = upload.status === "preparing" || upload.status === "uploading";
  const colour = upload.status === "error" ? "#dc2626" : upload.status === "done" ? "#16a34a" : TEAL;
  return (
    <div style={{ display: "grid", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, color: "#334155", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, wordBreak: "break-all" }}>{upload.name}</span>
        <span>
          {upload.status === "preparing" && "Preparing upload…"}
          {upload.status === "uploading" && `${formatBytes(upload.loaded)} of ${formatBytes(upload.total)} · ${pct}%${upload.rate ? ` · ${formatBytes(upload.rate)}/s` : ""}`}
          {upload.status === "done" && `Uploaded · ${formatBytes(upload.total)}`}
          {upload.status === "cancelled" && "Cancelled"}
          {upload.status === "error" && "Upload failed"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={upload.status === "done" ? 100 : pct}
        aria-label={`Upload progress for ${upload.name}`}
        style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}
      >
        <div style={{ width: `${upload.status === "done" ? 100 : pct}%`, height: "100%", background: colour, transition: "width .2s linear" }} />
      </div>
      {upload.error && <div style={{ color: "#b91c1c", fontSize: 13 }}>{upload.error}</div>}
      {active && (
        <div>
          <button type="button" onClick={onCancel} style={btn("default")}>Cancel upload</button>
        </div>
      )}
    </div>
  );
}

export default function AdminFeaturedVideo({ password }) {
  const narrow = useNarrow();
  const [videos, setVideos] = useState([]);
  const [meta, setMeta] = useState({
    storage: "",
    setupRequired: false,
    migrationFile: MIGRATION_FILE,
    limits: { videoMaxBytes: FEATURED_VIDEO_DEFAULT_MAX_BYTES, thumbnailMaxBytes: FEATURED_THUMBNAIL_MAX_BYTES },
  });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const latestForm = useRef(form);
  latestForm.current = form;
  const [uploads, setUploads] = useState({ video: null, thumbnail: null });
  const [localPreview, setLocalPreview] = useState({ video: "", thumbnail: "" });
  const xhrs = useRef({});
  const formRef = useRef(null);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const uploading = ["preparing", "uploading"].includes(uploads.video?.status) || ["preparing", "uploading"].includes(uploads.thumbnail?.status);
  const live = videos.find((video) => video.is_published) || null;

  const request = useCallback(async (action, payload = {}) => {
    const headers = { "Content-Type": "application/json", "x-admin-password": password || "" };
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* the server will report an expired session */
    }
    const resp = await fetch(FEATURED_VIDEO_ADMIN_API, {
      method: "POST",
      headers,
      body: JSON.stringify({ password, action, ...payload }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const err = new Error(data?.error || `Request failed (${resp.status}).`);
      err.setupRequired = Boolean(data?.setupRequired);
      throw err;
    }
    if (Array.isArray(data.videos)) {
      setVideos(data.videos);
      setMeta((current) => ({
        storage: data.storage || current.storage,
        setupRequired: Boolean(data.setupRequired),
        migrationFile: data.migrationFile || current.migrationFile,
        limits: data.limits || current.limits,
      }));
    }
    return data;
  }, [password]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await request("fv-list");
    } catch (err) {
      setError(err.message || "Failed to load videos.");
      if (err.setupRequired) setMeta((current) => ({ ...current, setupRequired: true }));
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (password) load();
  }, [password, load]);

  // Warn before leaving the page mid-upload.
  useEffect(() => {
    if (!uploading) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [uploading]);

  useEffect(() => () => {
    Object.values(xhrs.current).forEach((xhr) => xhr?.abort?.());
  }, []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setLocal(kind, url) {
    setLocalPreview((current) => {
      if (current[kind]) URL.revokeObjectURL(current[kind]);
      return { ...current, [kind]: url };
    });
  }

  function isSavedPath(path) {
    return videos.some((video) => video.video_storage_path === path || video.thumbnail_storage_path === path);
  }

  function discardUnsaved(kind, path) {
    if (!path || isSavedPath(path)) return;
    request("fv-discard-upload", { kind, storage_path: path }).catch(() => { /* best effort */ });
  }

  async function handleFile(kind, file) {
    setError("");
    setMessage("");
    if (!file) return;
    const limits = meta.limits || {};
    if (kind === "video") {
      if (!isMp4Upload({ fileName: file.name, contentType: file.type })) {
        setUploads((current) => ({ ...current, video: { name: file.name, loaded: 0, total: file.size, status: "error", error: "Only MP4 files can be uploaded (H.264 MP4 plays on every device)." } }));
        return;
      }
      const max = limits.videoMaxBytes || FEATURED_VIDEO_DEFAULT_MAX_BYTES;
      if (file.size > max) {
        setUploads((current) => ({ ...current, video: { name: file.name, loaded: 0, total: file.size, status: "error", error: `This video is ${formatBytes(file.size)}; the upload limit is ${formatBytes(max)}. Compress it (e.g. HandBrake “Fast 1080p30”) or use a YouTube link.` } }));
        return;
      }
    } else {
      if (!thumbnailContentType({ fileName: file.name, contentType: file.type })) {
        setUploads((current) => ({ ...current, thumbnail: { name: file.name, loaded: 0, total: file.size, status: "error", error: "Thumbnails must be JPG, PNG or WebP images." } }));
        return;
      }
      const max = limits.thumbnailMaxBytes || FEATURED_THUMBNAIL_MAX_BYTES;
      if (file.size > max) {
        setUploads((current) => ({ ...current, thumbnail: { name: file.name, loaded: 0, total: file.size, status: "error", error: `Thumbnail is too large (maximum ${formatBytes(max)}).` } }));
        return;
      }
    }

    setLocal(kind, URL.createObjectURL(file));
    setUploads((current) => ({ ...current, [kind]: { name: file.name, loaded: 0, total: file.size, status: "preparing" } }));

    try {
      const prepared = await request("fv-prepare-upload", {
        kind,
        file_name: file.name,
        content_type: file.type || (kind === "video" ? "video/mp4" : ""),
        file_size: file.size,
      });
      const started = Date.now();
      setUploads((current) => ({ ...current, [kind]: { ...current[kind], status: "uploading" } }));
      await uploadWithProgress({
        signedUrl: prepared.signedUrl,
        file,
        contentType: prepared.contentType,
        register: (xhr) => { xhrs.current[kind] = xhr; },
        onProgress: (loaded, total) => {
          const seconds = (Date.now() - started) / 1000;
          setUploads((current) => ({ ...current, [kind]: { ...current[kind], loaded, total, rate: seconds > 0.5 ? loaded / seconds : 0 } }));
        },
      });
      xhrs.current[kind] = null;

      const previousPath = kind === "video" ? latestForm.current.video_storage_path : latestForm.current.thumbnail_storage_path;
      setForm((current) => (kind === "video"
        ? { ...current, video_storage_path: prepared.storage_path, video_url: prepared.public_url, video_file_name: file.name }
        : { ...current, thumbnail_storage_path: prepared.storage_path, thumbnail_url: prepared.public_url }));
      discardUnsaved(kind, previousPath);
      setUploads((current) => ({ ...current, [kind]: { ...current[kind], loaded: file.size, status: "done" } }));
      // Preview the real uploaded file from now on.
      setLocal(kind, "");
    } catch (err) {
      xhrs.current[kind] = null;
      setLocal(kind, "");
      const cancelled = err?.name === "AbortError";
      setUploads((current) => ({
        ...current,
        [kind]: { ...(current[kind] || { name: file.name, total: file.size, loaded: 0 }), status: cancelled ? "cancelled" : "error", error: cancelled ? "" : err.message || "Upload failed." },
      }));
    }
  }

  function cancelUpload(kind) {
    xhrs.current[kind]?.abort();
  }

  function clearForm({ keepMessage = false } = {}) {
    if (uploading) {
      cancelUpload("video");
      cancelUpload("thumbnail");
    }
    discardUnsaved("video", form.video_storage_path);
    discardUnsaved("thumbnail", form.thumbnail_storage_path);
    setForm(EMPTY_FORM);
    setUploads({ video: null, thumbnail: null });
    setLocal("video", "");
    setLocal("thumbnail", "");
    if (!keepMessage) setMessage("");
    setError("");
  }

  function startEditing(video) {
    clearForm();
    setForm(formFromVideo(video));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function startReplacing() {
    clearForm();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  const youtubeId = form.video_type === "youtube" ? parseYouTubeId(form.youtube_url) : null;
  const resourceCheck = normalizeResourceUrl(form.resource_url);

  const previewVideo = useMemo(() => {
    const thumb = form.thumbnail_url || localPreview.thumbnail;
    const resourceUrl = resourceCheck.ok ? resourceCheck.url : "";
    const base = {
      id: form.id || "preview",
      title: form.title.trim() || "Untitled video",
      description: form.description.trim(),
      thumbnail_url: thumb,
      resource_url: resourceUrl,
      resource_label: resourceUrl ? form.resource_label.trim() || FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL : "",
    };
    if (form.video_type === "youtube") {
      if (!youtubeId) return null;
      return { ...base, video_type: "youtube", video_url: youtubeWatchUrl(youtubeId), youtube_id: youtubeId };
    }
    const url = localPreview.video || form.video_url;
    if (!url) return null;
    return { ...base, video_type: "mp4", video_url: url, poster_url: thumb };
  }, [form, localPreview, youtubeId, resourceCheck.ok, resourceCheck.url]);

  function validateForm() {
    if (!form.title.trim()) return "Enter a video title.";
    if (form.video_type === "youtube" && !youtubeId) return "Paste a valid YouTube link, e.g. https://www.youtube.com/watch?v=…";
    if (form.video_type === "mp4" && !form.video_storage_path) return "Upload an MP4 video first.";
    if (!resourceCheck.ok) return resourceCheck.error;
    if (uploading) return "Wait for the upload to finish.";
    return "";
  }

  async function save(publish) {
    setError("");
    setMessage("");
    const problem = validateForm();
    if (problem) {
      setError(problem);
      return;
    }
    if (publish && live && live.id !== form.id) {
      const ok = window.confirm(`Publish “${form.title.trim()}” as the Video of the Day?\n\nIt will replace “${live.title}” on the homepage. The previous video stays in your library.`);
      if (!ok) return;
    }
    setBusy(publish ? "publish" : "save");
    try {
      const data = await request("fv-save", {
        publish,
        video: {
          id: form.id,
          title: form.title,
          description: form.description,
          video_type: form.video_type,
          youtube_url: form.video_type === "youtube" ? form.youtube_url : "",
          video_storage_path: form.video_type === "mp4" ? form.video_storage_path : "",
          thumbnail_storage_path: form.thumbnail_storage_path,
          resource_url: form.resource_url,
          resource_label: form.resource_label,
        },
      });
      setUploads({ video: null, thumbnail: null });
      // An MP4 uploaded before switching this video to a YouTube link is no longer needed.
      if (form.video_type === "youtube") discardUnsaved("video", form.video_storage_path);
      if (publish) {
        setForm(EMPTY_FORM);
        setMessage(`Published — “${data.video?.title || form.title}” is now the Video of the Day on the homepage.`);
      } else {
        setForm(formFromVideo(data.video));
        setMessage("Draft saved. Preview it below, then click “Publish to homepage” when you are ready.");
      }
    } catch (err) {
      setError(err.message || "Failed to save the video.");
      if (err.setupRequired) setMeta((current) => ({ ...current, setupRequired: true }));
    } finally {
      setBusy("");
    }
  }

  async function publishExisting(video) {
    if (live && live.id !== video.id) {
      const ok = window.confirm(`Publish “${video.title}”? It will replace “${live.title}” as the Video of the Day.`);
      if (!ok) return;
    }
    setBusy(`publish:${video.id}`);
    setError("");
    setMessage("");
    try {
      await request("fv-publish", { id: video.id });
      setMessage(`“${video.title}” is now the Video of the Day.`);
    } catch (err) {
      setError(err.message || "Failed to publish.");
    } finally {
      setBusy("");
    }
  }

  async function removeFromHomepage(video) {
    const ok = window.confirm(`Remove “${video.title}” from the homepage?\n\nThe homepage will show the default JD Science introduction video until you publish another one. This video stays in your library.`);
    if (!ok) return;
    setBusy(`unpublish:${video.id}`);
    setError("");
    setMessage("");
    try {
      await request("fv-unpublish", { id: video.id });
      setMessage(`“${video.title}” has been removed from the homepage.`);
    } catch (err) {
      setError(err.message || "Failed to remove the video from the homepage.");
    } finally {
      setBusy("");
    }
  }

  async function deleteVideo(video) {
    const files = video.video_type === "mp4" ? "its MP4 file" : "its record";
    const ok = window.confirm(`Permanently delete “${video.title}”?\n\nThis also deletes ${files}${video.thumbnail_storage_path ? " and thumbnail" : ""} from storage and cannot be undone.${video.is_published ? "\n\nIt is currently live — the homepage will fall back to the default introduction video." : ""}`);
    if (!ok) return;
    setBusy(`delete:${video.id}`);
    setError("");
    setMessage("");
    try {
      await request("fv-delete", { id: video.id });
      if (form.id === video.id) {
        setForm(EMPTY_FORM);
        setUploads({ video: null, thumbnail: null });
      }
      setMessage(`“${video.title}” was deleted.`);
    } catch (err) {
      setError(err.message || "Failed to delete the video.");
    } finally {
      setBusy("");
    }
  }

  const disabled = Boolean(busy) || loading;
  const videoLimit = meta.limits?.videoMaxBytes || FEATURED_VIDEO_DEFAULT_MAX_BYTES;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={card}>
        <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>Featured Video Management — Video of the Day</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/#video-of-the-day" target="_blank" rel="noopener noreferrer" style={{ ...btn("default"), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View homepage ↗</a>
            <button type="button" onClick={load} disabled={loading} style={btn("default", loading)}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
          </div>
        </div>
        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            The published video appears in the homepage section <b>“Video of the Day”</b>. Only one video is live at a time — publishing a new one replaces the current video, and earlier videos stay in your library until you delete them.
          </div>

          {meta.setupRequired && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.65 }}>
              <b>One-off database step:</b> run <b>{meta.migrationFile || MIGRATION_FILE}</b> in the Supabase SQL editor.
              {meta.storage === "settings"
                ? " Until then, videos are saved in a temporary settings record and everything below still works; the migration copies them into the new featured_videos table automatically."
                : " Then click Refresh."}
            </div>
          )}
          {error && <div role="alert" style={{ padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 14 }}>{error}</div>}
          {message && <div role="status" style={{ padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 14 }}>{message}</div>}

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, display: "grid", gap: 12, background: "#f8fafc" }}>
            <div style={{ fontWeight: 800, color: TEAL_DARK }}>Currently on the homepage</div>
            {live ? (
              <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "220px 1fr", gap: 14, alignItems: "start" }}>
                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#0b1530" }}>
                  {featuredVideoPosterUrl(live) ? (
                    <img src={featuredVideoPosterUrl(live)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#cbd5e1", fontSize: 13 }}>MP4 video</div>
                  )}
                </div>
                <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a" }}>{live.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {live.video_type === "youtube" ? "YouTube" : "MP4 upload"} · Published {formatDate(live.published_at)}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={startReplacing} disabled={disabled} style={btn("primary", disabled)}>Replace with a new video</button>
                    <button type="button" onClick={() => startEditing(live)} disabled={disabled} style={btn("default", disabled)}>Edit details</button>
                    <button type="button" onClick={() => removeFromHomepage(live)} disabled={disabled} style={btn("warn", disabled)}>
                      {busy === `unpublish:${live.id}` ? "Removing…" : "Remove from homepage"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                No Video of the Day is published, so the homepage shows the default JD Science introduction video. Add a video below and click <b>Publish to homepage</b>.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={card} ref={formRef}>
        <div style={cardHeader}>{form.id ? "Edit video" : "Add a new video"}</div>
        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          <div role="radiogroup" aria-label="Video source" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "mp4", text: "Upload MP4 from computer" },
              { id: "youtube", text: "Paste YouTube link" },
            ].map((option) => {
              const active = form.video_type === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setField("video_type", option.id)}
                  disabled={uploading}
                  style={{
                    ...btn("default", uploading),
                    border: active ? `2px solid ${TEAL}` : "1px solid #cbd5e1",
                    background: active ? "#ecfeff" : "#fff",
                    color: active ? TEAL_DARK : "#334155",
                  }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {form.video_type === "mp4" ? (
            <div style={label}>
              <span>MP4 video file</span>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,.mp4"
                disabled={uploading || disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  void handleFile("video", file);
                }}
                style={{ ...inp, padding: "10px 8px", cursor: "pointer" }}
              />
              <span style={hint}>
                Full HD (1920×1080) H.264 MP4 recommended. Maximum {formatBytes(videoLimit)} per file (Supabase Storage limit) — for longer videos, upload to YouTube and paste the link instead.
              </span>
              {form.video_storage_path && uploads.video?.status !== "uploading" && (
                <span style={{ ...hint, color: "#166534" }}>Current file: {form.video_file_name || form.video_storage_path.split("/").pop()}</span>
              )}
              <UploadProgress upload={uploads.video} onCancel={() => cancelUpload("video")} />
            </div>
          ) : (
            <label style={label}>
              <span>YouTube video link</span>
              <input
                type="url"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={form.youtube_url}
                onChange={(e) => setField("youtube_url", e.target.value)}
                style={inp}
              />
              <span style={hint}>
                Works with youtube.com/watch, youtu.be, Shorts and embed links. Unlisted videos work too; private videos cannot be embedded.
              </span>
              {form.youtube_url && !youtubeId && <span style={{ ...hint, color: "#b91c1c" }}>This doesn’t look like a YouTube video link.</span>}
            </label>
          )}

          <label style={label}>
            <span>Video title</span>
            <input value={form.title} maxLength={FEATURED_VIDEO_TITLE_MAX} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Balancing chemical equations in 5 minutes" style={inp} />
          </label>

          <label style={label}>
            <span>Short description</span>
            <textarea rows={3} value={form.description} maxLength={FEATURED_VIDEO_DESCRIPTION_MAX} onChange={(e) => setField("description", e.target.value)} placeholder="One or two sentences shown beneath the video." style={{ ...inp, resize: "vertical" }} />
            <span style={hint}>{form.description.length}/{FEATURED_VIDEO_DESCRIPTION_MAX} characters</span>
          </label>

          <div style={label}>
            <span>Custom thumbnail (optional)</span>
            <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "200px 1fr", gap: 12, alignItems: "start" }}>
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#e2e8f0", border: "1px solid #cbd5e1" }}>
                {(localPreview.thumbnail || form.thumbnail_url) ? (
                  <img src={localPreview.thumbnail || form.thumbnail_url} alt="Thumbnail preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#64748b", fontSize: 12, fontWeight: 400, textAlign: "center", padding: 8 }}>
                    {form.video_type === "youtube" ? "YouTube’s own thumbnail will be used" : "No thumbnail"}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploads.thumbnail?.status === "uploading" || disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    void handleFile("thumbnail", file);
                  }}
                  style={{ ...inp, padding: "10px 8px", cursor: "pointer" }}
                />
                <span style={hint}>JPG, PNG or WebP, 16:9 (e.g. 1280×720), up to {formatBytes(meta.limits?.thumbnailMaxBytes || FEATURED_THUMBNAIL_MAX_BYTES)}. Shown before the video is played.</span>
                {form.thumbnail_storage_path && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        discardUnsaved("thumbnail", form.thumbnail_storage_path);
                        setForm((current) => ({ ...current, thumbnail_storage_path: "", thumbnail_url: "" }));
                        setUploads((current) => ({ ...current, thumbnail: null }));
                      }}
                      style={btn("danger")}
                    >
                      Remove thumbnail
                    </button>
                  </div>
                )}
                <UploadProgress upload={uploads.thumbnail} onCancel={() => cancelUpload("thumbnail")} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: 12 }}>
            <label style={label}>
              <span>Related resources link (optional)</span>
              <input value={form.resource_url} onChange={(e) => setField("resource_url", e.target.value)} placeholder="/papers or https://…" style={inp} />
              {!resourceCheck.ok && <span style={{ ...hint, color: "#b91c1c" }}>{resourceCheck.error}</span>}
            </label>
            <label style={label}>
              <span>Link text</span>
              <input value={form.resource_label} maxLength={FEATURED_VIDEO_RESOURCE_LABEL_MAX} onChange={(e) => setField("resource_label", e.target.value)} placeholder={FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL} style={inp} />
            </label>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800, color: TEAL_DARK }}>Preview — exactly as it will appear on the homepage</div>
            <div style={{ background: "#071025", color: "#fff", borderRadius: 14, padding: narrow ? "28px 12px" : "40px 24px" }}>
              <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
                <VideoOfTheDayHeading isMobile={narrow} />
                {previewVideo ? (
                  <VideoOfTheDayContent video={previewVideo} isMobile={narrow} />
                ) : (
                  <div style={{ padding: "40px 12px", border: "1px dashed rgba(255,255,255,.3)", borderRadius: 14, color: "#cbd5e1", fontSize: 15 }}>
                    {form.video_type === "youtube" ? "Paste a YouTube link to preview it here." : "Choose an MP4 file to preview it here."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={() => save(true)} disabled={disabled || uploading} style={btn("primary", disabled || uploading)}>
              {busy === "publish" ? "Publishing…" : form.id && live?.id === form.id ? "Save & keep live" : "Publish to homepage"}
            </button>
            <button type="button" onClick={() => save(false)} disabled={disabled || uploading} style={btn("default", disabled || uploading)}>
              {busy === "save" ? "Saving…" : form.id && live?.id === form.id ? "Save changes" : "Save as draft"}
            </button>
            <button type="button" onClick={() => clearForm()} disabled={Boolean(busy)} style={btn("default", Boolean(busy))}>
              {form.id ? "Cancel editing" : "Clear form"}
            </button>
            {uploading && <span style={{ ...hint, color: "#92400e" }}>Keep this page open until the upload finishes.</span>}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHeader}>Video library ({videos.length})</div>
        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          {loading && !videos.length && <div style={{ color: "#64748b", fontSize: 14 }}>Loading…</div>}
          {!loading && !videos.length && <div style={{ color: "#64748b", fontSize: 14 }}>No videos yet. Add your first Video of the Day above.</div>}
          {videos.map((video) => {
            const poster = featuredVideoPosterUrl(video);
            return (
              <article key={video.id} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "140px 1fr auto", gap: 12, alignItems: "center", border: video.is_published ? `2px solid ${TEAL}` : "1px solid #e2e8f0", borderRadius: 12, padding: 10 }}>
                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", background: "#0b1530" }}>
                  {poster ? (
                    <img src={poster} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#cbd5e1", fontSize: 12 }}>MP4</div>
                  )}
                </div>
                <div style={{ minWidth: 0, display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ color: "#0f172a" }}>{video.title}</strong>
                    {video.is_published ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: TEAL, borderRadius: 999, padding: "3px 8px" }}>LIVE ON HOMEPAGE</span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", background: "#f1f5f9", borderRadius: 999, padding: "3px 8px" }}>NOT PUBLISHED</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {video.video_type === "youtube" ? "YouTube" : "MP4 upload"} · Added {formatDate(video.created_at)}
                    {video.published_at ? ` · Last published ${formatDate(video.published_at)}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: narrow ? "flex-start" : "flex-end" }}>
                  {video.is_published ? (
                    <button type="button" onClick={() => removeFromHomepage(video)} disabled={disabled} style={btn("warn", disabled)}>
                      {busy === `unpublish:${video.id}` ? "Removing…" : "Remove from homepage"}
                    </button>
                  ) : (
                    <button type="button" onClick={() => publishExisting(video)} disabled={disabled} style={btn("primary", disabled)}>
                      {busy === `publish:${video.id}` ? "Publishing…" : "Publish"}
                    </button>
                  )}
                  <button type="button" onClick={() => startEditing(video)} disabled={disabled} style={btn("default", disabled)}>Edit</button>
                  <button type="button" onClick={() => deleteVideo(video)} disabled={disabled} style={btn("danger", disabled)}>
                    {busy === `delete:${video.id}` ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
