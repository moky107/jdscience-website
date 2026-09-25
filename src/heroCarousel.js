/** Homepage hero banner carousel — original hero + chemistry → physics → biology. */

export const HERO_ROTATION_MS = 20_000;

/** Legacy single hero image — also kept as a carousel slide. */
export const HERO_FALLBACK_IMG = "/hero-students.png.png";

/**
 * Banners layered under the existing Hero copy.
 * Keeps the original hero, then adds the subject banners.
 * Chemistry uses the Joseph Younger classroom banner.
 */
export const HERO_SLIDES = [
  {
    id: "original",
    src: HERO_FALLBACK_IMG,
    alt: "Students learning together",
    label: "JD Science",
    /** Match the previous single-hero crop. */
    objectPosition: { desktop: "center 34%", tablet: "center 34%", mobile: "center 28%" },
  },
  {
    id: "chemistry",
    src: "/images/jdscience-banner-chemistry-joseph-younger.png",
    alt: "Joseph Younger supervising students during a chemistry lab experiment",
    label: "Chemistry",
    /**
     * Banner-aspect asset keeps Joseph's supervising gesture + students in frame.
     * Bias right toward Joseph; mid Y so heads and lab work stay visible together.
     */
    objectPosition: { desktop: "72% 45%", tablet: "76% 42%", mobile: "88% 38%" },
  },
  {
    id: "physics",
    src: "/images/jdscience-banner-physics.png",
    alt: "Physics tutoring banner with students learning together",
    label: "Physics",
    /** Slightly lower focal point so probes / LEDs stay in frame with faces. */
    objectPosition: { desktop: "62% 46%", tablet: "66% 44%", mobile: "70% 40%" },
  },
  {
    id: "biology",
    src: "/images/jdscience-banner-biology.png",
    alt: "Biology tutoring banner with students learning together",
    label: "Biology",
    /** Center-right cluster around the microscope; preserve headroom. */
    objectPosition: { desktop: "64% 34%", tablet: "68% 32%", mobile: "72% 30%" },
  },
];

export function heroSlideIndex(index, length = HERO_SLIDES.length) {
  const n = Math.max(1, Number(length) || 1);
  return ((Number(index) || 0) % n + n) % n;
}

export function heroObjectPosition(slide, { isMobile = false, isTablet = false } = {}) {
  const positions = slide?.objectPosition || {};
  if (isMobile) return positions.mobile || "center 28%";
  if (isTablet) return positions.tablet || "center 34%";
  return positions.desktop || "center 34%";
}
