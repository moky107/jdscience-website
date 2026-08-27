import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mathsPaper1 } from "./content/maths-paper1.mjs";
import { englishPaper1 } from "./content/english-paper1.mjs";
import { verbalPaper1 } from "./content/verbal-paper1.mjs";
import { nonverbalPaper1 } from "./content/nonverbal-paper1.mjs";
import { ELEVEN_PLUS_PRACTICE_PAPERS } from "../../src/elevenPlusPracticePapers.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

assert.equal(mathsPaper1.questions.length, 40);
assert.equal(verbalPaper1.questions.length, 40);
assert.equal(nonverbalPaper1.questions.length, 40);
assert.equal(englishPaper1.comprehension.length, 25);
assert.equal(englishPaper1.language.length, 15);
const words = englishPaper1.passage.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
assert.ok(words >= 800 && words <= 1100, `English passage should be ~800–1000 words (got ${words})`);

assert.equal(ELEVEN_PLUS_PRACTICE_PAPERS.length, 8);
for (const item of ELEVEN_PLUS_PRACTICE_PAPERS) {
  assert.equal(item.level, "11+");
  assert.equal(item.published ?? true, true);
  const local = path.join(root, "public", item.file_url_override.replace(/^\//, ""));
  assert.equal(fs.existsSync(local), true, `Missing PDF ${local}`);
  assert.ok(fs.statSync(local).size > 20_000, `PDF too small: ${local}`);
}

const app = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
assert.match(app, /ELEVEN_PLUS_PRACTICE_PAPERS/);
assert.match(app, /Verbal Reasoning/);
assert.match(app, /Non-Verbal Reasoning/);

console.log("eleven-plus.test.mjs: ok");
