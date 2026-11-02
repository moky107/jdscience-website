import React, { useEffect, useState } from "react";
import FeaturedVideoPlayer from "./FeaturedVideoPlayer";
import {
  FEATURED_VIDEO_SECTION_SUBTITLE,
  FEATURED_VIDEO_SECTION_TITLE,
  isInternalResourceLink,
} from "./featuredVideo.js";
import { INTRO_VIDEO_POSTER, INTRO_VIDEO_SRC } from "./homepageVideo.js";

const TEAL = "#009688";
export const VIDEO_OF_THE_DAY_TITLE = FEATURED_VIDEO_SECTION_TITLE;
export const VIDEO_OF_THE_DAY_SUBTITLE = FEATURED_VIDEO_SECTION_SUBTITLE;

/** Shown when nothing is published (or the public API is unreachable). */
export const DEFAULT_FEATURED_VIDEO = {
  id: "jd-science-introduction",
  title: "Welcome to JD Science",
  description: "A short introduction to JD Science revision resources, past papers and tutoring support.",
  video_type: "mp4",
  video_src: INTRO_VIDEO_SRC,
  youtube_id: null,
  thumbnail_src: INTRO_VIDEO_POSTER,
  has_custom_thumbnail: true,
  resource_link: "/papers",
};

export function FeaturedVideoDetails({ video, isMobile = false, onBrowse }) {
  const internal = isInternalResourceLink(video.resource_link);
  const isPapers = video.resource_link === "/papers" || String(video.resource_link || "").startsWith("/papers?");

  function onResourceClick(event) {
    if (isPapers && onBrowse) {
      event.preventDefault();
      onBrowse();
    }
  }

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
              onClick={onResourceClick}
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
  const displayVideo = video || DEFAULT_FEATURED_VIDEO;

  return (
    <section id="video-of-the-day" aria-labelledby="video-of-the-day-title" style={{ background: "#071025", color: "#fff", padding: isMobile ? "40px 16px" : "60px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
        <h2 id="video-of-the-day-title" style={{ fontSize: isMobile ? 26 : 38, margin: 0 }}>{VIDEO_OF_THE_DAY_TITLE}</h2>
        <p style={{ color: "#cbd5e1", fontSize: isMobile ? 15 : 18, lineHeight: 1.6, maxWidth: 760, margin: isMobile ? "12px auto 24px" : "12px auto 30px" }}>
          {VIDEO_OF_THE_DAY_SUBTITLE}
        </p>

        {loading ? (
          <div aria-busy="true" aria-label="Loading video" style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: isMobile ? 14 : 18, background: "linear-gradient(110deg, #0f1b33 30%, #16264a 50%, #0f1b33 70%)", border: "1px solid rgba(255,255,255,.1)" }} />
        ) : (
          <FeaturedVideoDetails video={displayVideo} isMobile={isMobile} onBrowse={onBrowse} />
        )}
      </div>
    </section>
  );
}
