import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GCSE_CHEMISTRY_CALCULATION_VIDEOS,
  GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS,
  GCSE_CHEMISTRY_FOUNDATION_VIDEOS,
  GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO,
  GCSE_CHEMISTRY_LESSON_VIDEOS,
  GCSE_CHEMISTRY_VIDEOS,
  RESOURCES_PUBLIC_BASE,
} from "../src/gcseChemistryVideos.js";
import { mergeResourceCatalog } from "../src/resourceNormalize.js";
import { srtToVtt } from "./publish-gcse-foundations-videos.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FOUNDATION_TITLES = [
  "States of Matter",
  "Changes of State",
  "Pure Substances and Mixtures",
  "Separation Techniques",
  "Chromatography",
  "Potable Water and Waste Water Treatment",
];
const CALC_SLUGS = [
  "calculating-moles",
  "concentration",
  "percentage-by-mass",
  "empirical-formulae",
  "atom-economy",
];

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`fail - ${name}`);
    throw error;
  }
}

const CHEMICAL_CHANGES_SLUGS = [
  "acids-bases-alkalis",
  "indicators-and-ph",
  "strong-and-weak-acids",
  "acids-metals-redox",
  "neutralisation-and-gas-tests",
  "soluble-and-insoluble-salts",
  "acid-alkali-titration",
  "electrolysis-ions-electrodes",
  "electrolysis-molten-ionic",
  "electrolysis-aqueous-solutions",
  "copper-purification",
  "chemical-changes-exam-practice",
];

test("catalog publishes six foundations lessons plus five calculation lessons and Key Concepts", () => {
  assert.equal(GCSE_CHEMISTRY_FOUNDATION_VIDEOS.length, 6);
  assert.deepEqual(GCSE_CHEMISTRY_FOUNDATION_VIDEOS.map((item) => item.title), FOUNDATION_TITLES);
  assert.deepEqual(GCSE_CHEMISTRY_CALCULATION_VIDEOS.map((item) => item.topicSlug), CALC_SLUGS);
  assert.deepEqual(GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS.map((item) => item.topicSlug), CHEMICAL_CHANGES_SLUGS);
  assert.equal(GCSE_CHEMISTRY_LESSON_VIDEOS.length, 11);
  assert.equal(GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS.every((item) => item.awaiting_narration && !item.hosted), true);
  assert.equal(GCSE_CHEMISTRY_VIDEOS.at(-1).title, GCSE_CHEMISTRY_KEY_CONCEPTS_VIDEO.title);
  for (const item of GCSE_CHEMISTRY_LESSON_VIDEOS) {
    assert.equal(item.level, "GCSE/IGCSE");
    assert.equal(item.subject, "Chemistry");
    assert.equal(item.resource_category, "Videos");
    assert.equal(item.all_boards, true);
    assert.match(item.file_name, /^jdscience-.+-1080p\.mp4$/);
    assert.doesNotMatch(item.file_name, /60s-sample/);
    assert.ok(item.description);
    assert.equal(item.poster_url, `/resources/gcse/chemistry/videos/${item.topicSlug}/poster.jpg`);
  }
});

