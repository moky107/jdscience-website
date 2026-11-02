import React, { useEffect, useId, useRef, useState } from "react";
import { FEATURED_VIDEO_PLAYBACK_SPEEDS, youTubeEmbedUrl, youTubeThumbnailUrl } from "./featuredVideo.js";

function SpeedControl({ value, onChange, isMobile }) {
  const id = useId();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
      <label htmlFor={id} style={{ color: "#cbd5e1", fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
        Playback speed
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,.2)",
          background: "#0f172a",
          color: "#f8fafc",
          fontSize: isMobile ? 13 : 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {FEATURED_VIDEO_PLAYBACK_SPEEDS.map((speed) => (
          <option key={speed} value={String(speed)}>{speed === 1 ? "Normal (1×)" : `${speed}×`}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * One large 16:9 player for the "Video of the Day".
 * - MP4: native <video> (custom poster, no autoplay, playback-speed control).
 * - YouTube: lightweight thumbnail facade; the privacy-enhanced iframe only
 *   loads (and starts) after the visitor clicks play.
 */
export default function FeaturedVideoPlayer({ video, isMobile = false }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(video?.thumbnail_src || "");
  const [speed, setSpeed] = useState(1);

  const sourceKey = `${video?.video_type}|${video?.video_src}|${video?.youtube_id}|${video?.thumbnail_src}`;
  useEffect(() => {
    setStarted(false);
    setFailed(false);
    setThumbSrc(video?.thumbnail_src || "");
    setSpeed(1);
  }, [sourceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const isYouTube = video?.video_type === "youtube" && video?.youtube_id;
  const isMp4 = video?.video_type === "mp4" && video?.video_src;
  const title = video?.title || "Featured video";
  const mp4Src = (thumbSrc || String(video?.video_src || "").includes("#"))
    ? video.video_src
    : `${video.video_src}#t=0.1`;

  function onThumbError() {
    // YouTube does not create maxresdefault for every upload; fall back to hqdefault.
    if (isYouTube && thumbSrc.includes("maxresdefault")) setThumbSrc(youTubeThumbnailUrl(video.youtube_id, "hqdefault"));
    else setThumbSrc("");
  }

  function start() {
    setStarted(true);
    if (isMp4 && videoRef.current) {
      videoRef.current.playbackRate = speed;
      const attempt = videoRef.current.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => { /* controls remain available */ });
    }
  }

  const frame = {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: isMobile ? 14 : 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.16)",
    boxShadow: "0 24px 60px rgba(0,0,0,.35)",
    background: "#020617",
  };
  const fill = { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 };

  if (failed || (!isYouTube && !isMp4)) {
    return (
      <div style={frame} role="status">
        <div style={{ ...fill, display: "grid", placeItems: "center", padding: 20, textAlign: "center", color: "#e2e8f0" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: isMobile ? 17 : 20, marginBottom: 6 }}>Video unavailable</div>
            <div style={{ color: "#94a3b8", fontSize: isMobile ? 14 : 15 }}>Please refresh the page or try again later.</div>
          </div>
        </div>
      </div>
    );
  }

  const showFacade = !started;

  return (
    <div>
      <div style={frame}>
        {isMp4 && (
          <video
            ref={videoRef}
            src={mp4Src}
            poster={thumbSrc || undefined}
            controls={started}
            playsInline
            preload="metadata"
            controlsList="nodownload"
            title={title}
            onPlay={() => setStarted(true)}
            onLoadedMetadata={(event) => { event.currentTarget.playbackRate = speed; }}
            onError={() => setFailed(true)}
            style={{ ...fill, objectFit: "contain", background: "#000" }}
          >
            Your browser does not support the video tag.
          </video>
        )}

        {isYouTube && started && (
          <iframe
            src={youTubeEmbedUrl(video.youtube_id, { autoplay: true })}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={fill}
          />
        )}

        {showFacade && (
          <button
            type="button"
            onClick={start}
            aria-label={`Play video: ${title}`}
            style={{
              ...fill,
              padding: 0,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              // Without a custom thumbnail an MP4 shows its first frame underneath.
              background: thumbSrc || isMp4 ? "transparent" : "linear-gradient(135deg, #0f172a 0%, #0b3b3a 100%)",
            }}
          >
            {thumbSrc && (
              <img
                src={thumbSrc}
                alt=""
                onError={onThumbError}
                loading="lazy"
                decoding="async"
                style={{ ...fill, objectFit: "cover" }}
              />
            )}
            <span aria-hidden="true" style={{ ...fill, background: "linear-gradient(180deg, rgba(2,6,23,.05) 40%, rgba(2,6,23,.55) 100%)" }} />
            <span
              aria-hidden="true"
              style={{
                position: "relative",
                width: isMobile ? 66 : 88,
                height: isMobile ? 66 : 88,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(0,150,136,.92)",
                color: "#fff",
                boxShadow: "0 14px 34px rgba(0,0,0,.45)",
                border: "3px solid rgba(255,255,255,.85)",
              }}
            >
              <svg width={isMobile ? 26 : 34} height={isMobile ? 26 : 34} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M8 5.5v13l11-6.5L8 5.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {isMp4 && <SpeedControl value={speed} onChange={setSpeed} isMobile={isMobile} />}
    </div>
  );
}
