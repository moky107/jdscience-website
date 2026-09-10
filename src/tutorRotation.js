// Shop carousel advances every 5 minutes.
export const ROTATION_INTERVAL_MS = 300000;
/**
 * Tutor carousel advances every 8 seconds so every published profile
 * actually appears during a normal homepage visit (especially on mobile,
 * where only one card is shown at a time).
 */
export const TUTOR_ROTATION_MS = 8000;
/** Alias kept for existing imports — tutor carousel interval. */
export const FEATURED_ROTATION_MS = TUTOR_ROTATION_MS;
export const FOUNDER_SLUG = "joseph-danso";

const HIDDEN_STATUSES = new Set(["pending", "rejected", "draft", "suspended"]);

export function tutorSlotCount({ isMobile = false, isTablet = false } = {}) {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 3;
}

export function isFounderTutor(tutor) {
  const slug = String(tutor?.public_slug || "").trim().toLowerCase();
  if (!slug) return false;
  return slug === FOUNDER_SLUG || slug.startsWith(`${FOUNDER_SLUG}-`);
}

/** Published / listed tutors for the homepage carousel (includes founder). */
export function isPublishedHomepageTutor(tutor) {
  if (!tutor || !String(tutor.public_slug || "").trim()) return false;
  const status = String(tutor.profile_status || "").trim().toLowerCase();
  if (status && HIDDEN_STATUSES.has(status)) return false;
  if (tutor.is_published === false) return false;
  if (tutor.published === false) return false;
  return true;
}

export function tutorsForHomepage(tutors) {
  return (Array.isArray(tutors) ? tutors : []).filter(isPublishedHomepageTutor);
}

/** Alias kept for existing imports — includes all published tutors. */
export function homepageTutorFallback(tutors) {
  return tutorsForHomepage(tutors);
}

export function featuredTutorWindow(tutors, slotCount = 3, offset = 0) {
  const list = Array.isArray(tutors) ? tutors.filter(Boolean) : [];
  const slots = Math.max(0, Number(slotCount) || 0);
  if (!list.length || slots === 0) return [];
  if (list.length <= slots) return list.slice();
  const start = ((Number(offset) || 0) % list.length + list.length) % list.length;
  return Array.from({ length: slots }, (_, index) => list[(start + index) % list.length]);
}

/** Rotate when there are more published tutors than visible slots. */
export function shouldRotateTutorProfiles(tutors, slotCount = 3) {
  return tutorsForHomepage(tutors).length > Math.max(1, Number(slotCount) || 1);
}

export function tutorCarouselPageCount(tutors, slotCount = 3) {
  const list = tutorsForHomepage(tutors);
  const slots = Math.max(1, Number(slotCount) || 1);
  if (!list.length || list.length <= slots) return 1;
  return list.length;
}

export function tutorCarouselPageIndex(offset, pageCount) {
  const pages = Math.max(1, Number(pageCount) || 1);
  return ((Number(offset) || 0) % pages + pages) % pages;
}
