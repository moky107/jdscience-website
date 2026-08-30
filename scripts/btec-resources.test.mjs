import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  BTEC_APPLIED_SCIENCE_RESOURCES,
  BTEC_APPLIED_SCIENCE_TOPICS,
  BTEC_UNIT1_SERIES,
} from "../src/btecAppliedScienceResources.js";

assert.ok(BTEC_APPLIED_SCIENCE_RESOURCES.length > 0, "expected BTEC catalogue entries");
assert.equal(BTEC_APPLIED_SCIENCE_TOPICS.length, 4, "expected four BTEC Unit 1 topics");

for (const item of BTEC_APPLIED_SCIENCE_RESOURCES) {
  assert.equal(item.level, "BTEC");
  assert.equal(item.subject, "Applied Science");
  assert.equal(item.exam_board, "Pearson");
  assert.match(
    item.resource_category,
    /^(Worksheets|Mark Schemes)$/,
    item.title,
  );
  assert.ok(item.title, "missing title");
  assert.equal(item.series_label, BTEC_UNIT1_SERIES);
  assert.ok(item.topic_slug, `missing topic_slug for ${item.title}`);
  assert.ok(item.file_name, `missing file_name for ${item.title}`);
  assert.match(
    item.file_url_override,
    /^\/resources\/btec-level-3\/applied-science\/unit-1\/(worksheets|answer-sheets)\//,
    item.title,
  );
  assert.doesNotMatch(item.file_url_override, /\.pptx$/i, "PowerPoints must not be free resources");
}

const keys = BTEC_APPLIED_SCIENCE_RESOURCES.map(
  (item) => `${item.topic_slug}|${item.resource_category}|${item.title}`,
);
assert.equal(keys.length, new Set(keys).size, "duplicate BTEC catalogue entries");

const urls = BTEC_APPLIED_SCIENCE_RESOURCES.map((item) => item.file_url_override);
assert.equal(urls.length, new Set(urls).size, "duplicate BTEC catalogue URLs");

for (const topic of BTEC_APPLIED_SCIENCE_TOPICS) {
  assert.ok(topic.slug, "topic missing slug");
  assert.ok(topic.shopSlug, `topic ${topic.title} missing shopSlug`);
  assert.match(topic.shopSlug, /^btec-level-3-[\w-]+-powerpoint$/, topic.shopSlug);
}

const shopSlugs = BTEC_APPLIED_SCIENCE_TOPICS.map((topic) => topic.shopSlug);
assert.equal(shopSlugs.length, new Set(shopSlugs).size, "duplicate shop slugs");

function publicPathFromUrl(url) {
  return path.join("public", url);
}

for (const item of BTEC_APPLIED_SCIENCE_RESOURCES) {
  const filePath = publicPathFromUrl(item.file_url_override);
  assert.ok(fs.existsSync(filePath), `missing public PDF: ${filePath}`);
}

assert.ok(
  BTEC_APPLIED_SCIENCE_RESOURCES.some((item) => item.title === "Chemical Calculations Worksheet"),
);
assert.ok(
  BTEC_APPLIED_SCIENCE_RESOURCES.some((item) => item.title === "Structure and Bonding Answer Sheet"),
);
assert.ok(
  BTEC_APPLIED_SCIENCE_RESOURCES.some((item) => item.title === "Waves in Communication Worksheet"),
);

const cellWorksheet = BTEC_APPLIED_SCIENCE_RESOURCES.find(
  (item) => item.topic_slug === "cell-ultrastructure" && item.resource_category === "Worksheets",
);
assert.equal(cellWorksheet, undefined, "Cell Ultrastructure worksheet not uploaded yet");

const cellTopic = BTEC_APPLIED_SCIENCE_TOPICS.find((topic) => topic.slug === "cell-ultrastructure");
assert.ok(cellTopic?.shopSlug === "btec-level-3-cell-ultrastructure-powerpoint");

console.log(`btec resources catalogue tests passed (${BTEC_APPLIED_SCIENCE_RESOURCES.length} PDFs, ${BTEC_APPLIED_SCIENCE_TOPICS.length} topics)`);
