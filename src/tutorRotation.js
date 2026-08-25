export const FEATURED_TUTOR_SLOTS = 3;
export const FEATURED_ROTATION_MS = 8000;
export const FOUNDER_SLUG = "joseph-danso";

export function tutorsForHomepage(tutors) {
  return (Array.isArray(tutors) ? tutors : []).filter((tutor) => {
    const slug = String(tutor?.public_slug || "").trim().toLowerCase();
    return slug && slug !== FOUNDER_SLUG;
  });
}

export function featuredTutorWindow(tutors, slotCount = FEATURED_TUTOR_SLOTS, offset = 0) {
  const list = Array.isArray(tutors) ? tutors.filter(Boolean) : [];
  const slots = Math.max(0, Number(slotCount) || 0);
  if (!list.length || slots === 0) return [];
  if (list.length <= slots) return list.slice();
  const start = ((Number(offset) || 0) % list.length + list.length) % list.length;
  return Array.from({ length: slots }, (_, index) => list[(start + index) % list.length]);
}

export function shouldRotateTutorProfiles(tutors, slotCount = FEATURED_TUTOR_SLOTS) {
  return tutorsForHomepage(tutors).length > slotCount;
}
