import assert from "node:assert/strict";
import fs from "node:fs";
import { hasAwardingBodyUrl, resourceOpenHref } from "../src/resourceNormalize.js";
import { PEARSON_BTEC_HSC_RESOURCES } from "../src/pearsonBtecHealthSocialCareResources.js";

assert.ok(PEARSON_BTEC_HSC_RESOURCES.length > 0, "expected HSC catalogue entries");

const exam = PEARSON_BTEC_HSC_RESOURCES.filter((item) =>
  /^(Past Questions|Mark Schemes|Examiner Reports)$/.test(item.resource_category),
);
assert.ok(exam.some((item) => item.resource_category === "Past Questions"));
assert.ok(exam.some((item) => item.resource_category === "Mark Schemes"));
assert.ok(exam.some((item) => item.resource_category === "Examiner Reports"));
assert.ok(PEARSON_BTEC_HSC_RESOURCES.some((item) => item.resource_category === "Specifications"));

for (const item of PEARSON_BTEC_HSC_RESOURCES) {
  assert.equal(item.level, "BTEC");
  assert.equal(item.subject, "Health and Social Care");
  assert.equal(item.exam_board, "Pearson");
  assert.ok(item.title, "missing title");
  assert.ok(item.file_name, `missing file_name for ${item.title}`);
  assert.ok(item.series_label, `missing series for ${item.title}`);
  assert.ok(hasAwardingBodyUrl(item), `${item.title} must link to Pearson`);
  assert.match(item.file_url_override, /^https:\/\/qualifications\.pearson\.com\//);
  assert.doesNotMatch(item.file_url_override, /^\/resources\//);
  assert.doesNotMatch(item.file_url_override, /Exam-Series=/);
  const href = resourceOpenHref({
    ...item,
    file_url: item.file_url_override,
  });
  assert.equal(href, item.file_url_override, `${item.title} must open the Pearson URL`);
}

assert.equal(
  exam.filter((item) => /\.pdf$/i.test(item.file_url_override)).length,
  0,
  "official Pearson exam papers must not be hosted or deep-linked as JD Science copies",
);

const keys = PEARSON_BTEC_HSC_RESOURCES.map(
  (item) => `${item.resource_category}|${item.series_label}|${item.title}|${item.file_name}`,
);
assert.equal(keys.length, new Set(keys).size, "duplicate HSC catalogue entries");

const files = PEARSON_BTEC_HSC_RESOURCES.map((item) => item.file_name);
assert.equal(files.length, new Set(files).size, "duplicate HSC file names");

const landingPath = "public/resources/btec/health-and-social-care/index.html";
if (fs.existsSync(landingPath)) {
  const landing = fs.readFileSync(landingPath, "utf8");
  assert.match(landing, /JDScience_BTEC_HSC_Unit1_Practice_Set_A\.pdf/);
  assert.match(landing, /Open PDF/);
  assert.doesNotMatch(landing, /31490h-unit1-que-2022/);
  assert.doesNotMatch(landing, /Exam-Series=/);
}

console.log(`btec health and social care Pearson-link tests passed (${PEARSON_BTEC_HSC_RESOURCES.length} items)`);
