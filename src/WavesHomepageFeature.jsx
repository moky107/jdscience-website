import React from "react";
import { FeaturedVideoDetails } from "./FeaturedVideoSection";

const WAVES_LESSON = {
  id: "jdscience-waves-clear-intro",
  title: "GCSE Physics: Waves Made Easy",
  description: "Revise amplitude, wavelength, frequency and wave speed with clear explanations and worked examples. Compare transverse and longitudinal waves, then practise the calculations.\n\nOriginal lesson and visuals: Cognito. JD Science edition with revised narration and branding.",
  video_type: "mp4",
  video_src: "https://resource2.heygen.ai/video/0da7ddd3d5dd465189e973d58d5fdbda/original.mp4",
  youtube_id: null,
  thumbnail_src: "/images/waves-made-easy.jpg",
  has_custom_thumbnail: true,
  resource_link: "/papers?level=GCSE%2FIGCSE&subject=Physics&res=Revision+Notes",
};

export default function WavesHomepageFeature({ isMobile = false }) {
  return (
    <section id="waves-physics-lesson" aria-labelledby="waves-physics-title" style={{ background: "#0b2035", color: "#fff", padding: isMobile ? "40px 16px" : "60px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
        <h2 id="waves-physics-title" style={{ fontSize: isMobile ? 26 : 38, margin: "0 0 24px" }}>Featured Physics Lesson</h2>
        <FeaturedVideoDetails video={WAVES_LESSON} isMobile={isMobile} />
      </div>
    </section>
  );
}
