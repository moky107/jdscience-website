/**
 * Booking form level → subject/course options.
 * Kept separate from resource-library SUBJECTS_BY_LEVEL so tutoring booking
 * can offer course units without changing the past-papers catalogue.
 */

export const BOOKING_SUBJECT_PLACEHOLDER = "Select a subject or course";
export const BOOKING_SUBJECT_REQUIRED_MESSAGE =
  "Please select a subject or course before submitting.";

export const BOOKING_LEVELS = [
  "11+",
  "GCSE/IGCSE",
  "A-Level",
  "T-Level",
  "BTEC Applied Science",
];

export const BOOKING_SUBJECTS_BY_LEVEL = {
  "11+": [
    "English",
    "Maths",
    "Verbal Reasoning",
    "Non-Verbal Reasoning",
    "Mixed Practice",
    "Parent Guide",
  ],
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics", "Maths"],
  "A-Level": ["Chemistry", "Physics", "Biology"],
  "T-Level": ["Science", "Healthcare Science", "Laboratory Sciences"],
  "BTEC Applied Science": [
    "Principles and Applications of Science",
    "Practical Scientific Procedures and Techniques",
    "Science Investigation Skills",
    "Laboratory Techniques",
    "Physiology of Human Body Systems",
    "Contemporary Issues in Science",
    "Other Applied Science support",
  ],
};

/** Combined DB / legacy labels that must never drive the subject dropdown. */
export const LEGACY_COMBINED_BOOKING_LEVELS = [
  "A-Level/T-Level/BTEC",
  "A Level/T Level/BTEC",
  "A-Level / T-Level / BTEC",
];

/**
 * Map free-text / legacy level labels onto a supported booking level key.
 * Combined "A-Level/T-Level/BTEC" style values are intentionally unresolved
 * (return "") so the UI never pretends they have a single subject list.
 */
export function normalizeBookingLevel(level) {
  const raw = String(level || "").trim();
  if (!raw) return "";
  if (BOOKING_SUBJECTS_BY_LEVEL[raw]) return raw;

  const lower = raw.toLowerCase().replace(/\s+/g, " ");
  const compact = lower.replace(/[\s_/]+/g, "");

  if (LEGACY_COMBINED_BOOKING_LEVELS.some((item) => item.toLowerCase() === lower)) {
    return "";
  }
  // Combined slug with more than one qualification family.
  if (
    (compact.includes("alevel") || compact.includes("a-level")) &&
    (compact.includes("tlevel") || compact.includes("btec"))
  ) {
    return "";
  }

  if (compact.includes("11") || compact.includes("elevenplus")) return "11+";
  if (compact.includes("gcse") || compact.includes("igcse")) return "GCSE/IGCSE";
  if (compact.includes("alevel") || lower === "a level") return "A-Level";
  if (compact.includes("tlevel") || lower === "t level") return "T-Level";
  if (compact.includes("btec")) return "BTEC Applied Science";
  return "";
}

export function subjectsForBookingLevel(level) {
  const key = normalizeBookingLevel(level);
  if (!key) return [];
  return BOOKING_SUBJECTS_BY_LEVEL[key] || [];
}

export function isSupportedBookingLevel(level) {
  return Boolean(normalizeBookingLevel(level));
}

export function isValidBookingSubject(level, subject) {
  const value = String(subject || "").trim();
  if (!value) return false;
  return subjectsForBookingLevel(level).includes(value);
}

export function validateBookingSelection({ level, subject } = {}) {
  const normalizedLevel = normalizeBookingLevel(level);
  if (!normalizedLevel) {
    return { ok: false, error: "Please select a valid study level." };
  }
  if (!isValidBookingSubject(normalizedLevel, subject)) {
    return { ok: false, error: BOOKING_SUBJECT_REQUIRED_MESSAGE };
  }
  return { ok: true, level: normalizedLevel, subject: String(subject).trim() };
}

/**
 * Resolve a tutoring_services row for pricing without letting its level label
 * replace the booking form options.
 */
export function findTutoringServiceForLevel(services, level) {
  const list = Array.isArray(services) ? services : [];
  const key = normalizeBookingLevel(level);
  if (!key) return null;

  const exact = list.find(
    (row) =>
      String(row?.level || "").trim() === key ||
      String(row?.slug || "").trim() === key
  );
  if (exact) return exact;

  const needle = key.toLowerCase();
  return (
    list.find((row) => {
      const label = String(row?.level || row?.slug || "").toLowerCase();
      if (!label) return false;
      if (needle === "btec applied science") {
        return label.includes("btec");
      }
      return label.includes(needle) || needle.includes(label);
    }) || null
  );
}

export function isPremiumBookingLevel(level) {
  const key = normalizeBookingLevel(level);
  return key === "A-Level" || key === "T-Level" || key === "BTEC Applied Science";
}
