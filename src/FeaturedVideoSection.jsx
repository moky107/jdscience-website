import React, { useEffect, useState } from "react";
import FeaturedVideoPlayer from "./FeaturedVideoPlayer";
import { isInternalResourceLink } from "./featuredVideo.js";

const TEAL = "#009688";
export const VIDEO_OF_THE_DAY_TITLE = "Video of the Day";
export const VIDEO_OF_THE_DAY_SUBTITLE =
  "Watch our featured educational video and strengthen your understanding of key scientific concepts and examination questions.";

export function FeaturedVideoDetails({ video, isMobile = false }) {
  const internal = isInternalResourceLink(video.resource_link);
  return (
    <>
      <h3 style={{ margin: isMobile ? "0 0 14px" : "0 0 18px", fontSize: isMobile ? 19 : 24, lineHeight: 1.3, color: "#f8fafc", fontWeight: 800 }}>
        {video.title}
      </h3>
      <FeaturedVideoPlayer video={video} isMobile={isMobile} />
      {(video.description || video.resource_link) && (
        <div style={{ marginTop: isMobile ? 16 : 22, textAlign: "left", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: isMobile ? "14px 16px" : "18px 22px" }}>
          {video.description && (
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: isMobile ? 15 : 16.5, lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {video.description}
            </p>
          )}
          {video.resource_link && (
            <a
              href={video.resource_link}
              target={internal ? undefined : "_blank"}
              rel={internal ? undefined : "noopener noreferrer"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: video.description ? 14 : 0,
                padding: "11px 18px",
                borderRadius: 999,
                background: TEAL,
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 10px 24px rgba(0,150,136,.28)",
              }}
            >
              Explore related JD Science resources <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      )}
    </>
  );
}

export default function FeaturedVideoSection({ isMobile = false, onBrowse }) {
  const [state, setState] = useState({ loading: true, video: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/featured-video", { cache: "no-cache", headers: { Accept: "application/json" } })
      .then((resp) => (resp.ok ? resp.json() : null))
      .then((data) => { if (!cancelled) setState({ loading: false, video: data?.video || null }); })
      .catch(() => { if (!cancelled) setState({ loading: false, video: null }); });
    return () => { cancelled = true; };
  }, []);

  const { loading, video } = state;

  return (
    <section id="video-of-the-day" aria-labelledby="video-of-the-day-title" style={{ background: "#071025", color: "#fff", padding: isMobile ? "40px 16px" : "60px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
        <h2 id="video-of-the-day-title" style={{ fontSize: isMobile ? 26 : 38, margin: 0 }}>{VIDEO_OF_THE_DAY_TITLE}</h2>
        <p style={{ color: "#cbd5e1", fontSize: isMobile ? 15 : 18, lineHeight: 1.6, maxWidth: 760, margin: isMobile ? "12px auto 24px" : "12px auto 30px" }}>
          {VIDEO_OF_THE_DAY_SUBTITLE}
        </p>

        {loading ? (
          <div aria-busy="true" aria-label="Loading video" style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: isMobile ? 14 : 18, background: "linear-gradient(110deg, #0f1b33 30%, #16264a 50%, #0f1b33 70%)", border: "1px solid rgba(255,255,255,.1)" }} />
        ) : video ? (
          <FeaturedVideoDetails video={video} isMobile={isMobile} />
        ) : (
          <div role="status" style={{ borderRadius: isMobile ? 14 : 18, border: "1px dashed rgba(255,255,255,.22)", background: "rgba(255,255,255,.04)", padding: isMobile ? "34px 18px" : "56px 28px" }}>
            <div aria-hidden="true" style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(0,150,136,.18)", color: "#5eead4" }}>
              <svg width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13l11-6.5L8 5.5z" /></svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: isMobile ? 18 : 22 }}>Today’s featured video is on its way</div>
            <p style={{ color: "#94a3b8", margin: "8px auto 0", maxWidth: 520, lineHeight: 1.6, fontSize: isMobile ? 14.5 : 16 }}>
              Check back soon for our next featured lesson. In the meantime, explore our free revision resources and past papers.
            </p>
            {onBrowse && (
              <button type="button" onClick={onBrowse} style={{ marginTop: 18, padding: "11px 18px", borderRadius: 999, border: 0, background: TEAL, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                Browse free resources
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
