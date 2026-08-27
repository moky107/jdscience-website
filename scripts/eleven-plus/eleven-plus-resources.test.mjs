import assert from "node:assert/strict";
import {
  ELEVEN_PLUS_ATTRIBUTION_NOTICE,
  ELEVEN_PLUS_RESOURCES,
  ELEVEN_PLUS_SECTIONS,
  resourcesForSection,
  sectionSlug,
} from "../../src/elevenPlusResourcesCatalog.js";

assert.match(ELEVEN_PLUS_ATTRIBUTION_NOTICE, /Third-party resources remain the property/);
assert.deepEqual(ELEVEN_PLUS_SECTIONS, [
  "English",
  "Mathematics",
  "Verbal Reasoning",
  "Non-Verbal and Spatial Reasoning",
  "Mixed Practice Papers",
  "Answer Booklets",
]);

assert.ok(ELEVEN_PLUS_RESOURCES.length >= 30, "catalog should list a useful set of free resources");

const ids = new Set();
for (const item of ELEVEN_PLUS_RESOURCES) {
  assert.ok(item.id && !ids.has(item.id), `unique id required: ${item.id}`);
  ids.add(item.id);
  assert.ok(ELEVEN_PLUS_SECTIONS.includes(item.section), `${item.id} has unknown section`);
  assert.ok(item.title && item.subject && item.resourceType && item.publisher && item.description);
  assert.ok(item.url, `${item.id} needs a url`);
  assert.equal(typeof item.external, "boolean");

  if (item.external) {
    assert.match(item.url, /^https:\/\//, `${item.id} external url must be https`);
    assert.doesNotMatch(item.url, /supabase|storage\/v1/i, `${item.id} must not point at Supabase Storage`);
  } else {
    assert.ok(
      item.url.startsWith("/resources/11plus/"),
      `${item.id} JDScience files must stay on /resources/11plus/`,
    );
    assert.match(item.publisher, /JDScience/i);
  }
}

for (const section of ELEVEN_PLUS_SECTIONS) {
  assert.ok(resourcesForSection(section).length > 0, `${section} must not be empty`);
  assert.ok(sectionSlug(section).length > 0);
}

const publishers = new Set(ELEVEN_PLUS_RESOURCES.filter((item) => item.external).map((item) => item.publisher));
for (const required of ["GL Assessment", "CGP", "Collins", "Examberry", "The Exam Coach"]) {
  assert.ok(publishers.has(required), `missing publisher ${required}`);
}

// Collins individual SharePoint samples redirect to Microsoft login — only the public hub is allowed.
for (const item of ELEVEN_PLUS_RESOURCES.filter((item) => item.publisher === "Collins")) {
  assert.equal(
    item.url,
    "https://collins.co.uk/pages/revision-collins-11-free-samples",
    "Collins cards must use the public free-samples hub (SharePoint links require login)",
  );
}

console.log(`eleven-plus resources catalog tests passed (${ELEVEN_PLUS_RESOURCES.length} items)`);
