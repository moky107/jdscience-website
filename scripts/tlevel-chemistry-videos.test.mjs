import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TLEVEL_CHEMISTRY_LESSON_VIDEOS, TLEVEL_CHEMISTRY_VIDEOS } from "../src/tlevelChemistryVideos.js";
import { RESOURCES_PUBLIC_BASE } from "../src/gcseChemistryVideos.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`fail - ${name}`);
    throw error;
  }
}

test("catalog lists the nine A11/A12 Chemistry topics under T-Level Science Videos", () => {
  assert.equal(TLEVEL_CHEMISTRY_LESSON_VIDEOS.length, 9);
  assert.deepEqual(
    TLEVEL_CHEMISTRY_VIDEOS.map((item) => item.topicSlug),
    [
      "a11-1-collision-theory",
      "a11-2-temperature-and-rate",
      "a11-3-catalysts",
      "a12-1-factors-affecting-rates",
      "a12-2-calculating-rate",
      "a12-3-enthalpy-changes",
      "a12-4-industrial-catalysts",
      "a12-5-reversible-reactions",
      "a12-6-haber-process",
    ],
  );
  for (const item of TLEVEL_CHEMISTRY_VIDEOS) {
    assert.equal(item.level, "T-Level");
    assert.equal(item.subject, "Science");
    assert.equal(item.resource_category, "Videos");
    assert.ok(item.description);
    assert.doesNotMatch(JSON.stringify(item), /teacher-marking-scheme|Teacher Answer Workbook|PRIVATE-/);
  }
});

test("all nine A11/A12 lessons are hosted playable lessons", () => {
  const ready = TLEVEL_CHEMISTRY_VIDEOS.filter((item) => item.hosted);
  assert.equal(ready.length, 9);
  for (const lesson of ready) {
    assert.equal(
      lesson.file_url_override,
      `${RESOURCES_PUBLIC_BASE}/t-level/science/videos/${lesson.topicSlug}/${lesson.file_name}`,
    );
    assert.equal(lesson.caption_url, `/resources/t-level/science/videos/${lesson.topicSlug}/captions.vtt`);
    assert.doesNotMatch(lesson.file_url_override, /\/opt\/cursor\/artifacts/);
  }
});

test("student worksheets are public and teacher mark schemes are not catalogued", () => {
  for (const slug of TLEVEL_CHEMISTRY_VIDEOS.map((item) => item.topicSlug)) {
    const worksheet = join(ROOT, `public/resources/t-level/science/videos/${slug}/jdscience-${slug}-worksheet.pdf`);
    assert.ok(existsSync(worksheet), `missing public student worksheet ${slug}`);
  }
  const publicTree = readFileSync(join(ROOT, "src/tlevelChemistryVideos.js"), "utf8");
  assert.doesNotMatch(publicTree, /teacher-marking-scheme|Teacher Answer Workbook/);
});
