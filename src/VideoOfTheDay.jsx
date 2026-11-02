import React, { useEffect, useState } from "react";
import FeaturedVideoPlayer from "./FeaturedVideoPlayer.jsx";
import {
  FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL,
  FEATURED_VIDEO_PUBLIC_API,
  FEATURED_VIDEO_SECTION_SUBTITLE,
  FEATURED_VIDEO_SECTION_TITLE,
} from "./featuredVideo.js";
import { INTRO_VIDEO_POSTER, INTRO_VIDEO_SRC } from "./homepageVideo.js";

const TEAL = "#009688";

/** Shown until a Video of the Day is published (or if the API is unreachable). */
export const DEFAULT_FEATURED_VIDEO = {
  id: "jd-science-introduction",
  title: "Welcome to JD Science",
  description: "A short introduction to JD Science revision resources, past papers and tutoring support.",
  video_type: "mp4",
  video_url: INTRO_VIDEO_SRC,
  thumbnail_url: INTRO_VIDEO_POSTER,
  poster_url: INTRO_VIDEO_POSTER,
  resource_url: "/papers",
  resource_label: FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL,
};

function ResourceLink({ video, isMobile, onNavigateResources }) {
  const href = video?.resource_url;
  if (!href) return null;
  const label = video.resource_label || FEATURED_VIDEO_DEFAULT_RESOURCE_LABEL;
  const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?jdscience\.co\.uk(\/|$)/i.test(href);
  const isPapers = href === "/papers" || href.startsWith("/papers?") || href === "/papers/";

  const onClick = (event) => {
    if (isPapers && onNavigateResources) {
      event.preventDefault();
      onNavigateResources(href);
    }
  };

  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginTop: 18,
        padding: isMobile ? "11px 18px" : "12px 22px",
        borderRadius: 999,
        background: TEAL,
        color: "#fff",
        fontWeight: 700,
        fontSize: isMobile ? 15 : 16,
        textDecoration: "none",
        boxShadow: "0 8px 20px rgba(0,150,136,.25)",
      }}
    >
      {label}
      <span aria-hidden="true">→</span>
    </a>
  );
}

/** Title, player, description and optional resources link — shared by the homepage and admin preview. */
export function VideoOfTheDayContent({ video, isMobile = false, onNavigateResources }) {
  if (!video) return null;
  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ fontSize: isMobile ? 19 : 26, lineHeight: 1.3, margin: "0 0 16px", color: "#fff", fontWeight: 800 }}>
        {video.title}
      </h3>
      <FeaturedVideoPlayer video={video} isMobile={isMobile} />
      {video.description && (
        <p
          style={{
            color: "#cbd5e1",
            fontSize: isMobile ? 15 : 17,
            lineHeight: 1.65,
            maxWidth: 760,
            margin: "18px auto 0",
            whiteSpace: "pre-line",
          }}
        >
          {video.description}
        </p>
      )}
      <ResourceLink video={video} isMobile={isMobile} onNavigateResources={onNavigateResources} />
    </div>
  );
}

export function VideoOfTheDayHeading({ isMobile = false, id }) {
  return (
    <>
      <h2 id={id} style={{ fontSize: isMobile ? 24 : 38, margin: 0 }}>{FEATURED_VIDEO_SECTION_TITLE}</h2>
      <p style={{ color: "#cbd5e1", fontSize: isMobile ? 15 : 18, lineHeight: 1.6, maxWidth: 760, margin: "12px auto 26px" }}>
        {FEATURED_VIDEO_SECTION_SUBTITLE}
      </p>
    </>
  );
}

export async function fetchFeaturedVideo({ signal } = {}) {
  const resp = await fetch(FEATURED_VIDEO_PUBLIC_API, { signal, headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`featured video request failed (${resp.status})`);
  const data = await resp.json();
  return data?.video || null;
}

/** Homepage "Video of the Day" section (replaces "How JD Science Works"). */
export default function VideoOfTheDay({ isMobile = false, onNavigateResources }) {
  const [video, setVideo] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchFeaturedVideo({ signal: controller.signal })
      .then((next) => setVideo(next))
      .catch((err) => {
        if (err?.name !== "AbortError") setVideo(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });
    return () => controller.abort();
  }, []);

  const current = video || DEFAULT_FEATURED_VIDEO;

  return (
    <section
      id="video-of-the-day"
      aria-labelledby="video-of-the-day-title"
      style={{ background: "#071025", color: "#fff", padding: isMobile ? "40px 16px" : "56px 20px" }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <VideoOfTheDayHeading isMobile={isMobile} id="video-of-the-day-title" />
        {loaded ? (
          <VideoOfTheDayContent video={current} isMobile={isMobile} onNavigateResources={onNavigateResources} />
        ) : (
          <div aria-busy="true" aria-label="Loading video" style={{ paddingTop: isMobile ? 34 : 50 }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", height: 0, borderRadius: 18, background: "#111827", border: "1px solid rgba(255,255,255,.18)" }} />
          </div>
        )}
      </div>
    </section>
  );
}
