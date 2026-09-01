import assert from "node:assert/strict";
import { hasAwardingBodyUrl } from "../src/resourceNormalize.js";
import { PEARSON_BTEC_HSC_RESOURCES } from "../src/pearsonBtecHealthSocialCareResources.js";

assert.ok(PEARSON_BTEC_HSC_RESOURCES.length > 0, "expected HSC catalogue entries");

const exam = PEARSON_BTEC_HSC_RESOURCES.filter((item) =>
  /^(Past Questions|Mark Schemes|Examiner Reports)$/.test(item.resource_category),
);
assert.ok(exam.some((item) => item.resource_category === "Past Questions"));
assert.ok(exam.some((item) => item.resource_category === "Mark Schemes"));
assert.ok(exam.some((item) => item.resource_category === "Examiner Reports"));

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
}

const keys = PEARSON_BTEC_HSC_RESOURCES.map(
  (item) => `${item.resource_category}|${item.series_label}|${item.title}|${item.file_name}`,
);
assert.equal(keys.length, new Set(keys).size, "duplicate HSC catalogue entries");

const files = PEARSON_BTEC_HSC_RESOURCES.map((item) => item.file_name);
assert.equal(files.length, new Set(files).size, "duplicate HSC file names");

assert.ok(exam.some((item) => item.file_name === "31490h-unit1-que-2022.pdf"));
assert.ok(exam.some((item) => item.file_name === "31491h-unit2-que-202201.pdf"));
assert.ok(exam.some((item) => /31490H_0625_QU/.test(item.file_name)));
assert.ok(exam.some((item) => /31491H_0625_MS/.test(item.file_name)));
assert.ok(exam.some((item) => item.resource_category === "Examiner Reports"));

console.log(`btec health and social care catalogue tests passed (${PEARSON_BTEC_HSC_RESOURCES.length} items)`);
