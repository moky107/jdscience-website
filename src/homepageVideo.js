export const INTRO_VIDEO_SRC = "/homepage-promo.mp4";
export const INTRO_VIDEO_POSTER = "/homepage-promo-poster.jpg";
export const INTRO_VIDEO_TYPE = "video/mp4";

/** Stable attributes for the homepage intro `<video>` element. */
export function homepageVideoElementProps({ autoPlay = true } = {}) {
  return {
    title: "How JD Science Works",
    poster: INTRO_VIDEO_POSTER,
    controls: true,
    muted: true,
    playsInline: true,
    preload: "metadata",
    autoPlay: Boolean(autoPlay),
    loop: true,
  };
}

export function homepageVideoSourceProps() {
  return {
    src: INTRO_VIDEO_SRC,
    type: INTRO_VIDEO_TYPE,
  };
}
