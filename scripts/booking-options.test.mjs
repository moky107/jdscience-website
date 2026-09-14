import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOOKING_LEVEL_OPTIONS,
  BOOKING_LEVEL_VALUES,
  BOOKING_LEVELS,
  BOOKING_SUBJECT_PLACEHOLDER,
  BOOKING_SUBJECT_REQUIRED_MESSAGE,
  BOOKING_UNKNOWN_LEVEL_MESSAGE,
  BOOKING_SUBJECTS_BY_LEVEL,
  bookingLevelLabel,
  findTutoringServiceForLevel,
  isPremiumBookingLevel,
  isValidBookingSubject,
  normalizeBookingLevel,
  resolveSubjectsForBookingLevel,
  subjectsForBookingLevel,
  validateBookingSelection,
} from "../src/bookingOptions.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const bookingFormSource = fs.readFileSync(path.join(root, "src/BookingForm.jsx"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
const createBookingSource = fs.readFileSync(path.join(root, "api/create-booking.js"), "utf8");
const checkoutSource = fs.readFileSync(path.join(root, "api/create-checkout-session.js"), "utf8");

assert.deepEqual(BOOKING_LEVEL_VALUES, [
  "11+",
  "GCSE/IGCSE",
  "A-Level",
  "T-Level",
  "BTEC",
]);
assert.deepEqual(BOOKING_LEVELS, BOOKING_LEVEL_VALUES);

assert.deepEqual(
  BOOKING_LEVEL_OPTIONS.map((opt) => opt.value),
  BOOKING_LEVEL_VALUES
);
assert.deepEqual(
  BOOKING_LEVEL_OPTIONS.map((opt) => opt.label),
  ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"]
);
for (const opt of BOOKING_LEVEL_OPTIONS) {
  assert.equal(
    opt.label,
    opt.value,
    `Level dropdown label must exactly match bookingOptions key/value (${opt.value})`
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(BOOKING_SUBJECTS_BY_LEVEL, opt.value),
    `BOOKING_SUBJECTS_BY_LEVEL must have key ${opt.value}`
  );
}

assert.equal(BOOKING_SUBJECT_PLACEHOLDER, "Select a subject");
assert.match(BOOKING_SUBJECT_REQUIRED_MESSAGE, /select a subject/i);

const expectedSubjects = {
  "11+": [
    "English",
    "Maths",
    "Verbal Reasoning",
    "Non-Verbal Reasoning",
    "Mixed Practice",
    "Parent Guide",
  ],
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics"],
  "A-Level": ["Biology", "Chemistry", "Physics"],
  "T-Level": ["Health", "Healthcare Science", "Laboratory Sciences", "Science"],
  BTEC: ["Applied Science", "Biology", "Chemistry", "Health and Social Care", "Physics"],
};

for (const level of BOOKING_LEVEL_VALUES) {
  const options = subjectsForBookingLevel(level);
  assert.ok(Array.isArray(options) && options.length > 0, `${level} must have subject options`);
  assert.deepEqual(options, expectedSubjects[level]);
  assert.deepEqual(BOOKING_SUBJECTS_BY_LEVEL[level], expectedSubjects[level]);
  assert.deepEqual(resolveSubjectsForBookingLevel(level), {
    ok: true,
    level,
    subjects: expectedSubjects[level],
    error: "",
  });

  for (const subject of options) {
    assert.equal(isValidBookingSubject(level, subject), true);
    assert.deepEqual(validateBookingSelection({ level, subject }), {
      ok: true,
      level,
      subject,
    });
  }

  assert.equal(isValidBookingSubject(level, ""), false);
  assert.equal(isValidBookingSubject(level, "Not a real subject"), false);
  const missing = validateBookingSelection({ level, subject: "" });
  assert.equal(missing.ok, false);
  assert.equal(missing.error, BOOKING_SUBJECT_REQUIRED_MESSAGE);
}

assert.equal(bookingLevelLabel("11+"), "11+");
assert.equal(bookingLevelLabel("BTEC"), "BTEC");
assert.equal(bookingLevelLabel("T-Level"), "T-Level");
assert.equal(bookingLevelLabel("A-Level"), "A-Level");
assert.equal(bookingLevelLabel("GCSE/IGCSE"), "GCSE/IGCSE");
assert.equal(normalizeBookingLevel("11 plus"), "11+");
assert.equal(normalizeBookingLevel("11plus"), "11+");
assert.equal(isPremiumBookingLevel("11+"), false);

