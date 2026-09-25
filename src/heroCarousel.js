/** Homepage hero banner carousel — chemistry → physics → biology. */

export const HERO_ROTATION_MS = 60_000;

/**
 * Subject banners layered under the existing Hero copy.
 * Chemistry uses the Joseph Younger classroom banner.
 */
export const HERO_SLIDES = [
  {
    id: "chemistry",
    src: "/images/jdscience-banner-chemistry-joseph-younger.png",
    alt: "Joseph Younger teaching chemistry with students in a classroom",
    label: "Chemistry",
    /** Bias right for Joseph; keep Y higher so heads are not clipped. */
    objectPosition: { desktop: "70% 30%", tablet: "74% 28%", mobile: "82% 28%" },
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

/** Legacy single hero image — used only if a subject banner fails to load. */
export const HERO_FALLBACK_IMG = "/hero-students.png.png";

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
