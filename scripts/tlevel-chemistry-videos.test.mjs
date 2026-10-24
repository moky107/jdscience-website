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
  assert.equal(TLEVEL_CHEMISTRY_VIDEOS.length, 9);
  assert.deepEqual(
    TLEVEL_CHEMISTRY_VIDEOS.map((item) => item.topicSlug),
    [
      "a11-1-collision-theory",
      "a11-2-factors-affecting-rate",
      "a11-3-maxwell-boltzmann",
      "a12-1-enthalpy-changes",
      "a12-2-bond-enthalpies",
      "a12-3-hess-law",
      "a12-4-calorimetry",
      "a12-5-enthalpy-profile-diagrams",
      "a12-6-entropy-and-feasibility",
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

test("only A11.1 is a hosted playable lesson in the pilot", () => {
  const ready = TLEVEL_CHEMISTRY_VIDEOS.filter((item) => item.hosted);
  assert.equal(ready.length, 1);
  const lesson = ready[0];
  assert.equal(lesson.topicSlug, "a11-1-collision-theory");
  assert.equal(
    lesson.file_url_override,
    `${RESOURCES_PUBLIC_BASE}/t-level/science/videos/a11-1-collision-theory/jdscience-a11-1-collision-theory-1080p.mp4`,
  );
  assert.equal(lesson.caption_url, "/resources/t-level/science/videos/a11-1-collision-theory/captions.vtt");
  assert.equal(lesson.poster_url, "/resources/t-level/science/videos/a11-1-collision-theory/poster.jpg");
  assert.equal(
    lesson.downloadHref,
    "/resources/t-level/science/videos/a11-1-collision-theory/jdscience-a11-1-collision-theory-worksheet.pdf",
  );
  assert.doesNotMatch(lesson.file_url_override, /\/opt\/cursor\/artifacts/);
});

test("A11.1 student worksheet is public and the teacher mark scheme is not", () => {
  const worksheet = join(
    ROOT,
    "public/resources/t-level/science/videos/a11-1-collision-theory/jdscience-a11-1-collision-theory-worksheet.pdf",
  );
  assert.ok(existsSync(worksheet), "missing public student worksheet");
  const publicTree = readFileSync(join(ROOT, "src/tlevelChemistryVideos.js"), "utf8");
  assert.doesNotMatch(publicTree, /teacher-marking-scheme|Teacher Answer Workbook/);
});
