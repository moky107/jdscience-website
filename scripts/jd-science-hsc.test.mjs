import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeResource, isDeadResource, isHostedOfficialExamCopy, resourceOpenHref } from "../src/resourceNormalize.js";
import { JD_SCIENCE_HSC_RESOURCES } from "../src/jdScienceHscResources.js";
import { ALL_HSC_PAPERS } from "./hsc-papers/generate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(JD_SCIENCE_HSC_RESOURCES.length, 12);
assert.equal(ALL_HSC_PAPERS.length, 6);

const papers = JD_SCIENCE_HSC_RESOURCES.filter((item) => item.resource_category === "Past Questions");
const schemes = JD_SCIENCE_HSC_RESOURCES.filter((item) => item.resource_category === "Mark Schemes");
assert.equal(papers.length, 6);
assert.equal(schemes.length, 6);

for (const item of JD_SCIENCE_HSC_RESOURCES) {
  assert.equal(item.level, "BTEC");
  assert.equal(item.subject, "Health and Social Care");
  assert.match(item.file_name, /^JDScience_BTEC_HSC_/);
  assert.match(item.file_url_override, /^\/resources\/btec-level-3\/health-and-social-care\/JDScience_/);
  assert.doesNotMatch(item.file_url_override, /^https:\/\//);
  assert.doesNotMatch(item.file_name, /31490H|31491H|_QU|_MS\.pdf/i);

  const canonical = canonicalizeResource({
    ...item,
    file_url: item.file_url_override,
    published: true,
  });
  assert.ok(canonical, `${item.title} should stay in the catalog`);
  assert.equal(isDeadResource(canonical), false, `${item.title} must not be treated as a dead official copy`);
  assert.equal(isHostedOfficialExamCopy(canonical), false);
  assert.equal(
    resourceOpenHref({ ...canonical, file_url: item.file_url_override }),
    item.file_url_override,
  );

  const pdfPath = path.join(root, "public", item.file_url_override.replace(/^\//, ""));
  assert.equal(fs.existsSync(pdfPath), true, `missing ${item.file_url_override}`);
  assert.ok(fs.statSync(pdfPath).size > 2000, `${item.file_name} is too small to be a real PDF`);
}

for (const paper of ALL_HSC_PAPERS) {
  assert.ok(JD_SCIENCE_HSC_RESOURCES.some((item) => item.file_name === paper.studentFile));
  assert.ok(JD_SCIENCE_HSC_RESOURCES.some((item) => item.file_name === paper.markSchemeFile));
}

console.log(`jd science hsc original papers tests passed (${JD_SCIENCE_HSC_RESOURCES.length} PDFs)`);
