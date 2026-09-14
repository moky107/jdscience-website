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
  BOOKING_SUBJECTS_BY_LEVEL,
  bookingLevelLabel,
  findTutoringServiceForLevel,
  isPremiumBookingLevel,
  isValidBookingSubject,
  normalizeBookingLevel,
  subjectsForBookingLevel,
  validateBookingSelection,
} from "../src/bookingOptions.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
const createBookingSource = fs.readFileSync(path.join(root, "api/create-booking.js"), "utf8");
const checkoutSource = fs.readFileSync(path.join(root, "api/create-checkout-session.js"), "utf8");

assert.deepEqual(BOOKING_LEVEL_VALUES, [
  "GCSE/IGCSE",
  "A-Level",
  "BTEC",
  "T-Level",
]);
assert.deepEqual(BOOKING_LEVELS, BOOKING_LEVEL_VALUES);

assert.deepEqual(
  BOOKING_LEVEL_OPTIONS.map((opt) => opt.value),
  BOOKING_LEVEL_VALUES
);
assert.deepEqual(
  BOOKING_LEVEL_OPTIONS.map((opt) => opt.label),
  ["GCSE/IGCSE", "A-Level", "BTEC Applied Science", "T-Level Science"]
);

assert.equal(BOOKING_SUBJECT_PLACEHOLDER, "Select a subject");
assert.match(BOOKING_SUBJECT_REQUIRED_MESSAGE, /select a subject/i);

const expectedSubjects = {
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics"],
  "A-Level": ["Biology", "Chemistry", "Physics"],
  BTEC: ["Applied Science"],
  "T-Level": ["Science"],
};

for (const level of BOOKING_LEVEL_VALUES) {
  const options = subjectsForBookingLevel(level);
  assert.ok(options.length > 0, `${level} must have subject options`);
  assert.deepEqual(options, expectedSubjects[level]);
  assert.deepEqual(BOOKING_SUBJECTS_BY_LEVEL[level], expectedSubjects[level]);

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

assert.equal(bookingLevelLabel("BTEC"), "BTEC Applied Science");
assert.equal(bookingLevelLabel("T-Level"), "T-Level Science");
assert.equal(bookingLevelLabel("A-Level"), "A-Level");
assert.equal(bookingLevelLabel("GCSE/IGCSE"), "GCSE/IGCSE");

assert.equal(normalizeBookingLevel("A-Level/T-Level/BTEC"), "");
assert.equal(normalizeBookingLevel("A Level/T Level/BTEC"), "");
assert.deepEqual(subjectsForBookingLevel("A-Level/T-Level/BTEC"), []);
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

assert.match(appSource, /BOOKING_LEVEL_OPTIONS/);
assert.match(appSource, /subjectsForBookingLevel/);
assert.match(appSource, /BOOKING_SUBJECT_PLACEHOLDER/);
assert.match(appSource, /validateBookingSelection/);
assert.match(appSource, /next\.subject = ""/);
assert.doesNotMatch(
  appSource,
  /services\.length > 0 \? services\.map\(s => <option key=\{s\.id\} value=\{s\.level\}>/
);
assert.match(appSource, /overflow:\s*"visible"/);
assert.match(appSource, /WebkitAppearance:\s*"menulist"/);

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
