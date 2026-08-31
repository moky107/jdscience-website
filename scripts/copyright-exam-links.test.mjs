import assert from "node:assert/strict";
import { hasAwardingBodyUrl } from "../src/resourceNormalize.js";
import { AQA_ALEVEL_CHEMISTRY_RESOURCES } from "../src/aqaAlevelChemistryResources.js";
import { AQA_GCSE_MATHS_RESOURCES } from "../src/aqaGcseMathsResources.js";
import { AQA_SCIENCE_RESOURCES } from "../src/aqaScienceResources.js";
import { EDEXCEL_SCIENCE_MATHS_RESOURCES } from "../src/edexcelScienceMathsResources.js";
import { EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES } from "../src/eduqasWjecScienceMathsResources.js";
import { EDUQAS_GCSE_MATHEMATICS_RESOURCES } from "../src/eduqasGcseMathematicsResources.js";
import { NCFE_TLEVEL_RESOURCES } from "../src/ncfeTLevelResources.js";
import { OCR_SCIENCE_MATHS_RESOURCES } from "../src/ocrScienceMathsResources.js";
import { PEARSON_BTEC_RESOURCES } from "../src/pearsonBtecResources.js";

const EXAM_CATEGORIES = new Set(["Past Questions", "Mark Schemes", "Examiner Reports"]);

const catalogues = [
  ["AQA GCSE Maths", AQA_GCSE_MATHS_RESOURCES],
  ["AQA A-Level Chemistry", AQA_ALEVEL_CHEMISTRY_RESOURCES],
  ["AQA science", AQA_SCIENCE_RESOURCES],
  ["Edexcel science/maths", EDEXCEL_SCIENCE_MATHS_RESOURCES],
  ["OCR science/maths", OCR_SCIENCE_MATHS_RESOURCES],
  ["Eduqas/WJEC science/maths", EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES],
  ["Eduqas GCSE Mathematics", EDUQAS_GCSE_MATHEMATICS_RESOURCES],
  ["NCFE T-Level", NCFE_TLEVEL_RESOURCES],
  ["Pearson BTEC", PEARSON_BTEC_RESOURCES],
];

let examItems = 0;
for (const [name, items] of catalogues) {
  const exam = items.filter((item) => EXAM_CATEGORIES.has(item.resource_category));
  assert.ok(exam.length > 0, `${name} should list exam materials`);
  for (const item of exam) {
    examItems += 1;
    assert.ok(
      hasAwardingBodyUrl(item),
      `${name}: ${item.title} (${item.series_label}) must link to the awarding body, not a local copy`,
    );
    assert.doesNotMatch(
      item.file_url_override || "",
      /^\/resources\//,
      `${name}: ${item.title} must not host an exam-paper copy`,
    );
  }
}

const mathsExam = AQA_GCSE_MATHS_RESOURCES.filter((item) => EXAM_CATEGORIES.has(item.resource_category));
assert.ok(mathsExam.every((item) => item.file_url_override.startsWith("https://filestore.aqa.org.uk/")));
assert.equal(
  mathsExam.filter((item) => /JUN25|NOV24|JUN24/.test(item.file_name)).length,
  0,
  "unpublished AQA maths series must stay omitted rather than hosted locally",
);

const btec = PEARSON_BTEC_RESOURCES.filter((item) => EXAM_CATEGORIES.has(item.resource_category));
assert.ok(btec.every((item) => item.file_url_override.startsWith("https://qualifications.pearson.com/")));
assert.ok(btec.some((item) => item.file_name.includes("31617h-1b-unit-1-jan-2021")));
assert.equal(
  btec.filter((item) => /^unit\d-/i.test(item.file_name)).length,
  0,
  "BTEC catalogue must not invent local Pearson copies",
);

console.log(`copyright exam-link tests passed (${examItems} past questions, mark schemes and examiner reports)`);
