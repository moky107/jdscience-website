import { useCallback, useRef, useState } from "react";
import {
  homepageVideoElementProps,
  homepageVideoSourceProps,
  INTRO_VIDEO_POSTER,
} from "./homepageVideo.js";

export default function HomepageIntroVideo({ isMobile = false }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const onError = useCallback(() => {
    setFailed(true);
    setShowPlayOverlay(false);
  }, []);

  const onPlay = useCallback(() => {
    setPlaying(true);
    setShowPlayOverlay(false);
  }, []);

  const onPause = useCallback(() => {
    setPlaying(false);
    setShowPlayOverlay(true);
  }, []);

  const handlePlayClick = useCallback(() => {
    const node = videoRef.current;
    if (!node) return;
    const playPromise = node.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        /* Autoplay may be blocked; controls remain available. */
      });
    }
  }, []);

  const videoProps = homepageVideoElementProps({ autoPlay: true });
  const sourceProps = homepageVideoSourceProps();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: "0 24px 60px rgba(0,0,0,.35)",
        background: "#111827",
      }}
    >
      {failed ? (
        <div
          role="status"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: isMobile ? 16 : 28,
            textAlign: "center",
            background: `linear-gradient(180deg, rgba(7,16,37,.55), rgba(7,16,37,.82)), url(${INTRO_VIDEO_POSTER}) center/cover no-repeat`,
            color: "#f8fafc",
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <div style={{ fontWeight: 800, fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>
              Video unavailable
            </div>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.55, fontSize: isMobile ? 14 : 16 }}>
              The introduction video could not be loaded. Please refresh the page or try again later.
            </p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            {...videoProps}
            onError={onError}
            onPlay={onPlay}
            onPause={onPause}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#111827",
              filter: "brightness(1.22) contrast(1.04) saturate(1.06)",
            }}
          >
            <source {...sourceProps} />
            Your browser does not support the video tag.
          </video>

          {showPlayOverlay && !playing && (
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label="Play introduction video"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? 64 : 78,
                height: isMobile ? 64 : 78,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: "rgba(15, 23, 42, 0.72)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 12px 30px rgba(0,0,0,.35)",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M8 5.5v13l11-6.5L8 5.5z" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
