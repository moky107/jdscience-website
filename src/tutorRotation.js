// 5 minutes
export const ROTATION_INTERVAL_MS = 300000;
/** Alias used by the homepage tutor carousel. */
export const FEATURED_ROTATION_MS = ROTATION_INTERVAL_MS;
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

export function featuredTutorWindow(tutors, slotCount = 1, offset = 0) {
  const list = Array.isArray(tutors) ? tutors.filter(Boolean) : [];
  const slots = Math.max(0, Number(slotCount) || 0);
  if (!list.length || slots === 0) return [];
  if (list.length <= slots) return list.slice();
  const start = ((Number(offset) || 0) % list.length + list.length) % list.length;
  return Array.from({ length: slots }, (_, index) => list[(start + index) % list.length]);
}

/** Rotate whenever there is more than one published tutor. */
export function shouldRotateTutorProfiles(tutors) {
  return tutorsForHomepage(tutors).length > 1;
}

export function tutorCarouselPageCount(tutors) {
  const list = tutorsForHomepage(tutors);
  return Math.max(1, list.length);
}

export function tutorCarouselPageIndex(offset, pageCount) {
  const pages = Math.max(1, Number(pageCount) || 1);
  return ((Number(offset) || 0) % pages + pages) % pages;
}
