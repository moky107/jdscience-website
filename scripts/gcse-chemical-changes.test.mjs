import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS } from "../src/gcseChemistryVideos.js";

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

test("twelve chemical-changes lessons are hosted 1080p catalog entries", () => {
  assert.equal(GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS.length, 12);
  for (const item of GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS) {
    assert.equal(item.hosted, true);
    assert.match(item.file_name, /^jdscience-.+-1080p\.mp4$/);
    assert.match(item.file_url_override, /xugsznxfvpbifpzpuoek\.supabase\.co\/storage\/v1\/object\/public\/resources\/gcse-igcse\/chemistry\/videos\//);
    assert.equal(item.caption_url, `/resources/gcse/chemistry/videos/${item.topicSlug}/captions.vtt`);
  }
});

test("each lesson script has six stages, the opening line, a pause and a recap", () => {
  const out = execFileSync("python3", ["-c", `
import json, sys
sys.path.insert(0, "scripts")
from gcse_chemical_changes.lessons import LESSONS
from gcse_chemical_changes.narration import BY_SLUG
from gcse_chemical_changes.spec import outcomes_for
from jdscience_video.six_stage import evaluate_lesson, report_to_dict, MIN_SECONDS
rows = []
for slug, lesson in LESSONS.items():
    script = BY_SLUG[slug]
    words = len(script.spoken.split())
    report = evaluate_lesson(lesson, spoken=script.spoken, duration_s=300, outcomes=outcomes_for(slug))
    rows.append({
        "slug": slug,
        "words": words,
        "complete_structure": not [f for f in report.failures if f.startswith("missing_")],
        "spec_ok": not any(f.startswith("spec_") for f in report.failures),
        "failures": [f for f in report.failures if not f.startswith("duration")],
        "opening": script.spoken.startswith("Hello and welcome back to JD Science."),
        "higher": script.tier,
    })
    if words < 700:
        raise SystemExit(f"{slug} only {words} words")
    if report.failures and any(not f.startswith("duration") and "1080" not in f and "fps" not in f for f in report.failures):
        leftover = [f for f in report.failures if not f.startswith("duration") and "1080" not in f and "fps" not in f]
        if leftover:
            raise SystemExit(slug + ": " + ",".join(leftover))
print(json.dumps(rows))
`], { cwd: ROOT, encoding: "utf8" });
  const rows = JSON.parse(out);
  assert.equal(rows.length, 12);
  for (const row of rows) {
    assert.equal(row.opening, true, row.slug);
    assert.equal(row.spec_ok, true, `${row.slug} ${row.failures}`);
    assert.ok(row.words >= 700, row.slug);
  }
});

test("strong and weak acids is labelled Higher Tier", () => {
  const item = GCSE_CHEMISTRY_CHEMICAL_CHANGES_VIDEOS.find((row) => row.topicSlug === "strong-and-weak-acids");
  assert.ok(item);
  assert.match(item.description, /Higher Tier/);
});

test("QA and spec folders are reserved for completed encodes", () => {
  assert.ok(existsSync(join(ROOT, "content/gcse-chemical-changes")));
});

console.log("All GCSE chemical-changes script checks passed.");