assert.equal(normalizeBookingLevel("A-Level/T-Level/BTEC"), "");
assert.equal(normalizeBookingLevel("A Level/T Level/BTEC"), "");
assert.equal(subjectsForBookingLevel("A-Level/T-Level/BTEC"), null);
assert.equal(resolveSubjectsForBookingLevel("A-Level/T-Level/BTEC").ok, false);
assert.equal(
  resolveSubjectsForBookingLevel("A-Level/T-Level/BTEC").error,
  BOOKING_UNKNOWN_LEVEL_MESSAGE
);
assert.equal(
  validateBookingSelection({
    level: "A-Level/T-Level/BTEC",
    subject: "Chemistry",
  }).ok,
  false
);

assert.equal(normalizeBookingLevel("A Level"), "A-Level");
assert.equal(normalizeBookingLevel("T Level"), "T-Level");
assert.equal(normalizeBookingLevel("T-Level Science"), "T-Level");
assert.equal(normalizeBookingLevel("BTEC"), "BTEC");
assert.equal(normalizeBookingLevel("BTEC Applied Science"), "BTEC");
assert.equal(normalizeBookingLevel("gcse"), "GCSE/IGCSE");
assert.equal(normalizeBookingLevel("IGCSE"), "GCSE/IGCSE");

// Exact aliases only — substring guesses must not succeed.
assert.equal(normalizeBookingLevel("Advanced A-Level Chemistry pathway"), "");
assert.equal(normalizeBookingLevel("something-btec-extra"), "");
assert.equal(subjectsForBookingLevel("Advanced A-Level Chemistry pathway"), null);

assert.equal(isPremiumBookingLevel("A-Level"), true);
assert.equal(isPremiumBookingLevel("T-Level"), true);
assert.equal(isPremiumBookingLevel("BTEC"), true);
assert.equal(isPremiumBookingLevel("BTEC Applied Science"), true);
assert.equal(isPremiumBookingLevel("GCSE/IGCSE"), false);

const services = [
  { id: 1, level: "GCSE/IGCSE", price_per_hour: 35, package_price_10: 300 },
  { id: 2, level: "A-Level/T-Level/BTEC", price_per_hour: 45, package_price_10: 400 },
];
assert.equal(findTutoringServiceForLevel(services, "GCSE/IGCSE")?.id, 1);
assert.equal(findTutoringServiceForLevel(services, "A-Level")?.id, 2);
assert.equal(findTutoringServiceForLevel(services, "BTEC")?.id, 2);
assert.equal(findTutoringServiceForLevel(services, "T-Level")?.id, 2);

assert.match(appSource, /from "\.\/bookingOptions"/);
assert.match(appSource, /from "\.\/BookingForm"/);
assert.match(appSource, /BOOKING_LEVEL_OPTIONS/);
assert.match(appSource, /id="book-anchor"><BookingForm/);
assert.doesNotMatch(appSource, /function Booking\(/);
assert.doesNotMatch(
  appSource,
  /services\.length > 0 \? services\.map\(s => <option key=\{s\.id\} value=\{s\.level\}>/
);

assert.match(bookingFormSource, /BOOKING_LEVEL_OPTIONS/);
assert.match(bookingFormSource, /resolveSubjectsForBookingLevel/);
assert.match(bookingFormSource, /BOOKING_SUBJECT_PLACEHOLDER/);
assert.match(bookingFormSource, /validateBookingSelection/);
assert.match(bookingFormSource, /next\.subject = ""/);
assert.match(bookingFormSource, /data-testid="booking-level"/);
assert.match(bookingFormSource, /data-testid="booking-subject"/);
assert.match(bookingFormSource, /overflow:\s*"visible"/);
assert.match(bookingFormSource, /WebkitAppearance:\s*"menulist"/);
assert.doesNotMatch(
  bookingFormSource,
  /services\.length > 0 \? services\.map/
);

assert.match(stylesSource, /\.booking-select/);
assert.match(stylesSource, /-webkit-appearance:\s*menulist/);

assert.match(createBookingSource, /validateBookingSelection/);
assert.match(createBookingSource, /selection\.level/);
assert.match(createBookingSource, /selection\.subject/);
assert.match(checkoutSource, /validateBookingSelection/);
assert.match(checkoutSource, /level: selection\.level/);
assert.match(checkoutSource, /subject: selection\.subject/);
assert.match(checkoutSource, /isPremiumBookingLevel/);

console.log("booking-options.test.mjs: ok");
