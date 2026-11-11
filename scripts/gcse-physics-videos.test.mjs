import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GCSE_PHYSICS_LESSON_VIDEOS,
  GCSE_PHYSICS_VIDEOS,
} from "../src/gcsePhysicsVideos.js";
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

test("catalog publishes twelve GCSE Physics energy lessons with ElevenLabs clones", () => {
  assert.equal(GCSE_PHYSICS_LESSON_VIDEOS.length, 12);
  assert.equal(GCSE_PHYSICS_VIDEOS.length, 12);
  assert.deepEqual(
    GCSE_PHYSICS_LESSON_VIDEOS.map((item) => item.topicSlug),
    [
      "energy-stores-and-pathways",
      "gravitational-potential-energy",
      "kinetic-energy",
      "energy-stores-and-systems",
      "energy-transfers-in-a-system",
      "energy-efficiency",
      "reducing-unwanted-energy-transfers",
      "thermal-insulation-and-conductivity",
      "non-renewable-energy-resources",
      "renewable-energy-resources",
      "energy-security-and-reliability",
      "trends-in-energy-use",
    ],
  );
  for (const item of GCSE_PHYSICS_LESSON_VIDEOS) {
    assert.equal(item.level, "GCSE/IGCSE");
    assert.equal(item.subject, "Physics");
    assert.equal(item.resource_category, "Videos");
    assert.equal(item.all_boards, true);
    assert.match(item.file_name, /^jdscience-.+-1080p\.mp4$/);
    assert.equal(
      item.file_url_override,
      `/resources/gcse/physics/videos/${item.topicSlug}/${item.file_name}`,
    );
    assert.ok(existsSync(join(ROOT, item.source_path)), `missing source ${item.source_path}`);
    assert.ok(statSync(join(ROOT, item.source_path)).size > 1_000_000, `${item.source_path} looks too small`);
  }
});

test("public GCSE Physics video pages embed native MP4 players", () => {
  const indexPath = join(ROOT, "public/resources/gcse/physics/videos/index.html");
  const indexHtml = readFileSync(indexPath, "utf8");
  for (const item of GCSE_PHYSICS_LESSON_VIDEOS) {
    const publicFile = join(ROOT, "public", item.file_url_override.replace(/^\//, ""));
    const pagePath = join(ROOT, `public/resources/gcse/physics/videos/${item.topicSlug}/index.html`);
    assert.ok(existsSync(publicFile), `missing public copy ${item.file_url_override}`);
    assert.equal(statSync(publicFile).size, statSync(join(ROOT, item.source_path)).size);
    assert.ok(existsSync(pagePath), `missing topic page for ${item.topicSlug}`);
    const html = readFileSync(pagePath, "utf8");
    assert.match(html, /<video[\s\S]*type="video\/mp4"/);
    assert.match(html, new RegExp(item.file_name.replace(".", "\\.")));
    assert.match(indexHtml, new RegExp(`/resources/gcse/physics/videos/${item.topicSlug}/`));
    const bytes = readFileSync(publicFile);
    const moov = bytes.indexOf(Buffer.from("moov"));
    const mdat = bytes.indexOf(Buffer.from("mdat"));
    assert.ok(moov >= 0 && mdat >= 0 && moov < mdat, `${item.file_name} must be faststart`);
  }
});

test("papers catalog keeps Physics lesson titles and mp4 file names", () => {
  const staticItems = GCSE_PHYSICS_VIDEOS.map((resource, index) => ({
    id: `static-physics-video-${index}`,
    ...resource,
    file_url: resource.file_url_override,
    file_type: "video/mp4",
    published: true,
  }));
  const merged = mergeResourceCatalog([], staticItems);
  for (const item of GCSE_PHYSICS_LESSON_VIDEOS) {
    const found = merged.find((row) => row.file_url === item.file_url_override);
    assert.ok(found, `missing ${item.title} after catalog merge`);
    assert.equal(found.title, item.title);
    assert.equal(found.file_name, item.file_name);
    assert.equal(found.file_type, "video/mp4");
  }
});

console.log("All GCSE Physics video publish checks passed.");
