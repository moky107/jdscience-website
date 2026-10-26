import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LESSONS as BIOLOGY_SCRIPTS } from "../src/gcseBiologyLessonMeta.js";
import {
  GCSE_BIOLOGY_HOSTED_SLUGS,
  GCSE_BIOLOGY_LESSON_VIDEOS,
  GCSE_BIOLOGY_VIDEOS,
} from "../src/gcseBiologyVideos.js";
import { GCSE_CHEMISTRY_FOUNDATION_VIDEOS, RESOURCES_PUBLIC_BASE } from "../src/gcseChemistryVideos.js";
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

test("register keeps 25 unique lessons in document order with cloned-voice openings", () => {
  assert.equal(BIOLOGY_SCRIPTS.length, 25);
  assert.equal(new Set(BIOLOGY_SCRIPTS.map((item) => item.slug)).size, 25);
  assert.equal(BIOLOGY_SCRIPTS[0].slug, "1-1-cell-division");
  assert.equal(BIOLOGY_SCRIPTS[7].slug, "3-1-discovering-and-testing-new-drugs");
  assert.equal(BIOLOGY_SCRIPTS.at(-1).slug, "7-5-food-production");
  for (const item of BIOLOGY_SCRIPTS) {
    assert.equal(item.opening, true);
    assert.equal(item.has_jdscience_co_uk, true);
    assert.equal(item.has_in_domain, false);
    assert.match(item.filename, /^jdscience-.+-1080p\.mp4$/);
  }
});

test("hosted biology lessons use public Supabase URLs and do not overwrite chemistry", () => {
  assert.deepEqual(GCSE_BIOLOGY_HOSTED_SLUGS, GCSE_BIOLOGY_VIDEOS.map((item) => item.topicSlug));
  const chemistrySlugs = new Set(GCSE_CHEMISTRY_FOUNDATION_VIDEOS.map((item) => item.topicSlug));
  for (const item of GCSE_BIOLOGY_LESSON_VIDEOS) {
    assert.equal(item.level, "GCSE/IGCSE");
    assert.equal(item.subject, "Biology");
    assert.equal(item.resource_category, "Videos");
    assert.equal(item.hosted, true);
    assert.doesNotMatch(item.topicSlug, /chemistry/i);
    assert.equal(chemistrySlugs.has(item.topicSlug), false);
    assert.equal(
      item.file_url_override,
      `${RESOURCES_PUBLIC_BASE}/gcse-igcse/biology/videos/${item.topicSlug}/${item.file_name}`,
    );
    assert.equal(item.caption_url, `/resources/gcse/biology/videos/${item.topicSlug}/captions.vtt`);
    assert.doesNotMatch(item.file_url_override, /\/opt\/cursor\/artifacts/);
  }
});

test("public biology pages embed native players with captions and sibling navigation", () => {
  const indexPath = join(ROOT, "public/resources/gcse/biology/videos/index.html");
  assert.ok(existsSync(indexPath), "missing biology videos index");
  const indexHtml = readFileSync(indexPath, "utf8");
  assert.doesNotMatch(indexHtml, /\/opt\/cursor\/artifacts/);
  assert.doesNotMatch(indexHtml, /autoplay/i);
  for (const item of GCSE_BIOLOGY_VIDEOS) {
    const pagePath = join(ROOT, `public/resources/gcse/biology/videos/${item.topicSlug}/index.html`);
    assert.ok(existsSync(pagePath), `missing topic page for ${item.topicSlug}`);
    const html = readFileSync(pagePath, "utf8");
    assert.match(html, /<video[\s\S]*type="video\/mp4"/);
    assert.match(html, /controls/);
    assert.match(html, /playsinline/i);
    assert.match(html, /preload="metadata"/);
    assert.doesNotMatch(html, /autoplay/i);
    assert.match(html, /kind="captions"/);
    assert.match(html, /More GCSE Biology topics/);
    assert.match(indexHtml, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("papers catalog can merge biology videos without dropping chemistry titles", () => {
  const staticItems = [
    ...GCSE_CHEMISTRY_FOUNDATION_VIDEOS,
    ...GCSE_BIOLOGY_VIDEOS,
  ].map((resource, index) => ({
    id: `static-video-${index}`,
    ...resource,
    file_url: resource.file_url_override,
    file_type: "video/mp4",
    published: true,
  }));
  const merged = mergeResourceCatalog([], staticItems);
  for (const item of GCSE_CHEMISTRY_FOUNDATION_VIDEOS) {
    assert.ok(merged.find((row) => row.file_url === item.file_url_override), `missing chemistry ${item.title}`);
  }
  for (const item of GCSE_BIOLOGY_VIDEOS) {
    const found = merged.find((row) => row.file_url === item.file_url_override);
    assert.ok(found, `missing biology ${item.title}`);
    assert.equal(found.subject, "Biology");
  }
});

test("Vercel Hobby still has exactly 12 top-level API files", () => {
  const apiFiles = readdirSync(join(ROOT, "api")).filter((name) => name.endsWith(".js"));
  assert.equal(apiFiles.length, 12, "Vercel Hobby must keep exactly 12 top-level API functions");
});

console.log("All GCSE Biology video publish checks passed.");
