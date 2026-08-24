import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFERINGS, topicsFor } from "./specs.mjs";
import { slugify } from "./exam.mjs";
import { buildQuestions } from "./bank.mjs";
import { renderWorksheet, renderAnswers } from "./render.mjs";
import { isAnswerSheet, unitDisplayTitles, unitNumberFromId } from "./catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public", "worksheets");
const catalogPath = path.join(root, "src", "jdScienceWorksheets.js");

function levelFolder(level) {
  if (level === "A-Level") return "alevel";
  if (level === "T-Level") return "tlevel";
  return "gcse";
}

const catalog = [];
const errors = [];

for (const offering of OFFERINGS) {
  const topics = topicsFor(offering);
  if (!topics.length) {
    errors.push(`No topics for ${offering.board} ${offering.level} ${offering.subject}`);
    continue;
  }
  for (const [topicId, topicTitle] of topics) {
    try {
      const questions = buildQuestions(offering, topicId, topicTitle);
      const folder = path.join(
        publicDir,
        slugify(offering.board),
        levelFolder(offering.level),
        slugify(offering.subject),
      );
      fs.mkdirSync(folder, { recursive: true });
      const fileBase = slugify(topicId);
      const labels = unitDisplayTitles(topicId, topicTitle, questions.length);
      const unitN = offering.level === "GCSE/IGCSE" && offering.subject === "Chemistry"
        ? unitNumberFromId(topicId)
        : null;
      const qRel = unitN
        ? `/worksheets/${slugify(offering.board)}/${levelFolder(offering.level)}/${slugify(offering.subject)}/unit-${unitN}/worksheet.html`
        : `/worksheets/${slugify(offering.board)}/${levelFolder(offering.level)}/${slugify(offering.subject)}/${fileBase}.html`;
      const aRel = unitN
        ? `/worksheets/${slugify(offering.board)}/${levelFolder(offering.level)}/${slugify(offering.subject)}/unit-${unitN}/answers.html`
        : `/worksheets/${slugify(offering.board)}/${levelFolder(offering.level)}/${slugify(offering.subject)}/${fileBase}-answers.html`;
      fs.mkdirSync(path.dirname(path.join(root, "public", qRel.replace(/^\//, ""))), { recursive: true });
      fs.writeFileSync(path.join(root, "public", qRel.replace(/^\//, "")), renderWorksheet({ offering, topicTitle: labels.worksheetHeading, questions, canonicalPath: qRel }));
      fs.writeFileSync(path.join(root, "public", aRel.replace(/^\//, "")), renderAnswers({ offering, topicTitle: labels.answersHeading, questions, canonicalPath: aRel }));
      catalog.push({
        level: offering.level,
        subject: offering.subject,
        exam_board: offering.board,
        resource_category: "Worksheets",
        title: labels.worksheetTitle,
        file_name: unitN ? `unit-${unitN}-worksheet.html` : `${fileBase}.html`,
        series_label: labels.worksheetSeries,
        file_url_override: qRel,
      });
      catalog.push({
        level: offering.level,
        subject: offering.subject,
        exam_board: offering.board,
        resource_category: "Worksheets",
        title: labels.answersTitle,
        file_name: unitN ? `unit-${unitN}-answers.html` : `${fileBase}-answers.html`,
        series_label: labels.answersSeries,
        file_url_override: aRel,
      });
    } catch (error) {
      errors.push(`${offering.board} ${offering.level} ${offering.subject} ${topicId}: ${error.message}`);
    }
  }
}

const js = `/* JD Science original exam-style topic worksheets. Questions and answers are separate HTML files. */

export const JD_SCIENCE_WORKSHEETS = ${JSON.stringify(catalog, null, 2)};
`;
fs.writeFileSync(catalogPath, js);

const worksheetCount = catalog.filter((item) => !isAnswerSheet(item)).length;
console.log(`Wrote ${worksheetCount} worksheets and ${worksheetCount} answer sheets.`);
if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(" -", error);
  process.exit(1);
}
