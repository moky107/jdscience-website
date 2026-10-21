import { GCSE_CHEMISTRY_LESSON_VIDEOS } from "./gcseChemistryVideos.js";

export const TODAYS_VIDEO = GCSE_CHEMISTRY_LESSON_VIDEOS.find(
  (item) => item.topicSlug === "six-mark-questions",
);

export const TODAYS_VIDEO_HEADING = "Today's video";
export const TODAYS_VIDEO_SUBTITLE =
  "GCSE Chemistry: how to get full marks in six-mark questions.";
export const TODAYS_VIDEO_PAGE_HREF = TODAYS_VIDEO.file_url_override.replace(
  /\/[^/]+$/,
  "/",
);
export const CHEMISTRY_VIDEOS_HREF = "/resources/gcse/chemistry/videos/";

export const INTRO_VIDEO_SRC = TODAYS_VIDEO.file_url_override;
export const INTRO_VIDEO_POSTER = `${TODAYS_VIDEO_PAGE_HREF}poster.jpg`;
export const INTRO_VIDEO_TYPE = "video/mp4";

/** Stable attributes for the homepage today's-video `<video>` element. */
export function homepageVideoElementProps({ autoPlay = false } = {}) {
  return {
    title: TODAYS_VIDEO.title,
    poster: INTRO_VIDEO_POSTER,
    controls: true,
    muted: false,
    playsInline: true,
    preload: "metadata",
    autoPlay: Boolean(autoPlay),
    loop: false,
  };
}

export function homepageVideoSourceProps() {
  return {
    src: INTRO_VIDEO_SRC,
    type: INTRO_VIDEO_TYPE,
  };
}
