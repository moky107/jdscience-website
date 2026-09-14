/**
 * Booking form level → subject options.
 * Kept separate from resource-library SUBJECTS_BY_LEVEL so tutoring booking
 * can use science-focused options without changing the past-papers catalogue.
 *
 * Level dropdown `value` and visible `label` are identical and must match the
 * keys in BOOKING_SUBJECTS_BY_LEVEL exactly (including hyphens/capitalisation).
 *
 * Lookup is exact-alias only — never substring matching. Unknown levels log a
 * development warning and surface a validation message instead of a silent [].
 */

export const BOOKING_SUBJECT_PLACEHOLDER = "Select a subject";
export const BOOKING_SUBJECT_REQUIRED_MESSAGE =
  "Please select a subject before submitting.";
export const BOOKING_LEVEL_REQUIRED_MESSAGE =
  "Please select a valid study level (11+, GCSE/IGCSE, A-Level, T-Level, or BTEC).";
export const BOOKING_UNKNOWN_LEVEL_MESSAGE =
  "That study level is not recognised. Please choose 11+, GCSE/IGCSE, A-Level, T-Level, or BTEC.";

/** Canonical level values saved to bookings / Stripe metadata. */
export const BOOKING_LEVEL_VALUES = Object.freeze([
  "11+",
  "GCSE/IGCSE",
  "A-Level",
  "T-Level",
  "BTEC",
]);

/**
 * User-facing level options. `value` === `label` so dropdown values match map keys.
 */
export const BOOKING_LEVEL_OPTIONS = Object.freeze([
  Object.freeze({ value: "11+", label: "11+" }),
  Object.freeze({ value: "GCSE/IGCSE", label: "GCSE/IGCSE" }),
  Object.freeze({ value: "A-Level", label: "A-Level" }),
  Object.freeze({ value: "T-Level", label: "T-Level" }),
  Object.freeze({ value: "BTEC", label: "BTEC" }),
]);

/** @deprecated Prefer BOOKING_LEVEL_OPTIONS; kept for callers that need values only. */
export const BOOKING_LEVELS = BOOKING_LEVEL_VALUES;

export const BOOKING_SUBJECTS_BY_LEVEL = Object.freeze({
  "11+": Object.freeze([
    "English",
    "Maths",
    "Verbal Reasoning",
    "Non-Verbal Reasoning",
    "Mixed Practice",
    "Parent Guide",
  ]),
  "GCSE/IGCSE": Object.freeze(["Biology", "Chemistry", "Physics"]),
  "A-Level": Object.freeze(["Biology", "Chemistry", "Physics"]),
  "T-Level": Object.freeze([
    "Health",
    "Healthcare Science",
    "Laboratory Sciences",
    "Science",
  ]),
  BTEC: Object.freeze([
    "Applied Science",
    "Biology",
    "Chemistry",
    "Health and Social Care",
    "Physics",
  ]),
});

/** Combined DB / legacy labels that must never drive the subject dropdown. */
export const LEGACY_COMBINED_BOOKING_LEVELS = Object.freeze([
  "A-Level/T-Level/BTEC",
  "A Level/T Level/BTEC",
  "A-Level / T-Level / BTEC",
]);

/**
 * Exact aliases only (case-insensitive, whitespace-collapsed).
 * No substring / includes matching.
 */
const BOOKING_LEVEL_ALIASES = Object.freeze({
  "11+": "11+",
  "11 plus": "11+",
  "11plus": "11+",
  "gcse/igcse": "GCSE/IGCSE",
  gcse: "GCSE/IGCSE",
  igcse: "GCSE/IGCSE",
  "a-level": "A-Level",
  "a level": "A-Level",
  btec: "BTEC",
  "btec applied science": "BTEC",
  "t-level": "T-Level",
  "t level": "T-Level",
  "t-level science": "T-Level",
  "t level science": "T-Level",
});

const LEGACY_COMBINED_LOOKUP = new Set(
  LEGACY_COMBINED_BOOKING_LEVELS.map((item) => item.toLowerCase().replace(/\s+/g, " ").trim())
);

