import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { streamOnlyVideoHtml } from "./seo/stream-only-video.mjs";

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

function walkHtml(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name === "index.html") out.push(full);
  }
  return out;
}

test("stream-only helper never emits a download CTA", () => {
  const html = streamOnlyVideoHtml({
    escapeHtml: (value) => String(value),
    src: "/resources/gcse/physics/videos/kinetic-energy/jdscience-kinetic-energy-1080p.mp4",
    title: "Kinetic Energy",
  });
  assert.match(html, /controlsList="nodownload noremoteplayback"/);
  assert.match(html, /oncontextmenu="return false;"/);
  assert.doesNotMatch(html, /download>/i);
  assert.doesNotMatch(html, /Download .+ \(MP4\)/i);
});

test("public lesson video pages are stream-only for visitors", () => {
  const roots = [
    join(ROOT, "public/resources/gcse/physics/videos"),
    join(ROOT, "public/resources/gcse/chemistry/videos"),
    join(ROOT, "public/resources/gcse/biology/videos"),
    join(ROOT, "public/resources/t-level/science/videos"),
  ];
  const pages = roots.flatMap((dir) => walkHtml(dir));
  assert.ok(pages.length > 20, "expected published lesson video pages");
  for (const page of pages) {
    if (!statSync(page).isFile()) continue;
    const html = readFileSync(page, "utf8");
    if (!/<video[\s\S]*type="video\/mp4"/i.test(html) && !/<video[\s\S]*\.mp4/i.test(html)) continue;
    assert.doesNotMatch(html, /Download [^<]*\(MP4\)/i, page);
    assert.doesNotMatch(html, /<(?:a|video)\b[^>]*\sdownload(?:\s|=|>)/i, page);
    assert.match(html, /controlsList="nodownload/i, page);
  }
});

console.log("All stream-only video checks passed.");
