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
  const isPdf = /\.pdf$/i.test(item.file_url_override);
  const isLibrary = /\.html(?:$|\?)/i.test(item.file_url_override);
  assert.ok(isPdf || isLibrary, `${item.title} must open a Pearson PDF or library page`);
}

const publicPdfs = PEARSON_BTEC_HSC_RESOURCES.filter((item) => /\.pdf$/i.test(item.file_url_override));
assert.ok(publicPdfs.some((item) => item.file_name === "31490h-unit1-que-2022.pdf"));
assert.ok(publicPdfs.some((item) => item.file_name === "31491h-unit2-que-202201.pdf"));
assert.ok(publicPdfs.some((item) => /btec-nat-excert-hsc/i.test(item.file_name)));
assert.equal(
  exam.filter((item) => item.resource_category === "Past Questions" && /\.pdf$/i.test(item.file_url_override)).length,
  2,
  "only verified public Pearson question papers should be listed as PDFs",
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
  assert.match(landing, /31490h-unit1-que-2022\.pdf/);
  assert.match(landing, /31491h-unit2-que-202201\.pdf/);
  assert.match(landing, /Open PDF/);
  assert.doesNotMatch(landing, /Exam-Series=/);
}

console.log(`btec health and social care catalogue tests passed (${PEARSON_BTEC_HSC_RESOURCES.length} items)`);