function aliasKey(level) {
  return String(level || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function warnUnknownBookingLevel(level, reason) {
  if (typeof console === "undefined" || typeof console.warn !== "function") return;
  const expected = BOOKING_LEVEL_OPTIONS.map((opt) => opt.label).join(", ");
  console.warn(
    `[bookingOptions] ${reason} Received ${JSON.stringify(String(level ?? ""))}. Expected one of: ${expected}.`
  );
}

/**
 * Map a level string onto a supported canonical booking level value.
 * Returns "" for unknown / legacy combined values (never guesses via substring).
 */
export function normalizeBookingLevel(level) {
  const raw = String(level || "").trim();
  if (!raw) return "";

  if (Object.prototype.hasOwnProperty.call(BOOKING_SUBJECTS_BY_LEVEL, raw)) {
    return raw;
  }

  const key = aliasKey(raw);
  if (LEGACY_COMBINED_LOOKUP.has(key)) {
    warnUnknownBookingLevel(
      raw,
      "Rejected legacy combined tutoring_services level; booking UI must use separate options."
    );
    return "";
  }

  const mapped = BOOKING_LEVEL_ALIASES[key];
  if (mapped) return mapped;

  if (raw) {
    warnUnknownBookingLevel(raw, "Unknown booking level.");
  }
  return "";
}

export function bookingLevelLabel(level) {
  const key = normalizeBookingLevel(level);
  const option = BOOKING_LEVEL_OPTIONS.find((item) => item.value === key);
  return option?.label || key || "";
}

/**
 * Subjects for a booking level.
 * Returns `{ ok: true, level, subjects }` or `{ ok: false, level: "", subjects: null, error }`.
 * Never silently returns an empty array for an unknown level.
 */
export function resolveSubjectsForBookingLevel(level) {
  const key = normalizeBookingLevel(level);
  if (!key) {
    const error = String(level || "").trim()
      ? BOOKING_UNKNOWN_LEVEL_MESSAGE
      : BOOKING_LEVEL_REQUIRED_MESSAGE;
    return { ok: false, level: "", subjects: null, error };
  }
  const subjects = BOOKING_SUBJECTS_BY_LEVEL[key];
  if (!subjects || subjects.length === 0) {
    warnUnknownBookingLevel(key, "Canonical level is missing subject options.");
    return { ok: false, level: key, subjects: null, error: BOOKING_UNKNOWN_LEVEL_MESSAGE };
  }
  return { ok: true, level: key, subjects: [...subjects], error: "" };
}

/** Convenience list for known levels only. Unknown levels return null (not []). */
export function subjectsForBookingLevel(level) {
  const resolved = resolveSubjectsForBookingLevel(level);
  return resolved.ok ? resolved.subjects : null;
}

export function isSupportedBookingLevel(level) {
  return Boolean(normalizeBookingLevel(level));
}

export function isValidBookingSubject(level, subject) {
  const value = String(subject || "").trim();
  if (!value) return false;
  const resolved = resolveSubjectsForBookingLevel(level);
  if (!resolved.ok) return false;
  return resolved.subjects.includes(value);
}

export function validateBookingSelection({ level, subject } = {}) {
  const resolved = resolveSubjectsForBookingLevel(level);
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }
  if (!isValidBookingSubject(resolved.level, subject)) {
    return { ok: false, error: BOOKING_SUBJECT_REQUIRED_MESSAGE };
  }
  return { ok: true, level: resolved.level, subject: String(subject).trim() };
}

/**
 * Resolve a tutoring_services row for pricing without letting its level label
 * replace the booking form options.
 *
 * Matching rules (allowlisted, not open-ended substring search):
 * 1. Exact canonical level / slug match
 * 2. Exact legacy combined row match for premium levels (A-Level, T-Level, BTEC)
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

  if (key === "A-Level" || key === "T-Level" || key === "BTEC") {
    return (
      list.find((row) => {
        const label = aliasKey(row?.level || row?.slug || "");
        return LEGACY_COMBINED_LOOKUP.has(label);
      }) || null
    );
  }

  return null;
}

export function isPremiumBookingLevel(level) {
  const key = normalizeBookingLevel(level);
  return key === "A-Level" || key === "T-Level" || key === "BTEC";
}
