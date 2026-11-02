import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FEATURED_VIDEO_PLAYBACK_SPEEDS,
  featuredVideoPosterUrl,
  parseYouTubeId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "./featuredVideo.js";

const frameStyle = {
  position: "relative",
  width: "100%",
  paddingTop: "56.25%", // 16:9 on every browser
  height: 0,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,.18)",
  boxShadow: "0 24px 60px rgba(0,0,0,.35)",
  background: "#111827",
};

const fillStyle = { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 };

function PlayButton({ onClick, isMobile, label }) {
  const size = isMobile ? 64 : 78;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: "rgba(15, 23, 42, 0.78)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 12px 30px rgba(0,0,0,.35)",
      }}
    >
      <svg width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 5.5v13l11-6.5L8 5.5z" />
      </svg>
    </button>
  );
}

function Unavailable({ isMobile, poster }) {
  return (
    <div
      role="status"
      style={{
        ...fillStyle,
        display: "grid",
        placeItems: "center",
        padding: isMobile ? 16 : 28,
        textAlign: "center",
        background: poster
          ? `linear-gradient(180deg, rgba(7,16,37,.6), rgba(7,16,37,.86)), url("${poster}") center/cover no-repeat`
          : "#0b1530",
        color: "#f8fafc",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontWeight: 800, fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>Video unavailable</div>
        <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.55, fontSize: isMobile ? 14 : 16 }}>
          This video could not be loaded. Please refresh the page or try again later.
        </p>
      </div>
    </div>
  );
}

function SpeedControl({ value, onChange, isMobile, idSuffix }) {
  const id = `jd-fv-speed-${idSuffix}`;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
      <label htmlFor={id} style={{ color: "#cbd5e1", fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
        Playback speed
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: "#0b1530",
          color: "#fff",
          border: "1px solid rgba(255,255,255,.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: isMobile ? 14 : 15,
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

function Mp4Player({ video, isMobile, poster }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Without a custom thumbnail, "#t=0.1" makes browsers (incl. iOS Safari) paint the first frame.
  const src = poster ? video.video_url : `${video.video_url}#t=0.1`;

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const play = useCallback(() => {
    const node = videoRef.current;
    if (!node) return;
    const attempt = node.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => { /* controls remain available */ });
  }, []);

  if (failed) {
    return <div style={frameStyle}><Unavailable isMobile={isMobile} poster={poster} /></div>;
  }

  return (
    <>
      <div style={frameStyle}>
        <video
          ref={videoRef}
          title={video.title}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onPlay={() => setStarted(true)}
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = speed; }}
          onError={() => setFailed(true)}
          style={{ ...fillStyle, objectFit: "contain", background: "#000" }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        {!started && <PlayButton onClick={play} isMobile={isMobile} label={`Play video: ${video.title}`} />}
      </div>
      <SpeedControl value={speed} onChange={setSpeed} isMobile={isMobile} idSuffix={video.id || "preview"} />
    </>
  );
}

function YouTubePlayer({ video, isMobile, poster }) {
  const youtubeId = video.youtube_id || parseYouTubeId(video.video_url);
  const [active, setActive] = useState(false);
  const [posterSrc, setPosterSrc] = useState(poster || (youtubeId ? youtubeThumbnailUrl(youtubeId, "maxresdefault") : ""));

  useEffect(() => {
    setActive(false);
    setPosterSrc(poster || (youtubeId ? youtubeThumbnailUrl(youtubeId, "maxresdefault") : ""));
  }, [youtubeId, poster]);

  if (!youtubeId) {
    return <div style={frameStyle}><Unavailable isMobile={isMobile} poster={poster} /></div>;
  }

  return (
    <div style={frameStyle}>
      {active ? (
        <iframe
          src={youtubeEmbedUrl(youtubeId, { autoplay: true })}
          title={video.title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={fillStyle}
        />
      ) : (
        <>
          {posterSrc && (
            <img
              src={posterSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={(e) => {
                // YouTube returns a 120×90 grey placeholder when maxres artwork does not exist.
                if (!poster && e.currentTarget.naturalWidth <= 120) setPosterSrc(youtubeThumbnailUrl(youtubeId));
              }}
              onError={() => { if (!poster) setPosterSrc(youtubeThumbnailUrl(youtubeId)); }}
              style={{ ...fillStyle, objectFit: "cover" }}
            />
          )}
          <PlayButton onClick={() => setActive(true)} isMobile={isMobile} label={`Play video: ${video.title}`} />
        </>
      )}
    </div>
  );
}

/**
 * One large responsive player for the Video of the Day. Never autoplays: playback only
 * starts when the visitor presses play. MP4 uses native controls (play/pause, volume,
 * fullscreen) plus a playback-speed selector; YouTube uses YouTube's own controls.
 */
export default function FeaturedVideoPlayer({ video, isMobile = false }) {
  if (!video?.video_url) return null;
  const key = `${video.video_type}:${video.video_url}`;
  if (video.video_type === "youtube") {
    // Custom thumbnail if uploaded, otherwise YouTube's own artwork (resolved inside).
    return <YouTubePlayer key={key} video={video} isMobile={isMobile} poster={video.thumbnail_url || ""} />;
  }
  const poster = video.poster_url || featuredVideoPosterUrl(video);
  return <Mp4Player key={key} video={video} isMobile={isMobile} poster={poster} />;
}
