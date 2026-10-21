import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO,
  GCSE_CHEMISTRY_LESSON_VIDEOS,
  GCSE_CHEMISTRY_VIDEOS,
} from "../src/gcseChemistryVideos.js";
import { mergeResourceCatalog } from "../src/resourceNormalize.js";

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

test("catalog publishes six full GCSE Chemistry lessons plus Key Concepts, not the 60s sample", () => {
  assert.equal(GCSE_CHEMISTRY_LESSON_VIDEOS.length, 6);
  assert.deepEqual(
    GCSE_CHEMISTRY_LESSON_VIDEOS.map((item) => item.topicSlug),
    ["six-mark-questions", "calculating-moles", "concentration", "percentage-by-mass", "empirical-formulae", "atom-economy"],
  );
  assert.equal(GCSE_CHEMISTRY_VIDEOS.at(-1).title, GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO.title);
  for (const item of GCSE_CHEMISTRY_LESSON_VIDEOS) {
    assert.equal(item.level, "GCSE/IGCSE");
    assert.equal(item.subject, "Chemistry");
    assert.equal(item.resource_category, "Videos");
    assert.equal(item.all_boards, true);
    assert.match(item.file_name, /^jdscience-.+-1080p\.mp4$/);
    assert.doesNotMatch(item.file_name, /60s-sample/);
    assert.equal(
      item.file_url_override,
      `/resources/gcse/chemistry/videos/${item.topicSlug}/${item.file_name}`,
    );
    assert.ok(existsSync(join(ROOT, item.source_path)), `missing source ${item.source_path}`);
    assert.ok(statSync(join(ROOT, item.source_path)).size > 1_000_000, `${item.source_path} looks too small`);
  }
});

test("public GCSE Chemistry video pages embed native MP4 players", () => {
  const indexPath = join(ROOT, "public/resources/gcse/chemistry/videos/index.html");
  const indexHtml = readFileSync(indexPath, "utf8");
  for (const item of GCSE_CHEMISTRY_LESSON_VIDEOS) {
    const publicFile = join(ROOT, "public", item.file_url_override.replace(/^\//, ""));
    const pagePath = join(ROOT, `public/resources/gcse/chemistry/videos/${item.topicSlug}/index.html`);
    assert.ok(existsSync(publicFile), `missing public copy ${item.file_url_override}`);
    assert.equal(statSync(publicFile).size, statSync(join(ROOT, item.source_path)).size);
    assert.ok(existsSync(pagePath), `missing topic page for ${item.topicSlug}`);
    const html = readFileSync(pagePath, "utf8");
    assert.match(html, /<video[\s\S]*type="video\/mp4"/);
    assert.match(html, new RegExp(item.file_name.replace(".", "\\.")));
    assert.match(indexHtml, new RegExp(`/resources/gcse/chemistry/videos/${item.topicSlug}/`));
    const bytes = readFileSync(publicFile);
    const moov = bytes.indexOf(Buffer.from("moov"));
    const mdat = bytes.indexOf(Buffer.from("mdat"));
    assert.ok(moov >= 0 && mdat >= 0 && moov < mdat, `${item.file_name} must be faststart`);
  }
  assert.match(indexHtml, /key-concepts-in-chemistry/);
});

test("papers catalog keeps original lesson titles and mp4 file names", () => {
  const staticItems = GCSE_CHEMISTRY_VIDEOS.map((resource, index) => ({
    id: `static-video-${index}`,
    ...resource,
    file_url: resource.embed_url || resource.file_url_override,
    file_type: resource.embed_url ? "video-embed" : "video/mp4",
    published: true,
  }));
  const merged = mergeResourceCatalog([], staticItems);
  for (const item of GCSE_CHEMISTRY_LESSON_VIDEOS) {
    const found = merged.find((row) => row.file_url === item.file_url_override);
    assert.ok(found, `missing ${item.title} after catalog merge`);
    assert.equal(found.title, item.title);
    assert.equal(found.file_name, item.file_name);
    assert.equal(found.file_type, "video/mp4");
  }
});

console.log("All GCSE Chemistry video publish checks passed.");
