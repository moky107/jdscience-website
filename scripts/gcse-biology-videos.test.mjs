import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

test("remaining 23 lessons stay unpublished until cloned-voice MP4s exist", () => {
  assert.deepEqual(GCSE_BIOLOGY_HOSTED_SLUGS, ["1-1-cell-division", "1-2-bacterial-growth"]);
  const remaining = BIOLOGY_SCRIPTS.filter((item) => !GCSE_BIOLOGY_HOSTED_SLUGS.includes(item.slug));
  assert.equal(remaining.length, 23);
  const indexHtml = readFileSync(join(ROOT, "public/resources/gcse/biology/videos/index.html"), "utf8");
  for (const item of remaining) {
    assert.equal(existsSync(join(ROOT, `public/resources/gcse/biology/videos/${item.slug}/index.html`)), false);
    assert.doesNotMatch(indexHtml, new RegExp(item.slug));
  }
  const boards = JSON.parse(readFileSync(join(ROOT, "content/gcse-biology/storyboards.json"), "utf8"));
  assert.equal(boards.remaining_ready_for_cloned_voice.length, 23);
  assert.equal(boards.lessons.length, 23);
  assert.equal(boards.lessons[0].slug, "1-3-transport-in-cells");
  assert.equal(boards.lessons.at(-1).slug, "7-5-food-production");
  for (const lesson of boards.lessons) {
    assert.equal(lesson.narration, "ready_for_cloned_voice");
    assert.equal(lesson.mp4, "not_rendered");
    assert.equal(lesson.publication, "not_live");
    assert.equal(lesson.opening, true);
    assert.equal(lesson.close_jdscience_co_uk, true);
    assert.equal(lesson.youtube_privacy, "unlisted");
    assert.ok(lesson.exam.question);
    assert.ok(lesson.model_answer);
    assert.ok(lesson.slide_count >= 8);
    assert.ok(lesson.slides.every((slide) => slide.aligned === true));
    assert.equal(lesson.transition_s, 0.4);
    assert.deepEqual(lesson.frame_size, [1920, 1080]);
  }
  const status = JSON.parse(readFileSync(join(ROOT, "content/gcse-biology/production-status.json"), "utf8"));
  assert.equal(status.cloned_voice_can_generate_without_extra_credits, false);
  assert.equal(status.elevenlabs_calls_this_run, 0);
  assert.deepEqual(status.hosted_live, GCSE_BIOLOGY_HOSTED_SLUGS);
  const youtube = JSON.parse(readFileSync(join(ROOT, "content/gcse-biology/youtube-metadata.json"), "utf8"));
  assert.equal(youtube.length, 23);
  for (const row of youtube) {
    assert.ok(row.youtube_title.length <= 100, row.youtube_title);
    assert.equal(row.privacy, "unlisted");
    assert.match(row.description, /jdscience\.co\.uk/);
    assert.match(row.description, /Unlisted/);
    assert.ok(row.tags.includes("GCSE Biology"));
    assert.ok(row.tags.includes("JD Science"));
    assert.ok(existsSync(join(ROOT, row.thumbnail)), row.thumbnail);
  }
  assert.ok(existsSync(join(ROOT, "content/gcse-biology/PRODUCTION_REGISTER.md")));
  assert.ok(existsSync(join(ROOT, "content/gcse-biology/PRESERVED_ASSETS.md")));
});

function md5File(path) {
  return createHash("md5").update(readFileSync(path)).digest("hex");
}

function listJpgs(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listJpgs(path);
    return entry.name.endsWith(".jpg") ? [path] : [];
  });
}

test("214 visual frames and 23 contact sheets are stored in the repo", () => {
  const remaining = BIOLOGY_SCRIPTS.filter((item) => !GCSE_BIOLOGY_HOSTED_SLUGS.includes(item.slug));
  assert.equal(remaining.length, 23);
  const frames = listJpgs(join(ROOT, "content/gcse-biology/previs"));
  assert.equal(frames.length, 214);
  for (const frame of frames) {
    assert.ok(statSync(frame).size > 1000, frame);
  }
  const contacts = listJpgs(join(ROOT, "content/gcse-biology/contact"));
  assert.equal(contacts.length, 23);
  for (const item of remaining) {
    assert.ok(existsSync(join(ROOT, "content/gcse-biology/previs", item.slug)));
    assert.ok(existsSync(join(ROOT, "content/gcse-biology/contact", `${item.slug}.jpg`)));
    assert.ok(existsSync(join(ROOT, "content/gcse-biology/timing", `${item.slug}.json`)));
    assert.ok(existsSync(join(ROOT, "content/gcse-biology/covers", `${item.slug}-youtube.jpg`)));
  }
});

