/**
 * Booking form level → subject options.
 * Kept separate from resource-library SUBJECTS_BY_LEVEL so tutoring booking
 * can use science-focused options without changing the past-papers catalogue.
 *
 * Canonical `value` strings are what the UI submits and what the API / DB store.
 * `label` is display-only (e.g. "BTEC Applied Science" vs canonical "BTEC").
 */

export const BOOKING_SUBJECT_PLACEHOLDER = "Select a subject";
export const BOOKING_SUBJECT_REQUIRED_MESSAGE =
  "Please select a subject before submitting.";

/** Canonical level values saved to bookings / Stripe metadata. */
export const BOOKING_LEVEL_VALUES = [
  "GCSE/IGCSE",
  "A-Level",
  "BTEC",
  "T-Level",
];

/**
 * User-facing level options. `value` is canonical; `label` is display text.
 */
export const BOOKING_LEVEL_OPTIONS = [
  { value: "GCSE/IGCSE", label: "GCSE/IGCSE" },
  { value: "A-Level", label: "A-Level" },
  { value: "BTEC", label: "BTEC Applied Science" },
  { value: "T-Level", label: "T-Level Science" },
];

/** @deprecated Prefer BOOKING_LEVEL_OPTIONS; kept for callers that need values only. */
export const BOOKING_LEVELS = BOOKING_LEVEL_VALUES;

export const BOOKING_SUBJECTS_BY_LEVEL = {
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics"],
  "A-Level": ["Biology", "Chemistry", "Physics"],
  BTEC: ["Applied Science"],
  "T-Level": ["Science"],
};

/** Combined DB / legacy labels that must never drive the subject dropdown. */
export const LEGACY_COMBINED_BOOKING_LEVELS = [
  "A-Level/T-Level/BTEC",
  "A Level/T Level/BTEC",
  "A-Level / T-Level / BTEC",
];

/**
 * Map free-text / legacy level labels onto a supported booking level value.
 * Combined "A-Level/T-Level/BTEC" style values are intentionally unresolved
 * (return "") so the UI never pretends they have a single subject list.
 */
export function normalizeBookingLevel(level) {
  const raw = String(level || "").trim();
  if (!raw) return "";
  if (BOOKING_SUBJECTS_BY_LEVEL[raw]) return raw;

  const lower = raw.toLowerCase().replace(/\s+/g, " ");
  const compact = lower.replace(/[\s_/\-]+/g, "");

  if (LEGACY_COMBINED_BOOKING_LEVELS.some((item) => item.toLowerCase() === lower)) {
    return "";
  }
  // Combined slug with more than one qualification family.
  if (
    (compact.includes("alevel")) &&
    (compact.includes("tlevel") || compact.includes("btec"))
  ) {
    return "";
  }

  if (compact.includes("gcse") || compact.includes("igcse")) return "GCSE/IGCSE";
  if (compact.includes("alevel") || lower === "a level") return "A-Level";
  if (compact.includes("tlevel") || lower.includes("t-level science") || lower === "t level") {
    return "T-Level";
  }
  if (compact.includes("btec")) return "BTEC";
  return "";
}

export function bookingLevelLabel(level) {
  const key = normalizeBookingLevel(level);
  const option = BOOKING_LEVEL_OPTIONS.find((item) => item.value === key);
  return option?.label || key || "";
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
      if (needle === "btec") return label.includes("btec");
      if (needle === "t-level") return label.includes("t-level") || label.includes("t level");
      if (needle === "a-level") return label.includes("a-level") || label.includes("a level");
      if (needle === "gcse/igcse") return label.includes("gcse") || label.includes("igcse");
      return label.includes(needle) || needle.includes(label);
    }) || null
  );
}

export function isPremiumBookingLevel(level) {
  const key = normalizeBookingLevel(level);
  return key === "A-Level" || key === "T-Level" || key === "BTEC";
}