test("foundations lessons use public Supabase URLs, captions and posters, not Git MP4s", () => {
  for (const item of GCSE_CHEMISTRY_FOUNDATION_VIDEOS) {
    assert.equal(item.hosted, true);
    assert.equal(item.source_path, null);
    assert.equal(
      item.file_url_override,
      `${RESOURCES_PUBLIC_BASE}/gcse-igcse/chemistry/videos/${item.topicSlug}/${item.file_name}`,
    );
    assert.equal(item.caption_url, `/resources/gcse/chemistry/videos/${item.topicSlug}/captions.vtt`);
    const vttPath = join(ROOT, "public", item.caption_url.replace(/^\//, ""));
    const posterPath = join(ROOT, "public", item.poster_url.replace(/^\//, ""));
    assert.ok(existsSync(vttPath), `missing captions ${item.caption_url}`);
    assert.match(readFileSync(vttPath, "utf8"), /^WEBVTT/m);
    assert.ok(existsSync(posterPath), `missing poster ${item.poster_url}`);
    assert.ok(statSync(posterPath).size > 1000, `${item.poster_url} looks too small`);
    assert.doesNotMatch(item.file_url_override, /\/opt\/cursor\/artifacts/);
  }
});

test("calculation lessons stay on same-origin public MP4 copies", () => {
  for (const item of GCSE_CHEMISTRY_CALCULATION_VIDEOS) {
    assert.equal(item.hosted, false);
    assert.equal(
      item.file_url_override,
      `/resources/gcse/chemistry/videos/${item.topicSlug}/${item.file_name}`,
    );
    assert.ok(existsSync(join(ROOT, item.source_path)), `missing source ${item.source_path}`);
    assert.ok(statSync(join(ROOT, item.source_path)).size > 1_000_000, `${item.source_path} looks too small`);
    const publicFile = join(ROOT, "public", item.file_url_override.replace(/^\//, ""));
    assert.ok(existsSync(publicFile), `missing public copy ${item.file_url_override}`);
    assert.equal(statSync(publicFile).size, statSync(join(ROOT, item.source_path)).size);
    const bytes = readFileSync(publicFile);
    const moov = bytes.indexOf(Buffer.from("moov"));
    const mdat = bytes.indexOf(Buffer.from("mdat"));
    assert.ok(moov >= 0 && mdat >= 0 && moov < mdat, `${item.file_name} must be faststart`);
    const posterPath = join(ROOT, "public", item.poster_url.replace(/^\//, ""));
    assert.ok(existsSync(posterPath), `missing poster ${item.poster_url}`);
  }
});

test("public GCSE Chemistry video pages embed native players with controls and no autoplay", () => {
  const indexPath = join(ROOT, "public/resources/gcse/chemistry/videos/index.html");
  const indexHtml = readFileSync(indexPath, "utf8");
  assert.doesNotMatch(indexHtml, /\/opt\/cursor\/artifacts/);
  assert.doesNotMatch(indexHtml, /autoplay/i);
  for (const item of GCSE_CHEMISTRY_LESSON_VIDEOS) {
    const pagePath = join(ROOT, `public/resources/gcse/chemistry/videos/${item.topicSlug}/index.html`);
    assert.ok(existsSync(pagePath), `missing topic page for ${item.topicSlug}`);
    const html = readFileSync(pagePath, "utf8");
    assert.match(html, /<video[\s\S]*type="video\/mp4"/);
    assert.match(html, /controls/);
    assert.match(html, /playsinline/i);
    assert.match(html, /preload="metadata"/);
    assert.doesNotMatch(html, /autoplay/i);
    assert.doesNotMatch(html, /\/opt\/cursor\/artifacts/);
    assert.match(html, new RegExp(item.file_name.replace(".", "\\.")));
    assert.match(html, new RegExp(item.description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(indexHtml, new RegExp(`/resources/gcse/chemistry/videos/${item.topicSlug}/`));
    assert.match(indexHtml, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    if (item.hosted) {
      assert.match(html, /kind="captions"/);
      assert.match(html, /captions\.vtt/);
      assert.match(html, /poster="\/resources\/gcse\/chemistry\/videos\/[^"]+\/poster\.jpg"/);
      assert.match(html, /xugsznxfvpbifpzpuoek\.supabase\.co\/storage\/v1\/object\/public\/resources/);
    }
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

test("SRT converts to WebVTT for the native player", () => {
  const srt = "1\n00:00:01,000 --> 00:00:02,500\nHello, JD Science.\n";
  const vtt = srtToVtt(srt);
  assert.match(vtt, /^WEBVTT\n/);
  assert.match(vtt, /00:00:01\.000 --> 00:00:02\.500/);
  assert.doesNotMatch(vtt, /00:00:01,000/);
});

console.log("All GCSE Chemistry video publish checks passed.");