test("completed 1.1 and 1.2 audio and video masters are unchanged", () => {
  const cellDivisionMp3 = join(ROOT, "content/videos/1-1-cell-division/source/narration_master.mp3");
  const bacterialMp3 = join(ROOT, "content/videos/1-2-bacterial-growth/source/narration_master.mp3");
  const cellDivisionMp4 = join(ROOT, "content/videos/1-1-cell-division/jdscience-1-1-cell-division-1080p.mp4");
  const bacterialMp4 = join(ROOT, "content/videos/1-2-bacterial-growth/jdscience-1-2-bacterial-growth-1080p.mp4");
  assert.equal(md5File(cellDivisionMp3), "f64a9f591ce9f2464e97b912b71905e7");
  assert.equal(md5File(bacterialMp3), "29495f2d9e6280caf91cb2c72e1e97f0");
  assert.equal(md5File(cellDivisionMp4), "5aef24eec1dcebb431e4d0a4de1ed41f");
  assert.equal(md5File(bacterialMp4), "99ad97c922011c5cb33c88f1d88f94e8");
});

test("23 silent visual drafts are labelled drafts with persistent URLs and stay unpublished", () => {
  const rows = JSON.parse(readFileSync(join(ROOT, "content/gcse-biology/visual-draft-register.json"), "utf8"));
  assert.equal(rows.length, 23);
  assert.equal(rows[0].slug, "1-3-transport-in-cells");
  assert.equal(rows.at(-1).slug, "7-5-food-production");
  const indexHtml = readFileSync(join(ROOT, "public/resources/gcse/biology/videos/index.html"), "utf8");
  for (const row of rows) {
    assert.equal(row.kind, "visual_only_draft");
    assert.equal(row.narration, "pending_cloned_voice");
    assert.equal(row.site, "not_published");
    assert.equal(row.youtube, "not_uploaded");
    assert.equal(row.qa_pass, true);
    assert.match(row.filename, /visual-draft-1080p\.mp4$/);
    assert.match(row.download_url, /\/biology\/visual-drafts\//);
    assert.doesNotMatch(row.download_url, /\/biology\/videos\//);
    assert.equal(existsSync(join(ROOT, `public/resources/gcse/biology/videos/${row.slug}/index.html`)), false);
    assert.doesNotMatch(indexHtml, new RegExp(row.slug));
  }
});

test("script review exists and remaining lessons keep exam questions plus model answers", () => {
  assert.ok(existsSync(join(ROOT, "content/gcse-biology/SCRIPT_REVIEW.md")));
  const remaining = BIOLOGY_SCRIPTS.filter((item) => !GCSE_BIOLOGY_HOSTED_SLUGS.includes(item.slug));
  assert.equal(remaining.length, 23);
  const boards = JSON.parse(readFileSync(join(ROOT, "content/gcse-biology/storyboards.json"), "utf8"));
  for (const lesson of boards.lessons) {
    assert.ok(lesson.exam.question.length > 20, lesson.slug);
    assert.ok(lesson.model_answer.length > 20, lesson.slug);
    assert.match(lesson.exam.question, /[.?]/);
  }
});

test("final producer refuses hosted 1.1/1.2 and silent visual masters", () => {
  const produce = readFileSync(join(ROOT, "scripts/gcse_biology/produce.py"), "utf8");
  assert.match(produce, /refusing to re-encode hosted lesson/);
  assert.match(produce, /refusing to mux a silent visual master/);
  assert.match(produce, /1-3-transport-in-cells/);
  assert.doesNotMatch(produce, /stamp_visual_draft/);
});

test("visual drafts stay unpublished and must not replace 1.1 or 1.2", () => {
  const remaining = BIOLOGY_SCRIPTS.filter((item) => !GCSE_BIOLOGY_HOSTED_SLUGS.includes(item.slug));
  const indexHtml = readFileSync(join(ROOT, "public/resources/gcse/biology/videos/index.html"), "utf8");
  for (const item of remaining) {
    assert.equal(existsSync(join(ROOT, `public/resources/gcse/biology/videos/${item.slug}/index.html`)), false);
    assert.doesNotMatch(indexHtml, new RegExp(item.slug));
    const draftName = item.filename.replace("-1080p.mp4", "-visual-draft-1080p.mp4");
    assert.match(draftName, /visual-draft-1080p\.mp4$/);
    assert.doesNotMatch(draftName, /1-1-cell-division|1-2-bacterial-growth/);
  }
  assert.equal(GCSE_BIOLOGY_VIDEOS.length, 2);
});

test("Vercel Hobby still has exactly 12 top-level API files", () => {
  const apiFiles = readdirSync(join(ROOT, "api")).filter((name) => name.endsWith(".js"));
  assert.equal(apiFiles.length, 12, "Vercel Hobby must keep exactly 12 top-level API functions");
});

console.log("All GCSE Biology video publish checks passed.");
