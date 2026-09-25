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
    /** Favour the right side so Joseph and students stay in frame. */
    objectPosition: { desktop: "68% 42%", tablet: "72% 40%", mobile: "78% 38%" },
  },
  {
    id: "physics",
    src: "/images/jdscience-banner-physics.png",
    alt: "Physics tutoring banner with students learning together",
    label: "Physics",
    objectPosition: { desktop: "68% 42%", tablet: "72% 40%", mobile: "78% 38%" },
  },
  {
    id: "biology",
    src: "/images/jdscience-banner-biology.png",
    alt: "Biology tutoring banner with students learning together",
    label: "Biology",
    objectPosition: { desktop: "68% 42%", tablet: "72% 40%", mobile: "78% 38%" },
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
