export const FEATURED_ROTATION_MS = 5000;
export const FOUNDER_SLUG = "joseph-danso";

export function tutorSlotCount({ isMobile = false, isTablet = false } = {}) {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 3;
}

export function tutorsForHomepage(tutors) {
  return (Array.isArray(tutors) ? tutors : []).filter((tutor) => {
    const slug = String(tutor?.public_slug || "").trim().toLowerCase();
    return slug && slug !== FOUNDER_SLUG;
  });
}

export function featuredTutorWindow(tutors, slotCount = 3, offset = 0) {
  const list = Array.isArray(tutors) ? tutors.filter(Boolean) : [];
  const slots = Math.max(0, Number(slotCount) || 0);
  if (!list.length || slots === 0) return [];
  if (list.length <= slots) return list.slice();
  const start = ((Number(offset) || 0) % list.length + list.length) % list.length;
  return Array.from({ length: slots }, (_, index) => list[(start + index) % list.length]);
}

export function shouldRotateTutorProfiles(tutors, slotCount = 3) {
  return tutorsForHomepage(tutors).length > slotCount;
}

export function tutorCarouselPageCount(tutors, slotCount = 3) {
  const list = tutorsForHomepage(tutors);
  if (!list.length || list.length <= slotCount) return 1;
  return list.length;
}

export function tutorCarouselPageIndex(offset, pageCount) {
  const pages = Math.max(1, Number(pageCount) || 1);
  return ((Number(offset) || 0) % pages + pages) % pages;
}
