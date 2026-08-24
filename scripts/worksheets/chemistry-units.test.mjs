import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS } from "./specs.mjs";
import { answersUrlFor, compareTopicTitles, isAnswerSheet, unitDisplayTitles, unitNumberFromId } from "./catalog.mjs";
import { JD_SCIENCE_WORKSHEETS } from "../../src/jdScienceWorksheets.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

assert.equal(unitNumberFromId("unit-1"), 1);
assert.equal(unitNumberFromId("atomic-structure-periodic-table"), null);
assert.ok(compareTopicTitles("Unit 2", "Unit 10") < 0);

const labels = unitDisplayTitles("unit-1", "Unit 1 — Atomic structure and the periodic table", 32);
assert.equal(labels.worksheetTitle, "Unit 1 worksheet — Atomic structure and the periodic table");
assert.equal(labels.answersTitle, "Unit 1 answers — Atomic structure and the periodic table");
assert.equal(labels.worksheetSeries, "Unit 1");
assert.equal(labels.answersSeries, "Unit 1");

const chemistry = TOPICS["GCSE/IGCSE"].Chemistry;
for (const [board, topics] of Object.entries(chemistry)) {
  assert.ok(topics.length >= 4, `${board} chemistry needs at least units 1–4`);
  topics.forEach((topic, index) => {
    const [id, title] = topic;
    assert.equal(id, `unit-${index + 1}`, `${board} chemistry topic ${index + 1} must be unit-${index + 1}`);
    assert.match(title, new RegExp(`^Unit ${index + 1} — `));
  });
}

const chemistryItems = JD_SCIENCE_WORKSHEETS.filter((item) => item.level === "GCSE/IGCSE" && item.subject === "Chemistry");
assert.ok(chemistryItems.length > 0, "chemistry worksheets must be in the published catalogue");

for (const board of Object.keys(chemistry)) {
  for (const unit of [1, 2, 3, 4]) {
    const worksheet = chemistryItems.find((item) => (
      item.exam_board === board
      && item.file_url_override === `/worksheets/${board.toLowerCase()}/gcse/chemistry/unit-${unit}/worksheet.html`
      && !isAnswerSheet(item)
    ));
    const answers = chemistryItems.find((item) => (
      item.exam_board === board
      && item.file_url_override === `/worksheets/${board.toLowerCase()}/gcse/chemistry/unit-${unit}/answers.html`
      && isAnswerSheet(item)
    ));
    assert.ok(worksheet, `${board} Unit ${unit} worksheet missing from catalogue`);
    assert.ok(answers, `${board} Unit ${unit} answers missing from catalogue`);
    assert.equal(answersUrlFor(worksheet), answers.file_url_override);
    assert.match(worksheet.title, new RegExp(`^Unit ${unit} worksheet`));
    assert.match(answers.title, new RegExp(`^Unit ${unit} answers`));
    assert.notEqual(worksheet.file_url_override, answers.file_url_override);
    assert.equal(worksheet.series_label, `Unit ${unit}`);
    assert.equal(answers.series_label, `Unit ${unit}`);

    const worksheetPath = path.join(root, "public", worksheet.file_url_override.replace(/^\//, ""));
    const answersPath = path.join(root, "public", answers.file_url_override.replace(/^\//, ""));
    assert.equal(fs.existsSync(worksheetPath), true, `missing ${worksheet.file_url_override}`);
    assert.equal(fs.existsSync(answersPath), true, `missing ${answers.file_url_override}`);
    const worksheetHtml = fs.readFileSync(worksheetPath, "utf8");
    const answersHtml = fs.readFileSync(answersPath, "utf8");
    assert.match(worksheetHtml, /JD SCIENCE/);
    assert.match(answersHtml, /JD SCIENCE\s+·\s+ANSWERS/);
    assert.doesNotMatch(worksheetHtml, /Boardworks|PiXL|GraspIT/i);
    assert.doesNotMatch(answersHtml, /Boardworks|PiXL|GraspIT/i);
    assert.match(worksheetHtml, new RegExp(`Unit ${unit} worksheet`, "i"));
    assert.match(answersHtml, new RegExp(`Unit ${unit} answers`, "i"));
    assert.match(answersHtml, /Separate mark scheme/);
  }
}

console.log("GCSE Chemistry unit folders each have a worksheet and a separate matching answers file.");
